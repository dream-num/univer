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

import type { ICommandInfo, IMutationInfo, IObjectArrayPrimitiveType, Nullable } from '@univerjs/core';
import { Disposable, DisposableCollection, ICommandService, IUniverInstanceService, LifecycleStages, moveMatrixArray, OnLifecycle, Rectangle } from '@univerjs/core';
import type { EffectRefRangeParams, IAddWorksheetMergeMutationParams, IInsertColCommandParams, IInsertRowCommandParams, IInsertRowMutationParams, IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, IRemoveColMutationParams, IRemoveRowsMutationParams, IRemoveSheetCommandParams, ISetWorksheetActivateCommandParams, ISheetCommandSharedParams } from '@univerjs/sheets';
import { EffectRefRangId, InsertColCommand, InsertRowCommand, InsertRowMutation, INTERCEPTOR_POINT, MoveRangeCommand, RefRangeService, RemoveColCommand, RemoveRowCommand, RemoveRowMutation, RemoveSheetCommand, SetWorksheetActivateCommand, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { SheetsFilterService } from '../services/sheet-filter.service';
import type { IRemoveSheetsFilterMutationParams, ISetSheetsFilterCriteriaMutationParams, ISetSheetsFilterRangeMutationParams } from '../commands/sheets-filter.mutation';
import { ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation } from '../commands/sheets-filter.mutation';
import type { FilterColumn } from '../models/filter-model';
import { mergeSetFilterCriteria } from '../utils';

@OnLifecycle(LifecycleStages.Ready, SheetsFilterController)
export class SheetsFilterController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService
    ) {
        super();

        this._initCommands();
        this._initRowFilteredInterceptor();
        this._initInterceptors();
        this._commandExecutedListener();
    }

    private _initCommands(): void {
        [
            SetSheetsFilterCriteriaMutation,
            SetSheetsFilterRangeMutation,
            ReCalcSheetsFilterMutation,
            RemoveSheetsFilterMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initInterceptors(): void {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => this._getUpdateFilter(command),
        }));

        const disposableCollection = new DisposableCollection();
        const registerRefRange = (unitId: string, subUnitId: string) => {
            const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
            if (!workbook) return;

            const workSheet = workbook?.getSheetBySheetId(subUnitId);
            if (!workSheet) return;

            disposableCollection.dispose();
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
                disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
            }
        };
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetActivateCommand.id) {
                const params = commandInfo.params as ISetWorksheetActivateCommandParams;
                const sheetId = params.subUnitId;
                const unitId = params.unitId;
                if (!sheetId || !unitId) {
                    return;
                }
                registerRefRange(unitId, sheetId);
            }
            if (commandInfo.id === SetSheetsFilterRangeMutation.id) {
                const params = commandInfo.params as IAddWorksheetMergeMutationParams;
                const sheetId = params.subUnitId;
                const unitId = params.unitId;
                if (!sheetId || !unitId) {
                    return;
                }
                registerRefRange(params.unitId, params.subUnitId);
            }
        }));

        this.disposeWithMe(this._sheetsFilterService.loadedUnitId$.subscribe((unitId) => {
            if (unitId) {
                const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                const sheet = workbook?.getActiveSheet();
                if (sheet) {
                    registerRefRange(unitId, sheet.getSheetId());
                }
            }
        }));
    }

    private _getUpdateFilter(command: ICommandInfo) {
        const { id } = command;
        switch (id) {
            case RemoveSheetCommand.id: {
                const params = command.params as ISheetCommandSharedParams;
                return this._handleRemoveSheetCommand(params, params.unitId, params.subUnitId);
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
            const { undos: moveUndos, redos: moveRedos } = this.moveCriteria(unitId, subUnitId, effected, count);
            redos.push(...moveRedos);
            undos.push(...moveUndos);
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
            redos: mergeSetFilterCriteria(redos), undos: mergeSetFilterCriteria(undos),
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
        if (shifted.length > 0) {
            const { undos: moveUndos, redos: moveRedos } = this.moveCriteria(unitId, subUnitId, shifted, -removeCount);
            redos.push(...moveRedos);
            undos.push(...moveUndos);
        }

        if (rangeRemoveCount === endColumn - startColumn + 1) {
            const removeFilterRangeMutationParams: IRemoveSheetsFilterMutationParams = {
                unitId,
                subUnitId,
            };
            redos.push({ id: RemoveSheetsFilterMutation.id, params: removeFilterRangeMutationParams });
        } else {
            if (startColumn <= removeStartColumn) {
                const finalEndColumn = endColumn - rangeRemoveCount;
                const setFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
                    unitId,
                    subUnitId,
                    range: {
                        ...filterRange,
                        endColumn: finalEndColumn,
                    },
                };
                redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
            } else {
                const setFilterRangeMutationParams: ISetSheetsFilterRangeMutationParams = {
                    unitId,
                    subUnitId,
                    range: {
                        ...filterRange,
                        startColumn: removeStartColumn,
                        endColumn: endColumn - (removeEndColumn - removeStartColumn + 1),
                    },
                };
                redos.push({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
            }
        }

        undos.push({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
        return {
            undos: mergeSetFilterCriteria(undos),
            redos: mergeSetFilterCriteria(redos),
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
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const filterColumn = filterModel.getAllFilterColumns();

        const filterHeaderIsRemoved = startRow <= removeEndRow && startRow >= removeStartRow;

        undos.push({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });

        const count = Math.min(removeEndRow, endRow) - Math.max(removeStartRow, startRow) + 1;
        if (count === endRow - startRow + 1 || filterHeaderIsRemoved) {
            const removeFilterRangeMutationParams: IRemoveSheetsFilterMutationParams = {
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

        const numberCols = Object.keys(filterCol).map((col) => Number(col)) as number[];

        const newEnd = Math.max(...numberCols);
        const newStart = Math.min(...numberCols);

        numberCols.forEach((col) => {
            const { colIndex: oldColIndex, filter } = filterCol[col];
            const newColIndex = col;
            if (filter) {
                const setCriteriaMutationParams: ISetSheetsFilterCriteriaMutationParams = {
                    unitId,
                    subUnitId,
                    col: newColIndex,
                    criteria: { ...filter.serialize(), colId: newColIndex },
                };
                redos.push({ id: SetSheetsFilterCriteriaMutation.id, params: setCriteriaMutationParams });
                undos.push({ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId, col: newColIndex, criteria: { ...filterModel.getFilterColumn(newColIndex)?.serialize(), colId: newColIndex } } });

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
            undos.push({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
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
        const filterRow: IObjectArrayPrimitiveType<{ offset: number }> = {};
        for (let row = startRow; row <= endRow; row++) {
            filterRow[row] = {
                offset: row - startRow,
            };
        }

        moveMatrixArray(fromRange.startRow, fromRange.endRow - fromRange.startRow + 1, toRange.startRow, filterRow);
        const numberRows = Object.keys(filterRow).map((row) => Number(row));

        const newEnd = Math.max(...numberRows);
        const newStart = Math.min(...numberRows);
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
            redos.unshift({ id: SetSheetsFilterRangeMutation.id, params: setFilterRangeMutationParams });
            undos.push({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
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
        filterCols.forEach((col) => {
            const [_, filter] = col;
            undos.push({ id: SetSheetsFilterCriteriaMutation.id, params: { unitId, subUnitId, col, criteria: { ...filter.serialize(), colId: col } } });
        });
        redos.push({ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId, range: filterRange } });
        undos.unshift({ id: SetSheetsFilterRangeMutation.id, params: { range: filterRange, unitId, subUnitId } });
        return {
            undos,
            redos,
        };
    }

    private _handleNull() {
        return { redos: [], undos: [] };
    }

    private _initRowFilteredInterceptor(): void {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
            handler: (filtered, rowLocation) => {
                if (filtered) return true;
                return this._sheetsFilterService.getFilterModel(
                    rowLocation.unitId, rowLocation.subUnitId)?.isRowFiltered(rowLocation.row) ?? false;
            },
        }));
    }

    private moveCriteria(unitId: string, subUnitId: string, target: [number, FilterColumn][], step: number) {
        const defaultSetCriteriaMutationParams: ISetSheetsFilterCriteriaMutationParams = {
            unitId,
            subUnitId,
            criteria: null,
            col: -1,
        };
        const undos: IMutationInfo[] = [];
        const redos: IMutationInfo[] = [];

        target.forEach((column) => {
            const [offset, filter] = column;
            redos.push({
                id: SetSheetsFilterCriteriaMutation.id,
                params: {
                    ...defaultSetCriteriaMutationParams,
                    col: offset,
                },
            });
            undos.push({
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
            redos.push({
                id: SetSheetsFilterCriteriaMutation.id,
                params: {
                    ...defaultSetCriteriaMutationParams,
                    col: offset + step,
                    criteria: { ...filter.serialize(), colId: offset + step },
                },
            });
            undos.push({
                id: SetSheetsFilterCriteriaMutation.id,
                params: {
                    ...defaultSetCriteriaMutationParams,
                    col: offset + step,
                    criteria: null,
                },
            });
        });

        return {
            redos,
            undos,
        };
    }

    private _commandExecutedListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
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

            // if (command.id === DeleteRangeMoveLeftCommand.id || command.id === DeleteRangeMoveUpCommand.id || command.id === InsertRangeMoveRightCommand.id || command.id === InsertRangeMoveDownCommand.id) {
            //     const { range } = command.params as (IDeleteRangeMoveUpCommandParams | IDeleteRangeMoveLeftCommandParams | InsertRangeMoveDownCommandParams | InsertRangeMoveRightCommandParams);
            //     const { startRow } = range;
            //     const { endRow: filterEndRow } = filterModel.getRange();
            //     if (startRow <= filterEndRow) {
            //         filterModel.reCalc();
            //     }
            // }

            // InsertRowsOrCols / RemoveRowsOrCols Mutations
            // if (mutationIdByRowCol.includes(command.id)) {
            //     const params = command.params as IInsertRowCommandParams;
            //     if (!params) return;
            //     const { range } = params;

            //     const isRowOperation = command.id.includes('row');
            //     const isAddOperation = command.id.includes('insert');

            //     const operationStart = isRowOperation ? range.startRow : range.startColumn;
            //     const operationEnd = isRowOperation ? range.endRow : range.endColumn;
            //     const operationCount = operationEnd - operationStart + 1;

            //     let { startRow, endRow, startColumn, endColumn } = filterModel.getRange();

            //     if (isAddOperation) {
            //         if (isRowOperation) {
            //             if (operationStart <= startRow) {
            //                 startRow += operationCount;
            //                 endRow += operationCount;
            //             }
            //         } else {
            //             if (operationStart <= startColumn) {
            //                 startColumn += operationCount;
            //                 endColumn += operationCount;
            //             }
            //         }
            //     } else {
            //         if (isRowOperation) {
            //             if (operationEnd < startRow) {
            //                 startRow -= operationCount;
            //                 endRow -= operationCount;
            //             }
            //         } else {
            //             if (operationEnd < startColumn) {
            //                 startColumn -= operationCount;
            //                 endColumn -= operationCount;
            //             }
            //         }
            //     }
            //     filterModel.setRange({ startRow, endRow, startColumn, endColumn });
            // }
        }));
    }
}

