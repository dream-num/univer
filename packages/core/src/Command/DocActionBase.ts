import { ActionBase, IActionData } from './ActionBase';
import { Document } from '../Docs/Domain/Document';
import { CommandUnit } from './Command';
import { ActionObservers } from './ActionObservers';

export interface IDocActionData extends IActionData {}

export abstract class DocActionBase<
    D extends IDocActionData,
    O extends IDocActionData = D,
    R = void
> extends ActionBase<D, O, R> {
    protected _document: Document;

    protected constructor(
        actionData: D,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, observers);
        if (commandUnit.DocumentUnit == null) {
            throw new Error('action document domain can not be null!');
        }
        this._document = commandUnit.DocumentUnit;
    }

    getDocument(): Document {
        return this._document;
    }
}
