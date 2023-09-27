import { BehaviorSubject, Observable } from 'rxjs';

import { Nullable } from '../../common/type-utils';
import { Disposable, toDisposable } from '../../Shared/lifecycle';
import { IStyleSheet, themeInstance } from './theme';

export class ThemeService extends Disposable {
    private currentTheme: Nullable<IStyleSheet>;

    // TODO: dark mode
    private darkMode: boolean = false;

    readonly currentTheme$: Observable<IStyleSheet>;

    private readonly _currentTheme$ = new BehaviorSubject<IStyleSheet>({});

    constructor() {
        super();

        this.currentTheme$ = this._currentTheme$.asObservable();

        this.disposeWithMe(toDisposable(() => this._currentTheme$.complete()));
    }

    getDarkMode() {
        return this.darkMode;
    }

    getCurrentTheme() {
        if (!this.currentTheme) {
            throw new Error('[ThemeService]: current theme is not set!');
        }
        return this.currentTheme;
    }

    setDarkMode(flag: boolean) {}

    setTheme(theme: IStyleSheet) {
        themeInstance.setTheme(theme);
        this.currentTheme = theme;
        this._currentTheme$.next(theme);
    }
}
