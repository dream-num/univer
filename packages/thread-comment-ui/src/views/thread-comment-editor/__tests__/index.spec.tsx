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
    ICommand,
    IDisposable,
    IDocumentBody,
    IDocumentData,
    Nullable,
} from '@univerjs/core';
import type { ISuccinctDocRangeParam } from '@univerjs/engine-render';
import type { IShortcutItem } from '@univerjs/ui';
import type { FormEvent } from 'react';
import type { Root } from 'react-dom/client';
import {
    CommandService,
    CommandType,
    ConfigService,
    ContextService,
    createIdentifier,
    DesktopLogService,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LogLevel,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { IShortcutService, ISidebarService, RediContext } from '@univerjs/ui';
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetActiveCommentOperation } from '../../../commands/operations/comment.operations';
import { ThreadCommentPanelService } from '../../../services/thread-comment-panel.service';
import { ThreadCommentEditor } from '../../ThreadCommentEditor';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const EDITOR_ID = 'thread-comment-editor';
const REPLY_LABEL = 'thread-comment-ui.editor.reply';
const CANCEL_LABEL = 'thread-comment-ui.editor.cancel';
const PLACEHOLDER_LABEL = 'thread-comment-ui.editor.placeholder';
const IRenderManagerService = createIdentifier<TestRenderManagerService>('engine-render.render-manager.service');

interface IEditorRecord {
    id: string;
    data: IDocumentData;
    selections: ISuccinctDocRangeParam[];
    focused: boolean;
    order: string[];
}

class TestState {
    static records = new Map<string, IEditorRecord>();
    static savedBodies: IDocumentBody[] = [];
    static submitCount = 0;
    static cancelCount = 0;
    static shortcuts: IShortcutItem[] = [];

    static reset() {
        this.records = new Map();
        this.savedBodies = [];
        this.submitCount = 0;
        this.cancelCount = 0;
        this.shortcuts = [];
    }
}

class TestEditor {
    readonly input$ = new Subject<unknown>();
    readonly paste$ = new Subject<unknown>();
    readonly focus$ = new Subject<unknown>();
    readonly blur$ = new Subject<unknown>();
    readonly change$ = new Subject<unknown>();
    readonly selectionChange$ = new Subject<unknown>();

    readonly render = {
        isDisposed: () => false,
        with: () => ({
            getSkeleton: () => ({
                getActualSize: () => ({ actualWidth: 0, actualHeight: 0 }),
            }),
            getViewModel: () => ({
                getDataModel: () => ({
                    updateDocumentDataPageSize: () => undefined,
                }),
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

    constructor(private readonly _record: IEditorRecord) {
    }

    isFocus() {
        return this._record.focused;
    }

    focus(): void {
        this._record.focused = true;
        this._record.order.push('editor.focus');
        this.focus$.next(undefined);
    }

    blur(): void {
        this._record.focused = false;
        this._record.order.push('editor.blur');
        this.blur$.next(undefined);
    }

    select(): void {
    }

    setSelectionRanges(ranges: ISuccinctDocRangeParam[]): void {
        this._record.selections = ranges;
        this._record.order.push('editor.setSelectionRanges');
        this.selectionChange$.next(undefined);
    }

    getSelectionRanges() {
        return this._record.selections;
    }

    getEditorId() {
        return this._record.id;
    }

    getDocumentData() {
        return this._record.data;
    }

    setDocumentData(data: IDocumentData, ranges: ISuccinctDocRangeParam[] = []): void {
        this._record.data = data;
        this._record.selections = ranges;
        this._record.order.push('editor.setDocumentData');
        this.selectionChange$.next(undefined);
    }

    replaceText(value: string): void {
        this._record.data = {
            ...this._record.data,
            body: {
                dataStream: `${value}\r\n`,
            },
        };
        this._record.order.push('editor.replaceText');
        this.selectionChange$.next(undefined);
    }

    clearUndoRedoHistory(): void {
    }

    getValue() {
        return this._record.data.body?.dataStream ?? '';
    }

    isSheetEditor() {
        return false;
    }

    getBoundingClientRect() {
        return { width: 320, height: 64 };
    }
}

class TestEditorService {
    private readonly _editors = new Map<string, TestEditor>();
    private _focusId: Nullable<string>;
    readonly blur$ = new Subject<unknown>();
    readonly focus$ = new Subject<ISuccinctDocRangeParam>();

    getEditor(id?: string): Nullable<TestEditor> {
        return id ? this._editors.get(id) : undefined;
    }

    register(config: { initialSnapshot: IDocumentData }, _container: HTMLDivElement): IDisposable {
        const snapshot = config.initialSnapshot;
        const record: IEditorRecord = {
            id: snapshot.id,
            data: snapshot,
            selections: [],
            focused: false,
            order: [],
        };
        const editor = new TestEditor(record);
        this._editors.set(record.id, editor);
        TestState.records.set(record.id, record);

        return toDisposable(() => {
            this._editors.delete(record.id);
        });
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

    blur(): void {
        this.getFocusEditor()?.blur();
        this._focusId = null;
        this.blur$.next(undefined);
    }

    focus(editorUnitId: string): void {
        this._focusId = editorUnitId;
        this.getEditor(editorUnitId)?.focus();
        this.focus$.next({ startOffset: 0, endOffset: 0 });
    }

    getFocusId() {
        return this._focusId;
    }

    getFocusEditor() {
        return this._focusId ? this.getEditor(this._focusId) : undefined;
    }
}

class TestRenderManagerService {
    readonly createRender$ = new Subject<string>();
    readonly created$ = new Subject<unknown>();
    readonly disposed$ = new Subject<string>();
    readonly defaultEngine = {};

    addRender(): void {}
    createRender() { return undefined; }
    removeRender(): void {}
    getRenderById() { return undefined; }
    getRenderUnitById() { return undefined; }
    getAllRenderersOfType() { return []; }
    getRenderAll() { return new Map(); }
    create(): void {}
    has() { return false; }
    registerRenderModule(): IDisposable { return toDisposable(() => undefined); }
    dispose(): void {}
}

class TestLocaleService {
    t(key: string) {
        return key;
    }
}

class TestShortcutService {
    readonly shortcutChanged$ = new Subject<void>();

    forceEscape(): IDisposable { return toDisposable(() => undefined); }
    forceDisable(): IDisposable { return toDisposable(() => undefined); }
    dispatch(): undefined { return undefined; }
    registerShortcut(shortcut: IShortcutItem): IDisposable {
        TestState.shortcuts.push(shortcut);
        return toDisposable(() => undefined);
    }

    getShortcutDisplay(): string | null { return null; }
    getShortcutDisplayOfCommand(): string | null { return null; }
    getAllShortcuts(): IShortcutItem[] { return TestState.shortcuts; }
}

class TestSidebarService {
    readonly sidebarOptions$ = new BehaviorSubject({ visible: true });
    readonly scrollEvent$ = new Subject<Event>();
    private _container: HTMLElement | undefined;
    private _width: number | undefined;

    open(): IDisposable { return toDisposable(() => undefined); }
    close(): void {
        this.sidebarOptions$.next({ visible: false });
    }

    get visible() { return this.sidebarOptions$.getValue().visible; }
    get options() { return this.sidebarOptions$.getValue(); }
    getContainer() { return this._container; }
    setContainer(element?: HTMLElement): void { this._container = element; }
    get width() { return this._width; }
    setWidth(value: number): void { this._width = value; }
}

class TestUniverInstanceService {
    getCurrentTypeOfUnit$() {
        return new BehaviorSubject({ id: 'workbook' });
    }

    setCurrentUnitForType(): void {
    }
}

const BreakLineCommand: ICommand = {
    id: 'doc.command.editor-break-line',
    type: CommandType.COMMAND,
    handler: () => true,
};

function createEditorTestBed() {
    const injector = new Injector();
    const dependencies: Dependency[] = [
        [ICommandService, { useClass: CommandService }],
        [ILogService, { useClass: DesktopLogService }],
        [IContextService, { useClass: ContextService }],
        [IConfigService, { useClass: ConfigService }],
        [LocaleService, { useClass: TestLocaleService as never }],
        [IEditorService, { useClass: TestEditorService as never }],
        [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        [IShortcutService, { useClass: TestShortcutService as never }],
        [ISidebarService, { useClass: TestSidebarService as never }],
        [IUniverInstanceService, { useClass: TestUniverInstanceService as never }],
        [ThreadCommentPanelService],
    ];

    dependencies.forEach((dependency) => injector.add(dependency));
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    [SetActiveCommentOperation, BreakLineCommand].forEach((command) => commandService.registerCommand(command));

    return {
        injector,
        commandService,
        panelService: injector.get(ThreadCommentPanelService),
    };
}

function renderEditor(injector: Injector, element: React.ReactElement) {
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

    return { container, root };
}

function getButton(container: HTMLElement, text: string): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.trim() === text);
    if (!button) {
        throw new Error(`Button "${text}" was not found.`);
    }

    return button as HTMLButtonElement;
}

function getEditorSurface(container: HTMLElement): HTMLElement {
    const placeholder = Array.from(container.querySelectorAll('div')).find((item) => item.textContent === PLACEHOLDER_LABEL);
    if (!placeholder) {
        throw new Error('Editor placeholder was not found.');
    }

    return placeholder.parentElement?.parentElement?.parentElement ?? placeholder as HTMLElement;
}

function body(dataStream: string): IDocumentBody {
    return { dataStream };
}

describe('ThreadCommentEditor', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    beforeEach(() => {
        TestState.reset();
    });

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('enters editing mode from an inserted reply and keeps action buttons out of outer form submission', () => {
        const testBed = createEditorTestBed();
        const editorRef = createRef<{ reply: (text: IDocumentBody) => void }>();
        const rendered = renderEditor(
            testBed.injector,
            <form
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    TestState.submitCount += 1;
                }}
            >
                <ThreadCommentEditor
                    ref={editorRef}
                    autoFocus={false}
                    editorId={EDITOR_ID}
                    subUnitId="subUnit"
                    type={UniverInstanceType.UNIVER_SHEET}
                    unitId="unit"
                />
            </form>
        );
        root = rendered.root;
        container = rendered.container;

        expect(container.querySelectorAll('button')).toHaveLength(0);

        act(() => {
            editorRef.current?.reply(body('draft reply\r\n'));
        });

        expect(getButton(container, CANCEL_LABEL).type).toBe('button');
        expect(getButton(container, REPLY_LABEL).type).toBe('button');
        expect(getButton(container, REPLY_LABEL).disabled).toBe(false);
        expect(TestState.submitCount).toBe(0);
    });

    it('saves reply content, clears the editor, and does not submit an outer form', () => {
        const testBed = createEditorTestBed();
        const editorRef = createRef<{ reply: (text: IDocumentBody) => void }>();
        const rendered = renderEditor(
            testBed.injector,
            <form
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    TestState.submitCount += 1;
                }}
            >
                <ThreadCommentEditor
                    ref={editorRef}
                    autoFocus={false}
                    editorId={EDITOR_ID}
                    onSave={(comment) => {
                        TestState.records.get(EDITOR_ID)?.order.push('onSave');
                        TestState.savedBodies.push(comment.text);
                    }}
                    subUnitId="subUnit"
                    type={UniverInstanceType.UNIVER_SHEET}
                    unitId="unit"
                />
            </form>
        );
        root = rendered.root;
        container = rendered.container;

        act(() => {
            editorRef.current?.reply(body('@Owner reply body\r\n'));
        });

        expect(getButton(container, REPLY_LABEL).disabled).toBe(false);

        act(() => {
            getButton(container!, REPLY_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(TestState.savedBodies).toEqual([body('@Owner reply body\r\n')]);
        expect(TestState.submitCount).toBe(0);

        const record = TestState.records.get(EDITOR_ID)!;
        expect(record.data.body?.dataStream).toBe('\r\n');
        expect(record.selections).toEqual([]);
        expect(record.order.indexOf('editor.blur')).toBeLessThan(record.order.indexOf('editor.replaceText'));
        expect(record.order.indexOf('editor.replaceText')).toBeLessThan(record.order.indexOf('onSave'));
    });

    it('cancels editing by clearing content and resetting the active comment', () => {
        const testBed = createEditorTestBed();
        testBed.panelService.setActiveComment({ unitId: 'unit', subUnitId: 'subUnit', commentId: 'comment-1' });

        const editorRef = createRef<{ reply: (text: IDocumentBody) => void }>();
        const rendered = renderEditor(
            testBed.injector,
            <ThreadCommentEditor
                ref={editorRef}
                autoFocus={false}
                editorId={EDITOR_ID}
                onCancel={() => {
                    TestState.cancelCount += 1;
                }}
                subUnitId="subUnit"
                type={UniverInstanceType.UNIVER_SHEET}
                unitId="unit"
            />
        );
        root = rendered.root;
        container = rendered.container;

        act(() => {
            editorRef.current?.reply(body('draft reply\r\n'));
        });

        act(() => {
            getButton(container!, CANCEL_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        const record = TestState.records.get(EDITOR_ID)!;
        expect(record.data.body?.dataStream).toBe('\r\n');
        expect(record.selections).toEqual([]);
        expect(TestState.cancelCount).toBe(1);
        expect(testBed.panelService.activeCommentId).toBeUndefined();
        expect(container.querySelectorAll('button')).toHaveLength(0);
    });

    it('uses the normal document editor as the click-outside focus target for document comments', async () => {
        const testBed = createEditorTestBed();
        const editorRef = createRef<{ reply: (text: IDocumentBody) => void }>();
        const rendered = renderEditor(
            testBed.injector,
            <ThreadCommentEditor
                ref={editorRef}
                autoFocus={false}
                editorId={EDITOR_ID}
                subUnitId="subUnit"
                type={UniverInstanceType.UNIVER_DOC}
                unitId="docUnit"
            />
        );
        root = rendered.root;
        container = rendered.container;

        act(() => {
            editorRef.current?.reply(body('doc reply\r\n'));
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 120));
            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await new Promise((resolve) => setTimeout(resolve, 40));
        });

        expect(testBed.injector.get(IEditorService).getFocusId()).toBe(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    });
});
