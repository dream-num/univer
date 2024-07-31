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

import type { IDisposable, IDocumentBody, IDocumentData, IDocumentStyle, IPosition, IRectXYWH, Nullable } from '@univerjs/core';
import {
    createIdentifier,
    Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentDataModel,
    IContextService,
    Inject,
    IUniverInstanceService,
    ThemeService,
} from '@univerjs/core';
import type { IDocumentLayoutObject } from '@univerjs/engine-render';
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
    // setEditCell(param: ICurrentEditCellParam): void;
    setEditorRect(rect: IRectXYWH): void;
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

    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IEditorService private readonly _editorService: IEditorService,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();
        console.log('SlideEditorBridgeService _editorService', this._editorService);
    }

    override dispose() {
        super.dispose();
    }

    setEditorRect(rect: IRectXYWH) {

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

    getEditRectState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        const editorUnitId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
        const unitId = 'slide_test';
        const docData: IDocumentData = {
            id: unitId,
            body: {
                dataStream: 'A Text !!!!',
            } as IDocumentBody,
            documentStyle: {} as IDocumentStyle,
        };
        const docDataModel = new DocumentDataModel(docData);
        const documentLayoutObject: IDocumentLayoutObject = {
            documentModel: docDataModel,
            fontString: 'document',
            textRotation: { a: 0, v: 0 },
            wrapStrategy: 0,
            verticalAlign: 0,
            horizontalAlign: 0,
            paddingData: { t: 0, b: 1, l: 2, r: 2 },
        };

        // see insert-text.operation
        const defaultWidth = 220;
        const defaultheight = 40;
        const left = 230;
        const top = 142;
        return {
            position: { startX: left, startY: top, endX: left + defaultWidth, endY: top + defaultheight },
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
}
