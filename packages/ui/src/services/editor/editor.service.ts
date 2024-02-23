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

import type { DocumentDataModel, IDocumentData, IPosition, ISelectionCell, ITextRun, Nullable } from '@univerjs/core';
import { DEFAULT_EMPTY_DOCUMENT_VALUE, Disposable, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, EDITOR_ACTIVATED, FOCUSING_DOC, FOCUSING_EDITOR_BUT_HIDDEN, FOCUSING_EDITOR_INPUT_FORMULA, FOCUSING_FORMULA_EDITOR, FOCUSING_SHEET, HorizontalAlign, IContextService, IUniverInstanceService, Tools, VerticalAlign } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import type { IRender, Scene } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';

export interface IEditorStateParam extends Partial<IPosition> {
    visible?: boolean;
}

export interface IEditorConfigParam {
    editorUnitId: string;

    initialSnapshot?: IDocumentData;
    cancelDefaultResizeListener?: boolean;
}

const sheetEditorList = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

export interface IEditorSetParam extends IEditorConfigParam, IEditorStateParam {
    render: IRender;
    documentDataModel: DocumentDataModel;
    editorDom: HTMLDivElement;
}

export interface IEditorService {
    getEditor(id?: string): Readonly<Nullable<IEditorSetParam>>;

    setState(param: IEditorStateParam, id: string): void;

    register(config: IEditorConfigParam, container: HTMLDivElement): void;

    unRegister(editorUnitId: string): void;

    isVisible(id: string): Nullable<boolean>;

    inputFormula$: Observable<string>;

    inputFormula(formulaString: string): void;

    resize$: Observable<string>;

    resize(id: string): void;

    getAllEditor(): Map<string, IEditorSetParam>;

    setOperationSheetUnitId(unitId: Nullable<string>): void;

    getOperationSheetUnitId(): Nullable<string>;

    setOperationSheetSubUnitId(sheetId: Nullable<string>): void;

    getOperationSheetSubUnitId(): Nullable<string>;
}

export class EditorService extends Disposable implements IEditorService, IDisposable {
    private _editors = new Map<string, IEditorSetParam>();

    private readonly _state$ = new Subject<Nullable<IEditorStateParam>>();

    readonly state$ = this._state$.asObservable();

    private _currentSheetUnitId: Nullable<string>;

    private _currentSheetSubUnitId: Nullable<string>;

    private readonly _inputFormula$ = new Subject<string>();

    readonly inputFormula$ = this._inputFormula$.asObservable();

    private readonly _resize$ = new Subject<string>();

    readonly resize$ = this._resize$.asObservable();

    constructor(
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this.disposeWithMe(
            this._currentUniverService.currentDoc$.subscribe((documentDataModel) => {
                if (documentDataModel == null) {
                    return;
                }
                if (!documentDataModel.isEditorModel()) {
                    return;
                }

                const editorId = documentDataModel.getUnitId();

                if (sheetEditorList.includes(editorId)) {
                    this._contextService.setContextValue(FOCUSING_DOC, false);
                    this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, true);
                    this._contextService.setContextValue(FOCUSING_SHEET, true);
                } else {
                    this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
                    this._contextService.setContextValue(EDITOR_ACTIVATED, false);
                    this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, false);
                    this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, false);

                    this._contextService.setContextValue(FOCUSING_SHEET, false);
                    this._contextService.setContextValue(FOCUSING_DOC, true);
                }
            })
        );
    }

    inputFormula(formulaString: string) {
        this._inputFormula$.next(formulaString);
    }

    dispose(): void {
        this._state$.complete();
        this._editors.clear();
    }

    getEditor(id: string): Readonly<Nullable<IEditorSetParam>> {
        return this._editors.get(id);
    }

    getAllEditor() {
        return this._editors;
    }

    resize(id: string) {
        const editor = this.getEditor(id);
        if (editor == null) {
            return;
        }

        const { editorUnitId } = editor;

        this._resize$.next(editorUnitId);
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
        const { initialSnapshot, editorUnitId } = config;

        const documentDataModel = this._currentUniverService.createDoc(initialSnapshot || this._getBlank(editorUnitId));

        const render = this._renderManagerService.getRenderById(editorUnitId);

        if (render == null) {
            throw new Error('An error occurred while creating the editor render.');
        }

        render.engine.setContainer(container);

        documentDataModel.enableEditorModel();

        this._editors.set(editorUnitId, { ...config, render, documentDataModel, editorDom: container });

        // Delete scroll bar
        (render.mainComponent?.getScene() as Scene)?.getViewports()?.[0].getScrollBar()?.dispose();
    }

    unRegister(editorUnitId: string) {
        this._editors.delete(editorUnitId);

        this._currentUniverService.disposeDocument(editorUnitId);
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
            },
        } as IDocumentData;
    }
}

export const IEditorService = createIdentifier<IEditorService>(
    'univer.editor.service'
);
