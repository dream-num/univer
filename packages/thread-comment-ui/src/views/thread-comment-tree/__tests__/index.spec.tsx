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

import type { Dependency, IDisposable, IDocumentData, Nullable } from '@univerjs/core';
import type { ISuccinctDocRangeParam } from '@univerjs/engine-render';
import type { IThreadComment } from '@univerjs/thread-comment';
import type { IShortcutItem } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    CommandService,
    ConfigService,
    ContextService,
    createIdentifier,
    dateKit,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LOCALE_META,
    LocaleService,
    LocaleType,
    LogLevel,
    toDisposable,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import {
    AddCommentCommand,
    AddCommentMutation,
    DeleteCommentCommand,
    DeleteCommentMutation,
    DeleteCommentTreeCommand,
    IThreadCommentDataSourceService,
    ResolveCommentCommand,
    ResolveCommentMutation,
    ThreadCommentDataSourceService,
    ThreadCommentModel,
    UpdateCommentCommand,
    UpdateCommentMutation,
} from '@univerjs/thread-comment';
import { IShortcutService, ISidebarService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetActiveCommentOperation } from '../../../commands/operations/comment.operations';
import { ThreadCommentPanelService } from '../../../services/thread-comment-panel.service';
import { transformTextNodes2Document } from '../../thread-comment-editor/util';
import { ThreadCommentTree, ThreadCommentTreeLocation } from '../../ThreadCommentTree';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'unit-1';
const SHEET_ID = 'sheet-1';
const REPLY_LABEL = 'thread-comment-ui.editor.reply';
const IRenderManagerService = createIdentifier<TestRenderManagerService>('engine-render.render-manager.service');

interface IEditorRecord {
    id: string;
    data: IDocumentData;
    selections: ISuccinctDocRangeParam[];
    focused: boolean;
}

class TestState {
    static addedComments: IThreadComment[] = [];
    static resolveStates: boolean[] = [];

    static reset() {
        this.addedComments = [];
        this.resolveStates = [];
    }
}

class TestLocaleService {
    private readonly _currentLocale$ = new BehaviorSubject<LocaleType>(LocaleType.ZH_CN);
    readonly currentLocale$ = this._currentLocale$.asObservable();

    t(key: string) {
        return key;
    }

    setLocale(locale: LocaleType) {
        this._currentLocale$.next(locale);
    }

    getCurrentLocale() {
        return this._currentLocale$.getValue();
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
        this.focus$.next(undefined);
    }

    blur(): void {
        this._record.focused = false;
        this.blur$.next(undefined);
    }

    select(): void {
    }

    setSelectionRanges(ranges: ISuccinctDocRangeParam[]): void {
        this._record.selections = ranges;
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
        this.selectionChange$.next(undefined);
    }

    replaceText(value: string): void {
        this._record.data = {
            ...this._record.data,
            body: {
                dataStream: `${value}\r\n`,
            },
        };
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
        };
        const editor = new TestEditor(record);
        this._editors.set(record.id, editor);

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

class TestShortcutService {
    readonly shortcutChanged$ = new Subject<void>();
    readonly shortcuts: IShortcutItem[] = [];

    forceEscape(): IDisposable { return toDisposable(() => undefined); }
    forceDisable(): IDisposable { return toDisposable(() => undefined); }
    dispatch(): undefined { return undefined; }
    registerShortcut(shortcut: IShortcutItem): IDisposable {
        this.shortcuts.push(shortcut);
        return toDisposable(() => undefined);
    }

    getShortcutDisplay(): string | null { return null; }
    getShortcutDisplayOfCommand(): string | null { return null; }
    getAllShortcuts(): IShortcutItem[] { return this.shortcuts; }
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

function createComment(overrides: Partial<IThreadComment>): IThreadComment {
    const id = overrides.id ?? 'thread-1';

    return {
        id,
        threadId: overrides.threadId ?? id,
        ref: overrides.ref ?? 'A1',
        dT: overrides.dT ?? '2026-06-17T00:00:00.000Z',
        personId: overrides.personId ?? 'owner',
        text: overrides.text ?? transformTextNodes2Document([{ type: 'text', content: id }]),
        unitId: overrides.unitId ?? UNIT_ID,
        subUnitId: overrides.subUnitId ?? SHEET_ID,
        attachments: overrides.attachments,
        children: overrides.children,
        mentions: overrides.mentions,
        parentId: overrides.parentId,
        resolved: overrides.resolved,
        updateT: overrides.updateT,
        updated: overrides.updated,
    };
}

function createTreeTestBed() {
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
        [IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }],
        [LifecycleService],
        [UserManagerService],
        [ThreadCommentModel],
        [ThreadCommentPanelService],
    ];

    dependencies.forEach((dependency) => injector.add(dependency));
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
    injector.get(LifecycleService).stage = LifecycleStages.Rendered;
    injector.get(UserManagerService).setCurrentUser({ userID: 'owner', name: 'Owner', avatar: 'owner.png' });

    const commandService = injector.get(ICommandService);
    [
        AddCommentCommand,
        AddCommentMutation,
        DeleteCommentCommand,
        DeleteCommentMutation,
        DeleteCommentTreeCommand,
        ResolveCommentCommand,
        ResolveCommentMutation,
        SetActiveCommentOperation,
        UpdateCommentCommand,
        UpdateCommentMutation,
    ].forEach((command) => commandService.registerCommand(command));

    return {
        injector,
        editorService: injector.get(IEditorService),
        panelService: injector.get(ThreadCommentPanelService),
        threadCommentModel: injector.get(ThreadCommentModel),
    };
}

function renderTree(injector: Injector, element: React.ReactElement) {
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

function renderDefaultTree(injector: Injector, commentId: string) {
    return renderTree(
        injector,
        <ThreadCommentTree
            id={commentId}
            unitId={UNIT_ID}
            subUnitId={SHEET_ID}
            refStr="A1"
            type={UniverInstanceType.UNIVER_SHEET}
            getSubUnitName={(subUnitId) => subUnitId}
            location={ThreadCommentTreeLocation.PANEL}
            onAddComment={(comment) => {
                TestState.addedComments.push(comment);
                return true;
            }}
            onResolve={(resolved) => {
                TestState.resolveStates.push(resolved);
            }}
        />
    );
}

function getTree(container: HTMLElement, commentId: string) {
    const item = container.querySelector(`#PANEL-${UNIT_ID}-${SHEET_ID}-${commentId}`);
    if (!item) {
        throw new Error(`Tree item "${commentId}" was not found.`);
    }

    return item as HTMLElement;
}

function getButton(container: HTMLElement, text: string): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.trim() === text);
    if (!button) {
        throw new Error(`Button "${text}" was not found.`);
    }

    return button as HTMLButtonElement;
}

function getResolveAction(container: HTMLElement, commentId: string) {
    const tree = getTree(container, commentId);
    const header = tree.firstElementChild as HTMLElement | null;
    const controls = header?.lastElementChild as HTMLElement | null;
    const action = controls?.firstElementChild;
    if (!action) {
        throw new Error('Resolve action was not found.');
    }

    return action as HTMLElement;
}

function getRootCommentItem(container: HTMLElement, commentId: string) {
    const scroller = getTree(container, commentId).children[1];
    const item = scroller?.firstElementChild;
    if (!item) {
        throw new Error('Root comment item was not found.');
    }

    return item as HTMLElement;
}

function getReplyAction(container: HTMLElement, commentId: string) {
    const item = getRootCommentItem(container, commentId);
    const nameRow = item.children[1] as HTMLElement | undefined;
    const controls = nameRow?.lastElementChild as HTMLElement | undefined;
    const action = controls?.firstElementChild;
    if (!action) {
        throw new Error('Reply action was not found.');
    }

    return action as HTMLElement;
}

function getOnlyEditor(testBed: ReturnType<typeof createTreeTestBed>) {
    const editors = Array.from(testBed.editorService.getAllEditor().values());
    if (editors.length !== 1) {
        throw new Error(`Expected one editor, received ${editors.length}.`);
    }

    return editors[0];
}

function addRootComment(model: ThreadCommentModel, comment: IThreadComment) {
    model.addComment(comment.unitId, comment.subUnitId, comment);
}

function waitForTreeRefresh() {
    return new Promise((resolve) => setTimeout(resolve, 40));
}

function waitForFrame() {
    return new Promise((resolve) => setTimeout(resolve, 16));
}

describe('ThreadCommentTree', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    beforeEach(() => {
        document.body.innerHTML = '';
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

    it('provides mirrored layout hooks for RTL comment rows', () => {
        const testBed = createTreeTestBed();
        addRootComment(testBed.threadCommentModel, createComment({ id: 'root-thread', ref: 'A1', dT: '2026/07/07 20:35' }));

        const rendered = renderDefaultTree(testBed.injector, 'root-thread');
        root = rendered.root;
        container = rendered.container;

        const tree = getTree(container, 'root-thread');
        const header = tree.firstElementChild as HTMLElement;
        const titleAccent = header.firstElementChild?.firstElementChild as HTMLElement;
        const resolveAction = getResolveAction(container, 'root-thread');
        const item = getRootCommentItem(container, 'root-thread');
        const avatar = item.firstElementChild as HTMLElement;
        const time = item.querySelector('time');

        expect(titleAccent.className).toContain('rtl:univer-ml-2');
        expect(titleAccent.className).toContain('rtl:univer-mr-0');
        expect(resolveAction.className).toContain('rtl:univer-ml-0');
        expect(resolveAction.className).toContain('rtl:univer-mr-1');
        expect(item.className).toContain('rtl:univer-pl-0');
        expect(item.className).toContain('rtl:univer-pr-[30px]');
        expect(avatar.className).toContain('rtl:univer-left-auto');
        expect(avatar.className).toContain('rtl:univer-right-0');
        expect(time?.getAttribute('dir')).toBe('ltr');
    });

    it('formats comment timestamps with dateKit intl using the current locale', () => {
        const testBed = createTreeTestBed();
        const rawDate = '2026/07/07 20:35';
        testBed.injector.get(LocaleService).setLocale(LocaleType.EN_US);
        addRootComment(testBed.threadCommentModel, createComment({ id: 'root-thread', ref: 'A1', dT: rawDate }));

        const rendered = renderDefaultTree(testBed.injector, 'root-thread');
        root = rendered.root;
        container = rendered.container;

        const time = getRootCommentItem(container, 'root-thread').querySelector('time');
        const expected = dateKit(rawDate).formatIntl(LOCALE_META[LocaleType.EN_US].tag, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        expect(time?.textContent).toBe(expected);
        expect(time?.textContent).not.toBe(rawDate);
    });

    it('adds a reply through the tree editor and stores it under the root thread', async () => {
        const testBed = createTreeTestBed();
        addRootComment(testBed.threadCommentModel, createComment({ id: 'root-thread', ref: 'A1' }));

        const rendered = renderDefaultTree(testBed.injector, 'root-thread');
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            getRootCommentItem(container!, 'root-thread').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            await waitForFrame();
        });

        await act(async () => {
            getReplyAction(container!, 'root-thread').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await waitForFrame();
        });

        act(() => {
            getOnlyEditor(testBed).replaceText('Reply from tree');
        });

        await act(async () => {
            getButton(container!, REPLY_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await waitForTreeRefresh();
        });

        const thread = testBed.threadCommentModel.getCommentWithChildren(UNIT_ID, SHEET_ID, 'root-thread');
        expect(thread?.children).toHaveLength(1);
        expect(thread?.children[0].parentId).toBe('root-thread');
        expect(thread?.children[0].threadId).toBe('root-thread');
        expect(thread?.children[0].personId).toBe('owner');
        expect(thread?.children[0].text.dataStream).toBe('Reply from tree\r\n');
        expect(TestState.addedComments).toHaveLength(1);
        expect(TestState.addedComments[0].parentId).toBe('root-thread');
    });

    it('toggles the resolved state and updates the active comment target', async () => {
        const testBed = createTreeTestBed();
        addRootComment(testBed.threadCommentModel, createComment({ id: 'root-thread', ref: 'A1' }));
        testBed.panelService.setActiveComment({
            unitId: UNIT_ID,
            subUnitId: SHEET_ID,
            commentId: 'root-thread',
        });

        const rendered = renderDefaultTree(testBed.injector, 'root-thread');
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            getResolveAction(container!, 'root-thread').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await waitForTreeRefresh();
        });

        expect(testBed.threadCommentModel.getComment(UNIT_ID, SHEET_ID, 'root-thread')?.resolved).toBe(true);
        expect(testBed.panelService.activeCommentId).toBeUndefined();
        expect(TestState.resolveStates).toEqual([true]);

        await act(async () => {
            getResolveAction(container!, 'root-thread').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await waitForTreeRefresh();
        });

        expect(testBed.threadCommentModel.getComment(UNIT_ID, SHEET_ID, 'root-thread')?.resolved).toBe(false);
        expect(testBed.panelService.activeCommentId).toEqual({
            unitId: UNIT_ID,
            subUnitId: SHEET_ID,
            commentId: 'root-thread',
        });
        expect(TestState.resolveStates).toEqual([true, false]);
    });
});
