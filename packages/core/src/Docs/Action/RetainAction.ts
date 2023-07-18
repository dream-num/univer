import { DocActionBase } from '../../Command/DocActionBase';
import { ActionObservers, CommandManager, CommandUnit, CommonParameter } from '../../Command';
import { UpdateAttributeValueType } from '../../Interfaces/IDocumentData';
import { IRetainActionData } from './ActionDataInterface';
import { UpdateDocsAttributeType } from '../../Shared/CommandEnum';
import { UpdateAttributeApply } from '../Apply/UpdateAttributeApply';

export class RetainAction extends DocActionBase<IRetainActionData, IRetainActionData> {
    static NAME = 'RetainAction';

    constructor(actionData: IRetainActionData, commandUnit: CommandUnit, observers: ActionObservers, commonParameter: CommonParameter) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        const undoData = { ...actionData, coverType: UpdateDocsAttributeType.REPLACE };

        const attributes = this.do(commonParameter);
        if (attributes.length > 0) {
            undoData.attributes = attributes;
        }
        this._oldActionData = undoData;
    }

    redo(commonParameter: CommonParameter): void {
        this.do(commonParameter);
    }

    do(commonParameter: CommonParameter): UpdateAttributeValueType[] {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const { len, segmentId, attributes, coverType, attributeType } = actionData;

        let results: UpdateAttributeValueType[] = [];
        if (attributes && attributeType) {
            results = UpdateAttributeApply(document, len, commonParameter.cursor, attributes, attributeType, coverType, segmentId);
        }

        commonParameter.moveCursor(len);

        return results;
    }

    undo(commonParameter: CommonParameter): void {
        const actionData = this.getOldActionData();
        const document = this.getDocument();
        const { len, segmentId, attributes, coverType, attributeType } = actionData;

        if (attributes && attributeType) UpdateAttributeApply(document, len, commonParameter.cursor, attributes, attributeType, coverType, segmentId);

        commonParameter.moveCursor(len);
    }

    validate(): boolean {
        return false;
    }
}

CommandManager.register(RetainAction.NAME, RetainAction);
