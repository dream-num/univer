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

import type { DocumentDataModel, IDisposable, IDocumentBody, IDocumentData, Nullable } from '@univerjs/core';
import type { ISuccinctDocRangeParam, Scene } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import type { IEditorConfigParams } from './editor';
import { createIdentifier, DEFAULT_EMPTY_DOCUMENT_VALUE, Disposable, EDITOR_ACTIVATED, FOCUSING_EDITOR_STANDALONE, HorizontalAlign, ICommandService, IContextService, Inject, Injector, isInternalEditorID, IUndoRedoService, IUniverInstanceService, toDisposable, UniverInstanceType, VerticalAlign } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { fromEvent, Subject } from 'rxjs';
import { Editor } from './editor';

/**
 * Not these elements will be considered as editor blur.
 */
const editorFocusInElements = [
    'editor',
    'render-canvas',
    // 'univer-range-selector',
    // 'univer-range-selector-editor',
    // 'univer-text-editor-container-placeholder',
];

export interface IEditorSetValueParam {
    editorUnitId: string;
    body: IDocumentBody;
}

export interface IEditorInputFormulaParam {
    editorUnitId: string;
    formulaString: string;
}

export interface IEditorService {
    getEditor(id?: string): Readonly<Nullable<Editor>>;

    register(config: IEditorConfigParams, container: HTMLDivElement): IDisposable;

    getAllEditor(): Map<string, Editor>;

    isEditor(editorUnitId: string): boolean;

    isSheetEditor(editorUnitId: string): boolean;

    blur$: Observable<unknown>;
    blur(force?: boolean): void;

    focus$: Observable<ISuccinctDocRangeParam>;
    focus(editorUnitId: string): void;

    getFocusId(): Nullable<string>;
    getFocusEditor(): Readonly<Nullable<Editor>>;
}

export class EditorService extends Disposable implements IEditorService, IDisposable {
    private _editors = new Map<string, Editor>();

    private _focusEditorUnitId: Nullable<string>;

    private readonly _blur$ = new Subject();
    readonly blur$ = this._blur$.asObservable();

    private readonly _focus$ = new Subject<ISuccinctDocRangeParam>();
    readonly focus$ = this._focus$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @IContextService private readonly _contextService: IContextService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initUniverFocusListener();
    }

    // REFACTOR: @Gggpound The specific business processing should not be placed here,
    // I moved from the layout service. https://github.com/dream-num/univer-pro/issues/1708
    private _initUniverFocusListener() {
        this.disposeWithMe(
            fromEvent(window, 'focusin').subscribe((event) => {
                const target = event.target as HTMLElement;
                this._blurSheetEditor(target);
            })
        );
    }

    private _blurSheetEditor(target: HTMLElement) {
        if (editorFocusInElements.some((item) => target.dataset.uComp === item)) {
            return;
        }

        const focusEditor = this.getFocusEditor();
        if (focusEditor && focusEditor.isSheetEditor() !== true) {
            this.blur();
        }
    }

    private _setFocusId(id: Nullable<string>) {
        this._focusEditorUnitId = id;
    }

    getFocusId() {
        return this._focusEditorUnitId;
    }

    getFocusEditor() {
        if (this._focusEditorUnitId) {
            return this.getEditor(this._focusEditorUnitId);
        }
    }

    isEditor(editorUnitId: string) {
        return this._editors.has(editorUnitId);
    }

    isSheetEditor(editorUnitId: string) {
        const editor = this._editors.get(editorUnitId);
        return !!(editor && editor.isSheetEditor());
    }

    blur(force?: boolean) {
        const focusingEditor = this.getFocusEditor();
        if (force) {
            focusingEditor?.setSelectionRanges([]);
        }
        focusingEditor?.blur();

        this._contextService.setContextValue(EDITOR_ACTIVATED, false);
        this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, false);
        this._setFocusId(null);
        this._blur$.next(null);
    }

    focus(editorUnitId: string) {
        if (editorUnitId === this._focusEditorUnitId) {
            return;
        }
        if (this._focusEditorUnitId) {
            this.blur();
        }
        if (editorUnitId == null) {
            return;
        }

        const editor = this.getEditor(editorUnitId);
        if (editor == null) {
            return;
        }

        this._univerInstanceService.setCurrentUnitForType(editorUnitId);
        const valueCount = editor.getValue().length;
        this._contextService.setContextValue(EDITOR_ACTIVATED, true);

        if (!isInternalEditorID(editorUnitId)) {
            this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, true);
        }

        editor.focus();
        this._setFocusId(editorUnitId);

        this._focus$.next({
            startOffset: valueCount,
            endOffset: valueCount,
        });
    }

    override dispose(): void {
        this._editors.clear();
        super.dispose();
    }

    getEditor(id: string = this._getCurrentEditorUnitId()): Readonly<Nullable<Editor>> {
        return this._editors.get(id);
    }

    getAllEditor() {
        return this._editors;
    }

    register(config: IEditorConfigParams, container: HTMLDivElement): IDisposable {
        const { initialSnapshot, canvasStyle = {} } = config;
        const editorUnitId = initialSnapshot.id;

        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(editorUnitId, UniverInstanceType.UNIVER_DOC);

        if (documentDataModel == null) {
            this._univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(
                UniverInstanceType.UNIVER_DOC,
                initialSnapshot || this._getBlank(editorUnitId),
                { makeCurrent: false }
            );
        }

        let render = this._renderManagerService.getRenderById(editorUnitId);
        if (render == null) {
            this._renderManagerService.create(editorUnitId);
            render = this._renderManagerService.getRenderById(editorUnitId);
        }

        if (render) {
            render.engine.setContainer(container);

            const editor = new Editor(
                { ...config, render, editorDom: container, canvasStyle },
                this._univerInstanceService,
                this._docSelectionManagerService,
                this._commandService,
                this._undoRedoService,
                this._injector
            );

            this._editors.set(editorUnitId, editor);

            // Delete scroll bar
            if (!config.scrollBar) {
                (render.mainComponent?.getScene() as Scene)?.getViewports()?.[0].getScrollBar()?.dispose();
            }
        }
        return toDisposable(() => {
            this._unRegister(editorUnitId);
        });
    }

    private _unRegister(editorUnitId: string) {
        const editor = this._editors.get(editorUnitId);
        if (editor == null) {
            return;
        }

        this._renderManagerService.removeRender(editorUnitId);
        editor.dispose();
        this._editors.delete(editorUnitId);
        this._univerInstanceService.disposeUnit(editorUnitId);
    }

    private _getCurrentEditorUnitId() {
        const current = this._univerInstanceService.getCurrentUniverDocInstance()!;
        return current.getUnitId();
    }

    private _getBlank(id: string) {
        return {
            id,
            body: {
                dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
                textRuns: [],
                paragraphs: [
                    {
                        startIndex: 0,
                    },
                ],
            },
            documentStyle: {
                renderConfig: {
                    verticalAlign: VerticalAlign.TOP,
                    horizontalAlign: HorizontalAlign.LEFT,
                },
                marginLeft: 3,
                marginTop: 0,
                marginRight: 3,
            },
        } as IDocumentData;
    }
}

export const IEditorService = createIdentifier<IEditorService>('univer.editor.service');
