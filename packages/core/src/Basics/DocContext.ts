import { IDocumentData } from '../Types/Interfaces';
import { ContextBase } from './ContextBase';
import { Document } from '../Docs/Domain/Document';
import { CommandManager } from '../Command/CommandManager';

/**
 * Core context, mount important instances, managers
 */
export class DocContext extends ContextBase {
    protected _document: Document;

    constructor(private snapshot: Partial<IDocumentData> = {}, private commandManager: CommandManager) {
        super();
        this._document = new Document(snapshot, commandManager);
    }

    getDocument(): Document {
        return this._document;
    }

    protected _setObserver(): void {}
}
