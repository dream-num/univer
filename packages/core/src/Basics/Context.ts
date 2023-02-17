import { IUniverData } from '../Interfaces/IUniverData';
import { Locale } from '../Shared';
import { ContextBase } from './ContextBase';

/**
 * univer context
 */
export class Context extends ContextBase {
    protected _locale: Locale;

    constructor(univerData: Partial<IUniverData> = {}) {
        super();

        this._locale = new Locale();
        this._locale.initialize();
    }

    getLocale(): Locale {
        return this._locale;
    }

    protected _setObserver(): void { }
}
