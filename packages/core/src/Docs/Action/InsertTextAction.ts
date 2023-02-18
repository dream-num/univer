import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, ActionType, CommandUnit } from '../../Command';
import { InsertTextApply } from '../Apply/InsertTextApply';
import { IDeleteTextActionData } from './DeleteTextAction';
import { DeleteTextApply } from '../Apply/DeleteTextApply';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';

export interface IInsertTextActionData extends IDocActionData {
    text: string;
    cursorStart: number;
    isStartBack: boolean;
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
        const { cursorStart, isStartBack, text } = actionData;
        this._oldActionData = {
            ...actionData,
            actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
            cursorEnd: cursorStart + text.length,
            isEndBack: isStartBack,
            isCollapse: true,
        };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        // const { text, start, length, segmentId } = actionData;
        InsertTextApply(document, { ...actionData });

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    undo(): void {
        const actionData = this.getOldActionDaa();
        const document = this.getDocument();
        // const { length, start, segmentId } = actionData;
        DeleteTextApply(document, { ...actionData });

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
