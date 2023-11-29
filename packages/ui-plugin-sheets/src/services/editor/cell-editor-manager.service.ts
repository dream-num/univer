import { IPosition, Nullable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ICellEditorManagerParam extends Partial<IPosition> {
    show: boolean;
}

export interface ICellEditorBoundingClientRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface ICellEditorManagerService {
    state$: Observable<Nullable<ICellEditorManagerParam>>;
    rect$: Observable<Nullable<ICellEditorBoundingClientRect>>;
    focus$: Observable<boolean>;
    dispose(): void;
    setState(param: ICellEditorManagerParam): void;
    getState(): Readonly<Nullable<ICellEditorManagerParam>>;
    setRect(param: ICellEditorBoundingClientRect): void;
    getRect(): Readonly<Nullable<ICellEditorBoundingClientRect>>;
    setFocus(param: boolean): void;
}

export class CellEditorManagerService implements ICellEditorManagerService, IDisposable {
    private _state: Nullable<ICellEditorManagerParam> = null;

    private _rect: Nullable<ICellEditorBoundingClientRect> = null;

    private _focus: boolean = false;

    private readonly _state$ = new BehaviorSubject<Nullable<ICellEditorManagerParam>>(null);

    readonly state$ = this._state$.asObservable();

    private readonly _rect$ = new BehaviorSubject<Nullable<ICellEditorBoundingClientRect>>(null);

    readonly rect$ = this._rect$.asObservable();

    private readonly _focus$ = new BehaviorSubject<boolean>(this._focus);

    readonly focus$ = this._focus$.asObservable();

    dispose(): void {
        this._state$.complete();
        this._state = null;
        this._rect$.complete();
        this._rect = null;
    }

    setState(param: ICellEditorManagerParam) {
        this._state = param;

        this._refresh(param);
    }

    getRect(): Readonly<Nullable<ICellEditorBoundingClientRect>> {
        return this._rect;
    }

    setRect(param: ICellEditorBoundingClientRect) {
        this._rect = param;
        this._rect$.next(param);
    }

    getState(): Readonly<Nullable<ICellEditorManagerParam>> {
        return this._state;
    }

    setFocus(param: boolean = false) {
        this._focus = param;
        this._focus$.next(param);
    }

    private _refresh(param: ICellEditorManagerParam): void {
        this._state$.next(param);
    }
}

export const ICellEditorManagerService = createIdentifier<CellEditorManagerService>(
    'univer.sheet-cell-editor-manager.service'
);
