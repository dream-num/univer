import { InsertSheetApply } from '../Apply/InsertSheet';
import { RemoveSheetApply } from '../Apply/RemoveSheet';
import { IWorksheetConfig } from '../../Types/Interfaces';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IRemoveSheetActionData, IInsertSheetActionData } from '../../Types/Interfaces/IActionModel';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';

export class RemoveSheetAction extends SheetActionBase<IRemoveSheetActionData, IInsertSheetActionData> {
    constructor(actionData: IRemoveSheetActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            ...this.do(),
        };
    }

    do(): { index: number; sheet: IWorksheetConfig } {
        return this.redo();
    }

    redo(): { index: number; sheet: IWorksheetConfig } {
        const result = RemoveSheetApply(this.getSpreadsheetModel(), this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    undo(): void {
        InsertSheetApply(this.getSpreadsheetModel(), this._oldActionData);
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
