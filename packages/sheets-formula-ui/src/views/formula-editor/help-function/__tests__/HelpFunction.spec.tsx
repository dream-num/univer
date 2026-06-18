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

import type { Editor } from '@univerjs/docs-ui';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import type { Root } from 'react-dom/client';
import {
    ConfigService,
    ContextService,
    IConfigService,
    IContextService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { FunctionType, LexerTreeBuilder } from '@univerjs/engine-formula';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { ISidebarService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FormulaPromptService, IFormulaPromptService } from '../../../../services/prompt.service';
import { HelpFunction } from '../HelpFunction';

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
            repeat: 0,
        },
        {
            name: 'number2',
            detail: 'Additional values.',
            example: 'B1',
            require: 0,
            repeat: 1,
        },
    ],
};

class HelpDescriptionService {
    getFunctionInfo(searchText: string) {
        return searchText.toUpperCase() === sumInfo.functionName ? sumInfo : undefined;
    }

    hasDefinedNameDescription() {
        return false;
    }
}

class HelpEditorBridgeService {
    readonly helpFunctionVisible$ = new BehaviorSubject(true);
}

class HelpEditorService {
    getEditor(): unknown {
        return HelpState.editor;
    }
}

class HelpSidebarService {
    readonly scrollEvent$ = new Subject<Event>();
}

class HelpUniverInstanceService {
    readonly unitAdded$ = new Subject<void>();
}

class HelpResizeObserver {
    observe(): void {}
    disconnect(): void {}
    unobserve(): void {}
}

class HelpState {
    static editor: Editor;
    static switched: number[] = [];
    static closed = 0;

    static reset(): void {
        this.switched = [];
        this.closed = 0;
    }
}

function createEditor(): Editor {
    const selectionChange$ = new Subject<{ textRanges: Array<{ startOffset: number; endOffset: number; collapsed: boolean }> }>();

    return {
        selectionChange$,
        getEditorId: () => 'help-function-editor',
        getBoundingClientRect: () => ({ left: 10, top: 20, right: 180, bottom: 44 }),
        getDocumentData: () => ({ documentStyle: { marginTop: 0, marginBottom: 0 } }),
        getSkeleton: () => ({
            getSkeletonData: () => ({
                pages: [{ height: 24 }],
            }),
        }),
    } as unknown as Editor;
}

function createHelpFunctionTestBed() {
    const injector = new Injector();

    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([LocaleService, { useClass: LocaleService }]);
    injector.add([LexerTreeBuilder, { useClass: LexerTreeBuilder }]);
    injector.add([IFormulaPromptService, { useClass: FormulaPromptService }]);
    injector.add([IDescriptionService, { useClass: HelpDescriptionService as never }]);
    injector.add([IEditorBridgeService, { useClass: HelpEditorBridgeService as never }]);
    injector.add([IEditorService, { useClass: HelpEditorService as never }]);
    injector.add([ISidebarService, { useClass: HelpSidebarService as never }]);
    injector.add([IUniverInstanceService, { useClass: HelpUniverInstanceService as never }]);

    injector.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            'sheets-formula-ui': {
                prompt: {
                    required: 'Required.',
                    optional: 'Optional.',
                    helpExample: 'Example',
                    helpAbstract: 'Summary',
                },
            },
        },
    });

    const editor = createEditor();
    HelpState.editor = editor;

    return {
        injector,
        editor,
        editorBridgeService: injector.get(IEditorBridgeService) as unknown as HelpEditorBridgeService,
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

async function showHelpForSum(editor: Editor) {
    await act(async () => {
        (editor.selectionChange$ as unknown as Subject<{ textRanges: Array<{ startOffset: number; endOffset: number; collapsed: boolean }> }>).next({
            textRanges: [{ startOffset: 4, endOffset: 4, collapsed: true }],
        });
        await new Promise((resolve) => setTimeout(resolve, 80));
    });
}

function getHelpControls(): HTMLElement[] {
    return Array.from(document.body.querySelectorAll('div'))
        .filter((node) => node.className.includes('univer-size-6'));
}

function getHelpControl(index: number): HTMLElement {
    const control = getHelpControls()[index];
    if (!control) {
        throw new TypeError(`Help control ${index} was not rendered`);
    }

    return control;
}

function getTextElement(text: string, classNamePart?: string): HTMLElement {
    const element = Array.from(document.body.querySelectorAll('div,span'))
        .filter((node) => node.textContent === text)
        .filter((node) => !classNamePart || node.className.includes(classNamePart))
        .at(-1);

    if (!(element instanceof HTMLElement)) {
        throw new TypeError(`Element with text ${text} was not rendered`);
    }

    return element;
}

describe('HelpFunction', () => {
    let container: HTMLDivElement;
    let popupRoot: HTMLDivElement;
    let root: Root;
    let resizeObserver: typeof ResizeObserver | undefined;

    beforeEach(() => {
        HelpState.reset();
        resizeObserver = globalThis.ResizeObserver;
        globalThis.ResizeObserver = HelpResizeObserver as typeof ResizeObserver;
        container = document.createElement('div');
        popupRoot = document.createElement('div');
        popupRoot.id = 'univer-popup-portal';
        document.body.appendChild(container);
        document.body.appendChild(popupRoot);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        popupRoot.remove();
        if (resizeObserver) {
            globalThis.ResizeObserver = resizeObserver;
        } else {
            delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
        }
    });

    it('expands the active function help and reports parameter switches', async () => {
        const { injector, editor } = createHelpFunctionTestBed();

        renderWithInjector(
            root,
            injector, (
                <HelpFunction
                    isFocus
                    editor={editor}
                    formulaText="=SUM("
                    onParamsSwitch={(index) => HelpState.switched.push(index)}
                />
            ));

        await showHelpForSum(editor);

        expect(document.body.textContent).toContain('SUM(number1,[number2,...])');

        await act(async () => {
            getHelpControl(0).click();
            await Promise.resolve();
        });

        expect(document.body.textContent).toContain('SUM(A1,B1)');
        expect(document.body.textContent).toContain('Adds values together.');
        expect(document.body.textContent).toContain('Required. First value.');
        expect(document.body.textContent).toContain('Optional. Additional values.');

        await act(async () => {
            getTextElement('[number2,...]').click();
            await Promise.resolve();
        });

        expect(HelpState.switched).toEqual([1]);
    });

    it('hides the help card after close and restores it from the compact tip', async () => {
        const { editor, editorBridgeService, injector } = createHelpFunctionTestBed();

        renderWithInjector(
            root,
            injector, (
                <HelpFunction
                    isFocus
                    editor={editor}
                    formulaText="=SUM("
                    onClose={() => {
                        HelpState.closed += 1;
                    }}
                />
            ));

        await showHelpForSum(editor);

        expect(document.body.textContent).toContain('SUM(number1,[number2,...])');

        await act(async () => {
            getHelpControl(1).click();
            await Promise.resolve();
        });

        expect(HelpState.closed).toBe(1);
        expect(editorBridgeService.helpFunctionVisible$.getValue()).toBe(false);
        expect(document.body.textContent).not.toContain('SUM(number1,[number2,...])');
        expect(document.body.textContent).toContain('?');

        await act(async () => {
            getTextElement('?', 'univer-cursor-pointer').click();
            await Promise.resolve();
        });

        expect(editorBridgeService.helpFunctionVisible$.getValue()).toBe(true);
        expect(document.body.textContent).toContain('SUM(number1,[number2,...])');
    });

    it('keeps the prior hidden preference until the compact tip restores help', async () => {
        const { editor, editorBridgeService, injector } = createHelpFunctionTestBed();

        editorBridgeService.helpFunctionVisible$.next(false);

        renderWithInjector(
            root,
            injector, (
                <HelpFunction
                    isFocus
                    editor={editor}
                    formulaText="=SUM("
                />
            ));

        await showHelpForSum(editor);

        expect(editorBridgeService.helpFunctionVisible$.getValue()).toBe(false);
        expect(document.body.textContent).not.toContain('SUM(number1,[number2,...])');
        expect(document.body.textContent).toContain('?');

        await act(async () => {
            getTextElement('?', 'univer-cursor-pointer').click();
            await Promise.resolve();
        });

        expect(editorBridgeService.helpFunctionVisible$.getValue()).toBe(true);
        expect(document.body.textContent).toContain('SUM(number1,[number2,...])');
    });
});
