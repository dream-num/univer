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

import { createIdentifier, Disposable, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import type { IScrollState } from '../../views/sheet-bar/sheet-bar-tabs/utils/slide-tab-bar';

export interface ISheetBarMenuHandler {
    handleSheetBarMenu(): void;
}

export interface ISheetBarService {
    renameId$: Observable<string>;
    removeId$: Observable<string>;
    scroll$: Observable<IScrollState>;
    scrollX$: Observable<number>;
    addSheet$: Observable<number>;
    setRenameId(id: string): void;
    setRemoveId(id: string): void;
    setScroll(state: IScrollState): void;
    setScrollX(x: number): void;
    setAddSheet(index: number): void;
    triggerSheetBarMenu(): void;
    registerSheetBarMenuHandler(handler: ISheetBarMenuHandler): IDisposable;
}

export const ISheetBarService = createIdentifier<ISheetBarService>('univer.sheetbar-service');

export class SheetBarService extends Disposable implements ISheetBarService {
    readonly renameId$: Observable<string>;
    readonly removeId$: Observable<string>;
    readonly scroll$: Observable<IScrollState>;
    readonly scrollX$: Observable<number>;
    readonly addSheet$: Observable<number>;

    private readonly _renameId$: Subject<string>;
    private readonly _removeId$: Subject<string>;
    private readonly _scroll$: Subject<IScrollState>;
    private readonly _scrollX$: Subject<number>;
    private readonly _addSheet$: Subject<number>;

    private _currentHandler: ISheetBarMenuHandler | null = null;

    constructor() {
        super();

        this._renameId$ = new Subject();
        this.renameId$ = this._renameId$.asObservable();

        this._removeId$ = new Subject();
        this.removeId$ = this._removeId$.asObservable();

        this._scroll$ = new Subject();
        this.scroll$ = this._scroll$.asObservable();

        this._scrollX$ = new Subject();
        this.scrollX$ = this._scrollX$.asObservable();

        this._addSheet$ = new Subject();
        this.addSheet$ = this._addSheet$.asObservable();
    }

    setRenameId(renameId: string): void {
        this._renameId$.next(renameId);
    }

    setRemoveId(removeId: string): void {
        this._removeId$.next(removeId);
    }

    setScroll(state: IScrollState): void {
        this._scroll$.next(state);
    }

    setScrollX(x: number): void {
        this._scrollX$.next(x);
    }

    setAddSheet(index: number): void {
        this._addSheet$.next(index);
    }

    triggerSheetBarMenu(): void {
        this._currentHandler?.handleSheetBarMenu();
    }

    registerSheetBarMenuHandler(handler: ISheetBarMenuHandler): IDisposable {
        if (this._currentHandler) {
            throw new Error('There is already a context menu handler!');
        }

        this._currentHandler = handler;

        return toDisposable(() => {
            this._currentHandler = null;
        });
    }
}
