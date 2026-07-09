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

import { LifecycleService, LifecycleStages } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetCanvasFloatDomManagerService } from '../../../services/canvas-float-dom-manager.service';
import { registerSheetsDrawingFloatingHostCapability, SHEETS_DRAWING_FLOATING_HOST_DEPENDENCIES, touchSheetsDrawingFloatingHostCapabilityWhenReady } from '../register-sheets-drawing-floating-host';

const registerDependencies = vi.hoisted(() => vi.fn());
const touchDependencies = vi.hoisted(() => vi.fn());

vi.mock('@univerjs/core', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/core')>();

    return {
        ...actual,
        registerDependencies,
        touchDependencies,
    };
});

describe('registerSheetsDrawingFloatingHostCapability', () => {
    beforeEach(() => {
        registerDependencies.mockClear();
        touchDependencies.mockClear();
    });

    it('registers the minimal sheet float DOM host dependency', () => {
        const injector = {
            has: () => false,
        };

        registerSheetsDrawingFloatingHostCapability(injector as never);

        expect(SHEETS_DRAWING_FLOATING_HOST_DEPENDENCIES).toEqual([
            [SheetCanvasFloatDomManagerService],
        ]);
        expect(registerDependencies).toHaveBeenCalledWith(injector, [
            [SheetCanvasFloatDomManagerService],
        ]);
        expect(touchDependencies).toHaveBeenCalledWith(injector, [
            [SheetCanvasFloatDomManagerService],
        ]);
    });

    it('does not register the floating host dependency twice', () => {
        const injector = {
            has: (token: unknown) => token === SheetCanvasFloatDomManagerService,
        };

        registerSheetsDrawingFloatingHostCapability(injector as never);

        expect(registerDependencies).not.toHaveBeenCalled();
        expect(touchDependencies).toHaveBeenCalledWith(injector, [
            [SheetCanvasFloatDomManagerService],
        ]);
    });

    it('defers touching the floating host until lifecycle ready', async () => {
        let resolveReady: () => void = () => {};
        const onStage = vi.fn(() => new Promise<void>((resolve) => {
            resolveReady = resolve;
        }));
        const lifecycleService = {
            stage: LifecycleStages.Starting,
            onStage,
        };
        const injector = {
            has: (token: unknown) => token === LifecycleService,
            get: (token: unknown) => {
                if (token === LifecycleService) {
                    return lifecycleService;
                }
                throw new Error('Unexpected dependency');
            },
        };

        registerSheetsDrawingFloatingHostCapability(injector as never);

        expect(onStage).toHaveBeenCalledWith(LifecycleStages.Ready);
        expect(touchDependencies).not.toHaveBeenCalled();

        resolveReady();
        await Promise.resolve();

        expect(touchDependencies).toHaveBeenCalledWith(injector, [
            [SheetCanvasFloatDomManagerService],
        ]);
    });

    it('allows the full sheets drawing UI plugin to touch an already registered floating host', async () => {
        let resolveReady: () => void = () => {};
        const onStage = vi.fn(() => new Promise<void>((resolve) => {
            resolveReady = resolve;
        }));
        const lifecycleService = {
            stage: LifecycleStages.Starting,
            onStage,
        };
        const injector = {
            has: (token: unknown) => token === LifecycleService || token === SheetCanvasFloatDomManagerService,
            get: (token: unknown) => {
                if (token === LifecycleService) {
                    return lifecycleService;
                }
                throw new Error('Unexpected dependency');
            },
        };

        touchSheetsDrawingFloatingHostCapabilityWhenReady(injector as never);

        expect(registerDependencies).not.toHaveBeenCalled();
        expect(onStage).toHaveBeenCalledWith(LifecycleStages.Ready);
        expect(touchDependencies).not.toHaveBeenCalled();

        resolveReady();
        await Promise.resolve();

        expect(touchDependencies).toHaveBeenCalledWith(injector, [
            [SheetCanvasFloatDomManagerService],
        ]);
    });
});
