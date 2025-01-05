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

import type { Observable } from 'rxjs';
import type { Nullable } from '../../shared/types';

import { BehaviorSubject } from 'rxjs';
import { Disposable, toDisposable } from '../../shared/lifecycle';

export interface IStyleSheet {
    [key: string]: string;
}

export class ThemeService extends Disposable {
    private _currentTheme: Nullable<IStyleSheet>;

    private readonly _currentTheme$ = new BehaviorSubject<IStyleSheet>({});
    readonly currentTheme$: Observable<IStyleSheet> = this._currentTheme$.asObservable();

    constructor() {
        super();

        this.disposeWithMe(toDisposable(() => this._currentTheme$.complete()));
    }

    getCurrentTheme(): IStyleSheet {
        if (!this._currentTheme) {
            throw new Error('[ThemeService]: current theme is not set!');
        }

        return this._currentTheme;
    }

    setTheme(theme: IStyleSheet): void {
        this._currentTheme = theme;
        this._currentTheme$.next(theme);
    }
}
