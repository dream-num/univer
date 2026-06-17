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

describe('SheetsFilterService', () => {
    it('creates and removes filter models for workbook sheets', () => {
        const service = createService();

        const model = service.ensureFilterModel('unit-1', 'sheet-1');

        expect(service.getFilterModel('unit-1', 'sheet-1')).toBe(model);
        expect(service.removeFilterModel('unit-1', 'sheet-1')).toBe(true);
        expect(service.getFilterModel('unit-1', 'sheet-1')).toBeNull();
    });

    it('publishes filter error messages for UI consumers', () => {
        const service = createService();
        const messages: unknown[] = [];
        const sub = service.errorMsg$.subscribe((message) => messages.push(message));

        service.setFilterErrorMsg('Invalid filter range');

        expect(messages).toEqual([null, 'Invalid filter range']);
        sub.unsubscribe();
    });
});
