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
    IDisposable,
    IDocumentBody,
    IDocumentData,
    Injector,
    IWorkbookData,
    Nullable,
    Workbook,
} from '@univerjs/core';
import type { ISuccinctDocRangeParam } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IThreadComment } from '@univerjs/thread-comment';
import type { IShortcutItem, ISidebarMethodOptions } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    createIdentifier,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    RANGE_TYPE,
    toDisposable,
    Univer,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { CellPopupManagerService, IMarkSelectionService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import {
    AddCommentMutation,
    DeleteCommentMutation,
    DeleteCommentTreeCommand,
    IThreadCommentDataSourceService,
    ResolveCommentCommand,
    ResolveCommentMutation,
    ThreadCommentDataSourceService,
    ThreadCommentModel,
} from '@univerjs/thread-comment';
import { SetActiveCommentOperation, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import threadCommentEnUS from '@univerjs/thread-comment-ui/locale/en-US';
import { IShortcutService, ISidebarService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ShowAddSheetCommentModalOperation } from '../../commands/operations/comment.operation';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';
import { SheetsThreadCommentCell } from '../SheetsThreadCommentCell';
import { SheetsThreadCommentPanel } from '../SheetsThreadCommentPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const unitId = 'sheet-thread-comment-panel-test';
const sheet1 = 'sheet-1';
const sheet2 = 'sheet-2';
const IEditorService = createIdentifier<TestEditorService>('univer.editor.service');

const workbookData: IWorkbookData = {
    id: unitId,
    appVersion: '3.0.0-alpha',
    name: 'Comment panel workbook',
    locale: LocaleType.EN_US,
    sheetOrder: [sheet1, sheet2],
    styles: {},
    sheets: {
        [sheet1]: {
            id: sheet1,
            name: 'Sheet 1',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
        [sheet2]: {
            id: sheet2,
            name: 'Sheet 2',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
    },
};

interface IRecordedShape {
    id: string;
    selection: ISelectionWithStyle;
}

class TestState {
    static popupDisposeCount = 0;
    static shapeSeq = 0;
    static shapes: IRecordedShape[] = [];
    static removedShapeIds: string[] = [];

    static reset() {
        this.popupDisposeCount = 0;
        this.shapeSeq = 0;
        this.shapes = [];
        this.removedShapeIds = [];
    }
}

class TestSidebarService extends Disposable implements ISidebarService {
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();
    readonly scrollEvent$ = new Subject<Event>();
    private _options: ISidebarMethodOptions = {};
    private _container?: HTMLElement;

    open(params: ISidebarMethodOptions): IDisposable {
        this._options = { ...params, visible: true };
        this.sidebarOptions$.next(this._options);
        return toDisposable(() => this.close());
    }

    close(): void {
        this._options = { ...this._options, visible: false };
        this.sidebarOptions$.next(this._options);
        this._options.onClose?.();
    }

    get visible(): boolean {
        return this._options.visible ?? false;
    }

    get options(): ISidebarMethodOptions {
        return this._options;
    }

    get width(): number | undefined {
        return undefined;
    }

    setWidth(): void {}

    getContainer(): HTMLElement | undefined {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element;
    }

    override dispose(): void {
        super.dispose();
        this.sidebarOptions$.complete();
        this.scrollEvent$.complete();
    }
}

class TestMarkSelectionService implements IMarkSelectionService {
    addShape(selection: ISelectionWithStyle): string {
        const id = `shape-${++TestState.shapeSeq}`;
        TestState.shapes.push({ id, selection });
        return id;
    }

    addShapeWithNoFresh(selection: ISelectionWithStyle): string {
        return this.addShape(selection);
    }

    removeShape(id: string): void {
        TestState.removedShapeIds.push(id);
        TestState.shapes = TestState.shapes.filter((shape) => shape.id !== id);
    }

    removeAllShapes(): void {
        TestState.removedShapeIds.push(...TestState.shapes.map((shape) => shape.id));
        TestState.shapes = [];
    }

    refreshShapes(): void {}

    getShapeMap(): Map<string, never> {
        return new Map<string, never>();
    }
}

class TestCellPopupManagerService {
    showPopup(): IDisposable {
        return toDisposable(() => {
            TestState.popupDisposeCount += 1;
        });
    }
}

class TestSheetCanvasPopManagerService {}

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

interface IEditorRecord {
    id: string;
    data: IDocumentData;
    selections: ISuccinctDocRangeParam[];
    focused: boolean;
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

    select(): void {}

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

    clearUndoRedoHistory(): void {}

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

function createTextBody(text: string): IDocumentBody {
    const dataStream = `${text}\r\n`;
    return {
        dataStream,
        textRuns: [],
        paragraphs: [
            {
                startIndex: dataStream.length - 2,
                paragraphId: `paragraph-${text}`,
            },
        ],
        sectionBreaks: [
            {
                sectionId: `section_${text}`,
                startIndex: dataStream.length - 1,
            },
        ],
    };
}

function createComment(id: string, subUnitId: string, ref: string, text: string, resolved = false): IThreadComment {
    return {
        id,
        threadId: id,
        ref,
        unitId,
        subUnitId,
        dT: '2026-06-17T00:00:00.000Z',
        personId: 'user-1',
        resolved,
        text: createTextBody(text),
    };
}

function createSelection(row: number, column: number): ISelectionWithStyle {
    return {
        range: {
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
        },
        primary: {
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
            actualRow: row,
            actualColumn: column,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };
}

function createTestBed(testWorkbookData: IWorkbookData = workbookData) {
    const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            [LocaleType.EN_US]: threadCommentEnUS,
        },
    });
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector) as Injector['get'];

    injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
    injector.add([ThreadCommentModel]);
    injector.add([SheetsThreadCommentModel]);
    injector.add([IMarkSelectionService, { useClass: TestMarkSelectionService }]);
    injector.add([CellPopupManagerService, { useClass: TestCellPopupManagerService as never }]);
    injector.add([SheetCanvasPopManagerService, { useClass: TestSheetCanvasPopManagerService as never }]);
    injector.add([IEditorService, { useClass: TestEditorService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    injector.add([SheetsSelectionsService]);
    injector.add([SheetsThreadCommentPopupService]);
    injector.add([ISidebarService, { useClass: TestSidebarService as never }]);
    injector.add([ThreadCommentPanelService]);

    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, testWorkbookData);
    get(IUniverInstanceService).focusUnit(unitId);
    get(LifecycleService).stage = LifecycleStages.Rendered;
    get(UserManagerService).setCurrentUser({ userID: 'user-1', name: 'Ada' });

    const commandService = get(ICommandService);
    commandService.registerCommand(AddCommentMutation);
    commandService.registerCommand(DeleteCommentMutation);
    commandService.registerCommand(DeleteCommentTreeCommand);
    commandService.registerCommand(ResolveCommentMutation);
    commandService.registerCommand(ResolveCommentCommand);
    commandService.registerCommand(SetActiveCommentOperation);
    commandService.registerCommand(ShowAddSheetCommentModalOperation);

    return {
        univer,
        injector,
        get,
        commandService,
        threadCommentModel: get(ThreadCommentModel),
        popupService: get(SheetsThreadCommentPopupService),
        panelService: get(ThreadCommentPanelService),
        selectionService: get(SheetsSelectionsService),
    };
}

function renderPanel(injector: Injector) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <SheetsThreadCommentPanel />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function renderCell(injector: Injector) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <SheetsThreadCommentCell />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function orderOf(text: string, ...items: string[]) {
    return items.map((item) => {
        const index = text.indexOf(item);
        expect(index).toBeGreaterThanOrEqual(0);
        return index;
    });
}

function dispatchMouseEvent(element: Element, type: string) {
    act(() => {
        element.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    });
}

function getRootDeleteAction(panelItem: Element) {
    const header = panelItem.firstElementChild;
    const controls = header?.lastElementChild;
    const action = controls?.lastElementChild;
    expect(action).toBeInstanceOf(HTMLElement);

    return action as HTMLElement;
}

function waitForTreeRefresh() {
    return new Promise((resolve) => setTimeout(resolve, 40));
}

describe('SheetsThreadCommentPanel', () => {
    let univer: Univer | undefined;
    let root: Root | undefined;
    let container: HTMLElement | undefined;
    let scrollIntoViewDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        TestState.reset();
        scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
        Object.defineProperty(Element.prototype, 'scrollIntoView', {
            configurable: true,
            value() {},
        });
    });

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        univer?.dispose();
        if (scrollIntoViewDescriptor) {
            Object.defineProperty(Element.prototype, 'scrollIntoView', scrollIntoViewDescriptor);
        } else {
            delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
        }
        root = undefined;
        container = undefined;
        univer = undefined;
    });

    it('orders panel comments by unresolved status, sheet order, and cell reference', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet2, createComment('sheet-2-a1', sheet2, 'A1', 'Sheet two A1'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('sheet-1-c3', sheet1, 'C3', 'Sheet one C3'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('sheet-1-a2', sheet1, 'A2', 'Sheet one A2'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('sheet-1-a1-done', sheet1, 'A1', 'Resolved sheet one A1', true));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const [sheet1A2, sheet1C3, sheet2A1, resolvedSheet1A1] = orderOf(
            container.textContent ?? '',
            'Sheet one A2',
            'Sheet one C3',
            'Sheet two A1',
            'Resolved sheet one A1'
        );
        expect(sheet1A2).toBeLessThan(sheet1C3);
        expect(sheet1C3).toBeLessThan(sheet2A1);
        expect(sheet2A1).toBeLessThan(resolvedSheet1A1);
    });

    it('filters panel comments to the active sheet when current-sheet scope is selected', async () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('current-sheet-thread', sheet1, 'B2', 'Current sheet B2'));
        testBed.threadCommentModel.addComment(unitId, sheet2, createComment('other-sheet-thread', sheet2, 'C3', 'Other sheet C3'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        expect(container.textContent).toContain('Current sheet B2');
        expect(container.textContent).toContain('Other sheet C3');

        await act(async () => {
            container!.querySelectorAll('[data-u-comp="select"]')[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        const currentSheetOption = Array.from(document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]'))
            .find((button) => button.textContent === 'Current sheet');

        expect(currentSheetOption).toBeDefined();

        await act(async () => {
            currentSheetOption!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Current sheet B2');
        expect(container.textContent).not.toContain('Other sheet C3');
    });

    it('updates current-sheet scoped comments when the active sheet changes', async () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('sheet-one-thread', sheet1, 'B2', 'Sheet one B2'));
        testBed.threadCommentModel.addComment(unitId, sheet2, createComment('sheet-two-thread', sheet2, 'C3', 'Sheet two C3'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            container!.querySelectorAll('[data-u-comp="select"]')[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        const currentSheetOption = Array.from(document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]'))
            .find((button) => button.textContent === 'Current sheet');

        expect(currentSheetOption).toBeDefined();

        await act(async () => {
            currentSheetOption!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Sheet one B2');
        expect(container.textContent).not.toContain('Sheet two C3');

        const workbook = testBed.get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const secondSheet = workbook.getSheetBySheetId(sheet2);
        expect(secondSheet).toBeDefined();

        act(() => {
            workbook.setActiveSheet(secondSheet!);
        });

        expect(container.textContent).toContain('Sheet two C3');
        expect(container.textContent).not.toContain('Sheet one B2');
    });

    it('highlights only unresolved comments on the current sheet and closes the cell popup when resolved', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('current-sheet-thread', sheet1, 'B2', 'Current sheet B2'));
        testBed.threadCommentModel.addComment(unitId, sheet2, createComment('other-sheet-thread', sheet2, 'A1', 'Other sheet A1'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('resolved-thread', sheet1, 'C3', 'Resolved sheet C3', true));
        testBed.popupService.showPopup({
            unitId,
            subUnitId: sheet1,
            row: 1,
            col: 1,
            commentId: 'current-sheet-thread',
        });

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const currentThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-current-sheet-thread`);
        const otherSheetThread = container.querySelector(`#PANEL-${unitId}-${sheet2}-other-sheet-thread`);
        const resolvedThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-resolved-thread`);
        expect(currentThread).toBeInstanceOf(HTMLElement);
        expect(otherSheetThread).toBeInstanceOf(HTMLElement);
        expect(resolvedThread).toBeInstanceOf(HTMLElement);

        dispatchMouseEvent(currentThread!, 'mouseover');
        expect(TestState.shapes).toEqual([
            expect.objectContaining({
                selection: expect.objectContaining({
                    range: {
                        startRow: 1,
                        endRow: 1,
                        startColumn: 1,
                        endColumn: 1,
                    },
                }),
            }),
        ]);

        dispatchMouseEvent(currentThread!, 'mouseout');
        expect(TestState.shapes).toHaveLength(0);
        expect(TestState.removedShapeIds).toEqual(['shape-1']);

        dispatchMouseEvent(otherSheetThread!, 'mouseover');
        dispatchMouseEvent(resolvedThread!, 'mouseover');
        expect(TestState.shapes).toHaveLength(0);

        const resolveButton = currentThread!.querySelector('.univer-flex-shrink-0 .univer-cursor-pointer');
        expect(resolveButton).toBeInstanceOf(HTMLElement);

        act(() => {
            resolveButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(testBed.popupService.activePopup).toBeNull();
        expect(TestState.popupDisposeCount).toBe(1);
    });

    it('expands hover highlight to the whole merged cell containing the comment', () => {
        const mergedWorkbookData: IWorkbookData = {
            ...workbookData,
            sheets: {
                ...workbookData.sheets,
                [sheet1]: {
                    ...workbookData.sheets[sheet1],
                    mergeData: [
                        { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL },
                    ],
                },
            },
        };
        const testBed = createTestBed(mergedWorkbookData);
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('merged-cell-thread', sheet1, 'C3', 'Merged cell thread'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const mergedCellThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-merged-cell-thread`);
        expect(mergedCellThread).toBeInstanceOf(HTMLElement);

        dispatchMouseEvent(mergedCellThread!, 'mouseover');

        expect(TestState.shapes).toEqual([
            expect.objectContaining({
                selection: expect.objectContaining({
                    range: {
                        startRow: 1,
                        endRow: 2,
                        startColumn: 1,
                        endColumn: 2,
                        rangeType: RANGE_TYPE.NORMAL,
                    },
                }),
            }),
        ]);
    });

    it('clears the previous hover highlight when entering the active comment item', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('first-thread', sheet1, 'B2', 'First thread'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('active-thread', sheet1, 'D4', 'Active thread'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const firstThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-first-thread`);
        const activeThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-active-thread`);
        expect(firstThread).toBeInstanceOf(HTMLElement);
        expect(activeThread).toBeInstanceOf(HTMLElement);

        dispatchMouseEvent(firstThread!, 'mouseover');
        expect(TestState.shapes).toEqual([
            expect.objectContaining({
                selection: expect.objectContaining({
                    range: {
                        startRow: 1,
                        endRow: 1,
                        startColumn: 1,
                        endColumn: 1,
                    },
                }),
            }),
        ]);

        act(() => {
            testBed.panelService.setActiveComment({
                unitId,
                subUnitId: sheet1,
                commentId: 'active-thread',
                trigger: 'cell',
            });
        });
        dispatchMouseEvent(activeThread!, 'mouseover');

        expect(TestState.shapes).toHaveLength(0);
        expect(TestState.removedShapeIds).toEqual(['shape-1']);
    });

    it('activates an unresolved sheet comment from the panel and skips hover highlight for the active item', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('panel-thread', sheet1, 'E5', 'Panel thread'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const panelThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-panel-thread`);
        expect(panelThread).toBeInstanceOf(HTMLElement);

        act(() => {
            panelThread!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(testBed.panelService.activeCommentId).toEqual({
            unitId,
            subUnitId: sheet1,
            commentId: 'panel-thread',
            temp: false,
        });

        dispatchMouseEvent(panelThread!, 'mouseover');

        expect(TestState.shapes).toHaveLength(0);
    });

    it('shows only resolved threads in the resolved filter and clears the active comment when one is clicked', async () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('open-thread', sheet1, 'B2', 'Open thread'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('resolved-thread', sheet1, 'C3', 'Resolved thread', true));
        testBed.panelService.setActiveComment({
            unitId,
            subUnitId: sheet1,
            commentId: 'open-thread',
            trigger: 'cell',
        });

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            container!.querySelectorAll('[data-u-comp="select"]')[1].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        const resolvedOption = Array.from(document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]'))
            .find((button) => button.textContent === 'Resolved');

        expect(resolvedOption).toBeDefined();

        await act(async () => {
            resolvedOption!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Resolved thread');
        expect(container.textContent).not.toContain('Open thread');

        const resolvedThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-resolved-thread`);
        expect(resolvedThread).toBeInstanceOf(HTMLElement);

        act(() => {
            resolvedThread!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(testBed.panelService.activeCommentId).toBeUndefined();
    });

    it('opens the add-comment popup at the active sheet cell from the empty panel action', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.selectionService.setSelections(unitId, sheet1, [createSelection(4, 4)]);

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const addButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Add Comment'));
        expect(addButton).toBeInstanceOf(HTMLButtonElement);

        act(() => {
            addButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(testBed.popupService.activePopup).toMatchObject({
            unitId,
            subUnitId: sheet1,
            row: 4,
            col: 4,
        });
        expect(testBed.panelService.activeCommentId).toBeUndefined();
    });

    it('removes the hover highlight when the panel is hidden by service state', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.panelService.setPanelVisible(true);
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('current-sheet-thread', sheet1, 'B2', 'Current sheet B2'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const currentThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-current-sheet-thread`);
        expect(currentThread).toBeInstanceOf(HTMLElement);

        dispatchMouseEvent(currentThread!, 'mouseover');
        expect(TestState.shapes).toHaveLength(1);

        act(() => {
            testBed.panelService.setPanelVisible(false);
        });

        expect(TestState.shapes).toHaveLength(0);
        expect(TestState.removedShapeIds).toEqual(['shape-1']);
    });

    it('does not remove a stale hover highlight again after panel visibility cleanup', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.panelService.setPanelVisible(true);
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('current-sheet-thread', sheet1, 'B2', 'Current sheet B2'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const currentThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-current-sheet-thread`);
        expect(currentThread).toBeInstanceOf(HTMLElement);

        dispatchMouseEvent(currentThread!, 'mouseover');

        act(() => {
            testBed.panelService.setPanelVisible(false);
        });

        dispatchMouseEvent(currentThread!, 'mouseout');

        expect(TestState.shapes).toHaveLength(0);
        expect(TestState.removedShapeIds).toEqual(['shape-1']);
    });

    it('removes the sheet highlight and thread when a hovered panel comment is deleted', async () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('delete-thread', sheet1, 'B2', 'Delete me'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const panelThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-delete-thread`);
        expect(panelThread).toBeInstanceOf(HTMLElement);

        dispatchMouseEvent(panelThread!, 'mouseover');
        expect(TestState.shapes).toHaveLength(1);

        await act(async () => {
            getRootDeleteAction(panelThread!).dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await waitForTreeRefresh();
        });

        expect(testBed.threadCommentModel.getComment(unitId, sheet1, 'delete-thread')).toBeUndefined();
        expect(container.textContent).not.toContain('Delete me');
        expect(TestState.shapes).toHaveLength(0);
        expect(TestState.removedShapeIds).toEqual(['shape-1']);
    });

    it('renders the unresolved thread for the active cell popup and persists a temporary popup when clicked', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('resolved-thread', sheet1, 'B2', 'Resolved B2', true));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('open-thread', sheet1, 'B2', 'Open B2'));
        testBed.popupService.showPopup({
            unitId,
            subUnitId: sheet1,
            row: 1,
            col: 1,
            temp: true,
            trigger: 'hover',
        });

        const rendered = renderCell(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const cellThread = container.querySelector(`#CELL-${unitId}-${sheet1}-open-thread`);
        expect(cellThread).toBeInstanceOf(HTMLElement);
        expect(container.textContent).toContain('B2 · Sheet 1');
        expect(container.textContent).toContain('Open B2');
        expect(container.textContent).not.toContain('Resolved B2');

        act(() => {
            cellThread!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(testBed.popupService.activePopup).toEqual(expect.objectContaining({
            temp: false,
        }));
    });

    it('updates an open cell popup when a thread is added at that cell location', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.popupService.showPopup({
            unitId,
            subUnitId: sheet2,
            row: 3,
            col: 2,
            trigger: 'context-menu',
        });

        const rendered = renderCell(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        expect(container.textContent).toContain('C4 · Sheet 2');
        expect(container.textContent).not.toContain('Created after popup opens');

        act(() => {
            testBed.threadCommentModel.addComment(unitId, sheet2, createComment('created-thread', sheet2, 'C4', 'Created after popup opens'));
        });

        expect(container.textContent).toContain('Created after popup opens');
    });

    it('keeps an open cell popup scoped to its sheet when another sheet receives the same cell reference', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.popupService.showPopup({
            unitId,
            subUnitId: sheet2,
            row: 3,
            col: 2,
            trigger: 'context-menu',
        });

        const rendered = renderCell(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        expect(container.textContent).toContain('C4 · Sheet 2');

        act(() => {
            testBed.threadCommentModel.addComment(unitId, sheet1, createComment('same-cell-other-sheet', sheet1, 'C4', 'Same cell on sheet one'));
            testBed.threadCommentModel.addComment(unitId, sheet2, createComment('same-cell-current-sheet', sheet2, 'C4', 'Same cell on sheet two'));
        });

        expect(container.textContent).toContain('Same cell on sheet two');
        expect(container.textContent).not.toContain('Same cell on sheet one');
    });

    it('closes an empty cell popup when the user cancels the new comment editor', async () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.popupService.showPopup({
            unitId,
            subUnitId: sheet1,
            row: 2,
            col: 3,
            trigger: 'context-menu',
        });

        const rendered = renderCell(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        expect(container.textContent).toContain('D3 · Sheet 1');
        expect(testBed.popupService.activePopup).toMatchObject({
            unitId,
            subUnitId: sheet1,
            row: 2,
            col: 3,
        });

        const editorPlaceholder = Array.from(container.querySelectorAll('div')).reverse().find((element) => element.textContent === 'Reply or add others with @');
        expect(editorPlaceholder).toBeInstanceOf(HTMLElement);
        const editorSurface = editorPlaceholder!.parentElement?.parentElement?.parentElement;
        expect(editorSurface).toBeInstanceOf(HTMLElement);

        await act(async () => {
            editorSurface!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
            await Promise.resolve();
        });

        const cancelButton = Array.from(container.querySelectorAll('button'))
            .find((button) => button.textContent?.trim() === 'Cancel');
        expect(cancelButton).toBeInstanceOf(HTMLButtonElement);

        act(() => {
            cancelButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(testBed.popupService.activePopup).toBeNull();
        expect(TestState.popupDisposeCount).toBe(1);
    });
});
