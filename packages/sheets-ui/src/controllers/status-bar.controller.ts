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
    CellValue,
    ICellData,
    ICommandInfo,
    IObjectMatrixPrimitiveType,
    IRange,
    ISelectionCell,
    IStyleData,
    Nullable,
    SheetSkeleton,
    Styles,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import type { ArrayValueObject } from '@univerjs/engine-formula';
import type { ISelectionWithStyle, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import {
    CellValueType,
    createInterceptorKey,
    debounce,
    Disposable,
    ICommandService,
    Inject,
    InterceptorManager,
    IUniverInstanceService,
    numfmt,
    ObjectMatrix,
    RANGE_TYPE,
    splitIntoGrid,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    FormulaDataModel,
    FUNCTION_NAMES_MATH,
    FUNCTION_NAMES_STATISTICAL,
} from '@univerjs/engine-formula';
import { getFocusedRenderForUnit, IRenderManagerService } from '@univerjs/engine-render';
import {
    INumfmtService,
    SetRangeValuesMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { distinctUntilChanged, EMPTY, filter, map, merge, of, startWith, switchMap } from 'rxjs';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { IStatusBarService } from '../services/status-bar.service';

export const STATUS_BAR_PERMISSION_CORRECT = createInterceptorKey<ArrayValueObject[], ArrayValueObject[]>('statusBarPermissionCorrect');

type PatternInfoRecord = Record<string, ReturnType<typeof numfmt.getFormatInfo>>;

class CalculateValueSet {
    private _sum: number = 0;
    private _count: number = 0;
    private _countNumber: number = 0;
    private _min: number = Number.POSITIVE_INFINITY;
    private _max: number = Number.NEGATIVE_INFINITY;

    add(value: Nullable<ICellData>, styles: Styles, patternInfoRecord: PatternInfoRecord) {
        if (!Tools.isDefine(value?.v)) {
            return;
        }
        const t = value?.t;
        let { v } = value;

        const updateNumberStats = (v: number) => {
            this._sum += v;
            this._countNumber++;
            this._min = Math.min(this._min, v);
            this._max = Math.max(this._max, v);
        };

        const processNumberWithStyle = (
            style: Nullable<IStyleData>,
            v: Nullable<CellValue>,
            patternInfoRecord: PatternInfoRecord
        ) => {
            if (!style?.n?.pattern) {
                return;
            }

            const { pattern } = style.n;
            if (!patternInfoRecord[pattern]) {
                patternInfoRecord[pattern] = numfmt.getFormatInfo(pattern);
            }

            const formatInfo = patternInfoRecord[pattern];
            if (formatInfo.isDate) {
                const dateValue = v as number;
                updateNumberStats(dateValue);
            }
        };

        // v = '123' type = 2
        if (typeof v === 'string' && t === CellValueType.NUMBER) {
            const numValue = Number(v);
            if (!Number.isNaN(numValue)) {
                v = numValue;
            }
        }

        if (typeof v === 'number' && t !== CellValueType.STRING) {
            updateNumberStats(v);
        } else if (t === CellValueType.NUMBER && value.s) {
            const style = styles.get(value.s);
            processNumberWithStyle(style, v, patternInfoRecord);
        }
        this._count++;
    }

    getResults() {
        return {
            sum: this._sum,
            count: this._countNumber,
            // the countA in formula is the count of all values
            countA: this._count,
            min: this._min,
            max: this._max,
        };
    }
}
function calculateValues(valueSet: CalculateValueSet) {
    const { sum, count, countA, min, max } = valueSet.getResults();
    return [
        {
            func: FUNCTION_NAMES_STATISTICAL.MAX,
            value: max,
        },
        {
            func: FUNCTION_NAMES_STATISTICAL.MIN,
            value: min,
        },
        {
            func: FUNCTION_NAMES_MATH.SUM,
            value: sum,
        },
        {
            func: FUNCTION_NAMES_STATISTICAL.COUNTA,
            value: countA,
        },
        {
            func: FUNCTION_NAMES_STATISTICAL.COUNT,
            value: count,
        },
        {
            func: FUNCTION_NAMES_STATISTICAL.AVERAGE,
            value: sum / count,
        },
    ];
}

export class StatusBarController extends Disposable {
    public interceptor = new InterceptorManager({ STATUS_BAR_PERMISSION_CORRECT });

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IStatusBarService private readonly _statusBarService: IStatusBarService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(INumfmtService) private readonly _numfmtService: INumfmtService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._registerSelectionListener();
    }

    private _registerSelectionListener(): void {
        const calculate = (selections: readonly ISelectionWithStyle[]) => {
            const primary = selections[selections.length - 1]?.primary;
            this._calculateSelection(
                selections.map((selection) => selection.range),
                primary
            );
        };
        const statisticsHandler = debounce(calculate, 100);
        const statisticsMovingHandler = debounce(calculate, 500);
        this.disposeWithMe(() => {
            statisticsHandler.cancel();
            statisticsMovingHandler.cancel();
        });

        this.disposeWithMe(this._selectionManagerService.selectionMoving$.subscribe((selections) => {
            if (selections) {
                statisticsMovingHandler(selections);
            }
        }));
        this.disposeWithMe(merge(this._selectionManagerService.selectionMoveEnd$, this._selectionManagerService.selectionSet$)
            .subscribe((selections) => {
                if (selections) {
                    statisticsMovingHandler.cancel();
                    statisticsHandler(selections);
                }
            }));
        this._registerProjectionListener(statisticsHandler);

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetRangeValuesMutation.id) {
                    const selections = this._selectionManagerService.getCurrentSelections();
                    const { cellValue } = command.params as ISetRangeValuesMutationParams;

                    if (selections && selections.length > 0 && cellValue) {
                        const cellValueMatrix = new ObjectMatrix(cellValue);

                        // Do not update statistics if the changed cells are outside the current selection
                        let valueInSelection = false;

                        cellValueMatrix.forValue((row, col) => {
                            if (
                                selections.some((selection) => {
                                    const range = selection.range;
                                    return row >= range.startRow && row <= range.endRow && col >= range.startColumn && col <= range.endColumn;
                                })
                            ) {
                                valueInSelection = true;
                                return false; // Stop iteration
                            }
                        });

                        if (valueInSelection) {
                            statisticsHandler(selections);
                        }
                    }
                }
            })
        );
    }

    private _registerProjectionListener(refresh: (selections: readonly ISelectionWithStyle[]) => void): void {
        const renders = this._renderManagerService;
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        this.disposeWithMe(workbook$.pipe(switchMap((workbook) => {
            if (!workbook) {
                return EMPTY;
            }
            const unitId = workbook.getUnitId();
            return merge(
                renders.created$.pipe(filter((render) => render.unitId === unitId)),
                renders.disposed$.pipe(filter((renderId) => renderId === unitId)),
                (renders.focusedRenderChanged$ ?? EMPTY).pipe(filter((focusedUnitId) => focusedUnitId === unitId))
            ).pipe(
                startWith(null),
                map(() => getFocusedRenderForUnit(renders, unitId)),
                distinctUntilChanged(),
                switchMap((render) => {
                    const activeSheetId = workbook.getActiveSheet()?.getSheetId();
                    const manager = render?.with(SheetSkeletonManagerService);
                    return manager?.projectionChanged$.pipe(startWith(activeSheetId)) ?? of(activeSheetId);
                }),
                filter((sheetId) => sheetId !== undefined && sheetId === workbook.getActiveSheet()?.getSheetId()),
                map((sheetId) => this._selectionManagerService.getWorkbookSelections(unitId).getSelectionsOfWorksheet(sheetId))
            );
        })).subscribe(refresh));
    }

    private _clearResult(): void {
        this._statusBarService.setState(null);
    }

    getRangeStartEndInfo(range: IRange, sheet: Worksheet): IRange {
        if (range.rangeType === RANGE_TYPE.ALL) {
            return {
                startRow: 0,
                startColumn: 0,
                endRow: sheet.getRowCount() - 1,
                endColumn: sheet.getColumnCount() - 1,
            };
        }
        if (range.rangeType === RANGE_TYPE.COLUMN) {
            return {
                startRow: 0,
                startColumn: range.startColumn,
                endRow: sheet.getRowCount() - 1,
                endColumn: range.endColumn,
            };
        }
        if (range.rangeType === RANGE_TYPE.ROW) {
            return {
                startRow: range.startRow,
                startColumn: 0,
                endRow: range.endRow,
                endColumn: sheet.getColumnCount() - 1,
            };
        }
        return {
            startRow: range.startRow,
            startColumn: range.startColumn,
            endRow: range.endRow,
            endColumn: range.endColumn,
        };
    }

    private _getCellValue(
        row: number,
        col: number,
        sheet: Worksheet,
        sheetArrayFormulaCellData: IObjectMatrixPrimitiveType<Nullable<ICellData>> | undefined,
        projection: Nullable<SheetSkeleton>
    ): Nullable<ICellData> {
        const override = projection?.getCellDisplayOverride(row, col);
        if (override === null) {
            return null;
        }
        const rawCell = sheet.getCellRaw(row, col);
        if (override !== undefined) {
            return { ...override, s: rawCell?.s };
        }

        const arrayCell = sheetArrayFormulaCellData?.[row]?.[col];

        if (arrayCell) {
            // Merge only the necessary properties (t, v, s) to avoid full object spread and improve performance
            return {
                t: arrayCell.t ?? rawCell?.t,
                v: arrayCell.v ?? rawCell?.v,
                s: arrayCell.s ?? rawCell?.s,
            };
        }

        return rawCell;
    }

    private _calculateSelection(selections: IRange[], primary: Nullable<ISelectionCell>) {
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const sheet = workbook?.getActiveSheet();
        if (!workbook || !sheet || selections.length === 0) {
            return this._clearResult();
        }
        const unitId = workbook.getUnitId();
        const sheetId = sheet.getSheetId();
        const manager = getFocusedRenderForUnit(this._renderManagerService, unitId)?.with(SheetSkeletonManagerService);
        const projection = manager?.hasProjection(sheetId) ? manager.getSkeleton(sheetId) : undefined;
        const visibleRows = projection ?? sheet;
        const ranges = splitIntoGrid(selections.map((selection) => this.getRangeStartEndInfo(selection, sheet)));
        const calculateValueSet = new CalculateValueSet();
        const styles = workbook.getStyles();
        const patternInfoRecord: PatternInfoRecord = {};
        const sheetArrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData()?.[unitId]?.[sheetId];
        for (const { startRow, startColumn, endRow, endColumn } of ranges) {
            for (let row = startRow; row <= endRow; row++) {
                if (!visibleRows.getRowVisible(row)) {
                    continue;
                }
                for (let column = startColumn; column <= endColumn; column++) {
                    const value = this._getCellValue(row, column, sheet, sheetArrayFormulaCellData, projection);
                    calculateValueSet.add(value, styles, patternInfoRecord);
                }
            }
        }

        const pattern = primary ? this._numfmtService.getValue(unitId, sheetId, primary.actualRow, primary.actualColumn)?.pattern : null;
        this._statusBarService.setState({ values: calculateValues(calculateValueSet), pattern });
    }
}
