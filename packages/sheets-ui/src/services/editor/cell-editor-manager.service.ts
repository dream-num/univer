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

import type { IDisposable, IPosition, Nullable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { createIdentifier } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

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

    private readonly _state$ = new BehaviorSubject<Nullable<ICellEditorManagerParam>>(null);

    readonly state$ = this._state$.asObservable();

    private readonly _rect$ = new BehaviorSubject<Nullable<ICellEditorBoundingClientRect>>(null);

    readonly rect$ = this._rect$.asObservable();

    private _focus: boolean = false;
    private readonly _focus$ = new BehaviorSubject<boolean>(this._focus);
    readonly focus$ = this._focus$.asObservable();

    dispose(): void {
        this._state$.complete();
        this._state = null;
        this._rect$.complete();
        this._rect = null;
    }

    setState(param: ICellEditorManagerParam): void {
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
