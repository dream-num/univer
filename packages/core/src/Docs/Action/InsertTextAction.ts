import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, CommandUnit } from '../../Command';
import { InsertTextApply } from '../Apply/InsertTextApply';

export interface IInsertTextActionData extends IDocActionData {
    text: string;
}

export class InsertTextAction extends DocActionBase<
    IInsertTextActionData,
    IInsertTextActionData
> {
    constructor(
        actionData: IInsertTextActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do();
        this._oldActionData = { ...actionData };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        InsertTextApply(document, actionData.text);
    }

    undo(): void {
        // TODO ...
        // ...
    }

    validate(): boolean {
        return false;
    }
}
