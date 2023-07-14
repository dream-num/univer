import { DocActionBase } from '../../Command/DocActionBase';
import {
    ActionObservers,
    CommandManager,
    CommandUnit,
    CommonParameter,
} from '../../Command';
import { CommonParameterAttribute } from '../../Interfaces/IDocumentData';
import { IRetainActionData } from './ActionDataInterface';

export class RetainAction extends DocActionBase<
    IRetainActionData,
    IRetainActionData
> {
    static NAME = 'RetainAction';

    constructor(
        actionData: IRetainActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers,
        commonParameter: CommonParameter
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this._oldActionData = { ...actionData, attribute: this.do(commonParameter) };
    }

    redo(commonParameter: CommonParameter): void {
        this.do(commonParameter);
    }

    do(commonParameter: CommonParameter): CommonParameterAttribute {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const { len, segmentId, attribute } = actionData;
        commonParameter.moveCursor(len);
        // InsertTextApply(document, actionData.text);
        return {
            ed: 0,
            st: 0,
        };
    }

    undo(commonParameter: CommonParameter): void {
        const actionData = this.getOldActionData();
        const document = this.getDocument();
        const { len, segmentId, attribute } = actionData;
        commonParameter.moveCursor(len);
    }

    validate(): boolean {
        return false;
    }
}

CommandManager.register(RetainAction.NAME, RetainAction);
