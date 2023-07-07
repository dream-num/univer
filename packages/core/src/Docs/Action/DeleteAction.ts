import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, CommandManager, CommandUnit } from '../../Command';
import { IInsertTextActionData } from './InsertAction';

export interface IDeleteTextActionData extends IDocActionData {
    len: number;
    segmentId?: string;
}

export class DeleteTextAction extends DocActionBase<
    IDeleteTextActionData,
    IInsertTextActionData
> {
    static Name = 'DeleteTextAction';

    constructor(
        actionData: IDeleteTextActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do();
        const { len, segmentId } = actionData;
        // this._oldActionData = {
        //     actionName: DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME,
        //     text,
        //     textLength,
        //     cursorStart,
        //     isStartBack,
        //     segmentId,
        // };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        const { len, segmentId } = actionData;
        // DeleteTextApply(document, {
        //     cursorStart,
        //     cursorEnd,
        //     isStartBack,
        //     isEndBack,
        //     isCollapse,
        //     segmentId,
        // });
    }

    undo(): void {
        // TODO ...
        const actionData = this.getOldActionData();
        const document = this.getDocument();
        const { text, len, segmentId } = actionData;
        // InsertTextApply(document, text, textLength, {
        //     cursorStart,
        //     isStartBack,
        //     segmentId,
        // });
    }

    validate(): boolean {
        return false;
    }
}

CommandManager.register(DeleteTextAction.Name, DeleteTextAction);
