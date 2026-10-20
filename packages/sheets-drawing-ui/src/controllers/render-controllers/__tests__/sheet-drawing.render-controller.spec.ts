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
import { DrawingTypeEnum, LocaleType, Tools, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { IDrawingManagerService } from '@univerjs/drawing';
import { CanvasColorService, ICanvasColorService, IRenderManagerService } from '@univerjs/engine-render';
import { SetWorksheetRowAutoHeightMutation, SheetSkeletonService } from '@univerjs/sheets';
import { ISheetDrawingService, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetsDrawingRenderController } from '../sheet-drawing.render-controller';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-drawing/facade';

describe('SheetsDrawingRenderController', () => {
    it.each([
        ['row', SheetDrawingAnchorType.Position],
        ['column', SheetDrawingAnchorType.Position],
        ['auto height', SheetDrawingAnchorType.Position],
        ['row', undefined],
        ['column', undefined],
        ['auto height', undefined],
        ['collapsed row', SheetDrawingAnchorType.Both],
        ['collapsed column', SheetDrawingAnchorType.Both],
    ] as const)('preserves image anchors and size across %s, save, rendering and show (%s)', async (scenario, anchorType) => {
        const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
            { setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D
        );
        const bed = createSheetsDrawingUiTestBed();
        let restored: ReturnType<typeof createSheetsDrawingUiTestBed> | undefined;
        try {
            const book = FUniver.newAPI(bed.univer).getActiveWorkbook()!;
            const sheet = book.getSheets()[0];
            const builder = sheet.newOverGridImage().setSource('https://example.com/drawing.png').setRow(1).setColumn(1).setWidth(180).setHeight(120).setRowOffset(6).setColumnOffset(12);
            if (anchorType !== undefined) {
                builder.setAnchorType(anchorType);
            }
            const image = await builder.buildAsync();
            sheet.insertImages([image]);
            const service = bed.get(ISheetDrawingService);
            const before = Tools.deepClone(service.getDrawingByParam(image)!);
            const rows = scenario === 'row' || scenario === 'collapsed row';
            const count = anchorType === SheetDrawingAnchorType.Both ? 8 : 1;
            const cell = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!.getNoMergeCellWithCoordByIndex(1, 1);
            if (scenario === 'auto height') {
                const worksheet = bed.workbook.getActiveSheet()!;
                expect(bed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    rowsAutoHeightInfo: [{ row: 2, autoHeight: worksheet.getRowHeight(2) + 30 }],
                })).toBe(true);
            } else if (rows) {
                sheet.hideRows(1, count);
            } else {
                sheet.hideColumns(1, count);
            }
            await Promise.resolve();
            const hidden = Tools.deepClone(service.getDrawingByParam(image)!);
            expect(hidden.sheetTransform.from).toEqual(before.sheetTransform.from);
            if (scenario !== 'auto height') {
                expect(hidden.transform?.[rows ? 'top' : 'left']).toBe(rows ? cell.startY : cell.startX);
            }
            if (anchorType === SheetDrawingAnchorType.Both) {
                expect(hidden.transform?.[rows ? 'height' : 'width']).toBe(0);
            } else {
                expect(hidden.transform).toMatchObject({ width: 180, height: 120 });
            }
            restored = createSheetsDrawingUiTestBed(book.save(), [[ICanvasColorService, { useClass: CanvasColorService }]]);
            restored.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
            const manager = restored.get(IRenderManagerService);
            manager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetsDrawingRenderController]);
            manager.createRender('test').with(SheetsDrawingRenderController);
            const restoredService = restored.get(ISheetDrawingService);
            expect(restoredService.getDrawingByParam(image)).toEqual(hidden);
            const restoredSheet = FUniver.newAPI(restored.univer).getActiveWorkbook()!.getSheets()[0];
            if (scenario === 'auto height') {
                expect(restoredService.getDrawingByParam(image)!.transform).toEqual(before.transform);
            } else {
                if (rows) {
                    restoredSheet.showRows(1, count);
                } else {
                    restoredSheet.showColumns(1, count);
                }
                await Promise.resolve();
                expect(restoredService.getDrawingByParam(image)).toEqual(before);
            }
            expect(restored.get(IDrawingManagerService).getDrawingByParam(image))
                .toEqual(restoredService.getDrawingByParam(image));
        } finally {
            restored?.univer.dispose();
            bed.univer.dispose();
            canvasContext.mockRestore();
        }
    });

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
