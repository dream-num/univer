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
    ICommandInfo,
    IMutationInfo,
    IObjectArrayPrimitiveType,
    IRange,
    Nullable,
    Workbook,
} from '@univerjs/core';
import type {
    EffectRefRangeParams,
    IAddWorksheetMergeMutationParams,
    ICopySheetCommandParams,
    IInsertColCommandParams,
    IInsertRowCommandParams,
    IInsertRowMutationParams,
    IMoveColsCommandParams,
    IMoveRangeCommandParams,
    IMoveRowsCommandParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveSheetCommandParams,
    ISetRangeValuesMutationParams,
    ISetWorksheetActiveOperationParams,
    ISheetCommandSharedParams,
} from '@univerjs/sheets';
import {
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    IUniverInstanceService,
    moveMatrixArray,
    Optional,
    Rectangle,
    UndoCommandId,
    UniverInstanceType,
} from '@univerjs/core';
import { DataSyncPrimaryController } from '@univerjs/rpc';
import {
    CopySheetCommand,
    EffectRefRangId,
    expandToContinuousRange,
    getSheetCommandTarget,
    InsertColCommand,
    InsertRowCommand,
    InsertRowMutation,
    INTERCEPTOR_POINT,
    MoveRangeCommand,
    MoveRowsCommand,
    RefRangeService,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveRowMutation,
    RemoveSheetCommand,
    SetRangeValuesMutation,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    ZebraCrossingCacheController,
} from '@univerjs/sheets';
import type {
    ISetSheetsFilterCriteriaMutationParams,
    ISetSheetsFilterRangeMutationParams,
} from '../commands/mutations/sheets-filter.mutation';
import type { FilterColumn } from '../models/filter-model';
import {
    ClearSheetsFilterCriteriaCommand,
    ReCalcSheetsFilterCommand,
    RemoveSheetFilterCommand,
    SetSheetFilterRangeCommand,
    SetSheetsFilterCriteriaCommand,
} from '../commands/commands/sheets-filter.command';
import {
    ReCalcSheetsFilterMutation,
    RemoveSheetsFilterMutation,
    SetSheetsFilterCriteriaMutation,
    SetSheetsFilterRangeMutation,
} from '../commands/mutations/sheets-filter.mutation';
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
        @Optional(DataSyncPrimaryController) private readonly _dataSyncPrimaryController: DataSyncPrimaryController,
        @Inject(ZebraCrossingCacheController) private readonly _zebraCrossingCacheController: ZebraCrossingCacheController
    ) {
        super();

        this._initCommands();
        this._initRowFilteredInterceptor();
        this._initInterceptors();
        this._commandExecutedListener();
        this._initErrorHandling();
        this._initZebraCrossingCacheListener();
    }

    private _initZebraCrossingCacheListener() {
        this.disposeWithMe(
            this._sheetsFilterService.activeFilterModel$.subscribe((filterModel) => {
                if (!filterModel) return;

                this.disposeWithMe(
                    filterModel.filteredOutRows$.subscribe(() => {
                        this._zebraCrossingCacheController.updateZebraCrossingCache(filterModel.unitId, filterModel.subUnitId);
                    })
                );
            })
        );
    }

    private _initCommands(): void {
        [
            SetSheetFilterRangeCommand,
            RemoveSheetFilterCommand,
            SetSheetsFilterCriteriaCommand,
            ClearSheetsFilterCriteriaCommand,
            ReCalcSheetsFilterCommand,
        ].forEach((command) => {
            this.disposeWithMe(this._commandService.registerCommand(command));
        });

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
                const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                const sheet = workbook?.getActiveSheet();
                if (sheet) {
                    this._registerRefRange(unitId, sheet.getSheetId());
                }
            }
        }));
    }

    private _registerRefRange(unitId: string, subUnitId: string): void {
        this._disposableCollection.dispose();
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
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
                    return this.handleInsertColCommand(params.range, _unitId, _subUnitId);
                }
                case RemoveColCommand.id: {
                    const params = config.params as IRemoveColMutationParams;
                    return this.handleRemoveColCommand(params.range, unitId, subUnitId);
                }
                case RemoveRowCommand.id: {
                    const params = config.params as IRemoveRowsMutationParams;
                    return this._handleRemoveRowCommand(params, unitId, subUnitId);
                }
                case EffectRefRangId.MoveColsCommandId: {
                    const params = config.params as IMoveColsCommandParams;
                    return this.handleMoveColsCommand({
                        fromRange: params.fromRange,
                        toRange: params.toRange,
                    }, unitId, subUnitId);
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

    handleInsertRowCommand(range: IRange, unitId: string, subUnitId: string) {
        return this._handleInsertRowCommand({ unitId, subUnitId, range } as IInsertRowCommandParams, unitId, subUnitId).redos;
    }

    handleRemoveRowCommand(range: IRange, unitId: string, subUnitId: string) {
        return this._handleRemoveRowCommand({ unitId, subUnitId, range } as IRemoveRowsMutationParams, unitId, subUnitId).redos;
    }

    handleMoveRowsCommand(sourceRange: IRange, targetRange: IRange, unitId: string, subUnitId: string) {
        return this._handleMoveRowsCommand({ fromRange: sourceRange, toRange: targetRange }, unitId, subUnitId).redos;
    }

    /**
     * Remote structural mutations are authoritative: they already contain the final row/column
     * interval, so they must not reuse the local command logic that skips locally hidden rows.
     */
    handleRemoteInsertRow(range: IRange, unitId: string, subUnitId: string): IMutationInfo[] {
        const filterRange = this._getRemoteFilterRange(unitId, subUnitId);
        if (!filterRange || range.startRow > filterRange.endRow) {
            return [];
        }
        const count = range.endRow - range.startRow + 1;
        const shiftStart = range.startRow <= filterRange.startRow;
        return this._remoteRangeRedos(unitId, subUnitId, filterRange, {
            ...filterRange,
            startRow: shiftStart ? filterRange.startRow + count : filterRange.startRow,
            endRow: filterRange.endRow + count,
        });
    }

    handleRemoteRemoveRow(range: IRange, unitId: string, subUnitId: string): IMutationInfo[] {
        const filterRange = this._getRemoteFilterRange(unitId, subUnitId);
        if (!filterRange || range.startRow > filterRange.endRow) {
            return [];
        }
        const count = range.endRow - range.startRow + 1;
        if (range.endRow < filterRange.startRow) {
            return this._remoteRangeRedos(unitId, subUnitId, filterRange, {
                ...filterRange,
                startRow: filterRange.startRow - count,
                endRow: filterRange.endRow - count,
            });
        }
        if (range.startRow <= filterRange.startRow) {
            return [{ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId } }];
        }
        return this._remoteRangeRedos(unitId, subUnitId, filterRange, {
            ...filterRange,
            endRow: range.endRow >= filterRange.endRow ? range.startRow - 1 : filterRange.endRow - count,
        });
    }

    handleRemoteInsertCol(range: IRange, unitId: string, subUnitId: string): IMutationInfo[] {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange || range.startColumn > filterRange.endColumn) {
            return [];
        }
        const count = range.endColumn - range.startColumn + 1;
        const shiftStart = range.startColumn <= filterRange.startColumn;
        const redos = this._remoteRangeRedos(unitId, subUnitId, filterRange, {
            ...filterRange,
            startColumn: shiftStart ? filterRange.startColumn + count : filterRange.startColumn,
            endColumn: filterRange.endColumn + count,
        });
        const affected = filterModel.getAllFilterColumns().filter(([col]) => col >= range.startColumn);
        if (affected.length > 0) {
            const { oldRange, newRange } = this._moveCriteria(unitId, subUnitId, affected, count);
            redos.push(...oldRange.redos, ...newRange.redos);
        }
        return mergeSetFilterCriteria(redos);
    }

    handleRemoteRemoveCol(range: IRange, unitId: string, subUnitId: string): IMutationInfo[] {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange || range.startColumn > filterRange.endColumn) {
            return [];
        }
        const count = range.endColumn - range.startColumn + 1;
        const removedBefore = Math.max(0, Math.min(range.endColumn, filterRange.startColumn - 1) - range.startColumn + 1);
        const coversWholeRange = range.startColumn <= filterRange.startColumn && range.endColumn >= filterRange.endColumn;
        if (coversWholeRange) {
            return [{ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId } }];
        }

        const startColumn = range.endColumn < filterRange.startColumn
            ? filterRange.startColumn - count
            : filterRange.startColumn - removedBefore;
        const endColumn = range.startColumn > filterRange.endColumn
            ? filterRange.endColumn
            : range.endColumn >= filterRange.endColumn
                ? range.startColumn - 1
                : filterRange.endColumn - count;
        const redos = this._remoteRangeRedos(unitId, subUnitId, filterRange, {
            ...filterRange,
            startColumn,
            endColumn,
        });

        const filterColumns = filterModel.getAllFilterColumns();
        filterColumns
            .filter(([col]) => col >= range.startColumn && col <= range.endColumn)
            .forEach(([col]) => {
                redos.push({
                    id: SetSheetsFilterCriteriaMutation.id,
                    params: { unitId, subUnitId, col, criteria: null },
                });
            });
        const shifted = filterColumns.filter(([col]) => col > range.endColumn);
        if (shifted.length > 0) {
            const { oldRange, newRange } = this._moveCriteria(unitId, subUnitId, shifted, -count);
            redos.push(...oldRange.redos, ...newRange.redos);
        }
        return mergeSetFilterCriteria(redos);
    }

    handleRemoteMoveRows(sourceRange: IRange, targetRange: IRange, unitId: string, subUnitId: string): IMutationInfo[] {
        const filterRange = this._getRemoteFilterRange(unitId, subUnitId);
        if (
            filterRange &&
            sourceRange.startRow <= filterRange.startRow &&
            sourceRange.endRow < filterRange.endRow &&
            sourceRange.endRow >= filterRange.startRow
        ) {
            // The local command rejects moving the filter header alone. A remote user can still
            // do it, so keep the remaining data rows and use the row above them as the new header.
            return this._remoteMoveRowsWithHeaderRemoved(sourceRange, targetRange, filterRange, unitId, subUnitId);
        }
        return this.handleMoveRowsCommand(sourceRange, targetRange, unitId, subUnitId)
            .filter((mutation) => mutation.id !== ReCalcSheetsFilterMutation.id);
    }

    private _remoteMoveRowsWithHeaderRemoved(
        sourceRange: IRange,
        targetRange: IRange,
        filterRange: IRange,
        unitId: string,
        subUnitId: string
    ): IMutationInfo[] {
        const dataStart = filterRange.startRow + 1;
        const dataEnd = filterRange.endRow;
        const filterRow: Record<number, { oldIndex: number }> = {};

        // Track only data rows that stay in the filter. Rows moved together with the header
        // leave the filter; moved data rows are intentionally not part of this map.
        for (let row = dataStart; row <= dataEnd; row++) {
            if (row < sourceRange.startRow || row > sourceRange.endRow) {
                filterRow[row] = { oldIndex: row };
            }
        }

        moveMatrixArray(
            sourceRange.startRow,
            sourceRange.endRow - sourceRange.startRow + 1,
            targetRange.startRow,
            filterRow
        );

        let newDataStart = Number.POSITIVE_INFINITY;
        let newDataEnd = Number.NEGATIVE_INFINITY;
        let hasData = false;
        // Do not spread a large row array into Math.min/max: a filter can cover more rows than
        // the engine's function-argument limit.
        for (const key in filterRow) {
            const row = Number(key);
            hasData = true;
            if (row < newDataStart) {
                newDataStart = row;
            }
            if (row > newDataEnd) {
                newDataEnd = row;
            }
        }
        if (!hasData) {
            return [];
        }

        return this._remoteRangeRedos(unitId, subUnitId, filterRange, {
            ...filterRange,
            startRow: Math.max(0, newDataStart - 1),
            endRow: newDataEnd,
        });
    }

    handleRemoteMoveCols(sourceRange: IRange, targetRange: IRange, unitId: string, subUnitId: string): IMutationInfo[] {
        return this.handleMoveColsCommand({ fromRange: sourceRange, toRange: targetRange }, unitId, subUnitId)
            .redos
            .filter((mutation) => mutation.id !== ReCalcSheetsFilterMutation.id);
    }

    private _getRemoteFilterRange(unitId: string, subUnitId: string): IRange | null {
        return this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange() ?? null;
    }

    private _remoteRangeRedos(
        unitId: string,
        subUnitId: string,
        filterRange: IRange,
        nextRange: IRange
    ): IMutationInfo[] {
        const redos: IMutationInfo[] = [];
        if (
            nextRange.startRow !== filterRange.startRow ||
            nextRange.endRow !== filterRange.endRow ||
            nextRange.startColumn !== filterRange.startColumn ||
            nextRange.endColumn !== filterRange.endColumn
        ) {
            redos.push({ id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: nextRange } });
        }
        return redos;
    }

    handleInsertColCommand(range: IRange, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange) {
            return this._handleNull();
        }
        const { startColumn, endColumn } = filterRange;
        const { startColumn: insertStartColumn, endColumn: insertEndColumn } = range;
        const count = insertEndColumn - insertStartColumn + 1;

        if (insertStartColumn > endColumn) {
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
            redos.push(...oldRange.redos, ...newRange.redos);
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
        if (insertStartRow > endRow) {
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

    handleRemoveColCommand(range: IRange, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange) {
            return this._handleNull();
        }
        const { startColumn, endColumn } = filterRange;
        const { startColumn: removeStartColumn, endColumn: removeEndColumn } = range;

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
            const worksheet = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetId(subUnitId);
            if (!worksheet) {
                return this._handleNull();
            }
            const hiddenRowCount = this._getFilteredRowCount(worksheet, removeStartRow, removeEndRow);
            const afterStartRow = Math.min(startRow, removeStartRow);
            const afterEndRow = afterStartRow + (endRow - startRow) - count + hiddenRowCount;
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

    private _getFilteredRowCount(worksheet: { getRowFiltered(row: number): boolean }, startRow: number, endRow: number): number {
        let count = 0;
        for (let row = startRow; row <= endRow; row++) {
            if (worksheet.getRowFiltered(row)) {
                count++;
            }
        }
        return count;
    }

    // eslint-disable-next-line max-lines-per-function
    handleMoveColsCommand({ fromRange, toRange }: { fromRange: IRange; toRange: IRange }, unitId: string, subUnitId: string) {
        const filterModel = this._sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterRange = filterModel?.getRange() ?? null;
        if (!filterModel || !filterRange) {
            return this._handleNull();
        }
        const { startColumn, endColumn } = filterRange;
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
            && fromRange.endColumn < endColumn) {
            startBorder = fromRange.endColumn + 1;
        }
        if (endColumn >= fromRange.startColumn && endColumn <= fromRange.endColumn
            && toRange.startColumn < fromRange.startColumn
            && fromRange.startColumn > startColumn) {
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
            && fromRange.startRow > startRow) {
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
            const trigger = (command.params as ISetRangeValuesMutationParams | undefined)?.trigger;
            if (command.id === SetRangeValuesMutation.id && !options?.onlyLocal && trigger !== UndoCommandId) {
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
                                    filterModel.reCalc();
                                    this._registerRefRange(unitId, subUnitId);
                                    break;
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
            const target = getSheetCommandTarget(this._univerInstanceService, params);
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
