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
import { DesktopLogService, ILocalStorageService, ILogService, Injector, LocaleService, LocaleType, RegionService } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { getCurrencySymbolIconByLocale } from '@univerjs/sheets-numfmt';
import { ComponentManager, DesktopLocalStorageService, IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentsController } from '../../controllers/components.controller';
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
        [RegionService],
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
    return { container, injector, localeService, onChange, rerender };
}

async function selectCategory(container: HTMLElement, category: string) {
    const trigger = container.querySelector<HTMLButtonElement>('[data-u-comp="select"]')!;
    trigger.focus();
    await act(async () => {
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    const option = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')).find((item) => item.textContent?.trim() === category);
    expect(option).toBeDefined();
    await act(async () => option!.click());
}

async function clickPanelButton(container: HTMLElement, label = 'Confirm') {
    const button = Array.from(container.querySelectorAll('button')).find((element) =>
        element.textContent?.trim() === label);
    if (!button) {
        throw new Error(`Button "${label}" was not rendered.`);
    }

    await act(async () => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

describe('SheetNumfmtPanel', () => {
    it.each([
        ['Currency', undefined, '₹', undefined],
        ['Accounting', undefined, '₹', undefined],
        ['Currency', '€', '€', undefined],
        ['Currency', undefined, 'CHF', 'de-CH'],
        ['Accounting', undefined, 'CHF', 'de-CH'],
    ] as const)('confirms %s using the regional default or saved choice %s', async (category, saved, expected, nextRegion) => {
        const { container, injector, onChange } = await renderPanel({ defaultValue: 100000, defaultPattern: '', row: 0, col: 0 });
        if (saved) await injector.get(ILocalStorageService).setItem('userHabitController_numfmtCurrency', [saved]);
        await act(async () => injector.get(RegionService).setRegion('enIN'));
        await selectCategory(container, category);
        if (nextRegion && category === 'Currency') {
            const styles = container.querySelectorAll<HTMLAnchorElement>('li > a');
            expect(styles.length).toBeGreaterThan(1);
            await act(async () => styles[1].click());
        }
        if (nextRegion) {
            onChange.mockClear();
            await act(async () => injector.get(RegionService).setRegion(nextRegion));
            expect(onChange).toHaveBeenCalledTimes(1);
            const preview = onChange.mock.lastCall?.[0];
            expect(preview).toEqual({ type: 'change', value: expect.stringContaining(expected) });
            await clickPanelButton(container);
            expect(onChange.mock.lastCall?.[0]).toEqual({ type: 'confirm', value: preview?.value });
        } else {
            await clickPanelButton(container);
        }
        expect(onChange.mock.lastCall?.[0].value).toContain(expected);
    });

    it('renders the registered currency glyph and keeps an explicit currency on the cell', async () => {
        const { container, injector, onChange } = await renderPanel({
            defaultValue: 100000,
            defaultPattern: '"€"#,##0.00',
            row: 0,
            col: 0,
        });
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([ComponentManager]);
        injector.add([IconManager]);
        injector.add([ComponentsController]);
        injector.get(ComponentsController);
        const region = injector.get(RegionService);
        await act(async () => region.setRegion('mlIN'));
        const icons = injector.get(IconManager);
        const { icon } = getCurrencySymbolIconByLocale(region.getCurrentRegion());
        expect(icons.has(icon)).toBe(true);
        const Icon = icons.get(icon);
        const target = document.createElement('div');
        const root = createRoot(target);
        roots.push(root);
        act(() => root.render(<RediContext.Provider value={{ injector }}><Icon /></RediContext.Provider>));
        expect(target.textContent).toBe('₹');
        await act(async () => region.setRegion('de-CH'));
        expect(target.textContent).toBe('CHF');
        expect(target.querySelector('text')?.getAttribute('textLength')).toBe('14');
        await clickPanelButton(container);
        expect(onChange.mock.lastCall?.[0].value).toContain('€');
    });

    it.each(['', '#,##0.00'])('previews and confirms the regional date when switching from %j', async (defaultPattern) => {
        const { container, injector, onChange } = await renderPanel({ defaultValue: 45292, defaultPattern, row: 0, col: 0 });
        const region = injector.get(RegionService);
        await act(async () => region.setRegion('en-US'));
        await selectCategory(container, 'Date');
        expect(onChange).toHaveBeenLastCalledWith({ type: 'change', value: 'm/d/yyyy' });

        onChange.mockClear();
        await act(async () => region.setRegion('de-CH'));
        expect(onChange).toHaveBeenCalledExactlyOnceWith({ type: 'change', value: 'dd.mm.yyyy' });
        await clickPanelButton(container);
        expect(onChange).toHaveBeenLastCalledWith({ type: 'confirm', value: 'dd.mm.yyyy' });
    });

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
        await clickPanelButton(container, localeService.t('sheets-numfmt-ui.confirm'));
        expect(onChange).toHaveBeenLastCalledWith({ type: 'confirm', value: selectedPattern });
    });

    it.each(['Cancel', 'General', 'Custom Format'])('records custom format history only on confirmation (%s)', async (action) => {
        const pattern = 'h:mm';
        const previous = '0.00 "kg"';
        const { container, injector, onChange } = await renderPanel({ defaultValue: 0.5, defaultPattern: pattern, row: 0, col: 0 });
        const storage = injector.get(ILocalStorageService);
        await storage.setItem('numfmt_custom_pattern', [previous]);
        await storage.setItem('userHabitController_customFormat', [previous]);

        await selectCategory(container, 'Custom Format');
        expect(onChange).toHaveBeenLastCalledWith({ type: 'change', value: pattern });
        expect(await storage.getItem('numfmt_custom_pattern')).toEqual([previous]);
        if (action === 'General') await selectCategory(container, 'General');
        await clickPanelButton(container, action === 'Cancel' ? 'Cancel' : 'Confirm');
        const history = action === 'Custom Format' ? [pattern, previous] : [previous];
        expect(await storage.getItem('numfmt_custom_pattern')).toEqual(history);
        expect(await storage.getItem('userHabitController_customFormat')).toEqual(history);
    });

    it('preserves a custom format when reopening and confirming without edits', async () => {
        const pattern = '#,##0 "km/h"';
        const { container, onChange } = await renderPanel({
            defaultValue: 5800,
            defaultPattern: pattern,
            row: 3,
            col: 3,
        });

        await clickPanelButton(container);

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
        await clickPanelButton(container);

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

        await clickPanelButton(container);

        expect(onChange).toHaveBeenCalledExactlyOnceWith({ type: 'confirm', value: pattern });
        expect(container.querySelector('[data-u-comp="select"]')?.textContent).toBe(category);
    });
});
