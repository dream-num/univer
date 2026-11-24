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

/** `angle`, `flipX`, `flipY`, `skewX` and `skewY`: read only from `transform` in the current model. */
const ORIENTATION_FIELDS: ReadonlySet<string> = new Set(['angle', 'flipX', 'flipY', 'skewX', 'skewY']);

/** `angle/flipX/flipY/skewX/skewY` written on `sheetTransform` or `axisAlignSheetTransform`. */
function isMarkerOrientation(path: JSON1.Path): boolean {
    return (path[4] === 'sheetTransform' || path[4] === 'axisAlignSheetTransform')
        && path.length === 6
        && ORIENTATION_FIELDS.has(path[5] as string);
}

/**
 * Translate drawing edits in persisted history written by older clients.
 *
 * - `angle/flipX/flipY/skewX/skewY` on either marker are dropped; the
 *   current model reads them from `transform` only.
 * - Clients from v0.15.5 on write `axisAlignSheetTransform` next to
 *   `sheetTransform`. When an edit still touches the axis marker, it is
 *   authoritative and `sheetTransform` is dropped. Clients up to
 *   v1.0.0-alpha.2 replaced whole fields and omitted `r` when the field was
 *   missing locally, which is the case on the first edit of a drawing created
 *   before v0.15.5; that insert replaces the marker the current model holds.
 * - Clients up to v0.15.4 wrote only `sheetTransform`. Such edits are applied
 *   to a view rebuilt from the current drawing, and the axis marker is derived
 *   from the result.
 */
export function normalizeHistoricalSheetDrawingEdit(
    op: JSON1.JSONOp,
    unitId: string,
    subUnitId: string,
    getDrawing: (drawingId: string) => ISheetDrawing | undefined,
    getSkeleton: () => SpreadsheetSkeleton | undefined
): JSON1.JSONOp {
    JSON1.type.checkValidOp(op);
    const cursor = JSON1.type.readCursor(op);
    const markerEdits = new Set<string>();
    const axisEdits = new Set<string>();
    // Unrotated-marker edits that need the old value (leaf edits or removals).
    const unrotatedEdits = new Map<string, boolean>();
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        const drawingId = getDrawingId(path, unitId, subUnitId);
        const field = path[4];
        if (drawingId === undefined || (field !== 'sheetTransform' && field !== 'axisAlignSheetTransform')) return;
        markerEdits.add(drawingId);
        if (isMarkerOrientation(path)) return;
        if (field === 'axisAlignSheetTransform') {
            axisEdits.add(drawingId);
        } else {
            unrotatedEdits.set(drawingId, Boolean(unrotatedEdits.get(drawingId) || path.length > 5 || component.r !== undefined));
        }
    });
    if (!markerEdits.size) return op;

    const canonical = JSON1.type.writeCursor();
    const viewEdits = new Map<string, JSON1.WriteCursor>();
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        const drawingId = getDrawingId(path, unitId, subUnitId);
        if (drawingId === undefined || !markerEdits.has(drawingId)) {
            canonical.mergeTree([...path, component]);
            return;
        }
        if (isMarkerOrientation(path)) return;
        if (axisEdits.has(drawingId)) {
            if (path[4] === 'sheetTransform') return;
            const insertsWholeAxis = path[4] === 'axisAlignSheetTransform' && path.length === 5
                && component.i !== undefined && component.r === undefined;
            const replaces = insertsWholeAxis && getDrawing(drawingId)?.axisAlignSheetTransform !== undefined;
            canonical.mergeTree([...path, replaces ? { ...component, r: true } : component]);
            return;
        }
        if (unrotatedEdits.has(drawingId)) {
            let writer = viewEdits.get(drawingId);
            if (!writer) {
                writer = JSON1.type.writeCursor();
                viewEdits.set(drawingId, writer);
            }
            writer.mergeTree([...path.slice(4), component]);
            return;
        }
        canonical.mergeTree([...path, component]);
    });

    const skeleton = viewEdits.size ? getSkeleton() : undefined;
    for (const [drawingId, writer] of viewEdits) {
        const current = getDrawing(drawingId);
        if (!current) throw new Error('Missing drawing for legacy placement edit.');
        const view = { ...current };
        if (!view.sheetTransform && unrotatedEdits.get(drawingId) && skeleton) {
            view.sheetTransform = getLegacySheetDrawingPosition(current, skeleton);
        }
        const updated = { ...JSON1.type.apply(view as unknown as JSON1.Doc, writer.get()) as unknown as ISheetDrawing };
        if (updated.sheetTransform) {
            // The edit was authored against the unrotated marker only.
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
