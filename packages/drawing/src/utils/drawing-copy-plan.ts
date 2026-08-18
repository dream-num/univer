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

import type { IDrawingParam } from '@univerjs/core';
import { generateRandomId } from '@univerjs/core';

/**
 * A command-scoped cache key shared by sheet-copy interceptors so every drawing model
 * resolves against the same copied drawing IDs.
 */
export const DRAWING_COPY_CONTEXT_KEY = 'univer.drawing.copy-plan';

export interface ICreateDrawingCopyPlanOptions {
    unitId: string;
    sourceSubUnitId: string;
    targetSubUnitId: string;
    generateId?: () => string;
}

export interface IDrawingCopyPlan<T extends IDrawingParam = IDrawingParam> {
    idMap: Map<string, string>;
    drawings: T[];
}

function cloneDrawing<T extends IDrawingParam>(drawing: T): T {
    return JSON.parse(JSON.stringify(drawing)) as T;
}

function copyDrawingWithIdMap<T extends IDrawingParam>(
    drawing: T,
    idMap: Map<string, string>,
    options: ICreateDrawingCopyPlanOptions
): T {
    const copied = cloneDrawing(drawing);
    const copiedDrawingId = idMap.get(drawing.drawingId);

    if (copiedDrawingId == null) {
        return copied;
    }

    copied.unitId = options.unitId;
    copied.subUnitId = options.targetSubUnitId;
    copied.drawingId = copiedDrawingId;

    // Remap the parent through the shared plan instead of retaining a relationship to the source sheet.
    if (copied.groupId) {
        const copiedGroupId = idMap.get(copied.groupId);
        if (copiedGroupId) {
            copied.groupId = copiedGroupId;
        } else {
            // The parent is not part of this copy, so avoid leaving a dangling cross-sheet group reference.
            delete copied.groupId;
        }
    }

    return copied;
}

export function createDrawingCopyPlan<T extends IDrawingParam>(
    drawings: readonly T[],
    options: ICreateDrawingCopyPlanOptions
): IDrawingCopyPlan<T> {
    const { generateId = () => generateRandomId(10) } = options;
    const idMap = new Map<string, string>();

    drawings.forEach((drawing) => {
        if (!idMap.has(drawing.drawingId)) {
            idMap.set(drawing.drawingId, generateId());
        }
    });

    return {
        idMap,
        drawings: drawings.map((drawing) => copyDrawingWithIdMap(drawing, idMap, options)),
    };
}

export function getOrCreateDrawingCopyPlan<T extends IDrawingParam>(
    copyContext: Map<string, unknown> | undefined,
    drawings: readonly T[],
    options: ICreateDrawingCopyPlanOptions
): IDrawingCopyPlan<T> {
    if (copyContext == null) {
        return createDrawingCopyPlan(drawings, options);
    }

    const cached = copyContext.get(DRAWING_COPY_CONTEXT_KEY) as IDrawingCopyPlan<T> | undefined;
    if (cached) {
        const { generateId = () => generateRandomId(10) } = options;
        // Feature interceptors may contribute different portions of the drawing graph. Extend the plan in
        // place to preserve IDs already consumed by earlier interceptors.
        const hasMissingDrawing = drawings.some((drawing) => !cached.idMap.has(drawing.drawingId));
        if (!hasMissingDrawing) {
            return cached;
        }

        drawings.forEach((drawing) => {
            if (!cached.idMap.has(drawing.drawingId)) {
                cached.idMap.set(drawing.drawingId, generateId());
            }
        });

        const incomingDrawingIds = new Set(drawings.map((drawing) => drawing.drawingId));
        const originalIdByCopiedId = new Map(Array.from(cached.idMap.entries()).map(([drawingId, copiedDrawingId]) => [copiedDrawingId, drawingId]));
        const retainedDrawings = cached.drawings.filter((drawing) => {
            const originalDrawingId = originalIdByCopiedId.get(drawing.drawingId);
            return originalDrawingId == null || !incomingDrawingIds.has(originalDrawingId);
        });

        // Re-copy incoming nodes after extending the map so a child can resolve a group discovered later.
        cached.drawings = [
            ...drawings.map((drawing) => copyDrawingWithIdMap(drawing, cached.idMap, options)),
            ...retainedDrawings,
        ];
        return cached;
    }

    const plan = createDrawingCopyPlan(drawings, options);
    copyContext.set(DRAWING_COPY_CONTEXT_KEY, plan);
    return plan;
}
