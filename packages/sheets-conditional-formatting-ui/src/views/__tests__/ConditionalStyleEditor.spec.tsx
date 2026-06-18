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

import type { IHighlightCell } from '@univerjs/sheets-conditional-formatting';
import type { Root } from 'react-dom/client';
import { BooleanNumber } from '@univerjs/core';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ConditionalStyleEditor } from '../ConditionalStyleEditor';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('ConditionalStyleEditor', () => {
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

    it('emits highlight style changes when a user toggles text emphasis controls', async () => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let latestStyle: IHighlightCell['style'] | undefined;

        await act(async () => {
            root!.render(
                <ConditionalStyleEditor
                    onChange={(style) => {
                        latestStyle = style;
                    }}
                />
            );
            await Promise.resolve();
        });

        const styleButtons = Array.from(container.firstElementChild!.children) as HTMLElement[];

        await act(async () => {
            styleButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            styleButtons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(latestStyle).toMatchObject({
            bl: BooleanNumber.TRUE,
            it: BooleanNumber.TRUE,
        });
    });

    it('emits font color changes when a user picks a preset color', async () => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let latestStyle: IHighlightCell['style'] | undefined;

        await act(async () => {
            root!.render(
                <ConditionalStyleEditor
                    onChange={(style) => {
                        latestStyle = style;
                    }}
                />
            );
            await Promise.resolve();
        });

        const styleControls = Array.from(container.firstElementChild!.children) as HTMLElement[];

        await act(async () => {
            styleControls[4].click();
            await Promise.resolve();
        });

        const firstPresetColor = document.querySelector('[data-u-comp="color-picker-presets"] button') as HTMLButtonElement;

        if (!firstPresetColor) {
            throw new Error('Preset colors were not rendered');
        }

        await act(async () => {
            firstPresetColor.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(latestStyle).toMatchObject({
            cl: {
                rgb: '#ffffff',
            },
        });
    });

    it('emits background color changes when a user picks a fill preset color', async () => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let latestStyle: IHighlightCell['style'] | undefined;

        await act(async () => {
            root!.render(
                <ConditionalStyleEditor
                    onChange={(style) => {
                        latestStyle = style;
                    }}
                />
            );
            await Promise.resolve();
        });

        const styleControls = Array.from(container.firstElementChild!.children) as HTMLElement[];

        await act(async () => {
            styleControls[5].click();
            await Promise.resolve();
        });

        const firstPresetColor = document.querySelector('[data-u-comp="color-picker-presets"] button') as HTMLButtonElement;

        if (!firstPresetColor) {
            throw new Error('Preset colors were not rendered');
        }

        await act(async () => {
            firstPresetColor.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(latestStyle).toMatchObject({
            bg: {
                rgb: '#ffffff',
            },
        });
    });
});
