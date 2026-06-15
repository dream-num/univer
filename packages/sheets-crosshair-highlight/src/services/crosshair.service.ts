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
import { ColorKit, Disposable, Inject, ThemeService } from '@univerjs/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

export const CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS = Array.from({ length: 16 }, (_, index) => `highlight.background.${index + 1}`);
export const DEFAULT_CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATH = CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS[0];

interface IThemeColorWithAlpha {
    color: string;
    alpha: number;
}

export function resolveCrosshairHighlightColor(themeService: ThemeService, tokenPath: string): string {
    const token = themeService.getColorFromTheme<IThemeColorWithAlpha | undefined>(tokenPath);

    if (token == null || typeof token.color !== 'string' || typeof token.alpha !== 'number') {
        throw new Error(`Theme token ${tokenPath} is required.`);
    }

    const color = themeService.getColorFromTheme<string | undefined>(token.color) ?? token.color;
    return new ColorKit(color).setAlpha(token.alpha).toRgbString();
}

export function resolveCrosshairHighlightColors(themeService: ThemeService): string[] {
    return CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS.map((tokenPath) => resolveCrosshairHighlightColor(themeService, tokenPath));
}

export class SheetsCrosshairHighlightService extends Disposable {
    private readonly _enabled$ = new BehaviorSubject<boolean>(false);
    readonly enabled$ = this._enabled$.asObservable();
    get enabled(): boolean { return this._enabled$.getValue(); }

    private readonly _colorToken$ = new BehaviorSubject<string>(DEFAULT_CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATH);
    readonly colorToken$ = this._colorToken$.asObservable();

    readonly color$: Observable<string>;
    readonly highlightColor$: Observable<string>;

    constructor(
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this.color$ = combineLatest([this._colorToken$, this._themeService.currentTheme$]).pipe(
            map(([tokenPath]) => resolveCrosshairHighlightColor(this._themeService, tokenPath))
        );
        this.highlightColor$ = this.color$;
    }

    override dispose(): void {
        this._enabled$.complete();
        this._colorToken$.complete();
    }

    setEnabled(value: boolean): void {
        this._enabled$.next(value);
    }

    setColor(value: string): void {
        this._colorToken$.next(value);
    }
}
