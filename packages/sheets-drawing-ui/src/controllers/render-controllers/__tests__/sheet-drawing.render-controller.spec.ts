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

import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import type { Subscription } from 'rxjs';
import { DrawingTypeEnum, LocaleType, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { CanvasColorService, ICanvasColorService, IRenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import { ISheetDrawingService, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetsDrawingRenderController } from '../sheet-drawing.render-controller';

describe('SheetsDrawingRenderController', () => {
    it('renders legacy cell anchors while preserving explicit absolute and group-local bounds', () => {
        const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
            { setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D
        );
        const bed = createSheetsDrawingUiTestBed({
            id: 'unit-1',
            name: 'Book',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: {
                'sheet-1': {
                    id: 'sheet-1',
                    name: 'Sheet1',
                    rowCount: 20,
                    columnCount: 20,
                    defaultRowHeight: 36,
                    defaultColumnWidth: 12,
                    cellData: {},
                },
            },
        }, [[ICanvasColorService, { useClass: CanvasColorService }]]);
        const subscriptions: Subscription[] = [];
        try {
            const sheetTransform = {
                from: { row: 1, column: 2, rowOffset: 0, columnOffset: 0 },
                to: { row: 3, column: 4, rowOffset: 0, columnOffset: 0 },
            };
            const legacy: Partial<ISheetDrawing> = {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'legacy-anchor',
                drawingType: DrawingTypeEnum.DRAWING_DOM,
                sheetTransform,
                transform: { left: 1000, top: 2000, width: 24, height: 72 },
            };
            const missingSkeleton: Partial<ISheetDrawing> = {
                unitId: 'unit-1',
                subUnitId: 'missing-sheet',
                drawingId: 'missing-skeleton',
                anchorType: SheetDrawingAnchorType.Both,
                sheetTransform,
            };
            const grouped: Partial<ISheetDrawing> = {
                ...legacy,
                drawingId: 'grouped',
                groupId: 'group-1',
                anchorType: SheetDrawingAnchorType.Position,
                transform: { left: 2, top: 3, width: 40, height: 50 },
            };
            const group: Partial<ISheetDrawing> = {
                ...legacy,
                drawingId: 'group',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                anchorType: SheetDrawingAnchorType.Both,
            };
            const absolute: Partial<ISheetDrawing> = {
                ...legacy,
                drawingId: 'absolute',
                anchorType: SheetDrawingAnchorType.None,
                transform: { left: 240, top: 96, width: 120, height: 80 },
            };
            const drawingData = {
                'sheet-1': {
                    data: {
                        [legacy.drawingId!]: legacy,
                        [grouped.drawingId!]: grouped,
                        [group.drawingId!]: group,
                        [absolute.drawingId!]: absolute,
                        'missing-transform': { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'missing-transform' },
                    },
                    order: ['legacy-anchor', 'grouped', 'group', 'absolute', 'missing-transform'],
                },
                'missing-sheet': {
                    data: { [missingSkeleton.drawingId!]: missingSkeleton },
                    order: ['missing-skeleton'],
                },
            };
            const sheetDrawingService = bed.get(ISheetDrawingService);
            const drawingManagerService = bed.get(IDrawingManagerService);
            const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('unit-1', 'sheet-1');
            if (!skeleton) {
                throw new Error('Expected the Sheet skeleton to exist.');
            }
            sheetDrawingService.registerDrawingData('unit-1', drawingData as never);
            const sheetDrawingsAdded = vi.fn();
            const renderDrawingsAdded = vi.fn();
            subscriptions.push(
                sheetDrawingService.add$.subscribe(sheetDrawingsAdded),
                drawingManagerService.add$.subscribe(renderDrawingsAdded)
            );
            const renderManager = bed.get(IRenderManagerService);
            renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetsDrawingRenderController]);
            const render = renderManager.createRender('unit-1');
            render.with(SheetsDrawingRenderController);

            const initializedDrawings = Object.values(drawingData).flatMap((subUnit) => Object.values(subUnit.data));
            expect(sheetDrawingsAdded).toHaveBeenCalledExactlyOnceWith(expect.arrayContaining(initializedDrawings));
            expect(renderDrawingsAdded).toHaveBeenCalledExactlyOnceWith(expect.arrayContaining(initializedDrawings));
            const marker = skeleton.getNoMergeCellWithCoordByIndex(1, 2);
            expect(legacy.transform).toMatchObject({ left: marker.startX, top: marker.startY, width: 24, height: 72 });
            expect(legacy).not.toHaveProperty('anchorType');
            expect(group.transform).toMatchObject({
                left: marker.startX - skeleton.rowHeaderWidthAndMarginLeft,
                top: marker.startY - skeleton.columnHeaderHeightAndMarginTop,
                width: 24,
                height: 72,
            });
            expect(grouped.transform).toEqual({ left: 2, top: 3, width: 40, height: 50 });
            expect(absolute.transform).toEqual({ left: 240, top: 96, width: 120, height: 80 });
            expect(missingSkeleton).not.toHaveProperty('transform');
            expect(drawingManagerService.getDrawingByParam({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'legacy-anchor',
            })?.transform).toEqual(legacy.transform);
        } finally {
            subscriptions.forEach((subscription) => subscription.unsubscribe());
            bed.univer.dispose();
            canvasContext.mockRestore();
        }
    });
});
