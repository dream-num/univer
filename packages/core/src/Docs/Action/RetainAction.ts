import { DocActionBase } from '../../Command/DocActionBase';
import { ActionObservers, CommandManager, CommandModel, CommonParameter } from '../../Command';
import { IRetainActionData } from './ActionDataInterface';
import { UpdateDocsAttributeType } from '../../Shared/CommandEnum';
import { UpdateAttributeApply } from '../Apply/UpdateAttributeApply';
import { IDocumentBody } from '../../Types/Interfaces';
import { Nullable } from '../../Shared';

export class RetainAction extends DocActionBase<IRetainActionData, IRetainActionData> {
    static NAME = 'RetainAction';

    constructor(actionData: IRetainActionData, commandModel: CommandModel, observers: ActionObservers, commonParameter: CommonParameter) {
        super(actionData, commandModel, observers);
        this._doActionData = { ...actionData };
        this._oldActionData = {
            ...actionData,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: this.do(commonParameter),
        };
    }

    redo(commonParameter: CommonParameter): void {
        this.do(commonParameter);
    }

    do(commonParameter: CommonParameter): Nullable<IDocumentBody> {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const { len, segmentId, body, coverType } = actionData;

        let result: Nullable<IDocumentBody> = UpdateAttributeApply(document, body, len, commonParameter.cursor, coverType, segmentId);

        commonParameter.moveCursor(len);

        return result;
    }

    undo(commonParameter: CommonParameter): void {
        const actionData = this.getOldActionData();
        const document = this.getDocument();
        const { len, segmentId, body, coverType } = actionData;

        if (body) UpdateAttributeApply(document, body, len, commonParameter.cursor, coverType, segmentId);

        commonParameter.moveCursor(len);
    }

    validate(): boolean {
        return false;
    }
}

CommandManager.register(RetainAction.NAME, RetainAction);
