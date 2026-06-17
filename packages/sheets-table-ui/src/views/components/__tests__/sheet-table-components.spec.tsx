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
import type { Root } from 'react-dom/client';
import { ICommandService, Inject, Injector, LocaleService, LocaleType, Plugin, toDisposable, Univer, UniverInstanceType } from '@univerjs/core';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { SheetInterceptorService } from '@univerjs/sheets';
import {
    SetSheetTableCommand,
    SetSheetTableFilterCommand,
    SetSheetTableFilterMutation,
    SetSheetTableMutation,
    SheetTableService,
    TABLE_FILTER_EMPTY_VALUE,
    TableColumnFilterTypeEnum,
    TableManager,
} from '@univerjs/sheets-table';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IDialogService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { SheetsTableComponentController } from '../../../controllers/sheet-table-component.controller';
import { SheetsTableUiService } from '../../../services/sheets-table-ui.service';
import { SheetTableFilterPanel } from '../SheetTableFilterPanel';
import { SheetTableRenameDialog } from '../SheetTableRenameDialog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestComponentController extends SheetsTableComponentController {
    closeCount = 0;

    override closeFilterPanel(): void {
        this.closeCount += 1;
        super.closeFilterPanel();
    }
}

class TestSheetCanvasPopManagerService {
    attachPopupToCell(): IDisposable {
        return toDisposable(() => {});
    }
}

class TestDialogService {
    open(): IDisposable {
        return toDisposable(() => {});
    }

    close(): void {
        // no-op
    }

    closeAll(): void {
        // no-op
    }

    getDialogs$() {
        throw new Error('Dialogs are not observed in this component test.');
    }
}

interface ITestBed {
    univer: Univer;
    injector: Injector;
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
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 'product' },
                        1: { v: 'amount' },
                    },
                    1: {
                        0: { v: 'book' },
                        1: { v: 12 },
                    },
                    2: {
                        0: { v: 'pen' },
                        1: { v: 3 },
                    },
                    3: {
                        1: { v: 8 },
                    },
                },
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
                [SheetsTableUiService],
                [SheetInterceptorService],
                [IDefinedNamesService, { useClass: DefinedNamesService }],
                [SheetCanvasPopManagerService, { useClass: TestSheetCanvasPopManagerService }],
                [IDialogService, { useClass: TestDialogService }],
                [SheetsTableComponentController, { useClass: TestComponentController }],
            ];
            dependencies.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);

    const localeService = injector.get(LocaleService);
    localeService.load({
        [LocaleType.EN_US]: {
            'sheets-table': {
                tableNameError: 'Invalid table name',
            },
            'sheets-table-ui': {
                cancel: 'Cancel',
                confirm: 'Confirm',
                renamePlaceholder: 'Enter table name',
                tableNameError: 'Invalid table name',
                condition: {
                    empty: '(Empty)',
                    string: 'Text',
                },
                string: {
                    compare: {
                        equal: 'Is equal to',
                    },
                },
                filter: {
                    'by-values': 'Filter by values',
                    'by-conditions': 'Filter by conditions',
                    cancel: 'Cancel',
                    'clear-filter': 'Clear filter',
                    confirm: 'Confirm',
                    'search-placeholder': 'Search',
                    'select-all': 'Select all',
                },
            },
        },
    });
    localeService.setLocale(LocaleType.EN_US);

    const commandService = injector.get(ICommandService);
    [SetSheetTableCommand, SetSheetTableMutation, SetSheetTableFilterCommand, SetSheetTableFilterMutation].forEach((command) => {
        commandService.registerCommand(command);
    });

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    const sheetTableService = injector.get(SheetTableService);
    sheetTableService.addTable(
        workbook.getUnitId(),
        'sheet1',
        'Orders',
        { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 },
        ['Product', 'Amount'],
        'table-orders'
    );
    sheetTableService.addTable(
        workbook.getUnitId(),
        'sheet1',
        'Archive',
        { startRow: 5, endRow: 7, startColumn: 0, endColumn: 1 },
        ['Product', 'Amount'],
        'table-archive'
    );

    return {
        univer,
        injector,
        workbook,
    };
}

function renderWithRediContext(testBed: ITestBed, element: React.ReactElement) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function changeInput(input: HTMLInputElement, value: string): void {
    act(() => {
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        valueSetter?.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

function clickElement(element: Element): void {
    act(() => {
        element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
}

function clickButtonByText(container: HTMLElement, text: string): void {
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent === text);
    if (!button) {
        throw new Error(`Button with text "${text}" was not found.`);
    }

    clickElement(button);
}

function clickCheckboxByText(container: HTMLElement, text: string): void {
    const label = Array.from(container.querySelectorAll('label')).find((item) => item.textContent?.includes(text));
    const input = label?.querySelector('input');
    if (!input) {
        throw new Error(`Checkbox with text "${text}" was not found.`);
    }

    act(() => {
        input.click();
    });
}

async function flushCommands(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
    });
}

describe('sheet table view components', () => {
    let testBed: ITestBed | undefined;
    let root: Root | undefined;
    let container: HTMLElement | undefined;
    let closeDisposable: IDisposable | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        closeDisposable?.dispose();
        container?.remove();
        testBed?.univer.dispose();
        root = undefined;
        container = undefined;
        closeDisposable = undefined;
        testBed = undefined;
    });

    it('renames a table through the table command when the user confirms a new name', async () => {
        testBed = createTestBed();
        let closeCount = 0;
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableRenameDialog
                unitId={testBed.workbook.getUnitId()}
                tableId="table-orders"
                onClose={() => {
                    closeCount += 1;
                }}
            />
        );
        root = rendered.root;
        container = rendered.container;

        changeInput(container.querySelector('input')!, '  Revenue2026  ');
        clickButtonByText(container, 'Confirm');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        expect(table.getDisplayName()).toBe('Revenue2026');
        expect(closeCount).toBe(1);
    });

    it('keeps an existing table name when the submitted name conflicts with another table', async () => {
        testBed = createTestBed();
        let closeCount = 0;
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableRenameDialog
                unitId={testBed.workbook.getUnitId()}
                tableId="table-orders"
                onClose={() => {
                    closeCount += 1;
                }}
            />
        );
        root = rendered.root;
        container = rendered.container;

        changeInput(container.querySelector('input')!, 'Archive');
        clickButtonByText(container, 'Confirm');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        expect(table.getDisplayName()).toBe('Orders');
        expect(container.textContent).toContain('Invalid table name');
        expect(closeCount).toBe(0);
    });

    it('applies a value filter from item checkbox changes', async () => {
        testBed = createTestBed();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        componentController.setCurrentTableFilterInfo({
            unitId: testBed.workbook.getUnitId(),
            subUnitId: 'sheet1',
            tableId: 'table-orders',
            row: 0,
            column: 0,
        });
        const rendered = renderWithRediContext(testBed, <SheetTableFilterPanel />);
        root = rendered.root;
        container = rendered.container;

        clickCheckboxByText(container, 'book');
        clickButtonByText(container, 'Confirm');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        expect(table.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['pen', TABLE_FILTER_EMPTY_VALUE],
        });
        expect(componentController.closeCount).toBe(1);
    });
});
