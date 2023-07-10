import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import {
    ActionObservers,
    ActionType,
    CommandManager,
    CommandUnit,
    CommonParameter,
} from '../../Command';
import { IDeleteActionData } from './DeleteAction';
import { IDocumentBody } from '../../Interfaces';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';
import { InsertApply } from '../Apply/InsertApply';

export interface IInsertActionData extends IDocActionData {
    body: IDocumentBody;
    len: number;
    line: number;
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
}

export class InsertAction extends DocActionBase<
    IInsertActionData,
    IDeleteActionData
> {
    static NAME = 'InsertAction';

    constructor(
        actionData: IInsertActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers,
        commonParameter: CommonParameter
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do(commonParameter);
        const { segmentId, line, len } = actionData;
        this._oldActionData = {
            actionName: DOC_ACTION_NAMES.DELETE_ACTION_NAME,
            len,
            line,
            segmentId,
        };
    }

    redo(commonParameter: CommonParameter): void {
        this.do(commonParameter);
    }

    do(commonParameter: CommonParameter): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const { body, len, segmentId } = actionData;

        InsertApply(document, body, len, commonParameter.cursor, segmentId);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
            commonParameter,
        });

        commonParameter.moveCursor(len);
    }

    undo(commonParameter: CommonParameter): void {
        const actionData = this.getOldActionData();
        const document = this.getDocument();
        const { len, segmentId } = actionData;
        commonParameter.moveCursor(len);
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

CommandManager.register(InsertAction.NAME, InsertAction);
