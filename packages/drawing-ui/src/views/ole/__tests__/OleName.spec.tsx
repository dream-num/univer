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

import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { OleName } from '../OleName';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const cleanups: Array<() => void> = [];

function renderName() {
    const injector = new Injector([[LocaleService]]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const actions = { fileName: '原始名称.docx', close: vi.fn(), save: vi.fn(async (_value: string): Promise<string | undefined> => undefined) };
    act(() => root.render(<RediContext.Provider value={{ injector }}><OleName popup={{ extraProps: actions }} /></RediContext.Provider>));
    cleanups.push(() => {
        act(() => root.unmount());
        container.remove();
        injector.dispose();
    });
    const key = async (value: string, isComposing = false) => act(async () => {
        container.querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: value, isComposing, bubbles: true }));
    });
    return { container, actions, key };
}

afterEach(() => cleanups.splice(0).forEach((cleanup) => cleanup()));

describe('OLE name editing', () => {
    it('edits the basename and leaves the fixed extension visible', async () => {
        const h = renderName();
        expect(h.container.querySelector('input')?.value).toBe('原始名称');
        expect(h.container.textContent).toContain('.docx');
        await h.key('Enter', true);
        expect(h.actions.save).not.toHaveBeenCalled();
        await h.key('Enter');
        expect(h.actions.save).toHaveBeenCalledWith('原始名称');
    });

    it('cancels without saving and shows rejected saves inline', async () => {
        const h = renderName();
        await h.key('Escape');
        expect(h.actions.close).toHaveBeenCalledOnce();
        expect(h.actions.save).not.toHaveBeenCalled();
        h.actions.save.mockResolvedValue('Unable to save');
        await h.key('Enter');
        expect(h.container.querySelector('[role="alert"]')?.textContent).toBe('Unable to save');
        expect(h.container.querySelector('input')?.disabled).toBe(false);
    });

    it('provides only rename controls without a separate name viewer or copy action', () => {
        const h = renderName();
        expect(h.container.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Rename');
        expect(h.container.querySelector('input')).not.toBeNull();
        expect(h.container.querySelectorAll('button')).toHaveLength(2);
        expect(h.container.querySelector('[aria-label="Save name"]')).not.toBeNull();
        expect(h.container.querySelector('[aria-label="Copy name"]')).toBeNull();
    });
});
