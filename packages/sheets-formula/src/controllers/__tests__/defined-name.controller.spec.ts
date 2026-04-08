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

import type { Dependency, IWorkbookData } from '@univerjs/core';
import type { ITestBed } from '../../facade/__tests__/create-test-bed';
import { ICommandService, IUniverInstanceService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { FunctionType, IDefinedNamesService, RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { SCOPE_WORKBOOK_VALUE_DEFINED_NAME, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';

import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { DescriptionService, IDescriptionService } from '../../services/description.service';
import { DefinedNameController } from '../defined-name.controller';

function createWorkbookData(id = 'test'): IWorkbookData {
    return {
        id,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: id,
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
        },
        styles: {},
    };
}

function createControllerTestBed(): ITestBed {
    const dependencies: Dependency[] = [
        [IDescriptionService, { useClass: DescriptionService }],
        [DefinedNameController],
    ];

    return createFacadeTestBed(createWorkbookData(), dependencies);
}

describe('DefinedNameController', () => {
    let testBed: ITestBed;

    afterEach(() => {
        testBed?.univer.dispose();
    });

    it('should register descriptions by current sheet and refresh them when active sheet or unit changes', async () => {
        testBed = createControllerTestBed();

        const injector = testBed.injector;
        const commandService = injector.get(ICommandService);
        const descriptionService = injector.get(IDescriptionService);
        const definedNamesService = injector.get(IDefinedNamesService);
        const univerInstanceService = injector.get(IUniverInstanceService);

        commandService.registerCommand(SetWorksheetActiveOperation);
        injector.get(DefinedNameController);

        definedNamesService.registerDefinedNames('test', {
            workbook: {
                id: 'workbook',
                name: 'UNIT_SCOPE_NAME',
                formulaOrRefString: 'Sheet1!$A$1',
                localSheetId: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
            },
            localSheet1: {
                id: 'local-sheet1',
                name: 'LOCAL_SHEET1_NAME',
                formulaOrRefString: 'Sheet1!$B$2',
                localSheetId: 'sheet1',
            },
            localSheet2: {
                id: 'local-sheet2',
                name: 'LOCAL_SHEET2_NAME',
                formulaOrRefString: 'Sheet2!$C$3',
                localSheetId: 'sheet2',
            },
        });

        expect(descriptionService.hasDescription('UNIT_SCOPE_NAME')).toBe(true);
        expect(descriptionService.hasDescription('LOCAL_SHEET1_NAME')).toBe(true);
        expect(descriptionService.hasDescription('LOCAL_SHEET2_NAME')).toBe(false);

        await commandService.executeCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: 'sheet2' });

        expect(descriptionService.hasDescription('UNIT_SCOPE_NAME')).toBe(true);
        expect(descriptionService.hasDescription('LOCAL_SHEET1_NAME')).toBe(false);
        expect(descriptionService.hasDescription('LOCAL_SHEET2_NAME')).toBe(true);

        testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, createWorkbookData('secondary'));
        univerInstanceService.setCurrentUnitForType('test');
        definedNamesService.registerDefinedNames('secondary', {
            secondary: {
                id: 'secondary',
                name: 'SECONDARY_UNIT_NAME',
                formulaOrRefString: 'Sheet1!$D$4',
                localSheetId: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
            },
        });

        univerInstanceService.setCurrentUnitForType('secondary');

        expect(descriptionService.hasDescription('UNIT_SCOPE_NAME')).toBe(false);
        expect(descriptionService.hasDescription('LOCAL_SHEET2_NAME')).toBe(false);
        expect(descriptionService.hasDescription('SECONDARY_UNIT_NAME')).toBe(true);
    });

    it('should register mutation descriptions based on the provided sheet context and remove them on delete', async () => {
        testBed = createControllerTestBed();

        const injector = testBed.injector;
        const commandService = injector.get(ICommandService);
        const descriptionService = injector.get(IDescriptionService);

        commandService.registerCommand(SetDefinedNameMutation);
        commandService.registerCommand(RemoveDefinedNameMutation);
        injector.get(DefinedNameController);

        await commandService.executeCommand(SetDefinedNameMutation.id, {
            unitId: 'test',
            id: 'off-sheet',
            name: 'OFF_SHEET_NAME',
            formulaOrRefString: 'Sheet2!$A$1',
            localSheetId: 'sheet2',
        });

        expect(descriptionService.hasDescription('OFF_SHEET_NAME')).toBe(false);

        await commandService.executeCommand(SetDefinedNameMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet2',
            id: 'sheet2-name',
            name: 'SHEET2_MUTATION_NAME',
            formulaOrRefString: 'Sheet2!$C$4',
            localSheetId: 'sheet2',
        });

        expect(descriptionService.hasDescription('SHEET2_MUTATION_NAME')).toBe(true);

        await commandService.executeCommand(SetDefinedNameMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            id: 'active-sheet',
            name: 'ACTIVE_SHEET_NAME',
            formulaOrRefString: 'Sheet1!$B$2',
            comment: ' active comment',
            localSheetId: 'sheet1',
        });

        expect(descriptionService.getFunctionInfo('ACTIVE_SHEET_NAME')).toEqual({
            functionName: 'ACTIVE_SHEET_NAME',
            functionType: FunctionType.DefinedName,
            description: 'Sheet1!$B$2active comment',
            abstract: 'Sheet1!$B$2',
            functionParameter: [],
        });

        await commandService.executeCommand(RemoveDefinedNameMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            id: 'active-sheet',
            name: 'ACTIVE_SHEET_NAME',
            formulaOrRefString: 'Sheet1!$B$2',
            localSheetId: 'sheet1',
        });

        expect(descriptionService.hasDescription('ACTIVE_SHEET_NAME')).toBe(false);
    });
});
