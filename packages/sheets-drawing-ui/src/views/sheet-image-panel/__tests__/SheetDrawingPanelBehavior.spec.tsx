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
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingImageClipService } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { InsertSheetDrawingCommand, ISheetDrawingService, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { ComponentManager, IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetDrawingPanel } from '../SheetDrawingPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestTransformer {
    readonly clearControl$ = new Subject<boolean>();
    readonly changeStart$ = new Subject<{ objects: Map<string, { oKey: string }> }>();
    readonly changing$ = new Subject<{ objects: Map<string, { oKey: string }> }>();
    readonly changeEnd$ = new Subject<{ objects: Map<string, { oKey: string }> }>();
    keepRatio = true;

    refreshControls() {
        return {
            changeNotification: () => undefined,
        };
    }
}

class TestScene {
    ancestorLeft = 0;
    ancestorTop = 0;

    constructor(private readonly _transformer: TestTransformer) {}

    getEngine() {
        return {
            activeScene: {
                width: 500,
                height: 400,
            },
        };
    }

    getTransformerByCreate() {
        return this._transformer;
    }
}

class TestRenderManagerService {
    readonly transformer = new TestTransformer();
    readonly scene = new TestScene(this.transformer);

    getRenderById() {
        return {
            scene: this.scene,
        };
    }
}

function createSheetDrawing(unitId: string, subUnitId: string, drawingId: string, anchorType: SheetDrawingAnchorType): ISheetDrawing {
    return {
        unitId,
        subUnitId,
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

describe('SheetDrawingPanel behavior', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createSheetsDrawingUiTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('applies anchor changes after the image panel receives focused drawings', async () => {
        currentTestBed = createSheetsDrawingUiTestBed(undefined, [
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
            [IconManager],
            [ComponentManager],
            [DrawingImageClipService],
        ]);
        const drawingManagerService = currentTestBed.get(IDrawingManagerService);
        const sheetDrawingService = currentTestBed.get(ISheetDrawingService);
        const drawings = [
            createSheetDrawing(currentTestBed.unitId, currentTestBed.subUnitId, 'drawing-a', SheetDrawingAnchorType.Position),
            createSheetDrawing(currentTestBed.unitId, currentTestBed.subUnitId, 'drawing-b', SheetDrawingAnchorType.Both),
        ];

        await currentTestBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: currentTestBed.unitId,
            drawings,
        });

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetDrawingPanel />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await act(async () => {
            drawingManagerService.focusDrawing(drawings.map(({ unitId, subUnitId, drawingId }) => ({ unitId, subUnitId, drawingId })));
            await Promise.resolve();
        });

        const noResizeOrMoveOption = container.querySelectorAll<HTMLInputElement>('input[type="radio"]')[2];

        await act(async () => {
            noResizeOrMoveOption.click();
            await Promise.resolve();
        });

        expect(sheetDrawingService.getDrawingByParam({
            unitId: currentTestBed.unitId,
            subUnitId: currentTestBed.subUnitId,
            drawingId: 'drawing-a',
        })?.anchorType).toBe(SheetDrawingAnchorType.None);
        expect(sheetDrawingService.getDrawingByParam({
            unitId: currentTestBed.unitId,
            subUnitId: currentTestBed.subUnitId,
            drawingId: 'drawing-b',
        })?.anchorType).toBe(SheetDrawingAnchorType.None);
    });

    it('applies anchor changes when the image panel opens with an existing sheet image focus', async () => {
        currentTestBed = createSheetsDrawingUiTestBed(undefined, [
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
            [IconManager],
            [ComponentManager],
            [DrawingImageClipService],
        ]);
        const drawingManagerService = currentTestBed.get(IDrawingManagerService);
        const sheetDrawingService = currentTestBed.get(ISheetDrawingService);
        const drawings = [
            createSheetDrawing(currentTestBed.unitId, currentTestBed.subUnitId, 'drawing-a', SheetDrawingAnchorType.None),
        ];

        await currentTestBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: currentTestBed.unitId,
            drawings,
        });
        drawingManagerService.focusDrawing(drawings.map(({ unitId, subUnitId, drawingId }) => ({ unitId, subUnitId, drawingId })));

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetDrawingPanel />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const resizeAndMoveOption = container.querySelectorAll<HTMLInputElement>('input[type="radio"]')[0];

        await act(async () => {
            resizeAndMoveOption.click();
            await Promise.resolve();
        });

        expect(sheetDrawingService.getDrawingByParam({
            unitId: currentTestBed.unitId,
            subUnitId: currentTestBed.subUnitId,
            drawingId: 'drawing-a',
        })?.anchorType).toBe(SheetDrawingAnchorType.Both);
    });

    it('removes image controls when sheet drawing focus is cleared', async () => {
        currentTestBed = createSheetsDrawingUiTestBed(undefined, [
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
            [IconManager],
            [ComponentManager],
            [DrawingImageClipService],
        ]);
        const drawingManagerService = currentTestBed.get(IDrawingManagerService);
        const drawings = [
            createSheetDrawing(currentTestBed.unitId, currentTestBed.subUnitId, 'drawing-a', SheetDrawingAnchorType.Position),
        ];

        await currentTestBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: currentTestBed.unitId,
            drawings,
        });

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetDrawingPanel />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(container.firstElementChild).toBeNull();

        await act(async () => {
            drawingManagerService.focusDrawing(drawings.map(({ unitId, subUnitId, drawingId }) => ({ unitId, subUnitId, drawingId })));
            await Promise.resolve();
        });

        expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(3);

        await act(async () => {
            drawingManagerService.focusDrawing([]);
            await Promise.resolve();
        });

        expect(container.firstElementChild).toBeNull();
    });
});
