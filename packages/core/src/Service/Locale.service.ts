import { LocaleType } from 'src/Types/Enum';
import { Locale } from '../Shared/Locale';

/**
 * This service provides i18n and timezone / location features to other modules.
 */
export class LocaleService {
    private _locale;

    constructor() {
        this._locale = new Locale();
    }

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