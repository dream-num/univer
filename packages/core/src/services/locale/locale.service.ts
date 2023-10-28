import { BehaviorSubject, Observable } from 'rxjs';

import { Disposable, toDisposable } from '../../Shared/lifecycle';
import { ILocales } from '../../Shared/Locale';
import { Tools } from '../../Shared/Tools';
import { Nullable } from '../../Shared/Types';
import { LocaleType } from '../../Types/Enum/LocaleType';

/**
 * get value from Locale object and key
 * @param locale - A specified language pack
 * @param key - Specify key
 * @returns Get the translation corresponding to the Key
 *
 * @private
 */
function getValue(locale: ILocales[LocaleType], key: string): Nullable<string | object> {
    if (!locale) return;

    try {
        if (locale[key]) return locale[key];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return key.split('.').reduce((a: any, b: string) => a[b], locale);
    } catch (error) {
        console.warn('Key %s not found', key);
        return key;
    }
}

/**
 * This service provides i18n and timezone / location features to other modules.
 */
export class LocaleService extends Disposable {
    currentLocale: LocaleType = LocaleType.EN_US;

    locales: ILocales | null = null;

    readonly locale$: Observable<Nullable<LocaleType>>;

    private readonly _locale$ = new BehaviorSubject<Nullable<LocaleType>>(undefined);

    constructor() {
        super();

        this.locale$ = this._locale$.asObservable();

        this.disposeWithMe(toDisposable(() => this._locale$.complete()));
    }

    t(key?: string): string | number {
        return this.get(key) ?? key ?? '';
    }

    setLocale(locale: LocaleType): void {
        this.initialize(locale);
        this._locale$.next(locale);
    }

    getLocale() {
        return this;
    }

    initialize(locale: Nullable<LocaleType>) {
        this.currentLocale = locale || LocaleType.EN_US;
    }

    /**
     * Get the formatted message by key
     *
     * @example
     * ```ts
     * Locale.get('name')
     * ```
     *
     * @param key - The string representing key in Locale data file
     * @returns Get the translation corresponding to the Key
     */
    get(key: string | undefined): Nullable<string | number> {
        const { locales, currentLocale } = this;
        if (!locales) {
            throw new Error();
        }

        if (key) {
            return getValue(locales[currentLocale], key) as string;
        }
    }

    getObject<T>(key: string): T {
        const { locales, currentLocale } = this;
        if (!locales) {
            throw new Error();
        }

        return getValue(locales[currentLocale], key) as unknown as T;
    }

    /**
     * Load more locales after init
     *
     * @param locales - Locale object
     * @returns void
     *
     */
    load(locales: ILocales): void {
        this.locales = Tools.deepMerge(this.locales ?? {}, locales);
    }

    /**
     * change Locale
     *
     * @example
     * Change to Chinese
     * ```ts
     * Locale.change(LocaleType.ZH)
     * ```
     *
     * @param locale - Locale Type, see {@link LocaleType}
     *
     */
    change(locale: LocaleType): void {
        this.currentLocale = locale;
    }

    getCurrentLocale() {
        return this.currentLocale;
    }
}
