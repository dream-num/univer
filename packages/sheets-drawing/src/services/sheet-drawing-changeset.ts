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

import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import { JSON1 } from '@univerjs/core';
import type { ISetDrawingApplyMutationParams } from '../commands/mutations/set-drawing-apply.mutation';
import type { ISheetDrawing } from './sheet-drawing.service';
import { getLegacySheetDrawingPosition, normalizeSheetDrawing, refreshSheetDrawingPlacement } from './sheet-drawing-placement';
import { SheetDrawingAnchorType } from './sheet-drawing.service';

function isLegacyDrawing(value: JSON1.Doc | undefined): boolean {
    return value !== undefined && value !== null && typeof value === 'object' && 'sheetTransform' in value;
}

function hasLegacyDrawingInInsert(value: JSON1.Doc, path: JSON1.Path): boolean {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    if (path.length === 4) return path[2] === 'data' && isLegacyDrawing(value);
    if (path.length === 3) return path[2] === 'data' && Object.values(value).some(isLegacyDrawing);
    if (path.length === 2) {
        return value.data !== undefined && hasLegacyDrawingInInsert(value.data, [...path, 'data']);
    }
    return Object.entries(value).some(([key, child]) => hasLegacyDrawingInInsert(child, [...path, key]));
}

/** Only snapshot replay may apply updates authored against the old drawing format. */
export function assertCurrentSheetDrawingEdit({ op, reference }: Pick<ISetDrawingApplyMutationParams, 'op' | 'reference'>): void {
    if (reference?.legacyPositionDrawingIds !== undefined) {
        throw new Error('Live sheet drawing edits require the current anchor format.');
    }
    const cursor = JSON1.type.readCursor(op);
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        if ((path[2] === 'data' && path[4] === 'sheetTransform')
            || (path.length <= 4 && component.i !== undefined && hasLegacyDrawingInInsert(component.i, path))) {
            throw new Error('Live sheet drawing edits require the current anchor format.');
        }
    });
}

/** Translate old marker edits in persisted history against a detached view. */
export function normalizeHistoricalSheetDrawingEdit(
    op: JSON1.JSONOp,
    unitId: string,
    subUnitId: string,
    getDrawing: (drawingId: string) => ISheetDrawing | undefined,
    getSkeleton: () => SpreadsheetSkeleton | undefined
): JSON1.JSONOp {
    JSON1.type.checkValidOp(op);
    const cursor = JSON1.type.readCursor(op);
    const legacy = new Map<string, boolean>();
    const authoredAxis = new Set<string>();
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        const drawingId = getDrawingId(path, unitId, subUnitId);
        if (drawingId === undefined) return;
        const field = path[4];
        if (field === 'axisAlignSheetTransform') authoredAxis.add(drawingId);
        if (field === 'sheetTransform') {
            legacy.set(drawingId, Boolean(legacy.get(drawingId) || path.length > 5 || component.r !== undefined));
        }
    });
    if (!legacy.size) return op;

    const skeleton = getSkeleton();
    const canonical = JSON1.type.writeCursor();
    const legacyOps = new Map(Array.from(legacy.keys(), (id) => [id, JSON1.type.writeCursor()]));
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        const drawingId = getDrawingId(path, unitId, subUnitId);
        const writer = drawingId === undefined ? undefined : legacyOps.get(drawingId);
        if (writer) {
            writer.mergeTree([...path.slice(4), component]);
        } else {
            canonical.mergeTree([...path, component]);
        }
    });

    for (const [drawingId, writer] of legacyOps) {
        const current = getDrawing(drawingId);
        if (!current) throw new Error('Missing drawing for legacy placement edit.');
        const view = { ...current };
        if (!view.sheetTransform && legacy.get(drawingId) && skeleton) {
            view.sheetTransform = getLegacySheetDrawingPosition(current, skeleton);
        }
        const result = JSON1.type.apply(view as unknown as JSON1.Doc, writer.get()) as unknown as ISheetDrawing;
        const updated = { ...result };
        if (updated.sheetTransform && !authoredAxis.has(drawingId)) {
            // The old geometry was authored against the unrotated marker.
            Reflect.deleteProperty(updated, 'axisAlignSheetTransform');
        }
        const normalized = skeleton && !updated.groupId && updated.anchorType !== SheetDrawingAnchorType.None
            ? refreshSheetDrawingPlacement(updated, skeleton)
            : normalizeSheetDrawing(updated);
        const { sheetTransform: _legacy, ...drawing } = normalized;
        canonical.mergeTree([unitId, subUnitId, 'data', drawingId, { r: true, i: drawing as unknown as JSON1.Doc }]);
    }
    return canonical.get();
}

function getDrawingId(path: JSON1.Path, unitId: string, subUnitId: string): string | undefined {
    const [unit, sheet, root, id] = path;
    return unit === unitId && sheet === subUnitId && root === 'data' && typeof id === 'string' ? id : undefined;
}
