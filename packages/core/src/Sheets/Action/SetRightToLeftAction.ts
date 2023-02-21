import { SetRightToLeft } from '../Apply';
import { BooleanNumber } from '../../Enum';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandManager, CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetRightToLeftActionData extends ISheetActionData {
    rightToLeft: BooleanNumber;
}

/**
 * @internal
 */
export class SetRightToLeftAction extends SheetActionBase<ISetRightToLeftActionData> {
    static NAME = 'SetRightToLeftAction';

    constructor(
        actionData: ISetRightToLeftActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };

        this._oldActionData = {
            ...actionData,
            rightToLeft: this.do(),
        };
        this.validate();
    }

    do(): BooleanNumber {
        const worksheet = this.getWorkSheet();

        const result = SetRightToLeft(worksheet, this._doActionData.rightToLeft);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const { rightToLeft, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        SetRightToLeft(worksheet, this._oldActionData.rightToLeft);
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

CommandManager.register(SetRightToLeftAction.NAME, SetRightToLeftAction);
