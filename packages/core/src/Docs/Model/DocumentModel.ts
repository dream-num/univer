import { IDocumentData } from '../../Types/Interfaces';

export class DocumentModel {
    constructor(private snapshot: Partial<IDocumentData>) {}
}
