import { LocaleService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IFontLocale } from '../Basics/Interfaces';
import { en, zh } from '../Locale';

export class Skeleton {
    private _fontLocale: IFontLocale;

    private _dirty = true;

    constructor(@Inject(LocaleService) protected readonly _localService: LocaleService) {
        this._localeInitial();
    }

    get dirty() {
        return this._dirty;
    }

    getFontLocale() {
        return this._fontLocale;
    }

    makeDirty(state: boolean) {
        this._dirty = state;
    }

    private _localeInitial() {
        const locale = this._localService.getLocale();
        const renderFont = locale.getObject('renderFont');
        if (!renderFont) {
            locale.load({
                en,
                zh,
            });
        }
        this._fontLocale = renderFont as IFontLocale;
    }
}
