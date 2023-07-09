import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, CommandManager, CommandUnit } from '../../Command';

export interface IUpdateDocumentActionData extends IDocActionData {
    text: string;
}

export class UpdateDocumentAction extends DocActionBase<
    IUpdateDocumentActionData,
    IUpdateDocumentActionData
> {
    static NAME = 'UpdateDocumentAction';

    constructor(
        actionData: IUpdateDocumentActionData,
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
