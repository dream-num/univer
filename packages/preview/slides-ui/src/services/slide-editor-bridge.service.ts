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

import type { IDisposable, IDocumentBody, IDocumentData, IDocumentSettings, IDocumentStyle, IParagraph, IParagraphStyle, IPosition, Nullable } from '@univerjs/core';
import type { Engine, IDocumentLayoutObject, RichText, Scene } from '@univerjs/engine-render';
import type { KeyCode } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import {
    createIdentifier,
    Disposable,
    DocumentDataModel,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE,
    HorizontalAlign,
    IContextService,
    VerticalAlign,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { SLIDE_KEY } from '@univerjs/slides';
import { BehaviorSubject, Subject } from 'rxjs';
import { SLIDE_EDITOR_ID } from '../const';

// TODO same as @univerjs/slides/views/render/adaptors/index.js
export enum SLIDE_VIEW_KEY {
    MAIN = '__SLIDERender__',
    SCENE_VIEWER = '__SLIDEViewer__',
    SCENE = '__SLIDEScene__',
    VIEWPORT = '__SLIDEViewPort_',
}

export const ISlideEditorBridgeService = createIdentifier<SlideEditorBridgeService>('univer.slide-editor-bridge.service');

export interface IEditorBridgeServiceParam {
    unitId: string;

    /**
     * pos and size of editing area
     */
    position: IPosition;
    slideCardOffset: { left: number; top: number };
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

    /**
     * @deprecated This is a temp solution only for demo purposes. We should have mutations to directly write
     * content to slides.
     */
    endEditing$: Subject<RichText>;

    // interceptor: InterceptorManager<{
    //     BEFORE_CELL_EDIT: typeof BEFORE_CELL_EDIT;
    //     AFTER_CELL_EDIT: typeof AFTER_CELL_EDIT;
    //     VALIDATE_CELL: typeof VALIDATE_CELL;
    // }>;
    dispose(): void;
    // refreshEditCellState(): void;

    setEditorRect(param: ISetEditorInfo): void;
    getEditorRect(): ISetEditorInfo;
    getEditRectState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    // // Gets the DocumentDataModel of the latest table cell based on the latest cell contents
    // getLatestEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    changeVisible(param: IEditorBridgeServiceVisibleParam): void;
    changeEditorDirty(dirtyStatus: boolean): void;
    getEditorDirty(): boolean;
    isVisible(): boolean;
    // enableForceKeepVisible(): void;
    // disableForceKeepVisible(): void;
    // isForceKeepVisible(): boolean;
    getCurrentEditorId(): Nullable<string>;
}

export class SlideEditorBridgeService extends Disposable implements ISlideEditorBridgeService, IDisposable {
    private _editorUnitId: string = SLIDE_EDITOR_ID;

    private _isForceKeepVisible: boolean = false;

    private _editorIsDirty: boolean = false;

    private _currentEditRectState: Nullable<IEditorBridgeServiceParam> = null;
    private readonly _currentEditRectState$ = new BehaviorSubject<Nullable<IEditorBridgeServiceParam>>(null);
    readonly currentEditRectState$ = this._currentEditRectState$.asObservable();

    private _visibleParam: IEditorBridgeServiceVisibleParam = {
        visible: false,
        eventType: DeviceInputEventType.Dblclick,
        unitId: '',
    };

    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visibleParam);
    readonly visible$ = this._visible$.asObservable();

    private readonly _afterVisible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visibleParam);
    readonly afterVisible$ = this._afterVisible$.asObservable();

    readonly endEditing$ = new Subject<RichText>();

    private _currentEditRectInfo: ISetEditorInfo;

    constructor(
        @IEditorService private readonly _editorService: IEditorService,
        @IContextService private readonly _contextService: IContextService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    override dispose() {
        super.dispose();
    }

    getEditorRect() {
        return this._currentEditRectInfo;
    }

    /**
     * 1st part of startEditing.
     * @editorInfo editorInfo
     */
    setEditorRect(editorInfo: ISetEditorInfo) {
        this._currentEditRectInfo = editorInfo;
        // If there is no editor currently focused, then default to selecting the sheet editor to prevent the editorService from using the previously selected editor object.
        // todo: wzhudev: In univer mode, it is necessary to switch to the corresponding editorId based on the host's unitId.
        if (!this._editorService.getFocusEditor()) {
            this._editorService.focus(SLIDE_EDITOR_ID);
            this._contextService.setContextValue(EDITOR_ACTIVATED, false);
            this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, false);
            this._contextService.setContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE, false);
        }

        const editRectState = this.getEditRectState();
        this._currentEditRectState = editRectState;

        // slide-editing.render-controller@_subscribeToCurrentCell(Set editorUnitId to curr doc.)
        // --> activate(-1000, -1000)
        this._currentEditRectState$.next(editRectState);
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

        this._visibleParam = param;

        // Reset the dirty status when the editor is visible.
        if (param.visible) {
            this._editorIsDirty = false;
        }

        // subscriber: slide-editing.render-controller.ts@_handleEditorVisible
        this._visible$.next(this._visibleParam);
        this._afterVisible$.next(this._visibleParam);
    }

    /**
     * get info from _currentEditRectInfo
     *
     * invoked by slide-editing.render-controller.ts@_handleEditorVisible
     * && this@setEditorRect
     */
    getEditRectState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        const editorUnitId = SLIDE_EDITOR_ID;

        //editorBridgeRenderController.slideTextEditor$ ---> editorBridgeRenderController@_updateEditor --> this._currentEditRectInfo = xxx
        const editorRectInfo = this._currentEditRectInfo;
        const unitId = editorRectInfo.unitId;

        // let docData: IDocumentData = this.genDocData(editorRectInfo.startEditingText);

        const docData = editorRectInfo.richTextObj.documentData;
        docData.id = editorUnitId;
        docData.documentStyle = {
            ...docData.documentStyle,
            ...{
                pageSize: { width: editorRectInfo.richTextObj.width, height: Infinity },
            },
        };

        const docDataModel = new DocumentDataModel(docData);
        const documentLayoutObject: IDocumentLayoutObject = {
            documentModel: docDataModel,
            fontString: 'document',
            textRotation: { a: 0, v: 0 },
            wrapStrategy: 0,
            verticalAlign: VerticalAlign.TOP,
            horizontalAlign: HorizontalAlign.LEFT,
            paddingData: { t: 0, b: 1, l: 2, r: 2 },
        };

        // see insert-text.operation
        const editorWidth = editorRectInfo.richTextObj.width;
        const editorHeight = editorRectInfo.richTextObj.height;
        const left = editorRectInfo.richTextObj.left;
        const top = editorRectInfo.richTextObj.top;

        const canvasOffset = {
            left: 0,
            top: 0,
        };
        // canvasOffset will be used in slide-editing.render-controller.ts@_handleEditorVisible
        // const mainScene = this._mainScene;
        const renderUnit = this._renderManagerService.getRenderById(unitId);
        const mainScene = renderUnit?.scene;
        const mainViewport = mainScene?.getViewport(SLIDE_KEY.VIEW);
        const slideMainRect = mainScene?.getObject(SLIDE_KEY.COMPONENT);
        const slidePos = {
            x: slideMainRect?.left || 0,
            y: slideMainRect?.top || 0,
        };
        const scrollX = mainViewport?.viewportScrollX || 0;
        const scrollY = mainViewport?.viewportScrollY || 0;
        canvasOffset.left = slidePos.x - scrollX;
        canvasOffset.top = slidePos.y - scrollY;

        return {
            position: {
                startX: left,
                startY: top,
                endX: left + editorWidth,
                endY: top + editorHeight,
            },
            scaleX: 1,
            scaleY: 1,
            slideCardOffset: canvasOffset,
            unitId,
            editorUnitId,
            documentLayoutObject,
        } as IEditorBridgeServiceParam;
    }

    changeEditorDirty(dirtyStatus: boolean) {
        this._editorIsDirty = dirtyStatus;
    }

    isVisible() {
        return this._visibleParam.visible;
    }

    getEditorDirty() {
        return this._editorIsDirty;
    }

    getCurrentEditorId() {
        return this._editorUnitId;
    }

    /**
     * @deprecated
     */
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
