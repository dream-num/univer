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

import type { Root } from 'react-dom/client';
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { MobileCustomFormat } from '../MobileCustomFormat';

const roots: Root[] = [];
const containers: HTMLElement[] = [];

afterEach(() => {
    roots.splice(0).forEach((root) => act(() => root.unmount()));
    containers.splice(0).forEach((container) => container.remove());
});

describe('MobileCustomFormat', () => {
    it('selects an existing pattern from a mobile dropdown and confirms it', () => {
        const injector = new Injector([[LocaleService]]);
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        const onConfirm = vi.fn();
        const container = document.createElement('div');
        document.body.appendChild(container);
        containers.push(container);
        const root = createRoot(container);
        roots.push(root);

        act(() => {
            root.render(
                <ConfigProvider locale={designEnUS.design} mountContainer={document.body}>
                    <RediContext.Provider value={{ injector }}>
                        <MobileCustomFormat patterns={['0.00', '#,##0']} onConfirm={onConfirm} />
                    </RediContext.Provider>
                </ConfigProvider>
            );
        });

        expect(container.querySelector('[data-u-comp="mobile-custom-format-scroller"]')).toBeNull();
        const select = container.querySelector('[data-u-comp="mobile-select"]');
        expect(select).not.toBeNull();
        act(() => select!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        const dialog = document.body.querySelector('[role="dialog"]');
        expect(dialog).not.toBeNull();
        expect(Array.from(dialog!.querySelectorAll('button')).some((button) =>
            button.textContent?.trim() === 'Custom Format')).toBe(false);
        const option = getButton('#,##0');
        act(() => option.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        expect((container.querySelector('[aria-label="Custom Format"]') as HTMLInputElement).value).toBe('#,##0');

        const confirm = getButton('Confirm');
        act(() => confirm.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        expect(onConfirm).toHaveBeenCalledExactlyOnceWith('#,##0');
    });
});

function getButton(name: string): HTMLButtonElement {
    const button = Array.from(document.body.querySelectorAll('button')).find((element) =>
        element.getAttribute('aria-label') === name || element.textContent?.trim() === name);
    if (!button) {
        throw new Error(`Button "${name}" was not rendered.`);
    }

    return button;
}
