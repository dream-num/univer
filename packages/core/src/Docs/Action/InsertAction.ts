import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import {
    ActionObservers,
    ActionType,
    CommandManager,
    CommandUnit,
    CommonParameter,
} from '../../Command';
import { IDeleteTextActionData } from './DeleteAction';

export interface IInsertTextActionData extends IDocActionData {
    text: string;
    len: number;
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
        observers: ActionObservers,
        commonParameter: CommonParameter
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do(commonParameter);
        const { segmentId, text, len } = actionData;
        // this._oldActionData = {
        //     ...actionData,
        //     actionName: DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME,
        //     cursorEnd: cursorStart + textLength,
        //     isEndBack: isStartBack,
        //     isCollapse: true,
        // };
    }

    redo(commonParameter: CommonParameter): void {
        this.do(commonParameter);
    }

    do(commonParameter: CommonParameter): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const { text, len, segmentId } = actionData;
        // InsertTextApply(document, text, textLength, {
        //     cursorStart,
        //     isStartBack,
        //     segmentId,
        // });

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    undo(commonParameter: CommonParameter): void {
        const actionData = this.getOldActionData();
        const document = this.getDocument();
        // const { length, start, segmentId } = actionData;
        // DeleteTextApply(document, { ...actionData });

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
