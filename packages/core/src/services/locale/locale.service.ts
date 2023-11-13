import { Subject } from 'rxjs';

import { Nullable } from '../../common/type-utils';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import { ILocales } from '../../shared/locale';
import { Tools } from '../../shared/tools';
import { LocaleType } from '../../types/enum/locale-type';

/**
 * get value from Locale object and key
 * @param locale - A specified language pack
 * @param key - Specify key
 * @returns Get the translation corresponding to the Key
 *
 * @private
 */
function getValue(locale: ILocales[LocaleType], key: string): Nullable<string> {
    if (!locale) return;

    try {
        if (locale[key]) return locale[key] as string;

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
    private currentLocale: LocaleType = LocaleType.EN_US;

    private locales: ILocales | null = null;

    localeChanged$ = new Subject<void>();

    constructor() {
        super();

        this.disposeWithMe(toDisposable(() => this.localeChanged$.complete()));
    }

    /**
     * Load more locales after init
     *
     * @param locales - Locale object
     * @returns void
     *
     */
    load(locales: ILocales) {
        this.locales = Tools.deepMerge(this.locales ?? {}, locales);
    }

    t = (key: string): string => {
        if (!this.locales) throw new Error('Locale not initialized');

        return getValue(this.locales[this.currentLocale], key) ?? key;
    };

    setLocale(locale: LocaleType): void {
        this.currentLocale = locale;
        this.localeChanged$.next();
    }

    getLocales() {
        return this.locales?.[this.currentLocale];
    }

    getCurrentLocale() {
        return this.currentLocale;
    }
}
