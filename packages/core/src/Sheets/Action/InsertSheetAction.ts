import { InsertSheetApply, RemoveSheetApply } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { IInsertSheetActionData, IRemoveSheetActionData } from '../../Types/Interfaces/IActionModel';

export class InsertSheetAction extends SheetActionBase<IInsertSheetActionData, IRemoveSheetActionData> {
=======
=======
>>>>>>> 978105c8 (fix(core): action names, action interfaces)
import { CommandModel } from '../../Command';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveSheetActionData } from './RemoveSheetAction';
=======
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { IInsertSheetActionData, IRemoveSheetActionData } from '../../Types/Interfaces/IActionModel';
>>>>>>> f4a761ff (chore(core): action)

export class InsertSheetAction extends SheetActionBase<IInsertSheetActionData, IRemoveSheetActionData> {
    constructor(actionData: IInsertSheetActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            sheetId: this.do(),
        };
    }

    do(): string {
        const result = InsertSheetApply(this.getSpreadsheetModel(), this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    redo(): void {
        this.redo();
    }

    undo(): void {
        RemoveSheetApply(this.getSpreadsheetModel(), this._oldActionData);
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        throw new Error('Method not implemented.');
    }
}
