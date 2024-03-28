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

import type { IDataValidationRule, Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

export class DataValidationPanelService extends Disposable {
    private _open$ = new BehaviorSubject<boolean>(false);
    private _activeRule: Nullable<{ unitId: string; subUnitId: string; rule: IDataValidationRule }> = undefined;
    private _activeRule$ = new BehaviorSubject<Nullable<{ unitId: string; subUnitId: string; rule: IDataValidationRule }>>(undefined);

    open$ = this._open$.pipe(distinctUntilChanged());
    activeRule$ = this._activeRule$.asObservable();

    get activeRule() {
        return this._activeRule;
    }

    get isOpen(): boolean {
        return this._open$.getValue();
    }

    override dispose(): void {
        this._open$.next(false);
        this._open$.complete();
    }

    open(): void {
        this._open$.next(true);
    }

    close(): void {
        this._open$.next(false);
    }

    setActiveRule(rule: Nullable<{ unitId: string; subUnitId: string; rule: IDataValidationRule }>): void {
        this._activeRule = rule;
        this._activeRule$.next(rule);
    }
}
