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

import type { Dependency, IDisposable, IDocumentData, IWorkbookData, Workbook } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import {
    awaitTime,
    createIdentifier,
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DefinedNamesService, IDefinedNamesService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetInterceptorService, SheetsSelectionsService, WorkbookEditablePermission } from '@univerjs/sheets';
import {
    SetSheetTableCommand,
    SetSheetTableFilterCommand,
    SetSheetTableFilterMutation,
    SetSheetTableMutation,
    SheetTableService,
    TableColumnFilterTypeEnum,
    TableManager,
} from '@univerjs/sheets-table';
import { IMarkSelectionService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IDialogService, IPlatformService, IShortcutService, PlatformService, RediContext, ShortcutService } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { SheetsTableComponentController } from '../../../controllers/sheet-table-component.controller';
import enUS from '../../../locale/en-US';
import { SheetsTableUiService } from '../../../services/sheets-table-ui.service';
import { SheetTableFilterPanel } from '../SheetTableFilterPanel';
import { SheetTableRenameDialog } from '../SheetTableRenameDialog';
import { SheetTableSelector } from '../SheetTableSelector';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'test';
const SUB_UNIT_ID = 'sheet1';
const PRIMARY_TABLE_ID = 'table-1';
const SECOND_TABLE_ID = 'table-2';

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'table rename view test',
        sheetOrder: [SUB_UNIT_ID],
        styles: {},
        sheets: {
            [SUB_UNIT_ID]: {
                id: SUB_UNIT_ID,
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 'Name' },
                        1: { v: 'Amount' },
                        3: { v: 'Region' },
                        4: { v: 'Total' },
                    },
                    1: {
                        0: { v: 'East' },
                        1: { v: 120 },
                        3: { v: 'West' },
                        4: { v: 80 },
                    },
                },
            },
        },
    };
}

function setInputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

class TestDialogService {
    open() {
        // Dialog rendering is outside the filter panel behavior covered here.
    }

    close() {
        // Closing is reflected through SheetsTableComponentController state.
    }
}

class TestSheetCanvasPopManagerService {
    attachPopupToCell() {
        return {
            dispose() {
                // The mounted panel itself is rendered by the test.
            },
        };
    }
}

class TestMarkSelectionService {
    addShape() {
        return 'selection-shape';
    }

    removeShape() {
        // Selection highlighting is not the behavior covered here.
    }
}

class TestRenderManagerService {
    getRenderById() {
        return undefined;
    }
}

class TestDescriptionService {
}

class TestRangeEditor {
    readonly blur$ = new Subject<void>();
    readonly focus$ = new Subject<void>();
    readonly input$ = new Subject<void>();
    readonly selectionChange$ = new Subject<void>();

    private _data: IDocumentData;
    private readonly _change$ = new Subject<void>();
    private _isFocus = false;

    readonly render = {
        isDisposed: () => true,
    };

    constructor(private readonly _editorId: string, initialSnapshot: IDocumentData) {
        this._data = initialSnapshot;
    }

    getEditorId() {
        return this._editorId;
    }

    getDocumentData() {
        return this._data;
    }

    setDocumentData(data: IDocumentData) {
        this._data = data;
        this._change$.next();
    }

    getDocumentDataModel() {
        return {
            change$: this._change$.asObservable(),
            getPlainText: () => this._getPlainText(),
        };
    }

    setSelectionRanges() {
        this.selectionChange$.next();
    }

    getSelectionRanges() {
        return [];
    }

    replaceText(text: string) {
        this.setDocumentData({
            ...this._data,
            body: {
                ...this._data.body,
                dataStream: `${text}\r\n`,
            },
        });
    }

    focus() {
        this._isFocus = true;
        this.focus$.next();
    }

    blur() {
        this._isFocus = false;
        this.blur$.next();
    }

    isFocus() {
        return this._isFocus;
    }

    isSheetEditor() {
        return false;
    }

    getBoundingClientRect() {
        return { width: 0, height: 0 };
    }

    private _getPlainText() {
        return this._data.body?.dataStream.replace(/\r\n$/, '') ?? '';
    }
}

class TestEditorService {
    private readonly _editors = new Map<string, TestRangeEditor>();
    private _focusId: string | undefined;

    readonly blur$ = new Subject<void>();
    readonly focus$ = new Subject<{ unitId: string }>();

    register(config: { editorUnitId: string; initialSnapshot: IDocumentData }): IDisposable {
        this._editors.set(config.editorUnitId, new TestRangeEditor(config.editorUnitId, config.initialSnapshot));

        return toDisposable(() => {
            this._editors.delete(config.editorUnitId);
        });
    }

    getEditor(id?: string) {
        return id ? this._editors.get(id) : this.getFocusEditor();
    }

    getAllEditor() {
        return this._editors;
    }

    isEditor(editorUnitId: string) {
        return this._editors.has(editorUnitId);
    }

    getEditorRenderConfig() {
        return null;
    }

    isSheetEditor() {
        return false;
    }

    blur() {
        this._focusId = undefined;
        this.blur$.next();
    }

    focus(editorUnitId: string) {
        this._focusId = editorUnitId;
        this.focus$.next({ unitId: editorUnitId });
    }

    getFocusId() {
        return this._focusId;
    }

    getFocusEditor() {
        return this._focusId ? this._editors.get(this._focusId) : null;
    }
}

const IEditorService = createIdentifier<TestEditorService>('univer.editor.service');
const IDescriptionService = createIdentifier<TestDescriptionService>('formula.description-service');

function createTableRenameViewTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'sheets-table-ui-rename-view-test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) protected readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            ([
                [SheetsSelectionsService],
                [TableManager],
                [SheetInterceptorService],
                [SheetTableService],
                [SheetsTableUiService],
                [SheetsTableComponentController],
                [LexerTreeBuilder],
                [IEditorService, { useClass: TestEditorService as never }],
                [IDescriptionService, { useClass: TestDescriptionService }],
                [IRenderManagerService, { useClass: TestRenderManagerService as never }],
                [IPlatformService, { useClass: PlatformService }],
                [IShortcutService, { useClass: ShortcutService }],
                [IMarkSelectionService, { useClass: TestMarkSelectionService as never }],
                [IDefinedNamesService, { useClass: DefinedNamesService }],
                [IDialogService, { useClass: TestDialogService as never }],
                [SheetCanvasPopManagerService, { useClass: TestSheetCanvasPopManagerService as never }],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
        }
    }

    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            ...enUS,
            'sheets-formula-ui': {
                rangeSelector: {
                    buttonTooltip: 'Select range',
                    title: 'Select range',
                    cancel: 'Cancel',
                    confirm: 'Confirm',
                    placeHolder: 'Select range',
                    addAnotherRange: 'Add another range',
                },
            },
        },
    });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    univer.registerPlugin(TestPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    [SetSheetTableCommand, SetSheetTableMutation, SetSheetTableFilterCommand, SetSheetTableFilterMutation].forEach((command) => commandService.registerCommand(command));
    injector.get(IPermissionService).addPermissionPoint(new WorkbookEditablePermission(UNIT_ID));

    const tableManager = injector.get(TableManager);
    tableManager.addTable(
        UNIT_ID,
        SUB_UNIT_ID,
        'SalesTable',
        { startRow: 0, endRow: 4, startColumn: 0, endColumn: 1 },
        ['Name', 'Amount'],
        PRIMARY_TABLE_ID
    );
    tableManager.addTable(
        UNIT_ID,
        SUB_UNIT_ID,
        'ArchiveTable',
        { startRow: 0, endRow: 4, startColumn: 3, endColumn: 4 },
        ['Region', 'Total'],
        SECOND_TABLE_ID
    );

    return {
        univer,
        injector,
        workbook,
        tableManager,
        componentController: injector.get(SheetsTableComponentController),
    };
}

async function renderRenameDialog(root: Root, testBed: ReturnType<typeof createTableRenameViewTestBed>, onClose: () => void) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <SheetTableRenameDialog unitId={UNIT_ID} tableId={PRIMARY_TABLE_ID} onClose={onClose} />
            </RediContext.Provider>
        );
        await awaitTime(20);
    });
}

async function renderFilterPanel(root: Root, testBed: ReturnType<typeof createTableRenameViewTestBed>) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <SheetTableFilterPanel />
            </RediContext.Provider>
        );
        await awaitTime(20);
    });
}

async function renderSelector(root: Root, testBed: ReturnType<typeof createTableRenameViewTestBed>, confirmations: unknown[]) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <SheetTableSelector
                    unitId={UNIT_ID}
                    subUnitId={SUB_UNIT_ID}
                    tableId={PRIMARY_TABLE_ID}
                    range={{ startRow: 0, endRow: 4, startColumn: 0, endColumn: 1 }}
                    onConfirm={(info) => confirmations.push(info)}
                    onCancel={() => undefined}
                />
            </RediContext.Provider>
        );
        await awaitTime(20);
    });
}

function getButton(container: HTMLElement, text: string) {
    const button = Array.from(container.querySelectorAll('[data-u-comp="button"]'))
        .find((item) => item.textContent === text);
    expect(button).toBeTruthy();
    return button as HTMLElement;
}

describe('SheetTableRenameDialog', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createTableRenameViewTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('renames the selected table through the real table command', async () => {
        currentTestBed = createTableRenameViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let closeCount = 0;

        await renderRenameDialog(root, currentTestBed, () => {
            closeCount += 1;
        });

        const input = container.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('SalesTable');

        await act(async () => {
            setInputText(input, 'Revenue2026');
            await awaitTime(20);
        });

        await act(async () => {
            getButton(container!, 'Confirm').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(currentTestBed.tableManager.getTableById(UNIT_ID, PRIMARY_TABLE_ID)?.getDisplayName()).toBe('Revenue2026');
        expect(currentTestBed.tableManager.getTableById(UNIT_ID, SECOND_TABLE_ID)?.getDisplayName()).toBe('ArchiveTable');
        expect(closeCount).toBe(1);
    });

    it('keeps the dialog open and preserves table names when the next name already exists', async () => {
        currentTestBed = createTableRenameViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let closeCount = 0;

        await renderRenameDialog(root, currentTestBed, () => {
            closeCount += 1;
        });

        const input = container.querySelector('input') as HTMLInputElement;

        await act(async () => {
            setInputText(input, 'ArchiveTable');
            await awaitTime(20);
        });

        await act(async () => {
            getButton(container!, 'Confirm').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(currentTestBed.tableManager.getTableById(UNIT_ID, PRIMARY_TABLE_ID)?.getDisplayName()).toBe('SalesTable');
        expect(currentTestBed.tableManager.getTableById(UNIT_ID, SECOND_TABLE_ID)?.getDisplayName()).toBe('ArchiveTable');
        expect(container.textContent).toContain('Table name cannot contain spaces');
        expect(closeCount).toBe(0);
    });
});

describe('SheetTableFilterPanel', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createTableRenameViewTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('clears an existing table value filter through the real table filter command', async () => {
        currentTestBed = createTableRenameViewTestBed();
        currentTestBed.tableManager.addFilter(UNIT_ID, PRIMARY_TABLE_ID, 0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['East'],
        });
        currentTestBed.componentController.setCurrentTableFilterInfo({
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            tableId: PRIMARY_TABLE_ID,
            column: 0,
            row: 0,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderFilterPanel(root, currentTestBed);

        expect(currentTestBed.tableManager.getTableById(UNIT_ID, PRIMARY_TABLE_ID)?.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['East'],
        });

        await act(async () => {
            getButton(container!, 'Clear Filter').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(currentTestBed.tableManager.getTableById(UNIT_ID, PRIMARY_TABLE_ID)?.getTableFilterColumn(0)).toBeUndefined();
        expect(currentTestBed.componentController.getCurrentTableFilterInfo()).toBeNull();
    });

    it('applies a searched table value filter through the real table filter command', async () => {
        currentTestBed = createTableRenameViewTestBed();
        currentTestBed.componentController.setCurrentTableFilterInfo({
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            tableId: PRIMARY_TABLE_ID,
            column: 0,
            row: 0,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderFilterPanel(root, currentTestBed);

        const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;

        await act(async () => {
            setInputText(searchInput, 'East');
            await awaitTime(20);
        });

        const eastCheckbox = Array.from(container.querySelectorAll('[data-u-comp="checkbox"]'))
            .find((item) => item.textContent?.includes('East'))
            ?.querySelector('input') as HTMLInputElement;
        expect(eastCheckbox).toBeTruthy();

        await act(async () => {
            eastCheckbox.click();
            await awaitTime(20);
        });

        await act(async () => {
            getButton(container!, 'Confirm').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(currentTestBed.tableManager.getTableById(UNIT_ID, PRIMARY_TABLE_ID)?.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['East'],
        });
        expect(currentTestBed.componentController.getCurrentTableFilterInfo()).toBeNull();
    });
});

describe('SheetTableSelector', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createTableRenameViewTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('rejects an updated range that overlaps another table', async () => {
        currentTestBed = createTableRenameViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const confirmations: unknown[] = [];

        await renderSelector(root, currentTestBed, confirmations);

        const rangeButton = container.querySelector('svg') as SVGElement;
        expect(rangeButton).toBeTruthy();

        await act(async () => {
            rangeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        const dialogInput = Array.from(document.body.querySelectorAll('input[type="text"]')).at(-1) as HTMLInputElement;
        expect(dialogInput.value).toBe('A1:B5');

        await act(async () => {
            setInputText(dialogInput, 'D1:E5');
            await awaitTime(20);
        });

        const dialogConfirm = Array.from(document.body.querySelectorAll('[data-u-comp="button"]'))
            .filter((button) => button.textContent === 'Confirm')
            .at(-1) as HTMLElement;

        await act(async () => {
            dialogConfirm.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(container.textContent).toContain('Table range cannot overlap with other tables');

        await act(async () => {
            getButton(container!, 'Confirm').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(confirmations).toEqual([]);
    });
});
