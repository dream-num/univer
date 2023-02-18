import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, CommandUnit } from '../../Command';
import { DeleteTextApply } from '../Apply/DeleteTextApply';
import { IInsertTextActionData } from './InsertTextAction';
import { InsertTextApply } from '../Apply/InsertTextApply';
import { ITextSelectionRangeParam } from '../../Interfaces/ISelectionData';
import { DOC_ACTION_NAMES } from '../../Const/DOC_ACTION_NAMES';

export interface IDeleteTextActionData
    extends IDocActionData,
        ITextSelectionRangeParam {
    text: string;
}

export class DeleteTextAction extends DocActionBase<
    IDeleteTextActionData,
    IInsertTextActionData
> {
    constructor(
        actionData: IDeleteTextActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do();
        const { text, cursorStart, isStartBack, segmentId } = actionData;
        this._oldActionData = {
            actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
            text,
            cursorStart,
            isStartBack,
            segmentId,
        };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const {
            cursorStart,
            cursorEnd,
            isStartBack,
            isEndBack,
            isCollapse,
            segmentId,
        } = actionData;
        DeleteTextApply(document, {
            cursorStart,
            cursorEnd,
            isStartBack,
            isEndBack,
            isCollapse,
            segmentId,
        });
    }

    undo(): void {
        // TODO ...
        const actionData = this.getOldActionDaa();
        const document = this.getDocument();
        // const { text, start, length } = actionData;
        InsertTextApply(document, { ...actionData });
    }

    validate(): boolean {
        return false;
    }
}
