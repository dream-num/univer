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

import type { ICommandInfo, IMutationInfo, IRange, ITransformState, Nullable } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type {
    IDeleteRangeMoveLeftCommandParams,
    IDeleteRangeMoveUpCommandParams,
    IInsertColCommandParams,
    IInsertRangeMoveDownCommandParams,
    IInsertRangeMoveRightCommandParams,
    IInsertRowCommandParams,
    IMoveColsCommandParams,
    IMoveRangeCommandParams,
    IMoveRowsCommandParams,
    IRemoveRowColCommandParams,
    ISetColHiddenMutationParams,
    ISetColVisibleMutationParams,
    ISetRowHiddenMutationParams,
    ISetRowVisibleMutationParams,
    ISetSpecificColsVisibleCommandParams,
    ISetSpecificRowsVisibleCommandParams,
    ISetWorksheetColWidthMutationParams,
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
    ISheetSkeletonManagerParam,
} from '@univerjs/sheets';
import { Disposable, ICommandService, ILogService, Inject, IUniverInstanceService, JSON1, Rectangle } from '@univerjs/core';
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
    SetWorksheetColWidthMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
    SheetInterceptorService,
    SheetSkeletonService,
} from '@univerjs/sheets';
import type { ISetDrawingApplyMutationParams } from '../commands/mutations/set-drawing-apply.mutation';
import type {
    ISheetDrawingTransformExtensionResult,
    ISheetDrawingTransformPlan,
} from '../services/sheet-drawing-transform-plan.service';
import type { ISheetDrawing, ISheetDrawingPosition } from '../services/sheet-drawing.service';
import { transformSheetDrawingReference } from '../basics/drawing-reference';
import {
    drawingPositionToTransform,
    transformToAxisAlignPosition,
    transformToDrawingPosition,
} from '../basics/transform-position';
import { DrawingApplyType, SetDrawingApplyMutation } from '../commands/mutations/set-drawing-apply.mutation';
import { ClearSheetDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';
import { getLegacySheetDrawingPosition, getSheetDrawingPositionAnchorField, tryRefreshSheetDrawingPlacement, validateSheetDrawingPlacement } from '../services/sheet-drawing-placement';
import { SheetDrawingTransformPlanService } from '../services/sheet-drawing-transform-plan.service';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../services/sheet-drawing.service';

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

export class SheetDrawingTransformAffectedController extends Disposable {
    private _currentCommand: ICommandInfo = { id: '', params: {} };

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetDrawingTransformPlanService) private readonly _transformPlanService: SheetDrawingTransformPlanService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this._sheetInterceptorListener();
        this._sheetRefreshListener();
    }

    private _sheetInterceptorListener() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptAfterCommand({
                getMutations: (commandInfo) => {
                    const { id, params } = commandInfo;

                    if (!UPDATE_COMMANDS.includes(id) || !params) {
                        return { redos: [], undos: [] };
                    }

                    this._currentCommand = commandInfo;

                    if ([InsertRowCommand.id, InsertColCommand.id, RemoveRowCommand.id, RemoveColCommand.id].includes(id)) {
                        return this._moveRowOrColInterceptor(params as IInsertRowCommandParams | IInsertColCommandParams | IRemoveRowColCommandParams, commandInfo);
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
                    } else if (
                        id === SetRowHiddenCommand.id ||
                        id === SetSpecificRowsVisibleCommand.id ||
                        id === SetColHiddenCommand.id ||
                        id === SetSpecificColsVisibleCommand.id ||
                        id === DeltaRowHeightCommand.id ||
                        id === DeltaColumnWidthCommand.id ||
                        id === SetRowHeightCommand.id ||
                        id === SetColWidthCommand.id
                    ) {
                        const { unitId, subUnitId, ranges } = params as
                            | ISetRowHiddenMutationParams
                            | ISetSpecificRowsVisibleCommandParams
                            | ISetColHiddenMutationParams
                            | ISetSpecificColsVisibleCommandParams
                            | ISetWorksheetRowHeightMutationParams
                            | ISetWorksheetColWidthMutationParams;
                        return this._refreshDrawingForRowAndColSize(unitId, subUnitId, ranges);
                    }

                    return { redos: [], undos: [] };
                },
            })
        );
    }

    private _finalizePlan(
        unitId: string,
        subUnitId: string,
        updates: Array<Partial<ISheetDrawing>>,
        deletes: Array<Partial<ISheetDrawing>> = [],
        mode: ISheetDrawingTransformPlan['mode'] = 'command',
        command: ICommandInfo = this._currentCommand
    ) {
        const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!skeleton) {
            return { redos: [], undos: [] };
        }

        const data = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
        const originals = new Map(Object.entries(data));
        const plan: ISheetDrawingTransformPlan = {
            command,
            mode,
            unitId,
            subUnitId,
            skeleton,
            originals,
            updates: new Map(),
            deletes: new Set(deletes.map(({ drawingId }) => drawingId).filter((drawingId): drawingId is string => Boolean(drawingId))),
        };

        updates.forEach((patch) => {
            if (!patch.drawingId) return;
            const original = originals.get(patch.drawingId);
            if (!original) return;
            const candidate = {
                ...original,
                ...patch,
                transform: { ...original.transform, ...patch.transform },
                axisAlignSheetTransform: { ...(patch.axisAlignSheetTransform ?? original.axisAlignSheetTransform) },
            };
            // Layout changes cannot author orientation or insert optional default
            // fields another replica may concurrently insert through JSON1.
            for (const key of ['angle', 'flipX', 'flipY', 'skewX', 'skewY'] as const) {
                const value = original.transform?.[key];
                if (value === undefined) delete candidate.transform[key];
                else Object.assign(candidate.transform, { [key]: value });
            }
            plan.updates.set(patch.drawingId, candidate);
        });

        const feature = this._transformPlanService.transform(plan);
        if (mode === 'refresh') {
            const changed = [...plan.updates.values()].filter((drawing) => JSON.stringify(originals.get(drawing.drawingId)) !== JSON.stringify(drawing));
            if (changed.length) {
                this._sheetDrawingService.refreshTransform(changed, false);
                this._drawingManagerService.refreshTransform(changed, false);
                this._sheetDrawingService.refreshTransformNotification(changed);
                this._drawingManagerService.refreshTransformNotification(changed);
                this._commandService.syncExecuteCommand(ClearSheetDrawingTransformerOperation.id, [unitId]);
            }
            return { redos: [], undos: [] };
        }

        return this._createPlanMutations(plan, feature);
    }

    private _getCalculatedSkeletonParam(unitId: string, subUnitId: string) {
        const skeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        if (!skeletonParam) return;
        skeletonParam.skeleton.makeDirty(true);
        skeletonParam.skeleton.calculate();
        return skeletonParam;
    }

    private _createPlanMutations(plan: ISheetDrawingTransformPlan, feature: Required<ISheetDrawingTransformExtensionResult>) {
        const { unitId, subUnitId } = plan;
        const redos: IMutationInfo[] = [...feature.preRedos];
        const undos: IMutationInfo[] = [...feature.preUndos];
        const updates = [...plan.updates.values()].filter(({ drawingId }) => !plan.deletes.has(drawingId));
        const reference = this._getStructuralReference(plan.command, plan.skeleton);

        if (updates.length || reference) {
            const batch = updates.length
                ? this._sheetDrawingService.getBatchUpdateOp(updates) as IDrawingJsonUndo1
                : { undo: null, redo: null, objects: [] };
            let { undo, redo } = batch;
            const { objects } = batch;
            if (reference) {
                // Retain marker origins even when the numeric index stays the
                // same: offset-only edits inside a deleted boundary need them.
                for (const drawing of updates) {
                    const original = plan.originals.get(drawing.drawingId);
                    for (const endpoint of ['from', 'to'] as const) {
                        const before = original?.axisAlignSheetTransform?.[endpoint]?.[reference.axis];
                        const after = drawing.axisAlignSheetTransform?.[endpoint]?.[reference.axis];
                        if (before === undefined || after === undefined) continue;
                        const path = [unitId, subUnitId, 'data', drawing.drawingId, 'axisAlignSheetTransform', endpoint, reference.axis];
                        redo = JSON1.type.compose(redo, JSON1.replaceOp(path, after, after));
                        undo = JSON1.type.compose(undo, JSON1.replaceOp(path, before, before));
                    }
                }
            }
            const inverseReference = reference
                ? {
                    ...reference,
                    action: reference.action === 'insert' ? 'remove' as const : 'insert' as const,
                    limit: reference.limit + (reference.action === 'insert' ? -1 : 1) * (reference.end - reference.start + 1),
                }
                : undefined;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE, ...(reference ? { reference } : {}) } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE, ...(inverseReference ? { reference: inverseReference } : {}) } });
        }

        if (plan.deletes.size) {
            const drawings = [...plan.deletes].map((drawingId) => ({ unitId, subUnitId, drawingId })) as ISheetDrawing[];
            const { undo, redo, objects } = this._sheetDrawingService.getBatchRemoveOp(drawings) as IDrawingJsonUndo1;
            redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.REMOVE } });
            undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.INSERT } });
        }

        redos.push(...feature.redos);
        undos.push(...feature.undos);
        if (updates.length || plan.deletes.size || feature.preRedos.length || feature.redos.length || feature.preUndos.length || feature.undos.length) {
            redos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
            undos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
        }

        return { redos, undos };
    }

    private _getStructuralReference(command: ICommandInfo, skeleton: SpreadsheetSkeleton): ISetDrawingApplyMutationParams['reference'] {
        const { id, params } = command;
        const row = id === InsertRowCommand.id || id === RemoveRowCommand.id;
        if (!row && id !== InsertColCommand.id && id !== RemoveColCommand.id) {
            return;
        }
        const { range } = params as IInsertRowCommandParams;
        const limit = row ? skeleton.worksheet.getRowCount() : skeleton.worksheet.getColumnCount();
        const cell = skeleton.getNoMergeCellWithCoordByIndex(row ? limit - 1 : 0, row ? 0 : limit - 1);
        return {
            axis: row ? 'row' : 'column',
            action: id === InsertRowCommand.id || id === InsertColCommand.id ? 'insert' : 'remove',
            start: row ? range.startRow : range.startColumn,
            end: row ? range.endRow : range.endColumn,
            limit,
            boundaryOffset: row ? cell.endY - cell.startY : cell.endX - cell.startX,
        };
    }

    private _transformDrawingReference(drawing: ISheetDrawing, reference: NonNullable<ISetDrawingApplyMutationParams['reference']>, skeleton: SpreadsheetSkeleton) {
        if (validateSheetDrawingPlacement(drawing)) {
            this._logService.warn('[SheetDrawingTransformAffectedController]', 'Skipping invalid structural drawing anchor', { drawingId: drawing.drawingId });
            return;
        }
        const { axis } = reference;
        const { axisAlignSheetTransform } = drawing;
        let candidate: ISheetDrawing;
        if (drawing.anchorType === SheetDrawingAnchorType.Both) {
            const anchor = axisAlignSheetTransform;
            if (anchor.to[axis] < reference.start) return;
            if (reference.action === 'remove' && anchor.from[axis] >= reference.start && anchor.to[axis] <= reference.end) return null;
            const mapPosition = (position: ISheetDrawingPosition) => ({
                ...position,
                from: transformSheetDrawingReference(position.from, reference),
                to: transformSheetDrawingReference(position.to, reference),
            });
            candidate = { ...drawing, axisAlignSheetTransform: mapPosition(anchor) };
        } else {
            const field = getSheetDrawingPositionAnchorField(drawing);
            const { from, to } = drawing[field]!;
            // An edit after the anchor may still change its derived cell markers.
            const lastMarker = Math.max(from[axis], to?.[axis] ?? Infinity);
            if (lastMarker < reference.start) return;
            candidate = { ...drawing, [field]: { ...drawing[field], from: transformSheetDrawingReference(from, reference) } };
        }
        const result = tryRefreshSheetDrawingPlacement(candidate, skeleton);
        if (result.ok) return { ...result.drawing, anchorType: drawing.anchorType };
        this._logService.warn('[SheetDrawingTransformAffectedController]', 'Skipping invalid structural drawing placement', { drawingId: drawing.drawingId, result });
    }

    private _getRangeMoveUndo(range: IRange, type: RangeMoveUndoType) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId } = target;
        if (!this._getCalculatedSkeletonParam(unitId, subUnitId)) {
            return { redos: [], undos: [] };
        }
        const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);

        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId];

            const { updateDrawings: updateDrawingsPart, deleteDrawings: deleteDrawingsPart } = this._getUpdateOrDeleteDrawings(range, type, drawing);

            updateDrawings.push(...updateDrawingsPart);
            deleteDrawings.push(...deleteDrawingsPart);
        });

        return this._finalizePlan(unitId, subUnitId, updateDrawings, deleteDrawings);
    }

    private _getUpdateOrDeleteDrawings(range: IRange, type: RangeMoveUndoType, drawing: ISheetDrawing) {
        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        const { anchorType = SheetDrawingAnchorType.Position, transform, unitId, subUnitId, drawingId } = drawing;
        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);

        if (anchorType === SheetDrawingAnchorType.None || !transform || !sheetSkeletonParam) {
            return {
                updateDrawings,
                deleteDrawings,
            };
        }

        const sheetTransform = anchorType === SheetDrawingAnchorType.Position
            ? drawing[getSheetDrawingPositionAnchorField(drawing)]
            : getLegacySheetDrawingPosition(drawing, sheetSkeletonParam.skeleton);
        if (!sheetTransform?.from || !sheetTransform.to) return { updateDrawings, deleteDrawings };
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
                    drawing,
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
                    drawing,
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

        if (newSheetTransform && newTransform && axisAlignSheetTransform) {
            updateDrawings.push({ ...drawing, transform: newTransform, axisAlignSheetTransform });
        }

        return { updateDrawings, deleteDrawings };
    }

    private _refreshDrawingForRowAndColSize(unitId: string, subUnitId: string, ranges: IRange[]) {
        const sheetSkeletonParam = this._getCalculatedSkeletonParam(unitId, subUnitId);
        if (!sheetSkeletonParam) {
            return { redos: [], undos: [] };
        }

        const { skeleton } = sheetSkeletonParam;
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
        const updateDrawings: ISheetDrawing[] = [];

        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            if (drawing?.anchorType === SheetDrawingAnchorType.None || drawing?.groupId) {
                return;
            }
            const refreshed = this._tryRefreshDrawingPlacement(drawing, skeleton, this._currentCommand.id, ({ to }) =>
                ranges.some(({ startRow, startColumn }) => to.row >= startRow && to.column >= startColumn));
            if (refreshed) {
                updateDrawings.push(refreshed);
            }
        });

        if (updateDrawings.length === 0) {
            return { redos: [], undos: [] };
        }

        // Row/column mutations already describe the edit. Pixel coordinates are
        // replica-local projections and must not introduce a second OT write.
        return this._finalizePlan(unitId, subUnitId, updateDrawings, [], 'refresh');
    }

    private _moveRangeInterceptor(unitId: string, subUnitId: string, fromRange: IRange, toRange: IRange) {
        const sheetSkeletonParam = this._getCalculatedSkeletonParam(unitId, subUnitId);
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
            if (drawing.anchorType !== SheetDrawingAnchorType.Both || drawing.groupId) {
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

        const rowOffset = toRange.startRow - fromRange.startRow;
        const colOffset = toRange.startColumn - fromRange.startColumn;

        const movePosition = (position: ISheetDrawingPosition): ISheetDrawingPosition => ({
            ...position,
            from: { ...position.from, row: position.from.row + rowOffset, column: position.from.column + colOffset },
            to: { ...position.to, row: position.to.row + rowOffset, column: position.to.column + colOffset },
        });
        const updateDrawings = containedDrawings.flatMap((drawing) => {
            const result = tryRefreshSheetDrawingPlacement({
                ...drawing,
                axisAlignSheetTransform: movePosition(drawing.axisAlignSheetTransform),
            }, skeleton);
            if (result.ok) return [result.drawing];
            this._logSkippedDrawingRefresh(drawing, this._currentCommand.id, result);
            return [];
        });

        return this._finalizePlan(unitId, subUnitId, updateDrawings);
    }

    private _moveRowOrColInterceptor(params: IInsertRowCommandParams | IInsertColCommandParams | IRemoveRowColCommandParams, command: ICommandInfo) {
        const target = getSheetCommandTarget(this._univerInstanceService, params);
        if (!target) return { redos: [], undos: [] };
        const { unitId, subUnitId } = target;
        const skeletonParam = this._getCalculatedSkeletonParam(unitId, subUnitId);
        if (!skeletonParam) return { redos: [], undos: [] };
        const reference = this._getStructuralReference(command, skeletonParam.skeleton);
        if (!reference) return { redos: [], undos: [] };
        const updates: Partial<ISheetDrawing>[] = [];
        const deletes: Partial<ISheetDrawing>[] = [];
        for (const drawing of Object.values(this._sheetDrawingService.getDrawingData(unitId, subUnitId))) {
            if (drawing.anchorType === SheetDrawingAnchorType.None || drawing.groupId || !drawing.transform) continue;
            const result = this._transformDrawingReference(drawing, reference, skeletonParam.skeleton);
            if (result === null) deletes.push({ unitId, subUnitId, drawingId: drawing.drawingId });
            else if (result) updates.push(result);
        }
        return this._finalizePlan(unitId, subUnitId, updates, deletes, 'command', command);
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
        } else if (toColumn >= colStartIndex) {
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

        return this._getStructuralDrawingResult(newSheetTransform, newTransform, axisAlignSheetTransform, skeleton);
    }

    private _shrinkCol(
        colStartIndex: number,
        colEndIndex: number,
        options: {
            drawing: ISheetDrawing;
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
            if (anchorType === SheetDrawingAnchorType.Position) {
                return this._resolveShiftedPositionDrawing(newSheetTransform.from, options.drawing, skeleton);
            }
            newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
        } else if (anchorType === SheetDrawingAnchorType.Both && fromColumn >= colStartIndex && toColumn <= colEndIndex) {
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
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from, column: colStartIndex, columnOffset: 0 },
                    to: { ...to, column: toColumn - colCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
                axisAlignSheetTransform = transformToAxisAlignPosition(newTransform!, skeleton);
            } else {
                return this._resolveShiftedPositionDrawing({ ...from, column: colStartIndex, columnOffset: 0 }, options.drawing, skeleton);
            }
        } else if (toColumn >= colStartIndex && toColumn <= colEndIndex && anchorType === SheetDrawingAnchorType.Both) {
            // At the sheet edge there is no surviving column after the deletion boundary.
            const boundaryColumn = Math.min(colStartIndex, skeleton.worksheet.getColumnCount() - 1);
            const boundaryCell = skeleton.getNoMergeCellWithCoordByIndex(from.row, boundaryColumn);
            newSheetTransform = {
                from: { ...from },
                to: {
                    ...to,
                    column: boundaryColumn,
                    columnOffset: boundaryColumn < colStartIndex ? boundaryCell.endX - boundaryCell.startX : 0,
                },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
        }

        return this._getStructuralDrawingResult(newSheetTransform, newTransform, axisAlignSheetTransform, skeleton);
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
        } else if (toRow >= rowStartIndex) {
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

        return this._getStructuralDrawingResult(newSheetTransform, newTransform, axisAlignSheetTransform, skeleton);
    }

    private _shrinkRow(
        rowStartIndex: number,
        rowEndIndex: number,
        options: {
            drawing: ISheetDrawing;
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
            if (anchorType === SheetDrawingAnchorType.Position) {
                return this._resolveShiftedPositionDrawing(newSheetTransform.from, options.drawing, skeleton);
            }
            newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
        } else if (anchorType === SheetDrawingAnchorType.Both && fromRow >= rowStartIndex && toRow <= rowEndIndex) {
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
            if (anchorType === SheetDrawingAnchorType.Both) {
                newSheetTransform = {
                    from: { ...from, row: rowStartIndex, rowOffset: 0 },
                    to: { ...to, row: toRow - rowCount },
                };
                newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
                axisAlignSheetTransform = transformToAxisAlignPosition(newTransform!, skeleton);
            } else {
                return this._resolveShiftedPositionDrawing({ ...from, row: rowStartIndex, rowOffset: 0 }, options.drawing, skeleton);
            }
        } else if (toRow >= rowStartIndex && toRow <= rowEndIndex && anchorType === SheetDrawingAnchorType.Both) {
            // At the sheet edge there is no surviving row after the deletion boundary.
            const boundaryRow = Math.min(rowStartIndex, skeleton.worksheet.getRowCount() - 1);
            const boundaryCell = skeleton.getNoMergeCellWithCoordByIndex(boundaryRow, from.column);
            newSheetTransform = {
                from: { ...from },
                to: {
                    ...to,
                    row: boundaryRow,
                    rowOffset: boundaryRow < rowStartIndex ? boundaryCell.endY - boundaryCell.startY : 0,
                },
            };
            newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
        }

        return this._getStructuralDrawingResult(newSheetTransform, newTransform, axisAlignSheetTransform, skeleton);
    }

    private _resolveShiftedPositionDrawing(
        from: ISheetDrawingPosition['from'],
        drawing: ISheetDrawing,
        skeleton: SpreadsheetSkeleton
    ) {
        const field = getSheetDrawingPositionAnchorField(drawing);
        const result = tryRefreshSheetDrawingPlacement({ ...drawing, [field]: { ...drawing[field], from } }, skeleton);
        if (!result.ok) return null;
        const { transform: newTransform, axisAlignSheetTransform } = result.drawing;
        const newSheetTransform = getLegacySheetDrawingPosition(result.drawing, skeleton);
        return { newSheetTransform, newTransform, axisAlignSheetTransform };
    }

    private _getStructuralDrawingResult(
        newSheetTransform: Nullable<ISheetDrawingPosition>,
        newTransform: Nullable<ITransformState>,
        axisAlignSheetTransform: Nullable<ISheetDrawingPosition>,
        skeleton: SpreadsheetSkeleton
    ) {
        if (!newSheetTransform || !newTransform) {
            return null;
        }
        const { left = 0, top = 0, width = 0, height = 0 } = newTransform;
        if (![left, top, width, height].every(Number.isFinite) || width < 0 || height < 0) {
            return null;
        }
        if ([newSheetTransform.from, newSheetTransform.to].some(({ row, column, rowOffset, columnOffset }) =>
            !Number.isInteger(row) || !Number.isInteger(column) || row < 0 || column < 0 ||
            !Number.isFinite(rowOffset) || !Number.isFinite(columnOffset))) {
            return null;
        }
        return {
            newSheetTransform,
            newTransform,
            axisAlignSheetTransform: axisAlignSheetTransform ?? transformToAxisAlignPosition(newTransform, skeleton),
        };
    }

    private _tryRefreshDrawingPlacement(
        drawing: ISheetDrawing,
        skeleton: SpreadsheetSkeleton,
        commandId: string,
        shouldRefresh?: (position: Pick<ISheetDrawingPosition, 'from' | 'to'>) => boolean
    ): ISheetDrawing | undefined {
        try {
            const failure = validateSheetDrawingPlacement(drawing);
            if (failure) {
                this._logSkippedDrawingRefresh(drawing, commandId, failure);
                return;
            }
            const oneCell = (drawing.anchorType ?? SheetDrawingAnchorType.Position) === SheetDrawingAnchorType.Position;
            const rebuildEndpoint = oneCell && validateSheetDrawingPlacement({ ...drawing, anchorType: SheetDrawingAnchorType.Both });
            const rebuilt = rebuildEndpoint ? tryRefreshSheetDrawingPlacement(drawing, skeleton) : undefined;
            if (rebuilt && !rebuilt.ok) {
                this._logSkippedDrawingRefresh(drawing, commandId, rebuilt);
                return;
            }
            const candidate = rebuilt?.ok ? rebuilt.drawing : drawing;
            const anchor = oneCell
                ? candidate[getSheetDrawingPositionAnchorField(candidate)]!
                : candidate.axisAlignSheetTransform ?? candidate.sheetTransform;
            const { from } = anchor;
            if (shouldRefresh && !shouldRefresh({ from, to: anchor.to ?? from })) {
                return rebuilt?.ok ? rebuilt.drawing : undefined;
            }
            const result = rebuilt ?? tryRefreshSheetDrawingPlacement(candidate, skeleton);
            if (result.ok) {
                return result.drawing;
            }
            this._logSkippedDrawingRefresh(drawing, commandId, result);
        } catch (error) {
            this._logSkippedDrawingRefresh(drawing, commandId, error);
        }
    }

    private _logSkippedDrawingRefresh(drawing: ISheetDrawing, commandId: string, failure: unknown): void {
        this._logService.warn('[SheetDrawingTransformAffectedController]', 'Skipping drawing placement refresh', {
            unitId: drawing?.unitId,
            subUnitId: drawing?.subUnitId,
            drawingId: drawing?.drawingId,
            commandId,
            transform: drawing?.transform,
            axisAlignSheetTransform: drawing?.axisAlignSheetTransform,
            failure,
        });
    }

    private _sheetRefreshListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!REFRESH_MUTATIONS.includes(command.id)) {
                    return;
                }

                if (this._disposed) {
                    return;
                }
                try {
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
                    if (!target) {
                        return;
                    }

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

                    this._refreshDrawingTransform(command, unitId, subUnitId, ranges);
                } catch (error) {
                    this._logService.error('[SheetDrawingTransformAffectedController]', 'Drawing layout refresh failed', {
                        commandId: command.id,
                        params: command.params,
                        error,
                    });
                }
            })
        );
    }

    private _refreshDrawingTransform(command: ICommandInfo, unitId: string, subUnitId: string, ranges: IRange[]) {
        const sheetSkeletonParam = this._getCalculatedSkeletonParam(unitId, subUnitId);
        if (!sheetSkeletonParam) {
            return;
        }

        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId) ?? {};
        const updateDrawings: ISheetDrawing[] = [];

        Object.keys(drawingData).forEach((drawingId) => {
            const drawing = drawingData[drawingId] as ISheetDrawing;
            if (drawing?.anchorType === SheetDrawingAnchorType.None || drawing?.groupId) {
                return;
            }

            const refreshed = this._tryRefreshDrawingPlacement(drawing, sheetSkeletonParam.skeleton, command.id, ({ from, to }) => {
                const { row: fromRow, column: fromColumn } = from;
                const { row: toRow, column: toColumn } = to;
                return ranges.some((range) => {
                    const { startRow, endRow, startColumn, endColumn } = range;
                    return Rectangle.intersects(
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
                    ) || fromRow > endRow || fromColumn > endColumn;
                });
            });
            if (refreshed) {
                updateDrawings.push(refreshed);
            }
        });

        this._finalizePlan(unitId, subUnitId, updateDrawings, [], 'refresh', command);
    }
}
