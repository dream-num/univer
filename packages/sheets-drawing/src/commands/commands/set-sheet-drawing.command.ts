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

import type { ICommand } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    sequenceExecute,
} from '@univerjs/core';
import { SheetInterceptorService } from '@univerjs/sheets';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { resolveSheetDrawingRotateEnabled } from '../../common/rotate-enabled';
import { applySheetDrawingPlacement, getSheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';
import { DrawingApplyType, SetDrawingApplyMutation } from '../mutations/set-drawing-apply.mutation';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';

export interface ISetDrawingCommandParams {
    unitId: string;
    drawings: Partial<ISheetDrawing>[];
}

function hasIncomingAngle(drawing: Partial<ISheetDrawing>): boolean {
    return drawing.transform?.angle !== undefined || drawing.sheetTransform?.angle !== undefined || drawing.axisAlignSheetTransform?.angle !== undefined;
}

type NullableAngleState = { angle?: number } | null | undefined | void;

function preserveAngle<T extends { angle?: number }>(incoming: T, current: NullableAngleState): T {
    const currentAngle = (current as { angle?: number } | null | undefined)?.angle;
    const next = { ...((current ?? {}) as object), ...incoming } as T;
    if (currentAngle === undefined) {
        delete next.angle;
    } else {
        next.angle = currentAngle;
    }

    return next;
}

function normalizeNonRotatableAngleUpdate(drawing: Partial<ISheetDrawing>, sheetDrawingService: ISheetDrawingService): Partial<ISheetDrawing> {
    if (!drawing.drawingId || !drawing.unitId || !drawing.subUnitId || !hasIncomingAngle(drawing)) {
        return drawing;
    }

    const current = sheetDrawingService.getDrawingByParam({
        unitId: drawing.unitId,
        subUnitId: drawing.subUnitId,
        drawingId: drawing.drawingId,
    });
    if (!current) {
        return drawing;
    }

    const resolveTarget = {
        ...current,
        ...drawing,
        drawingType: drawing.drawingType ?? current.drawingType,
        transform: {
            ...current.transform,
            ...drawing.transform,
        },
    } as ISheetDrawing;

    if (resolveSheetDrawingRotateEnabled(resolveTarget, sheetDrawingService)) {
        return drawing;
    }

    const normalized = { ...drawing };
    if (drawing.transform?.angle !== undefined) {
        normalized.transform = preserveAngle(drawing.transform, current.transform);
    }
    if (drawing.sheetTransform?.angle !== undefined) {
        normalized.sheetTransform = preserveAngle(drawing.sheetTransform, current.sheetTransform);
    }
    if (drawing.axisAlignSheetTransform?.angle !== undefined) {
        normalized.axisAlignSheetTransform = preserveAngle(drawing.axisAlignSheetTransform, current.axisAlignSheetTransform);
    }

    return normalized;
}

function fitChartChildrenInBatch(drawings: Partial<ISheetDrawing>[], sheetDrawingService: ISheetDrawingService): Partial<ISheetDrawing>[] {
    const pending = new Map<string, ISheetDrawing>();
    for (const drawing of drawings) {
        if (!drawing.unitId || !drawing.subUnitId || !drawing.drawingId) {
            continue;
        }
        const current = sheetDrawingService.getDrawingByParam({ unitId: drawing.unitId, subUnitId: drawing.subUnitId, drawingId: drawing.drawingId });
        if (current) {
            pending.set(drawing.drawingId, { ...current, ...drawing, transform: { ...current.transform, ...drawing.transform } } as ISheetDrawing);
        }
    }
    const explicitIds = new Set(pending.keys());
    const processed = new Set<string>();
    const processing = new Set<string>();
    const fitDrawing = (drawingId: string, owner?: ISheetDrawing): ISheetDrawing | undefined => {
        const drawing = pending.get(drawingId) ?? (owner && sheetDrawingService.getDrawingByParam({ ...owner, drawingId })) ?? undefined;
        if (!drawing || processed.has(drawingId) || processing.has(drawingId)) {
            return drawing;
        }
        processing.add(drawingId);
        if (drawing.chartParent && drawing.anchorType === SheetDrawingAnchorType.None) {
            const parentId = drawing.chartParent.drawingId;
            const parent = fitDrawing(parentId, drawing);
            if (explicitIds.has(drawingId)) {
                pending.set(drawingId, applySheetDrawingPlacement(drawing, getSheetDrawingPlacement(drawing), undefined, parent));
            } else {
                const previousParent = sheetDrawingService.getDrawingByParam({ ...drawing, drawingId: parentId });
                if (parent?.transform && previousParent?.transform && drawing.transform) {
                    const oldBounds = previousParent.transform;
                    const nextBounds = parent.transform;
                    const changed = nextBounds.left !== oldBounds.left || nextBounds.top !== oldBounds.top
                        || nextBounds.width !== oldBounds.width || nextBounds.height !== oldBounds.height;
                    if (!changed) {
                        pending.set(drawingId, drawing);
                    } else {
                        const childBounds = drawing.transform;
                        const widthRatio = nextBounds.width! / oldBounds.width!;
                        const heightRatio = nextBounds.height! / oldBounds.height!;
                        // The chart-parent planner writes inherited nodes later; compute their final bounds here
                        // so explicit descendants are fitted before the primary JSON1 operation is created.
                        pending.set(drawingId, applySheetDrawingPlacement(drawing, {
                            kind: SheetDrawingAnchorType.None,
                            left: nextBounds.left! + (childBounds.left! - oldBounds.left!) * widthRatio,
                            top: nextBounds.top! + (childBounds.top! - oldBounds.top!) * heightRatio,
                            width: drawing.chartParent.resizeWithParent ? childBounds.width! * widthRatio : childBounds.width!,
                            height: drawing.chartParent.resizeWithParent ? childBounds.height! * heightRatio : childBounds.height!,
                        }, undefined, parent));
                    }
                }
            }
        }
        processing.delete(drawingId);
        processed.add(drawingId);
        return pending.get(drawingId) ?? drawing;
    };
    return drawings.map((drawing) => {
        if (!drawing.drawingId) {
            return drawing;
        }
        const fitted = fitDrawing(drawing.drawingId);
        if (!fitted?.chartParent || fitted.anchorType !== SheetDrawingAnchorType.None) {
            return drawing;
        }
        return { ...drawing, transform: fitted.transform, sheetTransform: fitted.sheetTransform, axisAlignSheetTransform: fitted.axisAlignSheetTransform };
    });
}

export const SetSheetDrawingCommand: ICommand<ISetDrawingCommandParams> = {
    id: 'sheet.command.set-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const { drawings } = params;
        const normalizedDrawings = fitChartChildrenInBatch(
            drawings.map((drawing) => normalizeNonRotatableAngleUpdate(drawing, sheetDrawingService)),
            sheetDrawingService
        );
        const normalizedParams = { ...params, drawings: normalizedDrawings };
        const jsonOp = sheetDrawingService.getBatchUpdateOp(normalizedDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        const intercepted = sheetInterceptorService.onCommandExecute({ id: SetSheetDrawingCommand.id, params: normalizedParams });
        const redoMutations = [
            ...(intercepted.preRedos ?? []),
            {
                id: SetDrawingApplyMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    op: redo,
                    objects,
                    type: DrawingApplyType.UPDATE,
                },
            },
            {
                id: ClearSheetDrawingTransformerOperation.id,
                params: [unitId],
            },
            ...intercepted.redos,
        ];
        const undoMutations = [
            ...(intercepted.preUndos ?? []),
            {
                id: SetDrawingApplyMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    op: undo,
                    objects,
                    type: DrawingApplyType.UPDATE,
                },
            },
            {
                id: ClearSheetDrawingTransformerOperation.id,
                params: [unitId],
            },
            ...intercepted.undos,
        ];

        const result = sequenceExecute(redoMutations, commandService);
        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
            });

            return true;
        }

        return false;
    },
};
