/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICellData, ICellDataForSheetInterceptor, INumfmtLocaleTag, Workbook } from '@univerjs/core';
import type { ISetNumfmtMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { IUniverSheetsNumfmtConfig } from '../config/config';
import {
    CellValueType,
    Disposable,
    getNumfmtLocaleTag,
    getNumfmtParseValueFilter,
    ICommandService,
    IConfigService,
    Inject,
    InterceptorEffectEnum,
    isDefaultFormat,
    isTextFormat,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    Range,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    checkCellValueType,
    InterceptCellContentPriority,
    INTERCEPTOR_POINT,
    INumfmtService,
    SetNumfmtMutation,
    SetRangeValuesMutation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { BehaviorSubject, merge, of, skip, switchMap } from 'rxjs';
import { SHEETS_NUMFMT_PLUGIN_CONFIG_KEY } from '../config/config';
import { getPatternPreviewIgnoreGeneral } from '../utils/pattern';

const TEXT_FORMAT_MARK = {
    tl: {
        size: 6,
        color: '#409f11',
    },
};
export class SheetsNumfmtCellContentController extends Disposable {
    private _locale$ = new BehaviorSubject<INumfmtLocaleTag | null>(null);
    public locale$ = this._locale$.asObservable();
    constructor(
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThemeService) private _themeService: ThemeService,
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
        this._initInterceptorCellContent();
    }

    public get locale(): INumfmtLocaleTag {
        return this.getLocale();
    }

    public getLocale(workbook?: Workbook): INumfmtLocaleTag {
        return this._locale$.getValue() ?? getNumfmtLocaleTag(workbook?.getSnapshot().locale ?? this._localeService.getCurrentLocale());
    }

    // eslint-disable-next-line max-lines-per-function
    private _initInterceptorCellContent() {
        const renderCache = new ObjectMatrix<{ result: ICellData; parameters: string | number }>();

        this.disposeWithMe(merge(this._locale$, this._localeService.currentLocale$).subscribe(() => {
            renderCache.reset();
        }));

        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,

            // eslint-disable-next-line max-lines-per-function, complexity
            handler: (cell, location, next) => {
                // If the cell is empty, or the cell type is boolean or force_string, do not process it.
                // Cell type is number or number string, it will be applied number format.
                if (!cell || cell.v === undefined || cell.v === null || cell.t === CellValueType.BOOLEAN || cell.t === CellValueType.FORCE_STRING) {
                    return next(cell);
                }

                const unitId = location.unitId;
                const sheetId = location.subUnitId;
                const locale = this.getLocale(location.workbook);
                const dateSystem = location.workbook.getDateSystem();
                let numfmtValue;

                if (cell?.s) {
                    const style = location.workbook.getStyles().get(cell.s);
                    if (style?.n) {
                        numfmtValue = style.n;
                    }
                }

                if (!numfmtValue) {
                    numfmtValue = this._numfmtService.getValue(unitId, sheetId, location.row, location.col);
                }

                // If the cell is not formatted, or the format is 'General', do not process it
                // e.g. { v: '001', t: 1, s: { n: { pattern: 'General' } } } should display as '001'
                if (isDefaultFormat(numfmtValue?.pattern)) {
                    return next(cell);
                }

                // If the cell not specified number type, then check the cell value type
                if (cell.t !== CellValueType.NUMBER) {
                    const type = checkCellValueType(cell.v, cell.t);
                    // just handle number/number string/number string with text format, other type will not be processed
                    if (
                        type !== CellValueType.NUMBER &&
                        !(
                            isTextFormat(numfmtValue?.pattern) &&
                            typeof cell.v === 'string' &&
                            typeof getNumfmtParseValueFilter(cell.v, { locale, dateSystem })?.v === 'number'
                        )
                    ) {
                        return next(cell);
                    }
                }

                const originCellValue = cell;
                if (!cell || cell === location.rawData) {
                    cell = { ...location.rawData };
                }

                // Add error marker to text format number
                if (isTextFormat(numfmtValue?.pattern)) {
                    // If the user has disabled the text format mark, do not show it
                    if (this._configService.getConfig<IUniverSheetsNumfmtConfig>(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY)?.disableTextFormatMark) {
                        cell.t = CellValueType.STRING;
                        return next(cell);
                    }

                    cell.t = CellValueType.STRING;
                    cell.markers = { ...cell?.markers, ...TEXT_FORMAT_MARK };
                    return next(cell);
                }

                const cacheParameters = `${unitId}_${sheetId}_${originCellValue.v}_${numfmtValue?.pattern}_${locale}_${dateSystem}`;
                const cache = renderCache.getValue(location.row, location.col);
                if (cache && cache.parameters === cacheParameters) {
                    return next({ ...cell, ...cache.result });
                }

                const info = getPatternPreviewIgnoreGeneral(numfmtValue?.pattern as string, Number(originCellValue.v), locale, dateSystem);
                const numfmtRes = info.result;
                const res: ICellDataForSheetInterceptor = { v: numfmtRes, t: CellValueType.NUMBER };
                if (numfmtRes === '') {
                    res.coverable = false;
                }
                if (info.color) {
                    const color = this._themeService.getColorFromTheme(`${info.color}.500`) ?? info.color;

                    if (color) {
                        res.interceptorStyle = { cl: { rgb: color } };
                    }
                }

                renderCache.setValue(location.row, location.col, {
                    result: res,
                    parameters: cacheParameters,
                });
                Object.assign(cell, res);
                return next(cell);
            },
            priority: InterceptCellContentPriority.NUMFMT,
        }));

        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetNumfmtMutation.id) {
                const params = commandInfo.params as ISetNumfmtMutationParams;
                Object.keys(params.values).forEach((key) => {
                    const v = params.values[key];
                    v.ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            renderCache.realDeleteValue(row, col);
                        });
                    });
                });
            } else if (commandInfo.id === SetRangeValuesMutation.id) {
                const params = commandInfo.params as ISetRangeValuesMutationParams;
                new ObjectMatrix(params.cellValue).forValue((row, col) => {
                    renderCache.realDeleteValue(row, col);
                });
            }
        }));

        this.disposeWithMe(
            this._instanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
                .pipe(
                    switchMap((workbook) => workbook?.activeSheet$ ?? of(null)),
                    skip(1)
                )
                .subscribe(() => renderCache.reset())
        );
    }

    setNumfmtLocal(locale: INumfmtLocaleTag) {
        this._locale$.next(locale);
    }
}
