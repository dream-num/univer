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

/** Component of an edit, with its path relative to the drawing (`path[0]` is the field). */
type DrawingEdit = Array<[path: JSON1.Path, component: JSON1.JSONOpComponent]>;

/** Old clients also wrote these on `sheetTransform` and `axisAlignSheetTransform`; the current model reads them only from `transform`. */
const ORIENTATION_FIELDS: ReadonlySet<string> = new Set(['angle', 'flipX', 'flipY', 'skewX', 'skewY']);

function isPositionField(path: JSON1.Path): boolean {
    return path[0] === 'sheetTransform' || path[0] === 'axisAlignSheetTransform';
}

function isOrientationOnPositionField([field, key, ...rest]: JSON1.Path): boolean {
    return isPositionField([field]) && rest.length === 0 && ORIENTATION_FIELDS.has(key as string);
}

function isOrientationOnTransform([field, key, ...rest]: JSON1.Path): boolean {
    return field === 'transform' && rest.length === 0 && ORIENTATION_FIELDS.has(key as string);
}

/**
 * Translate drawing edits in persisted history written by older clients.
 * Edits that touch neither `sheetTransform`, `axisAlignSheetTransform` nor
 * `angle/flipX/flipY/skewX/skewY` on `transform` are returned unchanged; see
 * `translateHistoricalDrawingEdit` for the rest.
 */
export function normalizeHistoricalSheetDrawingEdit(
    op: JSON1.JSONOp,
    unitId: string,
    subUnitId: string,
    getDrawing: (drawingId: string) => ISheetDrawing | undefined,
    getSkeleton: () => SpreadsheetSkeleton | undefined
): JSON1.JSONOp {
    JSON1.type.checkValidOp(op);
    const result = JSON1.type.writeCursor();
    const edits = new Map<string, DrawingEdit>();
    const cursor = JSON1.type.readCursor(op);
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        const drawingId = getDrawingId(path, unitId, subUnitId);
        if (drawingId === undefined) {
            result.mergeTree([...path, component]);
            return;
        }
        const edit = edits.get(drawingId) ?? [];
        edit.push([path.slice(4), component]);
        edits.set(drawingId, edit);
    });
    if (![...edits.values()].some((edit) => edit.some(([path]) => isPositionField(path) || isOrientationOnTransform(path)))) return op;

    for (const [drawingId, edit] of edits) {
        const translated = translateHistoricalDrawingEdit(edit, () => getDrawing(drawingId), getSkeleton);
        for (const [path, component] of translated) {
            result.mergeTree([unitId, subUnitId, 'data', drawingId, ...path, component]);
        }
    }
    return result.get();
}

/**
 * - Drop `angle/flipX/flipY/skewX/skewY` on `sheetTransform` and
 *   `axisAlignSheetTransform`, and removals of the whole
 *   `axisAlignSheetTransform` (see `removesWholeAxisAlign`). Reconcile those
 *   fields on `transform` with the values loading filled in (see
 *   `reconcileOrientationOnTransform`).
 * - Clients from v0.15.5 on write `axisAlignSheetTransform` next to
 *   `sheetTransform`. When the edit still writes `axisAlignSheetTransform`,
 *   it is authoritative and `sheetTransform` is dropped.
 * - Clients up to v0.15.4 wrote only `sheetTransform`. Such an edit is applied
 *   to a view of the current drawing, and the result replaces the drawing.
 */
function translateHistoricalDrawingEdit(
    edit: DrawingEdit,
    getDrawing: () => ISheetDrawing | undefined,
    getSkeleton: () => SpreadsheetSkeleton | undefined
): DrawingEdit {
    const kept = edit
        .filter(([path, component]) => !isOrientationOnPositionField(path) && !removesWholeAxisAlign(path, component))
        .flatMap((entry) => reconcileOrientationOnTransform(entry, getDrawing));
    if (kept.some(([[field]]) => field === 'axisAlignSheetTransform')) {
        return kept
            .filter(([[field]]) => field !== 'sheetTransform')
            .map(([path, component]) => [path, replacesExistingAxisAlign(path, component, getDrawing) ? { ...component, r: true } : component]);
    }
    if (kept.some(([[field]]) => field === 'sheetTransform')) {
        const current = getDrawing();
        if (!current) throw new Error('Missing drawing for legacy placement edit.');
        return [[[], { r: true, i: applySheetTransformEdit(current, kept, getSkeleton()) as unknown as JSON1.Doc }]];
    }
    return kept;
}

/**
 * Loading copies `angle/flipX/flipY/skewX/skewY` from `sheetTransform` or
 * `axisAlignSheetTransform` into `transform` when `transform` lacks them
 * (`getSheetDrawingTransformWithOrientation`), as with drawings imported from
 * XLSX. Old clients edited `transform` without those values, so they inserted
 * one without `r`, or removed one loading never filled. The insert replaces
 * the filled value; the removal is dropped.
 */
function reconcileOrientationOnTransform(
    [path, component]: DrawingEdit[number],
    getDrawing: () => ISheetDrawing | undefined
): DrawingEdit {
    if (!isOrientationOnTransform(path)) return [[path, component]];
    const current = (getDrawing()?.transform as Record<string, unknown> | undefined)?.[path[1] as string];
    if (component.i !== undefined && component.r === undefined && current !== undefined) return [[path, { ...component, r: true }]];
    if (component.r !== undefined && component.i === undefined && current === undefined) return [];
    return [[path, component]];
}

/**
 * Clients up to v1.0.0-alpha.2 replaced whole fields and sent no `r` for a
 * field missing on their side. On the first edit of a drawing created before
 * v0.15.5, that inserts `axisAlignSheetTransform`, which the current model
 * already derived when it loaded the drawing.
 */
function replacesExistingAxisAlign(path: JSON1.Path, component: JSON1.JSONOpComponent, getDrawing: () => ISheetDrawing | undefined): boolean {
    return path.length === 1 && path[0] === 'axisAlignSheetTransform'
        && component.i !== undefined && component.r === undefined
        && getDrawing()?.axisAlignSheetTransform !== undefined;
}

/**
 * The undo of that first edit, generated with `invertWithDoc`, removes the
 * whole `axisAlignSheetTransform` and restores `sheetTransform`. The current
 * model derives `axisAlignSheetTransform` from the restored `sheetTransform`
 * instead; without a `sheetTransform` edit it keeps the cell anchor it has.
 */
function removesWholeAxisAlign(path: JSON1.Path, component: JSON1.JSONOpComponent): boolean {
    return path.length === 1 && path[0] === 'axisAlignSheetTransform'
        && component.r !== undefined && component.i === undefined;
}

/** Apply an edit authored against `sheetTransform` only, and derive `axisAlignSheetTransform` from it. */
function applySheetTransformEdit(current: ISheetDrawing, edit: DrawingEdit, skeleton: SpreadsheetSkeleton | undefined): ISheetDrawing {
    const view = { ...current };
    const readsOldValue = edit.some(([path, component]) => path[0] === 'sheetTransform' && (path.length > 1 || component.r !== undefined));
    if (!view.sheetTransform && readsOldValue && skeleton) {
        view.sheetTransform = getLegacySheetDrawingPosition(current, skeleton);
    }
    const writer = JSON1.type.writeCursor();
    for (const [path, component] of edit) writer.mergeTree([...path, component]);
    const updated = { ...JSON1.type.apply(view as unknown as JSON1.Doc, writer.get()) as unknown as ISheetDrawing };
    if (updated.sheetTransform) {
        // The old axisAlignSheetTransform no longer matches the edited rectangle.
        Reflect.deleteProperty(updated, 'axisAlignSheetTransform');
    }
    const normalized = skeleton && !updated.groupId && updated.anchorType !== SheetDrawingAnchorType.None
        ? refreshSheetDrawingPlacement(updated, skeleton)
        : normalizeSheetDrawing(updated);
    const { sheetTransform: _legacy, ...drawing } = normalized;
    return drawing as ISheetDrawing;
}

function getDrawingId(path: JSON1.Path, unitId: string, subUnitId: string): string | undefined {
    const [unit, sheet, root, id] = path;
    return unit === unitId && sheet === subUnitId && root === 'data' && typeof id === 'string' ? id : undefined;
}
