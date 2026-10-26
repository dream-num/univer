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
import { Injector, LocaleService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { OlePopup } from '../OlePopup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const cleanups: Array<() => void> = [];

function renderPopup() {
    const injector = new Injector([[LocaleService]]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root: Root = createRoot(container);
    const actions = {
        fileName: 'A very long filename that should never make the toolbar wider 文档.docx',
        officeType: UniverInstanceType.UNIVER_DOC,
        showConvert: true,
        hasOnlineUnit: false,
        converting: false,
        available: true,
        status: '',
        editable: true,
        onEnter: vi.fn(),
        onLeave: vi.fn(),
        download: vi.fn(async () => {}),
        preview: vi.fn(async () => {}),
        convert: vi.fn(async () => {}),
        rename: vi.fn(),
        remove: vi.fn(async () => {}),
    };
    const render = () => act(() => {
        root.render(<RediContext.Provider value={{ injector }}><OlePopup popup={{ extraProps: actions }} /></RediContext.Provider>);
    });
    render();
    cleanups.push(() => {
        act(() => root.unmount());
        container.remove();
        injector.dispose();
    });
    const toolbar = () => container.querySelector('[role="toolbar"]')!;
    const button = (label: string) => container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    return { actions, render, toolbar, button };
}

afterEach(() => cleanups.splice(0).forEach((cleanup) => cleanup()));

describe('compact OLE toolbar', () => {
    it('shows a focusable reason instead of unavailable actions, with Delete only for editors', () => {
        const h = renderPopup();
        h.actions.available = false;
        h.actions.status = 'The original file is not embedded in this document.';
        h.render();
        const reason = h.toolbar().querySelector('[role="img"]');
        expect(reason?.getAttribute('aria-label')).toBe(h.actions.status);
        expect(reason?.getAttribute('tabindex')).toBe('0');
        act(() => reason?.parentElement?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
        expect(document.querySelector('[role="tooltip"]')?.className).toContain('!univer-pointer-events-none');
        expect(h.toolbar().textContent).toBe('');
        expect(h.toolbar().querySelectorAll('button')).toHaveLength(1);
        expect(h.button('Delete')).not.toBeNull();
        for (const label of ['Preview', 'Download', 'Rename', 'Convert to online document']) {
            expect(h.button(label)).toBeNull();
        }
        h.actions.editable = false;
        h.render();
        expect(h.toolbar().querySelectorAll('button')).toHaveLength(0);
        expect(h.toolbar().querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(h.actions.status);
    });

    it('keeps filenames out of the visible toolbar while preserving the accessible name', () => {
        const h = renderPopup();
        expect(h.toolbar().textContent).toBe('');
        expect(h.toolbar().getAttribute('aria-label')).toBe(h.actions.fileName);
        expect(h.toolbar().querySelectorAll('button')).toHaveLength(5);
        h.actions.fileName = `${'x'.repeat(300)}.docx`;
        h.render();
        expect(h.toolbar().textContent).toBe('');
        expect(h.toolbar().querySelectorAll('button')).toHaveLength(5);
    });

    it('shows conversion progress immediately and restores controls when the import completes', async () => {
        const h = renderPopup();
        let finish!: () => void;
        h.actions.convert.mockImplementation(() => new Promise<void>((resolve) => {
            finish = resolve;
        }));
        await act(async () => h.button('Convert to online document')!.click());
        expect(h.toolbar().getAttribute('aria-busy')).toBe('true');
        expect(h.button('Converting…')?.disabled).toBe(true);
        expect(h.toolbar().querySelector('.univer-animate-spin')).not.toBeNull();
        await act(async () => finish());
        h.actions.hasOnlineUnit = true;
        h.render();
        expect(h.toolbar().getAttribute('aria-busy')).toBe('false');
        expect(h.button('Open online document in new tab')?.disabled).toBe(false);
        expect(h.toolbar().querySelector('.univer-animate-spin')).toBeNull();
    });

    it('hides online conversion for local mode and permits opening an existing link in read-only mode', () => {
        const h = renderPopup();
        h.actions.showConvert = false;
        h.render();
        expect(h.toolbar().querySelectorAll('button')).toHaveLength(4);
        h.actions.showConvert = true;
        h.actions.editable = false;
        h.render();
        expect(h.button('Convert to online document')?.disabled).toBe(true);
        h.actions.hasOnlineUnit = true;
        h.render();
        expect(h.button('Open online document in new tab')?.disabled).toBe(false);
        expect(h.button('Delete')).toBeNull();
        expect(h.button('Rename')).toBeNull();
    });
});
