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

import { describe, expect, it } from 'vitest';
import { DefinedNamesService } from '../defined-names.service';

function createDefinedNamesService() {
    const worksheet = { id: 'sheet-a' };
    const workbook = {
        getSheetBySheetName: (sheetName: string) => (sheetName === 'Sheet1' ? worksheet : null),
    };
    const univerInstanceService = {
        getUnit: () => workbook,
    };

    const service = new DefinedNamesService(univerInstanceService as never);
    return {
        service,
        worksheet,
    };
}

describe('DefinedNamesService', () => {
    it('should register/query/remove defined names and update cache', () => {
        const { service } = createDefinedNamesService();

        service.registerDefinedName('unit-1', {
            id: 'id-1',
            name: 'Total',
            formulaOrRefString: 'Sheet1!A1',
        });
        expect(service.getValueById('unit-1', 'id-1')?.name).toBe('Total');
        expect(service.getValueByName('unit-1', 'Total')?.id).toBe('id-1');
        expect(service.getValueByName('unit-1', 'total')?.id).toBe('id-1');
        expect(service.hasDefinedName('unit-1')).toBe(true);

        service.removeDefinedName('unit-1', 'id-1');
        expect(service.getValueById('unit-1', 'id-1')).toBeUndefined();
        expect(service.hasDefinedName('unit-1')).toBe(false);
    });

    it('should support batch register and unit cleanup', () => {
        const { service } = createDefinedNamesService();
        service.registerDefinedNames('unit-2', {
            a: {
                id: 'a',
                name: 'NameA',
                formulaOrRefString: 'Sheet1!A1',
            },
            b: {
                id: 'b',
                name: 'NameB',
                formulaOrRefString: 'Sheet1!B1',
            },
        });

        expect(service.getDefinedNameMap('unit-2')).toBeDefined();
        expect(service.getAllDefinedNames()['unit-2']).toBeDefined();
        expect(service.getDefinedNameByRefString('unit-2', 'Sheet1!B1')?.id).toBe('b');

        service.removeUnitDefinedName('unit-2');
        expect(service.getDefinedNameMap('unit-2')).toBeUndefined();
    });

    it('should emit update/current/focus streams', () => {
        const { service } = createDefinedNamesService();
        let updateCount = 0;
        const ranges: any[] = [];
        const focused: any[] = [];

        service.update$.subscribe(() => updateCount++);
        service.currentRange$.subscribe((range) => ranges.push(range));
        service.focusRange$.subscribe((payload) => focused.push(payload));

        service.registerDefinedName('unit-3', {
            id: 'id-focus',
            name: 'F',
            formulaOrRefString: 'Sheet1!A1',
        });
        service.setCurrentRange({
            unitId: 'unit-3',
            sheetId: 'sheet-1',
            range: {
                startRow: 1,
                endRow: 2,
                startColumn: 3,
                endColumn: 4,
            },
        });
        service.focusRange('unit-3', 'id-focus');
        service.focusRange('unit-3', 'missing-id');

        expect(updateCount).toBeGreaterThan(0);
        expect(ranges[0]?.unitId).toBe('unit-3');
        expect(service.getCurrentRangeForString()).toBe('D2:E3');
        expect(focused).toEqual([
            {
                unitId: 'unit-3',
                id: 'id-focus',
                name: 'F',
                formulaOrRefString: 'Sheet1!A1',
            },
        ]);
    });

    it('should resolve worksheet by reference string', () => {
        const { service, worksheet } = createDefinedNamesService();

        expect(service.getWorksheetByRef('unit-1', 'Sheet1!A1')).toBe(worksheet);
        expect(service.getWorksheetByRef('unit-1', 'Missing!A1')).toBeNull();
    });
});
