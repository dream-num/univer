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

import * as core from '@univerjs/core';
import { LifecycleStages } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormulaCalculationTriggerController } from '../formula-calculation-trigger.controller';

describe('FormulaCalculationTriggerController', () => {
    afterEach(() => vi.restoreAllMocks());

    it('starts immediately in Node.js', () => {
        vi.spyOn(core, 'isNodeEnv').mockReturnValue(true);
        const start = vi.fn();
        const lifecycle$ = new BehaviorSubject(LifecycleStages.Ready);

        const controller = new FormulaCalculationTriggerController(
            { start } as never,
            { lifecycle$ } as never
        );

        expect(start).toHaveBeenCalledOnce();
        controller.dispose();
    });

    it('starts after rendering in the browser', () => {
        vi.spyOn(core, 'isNodeEnv').mockReturnValue(false);
        const start = vi.fn();
        const lifecycle$ = new BehaviorSubject(LifecycleStages.Ready);

        const controller = new FormulaCalculationTriggerController(
            { start } as never,
            { lifecycle$ } as never
        );

        expect(start).not.toHaveBeenCalled();
        lifecycle$.next(LifecycleStages.Rendered);
        expect(start).toHaveBeenCalledOnce();

        lifecycle$.next(LifecycleStages.Steady);
        expect(start).toHaveBeenCalledOnce();
        controller.dispose();
    });
});
