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
import {
    CellValueType,
    currencySymbols,
    ICommandService,
    ILocalStorageService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    RANGE_TYPE,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    INumfmtService,
    NumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SetRangeValuesMutation,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    getCurrencyType,
    getPatternType,
    SetNumfmtCommand,
    SheetsNumfmtCellContentController,
} from '@univerjs/sheets-numfmt';
import { ILayoutService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { UserHabitController } from '../../controllers/user-habit.controller';
import { CustomFormat } from '../components/CustomFormat';
import { Options } from '../components/MoreNumfmtType';
import { SheetNumfmtPanel } from '../SheetNumfmtPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'test';
const SUB_UNIT_ID = 'sheet1';
const CUSTOM_HISTORY_KEY = 'numfmt_custom_pattern';
const CURRENCY_HABIT_KEY = 'userHabitController_numfmtCurrency';

class TestLocalStorageService implements ILocalStorageService {
    private readonly _data = new Map<string, unknown>();

    async getItem<T>(key: string): Promise<T | null> {
        return (this._data.has(key) ? this._data.get(key) : null) as T | null;
    }

    async setItem<T>(key: string, value: T): Promise<T> {
        this._data.set(key, value);
        return value;
    }

    async removeItem(key: string): Promise<void> {
        this._data.delete(key);
    }

    async clear(): Promise<void> {
        this._data.clear();
    }

    async key(index: number): Promise<string | null> {
        return Array.from(this._data.keys())[index] ?? null;
    }

    async keys(): Promise<string[]> {
        return Array.from(this._data.keys());
    }

    async iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U): Promise<U> {
        const entries = Array.from(this._data.entries());
        let result: U | undefined;
        entries.forEach(([key, value], index) => {
            result = iteratee(value as T, key, index + 1);
        });
        return result as U;
    }
}

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

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'numfmt view test',
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
                        0: { v: 12, t: CellValueType.NUMBER },
                        1: { v: 34, t: CellValueType.NUMBER },
                    },
                },
            },
        },
    };
}

function createNumfmtViewTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'sheets-numfmt-ui-view-test-plugin';
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
                [INumfmtService, { useClass: NumfmtService }],
                [SheetsNumfmtCellContentController],
                [UserHabitController],
                [ILocalStorageService, { useClass: TestLocalStorageService }],
                [ILayoutService, { useClass: TestLayoutService as never }],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    const localeService = injector.get(LocaleService);
    localeService.load({
        [LocaleType.EN_US]: {
            'sheets-numfmt-ui': {
                general: 'General',
                text: 'Text',
                number: 'Number',
                percent: 'Percent',
                scientific: 'Scientific',
                accounting: 'Accounting',
                financialValue: 'Financial value',
                currency: 'Currency',
                thousandthPercentile: 'Number',
                roundingCurrency: 'Rounded currency',
                date: 'Date',
                time: 'Time',
                dateTime: 'Date time',
                timeDuration: 'Time duration',
                moreFmt: 'More formats',
                numfmtType: 'Number format',
                decimalLength: 'Decimal places',
                negType: 'Negative values',
                customFormat: 'Custom format',
                customFormatDes: 'Custom formats can be saved and reused.',
            },
        },
    });
    localeService.setLocale(LocaleType.EN_US);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    [
        SetRangeValuesMutation,
        SetNumfmtMutation,
        RemoveNumfmtMutation,
        SetNumfmtCommand,
    ].forEach((command) => commandService.registerCommand(command));

    return {
        univer,
        injector,
        workbook,
        commandService,
        selectionService: injector.get(SheetsSelectionsService),
        numfmtService: injector.get(INumfmtService),
        localStorageService: injector.get(ILocalStorageService),
    };
}

describe('MoreNumfmtType Options', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createNumfmtViewTestBed> | undefined;

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

    it('applies and clears number formats on the current sheet selection', async () => {
        currentTestBed = createNumfmtViewTestBed();
        currentTestBed.selectionService.setSelections([{
            range: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            },
            primary: null,
        }] as never);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <Options />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const items = Array.from(container.querySelectorAll('.univer-flex.univer-h-7')) as HTMLElement[];

        await act(async () => {
            items[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({ pattern: '0' });
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 1)).toEqual({ pattern: '0' });

        await act(async () => {
            items[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toBeNull();
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 1)).toBeNull();
    });

    it('applies percent format to the current sheet selection and returns focus to the sheet', async () => {
        currentTestBed = createNumfmtViewTestBed();
        currentTestBed.selectionService.setSelections([{
            range: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            },
            primary: null,
        }] as never);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <Options />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const percentItem = Array.from(container.querySelectorAll('.univer-flex.univer-h-7'))
            .find((item) => item.textContent?.includes('Percent')) as HTMLElement | undefined;

        expect(percentItem).toBeDefined();

        await act(async () => {
            percentItem!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({ pattern: '0.00%' });
        expect((currentTestBed.injector.get(ILayoutService) as unknown as TestLayoutService).checkContentIsFocused()).toBe(true);
    });
});

describe('CustomFormat', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createNumfmtViewTestBed> | undefined;

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

    it('uses saved custom patterns and writes the confirmed pattern back to history', async () => {
        currentTestBed = createNumfmtViewTestBed();
        await currentTestBed.localStorageService.setItem(CUSTOM_HISTORY_KEY, ['0.0000']);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const changes: string[] = [];
        let getCurrentPattern: (() => string | null) | undefined;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <CustomFormat
                        defaultValue={1234.5}
                        defaultPattern="0.00"
                        onChange={(value) => changes.push(value)}
                        onActionChange={(action) => {
                            getCurrentPattern = action;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const savedPattern = Array.from(container.querySelectorAll('.univer-flex.univer-cursor-pointer'))
            .find((item) => item.textContent?.includes('0.0000')) as HTMLElement;

        expect(savedPattern).toBeDefined();

        await act(async () => {
            savedPattern.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(changes.at(-1)).toBe('0.0000');

        const confirmedPattern = getCurrentPattern?.();
        await Promise.resolve();

        expect(confirmedPattern).toBe('0.0000');
        expect(await currentTestBed.localStorageService.getItem<string[]>(CUSTOM_HISTORY_KEY)).toEqual(['0.0000']);
    });

    it('keeps confirmed custom patterns recent and unique in the saved history', async () => {
        currentTestBed = createNumfmtViewTestBed();
        await currentTestBed.localStorageService.setItem(CUSTOM_HISTORY_KEY, [
            '0.0',
            '#,##0',
            'm/d/yyyy',
            '0.0',
            '0%',
            '$#,##0.00',
            'h:mm AM/PM',
            '0.000',
            '#,##0.00',
            '0.00%',
            '0.0000',
        ]);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let getCurrentPattern: (() => string | null) | undefined;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <CustomFormat
                        defaultValue={1234.5}
                        defaultPattern="#,##0"
                        onChange={() => undefined}
                        onActionChange={(action) => {
                            getCurrentPattern = action;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(getCurrentPattern?.()).toBe('#,##0');
        await Promise.resolve();

        expect(await currentTestBed.localStorageService.getItem<string[]>(CUSTOM_HISTORY_KEY)).toEqual([
            '#,##0',
            '0.0',
            'm/d/yyyy',
            '0%',
            '$#,##0.00',
            'h:mm AM/PM',
            '0.000',
            '#,##0.00',
            '0.00%',
            '0.0000',
        ]);
    });
});

describe('SheetNumfmtPanel', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createNumfmtViewTestBed> | undefined;

    async function selectPanelType(label: string) {
        await act(async () => {
            container!.querySelector('[data-u-comp="select"]')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        const option = Array.from(document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]'))
            .find((button) => button.textContent === label) as HTMLElement | undefined;

        expect(option).toBeDefined();

        await act(async () => {
            option!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
            await Promise.resolve();
        });
    }

    async function selectPanelListOption(label: string) {
        const option = Array.from(container!.querySelectorAll('a'))
            .find((item) => item.textContent === label) as HTMLElement | undefined;

        expect(option).toBeDefined();

        await act(async () => {
            option!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });
    }

    async function confirmPanel() {
        const confirmButton = Array.from(container!.querySelectorAll('[data-u-comp="button"]'))[1] as HTMLElement;

        await act(async () => {
            confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });
    }

    async function cancelPanel() {
        const cancelButton = Array.from(container!.querySelectorAll('[data-u-comp="button"]'))[0] as HTMLElement;

        await act(async () => {
            cancelButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });
    }

    async function changePanelInput(value: string) {
        const input = container!.querySelector('input') as HTMLInputElement | null;

        expect(input).toBeDefined();

        await act(async () => {
            const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            valueSetter?.call(input, value);
            input!.dispatchEvent(new Event('input', { bubbles: true }));
            await Promise.resolve();
        });
    }

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

    it('confirms the current number format pattern and reports cancel without changing a pattern', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const events: Array<{ type: 'change' | 'cancel' | 'confirm'; value: string }> = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: '#,##0_);(#,##0)',
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => events.push(event)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const buttons = Array.from(container.querySelectorAll('[data-u-comp="button"]')) as HTMLElement[];
        const cancelButton = buttons[0];
        const confirmButton = buttons[1];

        await act(async () => {
            confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        await act(async () => {
            cancelButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(events).toEqual([
            { type: 'confirm', value: '#,##0_);(#,##0)' },
            { type: 'cancel', value: '' },
        ]);
    });

    it('clears an existing number format when the user switches the panel type to General', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const events: Array<{ type: 'change' | 'cancel' | 'confirm'; value: string }> = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: '#,##0_);(#,##0)',
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => events.push(event)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await act(async () => {
            container!.querySelector('[data-u-comp="select"]')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        const generalOption = Array.from(document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]'))
            .find((button) => button.textContent === 'General');

        expect(generalOption).toBeDefined();

        await act(async () => {
            generalOption!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        const confirmButton = Array.from(container.querySelectorAll('[data-u-comp="button"]'))[1] as HTMLElement;

        await act(async () => {
            confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(events).toEqual([
            { type: 'change', value: '' },
            { type: 'confirm', value: '' },
        ]);
    });

    it('applies the selected date format through the real SetNumfmtCommand when confirmed', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const commandResults: Array<Promise<unknown>> = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: '',
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => {
                            if (event.type === 'confirm') {
                                commandResults.push(currentTestBed!.commandService.executeCommand(SetNumfmtCommand.id, {
                                    values: [{
                                        row: 0,
                                        col: 0,
                                        pattern: event.value,
                                        type: getPatternType(event.value),
                                    }],
                                }) as Promise<unknown>);
                            }
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await selectPanelType('Date');
        await selectPanelListOption('1930/08/05');
        await confirmPanel();
        const results = await Promise.all(commandResults);

        expect(results).toEqual([true]);
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({ pattern: 'yyyy/MM/dd' });
    });

    it('applies changed decimal places from the number panel through the real SetNumfmtCommand', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const commandResults: Array<Promise<unknown>> = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: '',
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => {
                            if (event.type === 'confirm') {
                                commandResults.push(currentTestBed!.commandService.executeCommand(SetNumfmtCommand.id, {
                                    values: [{
                                        row: 0,
                                        col: 0,
                                        pattern: event.value,
                                        type: getPatternType(event.value),
                                    }],
                                }) as Promise<unknown>);
                            }
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await selectPanelType('Number');
        const incrementDecimalButton = container.querySelector('[aria-label="increment"]') as HTMLElement;

        for (let i = 0; i < 2; i++) {
            await act(async () => {
                incrementDecimalButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                await Promise.resolve();
            });
        }

        await confirmPanel();
        const results = await Promise.all(commandResults);

        expect(results).toEqual([true]);
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({
            pattern: '#,##0.00_);(#,##0.00)',
        });
    });

    it('applies decreased decimal places from an existing number format through the real SetNumfmtCommand', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const commandResults: Array<Promise<unknown>> = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: '#,##0.00_);(#,##0.00)',
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => {
                            if (event.type === 'confirm') {
                                commandResults.push(currentTestBed!.commandService.executeCommand(SetNumfmtCommand.id, {
                                    values: [{
                                        row: 0,
                                        col: 0,
                                        pattern: event.value,
                                        type: getPatternType(event.value),
                                    }],
                                }) as Promise<unknown>);
                            }
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const decrementDecimalButton = container.querySelector('[aria-label="decrement"]') as HTMLElement;

        await act(async () => {
            decrementDecimalButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        await confirmPanel();
        const results = await Promise.all(commandResults);

        expect(results).toEqual([true]);
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({
            pattern: '#,##0.0_);(#,##0.0)',
        });
    });

    it('keeps the current date pattern when the selected date option is clicked again', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const commandResults: Array<Promise<unknown>> = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: 'yyyy-MM-dd',
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => {
                            if (event.type === 'confirm') {
                                commandResults.push(currentTestBed!.commandService.executeCommand(SetNumfmtCommand.id, {
                                    values: [{
                                        row: 0,
                                        col: 0,
                                        pattern: event.value,
                                        type: getPatternType(event.value),
                                    }],
                                }) as Promise<unknown>);
                            }
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await selectPanelListOption('1930-08-05');
        await confirmPanel();
        const results = await Promise.all(commandResults);

        expect(results).toEqual([true]);
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({ pattern: 'yyyy-MM-dd' });
    });

    it('refreshes the active panel state when the loaded format changes for the same cell', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const commandResults: Array<Promise<unknown>> = [];

        const renderPanel = async (defaultPattern: string) => {
            await act(async () => {
                root!.render(
                    <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                        <SheetNumfmtPanel
                            value={{
                                defaultValue: 1234.5,
                                defaultPattern,
                                row: 0,
                                col: 0,
                            }}
                            onChange={(event) => {
                                if (event.type === 'confirm') {
                                    commandResults.push(currentTestBed!.commandService.executeCommand(SetNumfmtCommand.id, {
                                        values: [{
                                            row: 0,
                                            col: 0,
                                            pattern: event.value,
                                            type: getPatternType(event.value),
                                        }],
                                    }) as Promise<unknown>);
                                }
                            }}
                        />
                    </RediContext.Provider>
                );
                await Promise.resolve();
            });
        };

        await renderPanel('yyyy-MM-dd');
        await renderPanel('#,##0.00_);(#,##0.00)');
        await confirmPanel();
        const results = await Promise.all(commandResults);

        expect(results).toEqual([true]);
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({
            pattern: '#,##0.00_);(#,##0.00)',
        });
    });

    it('applies a typed custom format through the real SetNumfmtCommand when confirmed', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const commandResults: Array<Promise<unknown>> = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: '',
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => {
                            if (event.type === 'confirm') {
                                commandResults.push(currentTestBed!.commandService.executeCommand(SetNumfmtCommand.id, {
                                    values: [{
                                        row: 0,
                                        col: 0,
                                        pattern: event.value,
                                        type: getPatternType(event.value),
                                    }],
                                }) as Promise<unknown>);
                            }
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await selectPanelType('Custom format');
        await changePanelInput('0.000 kg');
        await confirmPanel();
        const results = await Promise.all(commandResults);

        expect(results).toEqual([true]);
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({
            pattern: '0.000 kg',
        });
        expect(await currentTestBed.localStorageService.getItem<string[]>(CUSTOM_HISTORY_KEY)).toEqual(['0.000 kg']);
    });

    it('keeps the loaded currency symbol when decimal places are changed and confirmed', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const commandResults: Array<Promise<unknown>> = [];
        const currencySymbol = currencySymbols[3];
        const loadedCurrencyPattern = `"${currencySymbol}"#,##0.00_);"${currencySymbol}"#,##0.00`;
        const confirmedCurrencyPattern = `"${currencySymbol}"#,##0.0_);"${currencySymbol}"#,##0.0`;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: loadedCurrencyPattern,
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => {
                            if (event.type === 'confirm') {
                                commandResults.push(currentTestBed!.commandService.executeCommand(SetNumfmtCommand.id, {
                                    values: [{
                                        row: 0,
                                        col: 0,
                                        pattern: event.value,
                                        type: getPatternType(event.value),
                                    }],
                                }) as Promise<unknown>);
                            }
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const decrementDecimalButton = container.querySelector('[aria-label="decrement"]') as HTMLElement;

        await act(async () => {
            decrementDecimalButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        await confirmPanel();
        const results = await Promise.all(commandResults);

        expect(results).toEqual([true]);
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toEqual({
            pattern: confirmedCurrencyPattern,
        });
    });

    it('does not apply or save a typed custom format when cancelled', async () => {
        currentTestBed = createNumfmtViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const events: Array<{ type: 'change' | 'cancel' | 'confirm'; value: string }> = [];
        const commandResults: Array<Promise<unknown>> = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: '',
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => {
                            events.push(event);
                            if (event.type === 'confirm') {
                                commandResults.push(currentTestBed!.commandService.executeCommand(SetNumfmtCommand.id, {
                                    values: [{
                                        row: 0,
                                        col: 0,
                                        pattern: event.value,
                                        type: getPatternType(event.value),
                                    }],
                                }) as Promise<unknown>);
                            }
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await selectPanelType('Custom format');
        await changePanelInput('0.000 kg');
        await cancelPanel();
        const results = await Promise.all(commandResults);

        expect(results).toEqual([]);
        expect(events.at(-1)).toEqual({ type: 'cancel', value: '' });
        expect(currentTestBed.numfmtService.getValue(UNIT_ID, SUB_UNIT_ID, 0, 0)).toBeNull();
        expect(await currentTestBed.localStorageService.getItem<string[]>(CUSTOM_HISTORY_KEY)).toEqual([]);
    });

    it('records confirmed currency and accounting symbols in the user habit order', async () => {
        currentTestBed = createNumfmtViewTestBed();
        await currentTestBed.localStorageService.setItem(CURRENCY_HABIT_KEY, []);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const events: Array<{ type: 'change' | 'cancel' | 'confirm'; value: string }> = [];
        const currencySymbol = currencySymbols[7];
        const accountingSymbol = currencySymbols[8];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: `${currencySymbol}#,##0.00`,
                            row: 0,
                            col: 0,
                        }}
                        onChange={(event) => events.push(event)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await confirmPanel();
        await Promise.resolve();
        await Promise.resolve();

        const confirmedCurrencyPattern = events.at(-1)?.value ?? '';

        expect(getCurrencyType(confirmedCurrencyPattern)).toBe(currencySymbol);
        expect(await currentTestBed.localStorageService.getItem<string[]>(CURRENCY_HABIT_KEY)).toEqual([
            currencySymbol,
        ]);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <SheetNumfmtPanel
                        value={{
                            defaultValue: 1234.5,
                            defaultPattern: `_("${accountingSymbol}"* #,##0.00_)`,
                            row: 1,
                            col: 0,
                        }}
                        onChange={(event) => events.push(event)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await confirmPanel();
        await Promise.resolve();
        await Promise.resolve();

        const confirmedAccountingPattern = events.at(-1)?.value ?? '';

        expect(getCurrencyType(confirmedAccountingPattern)).toBe(accountingSymbol);
        expect(await currentTestBed.localStorageService.getItem<string[]>(CURRENCY_HABIT_KEY)).toEqual([
            accountingSymbol,
            currencySymbol,
        ]);
    });
});
