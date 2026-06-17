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
} from '@univerjs/core';
import {
    DocSelectionManagerService,
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

function createService() {
    vi.stubGlobal('window', new EventTarget());
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
    injector.add([ThemeService]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([IEditorService, { useClass: EditorService }]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    univerInstanceService.__addUnit(new DocumentDataModel({
        id: EDITOR_ID,
        body: {
            dataStream: 'abc\r\n',
            paragraphs: [{ startIndex: 0, paragraphId: createParagraphId(new Set()) }],
            sectionBreaks: [],
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
    selectionRenderService: TestDocSelectionRenderService
) {
    return injector.createInstance(Editor, {
        initialSnapshot: { id: editorUnitId },
        render: new TestRender(selectionRenderService),
        editorDom: document.createElement('div'),
        canvasStyle: { backgroundColor: '#ffffff' },
        scrollBar: true,
    } as never, univerInstanceService, injector.get(DocSelectionManagerService), commandService, injector.get(IUndoRedoService), injector);
}

describe('EditorService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
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
        expect(univerInstanceService.getCurrentUniverDocInstance()?.getUnitId()).toBe('editor-1');
        expect(editorFocused).toBe(1);
        expect(focusRanges).toEqual([{ startOffset: 3, endOffset: 3 }]);

        service.blur();
        expect(service.getFocusId()).toBeNull();
        expect(editorBlurred).toBe(1);
        expect(blurs).toEqual([null]);
        expect(contextService.getContextValue(EDITOR_ACTIVATED)).toBe(false);
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
        const selections: string[] = [];
        const refreshSelections: string[] = [];
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

        selectionRenderService.onInput$.next({ event: new InputEvent('input'), content: 'd' });
        selectionRenderService.onCompositionupdate$.next({ event: new CompositionEvent('compositionupdate'), content: '拼' });
        selectionRenderService.onPaste$.next({ event: new Event('paste'), content: 'paste-text' });
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

        expect(inputs).toEqual(['d:false', '拼:true', 'paste-text:false']);
        expect(pastes).toEqual(['paste-text']);
        expect(selections).toEqual(['1:2:false']);
        expect(editor.getDocumentData().body?.dataStream).toBe('quarterly\r\n');
        expect(refreshSelections.at(-1)).toBe('9:9');
        expect(univerInstanceService.getUnit<DocumentDataModel>(EDITOR_ID)?.getBody()?.dataStream).toBe('quarterly\r\n');

        editor.dispose();
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
});
