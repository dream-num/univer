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
import type { Root } from 'react-dom/client';
import { DrawingTypeEnum, ImageSourceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { InsertSheetDrawingCommand, ISheetDrawingService, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetDrawingAnchor } from '../SheetDrawingAnchor';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function createSheetDrawing(drawingId: string, anchorType: SheetDrawingAnchorType): ISheetDrawing {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: `https://example.com/${drawingId}.png`,
        anchorType,
        transform: {
            left: 10,
            top: 20,
            width: 100,
            height: 80,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
        sheetTransform: {
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        },
        axisAlignSheetTransform: {
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        },
    };
}

class TestRenderManagerService {
    readonly clearControl$ = new Subject<boolean>();
    readonly changeStart$ = new Subject<{ objects: Map<string, unknown> }>();

    getRenderById() {
        return {
            scene: {
                getTransformerByCreate: () => ({
                    clearControl$: this.clearControl$,
                    changeStart$: this.changeStart$,
                }),
            },
        };
    }
}

describe('SheetDrawingAnchor', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('updates every focused sheet image when the anchor mode changes', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        ]);
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        const drawingManagerService = testBed.get(IDrawingManagerService);
        const drawings = [
            createSheetDrawing('drawing-a', SheetDrawingAnchorType.Position),
            createSheetDrawing('drawing-b', SheetDrawingAnchorType.Both),
        ];

        await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings,
        });
        drawingManagerService.focusDrawing(drawings.map(({ unitId, subUnitId, drawingId }) => ({ unitId, subUnitId, drawingId })));

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: testBed.injector }}>
                    <SheetDrawingAnchor drawings={drawings} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const options = Array.from(container.querySelectorAll('input[type="radio"]'));
        const noResizeOrMoveOption = options[2] as HTMLInputElement;

        await act(async () => {
            noResizeOrMoveOption.click();
            await Promise.resolve();
        });

        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-a',
        })?.anchorType).toBe(SheetDrawingAnchorType.None);
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-b',
        })?.anchorType).toBe(SheetDrawingAnchorType.None);
        expect((drawingManagerService.getFocusDrawings() as ISheetDrawing[]).map((drawing) => drawing.anchorType)).toEqual([
            SheetDrawingAnchorType.None,
            SheetDrawingAnchorType.None,
        ]);

        testBed.univer.dispose();
    });

    it('hides anchor controls when the transformer clears the sheet image selection', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        ]);
        const renderManagerService = testBed.get(IRenderManagerService) as unknown as TestRenderManagerService;
        const drawings = [
            createSheetDrawing('drawing-a', SheetDrawingAnchorType.Position),
        ];

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: testBed.injector }}>
                    <SheetDrawingAnchor drawings={drawings} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(container.firstElementChild?.classList.contains('univer-hidden')).toBe(false);

        await act(async () => {
            renderManagerService.clearControl$.next(true);
            await Promise.resolve();
        });

        expect(container.firstElementChild?.classList.contains('univer-hidden')).toBe(true);

        testBed.univer.dispose();
    });

    it('syncs the selected anchor mode when the transformer starts editing another sheet image', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        ]);
        const renderManagerService = testBed.get(IRenderManagerService) as unknown as TestRenderManagerService;
        const drawings = [
            createSheetDrawing('drawing-a', SheetDrawingAnchorType.Both),
            createSheetDrawing('drawing-b', SheetDrawingAnchorType.None),
        ];

        await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings,
        });

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: testBed.injector }}>
                    <SheetDrawingAnchor drawings={[drawings[0]]} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const options = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
        expect(options.map((option) => option.checked)).toEqual([true, false, false]);

        const drawingBShapeKey = getDrawingShapeKeyByDrawingSearch({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-b',
        });

        await act(async () => {
            renderManagerService.changeStart$.next({
                objects: new Map([[
                    drawingBShapeKey,
                    { oKey: drawingBShapeKey },
                ]]),
            });
            await Promise.resolve();
        });

        expect(options.map((option) => option.checked)).toEqual([false, false, true]);

        testBed.univer.dispose();
    });
});
