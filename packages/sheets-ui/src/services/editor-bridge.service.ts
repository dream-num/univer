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

import type { ICellDataForSheetInterceptor, IPosition, Nullable } from '@univerjs/core';
import { createInterceptorKey, Disposable, InterceptorManager, toDisposable } from '@univerjs/core';
import type { IDocumentLayoutObject } from '@univerjs/engine-render';
import { DeviceInputEventType } from '@univerjs/engine-render';
import type { ISelectionWithStyle, ISheetLocation } from '@univerjs/sheets';
import { SelectionManagerService } from '@univerjs/sheets';
import type { KeyCode } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface IEditorBridgeServiceVisibleParam {
    visible: boolean;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
}

export interface IEditorBridgeServiceParam {
    unitId: string;
    sheetId: string;
    row: number;
    column: number;
    position: IPosition;
    canvasOffset: { left: number; top: number };
    documentLayoutObject: IDocumentLayoutObject;
    scaleX: number;
    scaleY: number;
    editorUnitId: string;
    isInArrayFormulaRange?: Nullable<boolean>;
}
const BEFORE_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('BEFORE_CELL_EDIT');
const AFTER_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('AFTER_CELL_EDIT');
export interface IEditorBridgeService {
    refreshState$: Observable<Nullable<ISelectionWithStyle[]>>;
    state$: Observable<Nullable<IEditorBridgeServiceParam>>;
    visible$: Observable<IEditorBridgeServiceVisibleParam>;
    interceptor: InterceptorManager<{
        BEFORE_CELL_EDIT: typeof BEFORE_CELL_EDIT;
        AFTER_CELL_EDIT: typeof AFTER_CELL_EDIT;
    }>;
    dispose(): void;
    setState(param: IEditorBridgeServiceParam): void;
    getState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    changeVisible(param: IEditorBridgeServiceVisibleParam): void;
    changeEditorDirty(dirtyStatus: boolean): void;
    getEditorDirty(): boolean;
    isVisible(): IEditorBridgeServiceVisibleParam;
    enableForceKeepVisible(): void;
    disableForceKeepVisible(): void;
    isForceKeepVisible(): boolean;
    getCurrentEditorId(): Nullable<string>;
}

export class EditorBridgeService extends Disposable implements IEditorBridgeService, IDisposable {
    private _state: Nullable<IEditorBridgeServiceParam> = null;

    private _isForceKeepVisible: boolean = false;

    private _editorIsDirty: boolean = false;

    private _visible: IEditorBridgeServiceVisibleParam = {
        visible: false,
        eventType: DeviceInputEventType.Dblclick,
    };

    private readonly _refreshState$ = new BehaviorSubject<Nullable<ISelectionWithStyle[]>>(null);
    readonly refreshState$ = this._refreshState$.asObservable();

    private readonly _state$ = new BehaviorSubject<Nullable<IEditorBridgeServiceParam>>(null);
    readonly state$ = this._state$.asObservable();

    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly visible$ = this._visible$.asObservable();

    private readonly _afterVisible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly afterVisible$ = this._afterVisible$.asObservable();

    interceptor = new InterceptorManager({
        BEFORE_CELL_EDIT,
        AFTER_CELL_EDIT,
    });

    constructor(@Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService) {
        super();
        this.disposeWithMe(
            toDisposable(() => {
                this._state$.complete();
                this._state = null;
            })
        );
        this.disposeWithMe(
            toDisposable(
                this.interceptor.intercept(this.interceptor.getInterceptPoints().AFTER_CELL_EDIT, {
                    priority: -1,
                    handler: (_value) => _value,
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this.interceptor.intercept(this.interceptor.getInterceptPoints().BEFORE_CELL_EDIT, {
                    priority: -1,
                    handler: (_value) => _value,
                })
            )
        );
    }

    setState(param: IEditorBridgeServiceParam) {
        this._state = param;

        this._state$.next(param);
    }

    getState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        return this._state;
    }

    refreshState() {
        const selections = this._selectionManagerService.getSelections() as Nullable<ISelectionWithStyle[]>;

        this._refreshState$.next(selections);
    }

    getCurrentEditorId() {
        return this._state?.editorUnitId;
    }

    changeVisible(param: IEditorBridgeServiceVisibleParam) {
        this._visible = param;

        // Reset the dirty status when the editor is visible.
        if (param.visible) {
            this._editorIsDirty = false;
        }

        this._visible$.next(this._visible);
        this._afterVisible$.next(this._visible);
    }

    isVisible() {
        return this._visible;
    }

    enableForceKeepVisible(): void {
        this._isForceKeepVisible = true;
    }

    disableForceKeepVisible(): void {
        this._isForceKeepVisible = false;
    }

    isForceKeepVisible(): boolean {
        return this._isForceKeepVisible;
    }

    changeEditorDirty(dirtyStatus: boolean) {
        this._editorIsDirty = dirtyStatus;
    }

    getEditorDirty() {
        return this._editorIsDirty;
    }
}

export const IEditorBridgeService = createIdentifier<EditorBridgeService>('univer.sheet-editor-bridge.service');
