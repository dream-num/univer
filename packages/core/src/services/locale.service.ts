import { BehaviorSubject, Observable } from 'rxjs';

import { Disposable, toDisposable } from '../Shared/Lifecycle';
import { ILocales } from '../Shared/Locale';
import { Tools } from '../Shared/Tools';
import { Nullable } from '../Shared/Types';
import { LocaleType } from '../Types/Enum/LocaleType';

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
        return locale[key] ? locale[key] : key.split('.').reduce((a, b) => a[b], locale);
    } catch (error) {
        console.error('Key %s not found', key);
    }
}

interface ILanguagePack {
    [key: string]: string | object;
}

/**
 * This service provides i18n and timezone / location features to other modules.
 */
export class LocaleService extends Disposable {
    currentLocale: LocaleType;

    locales: ILocales;

    readonly locale$: Observable<Nullable<LocaleType>>;

    private readonly _locale$ = new BehaviorSubject<Nullable<LocaleType>>(undefined);

    constructor() {
        super();

        this.locale$ = this._locale$.asObservable();

        this.disposeWithMe(toDisposable(() => this._locale$.complete()));
    }

    t(key: string): string {
        return this.get(key);
    }

    setLocale(locale: LocaleType): void {
        this.initialize(locale);
        this._locale$.next(locale);
    }

    getLocale() {
        return this;
    }

    initialize(locale: Nullable<LocaleType>) {
        this.currentLocale = locale || LocaleType.EN;
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
    get(key: string | undefined): string {
        if (key) {
            const { locales, currentLocale } = this;

            return (getValue(locales[currentLocale], key) as string) || key;
        }
        return String();
    }

    getObject<T>(key: string): T {
        const { locales, currentLocale } = this;
        return getValue(locales[currentLocale], key) as unknown as T;
    }

    /**
     * Load more locales after init
     *
     * @example
     * ```ts
     * Locale.load({zh,en})
     * ```
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
