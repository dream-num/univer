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

import type { IMutationInfo, IRange, Workbook } from '@univerjs/core';
import {
    Dimension,
    Disposable,
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Rectangle,
    Tools,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import type { IMoveColsCommandParams, IMoveRowsCommandParams } from '..';
import type {
    IAddWorksheetMergeMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../basics/interfaces/mutation-interface';
import { ClearSelectionAllCommand } from '../commands/commands/clear-selection-all.command';
import { ClearSelectionFormatCommand } from '../commands/commands/clear-selection-format.command';
import type { IDeleteRangeMoveLeftCommandParams } from '../commands/commands/delete-range-move-left.command';
import { DeleteRangeMoveLeftCommand } from '../commands/commands/delete-range-move-left.command';
import type { IDeleteRangeMoveUpCommandParams } from '../commands/commands/delete-range-move-up.command';
import { DeleteRangeMoveUpCommand } from '../commands/commands/delete-range-move-up.command';
import type { InsertRangeMoveDownCommandParams } from '../commands/commands/insert-range-move-down.command';
import { InsertRangeMoveDownCommand } from '../commands/commands/insert-range-move-down.command';
import type { InsertRangeMoveRightCommandParams } from '../commands/commands/insert-range-move-right.command';
import { InsertRangeMoveRightCommand } from '../commands/commands/insert-range-move-right.command';
import type { IInsertColCommandParams, IInsertRowCommandParams } from '../commands/commands/insert-row-col.command';
import { InsertColCommand, InsertRowCommand } from '../commands/commands/insert-row-col.command';
import type { IMoveRangeCommandParams } from '../commands/commands/move-range.command';
import { MoveRangeCommand } from '../commands/commands/move-range.command';
import { RemoveColCommand, RemoveRowCommand } from '../commands/commands/remove-row-col.command';
import type { ISetWorksheetActivateCommandParams } from '../commands/commands/set-worksheet-activate.command';
import { SetWorksheetActivateCommand } from '../commands/commands/set-worksheet-activate.command';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
} from '../commands/mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../commands/mutations/remove-worksheet-merge.mutation';
import { RefRangeService } from '../services/ref-range/ref-range.service';
import type { EffectRefRangeParams } from '../services/ref-range/type';
import { EffectRefRangId } from '../services/ref-range/type';
import { handleMoveCols, handleMoveRows, runRefRangeMutations } from '../services/ref-range/util';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetInterceptorService } from '../services/sheet-interceptor/sheet-interceptor.service';

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

@OnLifecycle(LifecycleStages.Steady, MergeCellController)
export class MergeCellController extends Disposable {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._onRefRangeChange();
        this._initCommandInterceptor();
    }

    private _initCommandInterceptor() {
        const self = this;
        this._sheetInterceptorService.interceptCommand({
            getMutations(commandInfo) {
                switch (commandInfo.id) {
                    case ClearSelectionAllCommand.id:
                    case ClearSelectionFormatCommand.id: {
                        const workbook = self._univerInstanceService.getCurrentUniverSheetInstance();
                        const unitId = workbook.getUnitId();
                        const worksheet = workbook.getActiveSheet();
                        const subUnitId = worksheet.getSheetId();
                        const mergeData = worksheet.getConfig().mergeData;
                        const selections = self._selectionManagerService.getSelectionRanges();
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
    }

    private _onRefRangeChange() {
        const disposableCollection = new DisposableCollection();
        const registerRefRange = (unitId: string, subUnitId: string) => {
            const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
            if (!workbook) {
                return;
            }
            const workSheet = workbook?.getSheetBySheetId(subUnitId);
            if (!workSheet) {
                return;
            }

            disposableCollection.dispose();
            const mergeData = workSheet.getMergeData();
            // Handles all merged unit tasks,if multiple range effect and called only once.
            const handler = (config: EffectRefRangeParams) => {
                switch (config.id) {
                    case MoveRangeCommand.id: {
                        const params = config.params as IMoveRangeCommandParams;
                        return this._handleMoveRangeCommand(params, unitId, subUnitId);
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
                    case EffectRefRangId.MoveColsCommandId: {
                        const params = config.params as unknown as IMoveColsCommandParams;
                        return this._handleMoveColsCommand(params, unitId, subUnitId);
                    }
                    case EffectRefRangId.MoveRowsCommandId: {
                        const params = config.params as unknown as IMoveRowsCommandParams;
                        return this._handleMoveRowsCommand(params, unitId, subUnitId);
                    }
                }
                return { redos: [], undos: [] };
            };
            mergeData.forEach((range) => {
                disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
            });
        };
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetActivateCommand.id) {
                    const params = commandInfo.params as ISetWorksheetActivateCommandParams;
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

        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        registerRefRange(workbook.getUnitId(), sheet.getSheetId());
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

        const removeParams: IRemoveWorksheetMergeMutationParams = { unitId, subUnitId, ranges: mergeData };
        const addParams: IAddWorksheetMergeMutationParams = { unitId, subUnitId, ranges: [] };
        mergeData.forEach((range) => {
            const operation = handleMoveRows({ id: EffectRefRangId.MoveRowsCommandId, params }, range);
            const result = runRefRangeMutations(operation, range);
            result && addParams.ranges.push(result);
        });
        const removeUndo = RemoveMergeUndoMutationFactory(this._injector, removeParams);
        const addUndo = AddMergeUndoMutationFactory(this._injector, addParams);
        return {
            redos: [
                { id: RemoveWorksheetMergeMutation.id, params: removeParams },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: addParams,
                },
            ],
            undos: [
                { id: RemoveWorksheetMergeMutation.id, params: addUndo },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: removeUndo,
                },
            ],
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

        const removeParams: IRemoveWorksheetMergeMutationParams = { unitId, subUnitId, ranges: mergeData };
        const addParams: IAddWorksheetMergeMutationParams = { unitId, subUnitId, ranges: [] };
        mergeData.forEach((range) => {
            const operation = handleMoveCols({ id: EffectRefRangId.MoveColsCommandId, params }, range);
            const result = runRefRangeMutations(operation, range);
            result && addParams.ranges.push(result);
        });
        const removeUndo = RemoveMergeUndoMutationFactory(this._injector, removeParams);
        const addUndo = AddMergeUndoMutationFactory(this._injector, addParams);
        return {
            redos: [
                { id: RemoveWorksheetMergeMutation.id, params: removeParams },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: addParams,
                },
            ],
            undos: [
                { id: RemoveWorksheetMergeMutation.id, params: addUndo },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: removeUndo,
                },
            ],
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
        const oldMergeCells = Tools.deepClone(worksheet.getMergeData());
        const newMergeCells = Tools.deepClone(worksheet.getMergeData()).map((mergedCell: IRange) => {
            const count = endRow - startRow + 1;
            if (startRow > mergedCell.endRow) {
                return mergedCell;
            }
            if (startRow <= mergedCell.startRow) {
                return Rectangle.moveVertical(mergedCell, count);
            }
            mergedCell.endRow += count;

            return mergedCell;
        });

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
        const oldMergeCells = Tools.deepClone(worksheet.getMergeData());
        const newMergeCells = Tools.deepClone(worksheet.getMergeData()).map((mergedCell: IRange) => {
            const count = endColumn - startColumn + 1;
            if (startColumn > mergedCell.endColumn) {
                return mergedCell;
            }
            if (startColumn <= mergedCell.startColumn) {
                return Rectangle.moveHorizontal(mergedCell, count);
            }
            mergedCell.endColumn += count;

            return mergedCell;
        });

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
        const mergeData: IRange[] = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const { startColumn: mergeStartColumn, endColumn: mergeEndColumn } = merge;
            const mergedCellColumnCount = mergeEndColumn - mergeStartColumn + 1;
            const { startColumn, endColumn } = range;
            const count = endColumn - startColumn + 1;
            if (endColumn < merge.startColumn) {
                merge.startColumn -= count;
                merge.endColumn -= count;
            } else if (startColumn > merge.endColumn) {
                continue;
            } else if (startColumn <= merge.startColumn && endColumn >= merge.endColumn) {
                mergeData.splice(i, 1);
                i--;
            } else {
                const intersects = Rectangle.getIntersects(range, merge)!;
                const interLength = intersects.endColumn - intersects.startColumn + 1;
                const isSimpleRow = intersects.endRow - intersects.startRow === 0;

                if (interLength === mergedCellColumnCount - 1 && isSimpleRow) {
                    mergeData.splice(i, 1);
                    i--;
                } else {
                    merge.endColumn -= intersects.endColumn - intersects.startColumn + 1;
                }
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeMutationParams
        );
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: mergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeMutationParams
        );
        const redos = [
            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
            { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
        ];
        const undos = [
            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
        ];
        return { redos, undos };
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
        const mergeData: IRange[] = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const { startRow: mergeStartRow, endRow: mergeEndRow } = merge;
            const mergedCellRowCount = mergeEndRow - mergeStartRow + 1;
            const { startRow, endRow } = range;
            const count = endRow - startRow + 1;
            if (endRow < mergeStartRow) {
                merge.startRow -= count;
                merge.endRow -= count;
            } else if (startRow > mergeEndRow) {
                continue;
            } else if (startRow <= mergeStartRow && endRow >= mergeEndRow) {
                mergeData.splice(i, 1);
                i--;
            } else {
                const intersects = Rectangle.getIntersects(range, merge)!;
                const interLength = intersects.endRow - intersects.startRow + 1;
                const isSimpleCol = intersects.endColumn - intersects.startColumn === 0;
                if (interLength === mergedCellRowCount - 1 && isSimpleCol) {
                    mergeData.splice(i, 1);
                    i--;
                } else {
                    merge.endRow -= intersects.endRow - intersects.startRow + 1;
                }
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeMutationParams
        );
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: mergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeMutationParams
        );
        const redos = [
            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
            { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
        ];
        const undos = [
            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
        ];
        return { redos, undos };
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
            redos: [
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
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
                { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
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
        const redos = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeParams,
            },
            {
                id: AddWorksheetMergeMutation.id,
                params: addMergeParams,
            },
        ];
        const undos = [
            {
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeParams,
            },
            {
                id: RemoveWorksheetMergeMutation.id,
                params: undoAddMergeParams,
            },
        ];
        return { redos, undos };
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
        const redos = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeParams,
            },
            {
                id: AddWorksheetMergeMutation.id,
                params: addMergeParams,
            },
        ];
        const undos = [
            {
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeParams,
            },
            {
                id: RemoveWorksheetMergeMutation.id,
                params: undoAddMergeParams,
            },
        ];
        return { redos, undos };
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
            redos: [
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
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
                { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            ],
        };
    }

    private _handleNull() {
        return { redos: [], undos: [] };
    }
}

function getWorkbook(univerInstanceService: IUniverInstanceService, unitId?: string) {
    if (unitId) {
        return univerInstanceService.getUniverSheetInstance(unitId);
    }
    return univerInstanceService.getCurrentUniverSheetInstance();
}

function getWorksheet(workbook: Workbook, subUnitId?: string) {
    if (subUnitId) {
        return workbook.getSheetBySheetId(subUnitId);
    }
    return workbook.getActiveSheet();
}
