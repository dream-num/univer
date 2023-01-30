import { IUniverData } from '../Interfaces/IUniverData';
import { ContextBase } from './ContextBase';

/**
 * univer context
 */
export class Context extends ContextBase {
    constructor(univerData: Partial<IUniverData> = {}) {
        super();
        this._locale.initialize(univerData.locale);
    }

    protected _setObserver(): void {}
}
