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

import { DrawingTypeEnum, ImageSourceType, IResourceLoaderService, Tools } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { expect, it, onTestFinished } from 'vitest';
import type { ISheetImage } from '../../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../../services/sheet-drawing.service';
import { InsertSheetDrawingCommand } from '../../commands/insert-sheet-drawing.command';
import { DrawingApplyType, SetDrawingApplyMutation } from '../set-drawing-apply.mutation';

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
