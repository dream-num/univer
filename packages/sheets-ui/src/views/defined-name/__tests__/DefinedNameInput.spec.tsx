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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import {
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DefinedNamesService,
    FunctionService,
    IDefinedNamesService,
    IFunctionService,
    ISuperTableService,
    LexerTreeBuilder,
    SuperTableService,
} from '@univerjs/engine-formula';
import { SCOPE_WORKBOOK_VALUE_DEFINED_NAME } from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { ComponentManager, ISidebarService, RediContext } from '@univerjs/ui';
import { act, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, RANGE_SELECTOR_COMPONENT_KEY } from '../../../common/keys';
import sheetsUiEnUS from '../../../locale/en-US';
import { DefinedNameInput } from '../DefinedNameInput';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'defined-name-input-unit';

class TestSidebarService {
    readonly sidebarOptions$ = new Subject();
    readonly scrollEvent$ = new Subject<Event>();
    private _container: HTMLElement = document.createElement('div');

    open() {
        return { dispose(): void {} };
    }

    close(): void {}

    get visible(): boolean {
        return false;
    }

    get options(): never {
        return undefined as never;
    }

    getContainer(): HTMLElement | undefined {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element ?? document.createElement('div');
    }

    get width(): number | undefined {
        return undefined;
    }

    setWidth(): void {}
}

function TestRangeSelector(props: { initialValue?: string; onChange?: (ranges: unknown[], text: string) => void }) {
    return (
        <input
            aria-label="defined-name-range"
            value={props.initialValue ?? ''}
            onChange={(event) => props.onChange?.([], event.target.value)}
        />
    );
}

const TestFormulaEditor = forwardRef((props: { initValue?: string; onChange?: (value: string) => void; onVerify?: (valid: boolean) => void }, ref) => {
    useImperativeHandle(ref, () => ({
        isClickOutSide: () => false,
    }));

    return (
        <input
            aria-label="defined-name-formula"
            value={props.initValue ?? ''}
            onChange={(event) => {
                props.onChange?.(event.target.value);
                props.onVerify?.(true);
            }}
        />
    );
});

TestFormulaEditor.displayName = 'TestFormulaEditor';

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'Defined Name Input',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {},
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                cellData: {},
            },
        },
    };
}

function createDefinedNameInputTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
    injector.add([ISuperTableService, { useClass: SuperTableService }]);
    injector.add([IFunctionService, { useClass: FunctionService }]);
    injector.add([LexerTreeBuilder, { useClass: LexerTreeBuilder }]);
    injector.add([ComponentManager, { useClass: ComponentManager }]);
    injector.add([ISidebarService, { useClass: TestSidebarService as never }]);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...sheetsUiEnUS } });
    localeService.setLocale(LocaleType.EN_US);
    const componentManager = injector.get(ComponentManager);
    componentManager.register(RANGE_SELECTOR_COMPONENT_KEY, TestRangeSelector);
    componentManager.register(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, TestFormulaEditor);

    return {
        univer,
        injector,
        workbook,
    };
}

function renderWithDependencies(element: ReactElement, injector: ReturnType<typeof createDefinedNameInputTestBed>['injector']) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return {
        container,
        root,
    };
}

function setInputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function queryByText(container: HTMLElement, text: string): HTMLElement | null {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        if (node.textContent === text) {
            return node.parentElement;
        }
        node = walker.nextNode();
    }

    return null;
}

function getByText(container: HTMLElement, text: string): HTMLElement {
    const element = queryByText(container, text);
    if (!element) {
        throw new Error(`Text not found: ${text}`);
    }

    return element;
}

function getInput(container: HTMLElement, selector: string): HTMLInputElement {
    const input = container.querySelector(selector);
    if (!(input instanceof HTMLInputElement)) {
        throw new TypeError(`Input not found: ${selector}`);
    }

    return input;
}

describe('DefinedNameInput', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentBed: ReturnType<typeof createDefinedNameInputTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentBed = undefined;
    });

    it('confirms edited name data with an absolute range and the selected scope', async () => {
        currentBed = createDefinedNameInputTestBed();
        let confirmed: IDefinedNamesServiceParam | undefined;
        const rendered = renderWithDependencies(
            <DefinedNameInput
                inputId="defined-name-input"
                state
                name=""
                formulaOrRefString="A1:B2"
                comment=""
                localSheetId="sheet2"
                confirm={(param) => {
                    confirmed = param;
                }}
            />,
            currentBed.injector
        );
        root = rendered.root;
        container = rendered.container;
        const currentContainer = rendered.container;

        await act(async () => {
            setInputText(getInput(currentContainer, 'input[placeholder="Please enter a name(No space allowed)"]'), 'RevenueRange');
            setInputText(getInput(currentContainer, 'input[aria-label="defined-name-range"]'), 'C3:D4');
            setInputText(getInput(currentContainer, 'input[placeholder="Please enter a comment"]'), 'quarterly revenue');
            getByText(currentContainer, 'Confirm').click();
            await Promise.resolve();
        });

        expect(confirmed).toEqual({
            id: '',
            name: 'RevenueRange',
            formulaOrRefString: 'Sheet1!$C$3:$D$4',
            comment: 'quarterly revenue',
            localSheetId: 'sheet2',
        });
    });

    it('keeps invalid names from confirming and reports the validation reason', async () => {
        currentBed = createDefinedNameInputTestBed();
        let confirmed: IDefinedNamesServiceParam | undefined;
        const rendered = renderWithDependencies(
            <DefinedNameInput
                inputId="defined-name-input"
                state
                name="A1"
                formulaOrRefString="B2:C3"
                comment=""
                localSheetId={SCOPE_WORKBOOK_VALUE_DEFINED_NAME}
                confirm={(param) => {
                    confirmed = param;
                }}
            />,
            currentBed.injector
        );
        root = rendered.root;
        container = rendered.container;
        const currentContainer = rendered.container;

        await act(async () => {
            getByText(currentContainer, 'Confirm').click();
            await Promise.resolve();
        });

        expect(confirmed).toBeUndefined();
        expect(getByText(currentContainer, 'The name is invalid')).toBeTruthy();
    });
});
