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

import type { Injector as IInjector } from '@univerjs/core';
import { Inject, Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { FBase, FBaseInitialable } from '../f-base';

describe('FBase', () => {
    it('should add facade extension methods and run initializers with the active injector', () => {
        const initLog = new WeakMap<object, string[]>();

        class BaseSource {
            static sourceLabel = 'base-source';

            greet(this: { prefix: string }, name: string) {
                return `${this.prefix}:${name}`;
            }
        }

        class InitSourceA {
            static initSource = 'a';

            _initialize(injector: IInjector) {
                const current = initLog.get(this) ?? [];
                current.push(`a:${Boolean(injector)}`);
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

            constructor(@Inject(Injector) injector: IInjector) {
                super(injector);
            }
        }

        class ManualInitialable extends FBaseInitialable {
            steps: string[] = [];

            constructor(@Inject(Injector) injector: IInjector) {
                super(injector);
            }

            static enableManualInitForTest() {
                this._enableManualInit();
            }

            runManualInitializers(injector: IInjector) {
                this._runInitializers(injector);
            }
        }

        BaseFacade.extend(BaseSource);
        AutoInitialable.extend(InitSourceA);
        AutoInitialable.extend(InitSourceB);
        ManualInitialable.extend(InitSourceA);
        ManualInitialable.enableManualInitForTest();

        const injector = new Injector();
        const baseFacade = injector.createInstance(BaseFacade) as BaseFacade & { greet(name: string): string };
        const auto = injector.createInstance(AutoInitialable) as AutoInitialable & { mark(value: string): void };
        const manual = injector.createInstance(ManualInitialable) as ManualInitialable & { mark(value: string): void };

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
});
