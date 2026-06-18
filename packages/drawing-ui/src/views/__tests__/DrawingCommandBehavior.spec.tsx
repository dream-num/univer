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

import type { ICommand, ICommandInfo, IDrawingParam } from '@univerjs/core';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import { CommandType, DrawingTypeEnum, ICommandService, LocaleType, Univer } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AlignType, SetDrawingAlignOperation } from '../../commands/operations/drawing-align.operation';
import { ImagePopupMenu } from '../image-popup-menu/ImagePopupMenu';
import { DrawingAlign } from '../panel/DrawingAlign';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const unitId = 'drawing-command-unit';
const subUnitId = 'drawing-command-subunit';
const drawingId = 'image-1';
const wrappingStyleCommandId = 'doc.command.update-doc-drawing-wrapping-style';
const editCommandId = 'drawing.command.open-image-setting';
const cropCommandId = 'drawing.command.crop-image';
const deleteCommandId = 'drawing.command.delete-image';

function createDrawing(id: string): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId: id,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        transform: {
            left: 10,
            top: 20,
            width: 120,
            height: 80,
            angle: 0,
        },
    };
}

function createOperation(id: string): ICommand {
    return {
        id,
        type: CommandType.OPERATION,
        handler: () => true,
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

function findByText<T extends HTMLElement>(selector: string, text: string): T {
    const element = Array.from(document.querySelectorAll<T>(selector))
        .find((item) => item.textContent?.includes(text));
    if (!element) {
        throw new Error(`Element with text "${text}" was not found.`);
    }

    return element;
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

describe('drawing command behavior', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let root: Root | undefined;
    let container: HTMLElement | undefined;
    let executedCommands: ICommandInfo[];

    beforeEach(() => {
        univer = new Univer({ locales: { [LocaleType.ZH_CN]: {} } });
        commandService = univer.__getInjector().get(ICommandService);
        commandService.registerCommand(SetDrawingAlignOperation);
        commandService.registerCommand(createOperation(wrappingStyleCommandId));
        commandService.registerCommand(createOperation(editCommandId));
        commandService.registerCommand(createOperation(cropCommandId));
        commandService.registerCommand(createOperation(deleteCommandId));
        executedCommands = [];
        commandService.onCommandExecuted((command) => executedCommands.push(command));
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

    it('executes align operation with the selected alignment and drawings', async () => {
        const drawings = [createDrawing(drawingId), createDrawing('image-2')];
        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <DrawingAlign alignShow drawings={drawings} />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(document.querySelector('[data-u-comp="select"]')!);
        clickElement(findByText('[role="menuitemradio"]', 'drawing-ui.image-panel.align.right'));
        await flushPendingCommands();

        expect(executedCommands).toEqual([{
            id: SetDrawingAlignOperation.id,
            type: SetDrawingAlignOperation.type,
            params: {
                alignType: AlignType.right,
                drawings,
            },
        }]);
    });

    it('updates doc image wrapping style with the current drawing identity', async () => {
        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <ImagePopupMenu
                popup={{
                    extraProps: {
                        variant: 'doc-floating-toolbar',
                        unitId,
                        subUnitId,
                        drawingId,
                        menuItems: [],
                    },
                }}
            />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(document.querySelector('[data-u-comp="doc-image-floating-toolbar"] button')!);
        clickElement(findByText('button', 'drawing-ui.image-text-wrap.square'));
        await flushPendingCommands();

        expect(executedCommands).toEqual([{
            id: wrappingStyleCommandId,
            type: CommandType.OPERATION,
            params: {
                unitId,
                subUnitId,
                drawings: [{ unitId, subUnitId, drawingId }],
                wrappingStyle: 'wrapSquare',
            },
        }]);
    });

    it('executes edit command and hides the doc image floating toolbar', async () => {
        const editParams = { unitId, subUnitId, drawingId, source: 'toolbar' };
        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <ImagePopupMenu
                popup={{
                    extraProps: {
                        variant: 'doc-floating-toolbar',
                        unitId,
                        subUnitId,
                        drawingId,
                        menuItems: [{
                            label: 'drawing-ui.image-popup.edit',
                            index: 0,
                            commandId: editCommandId,
                            commandParams: editParams,
                            disable: false,
                        }],
                    },
                }}
            />
        );
        root = rendered.root;
        container = rendered.container;

        clickElement(document.querySelectorAll('[data-u-comp="doc-image-floating-toolbar"] button')[1]);
        await flushPendingCommands();

        expect(executedCommands).toEqual([{
            id: editCommandId,
            type: CommandType.OPERATION,
            params: editParams,
        }]);
        expect(document.querySelector('[data-u-comp="doc-image-floating-toolbar"]')).toBeNull();
    });

    it('keeps disabled doc image toolbar actions inert without hiding the toolbar', async () => {
        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <ImagePopupMenu
                popup={{
                    extraProps: {
                        variant: 'doc-floating-toolbar',
                        unitId,
                        subUnitId,
                        drawingId,
                        menuItems: [
                            {
                                label: 'drawing-ui.image-popup.edit',
                                index: 0,
                                commandId: editCommandId,
                                commandParams: { unitId, subUnitId, drawingId, source: 'toolbar' },
                                disable: true,
                            },
                            {
                                label: 'drawing-ui.image-popup.crop',
                                index: 1,
                                commandId: 'drawing.command.crop-image',
                                commandParams: { unitId, subUnitId, drawingId },
                                disable: true,
                            },
                            {
                                label: 'drawing-ui.image-popup.delete',
                                index: 2,
                                commandId: 'drawing.command.delete-image',
                                commandParams: { unitId, subUnitId, drawingId },
                                disable: true,
                            },
                        ],
                    },
                }}
            />
        );
        root = rendered.root;
        container = rendered.container;

        const toolbarButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-u-comp="doc-image-floating-toolbar"] button'));
        const actionButtons = toolbarButtons.slice(1);
        expect(actionButtons.map((button) => button.disabled)).toEqual([true, true, true]);

        actionButtons.forEach(clickElement);
        await flushPendingCommands();

        expect(executedCommands).toEqual([]);
        expect(document.querySelector('[data-u-comp="doc-image-floating-toolbar"]')).not.toBeNull();
    });

    it('executes crop and delete commands from the doc image floating toolbar', async () => {
        const cropParams = { unitId, subUnitId, drawingId, source: 'toolbar-crop' };
        const deleteParams = { unitId, subUnitId, drawingId, source: 'toolbar-delete' };
        const rendered = renderWithRediContext(
            univer.__getInjector(),
            <ImagePopupMenu
                popup={{
                    extraProps: {
                        variant: 'doc-floating-toolbar',
                        unitId,
                        subUnitId,
                        drawingId,
                        menuItems: [
                            {
                                label: 'drawing-ui.image-popup.crop',
                                index: 1,
                                commandId: cropCommandId,
                                commandParams: cropParams,
                                disable: false,
                            },
                            {
                                label: 'drawing-ui.image-popup.delete',
                                index: 2,
                                commandId: deleteCommandId,
                                commandParams: deleteParams,
                                disable: false,
                            },
                        ],
                    },
                }}
            />
        );
        root = rendered.root;
        container = rendered.container;

        const toolbarButtons = document.querySelectorAll('[data-u-comp="doc-image-floating-toolbar"] button');
        clickElement(toolbarButtons[2]);
        clickElement(toolbarButtons[3]);
        await flushPendingCommands();

        expect(executedCommands).toEqual([
            {
                id: cropCommandId,
                type: CommandType.OPERATION,
                params: cropParams,
            },
            {
                id: deleteCommandId,
                type: CommandType.OPERATION,
                params: deleteParams,
            },
        ]);
        expect(document.querySelector('[data-u-comp="doc-image-floating-toolbar"]')).not.toBeNull();
    });
});
