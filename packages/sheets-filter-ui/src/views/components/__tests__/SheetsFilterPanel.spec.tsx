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

import type { Dependency, IDisposable, IOperation, IWorkbookData, Workbook } from '@univerjs/core';
import type { IUniverSheetsFilterConfig } from '@univerjs/sheets-filter';
import type { IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import type { Root } from 'react-dom/client';
import {
    awaitTime,
    CommandType,
    ICommandService,
    IContextService,
    ILogService,
    Inject,
    Injector,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    ActiveDirtyManagerService,
    IActiveDirtyManagerService,
    ISheetRowFilteredService,
    SheetRowFilteredService,
} from '@univerjs/engine-formula';
import {
    MarkDirtyFilterChangeMutation,
    RefRangeService,
    SheetInterceptorService,
    SheetRangeThemeModel,
    SheetsSelectionsService,
    ZebraCrossingCacheController,
} from '@univerjs/sheets';
import { FilterBy, SheetsFilterService, SheetsFilterSyncController, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { ILayoutService, IMessageService, IUIPartsService, RediContext, UIPartsService } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { WithValuesAndEmptyFilterModelFactory, WithValuesFilterModelFactory } from '../../../__tests__/data';
import {
    ChangeFilterByOperation,
    CloseFilterPanelOperation,
    FILTER_PANEL_OPENED_KEY,
    OpenFilterPanelOperation,
} from '../../../commands/operations/sheets-filter.operation';
import enUS from '../../../locale/en-US';
import { ISheetsFilterPanelService, SheetsFilterPanelService } from '../../../services/sheets-filter-panel.service';
import { FilterPanel } from '../SheetsFilterPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'test';
const SUB_UNIT_ID = 'sheet1';

const SetCellEditVisibleOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible',
    type: CommandType.OPERATION,
    handler: () => true,
};

class TestLayoutService {
    private _focused = false;
    readonly rootContainerElement = document.body;

    get isFocused() {
        return this._focused;
    }

    focus() {
        this._focused = true;
    }

    registerFocusHandler(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerRootContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContentElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    getContentElement() {
        return document.body;
    }

    checkElementInCurrentContainers() {
        return true;
    }

    checkContentIsFocused() {
        return this._focused;
    }
}

class TestMessageService {
    readonly messages: unknown[] = [];

    show(options: unknown): IDisposable {
        this.messages.push(options);
        return toDisposable(() => undefined);
    }

    remove() {
        // The switch UI is not the behavior under test here.
    }

    removeAll() {
        this.messages.length = 0;
    }
}

function createFilterPanelViewTestBed(workbookData: IWorkbookData, filterConfig?: Partial<IUniverSheetsFilterConfig>) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override type = UniverInstanceType.UNIVER_SHEET;
        static override pluginName = 'sheets-filter-ui-panel-view-test-plugin';

        constructor(
            _config: unknown,
            @Inject(Injector) protected readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            ([
                [SheetInterceptorService],
                [ISheetsFilterPanelService, { useClass: SheetsFilterPanelService }],
                [RefRangeService],
                [SheetsSelectionsService],
                [SheetRangeThemeModel],
                [ZebraCrossingCacheController],
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
                [ILayoutService, { useClass: TestLayoutService as never }],
                [IMessageService, { useClass: TestMessageService as never }],
                [IUIPartsService, { useClass: UIPartsService }],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
        }
    }

    injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    if (filterConfig) {
        univer.registerPlugin(UniverSheetsFilterPlugin, filterConfig);
    } else {
        univer.registerPlugin(UniverSheetsFilterPlugin);
    }
    univer.registerPlugin(TestPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    [
        OpenFilterPanelOperation,
        CloseFilterPanelOperation,
        ChangeFilterByOperation,
        SetCellEditVisibleOperation,
        MarkDirtyFilterChangeMutation,
    ].forEach((command) => commandService.registerCommand(command));

    return {
        univer,
        injector,
        workbook,
        commandService,
        contextService: injector.get(IContextService),
        filterService: injector.get(SheetsFilterService),
        panelService: injector.get(ISheetsFilterPanelService),
        messageService: injector.get(IMessageService) as TestMessageService,
    };
}

async function openPanel(testBed: ReturnType<typeof createFilterPanelViewTestBed>) {
    expect(testBed.commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
        unitId: UNIT_ID,
        subUnitId: SUB_UNIT_ID,
        col: 0,
    })).toBe(true);
    await awaitTime(20);
}

async function renderPanel(root: Root, testBed: ReturnType<typeof createFilterPanelViewTestBed>) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <FilterPanel />
            </RediContext.Provider>
        );
        await awaitTime(20);
    });
}

function clickElement(element: Element) {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function openSelect(element: Element) {
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
}

function changeCheckbox(input: HTMLInputElement) {
    input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function changeInput(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function getButton(container: HTMLElement, text: string): HTMLElement {
    const button = Array.from(container.querySelectorAll('[data-u-comp="button"]'))
        .find((button) => button.textContent === text);

    if (!button) {
        throw new Error(`Button "${text}" was not rendered.`);
    }

    return button as HTMLElement;
}

function getSelect(container: HTMLElement, index = 0): HTMLElement {
    const select = container.querySelectorAll<HTMLElement>('[data-u-comp="select"]').item(index);
    if (!select) {
        throw new Error(`Select at index "${index}" was not rendered.`);
    }

    return select;
}

function getDropdownOption(text: string): HTMLElement {
    const option = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"]'))
        .find((item) => item.textContent === text);
    if (!option) {
        const renderedOptions = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"]'))
            .map((item) => item.textContent)
            .join(', ');
        throw new Error(`Dropdown option "${text}" was not rendered. Options: ${renderedOptions}`);
    }

    return option;
}

function getValueItemCheckbox(container: HTMLElement, title: string): HTMLInputElement {
    const titleElement = Array.from(container.querySelectorAll('span'))
        .find((element) => element.textContent === title);

    if (!titleElement) {
        throw new Error(`Filter value "${title}" was not rendered.`);
    }

    let row: Element | null = titleElement;
    while (row && !row.querySelector('[data-u-comp="checkbox"] input')) {
        row = row.parentElement;
    }

    const input = row?.querySelector<HTMLInputElement>('[data-u-comp="checkbox"] input');
    if (!input) {
        throw new Error(`Filter value "${title}" did not render a checkbox.`);
    }

    return input;
}

function getColorSwatch(container: HTMLElement, color: string): HTMLElement {
    const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => button.style.backgroundColor === color);

    const swatch = button?.parentElement;
    if (!swatch) {
        throw new Error(`Color swatch "${color}" was not rendered.`);
    }

    return swatch;
}

function WithColorOptionsFilterModelFactory(): IWorkbookData {
    return {
        id: UNIT_ID,
        sheetOrder: [SUB_UNIT_ID],
        name: '',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
        styles: {
            redFill: {
                bg: {
                    rgb: '#ff0000',
                },
            },
            blueText: {
                cl: {
                    rgb: '#0000ff',
                },
            },
        },
        sheets: {
            [SUB_UNIT_ID]: {
                id: SUB_UNIT_ID,
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 5,
                cellData: {
                    0: {
                        0: { v: 'Status' },
                    },
                    1: {
                        0: { v: 'Blocked', s: 'redFill' },
                    },
                    2: {
                        0: { v: 'Ready', s: 'blueText' },
                    },
                    3: {
                        0: { v: 'Backlog' },
                    },
                },
            },
        },
        resources: [
            {
                name: 'SHEET_FILTER_PLUGIN',
                data: JSON.stringify({
                    [SUB_UNIT_ID]: {
                        ref: {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 3,
                            endColumn: 0,
                        },
                        filterColumns: [],
                        cachedFilteredOut: [],
                    },
                }),
            },
        ],
    };
}

describe('FilterPanel', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createFilterPanelViewTestBed> | undefined;

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

    it('clears existing value criteria and closes the panel from the footer action', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithValuesAndEmptyFilterModelFactory());
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        const filterColumnBefore = currentTestBed.filterService.activeFilterModel?.getFilterColumn(0);
        expect(filterColumnBefore?.getColumnData().filters).toBeDefined();

        const clearButton = Array.from(container.querySelectorAll('[data-u-comp="button"]'))
            .find((button) => button.textContent === 'Clear Filter') as HTMLElement;

        await act(async () => {
            clearButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(currentTestBed.filterService.activeFilterModel?.getFilterColumn(0)).toBeNull();
        expect(currentTestBed.contextService.getContextValue(FILTER_PANEL_OPENED_KEY)).toBe(false);
        expect(currentTestBed.panelService.col).toBe(-1);
    });

    it('switches from values to conditions through the segmented control', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithValuesFilterModelFactory());
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        expect(currentTestBed.panelService.filterBy).toBe(FilterBy.VALUES);

        const conditionButton = Array.from(container.querySelectorAll('[data-u-comp="segmented"] button'))
            .find((button) => button.textContent === 'By Conditions') as HTMLElement;

        await act(async () => {
            conditionButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(currentTestBed.panelService.filterBy).toBe(FilterBy.CONDITIONS);
        expect(container.querySelector('[data-u-comp="sheets-filter-panel-conditions-container"]')).toBeTruthy();
    });

    it('applies value criteria after unchecking a value from the tree', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithValuesFilterModelFactory());
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        const michaelCheckbox = getValueItemCheckbox(container, 'Michael');
        const confirmButton = getButton(container, 'Confirm');

        await act(async () => {
            changeCheckbox(michaelCheckbox);
            await awaitTime(20);
        });

        await act(async () => {
            clickElement(confirmButton);
            await awaitTime(20);
        });

        const filters = currentTestBed.filterService.activeFilterModel?.getFilterColumn(0)?.getColumnData().filters?.filters;
        expect(filters).toContain('Jackson');
        expect(filters).not.toContain('Michael');
        expect(currentTestBed.contextService.getContextValue(FILTER_PANEL_OPENED_KEY)).toBe(false);
    });

    it('keeps value criteria unchanged when a changed candidate is cancelled', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithValuesAndEmptyFilterModelFactory());
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        const michaelCheckbox = getValueItemCheckbox(container, 'Michael');
        expect(michaelCheckbox.checked).toBe(false);

        await act(async () => {
            changeCheckbox(michaelCheckbox);
            await awaitTime(20);
        });

        expect(getValueItemCheckbox(container, 'Michael').checked).toBe(true);

        await act(async () => {
            clickElement(getButton(container!, 'Cancel'));
            await awaitTime(20);
        });

        expect(currentTestBed.filterService.activeFilterModel?.getFilterColumn(0)?.getColumnData().filters).toEqual({
            blank: true,
            filters: ['1'],
        });
        expect(currentTestBed.contextService.getContextValue(FILTER_PANEL_OPENED_KEY)).toBe(false);
    });

    it('applies text contains criteria from the conditions panel', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithValuesFilterModelFactory());
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        const conditionButton = Array.from(container.querySelectorAll('[data-u-comp="segmented"] button'))
            .find((button) => button.textContent === 'By Conditions') as HTMLElement;

        await act(async () => {
            clickElement(conditionButton);
            await awaitTime(20);
        });

        await act(async () => {
            openSelect(getSelect(container!));
            await awaitTime(20);
        });

        await act(async () => {
            clickElement(getDropdownOption('Text Contains'));
            await awaitTime(20);
        });

        const input = container.querySelector<HTMLInputElement>('[data-u-comp="sheets-filter-panel-conditions-container-inner"] input');
        if (!input) {
            throw new Error('Condition value input was not rendered.');
        }

        await act(async () => {
            changeInput(input, 'Michael');
            await awaitTime(20);
        });

        await act(async () => {
            clickElement(getButton(container!, 'Confirm'));
            await awaitTime(20);
        });

        const columnData = currentTestBed.filterService.activeFilterModel?.getFilterColumn(0)?.getColumnData();
        expect(columnData?.customFilters).toEqual({
            customFilters: [{ val: '*Michael*' }],
        });
        expect(columnData?.filters).toBeUndefined();
        expect(currentTestBed.contextService.getContextValue(FILTER_PANEL_OPENED_KEY)).toBe(false);
    });

    it('applies the selected cell fill color as color criteria', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithColorOptionsFilterModelFactory());
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        const colorButton = Array.from(container.querySelectorAll('[data-u-comp="segmented"] button'))
            .find((button) => button.textContent === 'By Colors') as HTMLElement;

        await act(async () => {
            clickElement(colorButton);
            await awaitTime(20);
        });

        await act(async () => {
            clickElement(getColorSwatch(container!, 'rgb(255, 0, 0)'));
            await awaitTime(20);
        });

        await act(async () => {
            clickElement(getButton(container!, 'Confirm'));
            await awaitTime(20);
        });

        expect(currentTestBed.filterService.activeFilterModel?.getFilterColumn(0)?.getColumnData().colorFilters).toEqual({
            cellFillColors: ['rgb(255,0,0)'],
        });
        expect(currentTestBed.contextService.getContextValue(FILTER_PANEL_OPENED_KEY)).toBe(false);
    });

    it('turns sync off through the switch and reports the change', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithValuesFilterModelFactory(), {
            enableSyncSwitch: { defaultValue: true },
        });
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        const syncController = currentTestBed.injector.get(SheetsFilterSyncController);
        const switchInput = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')).at(-1);
        if (!switchInput) {
            throw new Error('Sync switch input was not rendered.');
        }

        await act(async () => {
            changeCheckbox(switchInput);
            await awaitTime(20);
        });

        expect(syncController.enabled).toBe(false);
        expect(currentTestBed.messageService.messages).toEqual([{
            content: '"Filter is visible to everyone" is turned off, only you will see the filter results',
            type: 'success',
            duration: 2000,
        }]);
    });
});
