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
import type { Editor } from '@univerjs/docs-ui';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import type { IShortcutItem } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    CommandType,
    ConfigService,
    ICommandService,
    IConfigService,
    Injector,
    IUniverInstanceService,
    LocaleService,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { FunctionType, sequenceNodeType } from '@univerjs/engine-formula';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { IShortcutService, ISidebarService, KeyCode, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SearchFunction } from '../SearchFunction';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const sumInfo: IFunctionInfo = {
    functionName: 'SUM',
    functionType: FunctionType.Math,
    description: 'Adds selected values.',
    abstract: 'Adds values.',
    functionParameter: [],
};

const subtotalInfo: IFunctionInfo = {
    functionName: 'SUBTOTAL',
    functionType: FunctionType.Math,
    description: 'Returns a subtotal in a list.',
    abstract: 'Returns subtotal.',
    functionParameter: [],
};

class TestDescriptionService {
    getSearchListByNameFirstLetter(searchText: string) {
        return [sumInfo, subtotalInfo]
            .filter((info) => info.functionName.startsWith(searchText.toUpperCase()))
            .map((info) => ({
                name: info.functionName,
                desc: info.description,
                functionType: info.functionType,
            }));
    }
}

class TestCommandService {
    readonly registered: ICommandInfo[] = [];

    async executeCommand(id?: string, params?: unknown): Promise<boolean> {
        const command = this.registered.find((item) => item.id === id);
        const handler = (command as { handler?: (_accessor: unknown, params?: unknown) => boolean | Promise<boolean> | void } | undefined)?.handler;
        if (!handler) {
            return true;
        }

        const result = await handler(undefined, params);
        return result !== false;
    }

    registerCommand(command: ICommandInfo): IDisposable {
        this.registered.push(command);
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
        return new Map(this.registered.map((command) => [command.id, command]));
    }

    getCommand(): ICommandInfo {
        return { id: 'test.command', type: CommandType.OPERATION };
    }
}

class TestShortcutService {
    readonly shortcutChanged$ = new Subject<void>();
    readonly shortcuts: IShortcutItem[] = [];

    forceEscape(): IDisposable {
        return { dispose: () => {} };
    }

    forceDisable(): IDisposable {
        return { dispose: () => {} };
    }

    dispatch(): IShortcutItem<object> | undefined {
        return undefined;
    }

    registerShortcut(shortcut: IShortcutItem): IDisposable {
        this.shortcuts.push(shortcut);
        return { dispose: () => {} };
    }

    getShortcutDisplay(): string | null {
        return null;
    }

    getShortcutDisplayOfCommand(): string | null {
        return null;
    }

    getAllShortcuts(): IShortcutItem[] {
        return this.shortcuts;
    }
}

class TestSidebarService {
    readonly scrollEvent$ = new Subject<Event>();
}

class TestUniverInstanceService {
    readonly unitAdded$ = new Subject();
}

class TestEditorService {
    getEditor(): unknown {
        return SearchFunctionState.editor;
    }
}

class TestResizeObserver {
    observe(): void {}
    disconnect(): void {}
    unobserve(): void {}
}

class SearchFunctionState {
    static editor: unknown;
    static selected: Array<{ text: string; offset: number }> = [];
    static focused = 0;
    static closed = 0;

    static reset(): void {
        this.editor = undefined;
        this.selected = [];
        this.focused = 0;
        this.closed = 0;
    }
}

function createEditor(): Editor {
    const input$ = new Subject<void>();
    const selectionRanges = [{ startOffset: 2, endOffset: 2, collapsed: true }];
    return {
        input$,
        getEditorId: () => 'formula-editor-test',
        getSelectionRanges: () => selectionRanges,
        focus: () => {
            SearchFunctionState.focused += 1;
        },
        getBoundingClientRect: () => ({ left: 10, top: 20, right: 130, bottom: 44 }),
        getDocumentData: () => ({ documentStyle: { marginTop: 0, marginBottom: 0 } }),
        getSkeleton: () => ({
            getSkeletonData: () => ({
                pages: [{ height: 24 }],
            }),
        }),
    } as unknown as Editor;
}

function createSearchFunctionTestBed() {
    const injector = new Injector();
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([LocaleService, { useClass: LocaleService }]);
    injector.add([IDescriptionService, { useClass: TestDescriptionService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    injector.add([ISidebarService, { useClass: TestSidebarService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([IEditorService, { useClass: TestEditorService as never }]);

    const editor = createEditor();
    SearchFunctionState.editor = editor;

    return { injector, editor, commandService: injector.get(ICommandService) as unknown as TestCommandService };
}

async function waitForSearchList(editor: Editor): Promise<void> {
    await act(async () => {
        (editor.input$ as unknown as Subject<void>).next();
        await new Promise((resolve) => setTimeout(resolve, 350));
    });
}

async function runFormulaSearchKeyboardCommand(commandService: TestCommandService, editor: Editor, keyCode: KeyCode): Promise<void> {
    await act(async () => {
        await commandService.executeCommand(`sheet.formula-embedding-editor.search_function.${editor.getEditorId()}`, {
            eventType: DeviceInputEventType.Keyboard,
            keyCode,
        });
        await Promise.resolve();
    });
}

describe('SearchFunction', () => {
    let container: HTMLDivElement;
    let popupRoot: HTMLDivElement;
    let root: Root;
    let resizeObserver: typeof ResizeObserver | undefined;
    let scrollToDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        SearchFunctionState.reset();
        resizeObserver = globalThis.ResizeObserver;
        globalThis.ResizeObserver = TestResizeObserver as typeof ResizeObserver;
        scrollToDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');
        Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
            configurable: true,
            value() {},
        });
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
        if (scrollToDescriptor) {
            Object.defineProperty(HTMLElement.prototype, 'scrollTo', scrollToDescriptor);
        } else {
            delete (HTMLElement.prototype as { scrollTo?: unknown }).scrollTo;
        }
    });

    it('replaces the typed function token and refocuses the editor when a search result is selected', async () => {
        const { injector, editor } = createSearchFunctionTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SearchFunction
                        isFocus
                        editor={editor}
                        sequenceNodes={[{ nodeType: sequenceNodeType.FUNCTION, token: 'SU' } as never]}
                        onSelect={(result) => SearchFunctionState.selected.push(result)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await waitForSearchList(editor);

        const sumItem = Array.from(document.body.querySelectorAll('li'))
            .find((node) => node.textContent?.includes('SUM')) as HTMLElement | undefined;
        expect(sumItem).toBeDefined();

        await act(async () => {
            sumItem!.click();
            await Promise.resolve();
        });

        expect(SearchFunctionState.selected).toEqual([{ text: 'SUM(', offset: -2 }]);
        expect(SearchFunctionState.focused).toBe(1);
        expect(document.body.textContent).not.toContain('Adds selected values.');
    });

    it('accepts the highlighted formula suggestion from the registered keyboard command', async () => {
        const { injector, editor, commandService } = createSearchFunctionTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SearchFunction
                        isFocus
                        editor={editor}
                        sequenceNodes={[{ nodeType: sequenceNodeType.FUNCTION, token: 'SU' } as never]}
                        onSelect={(result) => SearchFunctionState.selected.push(result)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await waitForSearchList(editor);
        expect(document.body.textContent).toContain('SUM');

        await runFormulaSearchKeyboardCommand(commandService, editor, KeyCode.ENTER);

        expect(SearchFunctionState.selected).toEqual([{ text: 'SUM(', offset: -2 }]);
        expect(document.body.textContent).not.toContain('Adds selected values.');
    });

    it('accepts the next formula suggestion after keyboard navigation moves the highlight', async () => {
        const { injector, editor, commandService } = createSearchFunctionTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SearchFunction
                        isFocus
                        editor={editor}
                        sequenceNodes={[{ nodeType: sequenceNodeType.FUNCTION, token: 'SU' } as never]}
                        onSelect={(result) => SearchFunctionState.selected.push(result)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await waitForSearchList(editor);
        expect(document.body.textContent).toContain('SUM');
        expect(document.body.textContent).toContain('SUBTOTAL');

        await runFormulaSearchKeyboardCommand(commandService, editor, KeyCode.ARROW_DOWN);
        await runFormulaSearchKeyboardCommand(commandService, editor, KeyCode.ENTER);

        expect(SearchFunctionState.selected).toEqual([{ text: 'SUBTOTAL(', offset: -7 }]);
        expect(document.body.textContent).not.toContain('Returns a subtotal in a list.');
    });

    it('accepts the highlighted formula suggestion when tab completes the function token', async () => {
        const { injector, editor, commandService } = createSearchFunctionTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SearchFunction
                        isFocus
                        editor={editor}
                        sequenceNodes={[{ nodeType: sequenceNodeType.FUNCTION, token: 'SU' } as never]}
                        onSelect={(result) => SearchFunctionState.selected.push(result)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await waitForSearchList(editor);
        expect(document.body.textContent).toContain('SUM');

        await runFormulaSearchKeyboardCommand(commandService, editor, KeyCode.TAB);

        expect(SearchFunctionState.selected).toEqual([{ text: 'SUM(', offset: -2 }]);
        expect(document.body.textContent).not.toContain('Adds selected values.');
    });

    it('closes formula suggestions without selecting a function when escape is pressed', async () => {
        const { injector, editor, commandService } = createSearchFunctionTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <SearchFunction
                        isFocus
                        editor={editor}
                        sequenceNodes={[{ nodeType: sequenceNodeType.FUNCTION, token: 'SU' } as never]}
                        onSelect={(result) => SearchFunctionState.selected.push(result)}
                        onClose={() => {
                            SearchFunctionState.closed += 1;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await waitForSearchList(editor);
        expect(document.body.textContent).toContain('SUM');

        await runFormulaSearchKeyboardCommand(commandService, editor, KeyCode.ESC);

        expect(SearchFunctionState.closed).toBe(1);
        expect(SearchFunctionState.selected).toEqual([]);
        expect(document.body.textContent).not.toContain('SUM');
    });
});
