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

/**
 * @vitest-environment jsdom
 */

import { CommandType, ICommandService, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it } from 'vitest';
import { ImagePopupMenu } from '../ImagePopupMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const cleanups: Array<() => void> = [];

afterEach(async () => {
    cleanups.splice(0).reverse().forEach((dispose) => dispose());
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
});

it('dismisses the chart type tooltip while the dropdown is open and routes the selected type', async () => {
    const univer = new Univer();
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([IconManager]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: { test: { chartType: 'Chart type' } } });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const selected: string[] = [];
    injector.get(ICommandService).registerCommand({
        id: 'test.operation.chart-type',
        type: CommandType.OPERATION,
        handler: (_accessor, params: { type: string }) => {
            selected.push(params.type);
            return true;
        },
    });
    const container = document.createElement('div');
    document.body.appendChild(container);
    cleanups.push(() => container.remove());
    const root = createRoot(container);
    cleanups.push(() => act(() => root.unmount()));
    await act(async () => root.render(
        <RediContext.Provider value={{ injector }}>
            <ImagePopupMenu
                popup={{ extraProps: {
                    variant: 'doc-chart-floating-toolbar',
                    menuItems: [{
                        type: 'select',
                        label: 'test.chartType',
                        index: 0,
                        commandId: 'test.operation.chart-type',
                        disable: false,
                        value: 'column',
                        options: [{ value: 'column', label: 'Column chart' }, { value: 'line', label: 'Line chart' }],
                        commandParamsFactory: (type) => ({ type }),
                    }],
                } }}
            />
        </RediContext.Provider>
    ));
    const trigger = container.querySelector<HTMLButtonElement>('button')!;
    const hoverTarget = trigger.parentElement!;
    await act(async () => hoverTarget.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('Chart type');
    await act(async () => trigger.click());
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    await act(async () => hoverTarget.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    const option = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent === 'Line chart')!;
    expect(option).toBeDefined();
    await act(async () => option.click());
    expect(selected).toEqual(['line']);
    expect(option.isConnected).toBe(false);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
