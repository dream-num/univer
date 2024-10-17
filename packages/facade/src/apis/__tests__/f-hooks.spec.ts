/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Injector } from '@univerjs/core';
import type { FUniver } from '../everything';
import { LifecycleService, LifecycleStages } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFacadeTestBed } from './create-test-bed';

describe('Test FUniver', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;
    });

    it('Hooks lifecycle stages', () => {
        const lifecycleService = get(LifecycleService);

        const onRendered = vi.fn();
        const onSteady = vi.fn();

        const onRenderedDisposable = univerAPI.getHooks().onRendered(onRendered);
        const onSteadyDisposable = univerAPI.getHooks().onSteady(onSteady);

        lifecycleService.stage = LifecycleStages.Rendered;
        lifecycleService.stage = LifecycleStages.Steady;

        expect(onRendered).toBeCalledTimes(1);
        expect(onSteady).toBeCalledTimes(1);

        onRenderedDisposable.dispose();
        onSteadyDisposable.dispose();
    });
});
