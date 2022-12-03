import { IDocumentData } from '../Interfaces';
import { ContextBase } from './ContextBase';
import { Document } from '../Docs/Domain/Document';

/**
 * Core context, mount important instances, managers
 */
export class DocContext extends ContextBase {
    protected _document: Document;

    constructor(univerDocData: Partial<IDocumentData> = {}) {
        super();
        this._locale.initialize(univerDocData.locale);
        this._document = new Document(univerDocData, this);
    }

    protected _setObserver(): void {}

    getDocument(): Document {
        return this._document;
    }
}
