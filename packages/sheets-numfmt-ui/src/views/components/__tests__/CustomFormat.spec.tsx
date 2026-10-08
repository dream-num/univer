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
import { DesktopLocalStorageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserHabitController } from '../../../controllers/user-habit.controller';
import enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { CustomFormat } from '../CustomFormat';

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

describe('CustomFormat', () => {
    it('refreshes date presets without dropping user history or editing the active pattern', async () => {
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
        const storage = injector.get(ILocalStorageService);
        const historicPattern = 'yyyy"年"m"月"d"日"';
        await storage.setItem('numfmt_custom_pattern', [historicPattern]);
        const container = document.createElement('div');
        document.body.appendChild(container);
        containers.push(container);
        const root = createRoot(container);
        roots.push(root);
        const onActionChange = vi.fn();
        const onChange = vi.fn();

        await act(async () => root.render(
            <RediContext.Provider value={{ injector }}>
                <CustomFormat
                    defaultPattern={historicPattern}
                    defaultValue={0}
                    onActionChange={onActionChange}
                    onChange={onChange}
                />
            </RediContext.Provider>
        ));

        expect(container.textContent).toContain('m/d/yyyy');
        expect(container.textContent).toContain(historicPattern);
        expect(container.textContent).not.toContain('yyyy"年"MM"月"dd"日"');

        await act(async () => localeService.setLocale(LocaleType.ZH_CN));

        expect(container.textContent).toContain('yyyy"年"MM"月"dd"日"');
        expect(container.textContent).toContain(historicPattern);
        expect(container.textContent).not.toContain('m/d/yyyy');
        expect((container.querySelector('input') as HTMLInputElement).value).toBe(historicPattern);
        expect(onChange).not.toHaveBeenCalled();
        expect(await storage.getItem('numfmt_custom_pattern')).toEqual([historicPattern]);
    });
});
