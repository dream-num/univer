import { DocActionBase } from '../../Command/DocActionBase';

import { DOC_ACTION_NAMES } from '../../Types/Const/DOC_ACTION_NAMES';
import { IDocumentBody } from '../../Types/Interfaces';
import { DeleteApply } from '../Apply/DeleteApply';
import { InsertApply } from '../Apply/InsertApply';
import { IDeleteActionData, IInsertActionData } from '../../Types/Interfaces/IDocActionInterfaces';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { CommonParameter } from '../../Command/CommonParameter';

export class DeleteAction extends DocActionBase<IDeleteActionData, IInsertActionData> {
    constructor(actionData: IDeleteActionData, commandModel: CommandModel, observers: ActionObservers, commonParameter: CommonParameter) {
        super(actionData, commandModel, observers);
        this._doActionData = { ...actionData };
        const { len, line, segmentId } = actionData;

        this._oldActionData = {
            ...actionData,
            actionName: DOC_ACTION_NAMES.INSERT_ACTION_NAME,
            body: this.do(commonParameter),
        };

        // this._oldActionData = {
        //     actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
        //     text,
        //     textLength,
        //     cursorStart,
        //     isStartBack,
        //     segmentId,
        // };
    }

    redo(commonParameter: CommonParameter): void {
        this.do(commonParameter);
    }

    do(commonParameter: CommonParameter): IDocumentBody {
        const actionData = this.getDoActionData();
        const documentModel = this.getDocumentModel();
        actionData.cursor = commonParameter.cursor;
        const { len, segmentId } = actionData;

        const body = DeleteApply(documentModel, actionData);

        commonParameter.moveCursor(len);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
            commonParameter,
        });

        return body;
    }

    undo(commonParameter: CommonParameter): void {
        const actionData = this.getOldActionData();
        const documentModel = this.getDocumentModel();
        const { body, len, segmentId } = actionData;

        InsertApply(documentModel, actionData);

        commonParameter.moveCursor(len);

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
