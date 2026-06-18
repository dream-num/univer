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
import type { IConditionInfo } from '../type';
import {
    createIdentifier,
    ICommandService,
    Inject,
    Injector,
    IPermissionService,
    LocaleService,
    LocaleType,
    Plugin,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DefinedNamesService, FormulaDataModel, IDefinedNamesService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    AddRangeThemeMutation,
    RemoveRangeThemeMutation,
    ReorderRangeCommand,
    ReorderRangeMutation,
    SetRangeThemeMutation,
    SheetInterceptorService,
    SheetRangeThemeModel,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookEditablePermission,
} from '@univerjs/sheets';
import { SheetsSortController, SheetsSortService } from '@univerjs/sheets-sort';
import {
    AddTableThemeCommand,
    RemoveTableThemeCommand,
    SetSheetTableCommand,
    SetSheetTableFilterCommand,
    SetSheetTableFilterMutation,
    SetSheetTableMutation,
    SheetsTableSortStateEnum,
    SheetTableInsertColumnAtCommand,
    SheetTableRemoveColumnAtCommand,
    SheetTableService,
    TABLE_FILTER_EMPTY_VALUE,
    TableColumnFilterTypeEnum,
    TableConditionTypeEnum,
    TableManager,
    TableNumberCompareTypeEnum,
    TableStringCompareTypeEnum,
} from '@univerjs/sheets-table';
import { IMarkSelectionService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IDialogService, IShortcutService, RediContext } from '@univerjs/ui';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetsTableComponentController } from '../../../controllers/sheet-table-component.controller';
import { SheetTableThemeUIController } from '../../../controllers/sheet-table-theme-ui.controller';
import { SheetsTableUiService } from '../../../services/sheets-table-ui.service';
import { SheetTableConditionPanel } from '../SheetTableConditionPanel';
import { SheetTableFilterPanel } from '../SheetTableFilterPanel';
import { SheetTableRenameDialog } from '../SheetTableRenameDialog';
import { SheetTableSelector } from '../SheetTableSelector';
import { SheetTableThemePanel } from '../SheetTableThemePanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const IEditorService = createIdentifier<TestEditorService>('univer.editor.service');
const IDescriptionService = createIdentifier<TestDescriptionService>('formula.description-service');

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

class TestRenderManagerService {
    getRenderById(): undefined {
        return undefined;
    }
}

class TestMarkSelectionService {
    addShape(): string | null {
        return 'selection-shape';
    }

    removeShape(): void {
        // no-op
    }
}

class TestEditorModel {
    private _data: IDocumentData;
    readonly change$ = new Subject<void>();

    constructor(data: IDocumentData) {
        this._data = data;
    }

    getPlainText(): string {
        return this._data.body?.dataStream?.replace(/\r?\n$/, '') ?? '';
    }

    getDocumentData(): IDocumentData {
        return this._data;
    }

    setDocumentData(data: IDocumentData): void {
        this._data = data;
        this.change$.next();
    }
}

class TestDocSkeletonDataModel {
    updateDocumentDataPageSize(): void {
        // no-op
    }
}

class TestDocSkeletonViewModel {
    private readonly _dataModel = new TestDocSkeletonDataModel();

    getDataModel(): TestDocSkeletonDataModel {
        return this._dataModel;
    }
}

class TestDocSkeletonManagerService {
    private readonly _viewModel = new TestDocSkeletonViewModel();

    getViewModel(): TestDocSkeletonViewModel {
        return this._viewModel;
    }

    getSkeleton() {
        return {
            getActualSize: () => ({
                actualWidth: 160,
                actualHeight: 32,
            }),
        };
    }
}

class TestEditorRender {
    private _disposed = false;
    private readonly _docSkeletonManagerService = new TestDocSkeletonManagerService();
    readonly components = new Map<string, { translate: (x: number, y: number) => void }>();
    readonly scene = {
        transformByState: () => {
            // no-op
        },
        getViewport: () => undefined,
    };

    readonly mainComponent = {
        resize: () => {
            // no-op
        },
        translate: () => {
            // no-op
        },
    };

    with(): TestDocSkeletonManagerService {
        return this._docSkeletonManagerService;
    }

    isDisposed(): boolean {
        return this._disposed;
    }

    dispose(): void {
        this._disposed = true;
    }
}

class TestEditor {
    readonly change$ = new Subject<void>();
    readonly input$ = new Subject<void>();
    readonly paste$ = new Subject<void>();
    readonly blur$ = new Subject<void>();
    readonly focus$ = new Subject<void>();
    readonly selectionChange$ = new Subject<void>();
    readonly render = new TestEditorRender();
    private readonly _model: TestEditorModel;

    constructor(
        private readonly _editorId: string,
        data: IDocumentData
    ) {
        this._model = new TestEditorModel(data);
    }

    getEditorId(): string {
        return this._editorId;
    }

    getDocumentData(): IDocumentData {
        return this._model.getDocumentData();
    }

    setDocumentData(data: IDocumentData): void {
        this._model.setDocumentData(data);
    }

    getDocumentDataModel(): TestEditorModel {
        return this._model;
    }

    replaceText(text: string): void {
        this._model.setDocumentData({
            ...this.getDocumentData(),
            body: {
                ...this.getDocumentData().body,
                dataStream: text,
            },
        });
    }

    setSelectionRanges(): void {
        // no-op
    }

    getSelectionRanges(): [] {
        return [];
    }

    getBoundingClientRect() {
        return {
            width: 160,
            height: 32,
        };
    }

    blur(): void {
        this.blur$.next();
    }

    focus(): void {
        this.focus$.next();
    }

    dispose(): void {
        this.render.dispose();
        this.change$.complete();
        this.input$.complete();
        this.paste$.complete();
        this.blur$.complete();
        this.focus$.complete();
        this.selectionChange$.complete();
    }
}

class TestEditorService {
    private readonly _editors = new Map<string, TestEditor>();
    private _focusId: string | undefined;
    readonly blur$ = new Subject<void>();
    readonly focus$ = new Subject<void>();

    register(config: { editorUnitId?: string; initialSnapshot: IDocumentData }): IDisposable {
        const editorId = config.editorUnitId ?? config.initialSnapshot.id!;
        const editor = new TestEditor(editorId, config.initialSnapshot);
        this._editors.set(editorId, editor);

        return toDisposable(() => {
            editor.dispose();
            this._editors.delete(editorId);
        });
    }

    getEditor(id?: string): TestEditor | undefined {
        return id ? this._editors.get(id) : undefined;
    }

    getAllEditor(): Map<string, TestEditor> {
        return this._editors;
    }

    isEditor(editorUnitId: string): boolean {
        return this._editors.has(editorUnitId);
    }

    getEditorRenderConfig(): undefined {
        return undefined;
    }

    isSheetEditor(): boolean {
        return false;
    }

    blur(): void {
        this._focusId = undefined;
        this.blur$.next();
    }

    focus(editorUnitId: string): void {
        this._focusId = editorUnitId;
        this.focus$.next();
    }

    getFocusId(): string | undefined {
        return this._focusId;
    }

    getFocusEditor(): TestEditor | undefined {
        return this._focusId ? this._editors.get(this._focusId) : undefined;
    }
}

class TestShortcutService {
    registerShortcut(): IDisposable {
        return toDisposable(() => {});
    }
}

class TestDescriptionService {
    getDescriptions(): Map<string, unknown> {
        return new Map();
    }

    hasFunction(): boolean {
        return false;
    }

    getFunctionInfo(): undefined {
        return undefined;
    }

    getSearchListByName(): unknown[] {
        return [];
    }

    getSearchListByNameFirstLetter(): unknown[] {
        return [];
    }

    getSearchListByType(): unknown[] {
        return [];
    }

    registerDescriptions(): IDisposable {
        return toDisposable(() => {});
    }

    unregisterDescriptions(): void {
        // no-op
    }

    hasDescription(): boolean {
        return false;
    }

    hasDefinedNameDescription(): boolean {
        return false;
    }

    isFormulaDefinedName(): boolean {
        return false;
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
                [SheetsSortService, { useClass: SheetsSortService }],
                [SheetsSortController, { useClass: SheetsSortController }],
                [FormulaDataModel, { useClass: FormulaDataModel }],
                [SheetRangeThemeModel],
                [SheetTableThemeUIController],
                [SheetInterceptorService],
                [SheetSkeletonService, { useClass: SheetSkeletonService }],
                [SheetsSelectionsService],
                [IRenderManagerService, { useClass: TestRenderManagerService }],
                [IEditorService, { useClass: TestEditorService as never }],
                [IMarkSelectionService, { useClass: TestMarkSelectionService as never }],
                [IShortcutService, { useClass: TestShortcutService as never }],
                [IDescriptionService, { useClass: TestDescriptionService }],
                [LexerTreeBuilder],
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
                customStyle: 'Custom style',
                defaultStyle: 'Default style',
                customTooMore: 'Custom styles limit reached',
                header: 'Header',
                firstLine: 'First line',
                secondLine: 'Second line',
                footer: 'Footer',
                renamePlaceholder: 'Enter table name',
                tableNameError: 'Invalid table name',
                columnMenu: {
                    'insert-left': 'Insert 1 table column left',
                    'insert-right': 'Insert 1 table column right',
                    delete: 'Delete table column',
                },
                sort: {
                    'sort-asc': 'Ascending',
                    'sort-desc': 'Descending',
                },
                tableRangeWithOtherTableError: 'Table range cannot overlap with other tables',
                tableRangeSingleRowError: 'Table range cannot be a single row',
                updateError: 'Cannot set table range to an area that does not overlap with the original and is not in the same row',
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
            'sheets-formula-ui': {
                rangeSelector: {
                    title: 'Select a data range',
                    addAnotherRange: 'Add range',
                    buttonTooltip: 'Select data range',
                    cancel: 'Cancel',
                    confirm: 'Confirm',
                    placeHolder: 'Select range or enter.',
                },
            },
        },
    });
    localeService.setLocale(LocaleType.EN_US);

    const commandService = injector.get(ICommandService);
    [
        SetSheetTableCommand,
        SetSheetTableMutation,
        SetSheetTableFilterCommand,
        SetSheetTableFilterMutation,
        ReorderRangeCommand,
        ReorderRangeMutation,
        AddRangeThemeMutation,
        RemoveRangeThemeMutation,
        SetRangeThemeMutation,
        AddTableThemeCommand,
        RemoveTableThemeCommand,
        SheetTableInsertColumnAtCommand,
        SheetTableRemoveColumnAtCommand,
    ].forEach((command) => {
        commandService.registerCommand(command);
    });

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    const permissionService = injector.get(IPermissionService);
    permissionService.addPermissionPoint(new WorkbookEditablePermission(workbook.getUnitId()));
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
    injector.get(SheetsSortController);

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
        if (!input.getAttribute('type')) {
            input.setAttribute('type', 'text');
        }
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        valueSetter?.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

function clickElement(element: Element): void {
    act(() => {
        element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
}

function clickButtonByText(container: HTMLElement, text: string): void {
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent === text);
    if (!button) {
        throw new Error(`Button with text "${text}" was not found.`);
    }

    clickElement(button);
}

function getButtonByText(scope: ParentNode, text: string): HTMLButtonElement {
    const button = Array.from(scope.querySelectorAll('button')).reverse().find((item) => item.textContent === text);
    if (!button) {
        throw new Error(`Button with text "${text}" was not found.`);
    }

    return button;
}

async function selectRangeThroughDialog(container: HTMLElement, rangeText: string): Promise<void> {
    const selectorIcon = container.querySelector('svg');
    if (!selectorIcon) {
        throw new Error('Range selector icon was not found.');
    }

    clickElement(selectorIcon);
    await flushCommands();

    const dialogInput = Array.from(document.body.querySelectorAll('input')).at(-1) as HTMLInputElement | undefined;
    if (!dialogInput) {
        throw new Error('Range selector dialog input was not found.');
    }

    changeInput(dialogInput, rangeText);
    clickElement(getButtonByText(document.body, 'Confirm'));
    await flushCommands();
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

function clickCustomThemeAddControl(container: HTMLElement): void {
    const addControl = Array.from(container.querySelectorAll('div')).find((item) => {
        return item.textContent?.trim() === '+' && item.className.includes('univer-leading-10');
    });
    if (!addControl) {
        throw new Error('Custom theme add control was not found.');
    }

    clickElement(addControl);
}

function clickCustomThemeRemoveControl(container: HTMLElement): void {
    const removeControl = Array.from(container.querySelectorAll('div')).find((item) => {
        return item.textContent?.trim() === 'x' && item.className.includes('univer-absolute');
    });
    if (!removeControl) {
        throw new Error('Custom theme remove control was not found.');
    }

    clickElement(removeControl);
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
        vi.useRealTimers();
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

    it('rejects an empty table name without closing the rename dialog', async () => {
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

        changeInput(container.querySelector('input')!, '   ');
        clickButtonByText(container, 'Confirm');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        expect(table.getDisplayName()).toBe('Orders');
        expect(container.textContent).toContain('Invalid table name');
        expect(closeCount).toBe(0);
    });

    it('does not confirm a selected range that overlaps another table', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const confirmed: unknown[] = [];
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableSelector
                unitId={unitId}
                subUnitId="sheet1"
                range={{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }}
                onConfirm={(info) => {
                    confirmed.push(info);
                }}
                onCancel={() => {}}
            />
        );
        root = rendered.root;
        container = rendered.container;

        await selectRangeThroughDialog(container, 'A6:B8');
        clickButtonByText(container, 'Confirm');
        await flushCommands();

        expect(container.textContent).toContain('Table range cannot overlap with other tables');
        expect(confirmed).toHaveLength(0);
    });

    it('does not confirm a table range that only contains the header row', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const confirmed: unknown[] = [];
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableSelector
                unitId={unitId}
                subUnitId="sheet1"
                range={{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }}
                onConfirm={(info) => {
                    confirmed.push(info);
                }}
                onCancel={() => {}}
            />
        );
        root = rendered.root;
        container = rendered.container;

        await selectRangeThroughDialog(container, 'A10:B10');
        clickButtonByText(container, 'Confirm');
        await flushCommands();

        expect(container.textContent).toContain('Table range cannot be a single row');
        expect(confirmed).toHaveLength(0);
    });

    it('keeps the range selector editor stable when its delayed resize runs', async () => {
        vi.useFakeTimers();
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableSelector
                unitId={unitId}
                subUnitId="sheet1"
                range={{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }}
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            vi.advanceTimersByTime(500);
            await Promise.resolve();
        });

        expect(container.querySelector('svg')).not.toBeNull();
    });

    it('cancels table range selection without submitting a range update', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const confirmed: unknown[] = [];
        let cancelCount = 0;
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableSelector
                unitId={unitId}
                subUnitId="sheet1"
                tableId="table-orders"
                range={{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }}
                onConfirm={(info) => {
                    confirmed.push(info);
                }}
                onCancel={() => {
                    cancelCount += 1;
                }}
            />
        );
        root = rendered.root;
        container = rendered.container;

        clickButtonByText(container, 'Cancel');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(unitId, 'table-orders')!;
        expect(confirmed).toEqual([]);
        expect(cancelCount).toBe(1);
        expect(table.getRange()).toEqual({
            startRow: 0,
            endRow: 3,
            startColumn: 0,
            endColumn: 1,
        });
    });

    it('confirms a same-header-row range update for the existing table', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const confirmed: unknown[] = [];
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableSelector
                unitId={unitId}
                subUnitId="sheet1"
                tableId="table-orders"
                range={{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }}
                onConfirm={(info) => {
                    confirmed.push(info);
                }}
                onCancel={() => {}}
            />
        );
        root = rendered.root;
        container = rendered.container;

        await selectRangeThroughDialog(container, 'A1:B5');

        expect(confirmed).toEqual([{
            unitId,
            subUnitId: 'sheet1',
            range: expect.objectContaining({
                startRow: 0,
                endRow: 4,
                startColumn: 0,
                endColumn: 1,
            }),
        }]);
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

    it('leaves an unfiltered column unchanged when all values remain selected', async () => {
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

        clickButtonByText(container, 'Confirm');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        expect(table.getTableFilterColumn(0)).toBeUndefined();
        expect(componentController.closeCount).toBe(1);
    });

    it('keeps the existing value filter when item changes are cancelled', async () => {
        testBed = createTestBed();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        table.setTableFilterColumn(0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
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

        clickCheckboxByText(container, 'pen');
        clickButtonByText(container, 'Cancel');
        await flushCommands();

        expect(table.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
        expect(componentController.closeCount).toBe(1);
    });

    it('applies a value filter from the currently searched items only', async () => {
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

        const searchInput = container.querySelector('input') as HTMLInputElement | null;
        if (!searchInput) {
            throw new Error('Filter search input was not found.');
        }
        changeInput(searchInput, 'bo');
        clickCheckboxByText(container, 'Select all');
        clickButtonByText(container, 'Confirm');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        expect(table.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
        expect(componentController.closeCount).toBe(1);
    });

    it('shows the checked item count from an existing manual filter', async () => {
        testBed = createTestBed();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        table.setTableFilterColumn(0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
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

        const selectAllLabel = Array.from(container.querySelectorAll('label'))
            .find((item) => item.textContent?.includes('Select all'));

        expect(selectAllLabel?.textContent).toContain('(1/3)');
    });

    it('closes without changing the filter when confirmed value selections are unchanged', async () => {
        testBed = createTestBed();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        table.setTableFilterColumn(0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
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

        clickButtonByText(container, 'Confirm');
        await flushCommands();

        expect(table.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
        expect(componentController.closeCount).toBe(1);
    });

    it('clears an existing table filter through the filter panel clear action', async () => {
        testBed = createTestBed();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        table.setTableFilterColumn(0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
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

        clickButtonByText(container, 'Clear filter');
        await flushCommands();

        expect(table.getTableFilterColumn(0)).toBeUndefined();
        expect(componentController.closeCount).toBe(1);
    });

    it('does not delete or close from the filter panel when the table has only one column', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        const sheetTableService = testBed.injector.get(SheetTableService);
        sheetTableService.addTable(
            unitId,
            'sheet1',
            'SingleColumnTable',
            { startRow: 0, endRow: 3, startColumn: 3, endColumn: 3 },
            ['Only'],
            'table-single-column'
        );
        componentController.setCurrentTableFilterInfo({
            unitId,
            subUnitId: 'sheet1',
            tableId: 'table-single-column',
            row: 0,
            column: 3,
        });
        const rendered = renderWithRediContext(testBed, <SheetTableFilterPanel />);
        root = rendered.root;
        container = rendered.container;

        const deleteButton = getButtonByText(container, 'Delete table column');
        clickElement(deleteButton);
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(unitId, 'table-single-column')!;
        expect(deleteButton.disabled).toBe(true);
        expect(table.getRange()).toEqual({
            startRow: 0,
            endRow: 3,
            startColumn: 3,
            endColumn: 3,
        });
        expect(componentController.closeCount).toBe(0);
    });

    it('inserts a table column to the right from the filter panel column menu', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        componentController.setCurrentTableFilterInfo({
            unitId,
            subUnitId: 'sheet1',
            tableId: 'table-orders',
            row: 0,
            column: 1,
        });
        const rendered = renderWithRediContext(testBed, <SheetTableFilterPanel />);
        root = rendered.root;
        container = rendered.container;

        clickButtonByText(container, 'Insert 1 table column right');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(unitId, 'table-orders')!;
        expect(table.getRange()).toEqual({
            startRow: 0,
            endRow: 3,
            startColumn: 0,
            endColumn: 2,
        });
        expect(componentController.closeCount).toBe(1);
    });

    it('deletes the current table column from the filter panel column menu', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        componentController.setCurrentTableFilterInfo({
            unitId,
            subUnitId: 'sheet1',
            tableId: 'table-orders',
            row: 0,
            column: 1,
        });
        const rendered = renderWithRediContext(testBed, <SheetTableFilterPanel />);
        root = rendered.root;
        container = rendered.container;

        clickButtonByText(container, 'Delete table column');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(unitId, 'table-orders')!;
        expect(table.getRange()).toEqual({
            startRow: 0,
            endRow: 3,
            startColumn: 0,
            endColumn: 0,
        });
        expect(table.getTableInfo().columns.map((column) => column.displayName)).toEqual(['Product']);
        expect(componentController.closeCount).toBe(1);
    });

    it('sorts the table body descending from the filter panel sort action', async () => {
        testBed = createTestBed();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        const unitId = testBed.workbook.getUnitId();
        const worksheet = testBed.workbook.getSheetBySheetId('sheet1')!;
        componentController.setCurrentTableFilterInfo({
            unitId,
            subUnitId: 'sheet1',
            tableId: 'table-orders',
            row: 0,
            column: 0,
        });
        const rendered = renderWithRediContext(testBed, <SheetTableFilterPanel />);
        root = rendered.root;
        container = rendered.container;

        clickButtonByText(container, 'Descending');
        await flushCommands();

        const table = testBed.injector.get(TableManager).getTable(unitId, 'table-orders')!;
        expect(worksheet.getCellRaw(1, 0)?.v).toBe('pen');
        expect(worksheet.getCellRaw(2, 0)?.v).toBe('book');
        expect(worksheet.getCellRaw(3, 0)?.v).toBe(undefined);
        expect(table.getTableFilters().getSortState()).toEqual({
            columnIndex: 0,
            sortState: SheetsTableSortStateEnum.Desc,
        });
        expect(componentController.closeCount).toBe(1);
    });

    it('applies a condition filter from the condition tab input', async () => {
        testBed = createTestBed();
        const componentController = testBed.injector.get(SheetsTableComponentController) as TestComponentController;
        const table = testBed.injector.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        table.setTableFilterColumn(0, {
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.String,
                compareType: TableStringCompareTypeEnum.Equal,
                expectedValue: 'pen',
            },
        });
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

        const conditionInput = container.querySelector('input') as HTMLInputElement | null;
        if (!conditionInput) {
            throw new Error('Condition input was not found.');
        }
        changeInput(conditionInput, 'book');
        clickButtonByText(container, 'Confirm');
        await flushCommands();

        expect(table.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.String,
                compareType: TableStringCompareTypeEnum.Equal,
                expectedValue: 'book',
            },
        });
        expect(componentController.closeCount).toBe(1);
    });

    it('keeps the opposite numeric bound when editing a between condition endpoint', () => {
        testBed = createTestBed();
        let currentConditionInfo: IConditionInfo | undefined;

        function ConditionPanelHarness() {
            const [conditionInfo, setConditionInfo] = useState<IConditionInfo>({
                type: TableConditionTypeEnum.Number,
                compare: TableNumberCompareTypeEnum.Between,
                info: { numberRange: [10, 20] },
            });
            currentConditionInfo = conditionInfo;

            return (
                <SheetTableConditionPanel
                    unitId={testBed!.workbook.getUnitId()}
                    subUnitId="sheet1"
                    tableFilter={undefined}
                    tableId="table-orders"
                    columnIndex={1}
                    conditionInfo={conditionInfo}
                    onChange={setConditionInfo}
                />
            );
        }

        const rendered = renderWithRediContext(testBed, <ConditionPanelHarness />);
        root = rendered.root;
        container = rendered.container;
        const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[];
        if (inputs.length !== 2) {
            throw new Error('The numeric range condition should render two endpoint inputs.');
        }

        changeInput(inputs[0], '12');
        expect(currentConditionInfo).toEqual({
            type: TableConditionTypeEnum.Number,
            compare: TableNumberCompareTypeEnum.Between,
            info: { numberRange: [12, 20] },
        });

        changeInput(inputs[1], '24');
        expect(currentConditionInfo).toEqual({
            type: TableConditionTypeEnum.Number,
            compare: TableNumberCompareTypeEnum.Between,
            info: { numberRange: [12, 24] },
        });
    });

    it('adds a custom theme and selects it for the table', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const table = testBed.injector.get(TableManager).getTable(unitId, 'table-orders')!;
        const rangeThemeModel = testBed.injector.get(SheetRangeThemeModel);
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableThemePanel
                unitId={unitId}
                subUnitId="sheet1"
                tableId="table-orders"
                oldConfig={{}}
            />
        );
        root = rendered.root;
        container = rendered.container;

        clickCustomThemeAddControl(container);
        await flushCommands();

        expect(rangeThemeModel.getCustomRangeThemeStyle(unitId, 'table-custom-1')).toBeDefined();
        expect(table.getTableStyleId()).toBe('table-custom-1');
    });

    it('removes an unused custom theme without changing the table style', async () => {
        testBed = createTestBed();
        const unitId = testBed.workbook.getUnitId();
        const table = testBed.injector.get(TableManager).getTable(unitId, 'table-orders')!;
        const rangeThemeModel = testBed.injector.get(SheetRangeThemeModel);
        const rendered = renderWithRediContext(
            testBed,
            <SheetTableThemePanel
                unitId={unitId}
                subUnitId="sheet1"
                tableId="table-orders"
                oldConfig={{}}
            />
        );
        root = rendered.root;
        container = rendered.container;

        clickCustomThemeAddControl(container);
        await flushCommands();
        clickCustomThemeAddControl(container);
        await flushCommands();

        expect(rangeThemeModel.getCustomRangeThemeStyle(unitId, 'table-custom-1')).toBeDefined();
        expect(rangeThemeModel.getCustomRangeThemeStyle(unitId, 'table-custom-2')).toBeDefined();
        expect(table.getTableStyleId()).toBe('table-custom-2');

        clickCustomThemeRemoveControl(container);
        await flushCommands();

        expect(rangeThemeModel.getCustomRangeThemeStyle(unitId, 'table-custom-1')).toBeUndefined();
        expect(rangeThemeModel.getCustomRangeThemeStyle(unitId, 'table-custom-2')).toBeDefined();
        expect(table.getTableStyleId()).toBe('table-custom-2');
    });
});
