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

import type { Observable } from 'rxjs';
import { defaultTheme } from '@univerjs/themes';
import { get } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { Disposable, toDisposable } from '../../shared/lifecycle';

export type Theme = typeof defaultTheme;

export class ThemeService extends Disposable {
    private readonly _darkMode$ = new BehaviorSubject<boolean>(false);
    readonly darkMode$: Observable<boolean> = this._darkMode$.asObservable();
    get darkMode(): boolean { return this._darkMode$.getValue(); }

    private _currentTheme: Theme = defaultTheme;
    private readonly _currentTheme$ = new BehaviorSubject<Theme>(this._currentTheme);
    readonly currentTheme$: Observable<Theme> = this._currentTheme$.asObservable();

    constructor() {
        super();

        this.disposeWithMe(toDisposable(() => {
            this._currentTheme$.complete();
            this._darkMode$.complete();
        }));
    }

    getCurrentTheme(): Theme {
        return this._currentTheme;
    }

    setTheme(theme: Theme): void {
        this._currentTheme = theme;
        this._currentTheme$.next(theme);
    }

    setDarkMode(darkMode: boolean): void {
        this._darkMode$.next(darkMode);
    }

    getColorFromTheme(color: string): string {
        return get(this._currentTheme, color);
    }
}
