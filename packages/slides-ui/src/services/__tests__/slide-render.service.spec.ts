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

import { ContextService, IContextService, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { SlideRenderService } from '../slide-render.service';

function createSlide(unitId: string) {
    return {
        getUnitId: () => unitId,
    };
}

class TestUniverInstanceService {
    readonly slideAdded$ = new Subject<{ unit: ReturnType<typeof createSlide> }>();
    readonly slideDisposed$ = new Subject<ReturnType<typeof createSlide>>();
    private readonly _initialSlides = [createSlide('existing-slide')];

    getTypeOfUnitAdded$(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SLIDE ? this.slideAdded$.asObservable() : new Subject().asObservable();
    }

    getTypeOfUnitDisposed$(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SLIDE ? this.slideDisposed$.asObservable() : new Subject().asObservable();
    }

    getAllUnitsForType(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SLIDE ? this._initialSlides : [];
    }

    getUnit(unitId: string) {
        return createSlide(unitId);
    }
}

class TestRenderManagerService {
    readonly createdRenderers: string[] = [];
    readonly removedRenderers: string[] = [];

    createRender(unitId: string) {
        this.createdRenderers.push(unitId);
    }

    removeRender(unitId: string) {
        this.removedRenderers.push(unitId);
    }
}

describe('SlideRenderService', () => {
    let instanceService: TestUniverInstanceService;
    let renderManagerService: TestRenderManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([SlideRenderService]);
        instanceService = injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService;
        renderManagerService = injector.get(IRenderManagerService) as unknown as TestRenderManagerService;
        injector.get(SlideRenderService);
    });

    it('creates renderers for existing and newly added slide units', async () => {
        await Promise.resolve();
        instanceService.slideAdded$.next({ unit: createSlide('new-slide') });

        expect(renderManagerService.createdRenderers).toEqual(['existing-slide', 'new-slide']);
    });

    it('removes the renderer when a slide unit is disposed', async () => {
        await Promise.resolve();
        instanceService.slideDisposed$.next(createSlide('old-slide'));

        expect(renderManagerService.removedRenderers).toEqual(['old-slide']);
    });
});
