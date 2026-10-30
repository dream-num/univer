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
import { ISheetDrawingService } from '../../services/sheet-drawing.service';
import { createSheetDrawingUpdateMutations } from './sheet-drawing-update-mutations';

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
        const normalizedDrawings = drawings.map((drawing) => normalizeNonRotatableAngleUpdate(drawing, sheetDrawingService));
        const normalizedParams = { ...params, drawings: normalizedDrawings };
        // Feature owners normalize this command-local payload before generic Drawing captures its JSON1 preimage.
        const intercepted = sheetInterceptorService.onCommandExecute({ id: SetSheetDrawingCommand.id, params: normalizedParams });
        const jsonOp = sheetDrawingService.getBatchUpdateOp(normalizedParams.drawings as ISheetDrawing[]) as IDrawingJsonUndo1;
        const { unitId } = jsonOp;
        const drawingMutations = createSheetDrawingUpdateMutations(jsonOp);
        const redoMutations = [
            ...(intercepted.preRedos ?? []),
            ...drawingMutations.redoMutations,
            ...intercepted.redos,
        ];
        const undoMutations = [
            ...(intercepted.preUndos ?? []),
            ...drawingMutations.undoMutations,
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
