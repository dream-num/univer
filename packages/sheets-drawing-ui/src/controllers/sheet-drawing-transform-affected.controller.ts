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

import type { ICommandInfo, IDrawingParam, IMutationInfo, IRange, ITransformState, Nullable } from '@univerjs/core';
import { Disposable, ICommandService, IDrawingManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IInsertColCommandParams, IInsertRowCommandParams, IRemoveRowColCommandParams, ISetColHiddenMutationParams, ISetRowHiddenMutationParams, ISetSpecificColsVisibleCommandParams, ISetSpecificRowsVisibleCommandParams, ISetWorksheetActiveOperationParams, ISetWorksheetColWidthMutationParams, ISetWorksheetRowHeightMutationParams, ISheetDrawing, ISheetDrawingPosition } from '@univerjs/sheets';
import { DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, DeltaColumnWidthCommand, DeltaRowHeightCommand, DrawingApplyType, getSheetCommandTarget, InsertColCommand, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, InsertRowCommand, ISheetDrawingService, RemoveColCommand, RemoveRowCommand, SetColHiddenCommand, SetColWidthCommand, SetDrawingApplyMutation, SetRowHeightCommand, SetRowHiddenCommand, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetWorksheetActiveOperation, SheetDrawingAnchorType, SheetInterceptorService } from '@univerjs/sheets';
import { ISelectionRenderService } from '@univerjs/sheets-ui';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import { ClearSheetDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';
import { drawingPositionToTransform, transformToDrawingPosition } from '../basics/transform-position';

enum RangeMoveUndoType {
    deleteLeft,
    deleteUp,
    insertDown,
    insertRight,
}

@OnLifecycle(LifecycleStages.Rendered, SheetDrawingTransformAffectedController)
export class SheetDrawingTransformAffectedController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._sheetInterceptorListener();

        this._commandListener();

        // this._sheetRefreshListener();
    }

    private _sheetInterceptorListener() {
        const updateMutations = [
            InsertRowCommand.id,
            InsertColCommand.id,
            RemoveRowCommand.id,
            RemoveColCommand.id,

            DeleteRangeMoveLeftCommand.id,
            DeleteRangeMoveUpCommand.id,
            InsertRangeMoveDownCommand.id,
            InsertRangeMoveRightCommand.id,

            SetRowHiddenCommand.id,
            SetSpecificRowsVisibleCommand.id,
            SetSpecificColsVisibleCommand.id,
            SetColHiddenCommand.id,
            DeltaRowHeightCommand.id,
            SetRowHeightCommand.id,
            DeltaColumnWidthCommand.id,
            SetColWidthCommand.id,

        ];
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    if (!updateMutations.includes(commandInfo.id)) {
                        return { redos: [], undos: [] };
                    }

                    if (commandInfo.params == null) {
                        return { redos: [], undos: [] };
                    }

                    const cId = commandInfo.id;

                    if (cId === InsertRowCommand.id) {
                        return this._moveRowInterceptor(commandInfo.params as IInsertRowCommandParams, 'insert');
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
                    } else {
                        const params = commandInfo.params as ISetRowHiddenMutationParams | ISetSpecificRowsVisibleCommandParams | ISetSpecificColsVisibleCommandParams | ISetColHiddenMutationParams | ISetWorksheetRowHeightMutationParams | ISetWorksheetColWidthMutationParams;
                        const { unitId, subUnitId, ranges } = params;
                        return this._getDrawingUndoForRowAndColSize(unitId, subUnitId, ranges);
                    }
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
            const newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
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

    private _getDrawingUndoForRowAndColSize(unitId: string, subUnitId: string, ranges: IRange[]) {
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

                    const newTransform = drawingPositionToTransform({ ...sheetTransform }, this._selectionRenderService);
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
                if (fromRow <= rowStartIndex && toRow <= rowEndIndex) {
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
                if (fromColumn <= colStartIndex && toColumn <= colEndIndex) {
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
            newSheetTransform = {
                from: { ...from, column: fromColumn + colCount },
                to: { ...to, column: toColumn + colCount },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
        } else if (toColumn >= colEndIndex) {
            // move end right only
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from },
                    to: { ...to, column: toColumn + colCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
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
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
        } else if (fromColumn <= colStartIndex && toColumn <= colEndIndex) {
            // delete drawing
            return null;
        } else if (fromColumn < colStartIndex && toColumn > colEndIndex) {
            // shrink end left only
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from },
                    to: { ...to, column: toColumn - colCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                    newTransform: transform,
                };
            }
        } else if (fromColumn >= colStartIndex && fromColumn <= colEndIndex) {
            // shrink start and end col left, then set fromColOffset to 0
            newSheetTransform = {
                from: { ...from, column: colStartIndex, columnOffset: 0 },
                to: { ...to, column: toColumn - colEndIndex },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
        } else if (toColumn >= colStartIndex && toColumn <= colEndIndex) {
            // shrink end col left, then set toColOffset to full cell width
            const selectionCell = this._selectionRenderService.attachRangeWithCoord({
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
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
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
            newSheetTransform = {
                from: {
                    ...from,
                    row: fromRow + rowCount,
                },
                to: {
                    ...to,
                    row: toRow + rowCount,
                },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
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
                newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
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
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
        } else if (fromRow <= rowStartIndex && toRow <= rowEndIndex) {
            // delete drawing
            return null;
        } else if (fromRow < rowStartIndex && toRow > rowEndIndex) {
            // shrink end up only
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from },
                    to: { ...to, row: toRow - rowCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, this._selectionRenderService),
                    newTransform: transform,
                };
            }
        } else if (fromRow >= rowStartIndex && fromRow <= rowEndIndex) {
           // shrink start and end row up, then set fromRowOffset to 0
            newSheetTransform = {
                from: { ...from, row: rowStartIndex, rowOffset: 0 },
                to: { ...to, row: toRow - rowEndIndex },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
        } else if (toRow >= rowStartIndex && toRow <= rowEndIndex) {
            // shrink end row up, then set toRowOffset to full cell height
            const selectionCell = this._selectionRenderService.attachRangeWithCoord({
                startColumn: from.column,
                endColumn: from.column,
                startRow: rowStartIndex - 1,
                endRow: rowStartIndex - 1,
            });

            if (selectionCell == null) {
                return;
            }
            newSheetTransform = {
                from: { ...from },
                to: { ...to, row: rowStartIndex - 1, rowOffset: selectionCell.endY - selectionCell.startY },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, this._selectionRenderService);
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
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetActiveOperation.id) {
                    const params = command.params as ISetWorksheetActiveOperationParams;
                    const { unitId: showUnitId, subUnitId: showSubunitId } = params;

                    const drawingMap = this._drawingManagerService.drawingManagerData;

                    const insertDrawings: IDrawingParam[] = [];

                    const removeDrawings: IDrawingParam[] = [];

                    Object.keys(drawingMap).forEach((unitId) => {
                        const subUnitMap = drawingMap[unitId];
                        Object.keys(subUnitMap).forEach((subUnitId) => {
                            const drawingData = subUnitMap[subUnitId].data;
                            if (drawingData == null) {
                                return;
                            }
                            Object.keys(drawingData).forEach((drawingId) => {
                                if (unitId === showUnitId && subUnitId === showSubunitId) {
                                    insertDrawings.push(drawingData[drawingId]);
                                } else {
                                    removeDrawings.push(drawingData[drawingId]);
                                }
                            });
                        });
                    });

                    this._drawingManagerService.removeNotification(removeDrawings);
                    this._drawingManagerService.addNotification(insertDrawings);
                }
            })
        );
    }

    // private _sheetRefreshListener() {
        // const updateMutations = [
        //     SetRowVisibleMutation.id,
        //     SetRowHiddenMutation.id,
        //     SetColVisibleMutation.id,
        //     SetColHiddenMutation.id,
        //     SetWorksheetRowHeightMutation.id,
        //     SetWorksheetColWidthMutation.id,
        // ];
        // this.disposeWithMe(
        //     this._commandService.onCommandExecuted((command: ICommandInfo) => {
        //         if (!updateMutations.includes(command.id)) {
        //             return;
        //         }

        //         const params = command.params as ISetRowVisibleMutationParams | ISetColHiddenMutationParams | ISetWorksheetRowHeightMutationParams | ISetWorksheetColWidthMutationParams | ISetWorksheetRowIsAutoHeightMutationParams | ISetRowHiddenMutationParams | ISetColVisibleMutationParams | ISetWorksheetColWidthMutationParams;
        //         const { unitId, subUnitId, ranges } = params;
        //         this._refreshDrawingTransform(unitId, subUnitId, ranges);
        //     })
        // );
    // }

    // private _refreshDrawingTransform(unitId: string, subUnitId: string, ranges: IRange[]) {
    //     const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);

    //     const updateDrawings: ISheetDrawing[] = [];

    //     Object.keys(drawingData).forEach((drawingId) => {
    //         const drawing = drawingData[drawingId] as ISheetDrawing;
    //         const { sheetTransform, anchorType = SheetDrawingAnchorType.Position } = drawing;
    //         if (anchorType === SheetDrawingAnchorType.None) {
    //             return true;
    //         }

    //         const { from, to } = sheetTransform;
    //         const { row: fromRow, column: fromColumn } = from;
    //         const { row: toRow, column: toColumn } = to;
    //         for (let i = 0; i < ranges.length; i++) {
    //             const range = ranges[i];
    //             const { startRow, endRow, startColumn, endColumn } = range;
    //             if (Rectangle.intersects(
    //                 {
    //                     startRow, endRow, startColumn, endColumn,
    //                 },
    //                 {
    //                     startRow: fromRow, endRow: toRow, startColumn: fromColumn, endColumn: toColumn,
    //                 }
    //             ) || fromRow > endRow || fromColumn > endColumn) {
    //                 updateDrawings.push({
    //                     ...drawing,
    //                     transform: drawingPositionToTransform(sheetTransform, this._selectionRenderService),
    //                 });
    //                 break;
    //             }
    //         }
    //     });

    //     if (updateDrawings.length === 0) {
    //         return;
    //     }

    //     this._drawingManagerService.refreshTransform(updateDrawings);
    // }
}
