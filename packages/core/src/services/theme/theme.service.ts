import { BehaviorSubject, Observable } from 'rxjs';

import { Nullable } from '../../common/type-utils';
import { Disposable, toDisposable } from '../../shared/lifecycle';

export interface IStyleSheet {
    [key: string]: string;
}

export class ThemeService extends Disposable {
    private currentTheme: Nullable<IStyleSheet>;

    // TODO: dark mode
    private darkMode: boolean = false;

    private readonly _currentTheme$ = new BehaviorSubject<IStyleSheet>({});
    readonly currentTheme$: Observable<IStyleSheet> = this._currentTheme$.asObservable();

    constructor() {
        super();

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
        this.currentTheme = theme;
        this._currentTheme$.next(theme);
    }
}
