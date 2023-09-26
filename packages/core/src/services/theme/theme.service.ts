import { BehaviorSubject, Observable } from 'rxjs';

import { Disposable, toDisposable } from '../../Shared/lifecycle';
import { IStyleSheet, themeInstance } from './theme';

export class ThemeService extends Disposable {
    private currentTheme: IStyleSheet;

    // TODO: dark mode
    private darkMode: boolean;

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
        return this.currentTheme;
    }

    setDarkMode(flag: boolean) {}

    setTheme(theme: IStyleSheet) {
        themeInstance.setTheme(theme);
        this.currentTheme = theme;
        this._currentTheme$.next(theme);
    }
}
