import { Nullable, Tools } from '@univerjs/core';

import { LocaleType } from '../../Enum';

/**
 * The data structure stored by the Locale class
 */
export type ILocaleOptions = {
    /**
     *  Current Locale such as 'en' / 'en-US' / 'zh' / ''zh-CN / 'zh-TW'
     *
     * @remarks
     * See {@link LocaleType| the LocaleType enum} for more details.
     *
     * @defaultValue `LocaleType.EN`
     */
    currentLocale: LocaleType;

    /**
     * The content of international translation, stored in key-value form,
     *
     * @example
     * Locale data like
     * ```json
     * {
     *      "en": {
     *          "name": "value"
     *      },
     *      "zh": {
     *          "name": "值"
     *      }
     * }
     * ```
     */
    locales: Record<string, any>;
};

/**
 * Basics English internationalization object
 *
 * The internationalized language pack of the plug-in will be dynamically loaded in each plug-in.
 */
const zh = {};
const en = {};

/**
 * Internationalization
 *
 * @remarks
 * Get inspiration from the react-intl-universal project, see {@link https://github.com/alibaba/react-intl-universal | the protocol spec}.
 *
 * @beta
 */
export class Locale {
    options: ILocaleOptions;

    constructor(locale: Nullable<LocaleType>) {
        this.options = {
            // use config first, or get language setting from browser
            currentLocale: locale || ['zh', 'zh-CN'].includes(Tools.getLanguage()) ? LocaleType.ZH : LocaleType.EN,
            locales: { zh, en },
        };
    }

    /**
     * get value from Locale object and key
     * @param locale - A specified language pack
     * @param key - Specify key
     * @returns Get the translation corresponding to the Key
     *
     * @private
     */
    private static getValue(locale: Record<string, any>, key: string): Nullable<string | object> {
        try {
            return locale[key] ? locale[key] : key.split('.').reduce((a, b) => a[b], locale);
        } catch (error) {
            console.error('Key %s not found', key);
        }
    }

    initialize(locale: Nullable<LocaleType>) {
        this.options = {
            // use config first, or get language setting from browser
            currentLocale: locale || ['zh', 'zh-CN'].includes(Tools.getLanguage()) ? LocaleType.ZH : LocaleType.EN,
            locales: { zh, en },
        };
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
            const { locales, currentLocale } = this.options;
            return (Locale.getValue(locales[currentLocale], key) as string) || '';
        }
        return String();
    }

    getObject<T>(key: string): T {
        const { locales, currentLocale } = this.options;
        return Locale.getValue(locales[currentLocale], key) as unknown as T;
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
    load(locales: object): void {
        Tools.deepMerge(this.options.locales, locales);
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
        this.options.currentLocale = locale;
    }
}
