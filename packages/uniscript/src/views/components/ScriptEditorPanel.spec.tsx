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

import type { IDisposable } from '@univerjs/core';
import type { IMessageProps } from '@univerjs/design';
import type { IShortcutItem } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    ConfigService,
    IConfigService,
    Injector,
    LocaleService,
    LocaleType,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IMessageService, IShortcutService, RediContext } from '@univerjs/ui';
import { editor as monacoEditor } from 'monaco-editor';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../locale/en-US';
import { ScriptEditorService } from '../../services/script-editor.service';
import { IUniscriptExecutionService } from '../../services/script-execution.service';
import { ScriptEditorPanel } from './ScriptEditorPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type EditorListener = () => void;

class TestEditorModel {
    constructor(private _value = '') {}

    setValue(value: string) {
        this._value = value;
    }

    getValue() {
        return this._value;
    }
}

class TestCodeEditor {
    private readonly _model = new TestEditorModel();
    private readonly _focusListeners: EditorListener[] = [];
    private readonly _blurListeners: EditorListener[] = [];
    readonly layouts: Array<{ width: number; height: number }> = [];

    setValue(value: string) {
        this._model.setValue(value);
    }

    getModel() {
        return this._model;
    }

    layout(size: { width: number; height: number }) {
        this.layouts.push(size);
    }

    onDidFocusEditorWidget(listener: EditorListener): IDisposable {
        this._focusListeners.push(listener);
        return toDisposable(() => {
            const index = this._focusListeners.indexOf(listener);
            if (index >= 0) {
                this._focusListeners.splice(index, 1);
            }
        });
    }

    onDidBlurEditorWidget(listener: EditorListener): IDisposable {
        this._blurListeners.push(listener);
        return toDisposable(() => {
            const index = this._blurListeners.indexOf(listener);
            if (index >= 0) {
                this._blurListeners.splice(index, 1);
            }
        });
    }

    focus() {
        this._focusListeners.forEach((listener) => listener());
    }

    blur() {
        this._blurListeners.forEach((listener) => listener());
    }

    dispose() {
        TestEditorState.disposed += 1;
    }
}

class TestEditorState {
    static created: TestCodeEditor | null = null;
    static disposed = 0;

    static reset() {
        this.created = null;
        this.disposed = 0;
    }
}

class TestExecutionState {
    static codes: string[] = [];
    static failNext = false;

    static reset() {
        this.codes = [];
        this.failNext = false;
    }
}

class TestExecutionService implements IUniscriptExecutionService {
    execute(code: string): Promise<boolean> {
        TestExecutionState.codes.push(code);
        return TestExecutionState.failNext ? Promise.reject(new Error('Execution stopped')) : Promise.resolve(true);
    }
}

class TestMessageState {
    static messages: IMessageProps[] = [];

    static reset() {
        this.messages = [];
    }
}

class TestMessageService implements IMessageService {
    show(options: IMessageProps): IDisposable {
        TestMessageState.messages.push(options);
        return toDisposable(() => undefined);
    }

    remove(): void {
        // Not part of this panel behavior.
    }

    removeAll(): void {
        TestMessageState.messages = [];
    }
}

class TestShortcutState {
    static activeEscapes = 0;
    static startedEscapes = 0;
    static releasedEscapes = 0;

    static reset() {
        this.activeEscapes = 0;
        this.startedEscapes = 0;
        this.releasedEscapes = 0;
    }
}

class TestShortcutService implements IShortcutService {
    readonly shortcutChanged$ = new Observable<void>();

    forceEscape(): IDisposable {
        TestShortcutState.activeEscapes += 1;
        TestShortcutState.startedEscapes += 1;
        let released = false;

        return toDisposable(() => {
            if (!released) {
                released = true;
                TestShortcutState.activeEscapes -= 1;
                TestShortcutState.releasedEscapes += 1;
            }
        });
    }

    forceDisable(): IDisposable {
        return toDisposable(() => undefined);
    }

    dispatch(): IShortcutItem<object> | undefined {
        return undefined;
    }

    registerShortcut(): IDisposable {
        return toDisposable(() => undefined);
    }

    getShortcutDisplay(): string | null {
        return null;
    }

    getShortcutDisplayOfCommand(): string | null {
        return null;
    }

    getAllShortcuts(): IShortcutItem[] {
        return [];
    }
}

class TestResizeObserver {
    constructor(private readonly _listener: ResizeObserverCallback) {}

    observe(target: Element) {
        setTimeout(() => {
            this._listener([{ target }] as ResizeObserverEntry[], this as unknown as ResizeObserver);
        }, 0);
    }

    unobserve(): void {
        // No external observer resources are allocated in this test.
    }

    disconnect(): void {
        // No external observer resources are allocated in this test.
    }
}

function createPanelTestBed() {
    const injector = new Injector();

    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([LocaleService]);
    injector.add([ThemeService]);
    injector.add([IMessageService, { useClass: TestMessageService as never }]);
    injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    injector.add([ScriptEditorService]);
    injector.add([IUniscriptExecutionService, { useClass: TestExecutionService }]);

    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);

    return {
        injector,
        editorService: injector.get(ScriptEditorService),
    };
}

async function renderPanel(root: Root, injector: Injector) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <ScriptEditorPanel />
            </RediContext.Provider>
        );
        await Promise.resolve();
    });
}

function getEditor() {
    if (!TestEditorState.created) {
        throw new Error('The editor was not created.');
    }

    return TestEditorState.created;
}

function getExecuteButton(container: HTMLElement) {
    const button = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-u-comp="button"]'))
        .find((item) => item.textContent === 'Execute Script');

    if (!button) {
        throw new Error('The execute action was not rendered.');
    }

    return button;
}

function installBrowserAPIs() {
    const resizeObserverDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver');
    const idleDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'requestIdleCallback');
    const createDescriptor = Object.getOwnPropertyDescriptor(monacoEditor, 'create');

    Object.defineProperty(globalThis, 'ResizeObserver', {
        configurable: true,
        value: TestResizeObserver,
    });
    Object.defineProperty(globalThis, 'requestIdleCallback', {
        configurable: true,
        value: (task: IdleRequestCallback) => {
            setTimeout(() => {
                task({ didTimeout: false, timeRemaining: () => 50 });
            }, 0);
            return 1;
        },
    });
    Object.defineProperty(monacoEditor, 'create', {
        configurable: true,
        value: () => {
            const editor = new TestCodeEditor();
            TestEditorState.created = editor;
            return editor;
        },
    });

    return () => {
        if (resizeObserverDescriptor) {
            Object.defineProperty(globalThis, 'ResizeObserver', resizeObserverDescriptor);
        } else {
            Reflect.deleteProperty(globalThis, 'ResizeObserver');
        }

        if (idleDescriptor) {
            Object.defineProperty(globalThis, 'requestIdleCallback', idleDescriptor);
        } else {
            Reflect.deleteProperty(globalThis, 'requestIdleCallback');
        }

        if (createDescriptor) {
            Object.defineProperty(monacoEditor, 'create', createDescriptor);
        }
    };
}

describe('ScriptEditorPanel', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let restoreAPIs: (() => void) | undefined;
    let currentTestBed: ReturnType<typeof createPanelTestBed> | undefined;

    beforeEach(() => {
        TestEditorState.reset();
        TestExecutionState.reset();
        TestMessageState.reset();
        TestShortcutState.reset();
        restoreAPIs = installBrowserAPIs();
    });

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        currentTestBed?.editorService.dispose();
        restoreAPIs?.();
        Reflect.deleteProperty(window, 'MonacoEnvironment');
        container?.remove();
        root = undefined;
        container = undefined;
        restoreAPIs = undefined;
        currentTestBed = undefined;
    });

    it('executes the edited editor content and reports success', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed.injector);
        getEditor().setValue('const total = 1 + 2;');

        await act(async () => {
            getExecuteButton(container!).dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(TestExecutionState.codes).toEqual(['const total = 1 + 2;']);
        expect(TestMessageState.messages).toMatchObject([
            { content: 'Execution Success', type: MessageType.Success },
        ]);
        expect(currentTestBed.editorService.getEditorInstance()).toBe(getEditor());
    });

    it('reports an execution failure when the execution service rejects the script', async () => {
        TestExecutionState.failNext = true;
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed.injector);
        getEditor().setValue('throw new Error("boom");');

        await act(async () => {
            getExecuteButton(container!).dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(TestExecutionState.codes).toEqual(['throw new Error("boom");']);
        expect(TestMessageState.messages).toMatchObject([
            { content: 'Execution Failed', type: MessageType.Error },
        ]);
    });

    it('holds shortcut escape while the editor is focused and releases it after blur or unmount', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed.injector);

        act(() => {
            getEditor().focus();
        });
        expect(TestShortcutState.startedEscapes).toBe(1);
        expect(TestShortcutState.activeEscapes).toBe(1);

        act(() => {
            getEditor().blur();
        });
        expect(TestShortcutState.activeEscapes).toBe(0);
        expect(TestShortcutState.releasedEscapes).toBe(1);

        act(() => {
            getEditor().focus();
        });
        expect(TestShortcutState.activeEscapes).toBe(1);

        act(() => {
            root?.unmount();
        });
        expect(TestShortcutState.activeEscapes).toBe(0);
        expect(TestShortcutState.releasedEscapes).toBe(2);
        expect(currentTestBed.editorService.getEditorInstance()).toBeNull();
    });
});
