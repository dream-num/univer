import { IDocumentData } from '../Interfaces';
import { ContextBase } from './ContextBase';
import { DocumentModel } from '../Docs/Domain/DocumentModel';

/**
 * Core context, mount important instances, managers
 */
export class DocContext extends ContextBase {
    protected _document: DocumentModel;

    constructor(univerDocData: Partial<IDocumentData> = {}) {
        super();
        this._document = new DocumentModel(univerDocData, this);
    }

    protected _setObserver(): void {}

    getDocument(): DocumentModel {
        return this._document;
    }
}
