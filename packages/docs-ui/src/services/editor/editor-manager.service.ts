/**
 * Copyright 2023-present DreamNum Inc.
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

import type { DocumentDataModel, IDisposable, IDocumentBody, IDocumentData, Nullable, Workbook } from '@univerjs/core';
import type { ISuccinctDocRangeParam, Scene } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import type { IEditorConfigParams, IEditorStateParams } from './editor';
import { createIdentifier, DEFAULT_EMPTY_DOCUMENT_VALUE, Disposable, EDITOR_ACTIVATED, FOCUSING_EDITOR_INPUT_FORMULA, FOCUSING_EDITOR_STANDALONE, FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE, HorizontalAlign, ICommandService, IContextService, Inject, isInternalEditorID, IUndoRedoService, IUniverInstanceService, toDisposable, UniverInstanceType, VerticalAlign } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { isReferenceStrings, LexerTreeBuilder, operatorToken } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { fromEvent, Subject } from 'rxjs';
import { Editor } from './editor';

/**
 * Not these elements will be considered as editor blur.
 */
const editorFocusInElements = [
    'univer-editor',
    'univer-range-selector',
    'univer-range-selector-editor',
    'univer-render-canvas',
    'univer-text-editor-container-placeholder',
];

export interface IEditorSetValueParam {
    editorUnitId: string;
    body: IDocumentBody;
}

export interface IEditorInputFormulaParam {
    editorUnitId: string;
    formulaString: string;
}

/**
 * @deprecated
 */
export interface IEditorService {
    getEditor(id?: string): Readonly<Nullable<Editor>>;

    register(config: IEditorConfigParams, container: HTMLDivElement): IDisposable;

    /**
     * @deprecated
     */
    isVisible(id: string): Nullable<boolean>;

    inputFormula$: Observable<IEditorInputFormulaParam>;

    /**
     * @deprecated
     */
    setFormula(formulaString: string): void;

    resize$: Observable<string>;
    /**
     * @deprecated
     */
    resize(id: string): void;

    /**
     * @deprecated
     */
    getAllEditor(): Map<string, Editor>;

    /**
     * The sheet currently being operated on will determine
     * whether to include unitId information in the ref.
     */
    setOperationSheetUnitId(unitId: Nullable<string>): void;
    getOperationSheetUnitId(): Nullable<string>;
    /**
     * The sub-table within the sheet currently being operated on
     * will determine whether to include subUnitId information in the ref.
     */
    setOperationSheetSubUnitId(sheetId: Nullable<string>): void;
    getOperationSheetSubUnitId(): Nullable<string>;

    isEditor(editorUnitId: string): boolean;

    isSheetEditor(editorUnitId: string): boolean;

    closeRangePrompt$: Observable<unknown>;
    /**
     * @deprecated
     */
    closeRangePrompt(): void;

    blur$: Observable<unknown>;
    /**
     * @deprecated
     */
    blur(): void;

    focus$: Observable<ISuccinctDocRangeParam>;
    /**
     * @deprecated
     */
    focus(editorUnitId?: string): void;

    setValue$: Observable<IEditorSetValueParam>;
    valueChange$: Observable<Readonly<Editor>>;

    /**
     * @deprecated
     */
    setValue(val: string, editorUnitId?: string): void;

    /**
     * @deprecated
     */
    setValueNoRefresh(val: string, editorUnitId?: string): void;

    /**
     * @deprecated
     */
    setRichValue(body: IDocumentBody, editorUnitId?: string): void;

    /**
     * @deprecated
     */
    getFirstEditor(): Editor;

    focusStyle$: Observable<Nullable<string>>;
    /**
     * @deprecated
     */
    focusStyle(editorUnitId: Nullable<string>): void;

    /**
     * @deprecated
     */
    refreshValueChange(editorId: string): void;

    /**
     * @deprecated
     */
    checkValueLegality(editorId: string): boolean;

    /**
     * @deprecated
     */
    getValue(id: string): Nullable<string>;

    /**
     * @deprecated
     */
    getRichValue(id: string): Nullable<IDocumentBody>;

    /**
     * @deprecated
     */
    changeSpreadsheetFocusState(state: boolean): void;

    /**
     * @deprecated
     */
    getSpreadsheetFocusState(): boolean;

    /**
     * @deprecated
     */
    selectionChangingState(): boolean;

    singleSelection$: Observable<boolean>;
    /**
     * @deprecated
     */
    singleSelection(state: boolean): void;

    setFocusId(id: Nullable<string>): void;
    getFocusId(): Nullable<string>;

    getFocusEditor(): Readonly<Nullable<Editor>>;
}

export class EditorService extends Disposable implements IEditorService, IDisposable {
    private _editors = new Map<string, Editor>();

    private _focusEditorUnitId: Nullable<string>;

    private readonly _state$ = new Subject<Nullable<IEditorStateParams>>();
    readonly state$ = this._state$.asObservable();

    private _currentSheetUnitId: Nullable<string>;

    private _currentSheetSubUnitId: Nullable<string>;

    private readonly _inputFormula$ = new Subject<IEditorInputFormulaParam>();
    readonly inputFormula$ = this._inputFormula$.asObservable();

    private readonly _resize$ = new Subject<string>();
    readonly resize$ = this._resize$.asObservable();

    private readonly _closeRangePrompt$ = new Subject<unknown>();
    readonly closeRangePrompt$ = this._closeRangePrompt$.asObservable();

    private readonly _blur$ = new Subject();
    readonly blur$ = this._blur$.asObservable();

    private readonly _focus$ = new Subject<ISuccinctDocRangeParam>();
    readonly focus$ = this._focus$.asObservable();

    private readonly _setValue$ = new Subject<IEditorSetValueParam>();
    readonly setValue$ = this._setValue$.asObservable();

    private readonly _valueChange$ = new Subject<Readonly<Editor>>();
    readonly valueChange$ = this._valueChange$.asObservable();

    private readonly _focusStyle$ = new Subject<Nullable<string>>();
    readonly focusStyle$ = this._focusStyle$.asObservable();

    private readonly _singleSelection$ = new Subject<boolean>();
    readonly singleSelection$ = this._singleSelection$.asObservable();

    private _spreadsheetFocusState: boolean = false;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @IContextService private readonly _contextService: IContextService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService
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

    /** @deprecated */
    private _blurSheetEditor(target: HTMLElement) {
        if (editorFocusInElements.some((item) => target.classList.contains(item))) {
            return;
        }

        // NOTE: Note that the focus editor will not be docs' editor but calling `this._editorService.blur()` will blur doc's editor.
        const focusEditor = this.getFocusEditor();
        if (focusEditor && focusEditor.isSheetEditor() !== true) {
            this.blur();
        }
    }

    /** @deprecated */
    setFocusId(id: Nullable<string>) {
        this._focusEditorUnitId = id;
    }

    /** @deprecated */
    getFocusId() {
        return this._focusEditorUnitId;
    }

    /** @deprecated */
    getFocusEditor() {
        if (this._focusEditorUnitId) {
            return this.getEditor(this._focusEditorUnitId);
        }
    }

    isEditor(editorUnitId: string) {
        return this._editors.has(editorUnitId);
    }

    /** @deprecated */
    isSheetEditor(editorUnitId: string) {
        const editor = this._editors.get(editorUnitId);
        return !!(editor && editor.isSheetEditor());
    }

    /** @deprecated */
    closeRangePrompt() {
        const documentDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
        if (!documentDataModel) {
            return;
        }

        const editorUnitId = documentDataModel.getUnitId();

        this._contextService.setContextValue(EDITOR_ACTIVATED, false);
        this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, false);

        if (!this.isEditor(editorUnitId) || this.isSheetEditor(editorUnitId)) {
            return;
        }

        this.changeSpreadsheetFocusState(false);

        this.blur();
    }

    /** @deprecated */
    changeSpreadsheetFocusState(state: boolean) {
        this._spreadsheetFocusState = state;
    }

    /** @deprecated */
    getSpreadsheetFocusState() {
        return this._spreadsheetFocusState;
    }

    /** @deprecated */
    focusStyle(editorUnitId: string) {
        const editor = this.getEditor(editorUnitId);
        if (!editor) {
            return false;
        }

        editor.setFocus(true);

        this._contextService.setContextValue(EDITOR_ACTIVATED, true);

        if (!isInternalEditorID(editorUnitId)) {
            this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, true);
            this._contextService.setContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE, editor.isSingle());
        }

        if (!this._spreadsheetFocusState) {
            this.singleSelection(!!editor.isSingleChoice());
        }

        this._focusStyle$.next(editorUnitId);
        this.setFocusId(editorUnitId);
    }

    /** @deprecated */
    singleSelection(state: boolean) {
        this._singleSelection$.next(state);
    }

    /** @deprecated */
    selectionChangingState() {
        // const documentDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
        const editorUnitId = this.getFocusId();
        if (editorUnitId == null) {
            return true;
        }
        const editor = this.getEditor(editorUnitId);

        if (!editor || editor.isSheetEditor() || editor.isFormulaEditor()) {
            return true;
        }

        if (editor.onlyInputRange() !== true && editor.onlyInputFormula() !== true) {
            this.blur();
            return true;
        }

        if (editor.onlyInputFormula() === true && this._contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA) !== true) {
            this.blur();
            return true;
        }

        return !this.getSpreadsheetFocusState();
    }

    /** @deprecated */
    blur() {
        if (!this._spreadsheetFocusState) {
            this._closeRangePrompt$.next(null);
            this.singleSelection(false);
            this.setFocusId(null);
            this._contextService.setContextValue(EDITOR_ACTIVATED, false);
            this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, false);
        }

        this.getAllEditor().forEach((editor) => {
            editor.setFocus(false);
        });

        this._focusStyle$.next();

        this._blur$.next(null);
    }

    /** @deprecated */
    focus(editorUnitId: string | undefined = this._univerInstanceService.getCurrentUniverDocInstance()?.getUnitId()) {
        if (editorUnitId == null) {
            return;
        }

        const editor = this.getEditor(editorUnitId);
        if (editor == null) {
            return;
        }

        this._univerInstanceService.setCurrentUnitForType(editorUnitId);

        const valueCount = editor.getValue().length;

        this.focusStyle(editorUnitId);

        this._focus$.next({
            startOffset: valueCount,
            endOffset: valueCount,
        });
    }

    /** @deprecated */
    setFormula(formulaString: string, editorUnitId = this._getCurrentEditorUnitId()) {
        this._inputFormula$.next({ formulaString, editorUnitId });
    }

    /** @deprecated */
    setValue(val: string, editorUnitId: string = this._getCurrentEditorUnitId()) {
        this.setValueNoRefresh(val, editorUnitId);
        this._refreshValueChange(editorUnitId);
    }

    /** @deprecated */
    setValueNoRefresh(val: string, editorUnitId: string) {
        this._setValue$.next({
            body: {
                dataStream: val,
            },
            editorUnitId,
        });

        this.resize(editorUnitId);
    }

    /** @deprecated */
    getValue(id: string) {
        const editor = this.getEditor(id);
        if (editor == null) {
            return;
        }
        return editor.getValue();
    }

    /** @deprecated */
    setRichValue(body: IDocumentBody, editorUnitId: string = this._getCurrentEditorUnitId()) {
        this._setValue$.next({ body, editorUnitId });
        this._refreshValueChange(editorUnitId);
    }

    /** @deprecated */
    getRichValue(id: string) {
        const editor = this.getEditor(id);
        if (editor == null) {
            return;
        }
        return editor.getBody();
    }

    override dispose(): void {
        this._state$.complete();
        this._editors.clear();
        super.dispose();
    }

    getEditor(id: string = this._getCurrentEditorUnitId()): Readonly<Nullable<Editor>> {
        return this._editors.get(id);
    }

    /** @deprecated */
    getAllEditor() {
        return this._editors;
    }

    /** @deprecated */
    getFirstEditor() {
        return [...this.getAllEditor().values()][0];
    }

    /** @deprecated */
    resize(unitId: string) {
        const editor = this.getEditor(unitId);
        if (editor == null) {
            return;
        }

        editor.verticalAlign();

        this._resize$.next(unitId);
    }

    /** @deprecated */
    isVisible(id: string) {
        return this.getEditor(id)?.isVisible();
    }

    /** @deprecated */
    setOperationSheetUnitId(unitId: Nullable<string>) {
        this._currentSheetUnitId = unitId;
    }

    /** @deprecated */
    getOperationSheetUnitId() {
        return this._currentSheetUnitId;
    }

    /** @deprecated */
    setOperationSheetSubUnitId(sheetId: Nullable<string>) {
        this._currentSheetSubUnitId = sheetId;
    }

    /** @deprecated */
    getOperationSheetSubUnitId() {
        return this._currentSheetSubUnitId;
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
                this._undoRedoService
            );

            this._editors.set(editorUnitId, editor);

            // Delete scroll bar
            if (!config.scrollBar) {
                (render.mainComponent?.getScene() as Scene)?.getViewports()?.[0].getScrollBar()?.dispose();
            }

            // @ggg, Move this to Text Editor?
            if (!editor.isSheetEditor() && !config.noNeedVerticalAlign) {
                editor.verticalAlign();
                editor.updateCanvasStyle();
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
        this._contextService.setContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE, false);

        // DEBT: no necessary when we refactor editor module
        if (!this.isSheetEditor(editorUnitId)) return;

        /**
         * Compatible with the editor in the sheet scenario,
         * it is necessary to refocus back to the current sheet when unloading.
         */
        // REFACTOR: @zw, move to sheet cell editor.
        const sheets = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (sheets.length > 0) {
            const current = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);

            if (current) {
                this._univerInstanceService.focusUnit(current.getUnitId());
            }
        }
    }

    /** @deprecated */
    refreshValueChange(editorUnitId: string) {
        this._refreshValueChange(editorUnitId);
    }

    /** @deprecated */
    checkValueLegality(editorUnitId: string) {
        const editor = this._editors.get(editorUnitId);

        if (editor == null) {
            return true;
        }

        let value = editor.getValue();

        editor.setValueLegality();

        value = value.replace(/\r\n/g, '').replace(/\n/g, '').replace(/\n/g, '');

        if (value.length === 0) {
            return true;
        }

        if (editor.onlyInputFormula()) {
            if (value.substring(0, 1) !== operatorToken.EQUALS) {
                editor.setValueLegality(false);
                return false;
            }
            const bracketCount = this._lexerTreeBuilder.checkIfAddBracket(value);
            editor.setValueLegality(bracketCount === 0);
        } else if (editor.onlyInputRange()) {
            const valueArray = value.split(',');
            if (editor.isSingleChoice() && valueArray.length > 1) {
                editor.setValueLegality(false);
                return false;
            }

            editor.setValueLegality(isReferenceStrings(value));
        }

        return editor.isValueLegality();
    }

    private _refreshValueChange(editorId: string) {
        const editor = this.getEditor(editorId);
        if (editor == null) {
            return;
        }

        this._valueChange$.next(editor);
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
