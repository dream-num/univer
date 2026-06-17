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
    IUniverInstanceService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SheetsSelectionsService } from '../selection.service';

function createService() {
    const injector = new Injector();
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([SheetsSelectionsService]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: { 'sheet-1': { id: 'sheet-1' } },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit('unit-1');

    return injector.get(SheetsSelectionsService);
}

describe('SheetsSelectionsService', () => {
    it('sets and clears the active worksheet selections', () => {
        const service = createService();
        const selection = {
            range: { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
            primary: { actualRow: 1, actualColumn: 2, startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
        };

        service.setSelections([selection] as never);

        expect(service.getCurrentSelections()).toEqual([selection]);
        expect(service.getCurrentLastSelectionPrimaryCell()).toEqual(selection.primary);

        service.clearCurrentSelections();
        expect(service.getCurrentSelections()).toEqual([]);
    });

    it('detects overlapping selections on the active sheet', () => {
        const service = createService();

        service.setSelections([{
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            primary: null,
        }, {
            range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            primary: null,
        }] as never);

        expect(service.isOverlapping()).toBe(true);
    });
});
