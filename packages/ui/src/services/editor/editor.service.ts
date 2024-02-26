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

import type { DocumentDataModel, IDocumentBody, IDocumentData, IDocumentStyle, IPosition, Nullable } from '@univerjs/core';
import { DEFAULT_EMPTY_DOCUMENT_VALUE, Disposable, HorizontalAlign, IUniverInstanceService, VerticalAlign } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import type { IRender, Scene } from '@univerjs/engine-render';
import { IRenderManagerService, UNIVER_GLOBAL_DEFAULT_FONT_SIZE } from '@univerjs/engine-render';

export interface IEditorStateParam extends Partial<IPosition> {
    visible?: boolean;
}

export interface IEditorCanvasStyle {
    fontSize?: number;
}

export interface IEditorConfigParam {
    editorUnitId: string;

    initialSnapshot?: IDocumentData;
    cancelDefaultResizeListener?: boolean;
    canvasStyle?: IEditorCanvasStyle;
    isSingle?: boolean;
    isSheetEditor: boolean;
}

export interface IEditorSetParam extends IEditorConfigParam, IEditorStateParam {
    render: IRender;
    documentDataModel: DocumentDataModel;
    editorDom: HTMLDivElement;
}

export interface IEditorSetValueParam {
    editorUnitId: string;
    body: IDocumentBody;
}

export interface IEditorInputFormulaParam {
    editorUnitId: string;
    formulaString: string;
}

export interface IEditorService {
    getEditor(id?: string): Readonly<Nullable<IEditorSetParam>>;

    setState(param: IEditorStateParam, id: string): void;

    register(config: IEditorConfigParam, container: HTMLDivElement): void;

    unRegister(editorUnitId: string): void;

    isVisible(id: string): Nullable<boolean>;

    inputFormula$: Observable<IEditorInputFormulaParam>;

    setFormula(formulaString: string): void;

    resize$: Observable<string>;

    resize(id: string): void;

    getAllEditor(): Map<string, IEditorSetParam>;

    setOperationSheetUnitId(unitId: Nullable<string>): void;

    getOperationSheetUnitId(): Nullable<string>;

    setOperationSheetSubUnitId(sheetId: Nullable<string>): void;

    getOperationSheetSubUnitId(): Nullable<string>;

    isEditor(editorUnitId: string): boolean;

    isSheetEditor(editorUnitId: string): boolean;

    changeEditor$: Observable<unknown>;

    changeEditor(): void;

    setValue$: Observable<IEditorSetValueParam>;

    valueChange$: Observable<IEditorSetParam>;

    setValue(val: string, editorUnitId?: string): void;

    setRichValue(body: IDocumentBody, editorUnitId?: string): void;
}

export class EditorService extends Disposable implements IEditorService, IDisposable {
    private _editors = new Map<string, IEditorSetParam>();

    private readonly _state$ = new Subject<Nullable<IEditorStateParam>>();

    readonly state$ = this._state$.asObservable();

    private _currentSheetUnitId: Nullable<string>;

    private _currentSheetSubUnitId: Nullable<string>;

    private readonly _inputFormula$ = new Subject<IEditorInputFormulaParam>();

    readonly inputFormula$ = this._inputFormula$.asObservable();

    private readonly _resize$ = new Subject<string>();

    readonly resize$ = this._resize$.asObservable();

    private readonly _changeEditor$ = new Subject<unknown>();

    readonly changeEditor$ = this._changeEditor$.asObservable();

    private readonly _setValue$ = new Subject<IEditorSetValueParam>();

    readonly setValue$ = this._setValue$.asObservable();

    private readonly _valueChange$ = new Subject<IEditorSetParam>();

    readonly valueChange$ = this._valueChange$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    isEditor(editorUnitId: string) {
        return this._editors.has(editorUnitId);
    }

    isSheetEditor(editorUnitId: string) {
        const editor = this._editors.get(editorUnitId);
        return !!(editor && editor.isSheetEditor);
    }

    changeEditor() {
        const documentDataModel = this._currentUniverService.getCurrentUniverDocInstance();
        const editorUnitId = documentDataModel.getUnitId();
        if (!this.isEditor(editorUnitId) || this.isSheetEditor(editorUnitId)) {
            return;
        }
        // const editor = this._editors.get(editorUnitId);
        this._changeEditor$.next(null);
    }

    setFormula(formulaString: string, editorUnitId?: string) {
        if (editorUnitId == null) {
            editorUnitId = this._getCurrentEditorUnitId();
        }
        this._inputFormula$.next({ formulaString, editorUnitId });
    }

    setValue(val: string, editorUnitId?: string) {
        if (editorUnitId == null) {
            editorUnitId = this._getCurrentEditorUnitId();
        }

        if (val.substring(0, 1) === '=') {
            this.setFormula(val, editorUnitId);
        } else {
            this._setValue$.next({ body: {
                dataStream: val,
            }, editorUnitId });
        }

        this._refreshValueChange(editorUnitId);
    }

    getValue(id?: string) {
        const editor = this.getEditor(id);

        return editor?.documentDataModel.getBody()?.dataStream || '';
    }

    setRichValue(body: IDocumentBody, editorUnitId?: string) {
        if (editorUnitId == null) {
            editorUnitId = this._getCurrentEditorUnitId();
        }

        this._setValue$.next({ body, editorUnitId });

        this._refreshValueChange(editorUnitId);
    }

    getRichValue(id?: string) {
        const editor = this.getEditor(id);

        return editor?.documentDataModel.getBody();
    }

    dispose(): void {
        this._state$.complete();
        this._editors.clear();
    }

    getEditor(id?: string): Readonly<Nullable<IEditorSetParam>> {
        if (id == null) {
            id = this._getCurrentEditorUnitId();
        }
        return this._editors.get(id);
    }

    getAllEditor() {
        return this._editors;
    }

    resize(unitId: string) {
        const editor = this.getEditor(unitId);
        if (editor == null) {
            return;
        }

        this._verticalAlign(unitId);

        this._resize$.next(unitId);
    }

    setState(param: IEditorStateParam, id: string) {
        const editor = this._editors.get(id);
        if (editor) {
            this._editors.set(id, {
                ...editor,
                ...param,
            });
        }

        this._refresh(param);
    }

    isVisible(id: string) {
        return this.getEditor(id)?.visible;
    }

    setOperationSheetUnitId(unitId: Nullable<string>) {
        this._currentSheetUnitId = unitId;
    }

    getOperationSheetUnitId() {
        return this._currentSheetUnitId;
    }

    setOperationSheetSubUnitId(sheetId: Nullable<string>) {
        this._currentSheetSubUnitId = sheetId;
    }

    getOperationSheetSubUnitId() {
        return this._currentSheetSubUnitId;
    }

    register(config: IEditorConfigParam, container: HTMLDivElement) {
        const { initialSnapshot, editorUnitId, isSheetEditor, canvasStyle = {}, isSingle = true } = config;

        const documentDataModel = this._currentUniverService.createDoc(initialSnapshot || this._getBlank(editorUnitId));

        let render = this._renderManagerService.getRenderById(editorUnitId);

        if (render == null) {
            this._renderManagerService.create(editorUnitId);
            render = this._renderManagerService.getRenderById(editorUnitId)!;
        }

        render.engine.setContainer(container);

        this._editors.set(editorUnitId, { ...config, isSheetEditor, render, documentDataModel, editorDom: container, canvasStyle, isSingle });

        // Delete scroll bar
        (render.mainComponent?.getScene() as Scene)?.getViewports()?.[0].getScrollBar()?.dispose();

        this._updateCanvasStyle(editorUnitId);

        this._verticalAlign(editorUnitId);
    }

    unRegister(editorUnitId: string) {
        this._editors.delete(editorUnitId);

        this._currentUniverService.disposeDocument(editorUnitId);
    }

    private _refreshValueChange(editorId: string) {
        const editor = this.getEditor(editorId);
        if (editor == null) {
            return;
        }

        this._valueChange$.next(editor);
    }

    private _getCurrentEditorUnitId() {
        const current = this._currentUniverService.getCurrentUniverDocInstance();
        return current.getUnitId();
    }

    private _refresh(param: IEditorStateParam): void {
        this._state$.next(param);
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
                marginLeft: 2,
                marginTop: 2,
            },
        } as IDocumentData;
    }

    private _verticalAlign(id: string) {
        if (this.isSheetEditor(id)) {
            return;
        }

        const editor = this.getEditor(id);
        const documentDataModel = editor?.documentDataModel;

        if (editor == null || documentDataModel == null || editor.isSingle === false) {
            return;
        }

        let fontSize = UNIVER_GLOBAL_DEFAULT_FONT_SIZE;

        if (editor.canvasStyle?.fontSize) {
            fontSize = editor.canvasStyle.fontSize;
        }

        const { height } = editor.editorDom.getBoundingClientRect();

        const top = (height - (fontSize * 4 / 3)) / 2 - 2;

        documentDataModel.updateDocumentDataMargin({
            t: top < 0 ? 0 : top,
        });
    }

    private _updateCanvasStyle(id: string) {
        if (this.isSheetEditor(id)) {
            return;
        }

        const editor = this.getEditor(id);
        const documentDataModel = editor?.documentDataModel;
        if (documentDataModel == null) {
            return;
        }

        const documentStyle: IDocumentStyle = {};

        if (editor?.canvasStyle?.fontSize) {
            if (documentStyle.textStyle == null) {
                documentStyle.textStyle = {};
            }

            documentStyle.textStyle.fs = editor.canvasStyle.fontSize;
        }

        documentDataModel.updateDocumentStyle(documentStyle);
    }
}

export const IEditorService = createIdentifier<IEditorService>(
    'univer.editor.service'
);
