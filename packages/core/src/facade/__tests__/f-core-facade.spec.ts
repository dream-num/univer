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

import { describe, expect, it, vi } from 'vitest';
import { Injector } from '../../common/di';
import {
    AbsoluteRefType,
    AutoFillSeries,
    BaselineOffset,
    BooleanNumber,
    BorderStyleTypes,
    BorderType,
    ColorType,
    CommandType,
    CommonHideTypes,
    CopyPasteType,
    DataValidationErrorStyle,
    DataValidationOperator,
    DataValidationRenderMode,
    DataValidationStatus,
    DataValidationType,
    DeleteDirection,
    DeveloperMetadataVisibility,
    Dimension,
    Direction,
    HorizontalAlign,
    InterpolationPointType,
    LifecycleStages,
    LocaleType,
    MentionType,
    ProtectionType,
    RelativeDate,
    SheetTypes,
    TextDecoration,
    TextDirection,
    ThemeColorType,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '../../index';
import { FBase, FBaseInitialable } from '../f-base';
import { FEnum } from '../f-enum';
import { FEventName } from '../f-event';
import { FEventRegistry } from '../f-event-registry';

describe('facade core primitives', () => {
    it('should extend FBase and FBaseInitialable with methods, statics and initializers', () => {
        const initLog = new WeakMap<object, string[]>();

        class BaseSource {
            static sourceLabel = 'base-source';

            greet(this: { prefix: string }, name: string) {
                return `${this.prefix}:${name}`;
            }
        }

        class InitSourceA {
            static initSource = 'a';

            _initialize(injector: Injector) {
                const current = initLog.get(this) ?? [];
                current.push(`a:${injector instanceof Injector}`);
                initLog.set(this, current);
            }

            mark(this: { steps: string[] }, value: string) {
                this.steps.push(`mark:${value}`);
            }
        }

        class InitSourceB {
            _initialize() {
                const current = initLog.get(this) ?? [];
                current.push('b');
                initLog.set(this, current);
            }
        }

        class BaseFacade extends FBase {
            prefix = 'base';
        }

        class AutoInitialable extends FBaseInitialable {
            steps: string[] = [];
        }

        class ManualInitialable extends FBaseInitialable {
            steps: string[] = [];

            static enableManualInitForTest() {
                this._enableManualInit();
            }

            runManualInitializers(injector: Injector) {
                this._runInitializers(injector);
            }
        }

        BaseFacade.extend(BaseSource);
        AutoInitialable.extend(InitSourceA);
        AutoInitialable.extend(InitSourceB);
        ManualInitialable.extend(InitSourceA);
        ManualInitialable.enableManualInitForTest();

        const injector = new Injector();
        const baseFacade = new BaseFacade() as BaseFacade & { greet(name: string): string };
        const auto = new AutoInitialable(injector) as AutoInitialable & { mark(value: string): void };
        const manual = new ManualInitialable(injector) as ManualInitialable & { mark(value: string): void };

        expect(baseFacade.greet('univer')).toBe('base:univer');
        expect((BaseFacade as typeof BaseFacade & { sourceLabel: string }).sourceLabel).toBe('base-source');

        expect(initLog.get(auto)).toEqual(['a:true', 'b']);
        auto.mark('auto');
        expect(auto.steps).toEqual(['mark:auto']);
        expect((AutoInitialable as typeof AutoInitialable & { initSource: string }).initSource).toBe('a');

        expect(initLog.get(manual)).toBeUndefined();
        manual.runManualInitializers(injector);
        manual.mark('manual');
        expect(initLog.get(manual)).toEqual(['a:true']);
        expect(manual.steps).toEqual(['mark:manual']);
    });

    it('should lazily register event handlers and dispose them when listeners are removed', () => {
        const registry = new FEventRegistry();
        const disposeSpy = vi.fn();
        const initSpy = vi.fn(() => ({ dispose: disposeSpy }));
        const listenerA = vi.fn((params: { stage: LifecycleStages; cancel?: boolean }) => {
            params.cancel = true;
        });
        const listenerB = vi.fn();

        const handlerDisposable = registry.registerEventHandler('LifeCycleChanged', initSpy);
        expect(initSpy).not.toHaveBeenCalled();

        const listenerADisposable = registry.addEvent('LifeCycleChanged', listenerA);
        expect(initSpy).toHaveBeenCalledTimes(1);

        const result = registry.fireEvent('LifeCycleChanged', { stage: LifecycleStages.Ready, cancel: false });
        expect(result).toBe(true);
        expect(listenerA).toHaveBeenCalledWith({ stage: LifecycleStages.Ready, cancel: true });

        const listenerBDisposable = registry.addEvent('LifeCycleChanged', listenerB);
        expect(initSpy).toHaveBeenCalledTimes(1);

        listenerADisposable.dispose();
        expect(disposeSpy).not.toHaveBeenCalled();

        listenerBDisposable.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(1);

        registry.addEvent('LifeCycleChanged', listenerA);
        expect(initSpy).toHaveBeenCalledTimes(2);

        handlerDisposable.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(2);
    });

    it('should expose facade enum and event name singletons and support extension', () => {
        class EnumSource {
            static label = 'enum-source';

            extraEnum(this: { marker: string }) {
                return `${this.marker}:enum`;
            }
        }

        class EventSource {
            static label = 'event-source';

            extraEvent(this: { marker: string }) {
                return `${this.marker}:event`;
            }
        }

        class ExtendedEnum extends FEnum {
            marker = 'extended';
        }

        class ExtendedEventName extends FEventName {
            marker = 'extended';
        }

        ExtendedEnum.extend(EnumSource);
        ExtendedEventName.extend(EventSource);

        FEnum._instance = null;
        FEventName._instance = null;

        const facadeEnum = FEnum.get();
        const sameFacadeEnum = FEnum.get();
        const facadeEvent = FEventName.get();
        const sameFacadeEvent = FEventName.get();

        expect(facadeEnum).toBe(sameFacadeEnum);
        expect(facadeEvent).toBe(sameFacadeEvent);

        const enumMap: Record<string, unknown> = {
            AbsoluteRefType,
            UniverInstanceType,
            LifecycleStages,
            DataValidationType,
            DataValidationErrorStyle,
            DataValidationRenderMode,
            DataValidationOperator,
            DataValidationStatus,
            CommandType,
            BaselineOffset,
            BooleanNumber,
            HorizontalAlign,
            TextDecoration,
            TextDirection,
            VerticalAlign,
            WrapStrategy,
            BorderType,
            BorderStyleTypes,
            AutoFillSeries,
            ColorType,
            CommonHideTypes,
            CopyPasteType,
            DeleteDirection,
            DeveloperMetadataVisibility,
            Dimension,
            Direction,
            InterpolationPointType,
            LocaleType,
            MentionType,
            ProtectionType,
            RelativeDate,
            SheetTypes,
            ThemeColorType,
        };

        Object.entries(enumMap).forEach(([key, value]) => {
            expect(((facadeEnum as unknown) as Record<string, unknown>)[key]).toBe(value);
        });

        const eventMap = {
            DocCreated: 'DocCreated',
            DocDisposed: 'DocDisposed',
            LifeCycleChanged: 'LifeCycleChanged',
            Redo: 'Redo',
            Undo: 'Undo',
            BeforeRedo: 'BeforeRedo',
            BeforeUndo: 'BeforeUndo',
            CommandExecuted: 'CommandExecuted',
            BeforeCommandExecute: 'BeforeCommandExecute',
        };

        Object.entries(eventMap).forEach(([key, value]) => {
            expect(((facadeEvent as unknown) as Record<string, unknown>)[key]).toBe(value);
        });

        const extendedEnum = new ExtendedEnum() as ExtendedEnum & { extraEnum(): string };
        const extendedEvent = new ExtendedEventName() as ExtendedEventName & { extraEvent(): string };

        expect(extendedEnum.extraEnum()).toBe('extended:enum');
        expect((ExtendedEnum as typeof ExtendedEnum & { label: string }).label).toBe('enum-source');
        expect(extendedEvent.extraEvent()).toBe('extended:event');
        expect((ExtendedEventName as typeof ExtendedEventName & { label: string }).label).toBe('event-source');
    });
});
