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
import { BehaviorSubject } from 'rxjs';
import { get } from '../../common/lodash';
import { Disposable, toDisposable } from '../../shared/lifecycle';

export type Theme = typeof defaultTheme;

export class ThemeService extends Disposable {
    private readonly _darkMode$ = new BehaviorSubject<boolean>(false);
    readonly darkMode$: Observable<boolean> = this._darkMode$.asObservable();

    get darkMode(): boolean { return this._darkMode$.getValue(); }

    // Cache for valid theme colors
    private _validColorCache = new Map<string, boolean>();

    private _currentTheme: Theme = defaultTheme;
    private readonly _currentTheme$ = new BehaviorSubject<Theme>(this._currentTheme);
    readonly currentTheme$: Observable<Theme> = this._currentTheme$.asObservable();

    constructor() {
        super();

        this.disposeWithMe(toDisposable(() => {
            this._currentTheme = defaultTheme;
            this._currentTheme$.complete();
            this._darkMode$.complete();
        }));
    }

    /**
     * Whether the given color is a valid theme color.
     * A valid theme color can be a direct key in the theme object or a nested key with a dot notation.
     * For example:
     * @param {string} color - The color string to validate.
     * @returns {boolean} True if the color is valid, false otherwise.
     * @example
     * isValidThemeColor('primary.600'); // true
     * isValidThemeColor('blue'); // false
     */
    isValidThemeColor(color: string): boolean {
        // Check if the color is already cached
        if (this._validColorCache.has(color)) {
            return this._validColorCache.get(color)!;
        }

        let isValid = false;
        const parts = color.split('.');

        if (parts.length === 1) {
            // If there is no dot, check if the color key exists directly
            isValid = color in defaultTheme;
        } else if (parts.length === 2) {
            // If there is a dot, check if the nested color exists
            const [baseColor, shade] = parts;
            isValid = baseColor in defaultTheme && shade in (this._currentTheme[baseColor as keyof typeof this._currentTheme] as Record<string, string>);
        }

        // Cache the result
        this._validColorCache.set(color, isValid);

        return isValid; // Return false if the format is incorrect
    }

    /**
     * Get the current theme.
     * @returns The current theme.
     */
    getCurrentTheme(): Theme {
        return this._currentTheme;
    }

    /**
     * Set the current theme.
     * @param theme - The new theme to set.
     */
    setTheme(theme: Theme): void {
        this._currentTheme = theme;
        this._currentTheme$.next(theme);
    }

    /**
     * Get the current theme as an observable.
     * @param {boolean} darkMode - Whether to set the theme in dark mode.
     */
    setDarkMode(darkMode: boolean): void {
        this._darkMode$.next(darkMode);
    }

    /**
     * Get a color from the current theme.
     * @param {string} color - The color key to retrieve.
     * @returns {string} The color value from the current theme.
     */
    getColorFromTheme(color: string): string {
        return get(this._currentTheme, color);
    }
}
