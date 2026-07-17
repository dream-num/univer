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

import type { ICommandInfo, IDisposable } from '@univerjs/core';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import type { ISearchItem } from '@univerjs/sheets-formula';
import type { Root } from 'react-dom/client';
import {
    CommandType,
    ConfigService,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IConfigService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    UniverInstanceType,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { FunctionType } from '@univerjs/engine-formula';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { ISidebarService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MoreFunctions } from '../MoreFunctions';
import { SelectFunction } from '../select-function/SelectFunction';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const sumInfo: IFunctionInfo = {
    functionName: 'SUM',
    functionType: FunctionType.Math,
    description: 'Adds values together.',
    abstract: 'Adds values.',
    functionParameter: [
        {
            name: 'number1',
            detail: 'First value.',
            example: 'A1',
            require: 1,
            repeat: 1,
        },
    ],
};

const averageInfo: IFunctionInfo = {
    functionName: 'AVERAGE',
    functionType: FunctionType.Statistical,
    description: 'Returns the average value.',
    abstract: 'Average value.',
    functionParameter: [
        {
            name: 'value1',
            detail: 'First value.',
            example: 'A1:A3',
            require: 1,
            repeat: 1,
        },
    ],
};

const piInfo: IFunctionInfo = {
    functionName: 'PI',
    functionType: FunctionType.Math,
    description: 'Returns pi.',
    abstract: 'Pi.',
    functionParameter: [],
};

class TestDescriptionService {
    private readonly _items = [sumInfo, averageInfo, piInfo];

    getDescriptions() {
        return new Map(this._items.map((item) => [item.functionName, item]));
    }

    hasFunction(searchText: string) {
        return this._items.some((item) => item.functionName === searchText.toUpperCase());
    }

    getFunctionInfo(searchText: string) {
        return this._items.find((item) => item.functionName === searchText.toUpperCase());
    }

    getSearchListByName(searchText: string): ISearchItem[] {
        const normalized = searchText.toUpperCase();
        return this._items
            .filter((item) => item.functionName.includes(normalized))
            .map((item) => ({ name: item.functionName, desc: item.description }));
    }

    getSearchListByNameFirstLetter(searchText: string) {
        return this.getSearchListByName(searchText).map((item) => ({
            ...item,
            functionType: this.getFunctionInfo(item.name)!.functionType,
        }));
    }

    getSearchListByType(type: number): ISearchItem[] {
        return this._items
            .filter((item) => type === -1 || item.functionType === type)
            .map((item) => ({ name: item.functionName, desc: item.description }));
    }

    registerDescriptions(): IDisposable {
        return { dispose: () => {} };
    }

    unregisterDescriptions(): void {}

    hasDescription(name: string) {
        return this.hasFunction(name);
    }

    hasDefinedNameDescription() {
        return false;
    }

    isFormulaDefinedName() {
        return false;
    }
}

class TestSidebarService {
    readonly sidebarOptions$ = new Subject<unknown>();
    readonly scrollEvent$ = new Subject<Event>();
    visible = false;
    options = {};
    width = undefined;

    open(): IDisposable {
        this.visible = true;
        return { dispose: () => this.close() };
    }

    close(): void {
        this.visible = false;
    }

    getContainer(): HTMLElement | undefined {
        return undefined;
    }

    setContainer(): void {}

    setWidth(value: number): void {
        this.width = value as never;
    }
}

class TestCommandService {
    readonly executed: Array<{ id: string; params?: unknown }> = [];

    executeCommand(id: string, params?: unknown): Promise<boolean> {
        this.executed.push({ id, params });
        return Promise.resolve(true);
    }

    registerCommand(): IDisposable {
        return { dispose: () => {} };
    }

    registerMultipleCommand(): IDisposable {
        return { dispose: () => {} };
    }

    beforeCommandExecuted() {
        return { dispose: () => {} };
    }

    onCommandExecuted() {
        return { dispose: () => {} };
    }

    syncExecuteCommand(): boolean {
        return true;
    }

    setCommandExecutedListener(): void {}

    getCommands(): Map<string, ICommandInfo> {
        return new Map();
    }

    getCommand(): ICommandInfo {
        return { id: 'test.command', type: CommandType.OPERATION };
    }
}

class TestEditorService {
    readonly replaced = new Map<string, Array<{ text: string; cover?: boolean }>>();

    getEditor(id: string) {
        return {
            replaceText: (text: string, cover?: boolean) => {
                const list = this.replaced.get(id) ?? [];
                list.push({ text, cover });
                this.replaced.set(id, list);
            },
        };
    }
}

class TestEditorBridgeService {}

class TestUniverInstanceService {
    private readonly _workbook = {
        getUnitId: () => 'formula-book',
        getActiveSheet: () => ({
            getSheetId: () => 'sheet-1',
        }),
        getSheetBySheetId: () => ({
            getSheetId: () => 'sheet-1',
        }),
    };

    readonly unitAdded$ = new Subject();
    readonly unitDisposed$ = new Subject();
    readonly focused$ = new BehaviorSubject<string | null>(null);

    getTypeOfUnitAdded$() {
        return this.unitAdded$.asObservable();
    }

    getTypeOfUnitDisposed$() {
        return this.unitDisposed$.asObservable();
    }

    getCurrentUnitOfType(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this._workbook : null;
    }

    getCurrentTypeOfUnit$(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? of(this._workbook) : of(null);
    }

    getUnit() {
        return this._workbook;
    }

    getAllUnitsForType() {
        return [this._workbook];
    }

    focusUnit(): void {}

    getFocusedUnit() {
        return null;
    }

    setCurrentUnitForType(): void {}

    createUnit() {
        return this._workbook;
    }

    disposeUnit() {
        return true;
    }

    registerCtorForType(): IDisposable {
        return { dispose: () => {} };
    }

    changeDoc(): void {}

    getUnitType() {
        return UniverInstanceType.UNIVER_SHEET;
    }

    getUniverSheetInstance() {
        return this._workbook;
    }
}

class SelectionState {
    static values: Array<IFunctionInfo | null> = [];

    static reset(): void {
        this.values = [];
    }
}

function createFormulaViewTestBed() {
    const injector = new Injector();

    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([LocaleService, { useClass: LocaleService }]);
    injector.add([IDescriptionService, { useClass: TestDescriptionService as never }]);
    injector.add([ISidebarService, { useClass: TestSidebarService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IEditorService, { useClass: TestEditorService as never }]);
    injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);

    injector.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            'sheets-formula-ui': {
                moreFunctions: {
                    allFunctions: 'All functions',
                    searchFunctionPlaceholder: 'Search functions',
                    confirm: 'Confirm',
                    next: 'Next',
                    prev: 'Previous',
                    syntax: 'Syntax',
                },
                prompt: {
                    required: 'Required.',
                    optional: 'Optional.',
                    helpExample: 'Example',
                },
                functionType: {
                    math: 'Math',
                    statistical: 'Statistical',
                },
            },
        },
    });

    return {
        injector,
        commandService: injector.get(ICommandService) as unknown as TestCommandService,
        editorService: injector.get(IEditorService) as unknown as TestEditorService,
        sidebarService: injector.get(ISidebarService) as unknown as TestSidebarService,
    };
}

function renderWithInjector(root: Root, injector: Injector, element: React.ReactNode) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });
}

function writeInput(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function pressKey(element: HTMLElement, key: string) {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

async function chooseFunctionType(label: string) {
    const select = document.body.querySelector('[data-u-comp="select"]') as HTMLElement | null;
    expect(select).toBeDefined();

    await act(async () => {
        select!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
        await Promise.resolve();
    });

    const item = Array.from(document.body.querySelectorAll('[data-slot="dropdown-menu-radio-item"]'))
        .find((node) => node.textContent === label) as HTMLElement | undefined;
    expect(item).toBeDefined();

    await act(async () => {
        item!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe('formula function picker views', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        SelectionState.reset();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('renders selected function details as structured sections', async () => {
        const { injector } = createFormulaViewTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SelectFunction onChange={(value) => SelectionState.values.push(value)} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const details = container.querySelector('[data-u-comp="formula-function-details"]');
        expect(details).not.toBeNull();
        expect(details?.querySelector('[data-u-comp="formula-function-syntax"]')?.textContent).toBe('SUM(number1,...)');
        expect(details?.querySelector('[data-u-comp="formula-function-example"]')?.textContent).toBe('SUM(A1)');

        const parameters = details?.querySelectorAll('[data-u-comp="formula-function-parameter"]');
        expect(parameters).toHaveLength(1);
        expect(parameters?.[0].textContent).toContain('number1Required.First value.');
    });

    it('omits the parameter list when the selected function has no parameters', async () => {
        const { injector } = createFormulaViewTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SelectFunction onChange={(value) => SelectionState.values.push(value)} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const input = container.querySelector('input') as HTMLInputElement;
        await act(async () => {
            writeInput(input, 'PI');
            await Promise.resolve();
        });

        const item = Array.from(container.querySelectorAll('li'))
            .find((node) => node.textContent === 'PI') as HTMLElement | undefined;
        expect(item).toBeDefined();

        await act(async () => {
            item!.click();
            await Promise.resolve();
        });

        const details = container.querySelector('[data-u-comp="formula-function-details"]');
        expect(details?.children).toHaveLength(2);
    });

    it('filters functions by typed text and reports the selected function info', async () => {
        const { injector } = createFormulaViewTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SelectFunction onChange={(value) => SelectionState.values.push(value)} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const input = container.querySelector('input') as HTMLInputElement;
        expect(input).toBeDefined();

        await act(async () => {
            writeInput(input, 'AVE');
            await Promise.resolve();
        });

        expect(container.textContent).toContain('AVERAGE');
        expect(container.textContent).not.toContain('SUM');

        const item = Array.from(container.querySelectorAll('li'))
            .find((node) => node.textContent?.includes('AVERAGE')) as HTMLElement | undefined;
        expect(item).toBeDefined();

        await act(async () => {
            item!.click();
            await Promise.resolve();
        });

        expect(SelectionState.values.at(-1)?.functionName).toBe('AVERAGE');
        expect(container.textContent).toContain('Returns the average value.');
        expect(container.textContent).toContain('AVERAGE(A1:A3)');
    });

    it('selects the highlighted function from the keyboard list and updates the preview', async () => {
        const { injector } = createFormulaViewTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SelectFunction onChange={(value) => SelectionState.values.push(value)} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const input = container.querySelector('input') as HTMLInputElement;
        expect(SelectionState.values.at(-1)?.functionName).toBe('SUM');

        await act(async () => {
            pressKey(input, 'ArrowDown');
            await Promise.resolve();
        });

        await act(async () => {
            pressKey(input, 'Enter');
            await Promise.resolve();
        });

        expect(SelectionState.values.at(-1)?.functionName).toBe('AVERAGE');
        expect(container.textContent).toContain('Returns the average value.');
        expect(container.textContent).toContain('AVERAGE(A1:A3)');
        expect(container.textContent).not.toContain('Adds values together.');
    });

    it('inserts the first function from the selected category instead of a stale previous selection', async () => {
        const { commandService, editorService, injector } = createFormulaViewTestBed();

        await act(async () => {
            renderWithInjector(root, injector, <MoreFunctions />);
            await Promise.resolve();
        });

        expect(container.textContent).toContain('SUM');
        expect(container.textContent).toContain('Adds values together.');

        await chooseFunctionType('Statistical');

        expect(container.textContent).toContain('AVERAGE');
        expect(container.textContent).toContain('Returns the average value.');
        expect(container.textContent).not.toContain('SUM');
        expect(container.textContent).not.toContain('Adds values together.');

        const confirmButton = Array.from(container.querySelectorAll('button'))
            .find((node) => node.textContent === 'Confirm') as HTMLButtonElement | undefined;
        expect(confirmButton).toBeDefined();
        expect(confirmButton!.disabled).toBe(false);

        await act(async () => {
            confirmButton!.click();
            await Promise.resolve();
        });

        expect(commandService.executed).toEqual([
            {
                id: 'sheet.operation.set-cell-edit-visible',
                params: expect.objectContaining({
                    visible: true,
                    unitId: 'formula-book',
                }),
            },
        ]);
        expect(editorService.replaced.get(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)).toEqual([{ text: '=AVERAGE(', cover: undefined }]);
        expect(editorService.replaced.get(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)).toEqual([{ text: '=AVERAGE(', cover: false }]);
    });

    it('inserts the selected function call into both sheet editors after confirmation', async () => {
        const { commandService, editorService, injector } = createFormulaViewTestBed();

        await act(async () => {
            renderWithInjector(root, injector, <MoreFunctions />);
            await Promise.resolve();
        });

        const averageItem = Array.from(container.querySelectorAll('li'))
            .find((node) => node.textContent?.includes('AVERAGE')) as HTMLElement | undefined;
        expect(averageItem).toBeDefined();

        await act(async () => {
            averageItem!.click();
            await Promise.resolve();
        });

        const confirmButton = Array.from(container.querySelectorAll('button'))
            .find((node) => node.textContent === 'Confirm') as HTMLButtonElement | undefined;
        expect(confirmButton).toBeDefined();
        expect(confirmButton!.disabled).toBe(false);

        await act(async () => {
            confirmButton!.click();
            await Promise.resolve();
        });

        expect(commandService.executed).toEqual([
            {
                id: 'sheet.operation.set-cell-edit-visible',
                params: expect.objectContaining({
                    visible: true,
                    unitId: 'formula-book',
                }),
            },
        ]);
        expect(editorService.replaced.get(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)).toEqual([{ text: '=AVERAGE(', cover: undefined }]);
        expect(editorService.replaced.get(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)).toEqual([{ text: '=AVERAGE(', cover: false }]);
    });

    it('does not insert a previously selected function after search removes all results', async () => {
        const { commandService, editorService, injector } = createFormulaViewTestBed();

        await act(async () => {
            renderWithInjector(root, injector, <MoreFunctions />);
            await Promise.resolve();
        });

        const averageItem = Array.from(container.querySelectorAll('li'))
            .find((node) => node.textContent?.includes('AVERAGE')) as HTMLElement | undefined;
        expect(averageItem).toBeDefined();

        await act(async () => {
            averageItem!.click();
            await Promise.resolve();
        });

        const input = container.querySelector('input') as HTMLInputElement;
        expect(input).toBeDefined();

        await act(async () => {
            writeInput(input, 'NOT_A_FUNCTION');
            await Promise.resolve();
        });

        const confirmButton = Array.from(container.querySelectorAll('button'))
            .find((node) => node.textContent === 'Confirm') as HTMLButtonElement | undefined;
        expect(confirmButton).toBeDefined();
        expect(confirmButton!.disabled).toBe(true);

        await act(async () => {
            confirmButton!.click();
            await Promise.resolve();
        });

        expect(commandService.executed).toEqual([]);
        expect(editorService.replaced.size).toBe(0);
    });

    it('resets search and selected function when the function sidebar is reopened', async () => {
        const { commandService, editorService, injector, sidebarService } = createFormulaViewTestBed();

        await act(async () => {
            renderWithInjector(root, injector, <MoreFunctions />);
            await Promise.resolve();
        });

        const averageItem = Array.from(container.querySelectorAll('li'))
            .find((node) => node.textContent?.includes('AVERAGE')) as HTMLElement | undefined;
        expect(averageItem).toBeDefined();

        await act(async () => {
            averageItem!.click();
            await Promise.resolve();
        });

        const input = container.querySelector('input') as HTMLInputElement;
        expect(input).toBeDefined();

        await act(async () => {
            writeInput(input, 'AVE');
            await Promise.resolve();
        });

        expect(container.textContent).toContain('AVERAGE');
        expect(container.textContent).not.toContain('SUM');

        await act(async () => {
            sidebarService.sidebarOptions$.next({ visible: true });
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(input.value).toBe('');
        expect(container.textContent).toContain('SUM');
        expect(container.textContent).toContain('AVERAGE');
        expect(container.textContent).toContain('Adds values together.');
        expect(container.textContent).not.toContain('Returns the average value.');

        const confirmButton = Array.from(container.querySelectorAll('button'))
            .find((node) => node.textContent === 'Confirm') as HTMLButtonElement | undefined;
        expect(confirmButton).toBeDefined();
        expect(confirmButton!.disabled).toBe(false);

        await act(async () => {
            confirmButton!.click();
            await Promise.resolve();
        });

        expect(commandService.executed).toEqual([
            {
                id: 'sheet.operation.set-cell-edit-visible',
                params: expect.objectContaining({
                    visible: true,
                    unitId: 'formula-book',
                }),
            },
        ]);
        expect(editorService.replaced.get(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)).toEqual([{ text: '=SUM(', cover: undefined }]);
        expect(editorService.replaced.get(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)).toEqual([{ text: '=SUM(', cover: false }]);
    });
});
