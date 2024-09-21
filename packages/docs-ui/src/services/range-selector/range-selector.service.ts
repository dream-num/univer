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

import { createIdentifier, Disposable } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import type { IDisposable, IUnitRange, Nullable } from '@univerjs/core';
import type { Observable } from 'rxjs';

export interface IRangeSelectorRange extends IUnitRange {
    sheetName: string;
}

export interface IRangeSelectorService {
    selectionChange$: Observable<IRangeSelectorRange[]>;
    selectionChange(ranges: IRangeSelectorRange[]): void;

    setCurrentSelectorId(id: Nullable<string>): void;
    getCurrentSelectorId(): Nullable<string>;

    openSelector$: Observable<unknown>;
    openSelector(): void;

    selectorModalVisible$: Observable<boolean>;
    get selectorModalVisible(): boolean;
    triggerModalVisibleChange(visible: boolean): void;
}

export class RangeSelectorService extends Disposable implements IRangeSelectorService, IDisposable {
    private _currentSelectorId: Nullable<string>;

    private readonly _selectionChange$ = new Subject<IRangeSelectorRange[]>();
    readonly selectionChange$ = this._selectionChange$.asObservable();

    private readonly _openSelector$ = new Subject();
    readonly openSelector$ = this._openSelector$.asObservable();

    private readonly _selectorModalVisible$ = new BehaviorSubject(false);
    readonly selectorModalVisible$ = this._selectorModalVisible$.asObservable();

    get selectorModalVisible() {
        return this._selectorModalVisible$.getValue();
    }

    setCurrentSelectorId(id: Nullable<string>) {
        this._currentSelectorId = id;
    }

    getCurrentSelectorId(): Nullable<string> {
        return this._currentSelectorId;
    }

    selectionChange(range: IRangeSelectorRange[]) {
        if (!this._currentSelectorId) {
            return;
        }
        this._selectionChange$.next(range);
    }

    openSelector() {
        this._openSelector$.next(null);
    }

    triggerModalVisibleChange(visible: boolean) {
        this._selectorModalVisible$.next(visible);
    }
}

export const IRangeSelectorService = createIdentifier<IRangeSelectorService>(
    'univer.range-selector.service'
);
