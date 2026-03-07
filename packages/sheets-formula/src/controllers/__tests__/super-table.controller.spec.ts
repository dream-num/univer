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
import type { ISuperTable } from '@univerjs/engine-formula';
import type { ITestBed } from '../../facade/__tests__/create-test-bed';
import { ICommandService, IUniverInstanceService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { FunctionType, ISuperTableService, RemoveSuperTableMutation, serializeRangeWithSheet, SetSuperTableMutation, SuperTableService } from '@univerjs/engine-formula';
import { afterEach, describe, expect, it } from 'vitest';

import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { DescriptionService, IDescriptionService } from '../../services/description.service';
import { SuperTableController } from '../super-table.controller';

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

function createSuperTableReference(sheetId: string): ISuperTable {
    return {
        sheetId,
        titleMap: new Map(),
        range: {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        },
    };
}

function createControllerTestBed(): ITestBed {
    const dependencies: Dependency[] = [
        [IDescriptionService, { useClass: DescriptionService }],
        [ISuperTableService, { useClass: SuperTableService }],
        [SuperTableController],
    ];

    return createFacadeTestBed(createWorkbookData(), dependencies);
}

describe('SuperTableController', () => {
    let testBed: ITestBed;

    afterEach(() => {
        testBed?.univer.dispose();
    });

    it('should register table descriptions and refresh them when current unit changes', () => {
        testBed = createControllerTestBed();

        const injector = testBed.injector;
        const descriptionService = injector.get(IDescriptionService);
        const superTableService = injector.get(ISuperTableService);
        const univerInstanceService = injector.get(IUniverInstanceService);

        injector.get(SuperTableController);

        superTableService.registerTable('test', 'TABLE_ONE', createSuperTableReference('sheet1'));
        superTableService.registerTable('test', 'TABLE_TWO', createSuperTableReference('sheet2'));

        expect(descriptionService.getFunctionInfo('TABLE_ONE')).toEqual({
            functionName: 'TABLE_ONE',
            functionType: FunctionType.Table,
            description: serializeRangeWithSheet('Sheet1', createSuperTableReference('sheet1').range),
            abstract: serializeRangeWithSheet('Sheet1', createSuperTableReference('sheet1').range),
            functionParameter: [],
        });
        expect(descriptionService.hasDescription('TABLE_TWO')).toBe(true);

        testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, createWorkbookData('secondary'));
        univerInstanceService.setCurrentUnitForType('test');
        superTableService.registerTable('secondary', 'TABLE_THREE', createSuperTableReference('sheet1'));

        univerInstanceService.setCurrentUnitForType('secondary');

        expect(descriptionService.hasDescription('TABLE_ONE')).toBe(false);
        expect(descriptionService.hasDescription('TABLE_TWO')).toBe(false);
        expect(descriptionService.hasDescription('TABLE_THREE')).toBe(true);
    });

    it('should register and remove table descriptions through mutations', async () => {
        testBed = createControllerTestBed();

        const injector = testBed.injector;
        const commandService = injector.get(ICommandService);
        const descriptionService = injector.get(IDescriptionService);
        const reference = createSuperTableReference('sheet2');
        const expectedRef = serializeRangeWithSheet('Sheet2', reference.range);

        commandService.registerCommand(SetSuperTableMutation);
        commandService.registerCommand(RemoveSuperTableMutation);
        injector.get(SuperTableController);

        await commandService.executeCommand(SetSuperTableMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet2',
            tableName: 'TABLE_MUTATION',
            reference,
        });

        expect(descriptionService.getFunctionInfo('TABLE_MUTATION')).toEqual({
            functionName: 'TABLE_MUTATION',
            functionType: FunctionType.Table,
            description: expectedRef,
            abstract: expectedRef,
            functionParameter: [],
        });

        await commandService.executeCommand(RemoveSuperTableMutation.id, {
            unitId: 'test',
            tableName: 'TABLE_MUTATION',
        });

        expect(descriptionService.hasDescription('TABLE_MUTATION')).toBe(false);
    });
});
