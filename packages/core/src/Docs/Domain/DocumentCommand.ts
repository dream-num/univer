import { IActionData } from '../../Command/ActionBase';
import { Command } from '../../Command/Command';
import { DocumentModel } from '../Model/DocumentModel';

export class DocumentCommand extends Command {
    constructor(documentModel: DocumentModel, ...list: IActionData[]) {
        super({ DocumentModel: documentModel }, ...list);
    }
}
