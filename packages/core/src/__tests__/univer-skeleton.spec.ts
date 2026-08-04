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
import { IUniverInstanceService } from '../services/instance/instance.service';
import { LocaleService } from '../services/locale/locale.service';
import { LogLevel } from '../services/log/log.service';
import { RegionService } from '../services/region/region.service';
import { IUndoRedoService, UNDO_REDO_HISTORY_LIMIT_CONFIG_KEY } from '../services/undoredo/undoredo.service';
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
            region: LocaleType.FR_FR,
            direction: 'rtl',
            logLevel: LogLevel.VERBOSE,
            logCommandExecution: true,
            undoRedoHistoryLimit: 12,
        });

        const injector = univer.__getInjector();
        const localeService = injector.get(LocaleService);
        const regionService = injector.get(RegionService);

        expect(localeService.getCurrentLocale()).toBe(LocaleType.EN_US);
        expect(regionService.getCurrentRegion()).toBe(LocaleType.FR_FR);
        expect(localeService.getDirection()).toBe('rtl');
        expect(localeService.t('test.greeting', 'Univer')).toBe('Hello Univer');
        expect(injector.get(IConfigService).getConfig(COMMAND_LOG_EXECUTION_CONFIG_KEY)).toBe(true);
        expect(injector.get(IConfigService).getConfig(UNDO_REDO_HISTORY_LIMIT_CONFIG_KEY)).toBe(12);

        univer.setLocale(LocaleType.ZH_CN);
        expect(localeService.getCurrentLocale()).toBe(LocaleType.ZH_CN);
        expect(regionService.getCurrentRegion()).toBe(LocaleType.FR_FR);
        expect(localeService.getDirection()).toBe('rtl');

        univer.setRegion(LocaleType.JA_JP);
        expect(regionService.getCurrentRegion()).toBe(LocaleType.JA_JP);

        univer.dispose();
    });

    it('should apply the configured undo redo history limit', () => {
        const unitId = 'undo-redo-limit-doc';
        const univer = new Univer({ undoRedoHistoryLimit: 2 });
        univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: unitId });

        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(unitId);
        const undoRedoService = injector.get(IUndoRedoService);

        for (let i = 0; i < 3; i++) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [],
                redoMutations: [],
                id: `item-${i}`,
            });
        }

        expect(undoRedoService.pitchTopUndoElement()?.id).toBe('item-2');
        undoRedoService.popUndoToRedo();
        expect(undoRedoService.pitchTopUndoElement()?.id).toBe('item-1');
        undoRedoService.popUndoToRedo();
        expect(undoRedoService.pitchTopUndoElement()).toBeNull();

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
