import { SetTabColor } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { CONVERTOR_OPERATION } from '../../Const/CONST';
import { WorkSheetConvertor } from '../../Convertor/WorkSheetConvertor';
import { WorkBook } from '../Domain';
import { Nullable } from '../../Shared/Types';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetTabColorActionData extends IActionData {
    color: Nullable<string>;
}

/**
 * @internal
 */
export class SetTabColorAction extends ActionBase<
    ISetTabColorActionData,
    ISetTabColorActionData,
    Nullable<string>
> {
    constructor(
        actionData: ISetTabColorActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this._oldActionData = {
            ...actionData,
            color: this.do(),
        };

        this.validate();
    }

    do(): Nullable<string> {
        const worksheet = this.getWorkSheet();

        const result = SetTabColor(worksheet, this._doActionData.color);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;
        this._oldActionData = {
            sheetId,
            actionName: ACTION_NAMES.SET_TAB_COLOR_ACTION,
            color: this.do(),
        };
    }

    undo(): void {
        const { color, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_TAB_COLOR_ACTION,
            sheetId,
            color: SetTabColor(worksheet, color),
        };

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
