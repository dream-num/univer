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
import { excelDateTimeSerial, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { DatePanel, isDatePanel } from '../Date';

const roots: Root[] = [];
const containers: HTMLElement[] = [];
const injectors: Injector[] = [];

afterEach(() => {
    roots.splice(0).forEach((root) => act(() => root.unmount()));
    containers.splice(0).forEach((container) => container.remove());
    injectors.splice(0).forEach((injector) => injector.dispose());
});

describe('DatePanel', () => {
    it('preserves an existing non-preset date pattern when opened in English', () => {
        const injector = new Injector([[LocaleService]]);
        injectors.push(injector);
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const container = document.createElement('div');
        containers.push(container);
        document.body.appendChild(container);
        const root = createRoot(container);
        roots.push(root);
        const pattern = 'yyyy"年"m"月"d"日"';
        const onActionChange = vi.fn();
        const onChange = vi.fn();

        act(() => root.render(
            <RediContext.Provider value={{ injector }}>
                <DatePanel
                    defaultPattern={pattern}
                    defaultValue={excelDateTimeSerial(new Date(Date.UTC(2024, 0, 2)))}
                    onActionChange={onActionChange}
                    onChange={onChange}
                />
            </RediContext.Provider>
        ));

        expect(container.textContent).toContain('1930年8月5日');
        expect(onActionChange.mock.lastCall![0]()).toBe(pattern);
        expect(onChange).not.toHaveBeenCalled();
        expect(isDatePanel(pattern)).toBe(true);
    });

    it('updates presets on locale changes without replacing a user-selected format', () => {
        const injector = new Injector([[LocaleService]]);
        injectors.push(injector);
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const container = document.createElement('div');
        containers.push(container);
        document.body.appendChild(container);
        const root = createRoot(container);
        roots.push(root);
        const onActionChange = vi.fn();
        const onChange = vi.fn();

        act(() => root.render(
            <RediContext.Provider value={{ injector }}>
                <DatePanel
                    defaultPattern=""
                    defaultValue={0.5625}
                    onActionChange={onActionChange}
                    onChange={onChange}
                />
            </RediContext.Provider>
        ));

        expect(container.textContent).not.toContain('下午');
        const option = Array.from(container.querySelectorAll('li a')).find((element) =>
            element.textContent?.trim() === '1:30 PM');
        expect(option).toBeDefined();
        act(() => option!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        const selectedPattern = onChange.mock.lastCall![0];

        act(() => localeService.setLocale(LocaleType.ZH_CN));

        expect(container.textContent).toContain('1930年08月05日');
        expect(container.textContent).toContain('下午 1:30');
        expect(onActionChange.mock.lastCall![0]()).toBe(selectedPattern);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(container.querySelector('li a.univer-bg-gray-200')?.textContent).toContain('1:30 下午');
    });
});
