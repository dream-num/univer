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

import type { ILocales } from '../shared/locale';
import { defaultTheme } from '@univerjs/themes';
import { describe, expect, it, vi } from 'vitest';
import { Injector } from '../common/di';
import { UniverInstanceType } from '../common/unit';
import { COMMAND_LOG_EXECUTION_CONFIG_KEY } from '../services/command/command.service';
import { IConfigService } from '../services/config/config.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleService } from '../services/lifecycle/lifecycle.service';
import { LocaleService } from '../services/locale/locale.service';
import { LogLevel } from '../services/log/log.service';
import { Skeleton } from '../skeleton';
import { LocaleType } from '../types/enum/locale-type';
import { Univer } from '../univer';

describe('Skeleton', () => {
    it('should update dirty state and release locale data on dispose', () => {
        const skeleton = new Skeleton(new LocaleService());

        expect(skeleton.dirty).toBe(true);
        expect(skeleton.getFontLocale()).toBeUndefined();

        skeleton.makeDirty(false);
        expect(skeleton.dirty).toBe(false);

        skeleton.dispose();
        expect(skeleton.getFontLocale()).toBeNull();
    });
});

describe('Univer', () => {
    it('should apply constructor config and expose locale/config methods', () => {
        const locales: ILocales = {
            [LocaleType.EN_US]: {
                test: {
                    greeting: 'Hello {0}',
                },
            },
        } as unknown as ILocales;

        const univer = new Univer({
            theme: defaultTheme,
            darkMode: true,
            locales,
            locale: LocaleType.EN_US,
            logLevel: LogLevel.VERBOSE,
            logCommandExecution: true,
        });

        const injector = univer.__getInjector();
        const localeService = injector.get(LocaleService);

        expect(localeService.getCurrentLocale()).toBe(LocaleType.EN_US);
        expect(localeService.t('test.greeting', 'Univer')).toBe('Hello Univer');
        expect(injector.get(IConfigService).getConfig(COMMAND_LOG_EXECUTION_CONFIG_KEY)).toBe(true);

        univer.setLocale(LocaleType.ZH_CN);
        expect(localeService.getCurrentLocale()).toBe(LocaleType.ZH_CN);

        univer.dispose();
    });

    it('should support add/remove dispose callbacks', () => {
        const univer = new Univer();
        const removedCallback = vi.fn();
        const activeCallback = vi.fn();

        const disposable = univer.onDispose(removedCallback);
        univer.onDispose(activeCallback);
        disposable.dispose();

        univer.dispose();

        expect(removedCallback).not.toHaveBeenCalled();
        expect(activeCallback).toHaveBeenCalledTimes(1);
    });

    it('should create units via deprecated and current APIs', () => {
        const univer = new Univer();
        const injector = univer.__getInjector();

        const sheetA = univer.createUniverSheet({ id: 'sheet-a' });
        const sheetB = univer.createUnit(UniverInstanceType.UNIVER_SHEET, { id: 'sheet-b' });
        const sheetC = univer.createUnit(UniverInstanceType.UNIVER_SHEET, { id: 'sheet-c' });
        const doc = univer.createUniverDoc({ id: 'doc-a' });
        const slide = univer.createUniverSlide({ id: 'slide-a' });

        expect(sheetA.getUnitId()).toBe('sheet-a');
        expect(sheetB.getUnitId()).toBe('sheet-b');
        expect(sheetC.getUnitId()).toBe('sheet-c');
        expect(doc.getUnitId()).toBe('doc-a');
        expect(slide.getUnitId()).toBe('slide-a');
        expect(injector.get(LifecycleService).stage).toBe(LifecycleStages.Ready);

        univer.dispose();
    });

    it('should delegate plugin registration for tuple-style APIs and support parent injector', () => {
        const parentInjector = new Injector([]);
        const univer = new Univer({}, parentInjector);
        const registerPluginSpy = vi
            .spyOn((univer as any)._pluginService, 'registerPlugin')
            .mockImplementation(() => undefined);

        univer.registerPlugins([
            [class FakePluginA {} as never, { enabled: true }],
            [class FakePluginB {} as never],
        ] as never);

        expect(registerPluginSpy).toHaveBeenCalledTimes(2);

        registerPluginSpy.mockRestore();
        univer.dispose();
    });
});
