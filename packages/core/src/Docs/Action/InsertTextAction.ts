import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import {
    ActionObservers,
    ActionType,
    CommandManager,
    CommandUnit,
} from '../../Command';
import { IElement } from '../../Interfaces/IDocumentData';
import { InsertTextApply } from '../Apply/InsertTextApply';
import { IDeleteTextActionData } from './DeleteTextAction';
import { DeleteTextApply } from '../Apply/DeleteTextApply';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';

export interface IInsertTextActionData extends IDocActionData {
    text: string | IElement[];
    textLength: number;
    cursorStart: number;
    isStartBack: boolean;
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
}

export class InsertTextAction extends DocActionBase<
    IInsertTextActionData,
    IDeleteTextActionData
> {
    static NAME = 'InsertTextAction';

    constructor(
        actionData: IInsertTextActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do();
        const { cursorStart, isStartBack, text, textLength } = actionData;
        this._oldActionData = {
            ...actionData,
            actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
            cursorEnd: cursorStart + textLength,
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
        const { text, cursorStart, isStartBack, textLength, segmentId } = actionData;
        InsertTextApply(document, text, textLength, {
            cursorStart,
            isStartBack,
            segmentId,
        });

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    undo(): void {
        const actionData = this.getOldActionData();
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

CommandManager.register(InsertTextAction.NAME, InsertTextAction);
