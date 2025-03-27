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

import type { ICommandInfo, IDrawingParam, IMutationInfo, IRange, ITransformState, Nullable, Workbook } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IInsertColCommandParams, IInsertRowCommandParams, IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, IRemoveRowColCommandParams, ISetColHiddenMutationParams, ISetColVisibleMutationParams, ISetRowHiddenMutationParams, ISetRowVisibleMutationParams, ISetSpecificColsVisibleCommandParams, ISetSpecificRowsVisibleCommandParams, ISetWorksheetActiveOperationParams, ISetWorksheetColWidthMutationParams, ISetWorksheetRowHeightMutationParams, ISetWorksheetRowIsAutoHeightMutationParams } from '@univerjs/sheets';
import type { ISheetDrawing, ISheetDrawingPosition } from '@univerjs/sheets-drawing';
import { Disposable, ICommandService, Inject, IUniverInstanceService, Rectangle } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, DeltaColumnWidthCommand, DeltaRowHeightCommand, getSheetCommandTarget, InsertColCommand, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, InsertRowCommand, MoveColsCommand, MoveRangeCommand, MoveRowsCommand, RemoveColCommand, RemoveRowCommand, SetColHiddenCommand, SetColHiddenMutation, SetColVisibleMutation, SetColWidthCommand, SetRowHeightCommand, SetRowHiddenCommand, SetRowHiddenMutation, SetRowVisibleMutation, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetWorksheetActiveOperation, SetWorksheetColWidthMutation, SetWorksheetRowHeightMutation, SheetInterceptorService } from '@univerjs/sheets';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { attachRangeWithCoord, ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { drawingPositionToTransform, transformToDrawingPosition } from '../basics/transform-position';
import { ClearSheetDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';

enum RangeMoveUndoType {
    deleteLeft,
    deleteUp,
    insertDown,
    insertRight,
}

const UPDATE_COMMANDS = [
    InsertRowCommand.id,
    InsertColCommand.id,
    RemoveRowCommand.id,
    RemoveColCommand.id,

    DeleteRangeMoveLeftCommand.id,
    DeleteRangeMoveUpCommand.id,
    InsertRangeMoveDownCommand.id,
    InsertRangeMoveRightCommand.id,

    DeltaRowHeightCommand.id,
    SetRowHeightCommand.id,
    DeltaColumnWidthCommand.id,
    SetColWidthCommand.id,

    SetRowHiddenCommand.id,
    SetSpecificRowsVisibleCommand.id,
    SetSpecificColsVisibleCommand.id,
    SetColHiddenCommand.id,
    MoveColsCommand.id,
    MoveRowsCommand.id,
    MoveRangeCommand.id,
];

const REFRESH_MUTATIONS = [
    SetRowVisibleMutation.id,
    SetRowHiddenMutation.id,
    SetColVisibleMutation.id,
    SetColHiddenMutation.id,
    SetWorksheetRowHeightMutation.id,
    SetWorksheetColWidthMutation.id,
];

export class SheetDrawingTransformAffectedController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService,
        @Inject(SheetSkeletonManagerService) private readonly _skeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._sheetInterceptorListener();
        this._commandListener();
        this._sheetRefreshListener();
    }

    private _sheetInterceptorListener() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({

                getMutations: (commandInfo) => {
                    if (!UPDATE_COMMANDS.includes(commandInfo.id)) {
                        return { redos: [], undos: [] };
                    }
                    if (commandInfo.params == null) {
                        return { redos: [], undos: [] };
                    }
                    const cId = commandInfo.id;
                    if (cId === InsertRowCommand.id) {
                        return this._moveRowInterceptor(commandInfo.params as IInsertRowCommandParams, 'insert');
                    } else if ([MoveColsCommand.id, MoveRowsCommand.id, MoveRangeCommand.id].includes(cId)) {
                        return this._moveRangeInterceptor(commandInfo.params as IMoveRangeCommandParams);
                    } else if (cId === InsertColCommand.id) {
                        return this._moveColInterceptor(commandInfo.params as IInsertColCommandParams, 'insert');
                    } else if (cId === RemoveRowCommand.id) {
                        return this._moveRowInterceptor(commandInfo.params as IRemoveRowColCommandParams, 'remove');
                    } else if (cId === RemoveColCommand.id) {
                        return this._moveColInterceptor(commandInfo.params as IRemoveRowColCommandParams, 'remove');
                    } else if (cId === DeleteRangeMoveLeftCommand.id) {
                        const { range } = commandInfo.params as IRemoveRowColCommandParams;
                        return this._getRangeMoveUndo(range, RangeMoveUndoType.deleteLeft);
                    } else if (cId === DeleteRangeMoveUpCommand.id) {
                        const { range } = commandInfo.params as IRemoveRowColCommandParams;
                        return this._getRangeMoveUndo(range, RangeMoveUndoType.deleteUp);
                    } else if (cId === InsertRangeMoveDownCommand.id) {
                        const { range } = commandInfo.params as IRemoveRowColCommandParams;
                        return this._getRangeMoveUndo(range, RangeMoveUndoType.insertDown);
                    } else if (cId === InsertRangeMoveRightCommand.id) {
                        const { range } = commandInfo.params as IRemoveRowColCommandParams;
                        return this._getRangeMoveUndo(range, RangeMoveUndoType.insertRight);
                    } else if (cId === SetRowHiddenCommand.id || cId === SetSpecificRowsVisibleCommand.id) {
                        const params = commandInfo.params as ISetRowHiddenMutationParams | ISetSpecificRowsVisibleCommandParams;
                        const { unitId, subUnitId, ranges } = params;
                        return this._getDrawingUndoForRowVisible(unitId, subUnitId, ranges);
                    } else if (cId === SetSpecificColsVisibleCommand.id || cId === SetColHiddenCommand.id) {
                        const params = commandInfo.params as ISetSpecificColsVisibleCommandParams | ISetColHiddenMutationParams;
                        const { unitId, subUnitId, ranges } = params;
                        return this._getDrawingUndoForColVisible(unitId, subUnitId, ranges);
                    } else if (cId === DeltaRowHeightCommand.id || cId === SetRowHeightCommand.id || cId === DeltaColumnWidthCommand.id || cId === SetColWidthCommand.id) {
                        const params = commandInfo.params as ISetWorksheetRowHeightMutationParams | ISetWorksheetColWidthMutationParams;
                        const { unitId, subUnitId, ranges } = params;
                        const isRow = cId === DeltaRowHeightCommand.id || cId === SetRowHeightCommand.id;
                        return this._getDrawingUndoForRowAndColSize(unitId, subUnitId, ranges, isRow);
                    }

                    return { redos: [], undos: [] };
                },
            })
        );
    }

    private _getRangeMoveUndo(range: IRange, type: RangeMoveUndoType) {
        const newParams = getSheetCommandTarget(this._univerInstanceService);

        if (newParams == null) {
            return { redos: [], undos: [] };
        }
        const unitId = newParams.unitId;
        const subUnitId = newParams.subUnitId;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);

        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId];

            const { updateDrawings: updateDrawingsPart, deleteDrawings: deleteDrawingsPart } = this._getUpdateOrDeleteDrawings(range, type, drawing);

            updateDrawings.push(...updateDrawingsPart);
            deleteDrawings.push(...deleteDrawingsPart);
        });

        if (updateDrawings.length === 0 && deleteDrawings.length === 0) {
            return { redos: [], undos: [] };
        }

        if (updateDrawings.length > 0) {
            const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
            const { undo, redo, objects } = updateJsonOp;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } });
        }

        if (deleteDrawings.length > 0) {
            const deleteJsonOp = this._sheetDrawingService.getBatchRemoveOp(deleteDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
            const deleteUndo = deleteJsonOp.undo;
            const deleteRedo = deleteJsonOp.redo;
            const deleteObjects = deleteJsonOp.objects;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteRedo, objects: deleteObjects, type: DrawingApplyType.REMOVE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteUndo, objects: deleteObjects, type: DrawingApplyType.INSERT } });
        }

        redos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
        undos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });

        return {
            redos,
            undos,
        };
    }

    private _getUpdateOrDeleteDrawings(range: IRange, type: RangeMoveUndoType, drawing: ISheetDrawing) {
        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        const { sheetTransform, anchorType = SheetDrawingAnchorType.Position, transform, unitId, subUnitId, drawingId } = drawing;
        const { from, to } = sheetTransform;
        const { row: fromRow, column: fromColumn } = from;
        const { row: toRow, column: toColumn } = to;

        if (sheetTransform == null || transform == null) {
            return {
                updateDrawings,
                deleteDrawings,
            };
        }

        const { startRow, endRow, startColumn, endColumn } = range;
        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;

        if (type === RangeMoveUndoType.deleteLeft && fromRow >= startRow && toRow <= endRow) {
            if (fromColumn >= startColumn && toColumn <= endColumn) {
                // delete drawing
                deleteDrawings.push({ unitId, subUnitId, drawingId });
            } else {
                // move drawing left
                const param = this._shrinkCol(sheetTransform, transform, startColumn, endColumn, anchorType);
                newSheetTransform = param?.newSheetTransform;
                newTransform = param?.newTransform;
            }
        } else if (type === RangeMoveUndoType.deleteUp && fromColumn >= startColumn && toColumn <= endColumn) {
            if (fromRow >= startRow && toRow <= endRow) {
                // delete drawing
                deleteDrawings.push({ unitId, subUnitId, drawingId });
            } else {
                // move drawing up
                const param = this._shrinkRow(sheetTransform, transform, startRow, endRow, anchorType);
                newSheetTransform = param?.newSheetTransform;
                newTransform = param?.newTransform;
            }
        } else if (type === RangeMoveUndoType.insertDown) {
            const param = this._expandRow(sheetTransform, transform, startRow, endRow, anchorType);
            newSheetTransform = param?.newSheetTransform;
            newTransform = param?.newTransform;
        } else if (type === RangeMoveUndoType.insertRight) {
            const param = this._expandCol(sheetTransform, transform, startColumn, endColumn, anchorType);
            newSheetTransform = param?.newSheetTransform;
            newTransform = param?.newTransform;
        }

        if (newSheetTransform != null && newTransform != null) {
            const newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
            updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform });
        }

        return { updateDrawings, deleteDrawings };
    }

    private _remainDrawingSize(transform: Nullable<ITransformState>, updateDrawings: ISheetDrawing[], drawing: ISheetDrawing) {
        const newSheetTransform = transformToDrawingPosition({ ...transform }, this._selectionRenderService);
        if (newSheetTransform != null) {
            updateDrawings.push({
                ...drawing,
                sheetTransform: newSheetTransform,
            });
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _getDrawingUndoForColVisible(unitId: string, subUnitId: string, ranges: IRange[]) {
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
        const updateDrawings: ISheetDrawing[] = [];
        const preUpdateDrawings: ISheetDrawing[] = [];
        // eslint-disable-next-line complexity, max-lines-per-function
        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;
            if (anchorType === SheetDrawingAnchorType.None) {
                this._remainDrawingSize(transform, updateDrawings, drawing);
            } else {
                const { from, to } = sheetTransform;
                const { row: fromRow, column: fromColumn } = from;
                const { row: toRow, column: toColumn } = to;
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const { startRow, endRow, startColumn, endColumn } = range;
                    if (toColumn < startColumn) {
                        continue;
                    }
                    if (anchorType === SheetDrawingAnchorType.Position) {
                        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
                        let newTransform: Nullable<ITransformState> = null;
                        if (fromColumn >= startColumn && fromColumn <= endColumn) {
                            const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: fromColumn, endColumn, startRow: from.row, endRow: to.row });
                            if (selectionCell == null) {
                                return;
                            }
                            newTransform = { ...transform, left: selectionCell.startX };
                        }
                        if (newTransform != null) {
                            newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
                            if (newSheetTransform != null && newTransform != null) {
                                updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform });
                                break;
                            }
                        }

                        this._remainDrawingSize(transform, updateDrawings, drawing);

                        continue;
                    }
                    if (fromColumn >= startColumn && toColumn <= endColumn) {
                        continue;
                    }
                    let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
                    let newTransform: Nullable<ITransformState> = null;

                    if (fromColumn >= startColumn && fromColumn <= endColumn) {
                        const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: fromColumn, endColumn, startRow: from.row, endRow: to.row });
                        if (selectionCell == null) {
                            return;
                        }
                        newTransform = {
                            ...transform,
                            left: (selectionCell?.startX || 0),
                            width: (transform?.width || 0) - selectionCell.endX + selectionCell.startX,
                        };
                    } else if (toColumn >= startColumn && toColumn <= endColumn) {
                        const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn, endColumn: toColumn, startRow: from.row, endRow: to.row });
                        if (selectionCell == null) {
                            return;
                        }
                        newTransform = {
                            ...transform,
                            left: selectionCell.startX - (transform?.width || 0),
                        };
                    } else {
                        const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn, endColumn, startRow: from.row, endRow: to.row });
                        if (selectionCell == null) {
                            return;
                        }
                        newTransform = {
                            ...transform,
                            width: (transform?.width || 0) - selectionCell.endX + selectionCell.startX,
                        };
                        newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
                        if (newSheetTransform != null && newTransform != null) {
                            preUpdateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform });
                            break;
                        }
                    }

                    if (newTransform != null) {
                        newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
                    }
                    if (newTransform != null && newSheetTransform != null) {
                        updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform });
                        break;
                    } else {
                        this._remainDrawingSize(transform, updateDrawings, drawing);
                    }
                }
            }
        });

        if (updateDrawings.length === 0 && preUpdateDrawings.length === 0) {
            return { redos: [], undos: [] };
        }

        const { redos, undos } = this._createUndoAndRedoMutation(unitId, subUnitId, updateDrawings);

        const preRedos: IMutationInfo[] = [];
        const preUndos: IMutationInfo[] = [];

        if (preUpdateDrawings.length > 0) {
            const { redos, undos } = this._createUndoAndRedoMutation(unitId, subUnitId, preUpdateDrawings);
            preRedos.push(...redos);
            preUndos.push(...undos);
        }

        return {
            redos,
            undos,
            preRedos,
            preUndos,
        };
    }

    private _createUndoAndRedoMutation(unitId: string, subUnitId: string, updateDrawings: ISheetDrawing[]) {
        const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
        const { undo, redo, objects } = updateJsonOp;
        const redos: IMutationInfo[] = [
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
        ];
        const undos: IMutationInfo[] = [
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
        ];

        return {
            redos,
            undos,
        };
    }

    // eslint-disable-next-line max-lines-per-function
    private _getDrawingUndoForRowVisible(unitId: string, subUnitId: string, ranges: IRange[]) {
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);

        const updateDrawings: ISheetDrawing[] = [];
        const preUpdateDrawings: ISheetDrawing[] = [];
        // eslint-disable-next-line complexity, max-lines-per-function
        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;
            if (anchorType === SheetDrawingAnchorType.None) {
                this._remainDrawingSize(transform, updateDrawings, drawing);
            } else {
                const { from, to } = sheetTransform;
                const { row: fromRow, column: fromColumn } = from;
                const { row: toRow, column: toColumn } = to;
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const { startRow, endRow, startColumn, endColumn } = range;
                    if (toRow < startRow) {
                        continue;
                    }
                    if (anchorType === SheetDrawingAnchorType.Position) {
                        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
                        let newTransform: Nullable<ITransformState> = null;
                        if (fromRow >= startRow && fromRow <= endRow) {
                            const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: from.column, endColumn: to.column, startRow: fromRow, endRow });
                            if (selectionCell == null) {
                                return;
                            }
                            newTransform = { ...transform, top: selectionCell.startY };
                        }
                        if (newTransform != null) {
                            newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
                            if (newSheetTransform != null && newTransform != null) {
                                updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform });
                                break;
                            }
                        }

                        this._remainDrawingSize(transform, updateDrawings, drawing);

                        continue;
                    }
                    if (fromRow >= startRow && toRow <= endRow) {
                        continue;
                    }
                    let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
                    let newTransform: Nullable<ITransformState> = null;

                    if (fromRow >= startRow && fromRow <= endRow) {
                        const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: from.column, endColumn: to.column, startRow: fromRow, endRow });
                        if (selectionCell == null) {
                            return;
                        }
                        newTransform = {
                            ...transform,
                            top: (selectionCell?.startY || 0),
                            height: (transform?.height || 0) - selectionCell.endY + selectionCell.startY,
                        };
                    } else if (toRow >= startRow && toRow <= endRow) {
                        const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: from.column, endColumn: to.column, startRow, endRow: toRow });
                        if (selectionCell == null) {
                            return;
                        }
                        newTransform = {
                            ...transform,
                            top: selectionCell.startY - (transform?.height || 0),
                        };
                    } else {
                        const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: from.column, endColumn: to.column, startRow, endRow });
                        if (selectionCell == null) {
                            return;
                        }
                        newTransform = {
                            ...transform,
                            height: (transform?.height || 0) - selectionCell.endY + selectionCell.startY,
                        };
                        newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
                        if (newSheetTransform != null && newTransform != null) {
                            preUpdateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform });
                            break;
                        }
                    }

                    if (newTransform != null) {
                        newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
                    }
                    if (newTransform != null && newSheetTransform != null) {
                        updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform });
                        break;
                    } else {
                        this._remainDrawingSize(transform, updateDrawings, drawing);
                    }
                }
            }
        });

        if (updateDrawings.length === 0 && preUpdateDrawings.length === 0) {
            return { redos: [], undos: [] };
        }

        const { redos, undos } = this._createUndoAndRedoMutation(unitId, subUnitId, updateDrawings);

        const preRedos: IMutationInfo[] = [];
        const preUndos: IMutationInfo[] = [];

        if (preUpdateDrawings.length > 0) {
            const { redos, undos } = this._createUndoAndRedoMutation(unitId, subUnitId, preUpdateDrawings);
            preRedos.push(...redos);
            preUndos.push(...undos);
        }

        return {
            redos,
            undos,
            preRedos,
            preUndos,
        };
    }

    private _getDrawingUndoForRowAndColSize(unitId: string, subUnitId: string, ranges: IRange[], isRow: boolean) {
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);

        const updateDrawings: ISheetDrawing[] = [];

        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;
            if (anchorType === SheetDrawingAnchorType.None) {
                this._remainDrawingSize(transform, updateDrawings, drawing);
            } else {
                const { from, to } = sheetTransform;
                const { row: fromRow, column: fromColumn } = from;
                const { row: toRow, column: toColumn } = to;
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const { startRow, endRow, startColumn, endColumn } = range;

                    if (toRow < startRow || toColumn < startColumn) {
                        continue;
                    }

                    if (anchorType === SheetDrawingAnchorType.Position) {
                        if ((fromRow <= startRow && toRow >= endRow) || (fromColumn <= startColumn && toColumn >= endColumn)) {
                            this._remainDrawingSize(transform, updateDrawings, drawing);
                            continue;
                        }
                    }

                    const newTransform = drawingPositionToTransform({ ...sheetTransform }, this._selectionRenderService, this._skeletonManagerService);
                    if (newTransform != null) {
                        updateDrawings.push({
                            ...drawing,
                            transform: newTransform,
                        });
                        break;
                    }
                }
            }
        });

        if (updateDrawings.length === 0) {
            return { redos: [], undos: [] };
        }

        return this._createUndoAndRedoMutation(unitId, subUnitId, updateDrawings);
    }

    private _getUnitIdAndSubUnitId(params: IInsertRowCommandParams | IRemoveRowColCommandParams, type: 'insert' | 'remove') {
        let unitId: string;
        let subUnitId: string;
        if (type === 'insert') {
            unitId = (params as IInsertRowCommandParams).unitId;
            subUnitId = (params as IInsertRowCommandParams).subUnitId;
        } else {
            const newParams = getSheetCommandTarget(this._univerInstanceService);
            if (newParams == null) {
                return;
            }
            unitId = newParams.unitId;
            subUnitId = newParams.subUnitId;
        }

        return { unitId, subUnitId };
    }

    private _moveRangeInterceptor(params: IMoveRangeCommandParams | IMoveRowsCommandParams | IMoveColsCommandParams) {
        const { toRange, fromRange } = params;
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId } = target;

        const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService)?.getCurrentSkeleton();
        if (!skeleton) {
            return { redos: [], undos: [] };
        }

        const selectionRect = attachRangeWithCoord(skeleton, fromRange);
        if (!selectionRect) {
            return { redos: [], undos: [] };
        }

        const { startX, endX, startY, endY } = selectionRect;
        const drawings = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
        const containedDrawings: ISheetDrawing[] = [];

        Object.keys(drawings).forEach((drawingId) => {
            const drawing = drawings[drawingId];
            if (drawing.anchorType !== SheetDrawingAnchorType.Both) {
                return;
            }
            const { transform } = drawing;

            if (!transform) {
                return;
            }

            const { left = 0, top = 0, width = 0, height = 0 } = transform;
            const { drawingStartX, drawingEndX, drawingStartY, drawingEndY } = {
                drawingStartX: left,
                drawingEndX: left + width,
                drawingStartY: top,
                drawingEndY: top + height,
            };

            if (startX <= drawingStartX && drawingEndX <= endX && startY <= drawingStartY && drawingEndY <= endY) {
                containedDrawings.push(drawing);
            }
        });

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const rowOffset = toRange.startRow - fromRange.startRow;
        const colOffset = toRange.startColumn - fromRange.startColumn;

        const updateDrawings = containedDrawings.map((drawing) => {
            const oldSheetTransform = drawing.sheetTransform;
            const sheetTransform = {
                to: { ...oldSheetTransform.to, row: oldSheetTransform.to.row + rowOffset, column: oldSheetTransform.to.column + colOffset },
                from: { ...oldSheetTransform.from, row: oldSheetTransform.from.row + rowOffset, column: oldSheetTransform.from.column + colOffset },
            };
            const transform = drawingPositionToTransform(sheetTransform, this._selectionRenderService, this._skeletonManagerService);
            const params = {
                unitId,
                subUnitId,
                drawingId: drawing.drawingId,
                transform,
                sheetTransform,
            };

            return params;
        });
        if (updateDrawings.length) {
            // redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } });
            // undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } });
            // const params = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform };

            const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
            const { undo, redo, objects } = updateJsonOp;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } });
            // updateDrawings.push(params);
            // this._copyInfo = {
            //     drawings: containedDrawings,
            //     unitId,
            //     subUnitId,
            // };
        }

        // console.log(params, '_moveRangeInterceptor')
        return { redos, undos };
    }

    private _moveRowInterceptor(params: IInsertRowCommandParams | IRemoveRowColCommandParams, type: 'insert' | 'remove') {
        const ids = this._getUnitIdAndSubUnitId(params, type);
        if (ids == null) {
            return { redos: [], undos: [] };
        }
        const { unitId, subUnitId } = ids;
        const { range } = params;

        const rowStartIndex = range.startRow;
        const rowEndIndex = range.endRow;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const data = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        Object.keys(data).forEach((drawingId) => {
            const drawing = data[drawingId];
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;

            if (sheetTransform == null || transform == null) {
                return;
            }
            let newSheetTransform: Nullable<ISheetDrawingPosition>;
            let newTransform: Nullable<ITransformState>;
            if (type === 'insert') {
                const param = this._expandRow(sheetTransform, transform, rowStartIndex, rowEndIndex, anchorType);
                newSheetTransform = param?.newSheetTransform;
                newTransform = param?.newTransform;
            } else {
                const { from, to } = sheetTransform;
                const { row: fromRow } = from;
                const { row: toRow } = to;
                if (anchorType === SheetDrawingAnchorType.Both && fromRow >= rowStartIndex && toRow <= rowEndIndex) {
                    // delete drawing
                    deleteDrawings.push({ unitId, subUnitId, drawingId });
                } else {
                    const param = this._shrinkRow(sheetTransform, transform, rowStartIndex, rowEndIndex, anchorType);
                    newSheetTransform = param?.newSheetTransform;
                    newTransform = param?.newTransform;
                }
            }
            if (!newSheetTransform || !newTransform) {
                return;
            }
            const params = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform };
            updateDrawings.push(params);
        });

        if (updateDrawings.length === 0 && deleteDrawings.length === 0) {
            return { redos: [], undos: [] };
        }

        if (updateDrawings.length > 0) {
            const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
            const { undo, redo, objects } = updateJsonOp;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } });
        }

        if (deleteDrawings.length > 0) {
            const deleteJsonOp = this._sheetDrawingService.getBatchRemoveOp(deleteDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
            const deleteUndo = deleteJsonOp.undo;
            const deleteRedo = deleteJsonOp.redo;
            const deleteObjects = deleteJsonOp.objects;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteRedo, objects: deleteObjects, type: DrawingApplyType.REMOVE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteUndo, objects: deleteObjects, type: DrawingApplyType.INSERT } });
        }

        redos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
        undos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });

        return {
            redos,
            undos,
        };
    }

    private _moveColInterceptor(params: IInsertColCommandParams | IRemoveRowColCommandParams, type: 'insert' | 'remove') {
        const ids = this._getUnitIdAndSubUnitId(params, type);
        if (ids == null) {
            return { redos: [], undos: [] };
        }
        const { unitId, subUnitId } = ids;
        const { range } = params;

        const colStartIndex = range.startColumn;
        const colEndIndex = range.endColumn;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const data = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        Object.keys(data).forEach((drawingId) => {
            const drawing = data[drawingId];
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;

            if (sheetTransform == null || transform == null) {
                return;
            }
            let newSheetTransform: Nullable<ISheetDrawingPosition>;
            let newTransform: Nullable<ITransformState>;
            if (type === 'insert') {
                const param = this._expandCol(sheetTransform, transform, colStartIndex, colEndIndex, anchorType);
                newSheetTransform = param?.newSheetTransform;
                newTransform = param?.newTransform;
            } else {
                const { from, to } = sheetTransform;
                const { column: fromColumn } = from;
                const { column: toColumn } = to;
                if (anchorType === SheetDrawingAnchorType.Both && fromColumn >= colStartIndex && toColumn <= colEndIndex) {
                    // delete drawing
                    deleteDrawings.push({ unitId, subUnitId, drawingId });
                } else {
                    const param = this._shrinkCol(sheetTransform, transform, colStartIndex, colEndIndex, anchorType);
                    newSheetTransform = param?.newSheetTransform;
                    newTransform = param?.newTransform;
                }
            }

            if (!newSheetTransform || !newTransform) {
                return;
            }

            const params = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform };
            updateDrawings.push(params);
        });

        if (updateDrawings.length === 0 && deleteDrawings.length === 0) {
            return { redos: [], undos: [] };
        }

        if (updateDrawings.length > 0) {
            const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
            const { undo, redo, objects } = updateJsonOp;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } });
        }

        if (deleteDrawings.length > 0) {
            const deleteJsonOp = this._sheetDrawingService.getBatchRemoveOp(deleteDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
            const deleteUndo = deleteJsonOp.undo;
            const deleteRedo = deleteJsonOp.redo;
            const deleteObjects = deleteJsonOp.objects;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteRedo, objects: deleteObjects, type: DrawingApplyType.REMOVE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteUndo, objects: deleteObjects, type: DrawingApplyType.INSERT } });
        }

        redos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
        undos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });

        return { redos, undos };
    }

    private _expandCol(sheetTransform: ISheetDrawingPosition, transform: ITransformState, colStartIndex: number, colEndIndex: number, anchorType = SheetDrawingAnchorType.Position) {
        const colCount = colEndIndex - colStartIndex + 1;

        const { from, to } = sheetTransform;

        const { column: fromColumn } = from;
        const { column: toColumn } = to;

        if (anchorType === SheetDrawingAnchorType.None) {
            return {
                newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                newTransform: transform,
            };
        }

        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;

        if (fromColumn >= colStartIndex) {
            // move start and end col right
            // newSheetTransform = {
            //     from: { ...from, column: fromColumn + colCount },
            //     to: { ...to, column: toColumn + colCount },
            // };
            // newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);

            const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: colStartIndex, endColumn: colEndIndex, startRow: from.row, endRow: to.row });
            if (selectionCell == null) {
                return;
            }
            newTransform = { ...transform, left: (transform.left || 0) + selectionCell.endX - selectionCell.startX };
            newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
        } else if (toColumn >= colEndIndex) {
            // move end right only
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from },
                    to: { ...to, column: toColumn + colCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                    newTransform: transform,
                };
            }
        }

        if (newSheetTransform != null && newTransform != null) {
            return {
                newSheetTransform,
                newTransform,
            };
        }

        return null;
    }

    private _shrinkCol(sheetTransform: ISheetDrawingPosition, transform: ITransformState, colStartIndex: number, colEndIndex: number, anchorType = SheetDrawingAnchorType.Position) {
        const colCount = colEndIndex - colStartIndex + 1;
        const { from, to } = sheetTransform;
        const { column: fromColumn } = from;
        const { column: toColumn } = to;
        if (anchorType === SheetDrawingAnchorType.None) {
            return {
                newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                newTransform: transform,
            };
        }
        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;

        if (fromColumn > colEndIndex) {
            // shrink start and end col left only
            newSheetTransform = {
                from: { ...from, column: fromColumn - colCount },
                to: { ...to, column: toColumn - colCount },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
        } else if (fromColumn >= colStartIndex && toColumn <= colEndIndex) {
            // delete drawing
            return null;
        } else if (fromColumn < colStartIndex && toColumn > colEndIndex) {
            // shrink end left only
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from },
                    to: { ...to, column: toColumn - colCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                    newTransform: transform,
                };
            }
        } else if (fromColumn >= colStartIndex && fromColumn <= colEndIndex) {
            if (fromColumn === colStartIndex) {
                newTransform = { ...transform, left: (transform.left || 0) - sheetTransform.from.columnOffset };
            } else {
                const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: colStartIndex, endColumn: fromColumn - 1, startRow: from.row, endRow: to.row });
                if (selectionCell == null) {
                    return;
                }
                newTransform = { ...transform, left: (transform.left || 0) - selectionCell.endX + selectionCell.startX - sheetTransform.from.columnOffset };
            }
            newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
        } else if (toColumn >= colStartIndex && toColumn <= colEndIndex && anchorType === SheetDrawingAnchorType.Both) {
            // shrink end col left, then set toColOffset to full cell width
            const selectionCell = this._skeletonManagerService.attachRangeWithCoord({
                startColumn: colStartIndex - 1,
                endColumn: colStartIndex - 1,
                startRow: from.row,
                endRow: to.row,
            });

            if (selectionCell == null) {
                return;
            }
            newSheetTransform = {
                from: { ...from },
                to: { ...to, column: colStartIndex - 1, columnOffset: selectionCell.endX - selectionCell.startX },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
        }

        if (newSheetTransform != null && newTransform != null) {
            return {
                newSheetTransform,
                newTransform,
            };
        }

        return null;
    }

    private _expandRow(sheetTransform: ISheetDrawingPosition, transform: ITransformState, rowStartIndex: number, rowEndIndex: number, anchorType = SheetDrawingAnchorType.Position) {
        const rowCount = rowEndIndex - rowStartIndex + 1;

        const { from, to } = sheetTransform;

        const { row: fromRow } = from;
        const { row: toRow } = to;

        if (anchorType === SheetDrawingAnchorType.None) {
            return {
                newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                newTransform: transform,
            };
        }

        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;

        if (fromRow >= rowStartIndex) {
            // move start and end row down
            const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startRow: rowStartIndex, endRow: rowEndIndex, startColumn: from.column, endColumn: to.column });
            if (selectionCell == null) {
                return;
            }
            newTransform = { ...transform, top: (transform.top || 0) + selectionCell.endY - selectionCell.startY };
            newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
        } else if (toRow >= rowEndIndex) {
            // move end down only
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from },
                    to: {
                        ...to,
                        row: toRow + rowCount,
                    },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                    newTransform: transform,
                };
            }
        }

        if (newSheetTransform != null && newTransform != null) {
            return {
                newSheetTransform,
                newTransform,
            };
        }

        return null;
    }

    private _shrinkRow(sheetTransform: ISheetDrawingPosition, transform: ITransformState, rowStartIndex: number, rowEndIndex: number, anchorType = SheetDrawingAnchorType.Position) {
        const rowCount = rowEndIndex - rowStartIndex + 1;

        const { from, to } = sheetTransform;

        const { row: fromRow } = from;
        const { row: toRow } = to;

        if (anchorType === SheetDrawingAnchorType.None) {
            return {
                newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                newTransform: transform,
            };
        }

        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;

        if (fromRow > rowEndIndex) {
            // shrink start and end up only
            newSheetTransform = {
                from: { ...from, row: fromRow - rowCount },
                to: { ...to, row: toRow - rowCount },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
        } else if (fromRow >= rowStartIndex && toRow <= rowEndIndex) {
            // delete drawing
            return null;
        } else if (fromRow < rowStartIndex && toRow > rowEndIndex) {
            // shrink end up only
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from },
                    to: { ...to, row: toRow - rowCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                    newTransform: transform,
                };
            }
        } else if (fromRow >= rowStartIndex && fromRow <= rowEndIndex) {
            // shrink start and end row up, then set fromRowOffset to 0
            if (fromRow === rowStartIndex) {
                newTransform = { ...transform, top: (transform.top || 0) - sheetTransform.from.rowOffset };
            } else {
                const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startRow: rowStartIndex, endRow: fromRow - 1, startColumn: from.column, endColumn: to.column });
                if (selectionCell == null) {
                    return;
                }
                newTransform = { ...transform, top: (transform.top || 0) - selectionCell.endY + selectionCell.startY - sheetTransform.from.rowOffset };
            }
            newSheetTransform = transformToDrawingPosition(newTransform, this._selectionRenderService);
        } else if (toRow >= rowStartIndex && toRow <= rowEndIndex && anchorType === SheetDrawingAnchorType.Both) {
            // shrink end row up, then set toRowOffset to full cell height
            const selectionCell = this._skeletonManagerService.attachRangeWithCoord({ startColumn: from.column, endColumn: from.column, startRow: rowStartIndex - 1, endRow: rowStartIndex - 1 });

            if (selectionCell == null) {
                return;
            }
            newSheetTransform = {
                from: { ...from },
                to: { ...to, row: rowStartIndex - 1, rowOffset: selectionCell.endY - selectionCell.startY },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService, this._skeletonManagerService);
        }

        if (newSheetTransform != null && newTransform != null) {
            return {
                newSheetTransform,
                newTransform,
            };
        }

        return null;
    }

    private _commandListener() {
        this.disposeWithMe(
            // TODO@weird94: this should subscribe to the command service
            // but the skeleton changes like other render modules. These two signals are not equivalent.
            // As a temp solution, I subscribed to activate$ here.
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetActiveOperation.id) {
                    const { unitId, subUnitId } = command.params as ISetWorksheetActiveOperationParams;
                    this._updateDrawings(unitId, subUnitId);
                }
            })
        );

        this.disposeWithMe(
            this._context.activated$.subscribe((activated) => {
                const { unit, unitId } = this._context;
                if (activated) {
                    const subUnitId = unit.getActiveSheet().getSheetId();
                    this._updateDrawings(unitId, subUnitId);
                } else {
                    // Better, dispose the command service listener here.
                    this._clearDrawings(unitId);
                }
            })
        );
    }

    private _clearDrawings(selfUnitId: string): void {
        setTimeout(() => {
            const drawingMap = this._drawingManagerService.drawingManagerData;
            const removeDrawings: IDrawingParam[] = [];

            // TODO@weird94: should add a iterating function
            Object.keys(drawingMap).forEach((unitId) => {
                const subUnitMap = drawingMap[unitId];
                if (subUnitMap == null) {
                    return;
                }

                Object.keys(subUnitMap).forEach((subUnitId) => {
                    const drawingData = subUnitMap[subUnitId].data;
                    if (drawingData == null) {
                        return;
                    }

                    Object.keys(drawingData).forEach((drawingId) => {
                        if (unitId === selfUnitId) {
                            removeDrawings.push(drawingData[drawingId]);
                        }
                    });
                });
            });

            this._drawingManagerService.removeNotification(removeDrawings);
        });
    }

    private _updateDrawings(showUnitId: string, showSubunitId: string): void {
        // TODO@weird94: remove the setTimeout here
        setTimeout(() => {
            const drawingMap = this._drawingManagerService.drawingManagerData;
            const insertDrawings: IDrawingParam[] = [];
            const removeDrawings: IDrawingParam[] = [];

            Object.keys(drawingMap).forEach((unitId) => {
                const subUnitMap = drawingMap[unitId];
                if (subUnitMap == null) {
                    return;
                }
                Object.keys(subUnitMap).forEach((subUnitId) => {
                    const drawingData = subUnitMap[subUnitId].data;
                    if (drawingData == null) {
                        return;
                    }
                    Object.keys(drawingData).forEach((drawingId) => {
                        if (unitId === showUnitId && subUnitId === showSubunitId) {
                            const drawing = drawingData[drawingId] as ISheetDrawing;
                            drawing.transform = drawingPositionToTransform(drawing.sheetTransform, this._selectionRenderService, this._skeletonManagerService);
                            insertDrawings.push(drawingData[drawingId]);
                        } else {
                            removeDrawings.push(drawingData[drawingId]);
                        }
                    });
                });
            });

            this._drawingManagerService.removeNotification(removeDrawings);
            this._drawingManagerService.addNotification(insertDrawings);
        }, 0);
    }

    private _sheetRefreshListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!REFRESH_MUTATIONS.includes(command.id)) {
                    return;
                }

                requestIdleCallback(() => {
                    const params = command.params as ISetRowVisibleMutationParams | ISetColHiddenMutationParams | ISetWorksheetRowHeightMutationParams | ISetWorksheetColWidthMutationParams | ISetWorksheetRowIsAutoHeightMutationParams | ISetRowHiddenMutationParams | ISetColVisibleMutationParams;
                    const { unitId, subUnitId, ranges } = params;
                    this._refreshDrawingTransform(unitId, subUnitId, ranges);
                });
            })
        );
    }

    private _refreshDrawingTransform(unitId: string, subUnitId: string, ranges: IRange[]) {
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);

        const updateDrawings: ISheetDrawing[] = [];

        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;
            if (anchorType === SheetDrawingAnchorType.None) {
                return true;
            }

            const { from, to } = sheetTransform;
            const { row: fromRow, column: fromColumn } = from;
            const { row: toRow, column: toColumn } = to;
            for (let i = 0; i < ranges.length; i++) {
                const range = ranges[i];
                const { startRow, endRow, startColumn, endColumn } = range;
                if (Rectangle.intersects(
                    {
                        startRow,
                        endRow,
                        startColumn,
                        endColumn,
                    },
                    {
                        startRow: fromRow,
                        endRow: toRow,
                        startColumn: fromColumn,
                        endColumn: toColumn,
                    }
                ) || fromRow > endRow || fromColumn > endColumn) {
                    const isPositionAnchor = anchorType === SheetDrawingAnchorType.Position;
                    const newTransform = drawingPositionToTransform(sheetTransform, this._selectionRenderService, this._skeletonManagerService);
                    updateDrawings.push({
                        ...drawing,
                        transform: {
                            ...newTransform,
                            width: isPositionAnchor ? transform?.width : newTransform?.width,
                            height: isPositionAnchor ? transform?.height : newTransform?.height,
                        },
                    });
                    break;
                }
            }
        });

        if (updateDrawings.length === 0) {
            return;
        }

        this._drawingManagerService.refreshTransform(updateDrawings);

        this._commandService.syncExecuteCommand(ClearSheetDrawingTransformerOperation.id, [unitId]);
    }
}
