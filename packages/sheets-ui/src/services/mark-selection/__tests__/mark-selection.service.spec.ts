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
    ThemeService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { IMarkSelectionService, MarkSelectionService } from '../mark-selection.service';

function createService(): IMarkSelectionService {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([SheetSkeletonService]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ThemeService]);
    injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
            },
        },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit('unit-1');
    return injector.get(IMarkSelectionService);
}

describe('MarkSelectionService', () => {
    it('stores temporary marked selections and removes them when the source action ends', () => {
        const service = createService();
        const selection = {
            range: { startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 },
            primary: null,
        };

        const id = service.addShapeWithNoFresh(selection as never, ['sheet.mutation.set-values']);
        expect(id).toBeTruthy();
        expect(service.getShapeMap().get(id!)).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            selection,
            exits: ['sheet.mutation.set-values'],
        });

        service.removeShape(id!);
        expect(service.getShapeMap().size).toBe(0);
    });
});
