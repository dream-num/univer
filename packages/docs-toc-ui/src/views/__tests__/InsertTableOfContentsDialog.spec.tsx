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
import type { IInsertTableOfContentsDialogProps } from '../InsertTableOfContentsDialog';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../locale/en-US';
import { InsertTableOfContentsDialog } from '../InsertTableOfContentsDialog';

describe('InsertTableOfContentsDialog', () => {
    let root: Root;
    let container: HTMLDivElement;
    let univer: Univer;

    beforeEach(() => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
        univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        univer.__getInjector().get(LocaleService).setDirection('ltr');
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
        univer.dispose();
        vi.unstubAllGlobals();
    });

    async function renderDialog(onChange: IInsertTableOfContentsDialogProps['onChange']) {
        await act(async () => root.render(
            <RediContext.Provider value={{ injector: univer.__getInjector() }}>
                <ConfigProvider mountContainer={container} locale={designEnUS.design} direction="ltr">
                    <InsertTableOfContentsDialog
                        options={{ levels: 3, showPageNumbers: true, rightAlignPageNumbers: true, tabLeader: 'dots', format: 'fromTemplate' }}
                        onChange={onChange}
                    />
                </ConfigProvider>
            </RediContext.Provider>
        ));
    }

    it('keeps page number, alignment and leader availability in sync', async () => {
        const onChange = vi.fn();
        await renderDialog(onChange);
        const checkboxes = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
        const label = enUS['docs-toc-ui'].tableOfContents.tabLeader;
        const leader = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
        expect(container.textContent).toContain('··········');
        await act(async () => checkboxes[0].click());
        expect(checkboxes[1].disabled).toBe(true);
        expect(leader.disabled).toBe(true);
        expect(container.textContent).not.toContain('··········');
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ showPageNumbers: false, rightAlignPageNumbers: false }));
        await act(async () => checkboxes[0].click());
        await act(async () => checkboxes[1].click());
        expect(leader.disabled).toBe(false);
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ showPageNumbers: true, rightAlignPageNumbers: true }));
    });

    it('selects levels, format and leader without losing earlier edits', async () => {
        const onChange = vi.fn();
        await renderDialog(onChange);
        const copy = enUS['docs-toc-ui'].tableOfContents;
        for (const [label, option] of [[copy.levels, '9'], [copy.format, copy.formatModern], [copy.tabLeader, copy.leaderDashes]]) {
            const trigger = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
            await act(async () => {
                trigger.focus();
                trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            });
            const item = await vi.waitFor(() => {
                const optionElement = [...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')].find((node) => node.textContent === option);
                expect(optionElement, `${label}: ${option}`).toBeDefined();
                return optionElement!;
            });
            await act(async () => item.click());
            await vi.waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull());
            await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
        }
        expect(onChange).toHaveBeenLastCalledWith({ levels: 9, format: 'modern', tabLeader: 'dashes', showPageNumbers: true, rightAlignPageNumbers: true });
        expect(container.textContent).toContain('----------');
    });
});
