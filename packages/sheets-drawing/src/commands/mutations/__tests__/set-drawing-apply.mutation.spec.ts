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
import { transformToAxisAlignPosition } from '../../../basics/transform-position';
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
