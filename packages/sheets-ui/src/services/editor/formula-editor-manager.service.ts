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

import type { IDisposable, Nullable } from '@univerjs/core';
import { createIdentifier } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

export interface IFormulaEditorManagerService {
    position$: Observable<Nullable<DOMRect>>;
    focus$: Observable<boolean>;
    fxBtnClick$: Observable<boolean>;
    foldBtnStatus$: Observable<boolean>;
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

    private readonly _fxBtnClick$ = new Subject<boolean>();
    readonly fxBtnClick$ = this._fxBtnClick$.asObservable();

    private readonly _foldBtnStatus$ = new Subject<boolean>();
    readonly foldBtnStatus$ = this._foldBtnStatus$.asObservable();

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

    handleFoldBtnClick(params: boolean) {
        this._foldBtnStatus$.next(params);
    }

    private _refresh(param: DOMRect): void {
        this._position$.next(param);
    }
}

export const IFormulaEditorManagerService = createIdentifier<FormulaEditorManagerService>(
    'univer.sheet-formula-editor-manager.service'
);
