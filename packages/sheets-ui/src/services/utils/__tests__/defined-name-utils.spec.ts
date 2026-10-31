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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { IUniverInstanceService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import {
    DefinedNamesService,
    FunctionService,
    IDefinedNamesService,
    IFunctionService,
    ISuperTableService,
    LexerTreeBuilder,
    SuperTableService,
} from '@univerjs/engine-formula';
import { SCOPE_WORKBOOK_VALUE_DEFINED_NAME, validateDefinedName } from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import { afterEach, describe, expect, it } from 'vitest';
import { getAbsoluteRefStringFromSelection, resolveDefinedNameBoxAction } from '../defined-name-utils';

const univers: Univer[] = [];

function createValidationDeps(overrides: {
    definedName?: IDefinedNamesServiceParam | null;
} = {}) {
    const univer = new Univer();
    univers.push(univer);
    const injector = univer.__getInjector();
    injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
    injector.add([IFunctionService, { useClass: FunctionService }]);
    injector.add([ISuperTableService, { useClass: SuperTableService }]);
    injector.add([LexerTreeBuilder]);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit-1',
        name: 'Aliases',
        appVersion: '1.0.0',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['sheet-0', 'sheet-1'],
        sheets: {
            'sheet-0': { id: 'sheet-0', name: 'Sheet1', rowCount: 1000, columnCount: 20 },
            'sheet-1': { id: 'sheet-1', name: 'Sheet2', rowCount: 1000, columnCount: 20 },
        },
    });
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const definedNamesService = injector.get(IDefinedNamesService);
    if (overrides.definedName) {
        definedNamesService.registerDefinedNames('unit-1', { [overrides.definedName.id]: overrides.definedName });
    }
    return {
        unitId: 'unit-1',
        name: 'SalesTotal',
        workbook,
        definedNamesService,
        superTableService: injector.get(ISuperTableService),
        functionService: injector.get(IFunctionService),
        univerInstanceService: injector.get(IUniverInstanceService),
        lexerTreeBuilder: injector.get(LexerTreeBuilder),
    };
}

describe('defined-name.utils', () => {
    afterEach(() => univers.splice(0).forEach((univer) => univer.dispose()));

    it.each([undefined, null, SCOPE_WORKBOOK_VALUE_DEFINED_NAME])('treats legacy and explicit workbook scopes alike: %s', (localSheetId) => {
        const deps = createValidationDeps({
            definedName: { id: 'legacy', name: 'SalesTotal', formulaOrRefString: '=8' },
        });
        const options = { ...deps, formulaOrRefString: '=5', localSheetId };
        expect(validateDefinedName('SALESTOTAL', options)).toBe('sheets.definedName.nameDuplicate');
        expect(validateDefinedName('SalesTotal', { ...options, id: 'legacy' })).toBe(true);
        expect(validateDefinedName('SalesTotal', { ...options, localSheetId: 'sheet-1' })).toBe(true);
    });
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
            worksheet: createValidationDeps().workbook.getActiveSheet(),
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
            worksheet: createValidationDeps().workbook.getActiveSheet(),
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

    it('should reset when a typed reference is outside the worksheet bounds', () => {
        const {
            unitId,
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        } = createValidationDeps();

        const action = resolveDefinedNameBoxAction({
            inputValue: 'Z200',
            rangeString: 'A1',
            unitId,
            formulaOrRefString: '',
            worksheet: createValidationDeps().workbook.getActiveSheet(),
            univerInstanceService,
            definedNamesService,
            superTableService,
            functionService,
        });

        expect(action).toEqual({
            type: 'reset',
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
            worksheet: createValidationDeps().workbook.getActiveSheet(),
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
            worksheet: createValidationDeps().workbook.getActiveSheet(),
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
        const deps = createValidationDeps();
        const selections = [{
            range: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            },
        }] as ISelectionWithStyle[];

        const absoluteRef = getAbsoluteRefStringFromSelection(
            deps.workbook,
            selections,
            deps.lexerTreeBuilder
        );

        expect(absoluteRef).toBe('Sheet1!$A$1');
    });

    it('should build the absolute reference string for a selected range', () => {
        const deps = createValidationDeps();
        const selections = [{
            range: {
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2,
            },
        }] as ISelectionWithStyle[];

        const absoluteRef = getAbsoluteRefStringFromSelection(
            deps.workbook,
            selections,
            deps.lexerTreeBuilder
        );

        expect(absoluteRef).toBe('Sheet1!$B$2:$C$4');
    });
});
