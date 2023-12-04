import type { Nullable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface IFormulaEditorManagerService {
    position$: Observable<Nullable<DOMRect>>;
    focus$: Observable<boolean>;
    fxBtnClick$: Observable<boolean>;
    dispose(): void;
    setPosition(param: DOMRect): void;
    getPosition(): Readonly<Nullable<DOMRect>>;
    setFocus(param: boolean): void;
}

export class FormulaEditorManagerService implements IDisposable {
    private _position: Nullable<DOMRect> = null;

    private readonly _position$ = new BehaviorSubject<Nullable<DOMRect>>(null);
    readonly position$ = this._position$.asObservable();

    private _focus: boolean = false;

    private readonly _focus$ = new BehaviorSubject<boolean>(this._focus);
    readonly focus$ = this._focus$.asObservable();

    private readonly _fxBtnClick$ = new BehaviorSubject<boolean>(false);
    readonly fxBtnClick$ = this._fxBtnClick$.asObservable();

    dispose(): void {
        this._position$.complete();
        this._focus$.complete();
        this._position = null;
        this._focus = false;
    }

    setPosition(param: DOMRect) {
        this._position = param;

        this._refresh(param);
    }

    getPosition(): Readonly<Nullable<DOMRect>> {
        return this._position;
    }

    setFocus(param: boolean = false) {
        this._focus = param;
        this._focus$.next(param);
    }

    handleFxBtnClick(params: boolean) {
        this._fxBtnClick$.next(params);
    }

    private _refresh(param: DOMRect): void {
        this._position$.next(param);
    }
}

export const IFormulaEditorManagerService = createIdentifier<FormulaEditorManagerService>(
    'univer.sheet-formula-editor-manager.service'
);
