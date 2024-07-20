/**
 * Copyright 2023-present DreamNum Inc.
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
    Workbook,
} from '@univerjs/core';
import {
    CellValueType,
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    ObjectMatrix,
    OnLifecycle,
    Range,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import type { ISetNumfmtMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { INTERCEPTOR_POINT, INumfmtService, SetNumfmtMutation, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';

import { of, skip, switchMap } from 'rxjs';
import { getPatternPreview } from '../utils/pattern';

@OnLifecycle(LifecycleStages.Rendered, SheetsNumfmtCellContentController)
export class SheetsNumfmtCellContentController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThemeService) private _themeService: ThemeService,
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(LocaleService) private _localeService: LocaleService
    ) {
        super();
        this._initInterceptorCellContent();
    }

    private _initInterceptorCellContent() {
        const renderCache = new ObjectMatrix<{ result: ICellData; parameters: string | number }>();
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell, location, next) => {
                const unitId = location.unitId;
                const sheetId = location.subUnitId;
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
                if (!numfmtValue) {
                    return next(cell);
                }
                const originCellValue = cell;
                if (!originCellValue) {
                    return next(cell);
                }

                // just handle number
                if (originCellValue.t !== CellValueType.NUMBER) {
                    return next(cell);
                }

                let numfmtRes: string = '';
                const cache = renderCache.getValue(location.row, location.col);
                if (cache && cache.parameters === `${originCellValue.v}_${numfmtValue.pattern}`) {
                    return next({ ...cell, ...cache.result });
                }

                const info = getPatternPreview(numfmtValue.pattern, Number(originCellValue.v), this._localeService.getCurrentLocale());
                numfmtRes = info.result;
                if (!numfmtRes) {
                    return next(cell);
                }

                const res: ICellDataForSheetInterceptor = { v: numfmtRes };
                if (info.color) {
                    const color = this._themeService.getCurrentTheme()[`${info.color}500`];

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
            priority: 10,
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
}
