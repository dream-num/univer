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

import type { ICellData, ICommandInfo, IMutationInfo, IObjectArrayPrimitiveType, IRange, Nullable, Workbook } from '@univerjs/core';
import type { EffectRefRangeParams, IAddWorksheetMergeMutationParams, ICopySheetCommandParams, IInsertColCommandParams, IInsertRowCommandParams, IInsertRowMutationParams, IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, IRemoveColMutationParams, IRemoveRowsMutationParams, IRemoveSheetCommandParams, ISetRangeValuesMutationParams, ISetWorksheetActiveOperationParams, ISheetCommandSharedParams } from '@univerjs/sheets';
import type { ISetSheetsFilterCriteriaMutationParams, ISetSheetsFilterRangeMutationParams } from '../commands/mutations/sheets-filter.mutation';
import type { FilterColumn } from '../models/filter-model';

import { Disposable, DisposableCollection, ICommandService, Inject, IUniverInstanceService, moveMatrixArray, Optional, Rectangle } from '@univerjs/core';
import { DataSyncPrimaryController } from '@univerjs/rpc';
import { CopySheetCommand, EffectRefRangId, expandToContinuousRange, getSheetCommandTarget, InsertColCommand, InsertRowCommand, InsertRowMutation, INTERCEPTOR_POINT, MoveRangeCommand, MoveRowsCommand, RefRangeService, RemoveColCommand, RemoveRowCommand, RemoveRowMutation, RemoveSheetCommand, SetRangeValuesMutation, SetWorksheetActiveOperation, SheetInterceptorService } from '@univerjs/sheets';
import { ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation } from '../commands/mutations/sheets-filter.mutation';
import { SheetsFilterService } from '../services/sheet-filter.service';
import { mergeSetFilterCriteria } from '../utils';

export class SheetsFilterController extends Disposable {
    private _disposableCollection: DisposableCollection = new DisposableCollection();
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Optional(DataSyncPrimaryController) private readonly _dataSyncPrimaryController: DataSyncPrimaryController
    ) {
        super();

        this._initCommands();
        this._initRowFilteredInterceptor();
        this._initInterceptors();
        this._commandExecutedListener();
        this._initErrorHandling();
    }

    private _initCommands(): void {
        [
            SetSheetsFilterCriteriaMutation,
            SetSheetsFilterRangeMutation,
            ReCalcSheetsFilterMutation,
            RemoveSheetsFilterMutation,
        ].forEach((command) => {
            this.disposeWithMe(this._commandService.registerCommand(command));
            this._dataSyncPrimaryController?.registerSyncingMutations(command);
        });
    }

    private _initInterceptors(): void {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => this._getUpdateFilter(command),
        }));

        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetActiveOperation.id) {
                const params = commandInfo.params as ISetWorksheetActiveOperationParams;
                const sheetId = params.subUnitId;
                const unitId = params.unitId;
                if (!sheetId || !unitId) {
                    return;
                }
                this._registerRefRange(unitId, sheetId);
            }
            if (commandInfo.id === SetSheetsFilterRangeMutation.id) {
                const params = commandInfo.params as IAddWorksheetMergeMutationParams;
                const sheetId = params.subUnitId;
                const unitId = params.unitId;
                if (!sheetId || !unitId) {
                    return;
                }
                this._registerRefRange(params.unitId, params.subUnitId);
            }
        }));

        this.disposeWithMe(this._sheetsFilterService.loadedUnitId$.subscribe((unitId) => {
            if (unitId) {
                const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                const sheet = workbook?.getActiveSheet();
                if (sheet) {
                    this._registerRefRange(unitId, sheet.getSheetId());
                }
            }
        }));
    }

    private _registerRefRange(unitId: string, subUnitId: string): void {
        this._disposableCollection.dispose();
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const workSheet = workbook?.getSheetBySheetId(subUnitId);
        if (!workbook || !workSheet) return;
        const range = this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();
        const handler = (config: EffectRefRangeParams) => {
            switch (config.id) {
                case InsertRowCommand.id: {
                    const params = config.params as IInsertRowCommandParams;
                    const _unitId = params.unitId || unitId;
                    const _subUnitId = params.subUnitId || subUnitId;
                    return this._handleInsertRowCommand(params, _unitId, _subUnitId);
                }
                case InsertColCommand.id: {
                    const params = config.params as IInsertColCommandParams;
                    const _unitId = params.unitId || unitId;
                    const _subUnitId = params.subUnitId || subUnitId;
                    return this._handleInsertColCommand(params, _unitId, _subUnitId);
                }
                case RemoveColCommand.id: {
                    const params = config.params as IRemoveColMutationParams;
                    return this._handleRemoveColCommand(params, unitId, subUnitId);
                }
                case RemoveRowCommand.id: {
                    const params = config.params as IRemoveRowsMutationParams;
                    return this._handleRemoveRowCommand(params, unitId, subUnitId);
                }
                case EffectRefRangId.MoveColsCommandId: {
                    const params = config.params as IMoveColsCommandParams;
                    return this._handleMoveColsCommand(params, unitId, subUnitId);
                }
                case EffectRefRangId.MoveRowsCommandId: {
                    const params = config.params as IMoveRowsCommandParams;
                    return this._handleMoveRowsCommand(params, unitId, subUnitId);
                }
                case MoveRangeCommand.id: {
                    const params = config.params as IMoveRangeCommandParams;
                    return this._handleMoveRangeCommand(params, unitId, subUnitId);
                }
            }
            return { redos: [], undos: [] };
        };

        if (range) {
            this._disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
        }
    }

    private _getUpdateFilter(command: ICommandInfo) {
        const { id } = command;
        switch (id) {
            case RemoveSheetCommand.id: {
                const params = command.params as ISheetCommandSharedParams;
                return this._handleRemoveSheetCommand(params, params.unitId, params.subUnitId);
            }
            case CopySheetCommand.id: {
                const params = command.params as ICopySheetCommandParams & { targetSubUnitId: string };
                const { targetSubUnitId, unitId, subUnitId } = params;
                if (!unitId || !subUnitId || !targetSubUnitId) {
                    return this._handleNull();
                }

                return this._handleCopySheetCommand(unitId, subUnitId, targetSubUnitId);
            }
        }

        return {
            redos: [],
            undos: [],
        };
    }

    private _handleInsertColCommand(config: IInsertColCommandParams, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange) {
            return this._handleNull();
        }
        const { startColumn, endColumn } = filterRange;
        const { startColumn: insertStartColumn, endColumn: insertEndColumn } = config.range;
        const count = insertEndColumn - insertStartColumn + 1;

        if (insertEndColumn > endColumn) {
            return this._handleNull();
        }

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const anchor = insertStartColumn;
        const setFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
            unitId,
            subUnitId,
            range: {
                ...filterRange,
                startColumn: insertStartColumn <= startColumn ? startColumn + count : startColumn,
                endColumn: endColumn + count,
            },
        };

        const undoSetFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
            unitId,
            subUnitId,
            range: filterRange,
        };

        redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
        undos.push({ id: SetSheetsFilterRangeMutation.id, params: undoSetFilterRangeMutationParams });

        const filterColumn = filterModel.getAllFilterColumns();
        const effected = filterColumn.filter((column) => column[0] >= anchor);
        if (effected.length !== 0) {
            const { newRange, oldRange } = this._moveCriteria(unitId, subUnitId, effected, count);
            redos.push(...newRange.redos, ...oldRange.redos);
            undos.push(...newRange.undos, ...oldRange.undos);
        }

        return { redos: mergeSetFilterCriteria(redos), undos: mergeSetFilterCriteria(undos) };
    }

    private _handleInsertRowCommand(config: IInsertRowCommandParams, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange) {
            return this._handleNull();
        }
        const { startRow, endRow } = filterRange;
        const { startRow: insertStartRow, endRow: insertEndRow } = config.range;
        const rowCount = insertEndRow - insertStartRow + 1;
        if (insertEndRow > endRow) {
            return this._handleNull();
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const setFilterRangeParams: ISetSheetsFilterRangeMutationParams = {
            unitId,
            subUnitId,
            range: {
                ...filterRange,
                startRow: insertStartRow <= startRow ? startRow + rowCount : startRow,
                endRow: endRow + rowCount,
            },
        };
        const undoSetFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
            unitId,
            subUnitId,
            range: filterRange,
        };

        redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeParams });
        undos.push({ id: SetSheetsFilterRangeMutation.id, params: undoSetFilterRangeMutationParams });
        return {
            redos: mergeSetFilterCriteria(redos),
            undos: mergeSetFilterCriteria(undos),
        };
    }

    private _handleRemoveColCommand(config: IRemoveColMutationParams, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange) {
            return this._handleNull();
        }
        const { startColumn, endColumn } = filterRange;
        const { startColumn: removeStartColumn, endColumn: removeEndColumn } = config.range;

        if (removeStartColumn > endColumn) {
            return this._handleNull();
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const rangeRemoveCount =
            removeEndColumn < startColumn
                ? 0 :
                Math.min(removeEndColumn, endColumn) - Math.max(removeStartColumn, startColumn) + 1;

        const removeCount = removeEndColumn - removeStartColumn + 1;

        const filterColumn = filterModel.getAllFilterColumns();
        filterColumn.forEach((column) => {
            const [col, filter] = column;
            if (col <= removeEndColumn && col >= removeStartColumn) {
                redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: null } });
                undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: { ...filter.serialize(), colId: col } } });
            }
        });

        const shifted = filterColumn.filter((column) => {
            const [col, _] = column;
            return col > removeEndColumn;
        });

        let newRangeCriteria: { undos: IMutationInfo[]; redos: IMutationInfo[] } = { undos: [], redos: [] };
        if (shifted.length > 0) {
            const { oldRange, newRange } = this._moveCriteria(unitId, subUnitId, shifted, -removeCount);
            newRangeCriteria = newRange;
            redos.push(...oldRange.redos);
            undos.unshift(...oldRange.undos);
        }

        if (rangeRemoveCount === endColumn - startColumn + 1) {
            const removeFilterRangeMutationParams: ISheetCommandSharedParams = {
                unitId,
                subUnitId,
            };
            redos.push({ id: RemoveSheetsFilterMutation.id, params: removeFilterRangeMutationParams });
            undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
        } else {
            const newStartColumn = startColumn <= removeStartColumn
                ? startColumn :
                (rangeRemoveCount === 0 ? startColumn - removeCount : removeStartColumn);
            const newEndColumn = startColumn <= removeStartColumn ? endColumn - rangeRemoveCount : endColumn - removeCount;
            const setFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
                unitId,
                subUnitId,
                range: { ...filterRange, startColumn: newStartColumn, endColumn: newEndColumn },
            };
            redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
            undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });

            redos.push(...newRangeCriteria.redos);
            undos.unshift(...newRangeCriteria.undos);
        }

        return {
            undos,
            redos,
        };
    }

    private _handleRemoveRowCommand(config: IRemoveRowsMutationParams, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) {
            return this._handleNull();
        }

        const filterRange = filterModel.getRange();
        const { startRow, endRow } = filterRange;
        const { startRow: removeStartRow, endRow: removeEndRow } = config.range;
        if (removeStartRow > endRow) {
            return this._handleNull();
        }
        if (removeEndRow < startRow) {
            return {
                undos: [{ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } }],
                redos: [{
                    id: SetSheetsFilterRangeMutation.id,
                    params: {
                        range: {
                            ...filterRange,
                            startRow: startRow - (removeEndRow - removeStartRow + 1),
                            endRow: endRow - (removeEndRow - removeStartRow + 1),
                        },
                        unitId,
                        subUnitId,
                    },
                }],
            };
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const filterColumn = filterModel.getAllFilterColumns();

        const filterHeaderIsRemoved = startRow <= removeEndRow && startRow >= removeStartRow;

        undos.push({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });

        const count = Math.min(removeEndRow, endRow) - Math.max(removeStartRow, startRow) + 1;
        if (count === endRow - startRow + 1 || filterHeaderIsRemoved) {
            const removeFilterRangeMutationParams: ISheetCommandSharedParams = {
                unitId,
                subUnitId,
            };
            redos.push({ id: RemoveSheetsFilterMutation.id, params: removeFilterRangeMutationParams });

            filterColumn.forEach((column) => {
                const [offset, filter] = column;
                const setCriteriaMutationParams: ISetSheetsFilterCriteriaMutationParams = {
                    unitId,
                    subUnitId,
                    col: offset,
                    criteria: { ...filter.serialize(), colId: offset },
                };
                undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: setCriteriaMutationParams });
            });
        } else {
            const worksheet = this._univerInstanceService.getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);
            if (!worksheet) {
                return this._handleNull();
            }
            const hiddenRows = [];
            for (let r = removeStartRow; r <= removeEndRow; r++) {
                if (worksheet.getRowFiltered(r)) {
                    hiddenRows.push(r);
                }
            }
            const afterStartRow = Math.min(startRow, removeStartRow);
            const afterEndRow = afterStartRow + (endRow - startRow) - count + hiddenRows.length;
            const setFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
                unitId,
                subUnitId,
                range: {
                    ...filterRange,
                    startRow: afterStartRow,
                    endRow: afterEndRow,
                },
            };
            redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
        }

        return {
            undos: mergeSetFilterCriteria(undos),
            redos: mergeSetFilterCriteria(redos),
        };
    }

    // eslint-disable-next-line max-lines-per-function
    private _handleMoveColsCommand(config: IMoveColsCommandParams, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange) {
            return this._handleNull();
        }
        const { startColumn, endColumn } = filterRange;
        const { fromRange, toRange } = config;
        if ((fromRange.endColumn < startColumn && toRange.startColumn <= startColumn) || (
            fromRange.startColumn > endColumn && toRange.endColumn > endColumn
        )) {
            return this._handleNull();
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const filterCol: IObjectArrayPrimitiveType<{ colIndex: number; filter: Nullable<FilterColumn> }> = {};
        for (let col = startColumn; col <= endColumn; col++) {
            filterCol[col] = {
                colIndex: col,
                filter: filterModel.getFilterColumn(col),
            };
        }
        moveMatrixArray(fromRange.startColumn, fromRange.endColumn - fromRange.startColumn + 1, toRange.startColumn, filterCol);

        let startBorder = filterRange.startColumn;
        let endBorder = filterRange.endColumn;

        // border will change if first col or last col moves.
        if (startColumn >= fromRange.startColumn && startColumn <= fromRange.endColumn
            && toRange.startColumn > fromRange.startColumn
            && fromRange.endColumn < endColumn
        ) {
            startBorder = fromRange.endColumn + 1;
        }
        if (endColumn >= fromRange.startColumn && endColumn <= fromRange.endColumn
            && toRange.startColumn < fromRange.startColumn
            && fromRange.startColumn > startColumn
        ) {
            endBorder = fromRange.startColumn - 1;
        }

        const numberCols = Object.keys(filterCol).map((col) => Number(col)) as number[];

        // find the start col & end col of new filter range by border.
        const newEnd = numberCols.find((col) => filterCol[col].colIndex === endBorder) as number;
        const newStart = numberCols.find((col) => filterCol[col].colIndex === startBorder) as number;

        numberCols.forEach((col) => {
            const { colIndex: oldColIndex, filter } = filterCol[col];
            const newColIndex = col;

            if (filter) {
                if (newColIndex >= newStart && newColIndex <= newEnd) {
                    const setCriteriaMutationParams: ISetSheetsFilterCriteriaMutationParams = {
                        unitId,
                        subUnitId,
                        col: newColIndex,
                        criteria: { ...filter.serialize(), colId: newColIndex },
                    };

                    const undoSetCriteriaMutationParams: ISetSheetsFilterCriteriaMutationParams = {
                        unitId,
                        subUnitId,
                        col: newColIndex,
                        criteria: filterModel.getFilterColumn(newColIndex) ?
                            { ...filterModel.getFilterColumn(newColIndex)?.serialize(), colId: newColIndex }
                            : null,
                    };
                    redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: setCriteriaMutationParams });
                    undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: undoSetCriteriaMutationParams });
                }
                if (!filterCol[oldColIndex]?.filter) {
                    const setCriteriaMutationParams: ISetSheetsFilterCriteriaMutationParams = {
                        unitId,
                        subUnitId,
                        col: oldColIndex,
                        criteria: null,
                    };
                    redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: setCriteriaMutationParams });
                    undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col: oldColIndex, criteria: { ...filter.serialize(), colId: oldColIndex } } });
                }
            }
        });

        if (startColumn !== newStart || endColumn !== newEnd) {
            const setFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
                unitId,
                subUnitId,
                range: {
                    ...filterRange,
                    startColumn: newStart,
                    endColumn: newEnd,
                },
            };
            redos.unshift({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
            undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
        }

        return {
            undos,
            redos,
        };
    }

    private _handleMoveRowsCommand(config: IMoveRowsCommandParams, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange) {
            return this._handleNull();
        }
        const { startRow, endRow } = filterRange;
        const { fromRange, toRange } = config;
        if ((fromRange.endRow < startRow && toRange.startRow <= startRow) || (
            fromRange.startRow > endRow && toRange.endRow > endRow
        )) {
            return this._handleNull();
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const filterRow: IObjectArrayPrimitiveType<{ oldIndex: number }> = {};
        for (let row = startRow; row <= endRow; row++) {
            filterRow[row] = {
                oldIndex: row,
            };
        }
        const startBorder = startRow;
        let endBorder = endRow;

        // only need to deal with endBorder, startRow will not be moved.
        if (endRow >= fromRange.startRow && endRow <= fromRange.endRow
            && toRange.startRow < fromRange.startRow
            && fromRange.startRow > startRow
        ) {
            endBorder = fromRange.startRow - 1;
        }

        moveMatrixArray(fromRange.startRow, fromRange.endRow - fromRange.startRow + 1, toRange.startRow, filterRow);
        const numberRows = Object.keys(filterRow).map((row) => Number(row));

        const newEnd = numberRows.find((row) => filterRow[row].oldIndex === endBorder) as number;
        const newStart = numberRows.find((row) => filterRow[row].oldIndex === startBorder) as number;

        if (startRow !== newStart || endRow !== newEnd) {
            const setFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
                unitId,
                subUnitId,
                range: {
                    ...filterRange,
                    startRow: newStart,
                    endRow: newEnd,
                },
            };
            redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams }, { id: ReCalcSheetsFilterMutation.id, params: { unitId, subUnitId } });
            undos.push({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } }, { id: ReCalcSheetsFilterMutation.id, params: { unitId, subUnitId } });
        }
        return {
            redos,
            undos,
        };
    }

    private _handleMoveRangeCommand(config: IMoveRangeCommandParams, unitId: string, subUnitId: string) {
        const { fromRange, toRange } = config;
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) {
            return this._handleNull();
        }
        const filterRange = filterModel.getRange();
        if (!filterRange) {
            return this._handleNull();
        }

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        if (Rectangle.contains(fromRange, filterRange)) {
            const rowOffset = filterRange.startRow - fromRange.startRow;
            const colOffset = filterRange.startColumn - fromRange.startColumn;
            const newFilterRange = {
                startRow: toRange.startRow + rowOffset,
                startColumn: toRange.startColumn + colOffset,
                endRow: toRange.startRow + rowOffset + (filterRange.endRow - filterRange.startRow),
                endColumn: toRange.startColumn + colOffset + (filterRange.endColumn - filterRange.startColumn),
            };
            const removeFilter = {
                id: RemoveSheetsFilterMutation.id,
                params: {
                    unitId,
                    subUnitId,
                },
            };
            const setNewFilterRange = { id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: newFilterRange } as ISetSheetsFilterRangeMutationParams };
            const setOldFilterRange = { id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: filterRange } as ISetSheetsFilterRangeMutationParams };

            redos.push(removeFilter, setNewFilterRange);

            undos.push(removeFilter, setOldFilterRange);

            const filterColumn = filterModel.getAllFilterColumns();
            const moveColDelta = toRange.startColumn - fromRange.startColumn;
            filterColumn.forEach((column) => {
                const [col, criteria] = column;
                if (criteria) {
                    redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col: col + moveColDelta, criteria: { ...criteria.serialize(), colId: col + moveColDelta } } });
                    undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: { ...criteria.serialize(), colId: col } } });
                }
            });

            // redos.push({ id: ReCalcSheetsFilterMutation.id, params: { unitId, subUnitId } });
            // undos.push({ id: ReCalcSheetsFilterMutation.id, params: { unitId, subUnitId } });
        } else if (Rectangle.intersects(toRange, filterRange)) {
            const newFilterRange: IRange = {
                ...filterRange,
                endRow: Math.max(filterRange.endRow, toRange.endRow),
            };
            redos.push({ id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: newFilterRange } });
            undos.push({ id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: filterRange } });
        }
        return {
            redos,
            undos,
        };
    }

    private _handleRemoveSheetCommand(config: IRemoveSheetCommandParams, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) {
            return this._handleNull();
        }
        const filterRange = filterModel.getRange();
        if (!filterRange) {
            return this._handleNull();
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const filterCols = filterModel.getAllFilterColumns();
        filterCols.forEach(([col, filter]) => {
            undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: { ...filter.serialize(), colId: col } } });
        });
        redos.push({ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId, range: filterRange } });
        undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
        return {
            undos,
            redos,
        };
    }

    private _handleCopySheetCommand(unitId: string, subUnitId: string, targetSubUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) {
            return this._handleNull();
        }
        const filterRange = filterModel.getRange();
        if (!filterRange) {
            return this._handleNull();
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const preUndos: IMutationInfo[] = [];
        const preRedos: IMutationInfo[] = [];
        const filterCols = filterModel.getAllFilterColumns();
        filterCols.forEach(([col, filter]) => {
            redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId: targetSubUnitId, col, criteria: { ...filter.serialize(), colId: col } } });
            preUndos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId: targetSubUnitId, col, criteria: null } });
        });
        preUndos.push({ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId: targetSubUnitId, range: filterRange } });
        redos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId: targetSubUnitId } });
        return {
            undos,
            redos,
            preUndos,
            preRedos,
        };
    }

    private _handleNull() {
        return { redos: [], undos: [] };
    }

    private _initRowFilteredInterceptor(): void {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {

            // sheet-interceptor.service.ts
            handler: (filtered, rowLocation) => {
                if (filtered) return true;
                return this._sheetsFilterService.getFilterModel(
                    rowLocation.unitId,
                    rowLocation.subUnitId
                )?.isRowFiltered(rowLocation.row) ?? false;
            },
        }));
    }

    private _moveCriteria(unitId: string, subUnitId: string, target: [number, FilterColumn][], step: number) {
        const defaultSetCriteriaMutationParams: ISetSheetsFilterCriteriaMutationParams = {
            unitId,
            subUnitId,
            criteria: null,
            col: -1,
        };
        const oldUndos: IMutationInfo[] = [];
        const oldRedos: IMutationInfo[] = [];
        const newUndos: IMutationInfo[] = [];
        const newRedos: IMutationInfo[] = [];

        target.forEach((column) => {
            const [offset, filter] = column;
            oldRedos.push({
                id: SetSheetsFilterCriteriaMutation.id,
                params: {
                    ...defaultSetCriteriaMutationParams,
                    col: offset,
                },
            });
            oldUndos.push({
                id: SetSheetsFilterCriteriaMutation.id,
                params: {
                    ...defaultSetCriteriaMutationParams,
                    col: offset,
                    criteria: { ...filter.serialize(), colId: offset },
                },
            });
        });

        target.forEach((column) => {
            const [offset, filter] = column;
            newRedos.push({
                id: SetSheetsFilterCriteriaMutation.id,
                params: {
                    ...defaultSetCriteriaMutationParams,
                    col: offset + step,
                    criteria: { ...filter.serialize(), colId: offset + step },
                },
            });
            newUndos.push({
                id: SetSheetsFilterCriteriaMutation.id,
                params: {
                    ...defaultSetCriteriaMutationParams,
                    col: offset + step,
                    criteria: null,
                },
            });
        });

        return {
            newRange: {
                redos: newRedos,
                undos: newUndos,
            },
            oldRange: {
                redos: oldRedos,
                undos: oldUndos,
            },
        };
    }

    private _commandExecutedListener(): void {
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo, options) => {
            const { unitId, subUnitId } = command.params as unknown as ISheetCommandSharedParams || {};

            const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
            if (!filterModel) return;
            const filteredOutRows = Array.from(filterModel.filteredOutRows).sort((a, b) => a - b);
            const newFilteredOutRows: number[] = [];
            let changed = false;

            if (command.id === RemoveRowMutation.id) {
                const { startRow, endRow } = (command.params as IRemoveRowsMutationParams).range;
                const filterOutInRemove = filteredOutRows.filter((row) => row >= startRow && row <= endRow);
                filteredOutRows.forEach((row) => {
                    if (row < startRow) {
                        newFilteredOutRows.push(row);
                    } else {
                        changed = true;
                        if (row <= endRow) {
                            const newIndex = Math.max(startRow, newFilteredOutRows.length ? newFilteredOutRows[newFilteredOutRows.length - 1] + 1 : startRow);
                            newFilteredOutRows.push(newIndex);
                        } else {
                            newFilteredOutRows.push(row - (endRow - startRow + 1 - filterOutInRemove.length));
                        }
                    }
                });
            }

            if (command.id === InsertRowMutation.id) {
                const { startRow, endRow } = (command.params as IInsertRowMutationParams).range;
                filteredOutRows.forEach((row) => {
                    if (row >= startRow) {
                        changed = true;
                        newFilteredOutRows.push(row + (endRow - startRow + 1));
                    } else {
                        newFilteredOutRows.push(row);
                    }
                });
            }

            if (changed) {
                filterModel.filteredOutRows = new Set(newFilteredOutRows);
            }

            // extend filter range when set range values
            if (command.id === SetRangeValuesMutation.id && !options?.onlyLocal) {
                const extendRegion = this._getExtendRegion(unitId, subUnitId);
                if (extendRegion) {
                    const cellValue = (command.params as ISetRangeValuesMutationParams).cellValue;
                    if (cellValue) {
                        for (let col = extendRegion.startColumn; col <= extendRegion.endColumn; col++) {
                            const cell = cellValue?.[extendRegion.startRow]?.[col];
                            if (cell && this._cellHasValue(cell)) {
                                const worksheet = (this._univerInstanceService.getUnit(unitId) as Workbook)?.getSheetBySheetId(subUnitId);
                                if (worksheet) {
                                    const extendedRange = expandToContinuousRange(extendRegion, { down: true }, worksheet);
                                    const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId)!;
                                    const filterRange = filterModel.getRange();
                                    filterModel.setRange({
                                        ...filterRange,
                                        endRow: extendedRange.endRow,
                                    });
                                    this._registerRefRange(unitId, subUnitId);
                                }
                            }
                        }
                    }
                }
            }
        }));
    }

    private _getExtendRegion(unitId: string, subUnitId: string): Nullable<IRange> {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) {
            return null;
        }
        const worksheet = (this._univerInstanceService.getUnit(unitId) as Workbook)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return null;
        }
        const filterRange = filterModel.getRange();
        if (!filterRange) {
            return null;
        }
        const maxRowIndex = worksheet.getRowCount() - 1;
        const rowManager = worksheet.getRowManager();
        for (let row = filterRange.endRow + 1; row <= maxRowIndex; row++) {
            if (rowManager.getRowRawVisible(row)) {
                return {
                    startRow: row,
                    endRow: row,
                    startColumn: filterRange.startColumn,
                    endColumn: filterRange.endColumn,
                };
            }
        }
        return null;
    }

    private _initErrorHandling() {
        this.disposeWithMe(this._commandService.beforeCommandExecuted((command) => {
            const params = command.params as IMoveRowsCommandParams;
            const target = getSheetCommandTarget(this._univerInstanceService);
            if (!target) return;

            const { subUnitId, unitId } = target;
            const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
            if (!filterModel) return;
            const filterRange = filterModel.getRange();
            if (command.id === MoveRowsCommand.id && params.fromRange.startRow <= filterRange.startRow && params.fromRange.endRow < filterRange.endRow && params.fromRange.endRow >= filterRange.startRow) {
                this._sheetsFilterService.setFilterErrorMsg('sheets-filter.msg.filter-header-forbidden');
                throw new Error('[SheetsFilterController]: Cannot move header row of filter');
            }
        }));
    }

    private _cellHasValue(cell: ICellData): boolean {
        const values = Object.values(cell);
        if (values.length === 0 || values.every((v) => v == null)) {
            return false;
        }

        return true;
    }
}
