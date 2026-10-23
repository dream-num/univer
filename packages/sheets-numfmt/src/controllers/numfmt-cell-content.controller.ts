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

import type { DateSystem, ICellData, ICellDataForSheetInterceptor, INumfmtLocaleTag, Nullable, Workbook } from '@univerjs/core';
import type { ISetNumfmtMutationParams, ISetRangeValuesMutationParams, ISheetLocation } from '@univerjs/sheets';
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
import type { IUniverSheetsNumfmtConfig } from '../config/config';
import { SHEETS_NUMFMT_PLUGIN_CONFIG_KEY } from '../config/config';
import { getPatternPreviewIgnoreGeneral } from '../utils/pattern';

const TEXT_FORMAT_MARK = {
    tl: {
        size: 6,
        color: '#409f11',
    },
};
export class SheetsNumfmtCellContentController extends Disposable {
    private readonly _renderCache = new ObjectMatrix<{ result: ICellDataForSheetInterceptor; parameters: string }>();
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

    private _initInterceptorCellContent() {
        this.disposeWithMe(merge(this._locale$, this._localeService.currentLocale$).subscribe(() => {
            this._renderCache.reset();
        }));

        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
            handler: (cell, location, next) => next(this._formatCell(cell, location)),
            priority: InterceptCellContentPriority.NUMFMT,
        }));

        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetNumfmtMutation.id) {
                const params = commandInfo.params as ISetNumfmtMutationParams;
                Object.keys(params.values).forEach((key) => {
                    const v = params.values[key];
                    v.ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            this._renderCache.realDeleteValue(row, col);
                        });
                    });
                });
            } else if (commandInfo.id === SetRangeValuesMutation.id) {
                const params = commandInfo.params as ISetRangeValuesMutationParams;
                new ObjectMatrix(params.cellValue).forValue((row, col) => {
                    this._renderCache.realDeleteValue(row, col);
                });
            }
        }));

        this.disposeWithMe(
            this._instanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
                .pipe(
                    switchMap((workbook) => workbook?.activeSheet$ ?? of(null)),
                    skip(1)
                )
                .subscribe(() => this._renderCache.reset())
        );
    }

    private _formatCell(
        cell: Nullable<ICellDataForSheetInterceptor>,
        location: ISheetLocation & { rawData: Nullable<ICellData> }
    ): Nullable<ICellDataForSheetInterceptor> {
        if (!cell || cell.v == null || cell.t === CellValueType.BOOLEAN || cell.t === CellValueType.FORCE_STRING) {
            return cell;
        }

        const { unitId, subUnitId: sheetId, row, col, workbook } = location;
        const locale = this.getLocale(workbook);
        const dateSystem = workbook.getDateSystem();
        const numfmtValue = workbook.getStyles().get(cell.s)?.n ?? this._numfmtService.getValue(unitId, sheetId, row, col);
        const pattern = numfmtValue?.pattern;
        // General must preserve numeric strings such as '001'.
        if (isDefaultFormat(pattern)) {
            return cell;
        }

        if (!this._isNumericCell(cell, pattern, locale, dateSystem)) {
            return cell;
        }

        const formattedCell = cell === location.rawData ? { ...cell } : cell;

        if (isTextFormat(pattern)) {
            formattedCell.t = CellValueType.STRING;
            if (!this._configService.getConfig<IUniverSheetsNumfmtConfig>(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY)?.disableTextFormatMark) {
                formattedCell.markers = { ...formattedCell.markers, ...TEXT_FORMAT_MARK };
            }
            return formattedCell;
        }

        const cacheParameters = `${unitId}_${sheetId}_${cell.v}_${pattern}_${locale}_${dateSystem}`;
        const cache = this._renderCache.getValue(row, col);
        if (cache && cache.parameters === cacheParameters) {
            return { ...formattedCell, ...cache.result };
        }

        const info = getPatternPreviewIgnoreGeneral(pattern as string, Number(cell.v), locale, dateSystem);
        const res: ICellDataForSheetInterceptor = { v: info.result, t: CellValueType.NUMBER };
        if (info.result === '') {
            res.coverable = false;
        }
        if (info.color) {
            const color = this._themeService.getColorFromTheme(`${info.color}.500`) ?? info.color;
            if (color) {
                res.interceptorStyle = { cl: { rgb: color } };
            }
        }

        this._renderCache.setValue(row, col, { result: res, parameters: cacheParameters });
        Object.assign(formattedCell, res);
        return formattedCell;
    }

    private _isNumericCell(cell: ICellData, pattern: string | undefined, locale: INumfmtLocaleTag, dateSystem: DateSystem): boolean {
        return cell.t === CellValueType.NUMBER || checkCellValueType(cell.v, cell.t) === CellValueType.NUMBER || (
            isTextFormat(pattern) &&
            typeof cell.v === 'string' &&
            typeof getNumfmtParseValueFilter(cell.v, { locale, dateSystem })?.v === 'number'
        );
    }

    setNumfmtLocal(locale: INumfmtLocaleTag) {
        this._locale$.next(locale);
    }
}
