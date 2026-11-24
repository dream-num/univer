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
import { DrawingTypeEnum, ImageSourceType, IResourceLoaderService, JSON1, RedoCommand, Tools, UndoCommand } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import { expect, it, onTestFinished } from 'vitest';
import type { ISheetImage } from '../../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { transformToAxisAlignPosition, transformToDrawingPosition } from '../../../basics/transform-position';
import { SHEET_DRAWING_PLUGIN } from '../../../controllers/sheet-drawing.controller';
import { getLegacySheetDrawingPosition } from '../../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../../services/sheet-drawing.service';
import { InsertSheetDrawingCommand } from '../../commands/insert-sheet-drawing.command';
import { RemoveSheetDrawingCommand } from '../../commands/remove-sheet-drawing.command';
import { DrawingApplyType, SetDrawingApplyMutation } from '../set-drawing-apply.mutation';

it.each([
    { source: 'snapshot replay', options: { fromChangeset: true } },
    { source: 'live peer', options: { fromCollab: true } },
    { source: 'live server', options: {} },
])('only applies legacy edits during snapshot replay ($source)', ({ options }) => {
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const unitId = 'test';
    const subUnitId = 'sheet1';
    const skeleton = bed.get(SheetSkeletonService).ensureSkeleton(unitId, subUnitId)!;
    const transform = { left: 200, top: 200, width: 160, height: 40, angle: 90, flipX: true };
    const image: ISheetImage = {
        unitId,
        subUnitId,
        drawingId: 'rotated',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: 'https://example.com/image.png',
        anchorType: SheetDrawingAnchorType.Position,
        transform,
        axisAlignSheetTransform: transformToAxisAlignPosition(transform, skeleton),
    };
    const other = { ...image, drawingId: 'other-image' };
    expect(bed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId, drawings: [image, other] })).toBe(true);
    const legacy = getLegacySheetDrawingPosition(image, skeleton);
    const legacyEdit = JSON1.replaceOp(
        [unitId, subUnitId, 'data', image.drawingId, 'sheetTransform', 'from', 'row'],
        legacy.from.row,
        legacy.from.row + 1
    );
    const canonicalEdit = JSON1.insertOp([unitId, subUnitId, 'data', other.drawingId, 'hidden'], true);
    const params = {
        unitId,
        subUnitId,
        op: JSON1.type.compose(legacyEdit, canonicalEdit),
        objects: [image, other],
        type: DrawingApplyType.UPDATE,
    };

    const service = bed.get(ISheetDrawingService);
    if (!options.fromChangeset) {
        const manager = bed.get(IDrawingManagerService);
        const legacyId = 'legacy-wire-image';
        const draft = { ...image, drawingId: legacyId, sheetTransform: legacy };
        const insert = {
            ...params,
            op: JSON1.type.compose(
                JSON1.insertOp([unitId, subUnitId, 'data', legacyId], draft as unknown as JSON1.Doc),
                JSON1.insertOp([unitId, subUnitId, 'order', 2], legacyId)
            ),
            objects: [draft],
            type: DrawingApplyType.INSERT,
        };
        const read = () => Tools.deepClone({
            sheet: service.getDrawingDataForUnit(unitId),
            render: manager.getDrawingDataForUnit(unitId),
        });
        const before = read();
        for (const edit of [params, insert]) {
            expect(() => bed.commandService.syncExecuteCommand(SetDrawingApplyMutation.id, edit, options))
                .toThrow('Live sheet drawing edits require the current anchor format.');
            expect(read()).toEqual(before);
        }
        return;
    }
    expect(bed.commandService.syncExecuteCommand(SetDrawingApplyMutation.id, params, options)).toBe(true);

    const result = service.getDrawingByParam(image)!;
    expect(result.transform).toMatchObject({ ...transform, top: transform.top + skeleton.worksheet.getRowHeight(legacy.from.row) });
    expect(result.axisAlignSheetTransform.from.row).toBe(image.axisAlignSheetTransform.from.row + 1);
    expect(result).not.toHaveProperty('sheetTransform');
    expect(service.getDrawingByParam(other)).toMatchObject({ hidden: true, transform });
    expect(bed.get(IDrawingManagerService).getDrawingByParam(image)).toEqual(result);
    const saved = bed.get(IResourceLoaderService).saveUnit<IWorkbookData>(unitId)!;
    const resource = saved.resources!.find(({ name }) => name === SHEET_DRAWING_PLUGIN)!;
    expect(JSON.parse(resource.data)[subUnitId].data[image.drawingId]).toEqual(result);
});

it('restores a chart loaded from legacy two-cell markers after deleting it', async () => {
    const seed = createSheetsDrawingTestBed();
    onTestFinished(() => seed.univer.dispose());
    const snapshot = seed.workbook.getSnapshot();
    const drawing = { unitId: 'test', subUnitId: 'sheet1', drawingId: 'imported-chart' };
    snapshot.resources = [{
        name: SHEET_DRAWING_PLUGIN,
        data: JSON.stringify({
            sheet1: {
                order: [drawing.drawingId],
                data: {
                    [drawing.drawingId]: {
                        ...drawing,
                        drawingType: DrawingTypeEnum.DRAWING_CHART,
                        anchorType: SheetDrawingAnchorType.Both,
                        transform: { left: 0, top: 0, width: 0, height: 0 },
                        sheetTransform: {
                            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                            to: { row: 4, column: 4, rowOffset: 0, columnOffset: 0 },
                        },
                    },
                },
            },
        }),
    }];
    const bed = createSheetsDrawingTestBed(snapshot);
    onTestFinished(() => bed.univer.dispose());
    const sheet = bed.get(ISheetDrawingService);
    const manager = bed.get(IDrawingManagerService);
    const before = Tools.deepClone(sheet.getDrawingByParam(drawing));
    expect(before?.transform?.width).toBeGreaterThan(0);
    expect(bed.commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id, { unitId: drawing.unitId, drawings: [drawing] })).toBe(true);
    expect(sheet.getDrawingByParam(drawing)).toBeUndefined();
    expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
    expect(sheet.getDrawingByParam(drawing)).toEqual(before);
    expect(manager.getDrawingByParam(drawing)).toEqual(before);
    expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
    expect(sheet.getDrawingByParam(drawing)).toBeUndefined();
});

it.each([{ reference: { axis: 'row', action: 'insert', start: 0, end: 0, limit: 0, boundaryOffset: 24 } }, {
    reference: { axis: 'row', action: 'move', start: 0, end: 0, limit: 21, boundaryOffset: 24 },
}, { recalculate: 'true' }])('rejects invalid remote reference metadata before either drawing store changes: %j', (invalid) => {
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const marker = { row: 0, column: 0, rowOffset: 0, columnOffset: 0 };
    const drawing: ISheetImage = {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId: 'image',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: 'https://example.com/remote.png',
        anchorType: SheetDrawingAnchorType.None,
        transform: { left: 100, top: 100, width: 160, height: 40 },
        sheetTransform: { from: marker, to: marker },
        axisAlignSheetTransform: { from: marker, to: marker },
    };
    expect(bed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [drawing] })).toBe(true);
    const service = bed.get(ISheetDrawingService);
    const manager = bed.get(IDrawingManagerService);
    const resources = bed.get(IResourceLoaderService);
    const snapshot = () => Tools.deepClone({
        sheet: service.getDrawingByParam(drawing),
        drawing: manager.getDrawingByParam(drawing),
        workbook: resources.saveUnit('test'),
    });
    const before = snapshot();
    const batch = service.getBatchUpdateOp([{ ...drawing, transform: { ...drawing.transform, top: 101 } }]);
    const payload = JSON.parse(JSON.stringify({ unitId: 'test', subUnitId: 'sheet1', op: batch.redo, objects: batch.objects, type: DrawingApplyType.UPDATE, ...invalid }));
    expect(() => bed.commandService.syncExecuteCommand(SetDrawingApplyMutation.id, payload, { fromCollab: true }))
        .toThrow('Invalid drawing reference change.');
    expect(snapshot()).toEqual(before);
});

it('replays legacy chart history whose inserts collide with fields filled by placement refresh', () => {
    // Shapes copied from a production changeset log written by v1.5.x clients:
    // the chart insert carries only from/to markers, and the next update inserts
    // flip/skew keys that the refreshed live drawing already has.
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const unitId = 'test';
    const subUnitId = 'sheet1';
    const drawingId = 'chart';
    const position = {
        from: { row: 4, rowOffset: 26, column: 5, columnOffset: 22 },
        to: { row: 19, rowOffset: 22, column: 10, columnOffset: 38 },
    };
    const replay = { fromChangeset: true };
    const apply = (op: JSON1.JSONOp, type: DrawingApplyType) => bed.commandService.syncExecuteCommand(
        SetDrawingApplyMutation.id,
        { unitId, subUnitId, op, objects: [{ unitId, subUnitId, drawingId }], type },
        replay
    );
    const marker = (prefix: Record<string, number>, from: number[], to: number[]) => [
        ['from', ['column', { i: from[0], r: prefix.fromColumn }], ['columnOffset', { i: from[1], r: prefix.fromColumnOffset }], ['row', { i: from[2], r: prefix.fromRow }], ['rowOffset', { i: from[3], r: prefix.fromRowOffset }]],
        ['to', ['column', { i: to[0], r: prefix.toColumn }], ['columnOffset', { i: to[1], r: prefix.toColumnOffset }], ['row', { i: to[2], r: prefix.toRow }], ['rowOffset', { i: to[3], r: prefix.toRowOffset }]],
    ];
    const old = { fromColumn: 5, fromColumnOffset: 22, fromRow: 4, fromRowOffset: 26, toColumn: 10, toColumnOffset: 38, toRow: 19, toRowOffset: 22 };
    const orientation = [['flipX', { i: false }], ['flipY', { i: false }]];
    const skew = [['skewX', { i: 0 }], ['skewY', { i: 0 }]];
    const [movedFrom, movedTo] = marker(old, [6, 78.8, 0, 14.8], [12, 18.8, 14, 22.8]);
    const moved = [...orientation, movedFrom, ...skew, movedTo];

    expect(apply([unitId, subUnitId, [
        'data',
        drawingId,
        {
            i: {
                unitId,
                subUnitId,
                drawingId,
                drawingType: DrawingTypeEnum.DRAWING_CHART,
                componentKey: 'SheetsChartComponent',
                sheetTransform: position,
                transform: { left: 722, top: 154, width: 468, height: 369 },
                axisAlignSheetTransform: position,
                data: { border: '#979DAC', background: '#fff' },
                allowTransform: true,
            },
        },
    ], ['order', 0, { i: drawingId }]] as unknown as JSON1.JSONOp, DrawingApplyType.INSERT)).toBe(true);
    expect(apply([unitId, subUnitId, 'data', drawingId, ['axisAlignSheetTransform', ...moved], ['sheetTransform', ...moved], ['transform', ...orientation, ['left', { i: 878.8, r: 722 }], ...skew, ['top', { i: 34.8, r: 154 }]]] as unknown as JSON1.JSONOp, DrawingApplyType.UPDATE)).toBe(true);
    const resized = { fromColumn: 6, fromColumnOffset: 78.8, fromRow: 0, fromRowOffset: 14.8, toColumn: 12, toColumnOffset: 18.8, toRow: 14, toRowOffset: 22.8 };
    const resize = marker(resized, [6, 78.8, 0, 14.8], [13, 33.8, 11, 18.8]);
    expect(apply([unitId, subUnitId, 'data', drawingId, ['axisAlignSheetTransform', ...resize], ['sheetTransform', ...resize], ['transform', ['height', { i: 293, r: 369 }], ['width', { i: 571, r: 468 }]]] as unknown as JSON1.JSONOp, DrawingApplyType.UPDATE)).toBe(true);
    expect(apply([unitId, subUnitId, 'data', drawingId, ['axisAlignSheetTransform', 'angle', { i: 0 }], ['sheetTransform', 'angle', { i: 0 }]] as unknown as JSON1.JSONOp, DrawingApplyType.UPDATE)).toBe(true);

    const result = bed.get(ISheetDrawingService).getDrawingByParam({ unitId, subUnitId, drawingId })!;
    expect(result).not.toHaveProperty('sheetTransform');
    // One-cell anchor: the authored start marker and extent survive; the end
    // marker is reprojected from the test bed's row heights.
    expect(result.axisAlignSheetTransform.from).toMatchObject({ row: 0, column: 6, rowOffset: 14.8, columnOffset: 78.8 });
    expect(result.transform).toMatchObject({ width: 571, height: 293, flipX: false, flipY: false });
    expect(bed.get(IDrawingManagerService).getDrawingByParam({ unitId, subUnitId, drawingId })).toEqual(result);
});

it('replays the first v0.15.5-era edit of a drawing created before axisAlignSheetTransform existed', () => {
    // v0.15.4 inserted drawings with `sheetTransform` only. Clients from
    // v0.15.5 to v1.0.0-alpha.2 replaced each changed top-level field with
    // `replaceOp(path, oldValue, newValue)`; axisAlignSheetTransform was missing on
    // their side, so it reached the server as an insert without `r`.
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const unitId = 'test';
    const subUnitId = 'sheet1';
    const drawingId = 'legacy-image';
    const skeleton = bed.get(SheetSkeletonService).ensureSkeleton(unitId, subUnitId)!;
    const transform = { left: 300, top: 160, width: 240, height: 150, angle: 0, flipX: false, flipY: false, skewX: 0, skewY: 0 };
    const inserted = {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: 'https://example.com/legacy.png',
        transform,
        sheetTransform: transformToDrawingPosition(transform, skeleton),
    };
    const objects = [{ unitId, subUnitId, drawingId }];
    const replay = (op: JSON1.JSONOp, type: DrawingApplyType) => bed.commandService.syncExecuteCommand(
        SetDrawingApplyMutation.id,
        JSON.parse(JSON.stringify({ unitId, subUnitId, op, objects, type })),
        { fromChangeset: true }
    );
    expect(replay(JSON1.type.compose(
        JSON1.insertOp([unitId, subUnitId, 'data', drawingId], inserted as unknown as JSON1.Doc),
        JSON1.insertOp([unitId, subUnitId, 'order', 0], drawingId)
    ), DrawingApplyType.INSERT)).toBe(true);
    const service = bed.get(ISheetDrawingService);
    expect(service.getDrawingByParam(objects[0])?.axisAlignSheetTransform).toBeDefined();

    const moved = { ...transform, left: transform.left + 137.4, top: transform.top - 53.2 };
    const field = (key: string) => [unitId, subUnitId, 'data', drawingId, key];
    const drag = [
        JSON1.replaceOp(field('transform'), transform, moved),
        JSON1.replaceOp(field('sheetTransform'), inserted.sheetTransform as unknown as JSON1.Doc, transformToDrawingPosition(moved, skeleton) as unknown as JSON1.Doc),
        JSON1.replaceOp(field('axisAlignSheetTransform'), undefined as never, transformToAxisAlignPosition(moved, skeleton) as unknown as JSON1.Doc),
    ].reduce(JSON1.type.compose, null);
    expect(replay(drag, DrawingApplyType.UPDATE)).toBe(true);

    const result = service.getDrawingByParam(objects[0])!;
    expect(result).not.toHaveProperty('sheetTransform');
    expect(result.axisAlignSheetTransform.from).toEqual(transformToAxisAlignPosition(moved, skeleton).from);
    expect(result.transform).toMatchObject({ left: moved.left, top: moved.top, width: 240, height: 150 });
    expect(bed.get(IDrawingManagerService).getDrawingByParam(objects[0])).toEqual(result);
});
