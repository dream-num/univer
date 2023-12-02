import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import type { Nullable } from '../../common/type-utils';
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

    getCurrentTheme() {
        if (!this._currentTheme) {
            throw new Error('[ThemeService]: current theme is not set!');
        }
        return this._currentTheme;
    }

    setTheme(theme: IStyleSheet) {
        this._currentTheme = theme;
        this._currentTheme$.next(theme);
    }
}
