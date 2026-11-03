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

import { DrawingTypeEnum, ImageSourceType, RedoCommand, Tools, UndoCommand } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import type { ISheetImage } from '../../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../../services/sheet-drawing.service';
import { InsertSheetDrawingCommand } from '../insert-sheet-drawing.command';
import { SetSheetDrawingPlacementCommand } from '../set-sheet-drawing-placement.command';

describe('SetSheetDrawingPlacementCommand', () => {
    it('keeps persisted Position anchors stable across zoom, scroll, undo, and redo', () => {
        const bed = createSheetsDrawingTestBed();
        try {
            const image: ISheetImage = {
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'zoom-image',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                imageSourceType: ImageSourceType.URL,
                source: 'https://example.com/zoom-image.png',
                transform: { left: 120, top: 80, width: 120, height: 40 },
                sheetTransform: {
                    from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                    to: { row: 2, column: 2, rowOffset: 16, columnOffset: 32 },
                },
                axisAlignSheetTransform: {
                    from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                    to: { row: 2, column: 2, rowOffset: 16, columnOffset: 32 },
                },
            };
            expect(bed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
                unitId: 'test',
                drawings: [image],
            })).toBe(true);

            const placement = {
                kind: SheetDrawingAnchorType.Position,
                from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                width: 120,
                height: 40,
            };
            const params = { unitId: 'test', subUnitId: 'sheet1', drawings: [{ drawingId: image.drawingId, placement }] };
            const service = bed.get(ISheetDrawingService);
            const stored = () => Tools.deepClone(service.getDrawingByParam({
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: image.drawingId,
            })!);
            expect(bed.commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, params)).toBe(true);
            const normal = stored();
            expect(normal.sheetTransform.to).toEqual({ row: 2, column: 2, rowOffset: 16, columnOffset: 32 });
            expect(bed.commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);

            const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
            skeleton.setScale(0.75);
            skeleton.setScroll(88, 22);
            expect(bed.commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, params)).toBe(true);
            const zoomed = stored();
            expect(zoomed.sheetTransform).toEqual(normal.sheetTransform);
            expect(zoomed.transform).toEqual(normal.transform);
            expect(bed.commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(bed.commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(stored()).toEqual(zoomed);
        } finally {
            bed.univer.dispose();
        }
    });
});
