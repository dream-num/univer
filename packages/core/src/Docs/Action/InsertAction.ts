import { DocActionBase } from '../../Command/DocActionBase';
import { DOC_ACTION_NAMES } from '../../Types/Const/DOC_ACTION_NAMES';
import { InsertApply } from '../Apply/InsertApply';
import { DeleteApply } from '../Apply/DeleteApply';
import { IInsertActionData, IDeleteActionData } from '../../Types/Interfaces/IDocActionInterfaces';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { CommonParameter } from '../../Command/CommonParameter';

export class InsertAction extends DocActionBase<IInsertActionData, IDeleteActionData> {
    constructor(actionData: IInsertActionData, commandModel: CommandModel, observers: ActionObservers, commonParameter: CommonParameter) {
        super(actionData, commandModel, observers);
        this._doActionData = { ...actionData };
        this.do(commonParameter);
        const { segmentId, line, len, cursor } = actionData;
        this._oldActionData = {
            actionName: DOC_ACTION_NAMES.DELETE_ACTION_NAME,
            len,
            line,
            segmentId,
            cursor,
        };
    }

    redo(commonParameter: CommonParameter): void {
        this.do(commonParameter);
    }

    do(commonParameter: CommonParameter): void {
        const actionData = this.getDoActionData();
        const documentModel = this.getDocumentModel();
        actionData.cursor = commonParameter.cursor;
        const { body, len, segmentId } = actionData;

        InsertApply(documentModel, actionData);

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
        const documentModel = this.getDocumentModel();
        const { len, segmentId } = actionData;

        DeleteApply(documentModel, actionData);

        commonParameter.moveCursor(len);
        // DeleteTextApply(document, { ...actionData });

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
            commonParameter,
        });
    }

    validate(): boolean {
        return false;
    }
}
