import { ActionObservers, ActionType, CommandManager, CommandUnit, CommonParameter } from '../../Command';
import { DocActionBase } from '../../Command/DocActionBase';
import { DOC_ACTION_NAMES } from '../../Types/Const/DOC_ACTION_NAMES';
import { IDocumentBody } from '../../Types/Interfaces';
import { DeleteApply } from '../Apply/DeleteApply';
import { InsertApply } from '../Apply/InsertApply';
import { IDeleteActionData, IInsertActionData } from './ActionDataInterface';

export class DeleteAction extends DocActionBase<IDeleteActionData, IInsertActionData> {
    static Name = 'DeleteAction';

    constructor(actionData: IDeleteActionData, commandUnit: CommandUnit, observers: ActionObservers, commonParameter: CommonParameter) {
        super(actionData, commandUnit, observers);
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
        const document = this.getDocument();
        const { len, segmentId } = actionData;

        const body = DeleteApply(document, len, commonParameter.cursor, segmentId);

        // commonParameter.moveCursor(len);

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
        const document = this.getDocument();
        const { body, len, segmentId } = actionData;

        InsertApply(document, body, len, commonParameter.cursor, segmentId);

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

CommandManager.register(DeleteAction.Name, DeleteAction);
