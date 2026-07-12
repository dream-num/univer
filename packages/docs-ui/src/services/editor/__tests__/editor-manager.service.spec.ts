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

import {
    CommandService,
    ConfigService,
    ContextService,
    createParagraphId,
    DesktopLogService,
    DOCS_COMMENT_EDITOR_UNIT_ID_KEY,
    DocumentDataModel,
    EDITOR_ACTIVATED,
    FOCUSING_COMMENT_EDITOR,
    FOCUSING_EDITOR_STANDALONE,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocalUndoRedoService,
    ThemeService,
    UniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateEmitService,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { IRenderManagerService, NORMAL_TEXT_SELECTION_PLUGIN_STYLE, RenderManagerService } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReplaceSnapshotCommand } from '../../../commands/commands/replace-content.command';
import { DocSelectionRenderService } from '../../selection/doc-selection-render.service';
import { Editor } from '../editor';
import { EditorService, IEditorService } from '../editor-manager.service';

const EDITOR_ID = 'editor-1';

class TestDocSelectionRenderService {
    readonly onBlur$ = new Subject<never>();
    readonly onFocus$ = new Subject<never>();
    readonly onPaste$ = new Subject<{ event: Event; content?: string }>();
    readonly onInput$ = new Subject<{ event: Event; content?: string }>();
    readonly onKeydown$ = new Subject<{ event: KeyboardEvent; content?: string }>();
    readonly onCompositionupdate$ = new Subject<{ event: CompositionEvent; content?: string }>();
    readonly onCompositionend$ = new Subject<{ event: CompositionEvent; content?: string }>();
    isFocusing = true;
    focusCount = 0;
    blurCount = 0;

    private _activeTextRange = {
        startOffset: 0,
        endOffset: 0,
        collapsed: true,
        isActive: true,
    };

    getActiveTextRange() {
        return this._activeTextRange;
    }

    focus() {
        this.focusCount++;
    }

    blur() {
        this.blurCount++;
    }
}

class TestRender {
    constructor(private readonly _selectionRenderService: TestDocSelectionRenderService) {}

    with(service: unknown) {
        if (service === DocSelectionRenderService) {
            return this._selectionRenderService;
        }

        throw new Error(`Unexpected render service: ${String(service)}`);
    }
}

class TestRegisterViewport {
    disposed = false;
    scrollVal: unknown;

    getScrollBar() {
        return {
            dispose: () => {
                this.disposed = true;
            },
        };
    }

    updateScrollVal(value: unknown) {
        this.scrollVal = value;
    }
}

class TestRegisterRender extends TestRender {
    readonly canvas = document.createElement('canvas');
    readonly viewport = new TestRegisterViewport();
    container: HTMLDivElement | null = null;
    readonly engine = {
        canvasColorService: {},
        setContainer: (container: HTMLDivElement) => {
            this.container = container;
        },
        getCanvas: () => ({
            getCanvasEle: () => this.canvas,
        }),
    };

    readonly components = new Map();
    readonly mainComponent = {
        getScene: () => ({
            getViewports: () => [this.viewport],
        }),
    };
}

class TestRegisterRenderManagerService {
    static readonly renders = new Map<string, TestRegisterRender>();
    static readonly removedRenderIds: string[] = [];

    create(unitId: string) {
        TestRegisterRenderManagerService.renders.set(unitId, new TestRegisterRender(new TestDocSelectionRenderService()));
    }

    getRenderById(unitId: string) {
        return TestRegisterRenderManagerService.renders.get(unitId);
    }

    removeRender(unitId: string) {
        TestRegisterRenderManagerService.removedRenderIds.push(unitId);
        TestRegisterRenderManagerService.renders.delete(unitId);
    }
}

class TestMissingRenderManagerService {
    create() {}

    getRenderById() {
        return null;
    }

    removeRender() {}
}

class TestEditorRenderManagerService {
    static readonly skeleton = { unitId: EDITOR_ID };

    getRenderById(unitId: string) {
        if (unitId !== EDITOR_ID) {
            return undefined;
        }

        return {
            with: (token: unknown) => {
                if (token === DocSkeletonManagerService) {
                    return {
                        getSkeleton: () => TestEditorRenderManagerService.skeleton,
                    };
                }

                throw new Error(`Unexpected render service: ${String(token)}`);
            },
        };
    }
}

function createService(renderManagerServiceClass: unknown = RenderManagerService) {
    vi.stubGlobal('window', new EventTarget());
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
    injector.add([ThemeService]);
    injector.add([IRenderManagerService, { useClass: renderManagerServiceClass as never }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([IEditorService, { useClass: EditorService }]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    univerInstanceService.__addUnit(new DocumentDataModel({
        id: EDITOR_ID,
        body: {
            dataStream: 'abc\r\n',
            paragraphs: [{ startIndex: 3, paragraphId: createParagraphId(new Set()) }],
            sectionBreaks: [{ sectionId: 'section_fixture_237', startIndex: 4 }],
            customRanges: [],
            tables: [],
            textRuns: [],
        },
    }));
    return {
        injector,
        service: injector.get(IEditorService),
        contextService: injector.get(IContextService),
        univerInstanceService,
    };
}

function createEditor(
    injector: Injector,
    univerInstanceService: IUniverInstanceService,
    commandService: ICommandService,
    editorUnitId: string,
    selectionRenderService: TestDocSelectionRenderService,
    config: Partial<ConstructorParameters<typeof Editor>[0]> = {}
) {
    const editorDom = config.editorDom ?? document.createElement('div');

    return injector.createInstance(Editor, {
        initialSnapshot: { id: editorUnitId },
        render: new TestRender(selectionRenderService),
        editorDom,
        canvasStyle: { backgroundColor: '#ffffff' },
        scrollBar: true,
        ...config,
    } as never, univerInstanceService, injector.get(DocSelectionManagerService), commandService, injector.get(IUndoRedoService), injector);
}

describe('EditorService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        TestRegisterRenderManagerService.renders.clear();
        TestRegisterRenderManagerService.removedRenderIds.length = 0;
    });

    it('focuses the requested editor, emits caret position, and clears editor contexts on blur', () => {
        const { service, contextService, univerInstanceService } = createService();
        const focusRanges: unknown[] = [];
        const blurs: unknown[] = [];
        let editorFocused = 0;
        let editorBlurred = 0;
        service.focus$.subscribe((range) => focusRanges.push(range));
        service.blur$.subscribe((value) => blurs.push(value));
        service.getAllEditor().set('editor-1', {
            getValue: () => 'abc',
            focus: () => editorFocused++,
            blur: () => editorBlurred++,
            isSheetEditor: () => false,
        } as never);

        service.focus('editor-1');
        expect(service.getFocusId()).toBe('editor-1');
        expect(univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)?.getUnitId()).toBe('editor-1');
        expect(editorFocused).toBe(1);
        expect(focusRanges).toEqual([{ startOffset: 3, endOffset: 3 }]);
        expect(service.getEditor()).toBe(service.getEditor('editor-1'));

        service.focus('editor-1');
        expect(editorFocused).toBe(1);
        expect(service.getFocusId()).toBe('editor-1');

        service.blur();
        expect(service.getFocusId()).toBeNull();
        expect(editorBlurred).toBe(1);
        expect(blurs).toEqual([null]);
        expect(contextService.getContextValue(EDITOR_ACTIVATED)).toBe(false);

        service.focus('missing-editor');
        expect(service.getFocusId()).toBeNull();
        expect(editorFocused).toBe(1);
    });

    it('turns render-layer editing activity into editor events and document updates', async () => {
        const { injector, univerInstanceService } = createService();
        const commandService = injector.get(ICommandService);
        commandService.registerCommand(ReplaceSnapshotCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionRenderService = new TestDocSelectionRenderService();
        const editor = injector.createInstance(Editor, {
            initialSnapshot: { id: EDITOR_ID },
            render: new TestRender(selectionRenderService),
            editorDom: document.createElement('div'),
        } as never, univerInstanceService, injector.get(DocSelectionManagerService), commandService, injector.get(IUndoRedoService), injector);
        const selectionManagerService = injector.get(DocSelectionManagerService);
        const inputs: string[] = [];
        const pastes: string[] = [];
        const focusEvents: unknown[] = [];
        const blurEvents: unknown[] = [];
        const changeEvents: string[] = [];
        const selections: string[] = [];
        const refreshSelections: string[] = [];
        editor.focus$.subscribe((event) => focusEvents.push(event));
        editor.blur$.subscribe((event) => blurEvents.push(event));
        editor.change$.subscribe(({ data }) => {
            changeEvents.push(data.body?.dataStream ?? '');
        });
        editor.input$.subscribe(({ content, isComposing }) => {
            inputs.push(`${content}:${isComposing}`);
        });
        editor.paste$.subscribe(({ content }) => {
            pastes.push(content ?? '');
        });
        editor.selectionChange$.subscribe(({ textRanges }) => {
            for (const range of textRanges) {
                selections.push(`${range.startOffset}:${range.endOffset}:${range.collapsed}`);
            }
        });
        selectionManagerService.refreshSelection$.subscribe((selection) => {
            if (!selection) {
                return;
            }

            for (const range of selection.docRanges) {
                refreshSelections.push(`${range.startOffset}:${range.endOffset}`);
            }
        });

        selectionRenderService.onFocus$.next({ type: 'focus' } as never);
        selectionRenderService.onInput$.next({ event: new InputEvent('input'), content: 'd' });
        selectionRenderService.onKeydown$.next({ event: { type: 'keydown', ctrlKey: true, keyCode: 88 } as KeyboardEvent, content: 'cut' });
        selectionRenderService.onKeydown$.next({ event: { type: 'keydown', keyCode: 8 } as KeyboardEvent, content: '' });
        selectionRenderService.onCompositionupdate$.next({ event: new CompositionEvent('compositionupdate'), content: '拼' });
        selectionRenderService.onPaste$.next({ event: new Event('paste'), content: 'paste-text' });
        selectionRenderService.onBlur$.next({ type: 'blur' } as never);
        selectionManagerService.__TEST_ONLY_setCurrentSelection({ unitId: EDITOR_ID, subUnitId: EDITOR_ID });
        selectionManagerService.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 1,
                endOffset: 2,
                collapsed: false,
                isActive: true,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId: EDITOR_ID, subUnitId: EDITOR_ID });
        editor.replaceText('quarterly');
        await Promise.resolve();

        expect(focusEvents).toEqual([{ type: 'focus' }]);
        expect(blurEvents).toEqual([{ type: 'blur' }]);
        expect(changeEvents).toEqual(['abc\r\n']);
        expect(inputs).toEqual(['d:false', 'cut:false', ':false', '拼:true', 'paste-text:false']);
        expect(pastes).toEqual(['paste-text']);
        expect(selections).toEqual(['1:2:false']);
        expect(editor.getDocumentData().body?.dataStream).toBe('quarterly\r\n');
        expect(refreshSelections.at(-1)).toBe('9:9');
        expect(univerInstanceService.getUnit<DocumentDataModel>(EDITOR_ID)?.getBody()?.dataStream).toBe('quarterly\r\n');

        editor.dispose();
    });

    it('exposes editor state and selection APIs used by host UI', () => {
        const { injector, univerInstanceService } = createService(TestEditorRenderManagerService);
        const commandService = injector.get(ICommandService);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionRenderService = new TestDocSelectionRenderService();
        const editorDom = document.createElement('div');
        const editor = createEditor(
            injector,
            univerInstanceService,
            commandService,
            EDITOR_ID,
            selectionRenderService,
            {
                cancelDefaultResizeListener: true,
                editorDom,
                readonly: true,
                visible: false,
            } as never
        );
        const selectionManagerService = injector.get(DocSelectionManagerService);
        const refreshedSelections: string[] = [];
        selectionManagerService.refreshSelection$.subscribe((selection) => {
            if (!selection) {
                return;
            }

            for (const range of selection.docRanges) {
                refreshedSelections.push(`${range.startOffset}:${range.endOffset}`);
            }
        });

        expect(editor.docSelectionRenderService).toBe(selectionRenderService);
        expect(editor.isFocus()).toBe(true);
        selectionRenderService.isFocusing = false;
        expect(editor.isFocus()).toBe(false);

        editor.setSelectionRanges([{ startOffset: 1, endOffset: 2 }], false);
        selectionManagerService.__TEST_ONLY_setCurrentSelection({ unitId: EDITOR_ID, subUnitId: EDITOR_ID });
        selectionManagerService.__replaceTextRangesWithNoRefresh({
            textRanges: [{ startOffset: 2, endOffset: 2, collapsed: true, isActive: true }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId: EDITOR_ID, subUnitId: EDITOR_ID });

        expect(refreshedSelections.at(-1)).toBe('1:2');
        expect(editor.getSelectionRanges()[0].startOffset).toBe(2);
        expect(editor.getCursorPosition()).toBe(2);

        editor.select();
        expect(refreshedSelections.at(-1)).toBe('0:3');
        expect(editor.getDocumentDataModel()).toBe(univerInstanceService.getUnit<DocumentDataModel>(EDITOR_ID));
        expect(editor.cancelDefaultResizeListener).toBe(true);
        expect(editor.isReadOnly()).toBe(true);
        expect(editor.getBoundingClientRect()).toEqual(editorDom.getBoundingClientRect());
        expect(editor.editorDOM).toBe(editorDom);
        expect(editor.isVisible()).toBe(false);
        expect(editor.getSkeleton()).toBe(TestEditorRenderManagerService.skeleton);
        expect(editor.isSheetEditor()).toBe(false);
    });

    it('tracks editor focus context when moving between standalone and comment editors', () => {
        const { injector, service, contextService, univerInstanceService } = createService();
        const commandService = injector.get(ICommandService);
        const commentEditorId = `${DOCS_COMMENT_EDITOR_UNIT_ID_KEY}_comment-1`;
        univerInstanceService.__addUnit(new DocumentDataModel({
            id: commentEditorId,
            body: {
                dataStream: 'note\r\n',
                paragraphs: [{ startIndex: 0, paragraphId: createParagraphId(new Set()) }],
                sectionBreaks: [],
                customRanges: [],
                tables: [],
                textRuns: [],
            },
        }));
        const standaloneSelection = new TestDocSelectionRenderService();
        const commentSelection = new TestDocSelectionRenderService();
        const standaloneEditor = createEditor(injector, univerInstanceService, commandService, EDITOR_ID, standaloneSelection);
        const commentEditor = createEditor(injector, univerInstanceService, commandService, commentEditorId, commentSelection);
        const selectionRefreshes: number[] = [];
        injector.get(DocSelectionManagerService).refreshSelection$.subscribe((selection) => {
            if (selection) {
                selectionRefreshes.push(selection.docRanges.length);
            }
        });
        service.getAllEditor().set(EDITOR_ID, standaloneEditor);
        service.getAllEditor().set(commentEditorId, commentEditor);

        service.focus(EDITOR_ID);
        expect(service.getFocusEditor()).toBe(standaloneEditor);
        expect(service.getEditorRenderConfig(EDITOR_ID)).toEqual({
            canvasStyle: { backgroundColor: '#ffffff' },
            scrollBar: true,
        });
        expect(contextService.getContextValue(EDITOR_ACTIVATED)).toBe(true);
        expect(contextService.getContextValue(FOCUSING_EDITOR_STANDALONE)).toBe(true);
        expect(contextService.getContextValue(FOCUSING_COMMENT_EDITOR)).toBe(false);
        expect(standaloneSelection.focusCount).toBe(1);

        service.focus(commentEditorId);
        expect(service.getFocusId()).toBe(commentEditorId);
        expect(contextService.getContextValue(FOCUSING_EDITOR_STANDALONE)).toBe(false);
        expect(contextService.getContextValue(FOCUSING_COMMENT_EDITOR)).toBe(true);
        expect(standaloneSelection.blurCount).toBe(1);
        expect(commentSelection.focusCount).toBe(1);

        service.blur(true);
        expect(service.getFocusId()).toBeNull();
        expect(contextService.getContextValue(EDITOR_ACTIVATED)).toBe(false);
        expect(selectionRefreshes.at(-1)).toBe(0);

        standaloneEditor.dispose();
        commentEditor.dispose();
    });

    it('registers an editor render and cleans it up with the returned disposable', () => {
        const { service, univerInstanceService } = createService(TestRegisterRenderManagerService);
        const editorUnitId = EDITOR_ID;
        const container = document.createElement('div');
        const disposable = service.register({
            initialSnapshot: {
                id: editorUnitId,
                body: {
                    dataStream: 'draft\r\n',
                    paragraphs: [{ startIndex: 0, paragraphId: createParagraphId(new Set()) }],
                    sectionBreaks: [],
                    customRanges: [],
                    tables: [],
                    textRuns: [],
                },
                documentStyle: {},
            },
            canvasStyle: { backgroundColor: '#ffffff' },
            scrollBar: false,
        }, container);
        const render = TestRegisterRenderManagerService.renders.get(editorUnitId)!;

        expect(service.isEditor(editorUnitId)).toBe(true);
        expect(service.getEditor(editorUnitId)?.getEditorId()).toBe(editorUnitId);
        expect(service.getEditorRenderConfig(editorUnitId)).toEqual({
            canvasStyle: { backgroundColor: '#ffffff' },
            scrollBar: false,
        });
        expect(render.container).toBe(container);
        expect(render.viewport.disposed).toBe(true);
        expect(render.viewport.scrollVal).toEqual({
            scrollX: 0,
            scrollY: 0,
            viewportScrollX: 0,
            viewportScrollY: 0,
        });
        expect(univerInstanceService.getUnit<DocumentDataModel>(editorUnitId)?.getBody()?.dataStream).toBe('abc\r\n');

        disposable.dispose();

        expect(service.isEditor(editorUnitId)).toBe(false);
        expect(TestRegisterRenderManagerService.removedRenderIds).toEqual([editorUnitId]);
        expect(univerInstanceService.getUnit<DocumentDataModel>(editorUnitId)).toBeUndefined();
    });

    it('keeps render config without an editor when no render is available and removes it on dispose', () => {
        const { service } = createService(TestMissingRenderManagerService);
        const disposable = service.register({
            initialSnapshot: {
                id: EDITOR_ID,
                body: {
                    dataStream: 'abc\r\n',
                    paragraphs: [{ startIndex: 0, paragraphId: createParagraphId(new Set()) }],
                    sectionBreaks: [],
                    customRanges: [],
                    tables: [],
                    textRuns: [],
                },
                documentStyle: {},
            },
            canvasStyle: { fontSize: 14 },
            scrollBar: true,
        }, document.createElement('div'));

        expect(service.getEditor(EDITOR_ID)).toBeUndefined();
        expect(service.isEditor(EDITOR_ID)).toBe(true);
        expect(service.getEditorRenderConfig(EDITOR_ID)).toEqual({
            canvasStyle: { fontSize: 14 },
            scrollBar: true,
        });

        disposable.dispose();

        expect(service.isEditor(EDITOR_ID)).toBe(false);
        expect(service.getEditorRenderConfig(EDITOR_ID)).toBeNull();
    });

    it('blurs a focused non-sheet editor when focus moves outside editor-owned DOM', () => {
        const { service } = createService();
        let blurred = 0;
        service.getAllEditor().set(EDITOR_ID, {
            getValue: () => 'abc',
            focus: () => {},
            blur: () => blurred++,
            isSheetEditor: () => false,
        } as never);
        service.focus(EDITOR_ID);

        const externalTarget = document.createElement('button');
        const externalFocusEvent = new Event('focusin');
        Object.defineProperty(externalFocusEvent, 'target', { value: externalTarget });
        window.dispatchEvent(externalFocusEvent);

        expect(blurred).toBe(1);
        expect(service.getFocusId()).toBeNull();
    });

    it('keeps editor focus when focus moves within editor-owned DOM or the active editor is a sheet editor', () => {
        const { service } = createService();
        let standaloneBlurred = 0;
        service.getAllEditor().set(EDITOR_ID, {
            getValue: () => 'abc',
            focus: () => {},
            blur: () => standaloneBlurred++,
            isSheetEditor: () => false,
        } as never);
        service.focus(EDITOR_ID);

        const editorTarget = document.createElement('div');
        editorTarget.dataset.uComp = 'editor';
        const editorFocusEvent = new Event('focusin');
        Object.defineProperty(editorFocusEvent, 'target', { value: editorTarget });
        window.dispatchEvent(editorFocusEvent);

        expect(standaloneBlurred).toBe(0);
        expect(service.getFocusId()).toBe(EDITOR_ID);

        service.getAllEditor().set(EDITOR_ID, {
            getValue: () => 'cell',
            focus: () => {},
            blur: () => standaloneBlurred++,
            isSheetEditor: () => true,
        } as never);

        const externalTarget = document.createElement('button');
        const externalFocusEvent = new Event('focusin');
        Object.defineProperty(externalFocusEvent, 'target', { value: externalTarget });
        window.dispatchEvent(externalFocusEvent);

        expect(service.isSheetEditor('missing-editor')).toBe(false);
        expect(standaloneBlurred).toBe(0);
        expect(service.getFocusId()).toBe(EDITOR_ID);
    });

    it('clears registered editor state when the service is disposed', () => {
        const { service } = createService(TestMissingRenderManagerService);
        service.register({
            initialSnapshot: {
                id: EDITOR_ID,
                body: {
                    dataStream: 'abc\r\n',
                    paragraphs: [{ startIndex: 0, paragraphId: createParagraphId(new Set()) }],
                    sectionBreaks: [],
                    customRanges: [],
                    tables: [],
                    textRuns: [],
                },
                documentStyle: {},
            },
            canvasStyle: { fontSize: 12 },
            scrollBar: true,
        }, document.createElement('div'));

        expect(service.isEditor(EDITOR_ID)).toBe(true);

        (service as EditorService).dispose();

        expect(service.isEditor(EDITOR_ID)).toBe(false);
        expect(service.getEditorRenderConfig(EDITOR_ID)).toBeNull();
    });
});
