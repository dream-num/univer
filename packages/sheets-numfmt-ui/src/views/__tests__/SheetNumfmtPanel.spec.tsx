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
import type { ISheetNumfmtPanelProps } from '../SheetNumfmtPanel';
import { ILocalStorageService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { DesktopLocalStorageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserHabitController } from '../../controllers/user-habit.controller';
import enUS from '../../locale/en-US';
import zhCN from '../../locale/zh-CN';
import { SheetNumfmtPanel } from '../SheetNumfmtPanel';

const roots: Root[] = [];
const containers: HTMLElement[] = [];
const injectors: Injector[] = [];

beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(async () => {
    roots.splice(0).forEach((root) => act(() => root.unmount()));
    containers.splice(0).forEach((container) => container.remove());
    for (const injector of injectors.splice(0)) {
        await injector.get(ILocalStorageService).clear();
        injector.dispose();
    }
    vi.unstubAllGlobals();
});

async function renderPanel(value: ISheetNumfmtPanelProps['value']) {
    const injector = new Injector([
        [LocaleService],
        [ILocalStorageService, { useClass: DesktopLocalStorageService }],
        [UserHabitController],
    ]);
    injectors.push(injector);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const container = document.createElement('div');
    document.body.appendChild(container);
    containers.push(container);
    const root = createRoot(container);
    roots.push(root);
    const onChange = vi.fn();

    const rerender = async (value: ISheetNumfmtPanelProps['value']) => {
        await act(async () => root.render(
            <ConfigProvider locale={designEnUS.design} direction="ltr" mountContainer={document.body}>
                <RediContext.Provider value={{ injector }}>
                    <SheetNumfmtPanel value={value} onChange={onChange} />
                </RediContext.Provider>
            </ConfigProvider>
        ));
    };
    await rerender(value);
    return { container, localeService, onChange, rerender };
}

async function confirmPanel(container: HTMLElement, label = 'Confirm') {
    const button = Array.from(container.querySelectorAll('button')).find((element) =>
        element.textContent?.trim() === label);
    if (!button) {
        throw new Error(`Button "${label}" was not rendered.`);
    }

    await act(async () => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

describe('SheetNumfmtPanel', () => {
    it('keeps the active category and selected date format when its labels are translated', async () => {
        const { container, localeService, onChange } = await renderPanel({
            defaultValue: 0.5625,
            defaultPattern: 'h:mm',
            row: 0,
            col: 0,
        });

        const option = Array.from(container.querySelectorAll('li a')).find((element) =>
            element.textContent?.trim() === '1:30 PM');
        expect(option).toBeDefined();
        act(() => option!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        const selectedPattern = onChange.mock.lastCall![0].value;

        act(() => localeService.setLocale(LocaleType.ZH_CN));

        expect(container.querySelector('[data-u-comp="select"]')?.textContent)
            .toContain(localeService.t('sheets-numfmt-ui.date'));
        expect(container.textContent).toContain('1930年08月05日');
        expect(onChange).toHaveBeenCalledTimes(1);
        await confirmPanel(container, localeService.t('sheets-numfmt-ui.confirm'));
        expect(onChange).toHaveBeenLastCalledWith({ type: 'confirm', value: selectedPattern });
    });

    it('preserves a custom format when reopening and confirming without edits', async () => {
        const pattern = '#,##0 "km/h"';
        const { container, onChange } = await renderPanel({
            defaultValue: 5800,
            defaultPattern: pattern,
            row: 3,
            col: 3,
        });

        await confirmPanel(container);

        expect(onChange).toHaveBeenCalledExactlyOnceWith({ type: 'confirm', value: pattern });
        expect(container.querySelector('[data-u-comp="select"]')?.textContent).toBe('Custom Format');
        expect(container.querySelector<HTMLInputElement>('input[placeholder="Custom Format"]')?.value).toBe(pattern);
    });

    it.each(['', '0.00 "kg"'])('follows a new custom-formatted selection after opening with %j', async (initialPattern) => {
        const { container, onChange, rerender } = await renderPanel({
            defaultValue: 12,
            defaultPattern: initialPattern,
            row: 0,
            col: 0,
        });
        const pattern = '#,##0 "km/h"';

        await rerender({ defaultValue: 5800, defaultPattern: pattern, row: 3, col: 3 });
        await confirmPanel(container);

        expect(onChange).toHaveBeenCalledExactlyOnceWith({ type: 'confirm', value: pattern });
        expect(container.querySelector<HTMLInputElement>('input[placeholder="Custom Format"]')?.value).toBe(pattern);
    });

    it.each([
        ['', 'General'],
        ['#,##0_);(#,##0)', 'Thousands separator'],
    ])('preserves the built-in format %j when confirming without edits', async (pattern, category) => {
        const { container, onChange } = await renderPanel({
            defaultValue: 5800,
            defaultPattern: pattern,
            row: 3,
            col: 3,
        });

        await confirmPanel(container);

        expect(onChange).toHaveBeenCalledExactlyOnceWith({ type: 'confirm', value: pattern });
        expect(container.querySelector('[data-u-comp="select"]')?.textContent).toBe(category);
    });
});
