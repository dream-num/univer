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

import type {
    Dependency,
    IDisposable,
    IDocumentData,
    IRange,
    ISheetDataValidationRule,
    IWorkbookData,
    Workbook,
} from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { Root } from 'react-dom/client';
import {
    createIdentifier,
    DataValidationType,
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
    set,
    ThemeService,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AddDataValidationMutation,
    DataValidationModel,
    DataValidatorRegistryService,
    UniverDataValidationPlugin,
} from '@univerjs/data-validation';
import {
    ActiveDirtyManagerService,
    DefinedNamesService,
    FormulaDataModel,
    FunctionService,
    IActiveDirtyManagerService,
    IDefinedNamesService,
    IFunctionService,
    ISheetRowFilteredService,
    ISuperTableService,
    LexerTreeBuilder,
    RegisterOtherFormulaService,
    SheetRowFilteredService,
    SuperTableService,
} from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    RangeProtectionRuleModel,
    RefRangeService,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import {
    AddSheetDataValidationCommand,
    CHECKBOX_FORMULA_1,
    CHECKBOX_FORMULA_2,
    CheckboxValidator,
    DataValidationCacheService,
    DataValidationCustomFormulaService,
    DataValidationFormulaService,
    DataValidationListCacheService,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    SheetDataValidationModel,
    SheetsDataValidationValidatorService,
} from '@univerjs/sheets-data-validation';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import {
    ComponentManager,
    DesktopSidebarService,
    ILayoutService,
    IPlatformService,
    IShortcutService,
    ISidebarService,
    PlatformService,
    RediContext,
    ShortcutService,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { DataValidationPanelService } from '../../../services/data-validation-panel.service';
import { DataValidationDetail } from '../DataValidationDetail';
import { DataValidationItem } from '../DataValidationItem';
import { DataValidationList } from '../DataValidationList';
import { DataValidationPanel } from '../DataValidationPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'test';
const SUB_UNIT_ID = 'sheet1';
const OTHER_SUB_UNIT_ID = 'sheet2';

const FIRST_RANGE: IRange = {
    startRow: 0,
    endRow: 1,
    startColumn: 0,
    endColumn: 0,
};

const SECOND_RANGE: IRange = {
    startRow: 4,
    endRow: 4,
    startColumn: 2,
    endColumn: 3,
};

const ADD_RANGE: IRange = {
    startRow: 6,
    endRow: 7,
    startColumn: 1,
    endColumn: 2,
};

class TestMarkSelectionService {
    private _nextId = 0;

    readonly added: Array<{ id: string; selection: ISelectionWithStyle }> = [];
    readonly removed: string[] = [];

    addShape(selection: ISelectionWithStyle) {
        const id = `shape-${this._nextId++}`;
        this.added.push({ id, selection });
        return id;
    }

    addShapeWithNoFresh(selection: ISelectionWithStyle) {
        return this.addShape(selection);
    }

    removeShape(id: string) {
        this.removed.push(id);
    }

    removeAllShapes() {
        this.removed.push(...this.added.map((item) => item.id));
    }

    refreshShapes() {
        // The component test only needs the service state changes.
    }

    getShapeMap() {
        return new Map();
    }
}

class TestLayoutService {
    readonly rootContainerElement = document.body;
}

class TestRenderManagerService {
    getRenderById() {
        return undefined;
    }
}

class TestDescriptionService {
}

const IEditorService = createIdentifier<TestEditorService>('univer.editor.service');
const IDescriptionService = createIdentifier<TestDescriptionService>('formula.description-service');

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

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        sheets: {
            [SUB_UNIT_ID]: {
                id: SUB_UNIT_ID,
                name: 'sheet1',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
            [OTHER_SUB_UNIT_ID]: {
                id: OTHER_SUB_UNIT_ID,
                name: 'sheet2',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
        },
        locale: LocaleType.EN_US,
        name: 'test workbook',
        sheetOrder: [SUB_UNIT_ID, OTHER_SUB_UNIT_ID],
        styles: {},
    };
}

function createCheckboxRule(uid = 'rule-checkbox'): ISheetDataValidationRule {
    return {
        uid,
        type: DataValidationType.CHECKBOX,
        ranges: [FIRST_RANGE, SECOND_RANGE],
        formula1: `${CHECKBOX_FORMULA_1}`,
        formula2: `${CHECKBOX_FORMULA_2}`,
    };
}

function createInvalidCheckboxRule(): ISheetDataValidationRule {
    return {
        ...createCheckboxRule('rule-checkbox-invalid'),
        formula1: `${CHECKBOX_FORMULA_1}`,
        formula2: `${CHECKBOX_FORMULA_1}`,
    };
}

function createItemTestBed(rule: ISheetDataValidationRule = createCheckboxRule()) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'sheets-data-validation-ui-item-test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            ([
                [SheetsSelectionsService],
                [SheetInterceptorService],
                [SheetSkeletonService],
                [ComponentManager],
                [IEditorService, { useClass: TestEditorService }],
                [IDescriptionService, { useClass: TestDescriptionService }],
                [IRenderManagerService, { useClass: TestRenderManagerService as never }],
                [IPlatformService, { useClass: PlatformService }],
                [IShortcutService, { useClass: ShortcutService }],
                [ILayoutService, { useClass: TestLayoutService as never }],
                [WorksheetPermissionService],
                [WorkbookPermissionService],
                [WorksheetProtectionPointModel],
                [WorksheetProtectionRuleModel],
                [RangeProtectionRuleModel],
                [FormulaDataModel],
                [LexerTreeBuilder],
                [RefRangeService],
                [IFunctionService, { useClass: FunctionService }],
                [IDefinedNamesService, { useClass: DefinedNamesService }],
                [ISuperTableService, { useClass: SuperTableService }],
                [DataValidationCacheService],
                [DataValidationListCacheService],
                [DataValidationFormulaService],
                [DataValidationCustomFormulaService],
                [RegisterOtherFormulaService],
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
                [SheetsDataValidationValidatorService],
                [SheetDataValidationModel],
                [IMarkSelectionService, { useClass: TestMarkSelectionService as never }],
                [ISidebarService, { useClass: DesktopSidebarService }],
                [DataValidationPanelService],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
        }

        override onReady(): void {
            // no extra lifecycle work is needed for this component test.
        }
    }

    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-data-validation': {
                checkbox: {
                    title: 'Checkbox',
                },
            },
            'sheets-data-validation-ui': {
                panel: {
                    add: 'Add',
                    removeAll: 'Remove all',
                },
            },
        },
    });

    const themeService = injector.get(ThemeService);
    themeService.setTheme(set(themeService.getCurrentTheme(), 'black', '#35322b'));

    univer.registerPlugin(UniverDataValidationPlugin);
    univer.registerPlugin(TestPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);

    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(AddSheetDataValidationCommand);
    commandService.registerCommand(RemoveSheetAllDataValidationCommand);
    commandService.registerCommand(RemoveSheetDataValidationCommand);
    commandService.registerCommand(SetWorksheetActiveOperation);

    const validatorRegistry = injector.get(DataValidatorRegistryService);
    validatorRegistry.register(injector.createInstance(CheckboxValidator));

    const sheetDataValidationModel = injector.get(SheetDataValidationModel);
    commandService.syncExecuteCommand(AddDataValidationMutation.id, {
        unitId: UNIT_ID,
        subUnitId: SUB_UNIT_ID,
        rule,
    });

    return {
        univer,
        injector,
        commandService,
        workbook,
        rule,
        dataValidationModel: injector.get(DataValidationModel),
        panelService: injector.get(DataValidationPanelService),
        sheetDataValidationModel,
        markSelectionService: injector.get(IMarkSelectionService) as unknown as TestMarkSelectionService,
    };
}

function renderItem(
    root: Root,
    testBed: ReturnType<typeof createItemTestBed>,
    onClick: () => void
) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <DataValidationItem
                    rule={testBed.rule}
                    onClick={onClick}
                    unitId={UNIT_ID}
                    subUnitId={SUB_UNIT_ID}
                />
            </RediContext.Provider>
        );
    });

    return document.querySelector('.univer-bg-secondary') as HTMLElement;
}

async function enterItem(item: HTMLElement) {
    await act(async () => {
        item.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }));
        await Promise.resolve();
    });
}

async function leaveItem(item: HTMLElement) {
    await act(async () => {
        item.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
        await Promise.resolve();
    });
}

describe('DataValidationItem', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createItemTestBed> | undefined;

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

    it('marks each rule range while the rule item is hovered and clears the marks on leave', async () => {
        currentTestBed = createItemTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        const item = renderItem(root, currentTestBed, () => undefined);

        await enterItem(item);

        expect(currentTestBed.markSelectionService.added.map((entry) => entry.selection.range)).toEqual([
            FIRST_RANGE,
            SECOND_RANGE,
        ]);
        expect(currentTestBed.markSelectionService.added.every((entry) => entry.selection.primary === null)).toBe(true);

        await leaveItem(item);

        expect(currentTestBed.markSelectionService.removed).toEqual(['shape-0', 'shape-1']);
    });

    it('clears highlighted rule ranges when the hovered item is unmounted', async () => {
        currentTestBed = createItemTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        const item = renderItem(root, currentTestBed, () => undefined);

        await enterItem(item);

        expect(currentTestBed.markSelectionService.added.map((entry) => entry.selection.range)).toEqual([
            FIRST_RANGE,
            SECOND_RANGE,
        ]);

        act(() => {
            root?.unmount();
        });
        root = undefined;

        expect(currentTestBed.markSelectionService.removed).toEqual(['shape-0', 'shape-1']);
    });

    it('removes the hovered rule through the sheet data-validation command without selecting the item', async () => {
        currentTestBed = createItemTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let selectedCount = 0;

        const item = renderItem(root, currentTestBed, () => {
            selectedCount += 1;
        });

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeDefined();

        await enterItem(item);

        const deleteButton = container.querySelector('.univer-absolute') as HTMLElement;

        await act(async () => {
            deleteButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(selectedCount).toBe(0);
        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeUndefined();
        expect(currentTestBed.dataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeUndefined();
    });
});

describe('DataValidationList', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createItemTestBed> | undefined;

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

    function renderList() {
        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <DataValidationList workbook={currentTestBed!.workbook} />
                </RediContext.Provider>
            );
        });
    }

    it('adds a new validation rule from the current sheet selection and opens it for editing', async () => {
        currentTestBed = createItemTestBed();
        currentTestBed.injector.get(SheetsSelectionsService).setSelections([{ range: ADD_RANGE, primary: null }] as never);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        renderList();

        const buttons = Array.from(container.querySelectorAll('[data-u-comp="button"]')) as HTMLElement[];
        const addButton = buttons[buttons.length - 1];

        await act(async () => {
            addButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        const rules = currentTestBed.sheetDataValidationModel.getRules(UNIT_ID, SUB_UNIT_ID);
        const activeRule = currentTestBed.panelService.activeRule;

        expect(rules).toHaveLength(2);
        expect(rules[1].ranges).toEqual([ADD_RANGE]);
        expect(activeRule?.unitId).toBe(UNIT_ID);
        expect(activeRule?.subUnitId).toBe(SUB_UNIT_ID);
        expect(activeRule?.rule.uid).toBe(rules[1].uid);
    });

    it('removes all validation rules from the active sheet through the list action', async () => {
        currentTestBed = createItemTestBed();
        const secondRule = createCheckboxRule('rule-checkbox-second');
        currentTestBed.commandService.syncExecuteCommand(AddDataValidationMutation.id, {
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            rule: secondRule,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        renderList();

        expect(currentTestBed.sheetDataValidationModel.getRules(UNIT_ID, SUB_UNIT_ID)).toHaveLength(2);

        const buttons = Array.from(container.querySelectorAll('[data-u-comp="button"]')) as HTMLElement[];
        const removeAllButton = buttons[0];

        await act(async () => {
            removeAllButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.sheetDataValidationModel.getRules(UNIT_ID, SUB_UNIT_ID)).toEqual([]);
        expect(container.textContent).not.toContain('A1:A2');
        expect(container.textContent).not.toContain('C5:D5');
    });

    it('keeps workbook-locked rules from being highlighted, opened, or bulk removed', async () => {
        currentTestBed = createItemTestBed();
        currentTestBed.injector
            .get(IPermissionService)
            .updatePermissionPoint(new WorkbookEditablePermission(UNIT_ID).id, false);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        renderList();

        const item = container.querySelector('.univer-bg-secondary') as HTMLElement;

        await enterItem(item);

        expect(currentTestBed.markSelectionService.added).toEqual([]);

        await act(async () => {
            item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.panelService.activeRule?.rule.uid).toBeUndefined();
        expect(container.textContent).not.toContain('Remove all');
        expect(currentTestBed.sheetDataValidationModel.getRules(UNIT_ID, SUB_UNIT_ID)).toHaveLength(1);
    });
});

describe('DataValidationDetail', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createItemTestBed> | undefined;

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

    async function renderDetail() {
        currentTestBed!.panelService.setActiveRule({
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            rule: currentTestBed!.rule,
        });

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <DataValidationDetail />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        return container!.querySelector('[data-u-comp="data-validation-detail"]') as HTMLElement;
    }

    it('removes the active validation rule and returns to the rule list', async () => {
        currentTestBed = createItemTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        const detail = await renderDetail();
        const buttons = Array.from(detail.querySelectorAll('[data-u-comp="button"]')) as HTMLElement[];
        const removeButton = buttons[buttons.length - 2];

        await act(async () => {
            removeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeUndefined();
        expect(currentTestBed.panelService.activeRule).toBeNull();
    });

    it('keeps a valid rule and closes the detail view when done is clicked', async () => {
        currentTestBed = createItemTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        const detail = await renderDetail();
        const buttons = Array.from(detail.querySelectorAll('[data-u-comp="button"]')) as HTMLElement[];
        const doneButton = buttons[buttons.length - 1];

        await act(async () => {
            doneButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeDefined();
        expect(currentTestBed.panelService.activeRule).toBeNull();
    });

    it('keeps the detail open when the rule formula is invalid', async () => {
        currentTestBed = createItemTestBed(createInvalidCheckboxRule());
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        const detail = await renderDetail();
        const buttons = Array.from(detail.querySelectorAll('[data-u-comp="button"]')) as HTMLElement[];
        const doneButton = buttons[buttons.length - 1];

        await act(async () => {
            doneButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.panelService.activeRule?.rule.uid).toBe(currentTestBed.rule.uid);
        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeDefined();
    });
});

describe('DataValidationPanel', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createItemTestBed> | undefined;

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

    it('ignores an active rule from another sheet until a current-sheet rule is selected', async () => {
        currentTestBed = createItemTestBed();
        currentTestBed.panelService.setActiveRule({
            unitId: UNIT_ID,
            subUnitId: OTHER_SUB_UNIT_ID,
            rule: currentTestBed.rule,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <DataValidationPanel />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const item = container.querySelector('.univer-bg-secondary') as HTMLElement;

        await act(async () => {
            item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.panelService.activeRule?.subUnitId).toBe(SUB_UNIT_ID);
        expect(currentTestBed.panelService.activeRule?.rule.uid).toBe(currentTestBed.rule.uid);
        expect(container.querySelector('[data-u-comp="data-validation-detail"]')).not.toBeNull();
    });

    it('keeps showing a cross-sheet active rule while its formula editor has focus', async () => {
        currentTestBed = createItemTestBed();
        currentTestBed.panelService.setActiveRule({
            unitId: UNIT_ID,
            subUnitId: OTHER_SUB_UNIT_ID,
            rule: currentTestBed.rule,
        });
        currentTestBed.panelService.setFocusFormulaEditorActiveRuleSubUnitId(OTHER_SUB_UNIT_ID);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <DataValidationPanel />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(container.querySelector('[data-u-comp="data-validation-detail"]')).not.toBeNull();
        expect(currentTestBed.panelService.activeRule?.subUnitId).toBe(OTHER_SUB_UNIT_ID);
    });

    it('returns to the cross-sheet active rule sheet after the focused rule is accepted', async () => {
        currentTestBed = createItemTestBed();
        currentTestBed.panelService.setActiveRule({
            unitId: UNIT_ID,
            subUnitId: OTHER_SUB_UNIT_ID,
            rule: currentTestBed.rule,
        });
        currentTestBed.panelService.setFocusFormulaEditorActiveRuleSubUnitId(OTHER_SUB_UNIT_ID);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <DataValidationPanel />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(currentTestBed.workbook.getActiveSheet().getSheetId()).toBe(SUB_UNIT_ID);

        const detail = container.querySelector('[data-u-comp="data-validation-detail"]') as HTMLElement;
        const buttons = Array.from(detail.querySelectorAll('[data-u-comp="button"]')) as HTMLElement[];
        const doneButton = buttons[buttons.length - 1];

        await act(async () => {
            doneButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.workbook.getActiveSheet().getSheetId()).toBe(OTHER_SUB_UNIT_ID);
        expect(currentTestBed.panelService.activeRule).toBeNull();
    });

    it('opens the selected rule in detail and returns to the list after the rule is accepted', async () => {
        currentTestBed = createItemTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <DataValidationPanel />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const item = container.querySelector('.univer-bg-secondary') as HTMLElement;

        await act(async () => {
            item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.panelService.activeRule?.rule.uid).toBe(currentTestBed.rule.uid);

        const detail = container.querySelector('[data-u-comp="data-validation-detail"]') as HTMLElement;
        const buttons = Array.from(detail.querySelectorAll('[data-u-comp="button"]')) as HTMLElement[];
        const doneButton = buttons[buttons.length - 1];

        await act(async () => {
            doneButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.panelService.activeRule).toBeNull();
        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeDefined();
        expect(container.textContent).toContain('A1:A2');
    });
});
