import { SheetContext } from '@univer/core';
import { en, zh } from '../Locale';
import { IFontLocale } from '../Basics/Interfaces';

export class Skeleton {
    private _context: SheetContext;

    private _fontLocale: IFontLocale;

    private _dirty = true;

    get dirty() {
        return this._dirty;
    }

    constructor(context: SheetContext) {
        this._context = context;
        this._localeInitial();
    }

    private _localeInitial() {
        if (!this._context) {
            return;
        }

        const locale = this._context.getLocale();
        const renderFont = locale.getObject('renderFont');
        if (!renderFont) {
            locale.load({
                en,
                zh,
            });
        }
        this._fontLocale = renderFont as IFontLocale;
    }

    getFontLocale() {
        return this._fontLocale;
    }

    getContext() {
        return this._context;
    }

    makeDirty(state: boolean) {
        this._dirty = state;
    }
}
