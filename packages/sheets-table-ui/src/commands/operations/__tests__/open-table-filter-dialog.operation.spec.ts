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

import type { Dependency, IDisposable, IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    Inject,
    Injector,
    LocaleService,
    LocaleType,
    Plugin,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SheetTableService, TableManager } from '@univerjs/sheets-table';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IDialogService } from '@univerjs/ui';
import { afterEach, describe, expect, it } from 'vitest';
import { SheetsTableComponentController } from '../../../controllers/sheet-table-component.controller';
import { OpenTableFilterPanelOperation } from '../open-table-filter-dialog.opration';

interface IAttachedPopup {
    row: number;
    column: number;
}

class TestSheetCanvasPopManagerService {
    readonly attachedPopups: IAttachedPopup[] = [];

    attachPopupToCell(row: number, column: number): IDisposable {
        this.attachedPopups.push({ row, column });
        return toDisposable(() => {
            this.attachedPopups.length = 0;
        });
    }
}

class TestDialogService {
    readonly closedIds: string[] = [];

    open(): IDisposable {
        return toDisposable(() => {});
    }

    close(id: string): void {
        this.closedIds.push(id);
    }

    closeAll(): void {
        this.closedIds.push('*');
    }

    getDialogs$() {
        throw new Error('Dialogs are not observed in this command test.');
    }
}

interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    workbook: Workbook;
}

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {},
            },
        },
        styles: {},
    };
}

function createTestBed(): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const dependencies: Dependency[] = [
                [TableManager],
                [SheetTableService],
                [SheetCanvasPopManagerService, { useClass: TestSheetCanvasPopManagerService }],
                [IDialogService, { useClass: TestDialogService }],
                [SheetsTableComponentController],
            ];
            dependencies.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-table': {
                columnPrefix: 'Column',
            },
        },
    });

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(OpenTableFilterPanelOperation);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(SheetTableService).addTable(
        workbook.getUnitId(),
        'sheet1',
        'Orders',
        { startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 },
        ['Name', 'Quantity', 'Owner'],
        'table-orders'
    );

    return {
        univer,
        get: injector.get.bind(injector),
        workbook,
    };
}

describe('OpenTableFilterPanelOperation', () => {
    let testBed: ITestBed | undefined;

    afterEach(() => {
        testBed?.univer.dispose();
        testBed = undefined;
    });

    it('does not open a panel when params or table are missing', async () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);

        await expect(commandService.executeCommand(OpenTableFilterPanelOperation.id)).resolves.toBe(false);
        await expect(commandService.executeCommand(OpenTableFilterPanelOperation.id, {
            unitId: testBed.workbook.getUnitId(),
            subUnitId: 'sheet1',
            tableId: 'missing',
            row: 1,
            col: 2,
        })).resolves.toBe(false);

        expect(testBed.get(SheetsTableComponentController).getCurrentTableFilterInfo()).toBeNull();
    });

    it('opens the filter panel for the requested table column', async () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);

        await expect(commandService.executeCommand(OpenTableFilterPanelOperation.id, {
            unitId: testBed.workbook.getUnitId(),
            subUnitId: 'sheet1',
            tableId: 'table-orders',
            row: 0,
            col: 2,
        })).resolves.toBe(true);

        expect(testBed.get(SheetsTableComponentController).getCurrentTableFilterInfo()).toEqual({
            unitId: testBed.workbook.getUnitId(),
            subUnitId: 'sheet1',
            tableId: 'table-orders',
            row: 0,
            column: 2,
        });
        expect((testBed.get(SheetCanvasPopManagerService) as unknown as TestSheetCanvasPopManagerService).attachedPopups).toEqual([{ row: 0, column: 2 }]);
    });
});
