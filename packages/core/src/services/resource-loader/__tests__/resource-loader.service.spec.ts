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

import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Injector } from '../../../common/di';
import { UniverInstanceType } from '../../../common/unit';
import { IUniverInstanceService } from '../../instance/instance.service';
import { IResourceManagerService } from '../../resource-manager/type';
import { ResourceLoaderService } from '../resource-loader.service';

describe('ResourceLoaderService', () => {
    let service: ResourceLoaderService;
    let register$: Subject<never>;
    let sheetAdded$: Subject<unknown>;
    let docAdded$: Subject<unknown>;
    let slideAdded$: Subject<unknown>;
    let baseAdded$: Subject<unknown>;
    let sheetDisposed$: Subject<unknown>;
    let docDisposed$: Subject<unknown>;
    let baseDisposed$: Subject<unknown>;
    let slideDisposed$: Subject<unknown>;
    let resourceManagerService: {
        getAllResourceHooks: ReturnType<typeof vi.fn>;
        register$: Subject<never>;
        loadResources: ReturnType<typeof vi.fn>;
        unloadResources: ReturnType<typeof vi.fn>;
        getResources: ReturnType<typeof vi.fn>;
    };
    let univerInstanceService: {
        getAllUnitsForType: ReturnType<typeof vi.fn>;
        getTypeOfUnitAdded$: ReturnType<typeof vi.fn>;
        getTypeOfUnitDisposed$: ReturnType<typeof vi.fn>;
        getUnit: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        register$ = new Subject();
        sheetAdded$ = new Subject();
        docAdded$ = new Subject();
        slideAdded$ = new Subject();
        baseAdded$ = new Subject();
        sheetDisposed$ = new Subject();
        docDisposed$ = new Subject();
        baseDisposed$ = new Subject();
        slideDisposed$ = new Subject();
        resourceManagerService = {
            getAllResourceHooks: vi.fn(() => []),
            register$,
            loadResources: vi.fn(),
            unloadResources: vi.fn(),
            getResources: vi.fn(() => [{ name: 'plugin', data: '{}' }]),
        };
        univerInstanceService = {
            getAllUnitsForType: vi.fn(() => []),
            getTypeOfUnitAdded$: vi.fn((type) => {
                if (type === UniverInstanceType.UNIVER_SHEET) return sheetAdded$;
                if (type === UniverInstanceType.UNIVER_DOC) return docAdded$;
                if (type === UniverInstanceType.UNIVER_BASE) return baseAdded$;
                return slideAdded$;
            }),
            getTypeOfUnitDisposed$: vi.fn((type) => {
                if (type === UniverInstanceType.UNIVER_SHEET) return sheetDisposed$;
                if (type === UniverInstanceType.UNIVER_DOC) return docDisposed$;
                if (type === UniverInstanceType.UNIVER_BASE) return baseDisposed$;
                return slideDisposed$;
            }),
            getUnit: vi.fn(),
        };
        class TestResourceManagerService {
            getAllResourceHooks = resourceManagerService.getAllResourceHooks;
            register$ = resourceManagerService.register$;
            loadResources = resourceManagerService.loadResources;
            unloadResources = resourceManagerService.unloadResources;
            getResources = resourceManagerService.getResources;
        }

        class TestUniverInstanceService {
            getAllUnitsForType = univerInstanceService.getAllUnitsForType;
            getTypeOfUnitAdded$ = univerInstanceService.getTypeOfUnitAdded$;
            getTypeOfUnitDisposed$ = univerInstanceService.getTypeOfUnitDisposed$;
            getUnit = univerInstanceService.getUnit;
        }

        const injector = new Injector();
        injector.add([IResourceManagerService, { useClass: TestResourceManagerService as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ResourceLoaderService]);
        service = injector.get(ResourceLoaderService);
    });

    it('loads resources when a workbook unit is added and unloads them when disposed', () => {
        const workbook = {
            getUnitId: () => 'book-1',
            getSnapshot: () => ({ resources: [{ name: 'sheet-plugin', data: '{}' }] }),
        };

        sheetAdded$.next({ unit: workbook });
        sheetDisposed$.next(workbook);

        expect(resourceManagerService.loadResources).toHaveBeenCalledWith('book-1', [{ name: 'sheet-plugin', data: '{}' }]);
        expect(resourceManagerService.unloadResources).toHaveBeenCalledWith('book-1', UniverInstanceType.UNIVER_SHEET);
    });

    it('loads resources when a base unit is added and unloads them when disposed', () => {
        const base = {
            getUnitId: () => 'base-1',
            getSnapshot: () => ({ resources: [{ name: 'base-plugin', data: '{}' }] }),
        };

        baseAdded$.next({ unit: base });
        baseDisposed$.next(base);

        expect(resourceManagerService.loadResources).toHaveBeenCalledWith('base-1', [{ name: 'base-plugin', data: '{}' }]);
        expect(resourceManagerService.unloadResources).toHaveBeenCalledWith('base-1', UniverInstanceType.UNIVER_BASE);
    });

    it('saves a unit snapshot with current plugin resources', () => {
        univerInstanceService.getUnit.mockReturnValue({
            type: UniverInstanceType.UNIVER_SHEET,
            getSnapshot: () => ({ id: 'book-1', sheets: {} }),
        });

        expect(service.saveUnit('book-1')).toEqual({
            id: 'book-1',
            sheets: {},
            resources: [{ name: 'plugin', data: '{}' }],
        });
    });
});
