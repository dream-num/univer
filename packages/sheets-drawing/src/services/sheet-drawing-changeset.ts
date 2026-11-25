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

/** One component of a drawing's edit; `path` is relative to the drawing, so `path[0]` is the field. */
type DrawingEditEntry = [path: JSON1.Path, component: JSON1.JSONOpComponent];
type DrawingEdit = DrawingEditEntry[];

/** Read only from `transform` in the current model; old clients also wrote them on the position fields. */
const ORIENTATION_FIELDS: ReadonlySet<string> = new Set(['angle', 'flipX', 'flipY', 'skewX', 'skewY']);

const isInsertOnly = (component: JSON1.JSONOpComponent) => component.i !== undefined && component.r === undefined;
const isRemoveOnly = (component: JSON1.JSONOpComponent) => component.r !== undefined && component.i === undefined;
const asReplace = (component: JSON1.JSONOpComponent): JSON1.JSONOpComponent => ({ ...component, r: true });

/** The whole `field`, e.g. `['axisAlignSheetTransform']`. */
const isWholeField = (path: JSON1.Path, field: string) => path.length === 1 && path[0] === field;
/** `field.angle`, `field.flipX`, ... */
const isOrientationOn = (path: JSON1.Path, field: string) =>
    path.length === 2 && path[0] === field && ORIENTATION_FIELDS.has(path[1] as string);
const isPositionField = (path: JSON1.Path) => path[0] === 'sheetTransform' || path[0] === 'axisAlignSheetTransform';
const editsField = (edit: DrawingEdit, field: string) => edit.some(([path]) => path[0] === field);

/** Whether an edit involves any field whose format changed since older clients. */
function touchesLegacyFields(edit: DrawingEdit): boolean {
    return edit.some(([path]) => isPositionField(path) || isOrientationOn(path, 'transform'));
}

/**
 * Translate drawing edits in persisted history written by older clients.
 * Edits that pass `touchesLegacyFields` for no drawing are returned
 * unchanged; see `translateHistoricalDrawingEdit` for the rest.
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
    if (![...edits.values()].some(touchesLegacyFields)) return op;

    for (const [drawingId, edit] of edits) {
        for (const [path, component] of translateHistoricalDrawingEdit(edit, getDrawing(drawingId), getSkeleton)) {
            result.mergeTree([unitId, subUnitId, 'data', drawingId, ...path, component]);
        }
    }
    return result.get();
}

/**
 * 1. Drop `angle/flipX/flipY/skewX/skewY` on the position fields.
 * 2. Reconcile the edit with values loading filled in (`reconcileWithLoadedValues`).
 * 3. Pick the position field the edit was authored against:
 *    - `axisAlignSheetTransform` (clients from v0.15.5): it is authoritative,
 *      and `sheetTransform` is dropped.
 *    - `sheetTransform` only (clients up to v0.15.4): apply the edit to a view
 *      of the current drawing and replace the drawing with the result.
 *    - Neither: apply the edit as it is.
 */
function translateHistoricalDrawingEdit(
    edit: DrawingEdit,
    current: ISheetDrawing | undefined,
    getSkeleton: () => SpreadsheetSkeleton | undefined
): DrawingEdit {
    const cleaned = edit
        .filter(([path]) => !isOrientationOn(path, 'sheetTransform') && !isOrientationOn(path, 'axisAlignSheetTransform'))
        .flatMap((entry) => reconcileWithLoadedValues(entry, current));

    if (editsField(cleaned, 'axisAlignSheetTransform')) {
        return cleaned.filter(([path]) => path[0] !== 'sheetTransform');
    }
    if (editsField(cleaned, 'sheetTransform')) {
        if (!current) throw new Error('Missing drawing for legacy placement edit.');
        return [[[], { r: true, i: applySheetTransformEdit(current, cleaned, getSkeleton()) as unknown as JSON1.Doc }]];
    }
    return cleaned;
}

/**
 * Loading a drawing fills in values old clients never had:
 * `axisAlignSheetTransform` is derived for drawings created before v0.15.5,
 * and `angle/flipX/flipY/skewX/skewY` are copied from the position fields into
 * `transform` (`getSheetDrawingTransformWithOrientation`), as for images
 * imported from XLSX. Old edits therefore insert those values without `r`, or
 * remove them where loading never filled them in:
 *
 * | Target                        | Insert only, value loaded | Remove only                    |
 * | ----------------------------- | ------------------------- | ------------------------------ |
 * | whole axisAlignSheetTransform | replace                   | drop                           |
 * | angle/flipX/... on transform  | replace                   | drop when the value is missing |
 *
 * The whole-field cases come from clients up to v1.0.0-alpha.2, which replaced
 * whole fields: the first edit of a pre-v0.15.5 drawing inserts
 * `axisAlignSheetTransform`, and its undo from `invertWithDoc` removes it while
 * restoring `sheetTransform`, from which the anchor is derived again.
 */
function reconcileWithLoadedValues(entry: DrawingEditEntry, current: ISheetDrawing | undefined): DrawingEdit {
    const [path, component] = entry;
    const wholeAxisAlign = isWholeField(path, 'axisAlignSheetTransform');
    if (!wholeAxisAlign && !isOrientationOn(path, 'transform')) return [entry];

    const loaded = valueAt(current, path);
    if (isInsertOnly(component) && loaded !== undefined) return [[path, asReplace(component)]];
    if (isRemoveOnly(component) && (wholeAxisAlign || loaded === undefined)) return [];
    return [entry];
}

/** Apply an edit authored against `sheetTransform` only, and derive `axisAlignSheetTransform` from it. */
function applySheetTransformEdit(current: ISheetDrawing, edit: DrawingEdit, skeleton: SpreadsheetSkeleton | undefined): ISheetDrawing {
    const view = { ...current };
    // Leaf edits and replacements need the old value; the current model no longer stores it.
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

function valueAt(drawing: ISheetDrawing | undefined, path: JSON1.Path): unknown {
    return path.reduce<unknown>((node, key) => (node === null || typeof node !== 'object' ? undefined : (node as Record<string | number, unknown>)[key]), drawing);
}

function getDrawingId(path: JSON1.Path, unitId: string, subUnitId: string): string | undefined {
    const [unit, sheet, root, id] = path;
    return unit === unitId && sheet === subUnitId && root === 'data' && typeof id === 'string' ? id : undefined;
}
