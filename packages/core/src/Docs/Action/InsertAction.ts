import { DocActionBase } from '../../Command/DocActionBase';
import { ActionObservers, ActionType, CommandManager, CommandUnit, CommonParameter } from '../../Command';
import { DOC_ACTION_NAMES } from '../../Types/Const/DOC_ACTION_NAMES';
import { InsertApply } from '../Apply/InsertApply';
import { DeleteApply } from '../Apply/DeleteApply';
import { IInsertActionData, IDeleteActionData } from './ActionDataInterface';

export class InsertAction extends DocActionBase<IInsertActionData, IDeleteActionData> {
    static NAME = 'InsertAction';

    constructor(actionData: IInsertActionData, commandUnit: CommandUnit, observers: ActionObservers, commonParameter: CommonParameter) {
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

        DeleteApply(document, len, commonParameter.cursor, segmentId);

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

CommandManager.register(InsertAction.NAME, InsertAction);
