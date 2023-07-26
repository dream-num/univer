import { DocActionBase } from '../../Command/DocActionBase';
import { IRetainActionData } from '../../Types/Interfaces/IDocActionInterfaces';
import { UpdateDocsAttributeType } from '../../Shared/CommandEnum';
import { UpdateAttributeApply } from '../Apply/UpdateAttributeApply';
import { IDocumentBody } from '../../Types/Interfaces';
import { Nullable } from '../../Shared';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers } from '../../Command/ActionBase';
import { CommonParameter } from '../../Command/CommonParameter';

export class RetainAction extends DocActionBase<IRetainActionData, IRetainActionData> {
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
        const documentModel = this.getDocumentModel();
        actionData.cursor = commonParameter.cursor;
        const { len, segmentId, body, coverType } = actionData;

        let result: Nullable<IDocumentBody> = UpdateAttributeApply(documentModel, actionData);

        commonParameter.moveCursor(len);

        return result;
    }

    undo(commonParameter: CommonParameter): void {
        const actionData = this.getOldActionData();
        const documentModel = this.getDocumentModel();
        const { len, segmentId, body, coverType } = actionData;

        if (body) UpdateAttributeApply(documentModel, actionData);

        commonParameter.moveCursor(len);
    }

    validate(): boolean {
        return false;
    }
}
