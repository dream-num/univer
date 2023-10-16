import { IPosition, Nullable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ICellEditorManagerParam extends Partial<IPosition> {
    show: boolean;
}

export interface ICellEditorManagerService {
    state$: Observable<Nullable<ICellEditorManagerParam>>;
    dispose(): void;
    setState(param: ICellEditorManagerParam): void;
    getState(): Readonly<Nullable<ICellEditorManagerParam>>;
}

export class CellEditorManagerService implements ICellEditorManagerService, IDisposable {
    private _state: Nullable<ICellEditorManagerParam> = null;

    private readonly _state$ = new BehaviorSubject<Nullable<ICellEditorManagerParam>>(null);

    readonly state$ = this._state$.asObservable();

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

    private _refresh(param: ICellEditorManagerParam): void {
        this._state$.next(param);
    }
}

export const ICellEditorManagerService = createIdentifier<CellEditorManagerService>(
    'univer.sheet-cell-editor-manager.service'
);
