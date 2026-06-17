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

import type { Dependency, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { IDialogPartMethodOptions } from '@univerjs/ui';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import {
    AddSheetTableCommand,
    AddSheetTableMutation,
    DeleteSheetTableMutation,
    SheetTableService,
    TableManager,
} from '@univerjs/sheets-table';
import { DesktopDialogService, IDialogService, IUIPartsService, UIPartsService } from '@univerjs/ui';
import { afterEach, describe, expect, it } from 'vitest';
import { openRangeSelector, OpenTableSelectorOperation } from '../open-table-selector.operation';

interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    workbook?: Workbook;
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
                },
            },
        },
        styles: {},
    };
}

function createTestBed(createWorkbook = true): ITestBed {
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
                [SheetsSelectionsService],
                [TableManager],
                [SheetTableService],
                [IDefinedNamesService, { useClass: DefinedNamesService }],
                [IUIPartsService, { useClass: UIPartsService }],
                [IDialogService, { useClass: DesktopDialogService }],
            ];
            dependencies.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);

    const localeService = injector.get(LocaleService);
    localeService.load({
        [LocaleType.EN_US]: {
            'sheets-table': {
                columnPrefix: 'Column',
                tablePrefix: 'Table',
            },
            'sheets-table-ui': {
                selectRange: 'Select Table Range',
            },
        },
    });
    localeService.setLocale(LocaleType.EN_US);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    [
        OpenTableSelectorOperation,
        AddSheetTableCommand,
        AddSheetTableMutation,
        DeleteSheetTableMutation,
        SetSelectionsOperation,
    ].forEach((command) => commandService.registerCommand(command));

    const workbook = createWorkbook
        ? univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData())
        : undefined;
    if (workbook) {
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    }

    return {
        univer,
        get: injector.get.bind(injector),
        workbook,
    };
}

function getOpenedDialog(dialogService: IDialogService): IDialogPartMethodOptions {
    return (dialogService as unknown as { _dialogOptions: IDialogPartMethodOptions[] })._dialogOptions.at(-1)!;
}

function getSelectorDialogProps(dialogService: IDialogService) {
    const label = getOpenedDialog(dialogService).children!.label;
    if (typeof label === 'string' || !label) {
        throw new Error('The table selector dialog should expose component props.');
    }
    return label.props as {
        range: IRange;
        onConfirm: (info: { unitId: string; subUnitId: string; range: IRange }) => void;
        onCancel: () => void;
    };
}

describe('OpenTableSelectorOperation', () => {
    let testBed: ITestBed | undefined;

    afterEach(() => {
        testBed?.univer.dispose();
        testBed = undefined;
    });

    it('resolves a confirmed table range from the selector dialog', async () => {
        testBed = createTestBed();
        const dialogService = testBed.get(IDialogService);

        const selection = openRangeSelector(
            testBed.get(Injector),
            'test',
            'sheet1',
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }
        );
        getSelectorDialogProps(dialogService).onConfirm({
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
        });

        await expect(selection).resolves.toEqual({
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
        });
        expect(getOpenedDialog(dialogService).open).toBe(false);
    });

    it('returns false when no workbook can receive a table', async () => {
        testBed = createTestBed(false);

        await expect(testBed.get(ICommandService).executeCommand(OpenTableSelectorOperation.id)).resolves.toBe(false);
    });

    it('adds a table from an expanded single-cell selection', async () => {
        testBed = createTestBed();
        const workbook = testBed.workbook!;
        const selectionService = testBed.get(SheetsSelectionsService);
        const commandService = testBed.get(ICommandService);
        const dialogService = testBed.get(IDialogService);

        selectionService.setSelections(workbook.getUnitId(), 'sheet1', [{
            range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 },
            primary: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0, actualRow: 1, actualColumn: 0, isMerged: false, isMergedMainCell: false },
        }]);

        const result = commandService.executeCommand(OpenTableSelectorOperation.id);
        const selectorProps = getSelectorDialogProps(dialogService);
        expect(selectorProps.range).toEqual({ startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 });
        selectorProps.onConfirm({
            unitId: workbook.getUnitId(),
            subUnitId: 'sheet1',
            range: selectorProps.range,
        });

        await expect(result).resolves.toBe(true);
        expect(testBed.get(TableManager).getTableList(workbook.getUnitId())[0]).toMatchObject({
            unitId: workbook.getUnitId(),
            subUnitId: 'sheet1',
            name: 'Table1',
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
        });
    });

    it('keeps the workbook unchanged when the selector is cancelled', async () => {
        testBed = createTestBed();
        const workbook = testBed.workbook!;
        const selectionService = testBed.get(SheetsSelectionsService);
        const commandService = testBed.get(ICommandService);
        const dialogService = testBed.get(IDialogService);

        selectionService.setSelections(workbook.getUnitId(), 'sheet1', [{
            range: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 1 },
            primary: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0, actualRow: 1, actualColumn: 0, isMerged: false, isMergedMainCell: false },
        }]);

        const result = commandService.executeCommand(OpenTableSelectorOperation.id);
        getSelectorDialogProps(dialogService).onCancel();

        await expect(result).resolves.toBe(false);
        expect(testBed.get(TableManager).getTableList(workbook.getUnitId())).toEqual([]);
    });
});
