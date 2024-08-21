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

export const CROSSHAIR_HIGHLIGHT_COLORS = [
    'rgba(254, 75, 75, 0.4)',
    'rgba(255, 140, 81, 0.4)',
    'rgba(164, 220, 22, 0.4)',
    'rgba(45, 174, 255, 0.4)',
    'rgba(58, 96, 247, 0.4)',
    'rgba(158, 109, 227, 0.4)',
    'rgba(242, 72, 166, 0.4)',
    'rgba(153, 153, 153, 0.4)',
    'rgba(254, 75, 75, 0.2)',
    'rgba(255, 140, 81, 0.2)',
    'rgba(164, 220, 22, 0.2)',
    'rgba(45, 174, 255, 0.2)',
    'rgba(58, 96, 247, 0.2)',
    'rgba(158, 109, 227, 0.2)',
    'rgba(242, 72, 166, 0.2)',
    'rgba(153, 153, 153, 0.2)',
];

export class SheetsCrosshairHighlightService extends Disposable {
    private readonly _enabled$ = new BehaviorSubject<boolean>(false);
    readonly enabled$ = this._enabled$.asObservable();
    get enabled(): boolean { return this._enabled$.getValue(); }

    private readonly _color$ = new BehaviorSubject<string>(CROSSHAIR_HIGHLIGHT_COLORS[0]);
    readonly color$ = this._color$.asObservable();
    get color(): string { return this._color$.getValue(); }

    override dispose(): void {
        this._enabled$.complete();
    }

    setEnabled(value: boolean): void {
        this._enabled$.next(value);
    }

    setColor(value: string): void {
        this._color$.next(value);
    }
}
