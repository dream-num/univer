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
    ContextService,
    DesktopLogService,
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
import { NumfmtService } from '../numfmt.service';

function createService() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IResourceManagerService, { useClass: ResourceManagerService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([NumfmtService]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: { 'sheet-1': { id: 'sheet-1' } },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);

    return injector.get(NumfmtService);
}

describe('NumfmtService', () => {
    it('sets, reads, and deletes number format patterns on worksheet cells', () => {
        const service = createService();
        const range = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };

        service.setValues('unit-1', 'sheet-1', [{ ranges: [range], pattern: 'yyyy-mm-dd' }]);

        expect(service.getValue('unit-1', 'sheet-1', 0, 0)).toEqual({ pattern: 'yyyy-mm-dd' });

        service.deleteValues('unit-1', 'sheet-1', [range]);
        expect(service.getValue('unit-1', 'sheet-1', 0, 0)).toBeNull();
    });
});
