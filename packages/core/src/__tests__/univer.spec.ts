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

import { defaultTheme } from '@univerjs/themes';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import type { ILocales } from '../shared/locale';
import { Inject, Injector } from '../common/di';
import { UnitModel, UniverInstanceType } from '../common/unit';
import { COMMAND_LOG_EXECUTION_CONFIG_KEY } from '../services/command/command.service';
import { IConfigService } from '../services/config/config.service';
import { IUniverInstanceService } from '../services/instance/instance.service';
import { LocaleService } from '../services/locale/locale.service';
import { LogLevel } from '../services/log/log.service';
import { Plugin } from '../services/plugin/plugin.service';
import { RegionService } from '../services/region/region.service';
import { IUndoRedoService, UNDO_REDO_HISTORY_LIMIT_CONFIG_KEY } from '../services/undoredo/undoredo.service';
import { LocaleType } from '../types/enum/locale-type';
import { Univer } from '../univer';

class TestSlideUnit extends UnitModel {
    override type = UniverInstanceType.UNIVER_SLIDE;
    override name$ = new BehaviorSubject('');
    private _rev = 1;

    constructor(private readonly _snapshot: { id: string; name: string }) {
        super();
        this.name$.next(_snapshot.name);
        this.disposeWithMe(() => this.name$.complete());
    }

    override getUnitId() { return this._snapshot.id; }
    override getSnapshot() { return this._snapshot; }
    override getRev() { return this._rev; }
    override incrementRev() { this._rev++; }
    override setRev(rev: number) { this._rev = rev; }
    override setName(name: string) {
        this._snapshot.name = name;
        this.name$.next(name);
    }
}

class TestSlidesPlugin extends Plugin {
    static override pluginName = 'TEST_SLIDES';
    static override type = UniverInstanceType.UNIVER_SLIDE;

    constructor(@Inject(Injector) protected readonly _injector: Injector) {
        super();
    }

    override onStarting(): void {
        this.disposeWithMe(this._injector.get(IUniverInstanceService).registerCtorForType(
            UniverInstanceType.UNIVER_SLIDE,
            TestSlideUnit
        ));
    }
}

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

    it('creates slide units using the constructor registered when the plugin starts', () => {
        const parentInjector = new Injector();
        const univer = new Univer({}, parentInjector);

        try {
            univer.registerPlugins([[TestSlidesPlugin]]);
            const slide = univer.createUnit<{ id: string; name: string }, TestSlideUnit>(
                UniverInstanceType.UNIVER_SLIDE,
                { id: 'slide-1', name: 'Presentation' }
            );

            expect(slide).toBeInstanceOf(TestSlideUnit);
            expect(slide.getSnapshot()).toEqual({ id: 'slide-1', name: 'Presentation' });
            expect(univer.__getInjector().get(IUniverInstanceService).getUnit('slide-1')).toBe(slide);
        } finally {
            univer.dispose();
            parentInjector.dispose();
        }
    });

    it('rejects slide creation when no plugin provides the model', () => {
        const univer = new Univer();

        try {
            expect(() => univer.createUnit(UniverInstanceType.UNIVER_SLIDE, { id: 'slide-1' }))
                .toThrow(`[Univer]: No constructor registered for unit type ${UniverInstanceType.UNIVER_SLIDE}.`);
        } finally {
            univer.dispose();
        }
    });
});
