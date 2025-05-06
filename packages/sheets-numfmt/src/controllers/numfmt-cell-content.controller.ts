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

import type {
    ICellData,
    ICellDataForSheetInterceptor,
    INumfmtLocalTag,
    Workbook,
} from '@univerjs/core';
import type { ISetNumfmtMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { IUniverSheetsNumfmtConfig } from './config.schema';
import {
    CellValueType,
    Disposable,
    ICommandService,
    IConfigService,
    Inject,
    InterceptorEffectEnum,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    ObjectMatrix,
    Range,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { isTextFormat } from '@univerjs/engine-numfmt';
import { checkCellValueType, InterceptCellContentPriority, INTERCEPTOR_POINT, INumfmtService, SetNumfmtMutation, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { BehaviorSubject, merge, of, skip, switchMap } from 'rxjs';
import { getPatternPreviewIgnoreGeneral } from '../utils/pattern';
import { SHEETS_NUMFMT_PLUGIN_CONFIG_KEY } from './config.schema';

const TEXT_FORMAT_MARK = {
    tl: {
        size: 6,
        color: '#409f11',
    },
};
export class SheetsNumfmtCellContentController extends Disposable {
    private _local$ = new BehaviorSubject<INumfmtLocalTag>('en');
    public local$ = this._local$.asObservable();
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

    public get local(): INumfmtLocalTag {
        const _local = this._local$.getValue();
        if (_local) {
            return _local;
        }
        const currentLocale = this._localeService.getCurrentLocale();

        switch (currentLocale) {
            case LocaleType.FR_FR: {
                return 'fr';
            }
            case LocaleType.RU_RU: {
                return 'ru';
            }
            case LocaleType.VI_VN: {
                return 'vi';
            }
            case LocaleType.ZH_CN: {
                return 'zh-CN';
            }
            case LocaleType.ZH_TW: {
                return 'zh-TW';
            }
            case LocaleType.EN_US:
            case LocaleType.FA_IR:
            default: {
                return 'en';
            }
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _initInterceptorCellContent() {
        const renderCache = new ObjectMatrix<{ result: ICellData; parameters: string | number }>();

        this.disposeWithMe(merge(this._local$, this._localeService.currentLocale$).subscribe(() => {
            renderCache.reset();
        }));

        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,

            // eslint-disable-next-line complexity
            handler: (cell, location, next) => {
                const unitId = location.unitId;
                const sheetId = location.subUnitId;
                let numfmtValue;
                const originCellValue = cell;
                if (!originCellValue) {
                    return next(cell);
                }

                if (cell?.s) {
                    const style = location.workbook.getStyles().get(cell.s);
                    if (style?.n) {
                        numfmtValue = style.n;
                    }
                }

                if (!numfmtValue) {
                    numfmtValue = this._numfmtService.getValue(unitId, sheetId, location.row, location.col);
                }

                if (!numfmtValue) {
                    return next(cell);
                }

                const type = cell.t || checkCellValueType(originCellValue.v);
                // just handle number
                if (type !== CellValueType.NUMBER) {
                    return next(cell);
                }

                // Add error marker to text format number
                if (isTextFormat(numfmtValue.pattern)) {
                    // If the user has disabled the text format mark, do not show it
                    if (this._configService.getConfig<IUniverSheetsNumfmtConfig>(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY)?.disableTextFormatMark) {
                        return next({
                            ...cell,
                            t: CellValueType.STRING,
                        });
                    }

                    return next({
                        ...cell,
                        t: CellValueType.STRING,
                        markers: {
                            ...cell?.markers,
                            ...TEXT_FORMAT_MARK,
                        },
                    });
                }

                let numfmtRes: string = '';
                const cache = renderCache.getValue(location.row, location.col);
                if (cache && cache.parameters === `${originCellValue.v}_${numfmtValue.pattern}`) {
                    return next({ ...cell, ...cache.result });
                }
                if (originCellValue.v === undefined || originCellValue.v === null) {
                    return next(cell);
                }
                const info = getPatternPreviewIgnoreGeneral(numfmtValue.pattern, Number(originCellValue.v), this.local);
                numfmtRes = info.result;
                if (!numfmtRes) {
                    return next(cell);
                }

                const res: ICellDataForSheetInterceptor = { v: numfmtRes, t: CellValueType.NUMBER };
                if (info.color) {
                    const color = this._themeService.getColorFromTheme(`${info.color}.500`);

                    if (color) {
                        res.interceptorStyle = { cl: { rgb: color } };
                    }
                }

                renderCache.setValue(location.row, location.col, {
                    result: res,
                    parameters: `${originCellValue.v}_${numfmtValue.pattern}`,
                });

                return next({ ...cell, ...res });
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

    setNumfmtLocal(local: INumfmtLocalTag) {
        this._local$.next(local);
    }
}
