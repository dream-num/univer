import { LocaleService, LocaleType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

export class I18nService {
    constructor(@Inject(LocaleService) private readonly _localeService: LocaleService) {}

    setI18n(locale: LocaleType) {
        this._localeService.setLocale(locale);
    }
}
