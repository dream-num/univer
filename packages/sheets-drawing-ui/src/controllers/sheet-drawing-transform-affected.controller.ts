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
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type {
    IDeleteRangeMoveLeftCommandParams,
    IDeleteRangeMoveUpCommandParams,
    IDeltaColumnWidthCommandParams,
    IDeltaRowHeightCommandParams,
    IInsertColCommandParams,
    IInsertRangeMoveDownCommandParams,
    IInsertRangeMoveRightCommandParams,
    IInsertRowCommandParams,
    IMoveColsCommandParams,
    IMoveRangeCommandParams,
    IMoveRowsCommandParams,
    IRemoveRowColCommandParams,
    ISetColHiddenCommandParams,
    ISetColHiddenMutationParams,
    ISetColVisibleMutationParams,
    ISetColWidthCommandParams,
    ISetRowHeightCommandParams,
    ISetRowHiddenCommandParams,
    ISetRowHiddenMutationParams,
    ISetRowVisibleMutationParams,
    ISetSpecificColsVisibleCommandParams,
    ISetSpecificRowsVisibleCommandParams,
    ISetWorksheetActiveOperationParams,
    ISetWorksheetColWidthMutationParams,
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
    ISheetSkeletonManagerParam,
} from '@univerjs/sheets';
import type { ISheetDrawing, ISheetDrawingPosition } from '@univerjs/sheets-drawing';
import { Disposable, ICommandService, Inject, IUniverInstanceService, RANGE_TYPE, Rectangle } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import {
    attachRangeWithCoord,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    DeltaColumnWidthCommand,
    DeltaRowHeightCommand,
    getSheetCommandTarget,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveRowCommand,
    SetColHiddenCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetColWidthCommand,
    SetRowHeightCommand,
    SetRowHiddenCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSpecificColsVisibleCommand,
    SetSpecificRowsVisibleCommand,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    ClearSheetDrawingTransformerOperation,
    DrawingApplyType,
    drawingPositionToTransform,
    ISheetDrawingService,
    SetDrawingApplyMutation,
    SheetDrawingAnchorType,
    transformToAxisAlignPosition,
    transformToDrawingPosition,
} from '@univerjs/sheets-drawing';
import { ISheetSelectionRenderService } from '@univerjs/sheets-ui';

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
    SetWorksheetRowAutoHeightMutation.id,
    SetWorksheetRowIsAutoHeightMutation.id,
    SetWorksheetColWidthMutation.id,
];

export class SheetDrawingTransformAffectedController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._sheetInterceptorListener();
        this._commandListener();
        this._sheetRefreshListener();
    }

    // eslint-disable-next-line max-lines-per-function
    private _sheetInterceptorListener() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptAfterCommand({
                // eslint-disable-next-line max-lines-per-function,complexity
                getMutations: (commandInfo) => {
                    const { id, params } = commandInfo;

                    if (!UPDATE_COMMANDS.includes(id) || !params) {
                        return { redos: [], undos: [] };
                    }

                    if (id === InsertRowCommand.id) {
                        return this._moveRowInterceptor(params as IInsertRowCommandParams, 'insert');
                    } else if ([MoveColsCommand.id, MoveRowsCommand.id, MoveRangeCommand.id].includes(id)) {
                        let target;
                        if (id === MoveRangeCommand.id) {
                            const _params = params as IMoveRangeCommandParams;

                            // This is a cross-worksheet cut operation, not need handle drawing transform
                            if (
                                (_params.toUnitId && _params.fromUnitId && _params.toUnitId !== _params.fromUnitId) ||
                                (_params.toSubUnitId && _params.fromSubUnitId && _params.toSubUnitId !== _params.fromSubUnitId)
                            ) {
                                return { redos: [], undos: [] };
                            }

                            target = getSheetCommandTarget(this._univerInstanceService, { unitId: _params.toUnitId, subUnitId: _params.toSubUnitId });
                        } else {
                            target = getSheetCommandTarget(this._univerInstanceService, params as IMoveColsCommandParams | IMoveRowsCommandParams);
                        }

                        if (!target) {
                            return { redos: [], undos: [] };
                        }

                        const { unitId, subUnitId } = target;
                        const { fromRange, toRange } = params as IMoveRangeCommandParams | IMoveRowsCommandParams | IMoveColsCommandParams;

                        return this._moveRangeInterceptor(unitId, subUnitId, fromRange, toRange);
                    } else if (id === InsertColCommand.id) {
                        return this._moveColInterceptor(params as IInsertColCommandParams, 'insert');
                    } else if (id === RemoveRowCommand.id) {
                        return this._moveRowInterceptor(params as IRemoveRowColCommandParams, 'remove');
                    } else if (id === RemoveColCommand.id) {
                        return this._moveColInterceptor(params as IRemoveRowColCommandParams, 'remove');
                    } else if (id === DeleteRangeMoveLeftCommand.id) {
                        const { range } = params as IDeleteRangeMoveLeftCommandParams;
                        return this._getRangeMoveUndo(range, RangeMoveUndoType.deleteLeft);
                    } else if (id === DeleteRangeMoveUpCommand.id) {
                        const { range } = params as IDeleteRangeMoveUpCommandParams;
                        return this._getRangeMoveUndo(range, RangeMoveUndoType.deleteUp);
                    } else if (id === InsertRangeMoveDownCommand.id) {
                        const { range } = params as IInsertRangeMoveDownCommandParams;
                        return this._getRangeMoveUndo(range, RangeMoveUndoType.insertDown);
                    } else if (id === InsertRangeMoveRightCommand.id) {
                        const { range } = params as IInsertRangeMoveRightCommandParams;
                        return this._getRangeMoveUndo(range, RangeMoveUndoType.insertRight);
                    } else if (id === SetRowHiddenCommand.id || id === SetSpecificRowsVisibleCommand.id) {
                        const _params = params as ISetRowHiddenCommandParams | ISetSpecificRowsVisibleCommandParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, _params);
                        if (!target) {
                            return { redos: [], undos: [] };
                        }

                        const { unitId, subUnitId } = target;
                        const ranges = _params.ranges || this._selectionManagerService.getCurrentSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.ROW);
                        if (!ranges || ranges.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        return this._getDrawingUndoForRowVisible(unitId, subUnitId, ranges);
                    } else if (id === SetColHiddenCommand.id || id === SetSpecificColsVisibleCommand.id) {
                        const _params = params as ISetColHiddenCommandParams | ISetSpecificColsVisibleCommandParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, _params);
                        if (!target) {
                            return { redos: [], undos: [] };
                        }

                        const { unitId, subUnitId } = target;
                        const ranges = _params.ranges || this._selectionManagerService.getCurrentSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
                        if (!ranges || ranges.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        return this._getDrawingUndoForColVisible(unitId, subUnitId, ranges);
                    } else if (id === DeltaRowHeightCommand.id || id === DeltaColumnWidthCommand.id) {
                        const target = getSheetCommandTarget(this._univerInstanceService);
                        if (!target) {
                            return { redos: [], undos: [] };
                        }

                        const { unitId, subUnitId, worksheet } = target;
                        const ranges: IRange[] = [];

                        if (id === DeltaRowHeightCommand.id) {
                            ranges.push({
                                startRow: (params as IDeltaRowHeightCommandParams).anchorRow,
                                endRow: (params as IDeltaRowHeightCommandParams).anchorRow,
                                startColumn: 0,
                                endColumn: worksheet.getColumnCount() - 1,
                            });
                        } else {
                            ranges.push({
                                startRow: 0,
                                endRow: worksheet.getRowCount() - 1,
                                startColumn: (params as IDeltaColumnWidthCommandParams).anchorCol,
                                endColumn: (params as IDeltaColumnWidthCommandParams).anchorCol,
                            });
                        }

                        return this._getDrawingUndoForRowAndColSize(unitId, subUnitId, ranges);
                    } else if (id === SetRowHeightCommand.id || id === SetColWidthCommand.id) {
                        const _params = params as ISetRowHeightCommandParams | ISetColWidthCommandParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, _params);
                        if (!target) {
                            return { redos: [], undos: [] };
                        }

                        const { unitId, subUnitId } = target;
                        const ranges = _params.ranges || this._selectionManagerService.getCurrentSelections()?.map((s) => s.range);
                        if (!ranges || ranges.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        return this._getDrawingUndoForRowAndColSize(unitId, subUnitId, ranges);
                    }

                    return { redos: [], undos: [] };
                },
            })
        );
    }

    private _getRangeMoveUndo(range: IRange, type: RangeMoveUndoType) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId } = target;
        const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

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

    // eslint-disable-next-line max-lines-per-function,complexity
    private _getUpdateOrDeleteDrawings(range: IRange, type: RangeMoveUndoType, drawing: ISheetDrawing) {
        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        const { sheetTransform, anchorType = SheetDrawingAnchorType.Position, transform, unitId, subUnitId, drawingId } = drawing;
        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);

        if (!sheetTransform || !transform || !sheetSkeletonParam) {
            return {
                updateDrawings,
                deleteDrawings,
            };
        }

        const { from, to } = sheetTransform;
        const { row: fromRow, column: fromColumn } = from;
        const { row: toRow, column: toColumn } = to;
        const { startRow, endRow, startColumn, endColumn } = range;

        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;
        let axisAlignSheetTransform: ISheetDrawingPosition | undefined;

        if (type === RangeMoveUndoType.deleteLeft && fromRow >= startRow && toRow <= endRow) {
            if (fromColumn >= startColumn && toColumn <= endColumn) {
                // delete drawing
                deleteDrawings.push({ unitId, subUnitId, drawingId });
            } else {
                // move drawing left
                const param = this._shrinkCol(startColumn, endColumn, {
                    sheetSkeletonParam,
                    sheetTransform,
                    transform,
                    anchorType,
                });
                newSheetTransform = param?.newSheetTransform;
                newTransform = param?.newTransform;
                axisAlignSheetTransform = param?.axisAlignSheetTransform ?? undefined;
            }
        } else if (type === RangeMoveUndoType.deleteUp && fromColumn >= startColumn && toColumn <= endColumn) {
            if (fromRow >= startRow && toRow <= endRow) {
                // delete drawing
                deleteDrawings.push({ unitId, subUnitId, drawingId });
            } else {
                // move drawing up
                const param = this._shrinkRow(startRow, endRow, {
                    sheetSkeletonParam,
                    sheetTransform,
                    transform,
                    anchorType,
                });
                newSheetTransform = param?.newSheetTransform;
                newTransform = param?.newTransform;
                axisAlignSheetTransform = param?.axisAlignSheetTransform ?? undefined;
            }
        } else if (type === RangeMoveUndoType.insertDown) {
            const param = this._expandRow(startRow, endRow, {
                sheetSkeletonParam,
                sheetTransform,
                transform,
                anchorType,
            });
            newSheetTransform = param?.newSheetTransform;
            newTransform = param?.newTransform;
            axisAlignSheetTransform = param?.axisAlignSheetTransform ?? undefined;
        } else if (type === RangeMoveUndoType.insertRight) {
            const param = this._expandCol(startColumn, endColumn, {
                sheetSkeletonParam,
                sheetTransform,
                transform,
                anchorType,
            });
            newSheetTransform = param?.newSheetTransform;
            newTransform = param?.newTransform;
            axisAlignSheetTransform = param?.axisAlignSheetTransform ?? undefined;
        }

        if (newSheetTransform && newTransform) {
            const newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
            updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
        }

        return { updateDrawings, deleteDrawings };
    }

    private _remainDrawingSize(transform: Nullable<ITransformState>, updateDrawings: ISheetDrawing[], drawing: ISheetDrawing, skeleton: SpreadsheetSkeleton) {
        const newSheetTransform = transformToDrawingPosition({ ...transform }, skeleton);
        if (newSheetTransform) {
            const axisAlignSheetTransform = transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition;
            updateDrawings.push({
                ...drawing,
                sheetTransform: newSheetTransform,
                axisAlignSheetTransform,
            });
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _getDrawingUndoForColVisible(unitId: string, subUnitId: string, ranges: IRange[]) {
        const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!skeleton) {
            return { redos: [], undos: [] };
        }

        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
        const updateDrawings: ISheetDrawing[] = [];
        const preUpdateDrawings: ISheetDrawing[] = [];

        // eslint-disable-next-line complexity, max-lines-per-function
        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;

            if (anchorType === SheetDrawingAnchorType.None) {
                this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
            } else {
                const { from, to } = sheetTransform;
                const { row: fromRow, column: fromColumn } = from;
                const { row: toRow, column: toColumn } = to;

                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const { startColumn, endColumn } = range;

                    if (toColumn < startColumn) {
                        continue;
                    }

                    if (anchorType === SheetDrawingAnchorType.Position) {
                        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
                        let newTransform: Nullable<ITransformState> = null;

                        if (fromColumn >= startColumn && fromColumn <= endColumn) {
                            const selectionCell = attachRangeWithCoord(skeleton, {
                                startColumn: fromColumn,
                                endColumn,
                                startRow: fromRow,
                                endRow: toRow,
                            });
                            newTransform = { ...transform, left: selectionCell.startX };
                        }

                        if (newTransform) {
                            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
                            const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;

                            if (newSheetTransform && newTransform) {
                                updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
                                break;
                            }
                        }

                        continue;
                    }

                    if (fromColumn >= startColumn && toColumn <= endColumn) {
                        continue;
                    }

                    let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
                    let newTransform: Nullable<ITransformState> = null;

                    if (fromColumn >= startColumn && fromColumn <= endColumn) {
                        const selectionCell = attachRangeWithCoord(skeleton, {
                            startColumn: fromColumn,
                            endColumn,
                            startRow: fromRow,
                            endRow: toRow,
                        });
                        newTransform = {
                            ...transform,
                            left: (selectionCell?.startX || 0),
                            width: (transform?.width || 0) - selectionCell.endX + selectionCell.startX,
                        };
                    } else if (toColumn >= startColumn && toColumn <= endColumn) {
                        const selectionCell = attachRangeWithCoord(skeleton, {
                            startColumn,
                            endColumn: toColumn,
                            startRow: fromRow,
                            endRow: toRow,
                        });
                        newTransform = {
                            ...transform,
                            left: selectionCell.startX - (transform?.width || 0),
                        };
                    } else {
                        const selectionCell = attachRangeWithCoord(skeleton, {
                            startColumn,
                            endColumn,
                            startRow: fromRow,
                            endRow: toRow,
                        });
                        newTransform = {
                            ...transform,
                            width: (transform?.width || 0) - selectionCell.endX + selectionCell.startX,
                        };
                        newSheetTransform = transformToDrawingPosition(newTransform, skeleton);

                        if (newSheetTransform && newTransform) {
                            const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;
                            preUpdateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
                            break;
                        }
                    }

                    if (newTransform) {
                        newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
                    }

                    if (newTransform && newSheetTransform) {
                        const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;
                        updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
                        break;
                    } else {
                        this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
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
        const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!skeleton) {
            return { redos: [], undos: [] };
        }

        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
        const updateDrawings: ISheetDrawing[] = [];
        const preUpdateDrawings: ISheetDrawing[] = [];

        // eslint-disable-next-line complexity, max-lines-per-function
        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;

            if (anchorType === SheetDrawingAnchorType.None) {
                this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
            } else {
                const { from, to } = sheetTransform;
                const { row: fromRow, column: fromColumn } = from;
                const { row: toRow, column: toColumn } = to;

                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const { startRow, endRow } = range;

                    if (toRow < startRow) {
                        continue;
                    }

                    if (anchorType === SheetDrawingAnchorType.Position) {
                        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
                        let newTransform: Nullable<ITransformState> = null;

                        if (fromRow >= startRow && fromRow <= endRow) {
                            const selectionCell = attachRangeWithCoord(skeleton, {
                                startColumn: fromColumn,
                                endColumn: toColumn,
                                startRow: fromRow,
                                endRow,
                            });
                            newTransform = { ...transform, top: selectionCell.startY };
                        }

                        if (newTransform) {
                            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
                            const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;

                            if (newSheetTransform && newTransform) {
                                updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
                                break;
                            }
                        }

                        continue;
                    }

                    if (fromRow >= startRow && toRow <= endRow) {
                        continue;
                    }

                    let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
                    let newTransform: Nullable<ITransformState> = null;

                    if (fromRow >= startRow && fromRow <= endRow) {
                        const selectionCell = attachRangeWithCoord(skeleton, {
                            startColumn: fromColumn,
                            endColumn: toColumn,
                            startRow: fromRow,
                            endRow,
                        });
                        newTransform = {
                            ...transform,
                            top: (selectionCell?.startY || 0),
                            height: (transform?.height || 0) - selectionCell.endY + selectionCell.startY,
                        };
                    } else if (toRow >= startRow && toRow <= endRow) {
                        const selectionCell = attachRangeWithCoord(skeleton, {
                            startColumn: fromColumn,
                            endColumn: toColumn,
                            startRow,
                            endRow: toRow,
                        });
                        newTransform = {
                            ...transform,
                            top: selectionCell.startY - (transform?.height || 0),
                        };
                    } else {
                        const selectionCell = attachRangeWithCoord(skeleton, {
                            startColumn: fromColumn,
                            endColumn: toColumn,
                            startRow,
                            endRow,
                        });
                        newTransform = {
                            ...transform,
                            height: (transform?.height || 0) - selectionCell.endY + selectionCell.startY,
                        };
                        newSheetTransform = transformToDrawingPosition(newTransform, skeleton);

                        if (newSheetTransform && newTransform) {
                            const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;
                            preUpdateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
                            break;
                        }
                    }

                    if (newTransform) {
                        newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
                    }

                    if (newTransform && newSheetTransform) {
                        const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;
                        updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
                        break;
                    } else {
                        this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
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

    private _getDrawingUndoForRowAndColSize(unitId: string, subUnitId: string, ranges: IRange[]) {
        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        if (!sheetSkeletonParam) {
            return { redos: [], undos: [] };
        }

        const { skeleton } = sheetSkeletonParam;
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
        const updateDrawings: ISheetDrawing[] = [];

        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;

            if (anchorType === SheetDrawingAnchorType.None) {
                this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
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
                            this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
                            continue;
                        }
                    }

                    const newTransform = drawingPositionToTransform({ ...sheetTransform }, sheetSkeletonParam);

                    if (newTransform) {
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
        let target;
        if (type === 'insert') {
            target = getSheetCommandTarget(this._univerInstanceService, params as IInsertRowCommandParams);
        } else {
            target = getSheetCommandTarget(this._univerInstanceService);
        }

        if (!target) return;

        const { unitId, subUnitId } = target;

        return { unitId, subUnitId };
    }

    private _moveRangeInterceptor(unitId: string, subUnitId: string, fromRange: IRange, toRange: IRange) {
        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        if (!sheetSkeletonParam) {
            return { redos: [], undos: [] };
        }

        const { skeleton } = sheetSkeletonParam;
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
            const transform = drawingPositionToTransform(sheetTransform, sheetSkeletonParam);
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
            const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
            const { undo, redo, objects } = updateJsonOp;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } });
        }

        return { redos, undos };
    }

    // eslint-disable-next-line max-lines-per-function
    private _moveRowInterceptor(params: IInsertRowCommandParams | IRemoveRowColCommandParams, type: 'insert' | 'remove') {
        const target = this._getUnitIdAndSubUnitId(params, type);
        if (!target) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId } = target;
        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        if (!sheetSkeletonParam) {
            return { redos: [], undos: [] };
        }

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
            if (!sheetTransform || !transform) {
                return;
            }

            let newSheetTransform: Nullable<ISheetDrawingPosition>;
            let newTransform: Nullable<ITransformState>;
            let axisAlignSheetTransform: ISheetDrawingPosition | undefined;

            if (type === 'insert') {
                const param = this._expandRow(rowStartIndex, rowEndIndex, {
                    sheetSkeletonParam,
                    sheetTransform,
                    transform,
                    anchorType,
                });
                newSheetTransform = param?.newSheetTransform;
                newTransform = param?.newTransform;
                axisAlignSheetTransform = param?.axisAlignSheetTransform ?? undefined;
            } else {
                const { from, to } = sheetTransform;
                const { row: fromRow } = from;
                const { row: toRow } = to;

                if (anchorType === SheetDrawingAnchorType.Both && fromRow >= rowStartIndex && toRow <= rowEndIndex) {
                    // delete drawing
                    deleteDrawings.push({ unitId, subUnitId, drawingId });
                } else {
                    const param = this._shrinkRow(rowStartIndex, rowEndIndex, {
                        sheetSkeletonParam,
                        sheetTransform,
                        transform,
                        anchorType,
                    });
                    newSheetTransform = param?.newSheetTransform;
                    newTransform = param?.newTransform;
                    axisAlignSheetTransform = param?.axisAlignSheetTransform ?? undefined;
                }
            }

            if (!newSheetTransform || !newTransform) {
                return;
            }

            const params = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform, axisAlignSheetTransform };
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

    // eslint-disable-next-line max-lines-per-function
    private _moveColInterceptor(params: IInsertColCommandParams | IRemoveRowColCommandParams, type: 'insert' | 'remove') {
        const target = this._getUnitIdAndSubUnitId(params, type);
        if (!target) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId } = target;
        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        if (!sheetSkeletonParam) {
            return { redos: [], undos: [] };
        }

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

            if (!sheetTransform || !transform) {
                return;
            }

            let newSheetTransform: Nullable<ISheetDrawingPosition>;
            let newTransform: Nullable<ITransformState>;
            let axisAlignSheetTransform: ISheetDrawingPosition | undefined;

            if (type === 'insert') {
                const param = this._expandCol(colStartIndex, colEndIndex, {
                    sheetSkeletonParam,
                    sheetTransform,
                    transform,
                    anchorType,
                });
                newSheetTransform = param?.newSheetTransform;
                newTransform = param?.newTransform;
                axisAlignSheetTransform = param?.axisAlignSheetTransform ?? undefined;
            } else {
                const { from, to } = sheetTransform;
                const { column: fromColumn } = from;
                const { column: toColumn } = to;
                if (anchorType === SheetDrawingAnchorType.Both && fromColumn >= colStartIndex && toColumn <= colEndIndex) {
                    // delete drawing
                    deleteDrawings.push({ unitId, subUnitId, drawingId });
                } else {
                    const param = this._shrinkCol(colStartIndex, colEndIndex, {
                        sheetSkeletonParam,
                        sheetTransform,
                        transform,
                        anchorType,
                    });
                    newSheetTransform = param?.newSheetTransform;
                    newTransform = param?.newTransform;
                    axisAlignSheetTransform = param?.axisAlignSheetTransform ?? undefined;
                }
            }

            if (!newSheetTransform || !newTransform) {
                return;
            }

            const params = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform, axisAlignSheetTransform };
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

    private _expandCol(
        colStartIndex: number,
        colEndIndex: number,
        options: {
            sheetSkeletonParam: ISheetSkeletonManagerParam;
            sheetTransform: ISheetDrawingPosition;
            transform: ITransformState;
            anchorType: SheetDrawingAnchorType;
        }
    ) {
        const { sheetSkeletonParam, sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = options;
        const { skeleton } = sheetSkeletonParam;
        const colCount = colEndIndex - colStartIndex + 1;
        const { from, to } = sheetTransform;
        const { column: fromColumn } = from;
        const { column: toColumn } = to;

        if (anchorType === SheetDrawingAnchorType.None) {
            return {
                newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
                newTransform: transform,
                axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition,
            };
        }

        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;
        let axisAlignSheetTransform: Nullable<ISheetDrawingPosition> = null;

        if (fromColumn >= colStartIndex) {
            // move start and end col right
            const selectionCell = attachRangeWithCoord(skeleton, {
                startColumn: colStartIndex,
                endColumn: colEndIndex,
                startRow: from.row,
                endRow: to.row,
            });
            newTransform = { ...transform, left: (transform.left || 0) + selectionCell.endX - selectionCell.startX };
            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
            axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;
        } else if (toColumn >= colEndIndex) {
            // move end right only
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from },
                    to: { ...to, column: toColumn + colCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
                    newTransform: transform,
                    axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition,
                };
            }
        }

        if (newSheetTransform && newTransform) {
            return {
                newSheetTransform,
                newTransform,
                axisAlignSheetTransform,
            };
        }

        return null;
    }

    // eslint-disable-next-line max-lines-per-function
    private _shrinkCol(
        colStartIndex: number,
        colEndIndex: number,
        options: {
            sheetSkeletonParam: ISheetSkeletonManagerParam;
            sheetTransform: ISheetDrawingPosition;
            transform: ITransformState;
            anchorType: SheetDrawingAnchorType;
        }
    ) {
        const { sheetSkeletonParam, sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = options;
        const { skeleton } = sheetSkeletonParam;
        const colCount = colEndIndex - colStartIndex + 1;
        const { from, to } = sheetTransform;
        const { column: fromColumn } = from;
        const { column: toColumn } = to;

        if (anchorType === SheetDrawingAnchorType.None) {
            return {
                newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
                newTransform: transform,
                axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition,
            };
        }

        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;
        let axisAlignSheetTransform: Nullable<ISheetDrawingPosition> = null;

        if (fromColumn > colEndIndex) {
            // shrink start and end col left only
            newSheetTransform = {
                from: { ...from, column: fromColumn - colCount },
                to: { ...to, column: toColumn - colCount },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
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
                newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
                    newTransform: transform,
                    axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition,
                };
            }
        } else if (fromColumn >= colStartIndex && fromColumn <= colEndIndex) {
            if (fromColumn === colStartIndex) {
                newTransform = { ...transform, left: (transform.left || 0) - sheetTransform.from.columnOffset };
            } else {
                const selectionCell = attachRangeWithCoord(skeleton, {
                    startColumn: colStartIndex,
                    endColumn: fromColumn - 1,
                    startRow: from.row,
                    endRow: to.row,
                });
                newTransform = { ...transform, left: (transform.left || 0) - selectionCell.endX + selectionCell.startX - sheetTransform.from.columnOffset };
            }

            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
            axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;
        } else if (toColumn >= colStartIndex && toColumn <= colEndIndex && anchorType === SheetDrawingAnchorType.Both) {
            // shrink end col left, then set toColOffset to full cell width
            const selectionCell = attachRangeWithCoord(skeleton, {
                startColumn: colStartIndex - 1,
                endColumn: colStartIndex - 1,
                startRow: from.row,
                endRow: to.row,
            });
            newSheetTransform = {
                from: { ...from },
                to: { ...to, column: colStartIndex - 1, columnOffset: selectionCell.endX - selectionCell.startX },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
        }

        if (newSheetTransform && newTransform) {
            return {
                newSheetTransform,
                newTransform,
                axisAlignSheetTransform,
            };
        }

        return null;
    }

    private _expandRow(
        rowStartIndex: number,
        rowEndIndex: number,
        options: {
            sheetSkeletonParam: ISheetSkeletonManagerParam;
            sheetTransform: ISheetDrawingPosition;
            transform: ITransformState;
            anchorType: SheetDrawingAnchorType;
        }
    ) {
        const { sheetSkeletonParam, sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = options;
        const { skeleton } = sheetSkeletonParam;
        const rowCount = rowEndIndex - rowStartIndex + 1;
        const { from, to } = sheetTransform;
        const { row: fromRow } = from;
        const { row: toRow } = to;

        if (anchorType === SheetDrawingAnchorType.None) {
            return {
                newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
                newTransform: transform,
                axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition,
            };
        }

        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;
        let axisAlignSheetTransform: Nullable<ISheetDrawingPosition> = null;

        if (fromRow >= rowStartIndex) {
            // move start and end row down
            const selectionCell = attachRangeWithCoord(skeleton, {
                startRow: rowStartIndex,
                endRow: rowEndIndex,
                startColumn: from.column,
                endColumn: to.column,
            });
            newTransform = { ...transform, top: (transform.top || 0) + selectionCell.endY - selectionCell.startY };
            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
            axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;
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
                newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
                    newTransform: transform,
                    axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition,
                };
            }
        }

        if (newSheetTransform && newTransform) {
            return {
                newSheetTransform,
                newTransform,
                axisAlignSheetTransform,
            };
        }

        return null;
    }

    // eslint-disable-next-line max-lines-per-function
    private _shrinkRow(
        rowStartIndex: number,
        rowEndIndex: number,
        options: {
            sheetSkeletonParam: ISheetSkeletonManagerParam;
            sheetTransform: ISheetDrawingPosition;
            transform: ITransformState;
            anchorType: SheetDrawingAnchorType;
        }
    ) {
        const { sheetSkeletonParam, sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = options;
        const { skeleton } = sheetSkeletonParam;
        const rowCount = rowEndIndex - rowStartIndex + 1;
        const { from, to } = sheetTransform;
        const { row: fromRow } = from;
        const { row: toRow } = to;

        if (anchorType === SheetDrawingAnchorType.None) {
            return {
                newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
                newTransform: transform,
                axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition,
            };
        }

        let newSheetTransform: Nullable<ISheetDrawingPosition> = null;
        let newTransform: Nullable<ITransformState> = null;
        let axisAlignSheetTransform: Nullable<ISheetDrawingPosition> = null;

        if (fromRow > rowEndIndex) {
            // shrink start and end up only
            newSheetTransform = {
                from: { ...from, row: fromRow - rowCount },
                to: { ...to, row: toRow - rowCount },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
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
                newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
            } else {
                return {
                    newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
                    newTransform: transform,
                    axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton) as ISheetDrawingPosition,
                };
            }
        } else if (fromRow >= rowStartIndex && fromRow <= rowEndIndex) {
            // shrink start and end row up, then set fromRowOffset to 0
            if (fromRow === rowStartIndex) {
                newTransform = { ...transform, top: (transform.top || 0) - sheetTransform.from.rowOffset };
            } else {
                const selectionCell = attachRangeWithCoord(skeleton, {
                    startRow: rowStartIndex,
                    endRow: fromRow - 1,
                    startColumn: from.column,
                    endColumn: to.column,
                });
                newTransform = { ...transform, top: (transform.top || 0) - selectionCell.endY + selectionCell.startY - sheetTransform.from.rowOffset };
            }
            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
            axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton) as ISheetDrawingPosition;
        } else if (toRow >= rowStartIndex && toRow <= rowEndIndex && anchorType === SheetDrawingAnchorType.Both) {
            // shrink end row up, then set toRowOffset to full cell height
            const selectionCell = attachRangeWithCoord(skeleton, {
                startColumn: from.column,
                endColumn: from.column,
                startRow: rowStartIndex - 1,
                endRow: rowStartIndex - 1,
            });
            newSheetTransform = {
                from: { ...from },
                to: { ...to, row: rowStartIndex - 1, rowOffset: selectionCell.endY - selectionCell.startY },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
        }

        if (newSheetTransform && newTransform) {
            return {
                newSheetTransform,
                newTransform,
                axisAlignSheetTransform,
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
            Object.keys(drawingMap ?? {}).forEach((unitId) => {
                const subUnitMap = drawingMap[unitId] ?? {};

                Object.keys(subUnitMap).forEach((subUnitId) => {
                    const drawingData = subUnitMap[subUnitId]?.data ?? {};

                    Object.keys(drawingData).forEach((drawingId) => {
                        if (unitId === selfUnitId) {
                            removeDrawings.push(drawingData[drawingId]);
                        }
                    });
                });
            });

            this._sheetDrawingService.removeNotification(removeDrawings);
            this._drawingManagerService.removeNotification(removeDrawings);
        });
    }

    private _updateDrawings(showUnitId: string, showSubunitId: string): void {
        // TODO@weird94: remove the setTimeout here
        setTimeout(() => {
            const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(showUnitId, showSubunitId);
            const drawingMap = this._drawingManagerService.drawingManagerData;
            const insertDrawings: IDrawingParam[] = [];
            const removeDrawings: IDrawingParam[] = [];

            Object.keys(drawingMap ?? {}).forEach((unitId) => {
                if (unitId !== showUnitId) {
                    return;
                }

                const subUnitMap = drawingMap[unitId] ?? {};

                Object.keys(subUnitMap).forEach((subUnitId) => {
                    const drawingData = subUnitMap[subUnitId]?.data ?? {};

                    Object.keys(drawingData).forEach((drawingId) => {
                        if (unitId === showUnitId && subUnitId === showSubunitId) {
                            const drawing = drawingData[drawingId] as ISheetDrawing;
                            if (drawing.sheetTransform) {
                                drawing.transform = drawingPositionToTransform(drawing.sheetTransform, sheetSkeletonParam);
                            }
                            insertDrawings.push(drawingData[drawingId]);
                        } else {
                            removeDrawings.push(drawingData[drawingId]);
                        }
                    });
                });
            });

            this._sheetDrawingService.removeNotification(removeDrawings);
            this._sheetDrawingService.addNotification(insertDrawings);
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
                    const params = command.params as
                        | ISetRowVisibleMutationParams
                        | ISetRowHiddenMutationParams
                        | ISetColVisibleMutationParams
                        | ISetColHiddenMutationParams
                        | ISetWorksheetRowHeightMutationParams
                        | ISetWorksheetRowAutoHeightMutationParams
                        | ISetWorksheetRowIsAutoHeightMutationParams
                        | ISetWorksheetColWidthMutationParams;
                    const target = getSheetCommandTarget(this._univerInstanceService, params);
                    if (!target) return;

                    const { unitId, subUnitId, worksheet } = target;

                    let ranges: IRange[] = [];
                    if ('ranges' in params) {
                        ranges = params.ranges;
                    } else if ('rowsAutoHeightInfo' in params) {
                        ranges = params.rowsAutoHeightInfo.map((info) => ({
                            startRow: info.row,
                            endRow: info.row,
                            startColumn: 0,
                            endColumn: worksheet.getColumnCount() - 1,
                        }));
                    }

                    this._refreshDrawingTransform(unitId, subUnitId, ranges);
                });
            })
        );
    }

    private _refreshDrawingTransform(unitId: string, subUnitId: string, ranges: IRange[]) {
        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId) ?? {};
        const updateDrawings: ISheetDrawing[] = [];

        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            const { sheetTransform, transform, anchorType = SheetDrawingAnchorType.Position } = drawing;
            if (anchorType === SheetDrawingAnchorType.None) {
                return true;
            }
            if (!sheetTransform) {
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
                    const newTransform = drawingPositionToTransform(sheetTransform, sheetSkeletonParam);
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

        this._sheetDrawingService.refreshTransform(updateDrawings);
        this._drawingManagerService.refreshTransform(updateDrawings);

        this._commandService.syncExecuteCommand(ClearSheetDrawingTransformerOperation.id, [unitId]);
    }
}
