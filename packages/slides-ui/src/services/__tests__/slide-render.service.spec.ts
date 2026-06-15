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

import { IContextService, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SlideRenderService } from '../slide-render.service';

describe('SlideRenderService', () => {
    let slideAdded$: Subject<unknown>;
    let slideDisposed$: Subject<unknown>;
    let createRender: ReturnType<typeof vi.fn>;
    let removeRender: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        slideAdded$ = new Subject();
        slideDisposed$ = new Subject();
        createRender = vi.fn();
        removeRender = vi.fn();
        const injector = new Injector();
        injector.add([IContextService, { useValue: {} as IContextService }]);
        injector.add([IUniverInstanceService, { useValue: {
            getTypeOfUnitAdded$: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SLIDE ? slideAdded$ : new Subject(),
            getTypeOfUnitDisposed$: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SLIDE ? slideDisposed$ : new Subject(),
            getAllUnitsForType: () => [{ getUnitId: () => 'existing-slide' }],
            getUnit: (unitId: string) => ({ getUnitId: () => unitId }),
        } as unknown as IUniverInstanceService }]);
        injector.add([IRenderManagerService, { useValue: { createRender, removeRender } as unknown as IRenderManagerService }]);
        injector.add([SlideRenderService]);
        injector.get(SlideRenderService);
    });

    it('creates renderers for existing and newly added slide units', async () => {
        await Promise.resolve();
        slideAdded$.next({ unit: { getUnitId: () => 'new-slide' } });

        expect(createRender).toHaveBeenCalledWith('existing-slide');
        expect(createRender).toHaveBeenCalledWith('new-slide');
    });

    it('removes the renderer when a slide unit is disposed', async () => {
        await Promise.resolve();
        slideDisposed$.next({ getUnitId: () => 'old-slide' });

        expect(removeRender).toHaveBeenCalledWith('old-slide');
    });
});
