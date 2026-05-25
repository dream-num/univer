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

import type { Workbook } from '@univerjs/core';
import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { AbsoluteRefType } from '@univerjs/core';
import { validateDefinedName } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { getAbsoluteRefStringFromSelection, resolveDefinedNameBoxAction } from '../defined-name-utils';

function createWorkbookMock(sheetNames = ['Sheet1']) {
    const sheets = new Map(sheetNames.map((name, index) => [`sheet-${index}`, { getName: () => name }]));

    return {
        getSheetOrders: () => Array.from(sheets.keys()),
        getSheetBySheetId: (sheetId: string) => sheets.get(sheetId),
        getActiveSheet: () => ({ getName: () => 'Sheet1' }),
    } as unknown as Workbook;
}

function createValidationDeps(overrides: {
    definedName?: IDefinedNamesServiceParam | null;
    hasTable?: boolean;
    hasFunction?: boolean;
} = {}) {
    return {
        unitId: 'unit-1',
        name: 'SalesTotal',
        workbook: createWorkbookMock(),
        definedNamesService: {
            getValueByName: vi.fn(() => overrides.definedName ?? null),
        } as any,
        superTableService: {
            hasTable: vi.fn(() => overrides.hasTable ?? false),
        } as any,
        functionService: {
            hasExecutor: vi.fn(() => overrides.hasFunction ?? false),
        } as any,
        univerInstanceService: {
            getUnit: vi.fn(() => ({ getSheets: () => [{ getName: () => 'Sheet1' }] })),
        } as any,
    };
}

describe('defined-name.utils', () => {
    it('should reject duplicate defined names during validation', () => {
        const name = 'SalesTotal';
        const formulaOrRefString = 'Sheet1!$A$1';
        const {
            unitId,
            definedNamesService,
            superTableService,
            functionService,
            univerInstanceService,
        } = createValidationDeps({
            definedName: {
                id: 'defined-name-1',
                name,
                formulaOrRefString,
            },
        });

        const error = validateDefinedName(name, {
            unitId,
            formulaOrRefString,
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        });

        expect(error).toBe('sheets.definedName.nameDuplicate');
    });

    it('should resolve Enter on an existing defined name to focus the name', () => {
        const existingDefinedName = {
            id: 'defined-name-1',
            name: 'SalesTotal',
            formulaOrRefString: 'Sheet1!$A$1',
        };

        const {
            unitId,
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        } = createValidationDeps({
            definedName: existingDefinedName,
        });

        const action = resolveDefinedNameBoxAction({
            inputValue: 'salestotal',
            rangeString: 'A1',
            unitId,
            formulaOrRefString: existingDefinedName.formulaOrRefString,
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        });

        expect(action).toEqual({
            type: 'focusDefinedName',
            definedName: existingDefinedName,
        });
    });

    it('should resolve Enter on a typed reference to focus the selection', () => {
        const {
            unitId,
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        } = createValidationDeps();

        const action = resolveDefinedNameBoxAction({
            inputValue: 'B2:C4',
            rangeString: 'A1',
            unitId,
            formulaOrRefString: '',
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        });

        expect(action).toEqual({
            type: 'focusSelection',
            refString: 'B2:C4',
        });
    });

    it('should resolve Enter on a valid new name to create a defined name', () => {
        const {
            unitId,
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        } = createValidationDeps();

        const action = resolveDefinedNameBoxAction({
            inputValue: 'SalesTotal',
            rangeString: 'A1',
            unitId,
            formulaOrRefString: 'A1',
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        });

        expect(action).toEqual({
            type: 'createDefinedName',
            name: 'SalesTotal',
        });
    });

    it('should reset when Enter is pressed on an invalid name', () => {
        const {
            unitId,
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        } = createValidationDeps();

        const action = resolveDefinedNameBoxAction({
            inputValue: 'Sheet1',
            rangeString: 'A1',
            unitId,
            formulaOrRefString: '',
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        });

        expect(action).toEqual({
            type: 'reset',
        });
    });

    it('should build the absolute reference string for a single selected cell', () => {
        const convertRefersToAbsolute = vi.fn((value: string) => `ABS(${value})`);
        const selections = [{
            range: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            },
        }] as ISelectionWithStyle[];

        const absoluteRef = getAbsoluteRefStringFromSelection(
            createWorkbookMock(),
            selections,
            { convertRefersToAbsolute } as any
        );

        expect(absoluteRef).toBe('ABS(Sheet1!A1)');
        expect(convertRefersToAbsolute).toHaveBeenCalledWith('Sheet1!A1', AbsoluteRefType.ALL, AbsoluteRefType.ALL, 'Sheet1');
    });

    it('should build the absolute reference string for a selected range', () => {
        const convertRefersToAbsolute = vi.fn((value: string) => `ABS(${value})`);
        const selections = [{
            range: {
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2,
            },
        }] as ISelectionWithStyle[];

        const absoluteRef = getAbsoluteRefStringFromSelection(
            createWorkbookMock(),
            selections,
            { convertRefersToAbsolute } as any
        );

        expect(absoluteRef).toBe('ABS(Sheet1!B2:C4)');
        expect(convertRefersToAbsolute).toHaveBeenCalledWith('Sheet1!B2:C4', AbsoluteRefType.ALL, AbsoluteRefType.ALL, 'Sheet1');
    });
});
