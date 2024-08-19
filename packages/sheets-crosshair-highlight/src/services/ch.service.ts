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

import { Disposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export class SheetsCrosshairHighlightService extends Disposable {
    private readonly _enabled$ = new BehaviorSubject<boolean>(false);
    readonly enabled$ = this._enabled$.asObservable();
    get enabled(): boolean { return this._enabled$.getValue(); }

    private readonly _color$ = new BehaviorSubject<string>('red');
    readonly color$ = this._color$.asObservable();
    get color(): string { return this._color$.getValue(); }

    override dispose(): void {
        this._enabled$.complete();
    }

    setTurnedOn(value: boolean): void {
        this._enabled$.next(value);
    }

    setColor(value: string): void {
        this._color$.next(value);
    }
}
