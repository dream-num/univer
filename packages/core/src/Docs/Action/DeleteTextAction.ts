import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, CommandUnit } from '../../Command';
import { DeleteTextApply } from '../Apply/DeleteTextApply';
import { IInsertTextActionData } from './InsertTextAction';
import { InsertTextApply } from '../Apply/InsertTextApply';

export interface IDeleteTextActionData extends IDocActionData {
    text: string;
    start: number;
    length: number;
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
}

export class DeleteTextAction extends DocActionBase<
    IDeleteTextActionData,
    IInsertTextActionData
> {
    constructor(
        actionData: IDeleteTextActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do();
        const { length, start } = actionData;
        this._oldActionData = { ...actionData, start: start - length };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const { length, start } = actionData;
        DeleteTextApply(document, { length, start });
    }

    undo(): void {
        // TODO ...
        const actionData = this.getOldActionDaa();
        const document = this.getDocument();
        const { text, start, length } = actionData;
        InsertTextApply(document, { text, start, length });
    }

    validate(): boolean {
        return false;
    }
}
