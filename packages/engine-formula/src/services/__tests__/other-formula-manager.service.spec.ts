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

import { Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { IOtherFormulaManagerService, OtherFormulaManagerService } from '../other-formula-manager.service';

describe('OtherFormulaManagerService', () => {
    let service: IOtherFormulaManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IOtherFormulaManagerService, { useClass: OtherFormulaManagerService }]);
        service = injector.get(IOtherFormulaManagerService);
    });

    it('keeps plugin-owned formula data isolated by unit, sheet and formula id', () => {
        const item = { f: '=TABLE()', ranges: [] };

        service.register({ unitId: 'book-1', subUnitId: 'sheet-1', formulaId: 'table-1', item: item as never });

        expect(service.has({ unitId: 'book-1', subUnitId: 'sheet-1', formulaId: 'table-1' })).toBe(true);
        expect(service.get({ unitId: 'book-1', subUnitId: 'sheet-1', formulaId: 'table-1' })).toBe(item);
        expect(service.get({ unitId: 'book-1', subUnitId: 'sheet-2', formulaId: 'table-1' })).toBeUndefined();
    });

    it('batch removes only dirty formula ids reported by a feature plugin', () => {
        service.batchRegister({
            'book-1': {
                'sheet-1': {
                    'table-1': { f: '=TABLE(1)' } as never,
                    'table-2': { f: '=TABLE(2)' } as never,
                },
            },
        });

        service.batchRemove({ 'book-1': { 'sheet-1': { 'table-1': true } } } as never);

        expect(service.has({ unitId: 'book-1', subUnitId: 'sheet-1', formulaId: 'table-1' })).toBe(false);
        expect(service.has({ unitId: 'book-1', subUnitId: 'sheet-1', formulaId: 'table-2' })).toBe(true);
    });
});
