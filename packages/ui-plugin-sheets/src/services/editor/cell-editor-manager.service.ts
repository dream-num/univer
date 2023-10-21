import { KeyCode } from '@univerjs/base-ui';
import { IPosition, Nullable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ICellEditorManagerParam extends Partial<IPosition> {
    show: boolean;
    keycode?: KeyCode;
}

export interface ICellEditorManagerService {
    state$: Observable<Nullable<ICellEditorManagerParam>>;
    focus$: Observable<boolean>;
    dispose(): void;
    setState(param: ICellEditorManagerParam): void;
    getState(): Readonly<Nullable<ICellEditorManagerParam>>;
    setFocus(param: boolean): void;
}

export class CellEditorManagerService implements ICellEditorManagerService, IDisposable {
    private _state: Nullable<ICellEditorManagerParam> = null;

    private _focus: boolean = false;

    private readonly _state$ = new BehaviorSubject<Nullable<ICellEditorManagerParam>>(null);

    readonly state$ = this._state$.asObservable();

    private readonly _focus$ = new BehaviorSubject<boolean>(this._focus);

    readonly focus$ = this._focus$.asObservable();

    dispose(): void {
        this._state$.complete();
        this._state = null;
    }

    setState(param: ICellEditorManagerParam) {
        this._state = param;

        this._refresh(param);
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
