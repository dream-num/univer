import { ActionBase, IActionData, CommandModel, ActionObservers } from './index';
import { DocumentModel } from '../Docs/Domain/DocumentModel';

export interface IDocActionData extends IActionData {}

export abstract class DocActionBase<D extends IDocActionData, O extends IDocActionData = D, R = void> extends ActionBase<D, O, R> {
    protected _document: DocumentModel;

    protected constructor(actionData: D, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, observers);
        if (commandModel.DocumentUnit == null) {
            throw new Error('action document domain can not be null!');
        }
        this._document = commandModel.DocumentUnit;
    }

    getDocument(): DocumentModel {
        return this._document;
    }
}
