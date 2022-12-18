import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, ActionType, CommandUnit } from '../../Command';
import { InsertTextApply } from '../Apply/InsertTextApply';
import { IDeleteTextActionData } from './DeleteTextAction';
import { DeleteTextApply } from '../Apply/DeleteTextApply';

export interface IInsertTextActionData extends IDocActionData {
    text: string;
    start: number;
    length: number;
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
}

export class InsertTextAction extends DocActionBase<
    IInsertTextActionData,
    IDeleteTextActionData
> {
    constructor(
        actionData: IInsertTextActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do();
        const { length, start } = actionData;
        this._oldActionData = { ...actionData, start: start + length };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const { text, start, length, segmentId } = actionData;
        InsertTextApply(document, { text, start, length, segmentId });

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    undo(): void {
        const actionData = this.getOldActionDaa();
        const document = this.getDocument();
        const { length, start, segmentId } = actionData;
        DeleteTextApply(document, { length, start, segmentId });

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}
