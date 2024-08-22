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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IUniverInstanceService, LifecycleService, LifecycleStages, UniverInstanceType } from '@univerjs/core';
import type { Injector, Univer } from '@univerjs/core';

import type { FUniver } from '../facade';
import { createFacadeTestBed, createUnitTestBed } from './create-test-bed';

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

describe('Test Unit Hooks', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let univer: Univer;

    beforeEach(() => {
        const testBed = createUnitTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;
        univer = testBed.univer;
    });

    it('Hooks Create Unit', () => {
        const randomUnitId = 'randomUnitId';
        let unitId;
        let unitType;
        univerAPI.getHooks().afterCreateUnit((unit) => {
            unitId = unit.getUnitId();
            unitType = unit.getType();
        });
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: randomUnitId,
        });
        expect(unitId).toBe(randomUnitId);
        expect(unitType).toBe(UniverInstanceType.UNIVER_SHEET);
    });

    it('Hooks Deny Create Unit', () => {
        const disposeObj = univerAPI.getHooks().beforeCreateUnit(() => false);
        try {
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'randomUnitId',
            });
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect((e as Error).message).toBe('[UniverInstanceService]: cannot add unit with user callback.');
        }

        disposeObj.dispose();

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'randomUnitId',
        });
    });

    it('Hooks dispose Unit', () => {
        const randomUnitId = 'randomUnitId';
        let unitId;
        let unitType;
        const disposeCallback = vi.fn();
        const beforeCallbackDispose = univerAPI.getHooks().beforeDisposeUnit((unit) => {
            unitId = unit.getUnitId();
            unitType = unit.getType();

            return false;
        });
        univerAPI.getHooks().afterCreateUnit(disposeCallback);

        const unit = univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: randomUnitId,
        });

        // TODO: not calling dispose() method
        // unit.dispose();

        const _univerInstanceService = get(IUniverInstanceService);
        _univerInstanceService.disposeUnit(unit.getUnitId());

        expect(unitId).toBe(randomUnitId);
        expect(unitType).toBe(UniverInstanceType.UNIVER_SHEET);

        // @ts-expect-error
        expect(unit._disposed).toBe(false);

        beforeCallbackDispose.dispose();
        unit.dispose();
        // @ts-expect-error
        expect(unit._disposed).toBe(true);

        expect(disposeCallback).toBeCalledTimes(1);
    });
});
