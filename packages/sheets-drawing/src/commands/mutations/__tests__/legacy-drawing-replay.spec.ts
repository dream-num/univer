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

import type { IWorkbookData } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, onTestFinished } from 'vitest';
import type { ISheetDrawing } from '../../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { SHEET_DRAWING_PLUGIN } from '../../../controllers/sheet-drawing.controller';
import { normalizeSheetDrawing } from '../../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../../services/sheet-drawing.service';

/**
 * Mutations recorded from v0.15.4 (the last release that stored only
 * `sheetTransform`) and v1.5.2 builds through their real entry points. Each
 * case inserts a drawing, performs one edit, then undo, redo and another UI
 * drag. The cases were picked from a full matrix of drawing shapes and edits,
 * one for each way old history broke replay or takes a separate branch:
 *
 * - v1.5.2 chart whose position fields hold only from/to, then a UI drag: inserts of
 *   angle/flipX/flipY/skewX/skewY without `r`, and their removal on undo.
 * - v1.5.2 two-cell image, removing rows above: v1.5.2 removes those fields
 *   from `sheetTransform` and adds them back on undo.
 * - v1.5.2 UI rotate and flip: those fields on `axisAlignSheetTransform` with `r`.
 * - v1.5.2 image rotated 90°, inserting columns: `sheetTransform` and
 *   `axisAlignSheetTransform` differ.
 * - v1.5.2 two images: bringing the bottom one to front changes the order;
 *   grouping and ungrouping through the toolbar operations sets and clears
 *   `groupId`, ending ungrouped or, after undo, grouped again.
 * - v1.5.2 floating image inserted from a file, then cropped; Facade builder
 *   image rotated 15°, then cropped (different angle on the two position
 *   fields); Facade setRotate.
 * - v0.15.4 UI drag on a plain and a 90° rotated image, and removing rows
 *   above a chart: whole-field replacements of `sheetTransform` only.
 *
 * `before` of each step is the drawing resource persisted at that point, so
 * each step is a possible cold-load snapshot. `replayed` is the resource a
 * headless runtime of the same release held after replaying the remaining
 * mutations from that snapshot, which is what a server of that release stored.
 * It is the baseline rather than the authoring client's own state: v1.5.2
 * Facade setCrop, setRotate and setSource edit the stored image before
 * diffing, so the client shows changes its mutation never carried.
 */
interface ILegacyFixture {
    version: string;
    workbook: IWorkbookData;
    snapshots: Record<string, string | null>;
    cases: Array<{
        name: string;
        steps: Array<{ label: string; before: string; replayed: string; mutations: Array<{ id: string; params: object }> }>;
    }>;
}

const fixtures = ['legacy-v0.15.4-drawing-mutations.json', 'legacy-v1.5.2-drawing-mutations.json', 'legacy-v1.5.2-float-image-mutations.json']
    .map((file) => JSON.parse(readFileSync(resolve(__dirname, 'fixtures', file), 'utf8')) as ILegacyFixture);
const unitId = 'test';
const subUnitId = 'grid';
const ORIENTATION = ['angle', 'flipX', 'flipY', 'skewX', 'skewY'] as const;
const CELL = ['row', 'rowOffset', 'column', 'columnOffset'] as const;
const CONTENT = ['srcRect', 'prstGeom', 'opacity', 'source', 'imageSourceType'] as const;

type Drawing = ISheetDrawing & Record<string, unknown>;

function same(expected: unknown, actual: unknown): boolean {
    if (typeof expected === 'number' && typeof actual === 'number') return Math.abs(expected - actual) < 0.01;
    // Missing orientation reads as the neutral value.
    return expected === actual || (expected ?? 0) === (actual ?? 0) || (expected ?? false) === (actual ?? false);
}

/** Compare the fields the drawing's anchor type treats as authoritative. */
function describeGeometry(drawing: Drawing | undefined, compareTo: Drawing | undefined): Record<string, unknown> | undefined {
    if (!drawing) return undefined;
    const reference = compareTo ?? drawing;
    const anchor = reference.anchorType ?? SheetDrawingAnchorType.Position;
    const position = drawing.axisAlignSheetTransform ?? drawing.sheetTransform;
    const fields: Record<string, unknown> = { anchorType: drawing.anchorType ?? SheetDrawingAnchorType.Position };
    // Grouped drawings keep their own cell anchor when they have one: v1.5.2
    // groups leave children in sheet coordinates, which follow the layout.
    const referencePosition = reference.axisAlignSheetTransform ?? reference.sheetTransform;
    const anchored = anchor !== SheetDrawingAnchorType.None && (!reference.groupId || referencePosition?.from !== undefined);
    if (anchored) {
        for (const key of CELL) fields[`from.${key}`] = position?.from?.[key];
        if (anchor === SheetDrawingAnchorType.Both) {
            for (const key of CELL) fields[`to.${key}`] = position?.to?.[key];
        }
    }
    const pixels = !anchored
        ? ['left', 'top', 'width', 'height']
        : anchor === SheetDrawingAnchorType.Position ? ['width', 'height'] : [];
    for (const key of pixels) fields[`transform.${key}`] = drawing.transform?.[key as 'left'];
    for (const key of ORIENTATION) {
        fields[key] = drawing.transform?.[key] ?? drawing.sheetTransform?.[key] ?? drawing.axisAlignSheetTransform?.[key];
    }
    for (const key of CONTENT) fields[key] = JSON.stringify(drawing[key] ?? null);
    fields.groupId = drawing.groupId ?? null;
    return fields;
}

function geometryDiff(expected: Drawing | undefined, actual: Drawing | undefined): string[] {
    const e = describeGeometry(expected, expected);
    const a = describeGeometry(actual, expected);
    if (!e || !a) return e === a ? [] : [`exists ${Boolean(e)} -> ${Boolean(a)}`];
    return Object.keys(e).filter((key) => !same(e[key], a[key])).map((key) => `${key} ${JSON.stringify(e[key])} -> ${JSON.stringify(a[key])}`);
}

const runs = fixtures.flatMap((fixture) => fixture.cases.flatMap((testCase) => testCase.steps.map((step, start) => ({ fixture, name: testCase.name, start, label: step.label, testCase }))));

describe.each([
    { layout: 'same layout as the authoring client', rowHeight: undefined, columnWidth: undefined },
    // Server layout can differ from the client that authored the history
    // (fonts, auto height). Cell anchors stay authoritative; pixels do not.
    { layout: 'different server layout', rowHeight: 31, columnWidth: 97 },
])('replays legacy drawing history ($layout)', ({ rowHeight, columnWidth }) => {
    it.each(runs)('$name | cold load before "$label"', ({ fixture, testCase, start }) => {
        const workbook = JSON.parse(JSON.stringify(fixture.workbook)) as IWorkbookData;
        const grid = workbook.sheets[subUnitId]!;
        if (rowHeight) grid.defaultRowHeight = rowHeight;
        if (columnWidth) grid.defaultColumnWidth = columnWidth;
        const snapshot = fixture.snapshots[testCase.steps[start].before];
        workbook.resources = snapshot ? [{ name: SHEET_DRAWING_PLUGIN, data: JSON.stringify(snapshot) }] : [];
        const bed = createSheetsDrawingTestBed(workbook);
        onTestFinished(() => bed.univer.dispose());

        for (const step of testCase.steps.slice(start)) {
            for (const { id, params } of step.mutations) {
                expect(() => bed.commandService.syncExecuteCommand(id, params, { fromChangeset: true }), `${step.label}: ${id}`).not.toThrow();
            }
        }

        const stored = (fixture.snapshots[testCase.steps[start].replayed] as unknown as Record<string, { data: Record<string, Drawing>; order: string[] }> | null)?.[subUnitId];
        const expected = stored?.data ?? {};
        const sheet = bed.get(ISheetDrawingService);
        const manager = bed.get(IDrawingManagerService);
        const skeleton = bed.get(SheetSkeletonService).ensureSkeleton(unitId, subUnitId)!;
        const actual = sheet.getDrawingData(unitId, subUnitId) ?? {};
        expect(sheet.getDrawingOrder(unitId, subUnitId), 'order').toEqual(stored?.order ?? []);
        expect(manager.getDrawingOrder(unitId, subUnitId), 'render store order').toEqual(stored?.order ?? []);
        for (const drawingId of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
            const search = { unitId, subUnitId, drawingId };
            expect(manager.getDrawingByParam(search), `${drawingId}: render store`).toEqual(sheet.getDrawingByParam(search));
            // Releases before axisAlignSheetTransform stored only the unrotated
            // rectangle; compare through the same conversion snapshot loading uses.
            const reference = expected[drawingId] && !expected[drawingId].axisAlignSheetTransform
                ? normalizeSheetDrawing(expected[drawingId], skeleton) as Drawing
                : expected[drawingId];
            expect(geometryDiff(reference, sheet.getDrawingByParam(search) as Drawing), drawingId).toEqual([]);
        }
    });
});
