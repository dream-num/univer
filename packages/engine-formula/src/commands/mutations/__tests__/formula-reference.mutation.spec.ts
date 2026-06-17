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

import { ICommandService, IUniverInstanceService, Univer } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TableOptionType } from '../../../basics/common';
import { DefinedNamesService, IDefinedNamesService } from '../../../services/defined-names.service';
import { ISuperTableService, SuperTableService } from '../../../services/super-table.service';
import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '../set-defined-name.mutation';
import { RemoveSuperTableMutation, SetSuperTableMutation, SetSuperTableOptionMutation } from '../set-super-table.mutation';

describe('formula reference mutations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let definedNamesService: IDefinedNamesService;
    let superTableService: ISuperTableService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
        injector.add([ISuperTableService, { useClass: SuperTableService }]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(SetDefinedNameMutation);
        commandService.registerCommand(RemoveDefinedNameMutation);
        commandService.registerCommand(SetSuperTableMutation);
        commandService.registerCommand(RemoveSuperTableMutation);
        commandService.registerCommand(SetSuperTableOptionMutation);
        definedNamesService = injector.get(IDefinedNamesService);
        superTableService = injector.get(ISuperTableService);
        injector.get(IUniverInstanceService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('sets and removes defined names used by formulas', async () => {
        const setResult = await commandService.executeCommand(SetDefinedNameMutation.id, {
            unitId: 'book-1',
            id: 'name-1',
            name: '  SalesTotal  ',
            formulaOrRefString: '  Sheet1!A1:A10  ',
            comment: '  Used by dashboard  ',
        });

        expect(setResult).toBe(true);
        expect(definedNamesService.getValueById('book-1', 'name-1')).toEqual({
            id: 'name-1',
            name: 'SalesTotal',
            formulaOrRefString: 'Sheet1!A1:A10',
            comment: 'Used by dashboard',
            hidden: undefined,
            localSheetId: undefined,
            formulaOrRefStringWithPrefix: undefined,
        });

        const removeResult = await commandService.executeCommand(RemoveDefinedNameMutation.id, {
            unitId: 'book-1',
            id: 'name-1',
        });

        expect(removeResult).toBe(true);
        expect(definedNamesService.getValueById('book-1', 'name-1')).toBeUndefined();
    });

    it('sets and removes structured-reference tables used by formulas', async () => {
        const tableReference = {
            range: {
                startRow: 0,
                endRow: 10,
                startColumn: 0,
                endColumn: 3,
            },
        };

        const setResult = await commandService.executeCommand(SetSuperTableMutation.id, {
            unitId: 'book-1',
            tableName: 'SalesTable',
            reference: tableReference,
        });

        expect(setResult).toBe(true);
        expect(superTableService.getTable('book-1', 'SalesTable')).toEqual(tableReference);

        const removeResult = await commandService.executeCommand(RemoveSuperTableMutation.id, {
            unitId: 'book-1',
            tableName: 'SalesTable',
        });

        expect(removeResult).toBe(true);
        expect(superTableService.hasTable('book-1', 'SalesTable')).toBe(false);
    });

    it('registers localized structured-reference table options', async () => {
        const result = await commandService.executeCommand(SetSuperTableOptionMutation.id, {
            tableOption: '数据',
            tableOptionType: TableOptionType.DATA,
        });

        expect(result).toBe(true);
        expect(superTableService.getTableOptionMap().get('数据')).toBe(TableOptionType.DATA);
    });
});
