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
    IConfirmService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    TestConfirmService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder } from '@univerjs/engine-formula';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsSortService } from '@univerjs/sheets-sort';
import { describe, expect, it } from 'vitest';
import { SheetsSortUIService } from '../sheets-sort-ui.service';

function createService() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IConfirmService, { useClass: TestConfirmService }]);
    injector.add([LexerTreeBuilder]);
    injector.add([FormulaDataModel]);
    injector.add([SheetsSelectionsService]);
    injector.add([SheetsSortService]);
    injector.add([LocaleService]);
    injector.add([SheetsSortUIService]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                cellData: {
                    0: {
                        1: { v: '0:1' },
                        2: { v: '0:2' },
                        3: { v: '0:3' },
                    },
                },
            },
        },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit('unit-1');
    return injector.get(SheetsSortUIService);
}

describe('SheetsSortUIService', () => {
    it('tracks the custom sort panel location and derives column titles from the selected range', () => {
        const service = createService();
        const location = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            colIndex: 1,
            range: { startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 },
        };

        service.showCustomSortPanel(location);
        expect(service.customSortState()).toEqual({ location, show: true });
        expect(service.getTitles(true)).toEqual([
            { index: 1, label: '0:1' },
            { index: 2, label: '0:2' },
            { index: 3, label: '0:3' },
        ]);

        service.closeCustomSortPanel();
        expect(service.customSortState()).toEqual({ show: false });
    });
});
