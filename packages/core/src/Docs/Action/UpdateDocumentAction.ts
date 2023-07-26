import { DocActionBase } from '../../Command/DocActionBase';
import { IUpdateDocumentActionData } from '../../Types/Interfaces/IDocActionInterfaces';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers } from '../../Command/ActionBase';

export class UpdateDocumentAction extends DocActionBase<IUpdateDocumentActionData, IUpdateDocumentActionData> {
    constructor(actionData: IUpdateDocumentActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = { ...actionData };
        this.do();
        this._oldActionData = { ...actionData };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const documentModel = this.getDocumentModel();
        // InsertTextApply(document, actionData.text);
    }

    undo(): void {
        // TODO ...
        // ...
    }

    validate(): boolean {
        return false;
    }
}
