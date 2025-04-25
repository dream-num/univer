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

import type { DocumentDataModel, ICommandService, IDocumentData, IDocumentStyle, Injector, IPosition, IUndoRedoService, IUniverInstanceService, Nullable } from '@univerjs/core';
import type { DocSelectionManagerService } from '@univerjs/docs';
import type { IDocSelectionInnerParam, IRender, ISuccinctDocRangeParam, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import type { IEditorInputConfig } from '../selection/doc-selection-render.service';
import { Disposable, isInternalEditorID, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { KeyCode } from '@univerjs/ui';
import { merge, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ReplaceSnapshotCommand } from '../../commands/commands/replace-content.command';
import { DocSelectionRenderService } from '../selection/doc-selection-render.service';

interface IEditorEvent {
    target: IEditor;
    data: IDocumentData;
}

interface IEditorInputEvent extends IEditorEvent {
    content: string; // Returns a string with the inserted characters. This may be an empty string if the change doesn't insert text (for example, when deleting characters).
    // Returns a Boolean value indicating if the event is fired after compositionstart and before compositionend.
    isComposing: boolean;
}

interface IEditor {
    // Events.
    // Emit change event when editor lose focus.
    change$: Observable<IEditorEvent>;
    // The input event fires when the value of a editor has been changed as a direct result of a user action.
    input$: Observable<IEditorInputEvent>;
    // paste event.
    paste$: Observable<IEditorInputConfig>;
    // Editor get focus.
    focus$: Observable<IEditorInputConfig>;
    // Editor lose focus.
    blur$: Observable<IEditorInputConfig>;
    // Emit when doc selection changed.
    selectionChange$: Observable<IDocSelectionInnerParam>;

    isFocus(): boolean;
    // Methods
    // The focused editor is the editor that will receive keyboard and similar events by default.
    focus(): void;
    // The Editor.blur() method removes keyboard focus from the current editor.
    blur(): void;
    // has focus.
    // Selects the entire content of the editor.
    // Calling editor.select() will not necessarily focus the editor, so it is often used with Editor.focus
    select(): void;
    // Selects the specified range of characters within editor.
    setSelectionRanges(ranges: ISuccinctDocRangeParam[]): void;
    // Get current doc ranges. include text range and rect range.
    getSelectionRanges(): ITextRangeWithStyle[];
    // get editor id.
    getEditorId(): string;
    // get document data.
    getDocumentData(): IDocumentData;
    // Set the new document data.
    setDocumentData(data: IDocumentData): void;
    // Clear the undo redo history of this editor.
    clearUndoRedoHistory(): void;
}

export interface IEditorStateParams extends Partial<IPosition> {
    visible?: boolean;
}

export interface IEditorCanvasStyle {
    fontSize?: number;
}

export interface IEditorConfigParams {
    initialSnapshot: IDocumentData;
    cancelDefaultResizeListener?: boolean;
    canvasStyle?: IEditorCanvasStyle;
    // A Boolean attribute which, if present, indicates that the editor should automatically have focus.
    // No more than one editor in the document may have the autofocus attribute.
    // If put on more than one editor, the first one with the attribute receives focus.
    autofocus?: boolean; // default false.
    // Boolean. The value is not editable
    readonly?: boolean;

    backScrollOffset?: number;
    // The unique id of editor.
    editorUnitId?: string;

    // show scrollBar
    scrollBar?: boolean;
}

export interface IEditorOptions extends IEditorConfigParams, IEditorStateParams {
    render: IRender;
    editorDom: HTMLDivElement;
}

export class Editor extends Disposable implements IEditor {
    // Emit change event when editor lose focus.
    private readonly _change$ = new Subject<IEditorEvent>();
    change$: Observable<IEditorEvent> = this._change$.asObservable();

    // The input event fires when the value of a editor has been changed as a direct result of a user action.
    private readonly _input$ = new Subject<IEditorInputEvent>();
    input$: Observable<IEditorInputEvent> = this._input$.asObservable();

    // paste event.
    private readonly _paste$ = new Subject<IEditorInputConfig>();
    paste$: Observable<IEditorInputConfig> = this._paste$.asObservable();

    // Editor get focus.
    private readonly _focus$ = new Subject<IEditorInputConfig>();
    focus$: Observable<IEditorInputConfig> = this._focus$.asObservable();

    // Editor lose focus.
    private readonly _blur$ = new Subject<IEditorInputConfig>();
    blur$: Observable<IEditorInputConfig> = this._blur$.asObservable();

    // Emit when doc selection changed.
    private readonly _selectionChange$ = new Subject<IDocSelectionInnerParam>();
    selectionChange$: Observable<IDocSelectionInnerParam> = this._selectionChange$.asObservable();

    constructor(
        private _param: IEditorOptions,
        private _univerInstanceService: IUniverInstanceService,
        private _docSelectionManagerService: DocSelectionManagerService,
        private _commandService: ICommandService,
        private _undoRedoService: IUndoRedoService,
        private _injector: Injector
    ) {
        super();

        this._listenSelection();
    }

    get docSelectionRenderService() {
        return this._param.render.with(DocSelectionRenderService);
    }

    private _listenSelection() {
        const docSelectionRenderService = this._param.render.with(DocSelectionRenderService);

        this.disposeWithMe(
            docSelectionRenderService.onBlur$.subscribe((e) => {
                this._blur$.next(e);

                const data = this.getDocumentData();

                this._change$.next({
                    target: this,
                    data,
                });
            })
        );

        this.disposeWithMe(
            docSelectionRenderService.onFocus$.subscribe((e) => {
                this._focus$.next(e);
            })
        );

        this.disposeWithMe(
            docSelectionRenderService.onPaste$.subscribe((e) => {
                this._paste$.next(e);
            })
        );

        this.disposeWithMe(
            merge(
                docSelectionRenderService.onInput$,
                docSelectionRenderService.onKeydown$.pipe(filter((e) => {
                    const event = e.event as KeyboardEvent;
                    if (event.ctrlKey || event.metaKey) {
                        return [KeyCode.X, KeyCode.V].includes(event.keyCode);
                    }
                    return [KeyCode.BACKSPACE].includes(event.keyCode);
                })),
                docSelectionRenderService.onCompositionupdate$,
                docSelectionRenderService.onCompositionend$,
                docSelectionRenderService.onPaste$
            )
                .subscribe((e) => {
                    if (e == null) {
                        return;
                    }

                    const { content = '' } = e;
                    const data = this.getDocumentData();

                    this._input$.next({
                        target: this,
                        content,
                        data,
                        isComposing: e.event.type === 'compositionupdate',
                    });
                })
        );

        this.disposeWithMe(
            this._docSelectionManagerService.textSelection$.subscribe((e) => {
                if (e == null) {
                    return;
                }

                const { unitId, subUnitId, ...params } = e;
                const editorId = this.getEditorId();

                if (unitId === editorId) {
                    this._selectionChange$.next(params);
                }
            })
        );
    }

    isFocus() {
        const docSelectionRenderService = this._param.render.with(DocSelectionRenderService);
        return docSelectionRenderService.isFocusing && Boolean(docSelectionRenderService.getActiveTextRange());
    }

    /**
     * @deprecated use `IEditorService.focus` as instead. this is for internal usage.
     */
    focus() {
        const curDoc = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC);
        const editorUnitId = this.getEditorId();
        // Step 1: set current editor to currentDocUnit.
        if (curDoc == null || curDoc.getUnitId() !== editorUnitId) {
            this._univerInstanceService.setCurrentUnitForType(editorUnitId);
        }

        // Step 2: Focus this input element.
        const docSelectionRenderService = this._param.render.with(DocSelectionRenderService);
        docSelectionRenderService.focus();
    }

    /**
     * @deprecated use `IEditorService.blur` as instead. this is for internal usage.
     */
    blur(): void {
        const docSelectionRenderService = this._param.render.with(DocSelectionRenderService);
        docSelectionRenderService.blur();
    }

    // Selects the entire content of the editor.
    // Calling editor.select() will not necessarily focus the editor, so it is often used with Editor.focus
    select(): void {
        const documentData = this.getDocumentData();

        return this.setSelectionRanges([{
            startOffset: 0,
            endOffset: documentData.body ? documentData.body.dataStream.length - 2 : 0,
        }]);
    }

    // Selects the specified range of characters within editor.
    setSelectionRanges(ranges: ISuccinctDocRangeParam[], shouldFocus = true): void {
        const editorUnitId = this.getEditorId();
        const params = {
            unitId: editorUnitId,
            subUnitId: editorUnitId,
        };

        return this._docSelectionManagerService.replaceDocRanges(ranges, params, false, { shouldFocus });
    }

    // Get current doc ranges. include text range and rect range.
    getSelectionRanges(): ITextRangeWithStyle[] {
        const editorUnitId = this.getEditorId();
        const params = {
            unitId: editorUnitId,
            subUnitId: editorUnitId,
        };

        return this._docSelectionManagerService.getDocRanges(params);
    }

    getCursorPosition(): number {
        const selectionRanges = this.getSelectionRanges();

        return selectionRanges.find((range) => range.collapsed)?.startOffset ?? -1;
    }

    // get editor id.
    getEditorId(): string {
        return this._getEditorId();
    }

    // get document data.
    getDocumentData(): IDocumentData {
        const docDataModel = this._getDocDataModel();

        return docDataModel.getSnapshot();
    }

    getDocumentDataModel() {
        return this._getDocDataModel();
    }

    // Set the new document data.
    setDocumentData(data: IDocumentData, textRanges: Nullable<ITextRangeWithStyle[]>) {
        this._commandService.syncExecuteCommand(ReplaceSnapshotCommand.id, {
            unitId: this.getEditorId(),
            snapshot: data,
            textRanges,
        });
    }

    replaceText(text: string, resetCursor: boolean | ITextRangeWithStyle[] = true) {
        const data = this.getDocumentData();

        this.setDocumentData(
            {
                ...data,
                body: {
                    dataStream: `${text}\r\n`,
                    paragraphs: [{
                        startIndex: 0,
                    }],
                    customRanges: [],
                    sectionBreaks: [],
                    tables: [],
                    textRuns: [],
                },
            },
            typeof resetCursor === 'object'
                ? resetCursor
                : resetCursor
                    ? [{
                        startOffset: text.length,
                        endOffset: text.length,
                        collapsed: true,
                    }]
                    : null
        );
    }

    // Clear the undo redo history of this editor.
    clearUndoRedoHistory(): void {
        const editorUnitId = this.getEditorId();

        return this._undoRedoService.clearUndoRedo(editorUnitId);
    }

    override dispose(): void {
        const docDataModel = this._getDocDataModel();

        docDataModel.dispose();
    }

    /**
     * @deprecated use getEditorId.
     */
    get editorUnitId() {
        return this._param.editorUnitId;
    }

    /**
     * @deprecated @TODO: @JOCS remove this in the future.
     */
    get params() {
        return this._param;
    }

    get cancelDefaultResizeListener() {
        return this._param.cancelDefaultResizeListener;
    }

    get render() {
        return this._param.render;
    }

    isReadOnly() {
        return this._param.readonly === true;
    }

    getBoundingClientRect() {
        return this._param.editorDom.getBoundingClientRect();
    }

    get editorDOM() {
        return this._param.editorDom;
    }

    isVisible() {
        return this._param.visible;
    }

    getSkeleton() {
        const skeleton = this._injector.get(IRenderManagerService).getRenderById(this._getEditorId())?.with(DocSkeletonManagerService).getSkeleton();
        return skeleton;
    }

    isSheetEditor() {
        return isInternalEditorID(this._getEditorId());
    }

    /**
     * @deprecated use getDocumentData.
     */
    getValue() {
        const docDataModel = this._getDocDataModel();
        const value = docDataModel.getBody()?.dataStream || '';
        return value.replace(/\r\n/g, '').replace(/\n/g, '').replace(/\n/g, '');
    }

    /**
     * @deprecated use getDocumentData.
     */
    getBody() {
        const docDataModel = this._getDocDataModel();
        return docDataModel.getBody();
    }

    /**
     * @deprecated.
     */
    update(param: Partial<IEditorOptions>) {
        this._param = {
            ...this._param,
            ...param,
        };
    }

    /**
     * @deprecated.
     */
    updateCanvasStyle() {
        const docDataModel = this._getDocDataModel();
        if (docDataModel == null) {
            return;
        }

        const documentStyle: IDocumentStyle = {};

        if (this._param.canvasStyle?.fontSize) {
            if (documentStyle.textStyle == null) {
                documentStyle.textStyle = {};
            }

            documentStyle.textStyle.fs = this._param.canvasStyle.fontSize;
        }

        docDataModel.updateDocumentStyle(documentStyle);
    }

    private _getDocDataModel() {
        const editorUnitId = this._getEditorId();
        const docDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(editorUnitId, UniverInstanceType.UNIVER_DOC)!;

        return docDataModel;
    }

    private _getEditorId() {
        return this._param.initialSnapshot?.id || this._param.editorUnitId || '';
    }
}
