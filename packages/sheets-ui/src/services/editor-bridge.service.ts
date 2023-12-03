import type { IPosition, Nullable } from '@univerjs/core';
import type { IDocumentLayoutObject } from '@univerjs/engine-render';
import { DeviceInputEventType } from '@univerjs/engine-render';
import type { KeyCode } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
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
}

export interface IEditorBridgeService {
    state$: Observable<Nullable<IEditorBridgeServiceParam>>;
    visible$: Observable<IEditorBridgeServiceVisibleParam>;
    dispose(): void;
    setState(param: IEditorBridgeServiceParam): void;
    getState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    changeVisible(param: IEditorBridgeServiceVisibleParam): void;
    isVisible(): IEditorBridgeServiceVisibleParam;
    enableForceKeepVisible(): void;
    disableForceKeepVisible(): void;
    isForceKeepVisible(): boolean;
    getCurrentEditorId(): Nullable<string>;
}

export class EditorBridgeService implements IEditorBridgeService, IDisposable {
    private _state: Nullable<IEditorBridgeServiceParam> = null;

    private _isForceKeepVisible: boolean = false;

    private _visible: IEditorBridgeServiceVisibleParam = {
        visible: false,
        eventType: DeviceInputEventType.Dblclick,
    };

    private readonly _state$ = new BehaviorSubject<Nullable<IEditorBridgeServiceParam>>(null);
    readonly state$ = this._state$.asObservable();

    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly visible$ = this._visible$.asObservable();

    private readonly _afterVisible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly afterVisible$ = this._afterVisible$.asObservable();

    dispose(): void {
        this._state$.complete();
        this._state = null;
    }

    setState(param: IEditorBridgeServiceParam) {
        this._state = param;

        this._state$.next(param);
    }

    getState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        return this._state;
    }

    getCurrentEditorId() {
        return this._state?.editorUnitId;
    }

    changeVisible(param: IEditorBridgeServiceVisibleParam) {
        this._visible = param;

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
}

export const IEditorBridgeService = createIdentifier<EditorBridgeService>('univer.sheet-editor-bridge.service');
