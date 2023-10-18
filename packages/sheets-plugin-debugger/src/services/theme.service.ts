import { IStyleSheet, ThemeService as _ThemeService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

export class ThemeService {
    constructor(@Inject(_ThemeService) private readonly _themeService: _ThemeService) {}

    setTheme(theme: IStyleSheet) {
        this._themeService.setTheme(theme);
    }
}
