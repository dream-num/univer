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
import { ILocalStorageService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { DesktopLocalStorageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserHabitController } from '../../controllers/user-habit.controller';
import enUS from '../../locale/en-US';
import zhCN from '../../locale/zh-CN';
import { SheetNumfmtPanel } from '../SheetNumfmtPanel';

const roots: Root[] = [];
const containers: HTMLElement[] = [];
const injectors: Injector[] = [];

afterEach(async () => {
    roots.splice(0).forEach((root) => act(() => root.unmount()));
    containers.splice(0).forEach((container) => container.remove());
    for (const injector of injectors.splice(0)) {
        await injector.get(ILocalStorageService).clear();
        injector.dispose();
    }
});

describe('SheetNumfmtPanel', () => {
    it('keeps the active category and selected date format when its labels are translated', async () => {
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

        await act(async () => root.render(
            <ConfigProvider locale={designEnUS.design} mountContainer={document.body}>
                <RediContext.Provider value={{ injector }}>
                    <SheetNumfmtPanel
                        value={{ defaultValue: 0.5625, defaultPattern: 'h:mm', row: 0, col: 0 }}
                        onChange={onChange}
                    />
                </RediContext.Provider>
            </ConfigProvider>
        ));

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
        const confirm = Array.from(container.querySelectorAll('button')).find((button) =>
            button.textContent === localeService.t('sheets-numfmt-ui.confirm'));
        expect(confirm).toBeDefined();
        act(() => confirm!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        expect(onChange).toHaveBeenLastCalledWith({ type: 'confirm', value: selectedPattern });
    });
});
