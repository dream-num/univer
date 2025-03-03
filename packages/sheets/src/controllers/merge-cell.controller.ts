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

/* eslint-disable max-lines-per-function */

import type {
    ICommandInfo,
    IMutationInfo,
    IRange,
    Workbook,
} from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IInsertColMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../basics/interfaces/mutation-interface';

import type { IDeleteRangeMoveLeftCommandParams } from '../commands/commands/delete-range-move-left.command';
import type { IDeleteRangeMoveUpCommandParams } from '../commands/commands/delete-range-move-up.command';
import type { InsertRangeMoveDownCommandParams } from '../commands/commands/insert-range-move-down.command';
import type { InsertRangeMoveRightCommandParams } from '../commands/commands/insert-range-move-right.command';
import type { IInsertColCommandParams, IInsertRowCommandParams } from '../commands/commands/insert-row-col.command';
import type { IMoveRangeCommandParams } from '../commands/commands/move-range.command';
import type { IMoveColsCommandParams, IMoveRowsCommandParams } from '../commands/commands/move-rows-cols.command';
import type { IMoveRowsMutationParams } from '../commands/mutations/move-rows-cols.mutation';
import type { ISetWorksheetActiveOperationParams } from '../commands/operations/set-worksheet-active.operation';
import type { EffectRefRangeParams } from '../services/ref-range/type';
import {
    createInterceptorKey,
    Dimension,
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    Injector,
    InterceptorManager,
    IUniverInstanceService,
    Rectangle,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { first } from 'rxjs';
import { ClearSelectionAllCommand } from '../commands/commands/clear-selection-all.command';
import { ClearSelectionFormatCommand } from '../commands/commands/clear-selection-format.command';
import { DeleteRangeMoveLeftCommand } from '../commands/commands/delete-range-move-left.command';
import { DeleteRangeMoveUpCommand } from '../commands/commands/delete-range-move-up.command';
import { InsertRangeMoveDownCommand } from '../commands/commands/insert-range-move-down.command';
import { InsertRangeMoveRightCommand } from '../commands/commands/insert-range-move-right.command';
import { InsertColCommand, InsertRowCommand } from '../commands/commands/insert-row-col.command';
import { MoveRangeCommand } from '../commands/commands/move-range.command';
import { RemoveColCommand, RemoveRowCommand } from '../commands/commands/remove-row-col.command';
import { getSheetCommandTarget } from '../commands/commands/utils/target-util';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
} from '../commands/mutations/add-worksheet-merge.mutation';
import { InsertColMutation, InsertRowMutation } from '../commands/mutations/insert-row-col.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../commands/mutations/move-rows-cols.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../commands/mutations/remove-row-col.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../commands/mutations/remove-worksheet-merge.mutation';
import { SetWorksheetActiveOperation } from '../commands/operations/set-worksheet-active.operation';
import { RefRangeService } from '../services/ref-range/ref-range.service';
import { EffectRefRangId } from '../services/ref-range/type';
import { handleMoveCols, handleMoveRows, runRefRangeMutations } from '../services/ref-range/util';
import { SheetsSelectionsService } from '../services/selections/selection.service';
import { SheetInterceptorService } from '../services/sheet-interceptor/sheet-interceptor.service';

const mutationIdByRowCol = [InsertColMutation.id, InsertRowMutation.id, RemoveColMutation.id, RemoveRowMutation.id];
const mutationIdArrByMove = [MoveRowsMutation.id, MoveColsMutation.id];

type IMoveRowsOrColsMutationParams = IMoveRowsMutationParams;

/**
 * calculates the selection based on the merged cell type
 * @param {IRange[]} selection
 * @param {Dimension} [type]
 * @return {*}
 */
export function getAddMergeMutationRangeByType(selection: IRange[], type?: Dimension) {
    let ranges = selection;
    if (type !== undefined) {
        const rectangles: IRange[] = [];
        for (let i = 0; i < ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = ranges[i];
            if (type === Dimension.ROWS) {
                for (let r = startRow; r <= endRow; r++) {
                    const data = {
                        startRow: r,
                        endRow: r,
                        startColumn,
                        endColumn,
                    };
                    rectangles.push(data);
                }
            } else if (type === Dimension.COLUMNS) {
                for (let c = startColumn; c <= endColumn; c++) {
                    const data = {
                        startRow,
                        endRow,
                        startColumn: c,
                        endColumn: c,
                    };
                    rectangles.push(data);
                }
            }
        }
        ranges = rectangles;
    }
    return ranges;
}

export const MERGE_CELL_INTERCEPTOR_CHECK = createInterceptorKey<boolean, IRange[]>('mergeCellPermissionCheck');

export class MergeCellController extends Disposable {
    disposableCollection = new DisposableCollection();

    public readonly interceptor = new InterceptorManager({ MERGE_CELL_INTERCEPTOR_CHECK });

    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsSelectionsService) private _selectionManagerService: SheetsSelectionsService
    ) {
        super();
        this._onRefRangeChange();
        this._initCommandInterceptor();
        this._commandExecutedListener();
    }

    private _initCommandInterceptor() {
        const self = this;
        this._sheetInterceptorService.interceptCommand({
            getMutations(commandInfo) {
                switch (commandInfo.id) {
                    case ClearSelectionAllCommand.id:
                    case ClearSelectionFormatCommand.id: {
                        // TODO@Gggpound: get by unit id and subUnitId
                        const workbook = self._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                        const unitId = workbook.getUnitId();
                        const worksheet = workbook?.getActiveSheet();
                        if (!worksheet) {
                            return { redos: [], undos: [] };
                        }

                        const subUnitId = worksheet.getSheetId();
                        const mergeData = worksheet.getConfig().mergeData;
                        const selections = self._selectionManagerService.getCurrentSelections()?.map((s) => s.range);
                        if (selections && selections.length > 0) {
                            const isHasMerge = selections.some((range) =>
                                mergeData.some((item) => Rectangle.intersects(item, range))
                            );
                            if (isHasMerge) {
                                const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
                                    unitId,
                                    subUnitId,
                                    ranges: selections,
                                };
                                const undoRemoveMergeParams: IAddWorksheetMergeMutationParams =
                                    RemoveMergeUndoMutationFactory(self._injector, removeMergeParams);
                                const redos: IMutationInfo[] = [
                                    { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                                ];
                                const undos: IMutationInfo[] = [
                                    { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeParams },
                                ];
                                return { redos, undos };
                            }
                        }
                    }
                }

                return { redos: [], undos: [] };
            },
        });

        this._sheetInterceptorService.interceptRanges({
            getMutations: ({ unitId, subUnitId, ranges }) => {
                const redos: IMutationInfo[] = [];
                const undos: IMutationInfo[] = [];
                const emptyInterceptorArr = { redos, undos };
                if (!ranges || !ranges.length) {
                    return emptyInterceptorArr;
                }
                const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
                if (!target) {
                    return emptyInterceptorArr;
                }
                const { worksheet } = target;
                const mergeData = worksheet.getMergeData();
                const overlapRanges = mergeData.filter((item) => ranges.some((range) => Rectangle.intersects(item, range)));
                if (overlapRanges.length) {
                    redos.push({
                        id: RemoveWorksheetMergeMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ranges: overlapRanges,
                        },
                    });
                    undos.push({
                        id: AddWorksheetMergeMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ranges: overlapRanges,
                        },
                    });
                    return { undos, redos };
                }

                return emptyInterceptorArr;
            },
        });
    }

    refRangeHandle(config: EffectRefRangeParams, unitId: string, subUnitId: string) {
        switch (config.id) {
            case EffectRefRangId.MoveColsCommandId: {
                const params = config.params as unknown as IMoveColsCommandParams;
                return this._handleMoveColsCommand(params, unitId, subUnitId);
            }
            case EffectRefRangId.MoveRowsCommandId: {
                const params = config.params as unknown as IMoveRowsCommandParams;
                return this._handleMoveRowsCommand(params, unitId, subUnitId);
            }
            case InsertRowCommand.id: {
                const params = config.params as unknown as IInsertRowCommandParams;
                const _unitId = params.unitId || unitId;
                const _subUnitId = params.subUnitId || subUnitId;
                return this._handleInsertRowCommand(params, _unitId, _subUnitId);
            }
            case InsertColCommand.id: {
                const params = config.params as unknown as IInsertColCommandParams;
                const _unitId = params.unitId || unitId;
                const _subUnitId = params.subUnitId || subUnitId;
                return this._handleInsertColCommand(params, _unitId, _subUnitId);
            }
            case RemoveColCommand.id: {
                const params = config.params as unknown as IRemoveColMutationParams;
                return this._handleRemoveColCommand(params, unitId, subUnitId);
            }
            case RemoveRowCommand.id: {
                const params = config.params as unknown as IRemoveRowsMutationParams;
                return this._handleRemoveRowCommand(params, unitId, subUnitId);
            }

            case MoveRangeCommand.id: {
                const params = config.params as IMoveRangeCommandParams;
                return this._handleMoveRangeCommand(params, unitId, subUnitId);
            }
            case InsertRangeMoveRightCommand.id: {
                const params = config.params as unknown as InsertRangeMoveRightCommandParams;
                return this._handleInsertRangeMoveRightCommand(params, unitId, subUnitId);
            }
            case InsertRangeMoveDownCommand.id: {
                const params = config.params as unknown as InsertRangeMoveDownCommandParams;
                return this._handleInsertRangeMoveDownCommand(params, unitId, subUnitId);
            }
            case DeleteRangeMoveUpCommand.id: {
                const params = config.params as unknown as IDeleteRangeMoveUpCommandParams;
                return this._handleDeleteRangeMoveUpCommand(params, unitId, subUnitId);
            }
            case DeleteRangeMoveLeftCommand.id: {
                const params = config.params as unknown as IDeleteRangeMoveLeftCommandParams;
                return this._handleDeleteRangeMoveLeftCommand(params, unitId, subUnitId);
            }
        }
        return { redos: [], undos: [] };
    }

    private _onRefRangeChange() {
        const registerRefRange = (unitId: string, subUnitId: string) => {
            const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
            if (!workbook) {
                return;
            }
            const workSheet = workbook?.getSheetBySheetId(subUnitId);
            if (!workSheet) {
                return;
            }

            this.disposableCollection.dispose();
            const mergeData = workSheet.getMergeData();
            // Handles all merged unit tasks,if multiple range effect and called only once.
            const handler = (config: EffectRefRangeParams) => {
                return this.refRangeHandle(config, unitId, subUnitId);
            };
            mergeData.forEach((range) => {
                this.disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
            });
        };
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetActiveOperation.id) {
                    const params = commandInfo.params as ISetWorksheetActiveOperationParams;
                    const sheetId = params.subUnitId;
                    const unitId = params.unitId;
                    if (!sheetId || !unitId) {
                        return;
                    }
                    registerRefRange(unitId, sheetId);
                }
                if (commandInfo.id === AddWorksheetMergeMutation.id) {
                    const params = commandInfo.params as IAddWorksheetMergeMutationParams;
                    const sheetId = params.subUnitId;
                    const unitId = params.unitId;
                    if (!sheetId || !unitId) {
                        return;
                    }
                    registerRefRange(params.unitId, params.subUnitId);
                }
            })
        );

        this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(first((workbook) => !!workbook)).subscribe((workbook) => {
            const sheet = workbook!.getActiveSheet();
            if (!sheet) return;

            registerRefRange(workbook!.getUnitId(), sheet.getSheetId());
        });
    }

    private _handleMoveRowsCommand(params: IMoveRowsCommandParams, unitId: string, subUnitId: string) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const mergeData = [...worksheet.getMergeData()];

        const removeParams: IRemoveWorksheetMergeMutationParams = { unitId, subUnitId, ranges: [] };
        const addParams: IAddWorksheetMergeMutationParams = { unitId, subUnitId, ranges: [] };
        const { fromRange } = params;
        const { startRow: sourceStart, endRow: sourceEnd } = fromRange;
        mergeData.forEach((range) => {
            if (sourceStart <= range.startRow && sourceEnd >= range.endRow) {
                removeParams.ranges.push(range);
                const operation = handleMoveRows({ id: EffectRefRangId.MoveRowsCommandId, params }, range);
                const result = runRefRangeMutations(operation, range);
                result && addParams.ranges.push(result);
            }
        });
        if (removeParams.ranges.length === 0) {
            return this._handleNull();
        }
        const removeUndo = RemoveMergeUndoMutationFactory(this._injector, removeParams);
        const addUndo = AddMergeUndoMutationFactory(this._injector, addParams);
        return {
            preRedos: [{ id: RemoveWorksheetMergeMutation.id, params: removeParams }],
            redos: [{ id: AddWorksheetMergeMutation.id, params: addParams }],
            preUndos: [{ id: RemoveWorksheetMergeMutation.id, params: addUndo }],
            undos: [{ id: AddWorksheetMergeMutation.id, params: removeUndo }],
        };
    }

    private _handleMoveColsCommand(params: IMoveColsCommandParams, unitId: string, subUnitId: string) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const mergeData = [...worksheet.getMergeData()];

        const removeParams: IRemoveWorksheetMergeMutationParams = { unitId, subUnitId, ranges: [] };
        const addParams: IAddWorksheetMergeMutationParams = { unitId, subUnitId, ranges: [] };
        const { fromRange } = params;
        const { startColumn: sourceStart, endColumn: sourceEnd } = fromRange;
        mergeData.forEach((range) => {
            if (sourceStart <= range.startColumn && sourceEnd >= range.endColumn) {
                removeParams.ranges.push(range);
                const operation = handleMoveCols({ id: EffectRefRangId.MoveColsCommandId, params }, range);
                const result = runRefRangeMutations(operation, range);
                result && addParams.ranges.push(result);
            }
        });
        if (removeParams.ranges.length === 0) {
            return this._handleNull();
        }
        const removeUndo = RemoveMergeUndoMutationFactory(this._injector, removeParams);
        const addUndo = AddMergeUndoMutationFactory(this._injector, addParams);
        return {
            preRedos: [{ id: RemoveWorksheetMergeMutation.id, params: removeParams }],
            redos: [{ id: AddWorksheetMergeMutation.id, params: addParams }],
            preUndos: [{ id: RemoveWorksheetMergeMutation.id, params: addUndo }],
            undos: [{ id: AddWorksheetMergeMutation.id, params: removeUndo }],
        };
    }

    private _handleMoveRangeCommand(params: IMoveRangeCommandParams, unitId: string, subUnitId: string) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const mergeData = worksheet.getMergeData();
        const fromMergeRanges = mergeData.filter((item) => Rectangle.intersects(item, params.fromRange));
        const toMergeRanges = mergeData.filter((item) => Rectangle.intersects(item, params.toRange));

        const willMoveToMergeRanges = fromMergeRanges
            .map((mergeRange) => Rectangle.getRelativeRange(mergeRange, params.fromRange))
            .map((relativeRange) => Rectangle.getPositionRange(relativeRange, params.toRange));

        const addMergeCellRanges = getAddMergeMutationRangeByType(willMoveToMergeRanges).filter(
            (range) => !mergeData.some((mergeRange) => Rectangle.equals(range, mergeRange))
        );

        const redos: Array<{
            id: string;
            params: IAddWorksheetMergeMutationParams | IRemoveWorksheetMergeMutationParams;
        }> = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: fromMergeRanges,
                },
            },
            {
                id: RemoveWorksheetMergeMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: toMergeRanges,
                },
            },
            {
                id: AddWorksheetMergeMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: addMergeCellRanges,
                },
            },
        ];
        const undos: Array<{
            id: string;
            params: IAddWorksheetMergeMutationParams | IRemoveWorksheetMergeMutationParams;
        }> = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: addMergeCellRanges,
                },
            },
            {
                id: AddWorksheetMergeMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: toMergeRanges,
                },
            },
            {
                id: AddWorksheetMergeMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: fromMergeRanges,
                },
            },
        ];
        return { redos, undos };
    }

    private _handleInsertRowCommand(config: IInsertRowCommandParams, unitId: string, subUnitId: string) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const { range } = config;
        const { startRow, endRow } = range;
        const oldMergeCells = Tools.deepClone(worksheet.getMergeData()).reduce((mergeCellsHasLapping, cell) => {
            if (startRow > cell.startRow && startRow <= cell.endRow) {
                mergeCellsHasLapping.push(cell);
            }
            return mergeCellsHasLapping;
        }, [] as IRange[]);

        if (oldMergeCells.length === 0) {
            return this._handleNull();
        }

        const newMergeCells = Tools.deepClone(worksheet.getMergeData()).reduce((mergeCellsHasLapping, cell) => {
            if (startRow > cell.startRow && startRow <= cell.endRow) {
                const count = endRow - startRow + 1;
                cell.endRow += count;

                if (this._checkIsMergeCell(cell)) {
                    mergeCellsHasLapping.push(cell);
                }
            }
            return mergeCellsHasLapping;
        }, [] as IRange[]);

        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: oldMergeCells,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: newMergeCells,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeParams
        );
        const redos = [
            { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
            { id: AddWorksheetMergeMutation.id, params: addMergeParams },
        ];
        const undos = [
            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeParams },
        ];
        return { redos, undos };
    }

    private _handleInsertColCommand(config: IInsertColCommandParams, unitId: string, subUnitId: string) {
        const { range } = config;
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const { startColumn, endColumn } = range;
        const oldMergeCells = Tools.deepClone(worksheet.getMergeData()).reduce((mergeCellsHasLapping, cell) => {
            if (startColumn > cell.startColumn && startColumn <= cell.endColumn) {
                mergeCellsHasLapping.push(cell);
            }
            return mergeCellsHasLapping;
        }, [] as IRange[]);

        if (oldMergeCells.length === 0) {
            return this._handleNull();
        }

        const newMergeCells = Tools.deepClone(worksheet.getMergeData()).reduce((mergeCellsHasLapping, cell) => {
            if (startColumn > cell.startColumn && startColumn <= cell.endColumn) {
                const count = endColumn - startColumn + 1;
                cell.endColumn += count;

                if (this._checkIsMergeCell(cell)) {
                    mergeCellsHasLapping.push(cell);
                }
            }
            return mergeCellsHasLapping;
        }, [] as IRange[]);

        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: oldMergeCells,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: newMergeCells,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeParams
        );
        const redos = [
            { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
            { id: AddWorksheetMergeMutation.id, params: addMergeParams },
        ];
        const undos = [
            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeParams },
        ];
        return { redos, undos };
    }

    private _handleRemoveColCommand(config: IRemoveColMutationParams, unitId: string, subUnitId: string) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const { range } = config;
        const { startColumn, endColumn } = range;

        const oldMergeCells = Tools.deepClone(worksheet.getMergeData()).reduce((mergeCellsHasLapping, cell) => {
            if (Rectangle.intersects(range, cell)) {
                mergeCellsHasLapping.push(cell);
            }
            return mergeCellsHasLapping;
        }, [] as IRange[]);

        if (oldMergeCells.length === 0) {
            return this._handleNull();
        }

        const newMergeCells = Tools.deepClone(worksheet.getMergeData()).reduce((mergeCellsHasLapping, cell) => {
            if (Rectangle.intersects(range, cell)) {
                if (startColumn <= cell.startColumn && endColumn >= cell.endColumn) {
                    return mergeCellsHasLapping;
                } else if (startColumn >= cell.startColumn && endColumn <= cell.endColumn) {
                    cell.endColumn -= endColumn - startColumn + 1;
                } else if (startColumn < cell.startColumn) {
                    cell.startColumn = startColumn;
                    cell.endColumn -= endColumn - startColumn + 1;
                } else if (endColumn > cell.endColumn) {
                    cell.endColumn = startColumn - 1;
                }
                if (this._checkIsMergeCell(cell)) {
                    mergeCellsHasLapping.push(cell);
                }
            }
            return mergeCellsHasLapping;
        }, [] as IRange[]);

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: oldMergeCells,
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeMutationParams
        );
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: newMergeCells,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeMutationParams
        );

        const preRedos = [{ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams }];
        const redos = [{ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams }];
        const preUndos = [{ id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams }];
        const undos = [{ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams }];
        return { preUndos, undos, preRedos, redos };
    }

    private _handleRemoveRowCommand(config: IRemoveRowsMutationParams, unitId: string, subUnitId: string) {
        const { range } = config;
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }

        const { startRow, endRow } = range;

        const oldMergeCells = Tools.deepClone(worksheet.getMergeData()).reduce((mergeCellsHasLapping, cell) => {
            if (Rectangle.intersects(range, cell)) {
                mergeCellsHasLapping.push(cell);
            }
            return mergeCellsHasLapping;
        }, [] as IRange[]);

        if (oldMergeCells.length === 0) {
            return this._handleNull();
        }

        const newMergeCells = Tools.deepClone(worksheet.getMergeData()).reduce((mergeCellsHasLapping, cell) => {
            if (Rectangle.intersects(range, cell)) {
                if (startRow <= cell.startRow && endRow >= cell.endRow) {
                    return mergeCellsHasLapping;
                } else if (startRow >= cell.startRow && endRow <= cell.endRow) {
                    cell.endRow -= endRow - startRow + 1;
                } else if (startRow < cell.startRow) {
                    cell.startRow = startRow;
                    cell.endRow -= endRow - startRow + 1;
                } else if (endRow > cell.endRow) {
                    cell.endRow = startRow - 1;
                }
                if (this._checkIsMergeCell(cell)) {
                    mergeCellsHasLapping.push(cell);
                }
            }
            return mergeCellsHasLapping;
        }, [] as IRange[]);

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: oldMergeCells,
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeMutationParams
        );
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: newMergeCells,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeMutationParams
        );

        const preRedos = [{ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams }];
        const redos = [{ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams }];
        const preUndos = [{ id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams }];
        const undos = [{ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams }];
        return { preUndos, undos, preRedos, redos };
    }

    private _handleInsertRangeMoveRightCommand(
        config: InsertRangeMoveRightCommandParams,
        unitId: string,
        subUnitId: string
    ) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const range = config.range;
        const maxCol = worksheet.getMaxColumns() - 1;
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            const { startRow, endRow, startColumn, endColumn } = range;
            const intersects = Rectangle.intersects(
                {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn: maxCol,
                },
                rect
            );
            if (intersects) {
                removeMergeData.push(rect);
                const contains = Rectangle.contains(
                    {
                        startRow,
                        startColumn,
                        endRow,
                        endColumn: maxCol,
                    },
                    rect
                );
                if (contains) {
                    const currentColumnsCount = endColumn - startColumn + 1;
                    addMergeData.push({
                        startRow: rect.startRow,
                        startColumn: rect.startColumn + currentColumnsCount,
                        endRow: rect.endRow,
                        endColumn: rect.endColumn + currentColumnsCount,
                    });
                }
            }
        });
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: removeMergeData,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: addMergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeParams
        );
        return {
            preRedos: [
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
            ],
            redos: [
                {
                    id: AddWorksheetMergeMutation.id,
                    params: addMergeParams,
                },
            ],
            preUndos: [
                { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            ],
            undos: [
                {
                    id: AddWorksheetMergeMutation.id,
                    params: undoRemoveMergeParams,
                },
            ],
        };
    }

    private _handleInsertRangeMoveDownCommand(
        config: InsertRangeMoveDownCommandParams,
        unitId: string,
        subUnitId: string
    ) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const range = config.range;
        const maxRow = worksheet.getMaxRows() - 1;
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            const { startRow, startColumn, endColumn, endRow } = range;
            const intersects = Rectangle.intersects({ startRow, startColumn, endRow: maxRow, endColumn }, rect);
            if (intersects) {
                removeMergeData.push(rect);
                const contains = Rectangle.contains({ startRow, startColumn, endRow: maxRow, endColumn }, rect);
                if (contains) {
                    const rowCount = endRow - startRow + 1;
                    addMergeData.push({
                        startRow: rect.startRow + rowCount,
                        startColumn: rect.startColumn,
                        endRow: rect.endRow + rowCount,
                        endColumn: rect.endColumn,
                    });
                }
            }
        });
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: removeMergeData,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: addMergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,

            addMergeParams
        );
        const preRedos = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeParams,
            },
        ];
        const redos = [
            {
                id: AddWorksheetMergeMutation.id,
                params: addMergeParams,
            },
        ];
        const preUndos = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: undoAddMergeParams,
            },
        ];
        const undos = [
            {
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeParams,
            },

        ];
        return { redos, undos, preRedos, preUndos };
    }

    private _handleDeleteRangeMoveUpCommand(
        config: IDeleteRangeMoveUpCommandParams,
        unitId: string,
        subUnitId: string
    ) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const range = config.range;
        const maxRow = worksheet.getMaxRows() - 1;
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            const { startRow, startColumn, endColumn, endRow } = range;
            const intersects = Rectangle.intersects({ startRow, startColumn, endRow: maxRow, endColumn }, rect);
            if (intersects) {
                removeMergeData.push(rect);
                const contains = Rectangle.contains({ startRow, startColumn, endRow: maxRow, endColumn }, rect);
                if (contains) {
                    const rowCount = endRow - startRow + 1;
                    const range = Rectangle.moveVertical(rect, -rowCount);
                    addMergeData.push(range);
                }
            }
        });
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: removeMergeData,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: addMergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeParams
        );
        const preRedos = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeParams,
            },
        ];
        const redos = [

            {
                id: AddWorksheetMergeMutation.id,
                params: addMergeParams,
            },
        ];
        const preUndos = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: undoAddMergeParams,
            },
        ];
        const undos = [
            {
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeParams,
            },

        ];
        return { redos, undos, preRedos, preUndos };
    }

    private _handleDeleteRangeMoveLeftCommand(
        config: IDeleteRangeMoveLeftCommandParams,
        unitId: string,
        subUnitId: string
    ) {
        const workbook = getWorkbook(this._univerInstanceService, unitId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, subUnitId);
        if (!worksheet) {
            return this._handleNull();
        }
        const range = config.range;
        const maxCol = worksheet.getMaxColumns() - 1;
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            const { startRow, endRow, startColumn, endColumn } = range;
            const intersects = Rectangle.intersects(
                {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn: maxCol,
                },
                rect
            );
            if (intersects) {
                removeMergeData.push(rect);
                const contains = Rectangle.contains(
                    {
                        startRow,
                        startColumn,
                        endRow,
                        endColumn: maxCol,
                    },
                    rect
                );
                if (contains) {
                    const currentColumnsCount = endColumn - startColumn + 1;
                    addMergeData.push({
                        startRow: rect.startRow,
                        startColumn: rect.startColumn - currentColumnsCount,
                        endRow: rect.endRow,
                        endColumn: rect.endColumn - currentColumnsCount,
                    });
                }
            }
        });
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: removeMergeData,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(this._injector, removeMergeParams);
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: addMergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(this._injector, addMergeParams);
        return {
            preRedos: [
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
            ],
            redos: [

                {
                    id: AddWorksheetMergeMutation.id,
                    params: addMergeParams,
                },
            ],
            undos: [
                {
                    id: AddWorksheetMergeMutation.id,
                    params: undoRemoveMergeParams,
                },

            ],
            preUndos: [
                { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            ],
        };
    }

    private _checkIsMergeCell(cell: IRange) {
        return !(cell.startRow === cell.endRow && cell.startColumn === cell.endColumn);
    }

    private _handleNull() {
        return { redos: [], undos: [] };
    }

    private _commandExecutedListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            // 1. MoveRowsOrColsMutation
            if (mutationIdArrByMove.includes(command.id)) {
                if (!command.params) return;
                const workbook = this._univerInstanceService.getUniverSheetInstance((command.params as IMoveRowsMutationParams).unitId);
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId((command.params as IMoveRowsMutationParams).subUnitId);
                if (!worksheet) return;
                const { sourceRange, targetRange } = command.params as IMoveRowsOrColsMutationParams;
                const isRowMove = sourceRange.startColumn === targetRange.startColumn && sourceRange.endColumn === targetRange.endColumn;
                const moveLength = isRowMove
                    ? sourceRange.endRow - sourceRange.startRow + 1
                    : sourceRange.endColumn - sourceRange.startColumn + 1;
                const sourceStart = isRowMove ? sourceRange.startRow : sourceRange.startColumn;
                const targetStart = isRowMove ? targetRange.startRow : targetRange.startColumn;
                const mergeData = worksheet.getConfig().mergeData;

                const adjustedMergedCells: IRange[] = [];
                mergeData.forEach((merge) => {
                    let { startRow, endRow, startColumn, endColumn, rangeType } = merge;

                    if (!Rectangle.intersects(merge, sourceRange)) {
                        if (isRowMove) {
                            if (sourceStart < startRow && targetStart > endRow) {
                                startRow -= moveLength;
                                endRow -= moveLength;
                            } else if (sourceStart > endRow && targetStart <= startRow) {
                                startRow += moveLength;
                                endRow += moveLength;
                            }
                        } else {
                            if (sourceStart < startColumn && targetStart > endColumn) {
                                startColumn -= moveLength;
                                endColumn -= moveLength;
                            } else if (sourceStart > endColumn && targetStart <= startColumn) {
                                startColumn += moveLength;
                                endColumn += moveLength;
                            }
                        }
                    }

                    if (!(merge.startRow === merge.endRow && merge.startColumn === merge.endColumn)) {
                        adjustedMergedCells.push({ startRow, endRow, startColumn, endColumn, rangeType });
                    }
                });
                worksheet.setMergeData(adjustedMergedCells);

                this.disposableCollection.dispose();
                const { unitId, subUnitId } = command.params as IMoveRowsMutationParams;
                const handler = (config: EffectRefRangeParams) => {
                    return this.refRangeHandle(config, unitId, subUnitId);
                };
                adjustedMergedCells.forEach((range) => {
                    this.disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
                });
            }

            // 2. InsertRowsOrCols / RemoveRowsOrCols Mutations
            if (mutationIdByRowCol.includes(command.id)) {
                const workbook = this._univerInstanceService.getUniverSheetInstance((command.params as IInsertColMutationParams).unitId);
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId((command.params as IInsertColMutationParams).subUnitId);
                if (!worksheet) return;

                const mergeData = worksheet.getConfig().mergeData;
                const params = command.params as IInsertRowCommandParams;
                if (!params) return;
                const { range } = params;

                const isRowOperation = command.id.includes('row');
                const isAddOperation = command.id.includes('insert');

                const operationStart = isRowOperation ? range.startRow : range.startColumn;
                const operationEnd = isRowOperation ? range.endRow : range.endColumn;
                const operationCount = operationEnd - operationStart + 1;
                const adjustedMergedCells: IRange[] = [];

                mergeData.forEach((merge) => {
                    let { startRow, endRow, startColumn, endColumn, rangeType } = merge;

                    if (isAddOperation) {
                        if (isRowOperation) {
                            if (operationStart <= startRow) {
                                startRow += operationCount;
                                endRow += operationCount;
                            }
                        } else {
                            if (operationStart <= startColumn) {
                                startColumn += operationCount;
                                endColumn += operationCount;
                            }
                        }
                    } else {
                        if (isRowOperation) {
                            if (operationEnd < startRow) {
                                startRow -= operationCount;
                                endRow -= operationCount;
                            }
                        } else {
                            if (operationEnd < startColumn) {
                                startColumn -= operationCount;
                                endColumn -= operationCount;
                            }
                        }
                    }

                    if (!(merge.startRow === merge.endRow && merge.startColumn === merge.endColumn)) {
                        adjustedMergedCells.push({ startRow, endRow, startColumn, endColumn, rangeType });
                    }
                });

                worksheet.setMergeData(adjustedMergedCells);

                this.disposableCollection.dispose();
                const { unitId, subUnitId } = command.params as IMoveRowsMutationParams;
                const handler = (config: EffectRefRangeParams) => {
                    return this.refRangeHandle(config, unitId, subUnitId);
                };
                adjustedMergedCells.forEach((range) => {
                    this.disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
                });
            }
        }));
    }
}

function getWorkbook(univerInstanceService: IUniverInstanceService, unitId?: string) {
    if (unitId) {
        return univerInstanceService.getUniverSheetInstance(unitId);
    }
    return univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
}

function getWorksheet(workbook: Workbook, subUnitId?: string) {
    if (subUnitId) {
        return workbook.getSheetBySheetId(subUnitId);
    }
    return workbook.getActiveSheet();
}
