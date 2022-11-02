import { IDocumentData } from '../Interfaces/IDocumentData';
import { ContextBase } from './ContextBase';

/**
 * Core context, mount important instances, managers
 */
export class DocContext extends ContextBase {
    constructor(univerDocData: Partial<IDocumentData> = {}) {
        super();
        this._locale.initialize(univerDocData.locale);
    }

    protected _setObserver(): void {}
}
