import { DocumentModel } from '../Docs/Model/DocumentModel';
import { ActionBase, ActionObservers, IActionData } from './ActionBase';
import { CommandModel } from './CommandModel';

export interface IDocActionData extends IActionData {}

export abstract class DocActionBase<D extends IDocActionData, O extends IDocActionData = D, R = void> extends ActionBase<D, O, R> {
    protected _documentModel: DocumentModel;

    protected constructor(actionData: D, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, observers);
        if (commandModel.DocumentModel == null) {
            throw new Error('action document domain can not be null!');
        }
        this._documentModel = commandModel.DocumentModel;
    }

    getDocumentModel(): DocumentModel {
        return this._documentModel;
    }
}
