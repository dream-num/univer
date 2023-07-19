import { DocActionBase } from '../../Command/DocActionBase';
import { ActionObservers, CommandManager, CommandModel } from '../../Command';
import { IUpdateDocumentActionData } from './ActionDataInterface';

export class UpdateDocumentAction extends DocActionBase<IUpdateDocumentActionData, IUpdateDocumentActionData> {
    static NAME = 'UpdateDocumentAction';

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
        const document = this.getDocument();
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

CommandManager.register(UpdateDocumentAction.NAME, UpdateDocumentAction);
