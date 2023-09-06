import { Locale } from '../Shared/Locale';
import { LocaleType } from '../Types/Enum/LocaleType';

/**
 * This service provides i18n and timezone / location features to other modules.
 */
export class LocaleService {
    private _locale;

    constructor() {
        this._locale = new Locale();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t(key: string, ...args: any[]): string {
        return this._locale.get(key);
    }

    setLocale(locale: LocaleType): void {
        this._locale.initialize(locale);
    }

    getLocale(): Locale {
        return this._locale;
    }
}
