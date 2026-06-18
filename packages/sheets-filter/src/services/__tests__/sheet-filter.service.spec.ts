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

import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IResourceManagerService,
    IUniverInstanceService,
    ResourceManagerService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetsFilterService } from '../sheet-filter.service';

function createService() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IResourceManagerService, { useClass: ResourceManagerService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([SheetsFilterService]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: { 'sheet-1': { id: 'sheet-1' } },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit('unit-1');

    return injector.get(SheetsFilterService);
}

function createServiceWithCapturedResource() {
    let resourceConfig: any;
    const sheet = {
        getUnitId: () => 'unit-1',
        getSheetId: () => 'sheet-1',
    };
    const workbook = {
        getUnitId: () => 'unit-1',
        getSheetBySheetId: (sheetId: string) => (sheetId === 'sheet-1' ? sheet : null),
        getActiveSheet: () => sheet,
        activeSheet$: of(sheet),
    };

    class TestResourceManagerService {
        registerPluginResource(config: unknown) {
            resourceConfig = config;
            return { dispose: () => undefined };
        }
    }

    class TestUniverInstanceService {
        getUniverSheetInstance = (unitId: string) => (unitId === 'unit-1' ? workbook : null);
        getCurrentUnitOfType = () => workbook;
        getCurrentTypeOfUnit$ = () => of(workbook);
    }

    class TestCommandService {
        onCommandExecuted = () => ({ dispose: () => undefined });
    }

    const injector = new Injector();
    injector.add([IResourceManagerService, { useClass: TestResourceManagerService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([SheetsFilterService]);

    return { service: injector.get(SheetsFilterService), getResourceConfig: () => resourceConfig };
}

describe('SheetsFilterService', () => {
    it('creates and removes filter models for workbook sheets', () => {
        const service = createService();

        const model = service.ensureFilterModel('unit-1', 'sheet-1');

        expect(service.getFilterModel('unit-1', 'sheet-1')).toBe(model);
        expect(service.removeFilterModel('unit-1', 'sheet-1')).toBe(true);
        expect(service.getFilterModel('unit-1', 'sheet-1')).toBeNull();
        expect(service.removeFilterModel('unit-1', 'sheet-1')).toBe(false);
    });

    it('throws when creating filter models for missing workbook or worksheet', () => {
        const service = createService();

        expect(() => service.ensureFilterModel('missing', 'sheet-1')).toThrow('non-existing workbook missing');
        expect(() => service.ensureFilterModel('unit-1', 'missing')).toThrow('non-existing worksheet missing');
    });

    it('publishes filter error messages for UI consumers', () => {
        const service = createService();
        const messages: unknown[] = [];
        const sub = service.errorMsg$.subscribe((message) => messages.push(message));

        service.setFilterErrorMsg('Invalid filter range');

        expect(messages).toEqual([null, 'Invalid filter range']);
        sub.unsubscribe();
    });

    it('disposes cached filter models and completes state streams', () => {
        const service = createService();
        const model = service.ensureFilterModel('unit-1', 'sheet-1');
        const completions: string[] = [];

        service.loadedUnitId$.subscribe({ complete: () => completions.push('loaded') });
        service.errorMsg$.subscribe({ complete: () => completions.push('error') });
        service.activeFilterModel$.subscribe({ complete: () => completions.push('active') });

        service.dispose();

        expect(service.getFilterModel('unit-1', 'sheet-1')).toBeNull();
        expect((model as never as { _disposed: boolean })._disposed).toBe(true);
        expect(completions).toEqual(['loaded', 'error', 'active']);
    });

    it('loads and unloads filter models from snapshot resources and updates active model', () => {
        const { service, getResourceConfig } = createServiceWithCapturedResource();
        const loaded: unknown[] = [];
        const active: unknown[] = [];
        service.loadedUnitId$.subscribe((unitId) => loaded.push(unitId));
        service.activeFilterModel$.subscribe((model) => active.push(model));

        expect(getResourceConfig().toJson('unit-1')).toBe('{}');

        getResourceConfig().onLoad('unit-1', {
            'sheet-1': {
                ref: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 },
                filterColumns: [],
            },
        });

        expect(loaded).toEqual([null, 'unit-1']);
        expect(service.getFilterModel('unit-1', 'sheet-1')).toBe(service.activeFilterModel);
        expect(active.at(-1)).toBe(service.activeFilterModel);
        expect(JSON.parse(getResourceConfig().toJson('unit-1'))['sheet-1']).toMatchObject({
            ref: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 },
        });

        getResourceConfig().onUnLoad('unit-1');
        expect(service.getFilterModel('unit-1', 'sheet-1')).toBeNull();
        expect(JSON.stringify(getResourceConfig().parseJson('{"sheet-1":{"filterColumns":[]}}'))).toBe('{"sheet-1":{"filterColumns":[]}}');
    });
});
