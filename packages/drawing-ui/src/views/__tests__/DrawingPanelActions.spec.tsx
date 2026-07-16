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

import type { ICommandInfo, IDrawingParam } from '@univerjs/core';
import type { IDrawingOrderUpdateParam } from '@univerjs/drawing';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import { ArrangeTypeEnum, CommandType, DrawingTypeEnum, ICommandService, LocaleType, Univer } from '@univerjs/core';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { ComponentManager, IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetDrawingArrangeOperation } from '../../commands/operations/drawing-arrange.operation';
import {
    AutoImageCropOperation,
    CloseImageCropOperation,
    CropType,
} from '../../commands/operations/image-crop.operation';
import { DrawingImageClipService } from '../../services/drawing-image-clip.service';
import { ImagePopupMenu } from '../image-popup-menu/ImagePopupMenu';
import { DrawingArrange } from '../panel/DrawingArrange';
import { ImageCropper } from '../panel/ImageCropper';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const unitId = 'drawing-panel-unit';
const subUnitId = 'drawing-panel-subunit';
const chartEditCommandId = 'drawing.command.edit-chart';

function createDrawing(drawingId: string, left: number): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        transform: {
            left,
            top: 10,
            width: 20,
            height: 30,
        },
    };
}

function clickElement(element: Element): void {
    act(() => {
        element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
}

async function flushPendingCommands(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
    });
}

function getButton(container: HTMLElement, index: number): HTMLButtonElement {
    const action = container.querySelectorAll<HTMLButtonElement>('[data-u-comp="button"]')[index];
    if (!action) {
        throw new Error(`Button at index ${index} was not found.`);
    }

    return action;
}

function getSelectOption(index: number): HTMLElement {
    const option = document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')[index];
    if (!option) {
        throw new Error(`Select option at index ${index} was not found.`);
    }

    return option;
}

function renderWithRediContext(injector: ReturnType<Univer['__getInjector']>, element: ReactElement) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return { container, root };
}

describe('drawing panel actions', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let drawingManagerService: IDrawingManagerService;
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    beforeEach(() => {
        univer = new Univer({ locales: { [LocaleType.ZH_CN]: {} } });
        const injector = univer.__getInjector();
        injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
        injector.add([IconManager]);
        injector.add([ComponentManager]);
        injector.add([DrawingImageClipService]);
        injector.get(IconManager).register({ DrawingEditIcon: () => <span /> });

        commandService = injector.get(ICommandService);
        commandService.registerCommand(SetDrawingArrangeOperation);
        commandService.registerCommand(AutoImageCropOperation);
        commandService.registerCommand(CloseImageCropOperation);
        commandService.registerCommand({
            id: chartEditCommandId,
            type: CommandType.OPERATION,
            handler: () => true,
        });
        drawingManagerService = injector.get(IDrawingManagerService);
    });

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
        univer.dispose();
    });

    it('sends the selected drawings to the requested layer-order operation', () => {
        const drawings = [createDrawing('image-1', 0), createDrawing('image-2', 30)];
        const orderUpdates: IDrawingOrderUpdateParam[] = [];
        drawingManagerService.featurePluginOrderUpdate$.subscribe((update) => orderUpdates.push(update));

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <DrawingArrange arrangeShow drawings={drawings} />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(getButton(container, 2));

        expect(orderUpdates).toEqual([{
            unitId,
            subUnitId,
            drawingIds: ['image-1', 'image-2'],
            arrangeType: ArrangeTypeEnum.front,
        }]);
    });

    it('uses the latest focused drawings when arranging after selection changes', () => {
        const originalDrawing = createDrawing('image-1', 0);
        const focusedDrawing = createDrawing('image-2', 30);
        const orderUpdates: IDrawingOrderUpdateParam[] = [];
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    [originalDrawing.drawingId]: originalDrawing,
                    [focusedDrawing.drawingId]: focusedDrawing,
                },
                order: [originalDrawing.drawingId, focusedDrawing.drawingId],
            },
        });
        drawingManagerService.featurePluginOrderUpdate$.subscribe((update) => orderUpdates.push(update));

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <DrawingArrange arrangeShow drawings={[originalDrawing]} />
        );
        root = rendered.root;
        container = rendered.container;

        act(() => {
            drawingManagerService.focusDrawing([{
                unitId,
                subUnitId,
                drawingId: focusedDrawing.drawingId,
            }]);
        });
        clickElement(getButton(container, 0));

        expect(orderUpdates).toEqual([{
            unitId,
            subUnitId,
            drawingIds: [focusedDrawing.drawingId],
            arrangeType: ArrangeTypeEnum.forward,
        }]);
    });

    it('starts image cropping with the current crop mode', async () => {
        const executedCommands: ICommandInfo[] = [];
        commandService.onCommandExecuted((command) => executedCommands.push(command));

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <ImageCropper cropperShow drawings={[createDrawing('image-1', 0)]} />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(getButton(container, 0));
        await flushPendingCommands();

        expect(executedCommands).toEqual([{
            id: AutoImageCropOperation.id,
            type: AutoImageCropOperation.type,
            params: {
                cropType: CropType.FREE,
            },
        }]);
    });

    it('reapplies image cropping when the crop mode changes while cropping', async () => {
        const executedCommands: ICommandInfo[] = [];
        commandService.onCommandExecuted((command) => executedCommands.push(command));

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <ImageCropper cropperShow drawings={[createDrawing('image-1', 0)]} />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(getButton(container, 0));
        await flushPendingCommands();

        await act(async () => {
            container!.querySelector('[data-u-comp="select"]')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        const squareCropOption = getSelectOption(1);

        await act(async () => {
            squareCropOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(executedCommands).toEqual([
            {
                id: AutoImageCropOperation.id,
                type: AutoImageCropOperation.type,
                params: {
                    cropType: CropType.FREE,
                },
            },
            {
                id: AutoImageCropOperation.id,
                type: AutoImageCropOperation.type,
                params: {
                    cropType: CropType.R1_1,
                },
            },
        ]);
    });

    it('does not reapply image cropping after manual crop close when the crop mode changes', async () => {
        const executedCommands: ICommandInfo[] = [];
        commandService.onCommandExecuted((command) => executedCommands.push(command));

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <ImageCropper cropperShow drawings={[createDrawing('image-1', 0)]} />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(getButton(container, 0));
        await flushPendingCommands();

        await act(async () => {
            await commandService.executeCommand(CloseImageCropOperation.id);
            await Promise.resolve();
        });

        await act(async () => {
            container!.querySelector('[data-u-comp="select"]')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        await act(async () => {
            getSelectOption(2).dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(executedCommands.filter((command) => command.id === AutoImageCropOperation.id)).toEqual([
            {
                id: AutoImageCropOperation.id,
                type: AutoImageCropOperation.type,
                params: {
                    cropType: CropType.FREE,
                },
            },
        ]);
    });

    it('hides the chart toolbar after a hide-on-click action', async () => {
        const executedCommands: ICommandInfo[] = [];
        commandService.onCommandExecuted((command) => executedCommands.push(command));

        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <ImagePopupMenu
                popup={{
                    extraProps: {
                        variant: 'doc-chart-floating-toolbar',
                        menuItems: [{
                            label: 'chart.edit',
                            index: 0,
                            commandId: chartEditCommandId,
                            disable: false,
                            hideOnClick: true,
                            icon: 'DrawingEditIcon',
                        }],
                    },
                }}
            />
        );
        root = rendered.root;
        container = rendered.container;

        const chartToolbarButton = container.querySelector('[data-u-comp="doc-chart-floating-toolbar"] button');
        expect(chartToolbarButton).not.toBeNull();
        clickElement(chartToolbarButton!);
        await flushPendingCommands();

        expect(executedCommands.map((command) => command.id)).toEqual([chartEditCommandId]);
        expect(container.querySelector('[data-u-comp="doc-chart-floating-toolbar"]')).toBeNull();
    });
});
