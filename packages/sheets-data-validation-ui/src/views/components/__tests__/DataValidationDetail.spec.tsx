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
    DataValidationErrorStyle,
    DataValidationOperator,
    DataValidationRenderMode,
    DataValidationType,
    ICommandService,
    ILogService,
    Inject,
    Injector,
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
import { AddDataValidationMutation, DataValidationModel, DataValidatorRegistryService, UniverDataValidationPlugin } from '@univerjs/data-validation';
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
    serializeListOptions,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import {
    BASE_FORMULA_INPUT_NAME,
    CheckboxValidator,
    DataValidationCacheService,
    DataValidationCustomFormulaService,
    DataValidationFormulaController,
    DataValidationFormulaService,
    DataValidationListCacheService,
    DateValidator,
    LIST_FORMULA_INPUT_NAME,
    ListMultipleValidator,
    ListValidator,
    RemoveSheetDataValidationCommand,
    SheetDataValidationModel,
    SheetsDataValidationValidatorService,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
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
import { DateShowTimeOption } from '../DateShowTimeOption';
import { FORMULA_INPUTS } from '../formula-input';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'test';
const SUB_UNIT_ID = 'sheet1';

const FIRST_RANGE: IRange = {
    startRow: 0,
    endRow: 1,
    startColumn: 0,
    endColumn: 0,
};

class TestMarkSelectionService {
    addShape(selection: ISelectionWithStyle) {
        return `shape-${selection.range.startRow}`;
    }

    addShapeWithNoFresh(selection: ISelectionWithStyle) {
        return this.addShape(selection);
    }

    removeShape() {
        // The detail tests do not need selection shape state.
    }

    removeAllShapes() {
        // The detail tests do not need selection shape state.
    }

    refreshShapes() {
        // The detail tests do not need selection shape state.
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
        with: () => ({
            getViewModel: () => ({
                getDataModel: () => ({
                    updateDocumentDataPageSize: () => undefined,
                }),
            }),
            getSkeleton: () => ({
                getActualSize: () => ({ actualWidth: 0, actualHeight: 0 }),
            }),
        }),
        scene: {
            transformByState: () => undefined,
            getViewport: () => undefined,
        },
        mainComponent: {
            resize: () => undefined,
            translate: () => undefined,
        },
        components: {
            get: () => undefined,
        },
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

    replaceText(text: string) {
        this._data = {
            ...this._data,
            body: {
                ...this._data.body,
                dataStream: `${text}\r\n`,
                textRuns: [],
            },
        };
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
        },
        locale: LocaleType.EN_US,
        name: 'test workbook',
        sheetOrder: [SUB_UNIT_ID],
        styles: {},
    };
}

function createDateRule(uid = 'rule-date'): ISheetDataValidationRule {
    return {
        uid,
        type: DataValidationType.DATE,
        ranges: [FIRST_RANGE],
        allowBlank: true,
        bizInfo: {
            showTime: false,
        },
    };
}

function createDateBetweenRule(uid = 'rule-date-between'): ISheetDataValidationRule {
    return {
        ...createDateRule(uid),
        operator: DataValidationOperator.BETWEEN,
        formula1: '2024-01-01',
        formula2: '2024-01-31',
    };
}

function createListRule(uid = 'rule-list'): ISheetDataValidationRule {
    return {
        uid,
        type: DataValidationType.LIST,
        ranges: [FIRST_RANGE],
        formula1: serializeListOptions(['Pending', 'Approved']),
        formula2: '#FDCECE,#DEF6A2',
        renderMode: DataValidationRenderMode.CUSTOM,
        allowBlank: true,
    };
}

function createDetailTestBed(rule: ISheetDataValidationRule) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'sheets-data-validation-ui-detail-behavior-test-plugin';
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
                [DataValidationFormulaController],
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
    }

    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-data-validation': {
                checkbox: {
                    title: 'Checkbox',
                },
                date: {
                    title: 'Date',
                },
                list: {
                    title: 'Dropdown',
                },
                listMultiple: {
                    title: 'Dropdown multiple',
                },
                validFail: {
                    date: 'Enter a valid date',
                    list: 'Please input options',
                    listIntersects: 'The selected range cannot intersect the rule range',
                    listInvalid: 'Enter a valid range formula',
                    number: 'Enter a valid number',
                },
            },
            'sheets-data-validation-ui': {
                list: {
                    add: 'Add item',
                    customOptions: 'Custom options',
                    options: 'Options',
                    refOptions: 'From range',
                },
                operators: {
                    legal: 'Is valid',
                },
                panel: {
                    allowBlank: 'Allow blank',
                    done: 'Done',
                    formulaAnd: 'and',
                    formulaPlaceholder: 'Value or formula',
                    invalid: 'Invalid data',
                    messageInfo: 'Message',
                    options: 'Options',
                    range: 'Apply to range',
                    rangeError: 'Select a range',
                    rejectInput: 'Reject input',
                    removeRule: 'Remove rule',
                    showInfo: 'Show message',
                    showWarning: 'Show warning',
                    type: 'Criteria',
                    operator: 'Condition',
                },
                showTime: {
                    label: 'Show time',
                },
            },
        },
    });

    const themeService = injector.get(ThemeService);
    themeService.setTheme(set(themeService.getCurrentTheme(), 'black', '#35322b'));

    univer.registerPlugin(UniverDataValidationPlugin);
    univer.registerPlugin(TestPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
    injector.get(ComponentManager).register(DateShowTimeOption.componentKey, DateShowTimeOption);
    FORMULA_INPUTS.forEach(([key, component]) => {
        injector.get(ComponentManager).register(key, component);
    });

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(UpdateSheetDataValidationSettingCommand);
    commandService.registerCommand(UpdateSheetDataValidationOptionsCommand);
    commandService.registerCommand(UpdateSheetDataValidationRangeCommand);
    commandService.registerCommand(RemoveSheetDataValidationCommand);

    const localeService = injector.get(LocaleService);
    const validatorRegistry = injector.get(DataValidatorRegistryService);
    const dateValidator = new DateValidator(localeService, injector);
    dateValidator.formulaInput = BASE_FORMULA_INPUT_NAME;
    dateValidator.optionsInput = DateShowTimeOption.componentKey;
    validatorRegistry.register(dateValidator);
    validatorRegistry.register(injector.createInstance(CheckboxValidator));
    const listValidator = injector.createInstance(ListValidator);
    listValidator.formulaInput = LIST_FORMULA_INPUT_NAME;
    const listMultipleValidator = injector.createInstance(ListMultipleValidator);
    listMultipleValidator.formulaInput = LIST_FORMULA_INPUT_NAME;
    validatorRegistry.register(listValidator);
    validatorRegistry.register(listMultipleValidator);

    const sheetDataValidationModel = injector.get(SheetDataValidationModel);
    commandService.syncExecuteCommand(AddDataValidationMutation.id, {
        unitId: UNIT_ID,
        subUnitId: SUB_UNIT_ID,
        rule,
    });

    injector.get(DataValidationPanelService).setActiveRule({
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
    };
}

async function renderDetail(root: Root, testBed: ReturnType<typeof createDetailTestBed>) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <DataValidationDetail />
            </RediContext.Provider>
        );
        await Promise.resolve();
    });
}

async function clickElement(element: Element) {
    await act(async () => {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
    });
}

async function openSelect(element: HTMLElement) {
    await act(async () => {
        const PointerEventCtor = window.PointerEvent ?? MouseEvent;
        element.dispatchEvent(new PointerEventCtor('pointerdown', { bubbles: true, button: 0 }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
    });
}

async function changeInputValue(input: HTMLInputElement, value: string) {
    await act(async () => {
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        valueSetter?.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await Promise.resolve();
    });
}

async function waitForDebounce() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
    });
}

function findElementByText(container: HTMLElement, text: string) {
    return Array.from(container.querySelectorAll<HTMLElement>('div'))
        .filter((element) => element.textContent?.includes(text))
        .sort((a, b) => (a.textContent?.length ?? 0) - (b.textContent?.length ?? 0))[0];
}

function findButtonByText(container: HTMLElement, text: string) {
    return Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
        .find((element) => element.textContent?.includes(text))!;
}

describe('DataValidationDetail rule editing', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createDetailTestBed> | undefined;

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

    it('disposes command listeners when unmounted', async () => {
        currentTestBed = createDetailTestBed(createDateRule());
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        const commandListeners = () => (currentTestBed!.commandService as unknown as { _commandExecutedListeners: unknown[] })._commandExecutedListeners.length;
        const initialListenerCount = commandListeners();

        await renderDetail(root, currentTestBed);
        expect(commandListeners()).toBeGreaterThan(initialListenerCount);

        act(() => root?.unmount());
        root = undefined;

        expect(commandListeners()).toBe(initialListenerCount);
    });

    it('persists the allow-blank checkbox into the active rule setting command', async () => {
        currentTestBed = createDetailTestBed(createDateRule('rule-date-allow-blank'));
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)?.allowBlank).toBe(true);

        const allowBlankInput = container.querySelector<HTMLInputElement>('[data-u-comp="checkbox"] input')!;

        await clickElement(allowBlankInput);
        await waitForDebounce();

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)?.allowBlank).toBe(false);
    });

    it('persists date show-time options through the detail options command', async () => {
        currentTestBed = createDetailTestBed(createDateRule());
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);
        await clickElement(findElementByText(container, 'panel.options'));

        const showTimeInput = container.querySelectorAll<HTMLInputElement>('[data-u-comp="checkbox"] input')[1];

        await clickElement(showTimeInput);
        await waitForDebounce();

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)?.bizInfo).toEqual({
            showTime: true,
        });
    });

    it('persists both date bounds when editing a between-rule formula', async () => {
        currentTestBed = createDetailTestBed(createDateBetweenRule());
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);

        const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input'));

        await changeInputValue(inputs[0], '2024-02-01');
        await waitForDebounce();

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toMatchObject({
            operator: DataValidationOperator.BETWEEN,
            formula1: '2024-02-01',
            formula2: '2024-01-31',
        });

        await changeInputValue(inputs[1], '2024-02-29');
        await waitForDebounce();

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toMatchObject({
            operator: DataValidationOperator.BETWEEN,
            formula1: '2024-02-01',
            formula2: '2024-02-29',
        });
    });

    it('updates the active rule range after confirming a new apply-to range', async () => {
        currentTestBed = createDetailTestBed(createDateRule('rule-date-range-selector'));
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);

        const selectRangeIcon = container.querySelector<SVGElement>('svg')!;
        await clickElement(selectRangeIcon);

        const rangeInput = document.body.querySelector<HTMLInputElement>('[data-u-comp="input"] input')!;
        await changeInputValue(rangeInput, 'B3:C4');
        await clickElement(findButtonByText(document.body, 'rangeSelector.confirm'));
        await waitForDebounce();

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)?.ranges).toEqual([{
            startRow: 2,
            endRow: 3,
            startColumn: 1,
            endColumn: 2,
        }]);
    });

    it('clears date bounds and operator when switching the rule to checkbox validation', async () => {
        currentTestBed = createDetailTestBed(createDateBetweenRule('rule-date-to-checkbox'));
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);

        await openSelect(container.querySelectorAll<HTMLElement>('[data-u-comp="select"]')[0]);
        const options = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"], [role="menuitemradio"]'));
        const checkboxOption = options.find((item) => item.textContent?.includes('sheets-data-validation.checkbox.title'))!;

        await clickElement(checkboxOption);

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toMatchObject({
            type: DataValidationType.CHECKBOX,
            operator: undefined,
            formula1: undefined,
            formula2: undefined,
        });
    });

    it('preserves dropdown choices and colors when switching a list rule to multi-select', async () => {
        currentTestBed = createDetailTestBed(createListRule('rule-list-to-multiple'));
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);

        await openSelect(container.querySelectorAll<HTMLElement>('[data-u-comp="select"]')[0]);
        const options = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"], [role="menuitemradio"]'));
        const multipleListOption = options.find((item) => item.textContent?.includes('sheets-data-validation.listMultiple.title'))!;

        await clickElement(multipleListOption);

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toMatchObject({
            type: DataValidationType.LIST_MULTIPLE,
            formula1: serializeListOptions(['Pending', 'Approved']),
            formula2: '#FDCECE,#DEF6A2',
            renderMode: DataValidationRenderMode.CUSTOM,
        });
    });

    it('removes stale date bound inputs after changing validation type to checkbox', async () => {
        currentTestBed = createDetailTestBed(createDateBetweenRule('rule-date-editor-to-checkbox'));
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);

        const dateInputs = Array.from(container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input'));

        expect(dateInputs.map((input) => input.value)).toEqual(['2024-01-01', '2024-01-31']);

        await openSelect(container.querySelectorAll<HTMLElement>('[data-u-comp="select"]')[0]);
        const options = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"], [role="menuitemradio"]'));
        const checkboxOption = options.find((item) => item.textContent?.includes('sheets-data-validation.checkbox.title'))!;

        await clickElement(checkboxOption);

        expect(Array.from(container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input')).map((input) => input.value)).toEqual([]);
        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toMatchObject({
            type: DataValidationType.CHECKBOX,
            operator: undefined,
            formula1: undefined,
            formula2: undefined,
        });
    });

    it('keeps the switched checkbox rule while saving panel options after a type change', async () => {
        currentTestBed = createDetailTestBed(createDateBetweenRule('rule-date-checkbox-options'));
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);

        await openSelect(container.querySelectorAll<HTMLElement>('[data-u-comp="select"]')[0]);
        const options = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"], [role="menuitemradio"]'));
        const checkboxOption = options.find((item) => item.textContent?.includes('sheets-data-validation.checkbox.title'))!;

        await clickElement(checkboxOption);
        await clickElement(findElementByText(container, 'panel.options'));
        await clickElement(container.querySelectorAll<HTMLInputElement>('[data-u-comp="radio"] input')[1]);
        await waitForDebounce();

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toMatchObject({
            type: DataValidationType.CHECKBOX,
            operator: undefined,
            formula1: undefined,
            formula2: undefined,
            errorStyle: DataValidationErrorStyle.STOP,
        });
    });

    it('removes the active rule and closes the detail panel from the remove action', async () => {
        currentTestBed = createDetailTestBed(createDateRule('rule-date-remove'));
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderDetail(root, currentTestBed);

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeDefined();

        await clickElement(findButtonByText(container, 'panel.removeRule'));

        expect(currentTestBed.sheetDataValidationModel.getRuleById(UNIT_ID, SUB_UNIT_ID, currentTestBed.rule.uid)).toBeUndefined();
        expect(currentTestBed.panelService.activeRule).toBe(null);
        expect(container.querySelector('[data-u-comp="data-validation-detail"]')).toBe(null);
    });
});
