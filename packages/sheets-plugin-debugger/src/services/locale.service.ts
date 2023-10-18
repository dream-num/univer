import { LocaleService as _LocaleService, LocaleType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

export class LocaleService {
    constructor(@Inject(_LocaleService) private readonly _localeService: _LocaleService) {}

    setLocale(locale: LocaleType) {
        this._localeService.setLocale(locale);
    }
}
