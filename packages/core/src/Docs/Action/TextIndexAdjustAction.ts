import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, ActionType, CommandUnit } from '../../Command';
import { ITextSelectionRangeParam } from '../../Interfaces';
import { textIndexAdjustApply } from '../Apply/TextIndexAdjustApply';

export interface ITextIndexAdjustAction
    extends IDocActionData,
        ITextSelectionRangeParam {}

export class TextIndexAdjustAction extends DocActionBase<
    ITextIndexAdjustAction,
    ITextIndexAdjustAction
> {
    constructor(
        actionData: ITextIndexAdjustAction,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do();
        this._oldActionData = { ...actionData };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        textIndexAdjustApply(document, actionData);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    undo(): void {
        const actionData = this.getOldActionDaa();
        const document = this.getDocument();

        textIndexAdjustApply(document, actionData);

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}
