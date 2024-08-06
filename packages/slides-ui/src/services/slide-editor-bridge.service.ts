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

import type { IDisposable, IDocumentBody, IDocumentData, IDocumentSettings, IDocumentStyle, IParagraph, IParagraphStyle, IPosition, Nullable, UnitModel } from '@univerjs/core';
import {
    createIdentifier,
    Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentDataModel,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE,
    IContextService,
    Inject,
    IUniverInstanceService,
    ThemeService,
    VerticalAlign,
} from '@univerjs/core';
import type { Engine, IDocumentLayoutObject, IRenderContext, RichText, Scene } from '@univerjs/engine-render';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import type { KeyCode } from '@univerjs/ui';
import { IEditorService } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export const ISlideEditorBridgeService = createIdentifier<SlideEditorBridgeService>('univer.slide-editor-bridge.service');

export interface IEditorBridgeServiceParam {
    unitId: string;
    position: IPosition;
    canvasOffset: { left: number; top: number };
    documentLayoutObject: IDocumentLayoutObject;
    scaleX: number;
    scaleY: number;
    editorUnitId: string;
}

export interface IEditorBridgeServiceVisibleParam {
    visible: boolean;
    eventType: DeviceInputEventType;
    unitId: string;
    keycode?: KeyCode;
}

export interface ISetEditorInfo {
    scene: Scene;
    engine: Engine;
    unitId: string;
    pageId: string;
    richTextObj: RichText;
}

export interface ISlideEditorBridgeService {
    currentEditRectState$: Observable<Nullable<IEditorBridgeServiceParam>>;
    visible$: Observable<IEditorBridgeServiceVisibleParam>;
    // interceptor: InterceptorManager<{
    //     BEFORE_CELL_EDIT: typeof BEFORE_CELL_EDIT;
    //     AFTER_CELL_EDIT: typeof AFTER_CELL_EDIT;
    //     AFTER_CELL_EDIT_ASYNC: typeof AFTER_CELL_EDIT_ASYNC;
    // }>;
    dispose(): void;
    // refreshEditCellState(): void;

    setEditorRect(param: ISetEditorInfo): void;
    getEditRectState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    // // Gets the DocumentDataModel of the latest table cell based on the latest cell contents
    // getLatestEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    changeVisible(param: IEditorBridgeServiceVisibleParam): void;
    changeEditorDirty(dirtyStatus: boolean): void;
    getEditorDirty(): boolean;
    // isVisible(): IEditorBridgeServiceVisibleParam;
    // enableForceKeepVisible(): void;
    // disableForceKeepVisible(): void;
    // isForceKeepVisible(): boolean;
    getCurrentEditorId(): Nullable<string>;
}

export class SlideEditorBridgeService extends Disposable implements ISlideEditorBridgeService, IDisposable {
    private _editorUnitId: string = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;

    private _isForceKeepVisible: boolean = false;

    private _editorIsDirty: boolean = false;

    private _currentEditRectState: Nullable<IEditorBridgeServiceParam> = null;
    private readonly _currentEditRectState$ = new BehaviorSubject<Nullable<IEditorBridgeServiceParam>>(null);
    readonly currentEditRectState$ = this._currentEditRectState$.asObservable();

    private _visible: IEditorBridgeServiceVisibleParam = {
        visible: false,
        eventType: DeviceInputEventType.Dblclick,
        unitId: '',
    };

    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly visible$ = this._visible$.asObservable();
    private readonly _afterVisible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly afterVisible$ = this._afterVisible$.asObservable();
    private _currentEditRectInfo: ISetEditorInfo;

    constructor(
        private readonly _renderContext: IRenderContext<UnitModel>,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IEditorService private readonly _editorService: IEditorService,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();
    }

    override dispose() {
        super.dispose();
    }

    /**
     * editorBridgeRenderController@startEditing ---> editorBridgeRenderController@_updateEditor
     * @editorInfo editorInfo
     */
    setEditorRect(editorInfo: ISetEditorInfo) {
        this._currentEditRectInfo = editorInfo;

        /**
         * If there is no editor currently focused, then default to selecting the sheet editor to prevent the editorService from using the previously selected editor object.
         * todo: wzhudev: In boundless mode, it is necessary to switch to the corresponding editorId based on the host's unitId.
         */
        if (!this._editorService.getFocusEditor()) {
            this._editorService.focus(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            this._contextService.setContextValue(EDITOR_ACTIVATED, false);
            this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, false);
            this._contextService.setContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE, false);
        }

        const editCellState = this.getEditRectState();
        this._currentEditRectState = editCellState;

        // editing render controller @_subscribeToCurrentCell
        this._currentEditRectState$.next(editCellState);
    }

    changeVisible(param: IEditorBridgeServiceVisibleParam) {
        /**
         * Non-sheetEditor and formula selection mode,
         * double-clicking cannot activate the sheet editor.
         */
        // const editor = this._editorService.getFocusEditor();
        // if (this._refSelectionsService.getCurrentSelections().length > 0 && editor && !editor.isSheetEditor()) {
        //     return;
        // }

        this._visible = param;

        // Reset the dirty status when the editor is visible.
        if (param.visible) {
            this._editorIsDirty = false;
        }

        // subscribe: editing render controller
        this._visible$.next(this._visible);
        this._afterVisible$.next(this._visible);
    }

    /**
     * get info from _currentEditRectInfo
     */

    getEditRectState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        const editorUnitId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;

        //editorBridgeRenderController.slideTextEditor$ ---> editorBridgeRenderController@_updateEditor --> this._currentEditRectInfo = xxx
        const editorRectInfo = this._currentEditRectInfo;
        const unitId = editorRectInfo.unitId;

        // let docData: IDocumentData = this.genDocData(editorRectInfo.startEditingText);

        const docData = editorRectInfo.richTextObj.documentData;
        docData.id = editorUnitId;
        docData.documentStyle = {
            ...docData.documentStyle,
            ...{
                pageSize: { width: Infinity, height: Infinity },
            },
        };

        const docDataModel = new DocumentDataModel(docData);
        const documentLayoutObject: IDocumentLayoutObject = {
            documentModel: docDataModel,
            fontString: 'document',
            textRotation: { a: 0, v: 0 },
            wrapStrategy: 0,
            verticalAlign: VerticalAlign.MIDDLE,
            horizontalAlign: 0,
            paddingData: { t: 0, b: 1, l: 2, r: 2 },
        };

        // see insert-text.operation
        // TODO: @lumixraku need to plus scrolling and offset of PPT card.
        const editorWidth = editorRectInfo.richTextObj.width;
        const editorHeight = editorRectInfo.richTextObj.height;
        const left = editorRectInfo.richTextObj.left;
        const top = editorRectInfo.richTextObj.top;
        return {
            position: {
                startX: left,
                startY: top,
                endX: left + editorWidth,
                endY: top + editorHeight,
            },
            scaleX: 1,
            scaleY: 1,
            canvasOffset: { left: 0, top: 0 },
            unitId,
            editorUnitId,
            documentLayoutObject,
        };
    }

    changeEditorDirty(dirtyStatus: boolean) {
        this._editorIsDirty = dirtyStatus;
    }

    isVisible() {
        return this._visible;
    }

    getEditorDirty() {
        return this._editorIsDirty;
    }

    getCurrentEditorId() {
        return this._editorUnitId;
    }

    genDocData(target: RichText) {
        const editorUnitId = this.getCurrentEditorId();
        const content = target.text;
        const fontSize = target.fs;
        const docData: IDocumentData = {
            id: editorUnitId,
            body: {
                dataStream: `${content}\r\n`,
                textRuns: [{ st: 0, ed: content.length }],
                paragraphs: [{
                    paragraphStyle: {
                        // no use
                        // textStyle: { fs: 30 },
                        // horizontalAlign: HorizontalAlign.CENTER,
                        // verticalAlign: VerticalAlign.MIDDLE,
                    } as IParagraphStyle,
                    startIndex: content.length + 1,
                }] as IParagraph[],
                sectionBreaks: [{ startIndex: content.length + 2 }],
            } as IDocumentBody,
            documentStyle: {
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                pageSize: { width: Infinity, height: Infinity },
                textStyle: { fs: fontSize },
                renderConfig: {
                    // horizontalAlign: HorizontalAlign.CENTER,
                    verticalAlign: VerticalAlign.MIDDLE,
                    centerAngle: 0,
                    vertexAngle: 0,
                    wrapStrategy: 0,
                },
            } as IDocumentStyle,
            drawings: {},
            drawingsOrder: [],
            settings: { zoomRatio: 1 } as IDocumentSettings,
        };

        return docData;
    }
}
