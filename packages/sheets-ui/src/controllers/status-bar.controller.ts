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

import type { ICellData, ICommandInfo, IRange, ISelectionCell, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ArrayValueObject, ISheetData } from '@univerjs/engine-formula';
import type {
    ISelectionWithStyle,
} from '@univerjs/sheets';
import type { IStatusBarServiceStatus } from '../services/status-bar.service';
import {
    CellValueType,
    createInterceptorKey,
    debounce,
    Disposable,
    ICommandService,
    Inject,
    InterceptorManager,
    IUniverInstanceService,
    ObjectMatrix,
    RANGE_TYPE,
    splitIntoGrid,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';

import {
    FUNCTION_NAMES_MATH,
    FUNCTION_NAMES_STATISTICAL,
} from '@univerjs/engine-formula';
import {
    INumfmtService,
    SetRangeValuesMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { IStatusBarService } from '../services/status-bar.service';

export const STATUS_BAR_PERMISSION_CORRECT = createInterceptorKey<ArrayValueObject[], ArrayValueObject[]>('statusBarPermissionCorrect');

class CalculateValueSet {
    private _sum: number = 0;
    private _count: number = 0;
    private _countNumber: number = 0;
    private _min: number = Number.POSITIVE_INFINITY;
    private _max: number = Number.NEGATIVE_INFINITY;

    add(value: Nullable<ICellData>) {
        const v = value?.v;
        const t = value?.t;
        if (v !== undefined && v !== null) {
            if (typeof v === 'number' && t !== CellValueType.STRING) {
                this._sum += v;
                this._countNumber++;
                this._min = Math.min(this._min, v);
                this._max = Math.max(this._max, v);
            }
            this._count++;
        }
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
        @Inject(INumfmtService) private _numfmtService: INumfmtService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._registerSelectionListener();
    }

    private _registerSelectionListener(): void {
        const _statisticsHandler = debounce((selections: ISelectionWithStyle[]) => {
            const primary = selections[selections.length - 1]?.primary;
            this._calculateSelection(
                selections.map((selection) => selection.range),
                primary
            );
        }, 100);

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoving$.subscribe((selections) => {
                    if (selections) {
                        _statisticsHandler(selections);
                    }
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveEnd$.subscribe((selections) => {
                    if (selections) {
                        _statisticsHandler(selections);
                    }
                })
            )
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetRangeValuesMutation.id) {
                    const selections = this._selectionManagerService.getCurrentSelections();
                    if (selections) {
                        _statisticsHandler(selections as ISelectionWithStyle[]);
                    }
                }
            })
        );
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

    // eslint-disable-next-line max-lines-per-function
    private _calculateSelection(selections: IRange[], primary: Nullable<ISelectionCell>) {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return this._clearResult();
        }
        const unitId = workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const sheetId = sheet?.getSheetId();
        if (!sheetId) {
            return this._clearResult();
        }

        const sheetData: ISheetData = {};

        this._univerInstanceService
            .getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!
            .getSheets()
            .forEach((sheet) => {
                const sheetConfig = sheet.getConfig();
                sheetData[sheet.getSheetId()] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                    rowData: sheetConfig.rowData,
                    columnData: sheetConfig.columnData,
                };
            });

        if (selections?.length) {
            const realSelections: IRange[] = [];
            selections.forEach((selection) => {
                const { startRow: start, endRow: end } = selection;
                let prev = null;
                for (let r = start; r <= end; r++) {
                    if (sheet.getRowVisible(r)) {
                        if (prev === null) {
                            prev = r;
                        }
                    } else {
                        if (prev !== null) {
                            realSelections.push({ ...selection, startRow: prev, endRow: r - 1 });
                            prev = null;
                        }
                    }
                }
                if (prev !== null) {
                    realSelections.push({ ...selection, startRow: prev, endRow: end });
                }
            });

            const noDuplicate = splitIntoGrid(realSelections);
            // const matrix = sheet.getCellMatrix();
            const calculateValueSet = new CalculateValueSet();
            for (const range of noDuplicate) {
                const { startRow, startColumn, endColumn, endRow } = this.getRangeStartEndInfo(range, sheet);
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        const value = sheet.getCell(r, c);
                        calculateValueSet.add(value);
                    }
                }
            }

            const calcResult = calculateValues(calculateValueSet);
            if (calcResult.every((r) => r === undefined)) {
                return;
            }
            let pattern = null;
            if (primary) {
                const { actualRow, actualColumn } = primary;
                pattern = this._numfmtService.getValue(unitId, sheetId, actualRow, actualColumn)?.pattern;
            }
            const availableResult = calcResult.filter((r) => r !== undefined);
            const newState = {
                values: availableResult,
                pattern,
            };
            this._statusBarService.setState(newState as IStatusBarServiceStatus);
        } else {
            this._clearResult();
        }
    }
}

