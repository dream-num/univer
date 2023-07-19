import { InsertSheetApply, RemoveSheetApply } from '../Apply';
import { IWorksheetConfig } from '../../Types/Interfaces';
import { CommandModel } from '../../Command';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IInsertSheetActionData } from './InsertSheetAction';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

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
        const result = RemoveSheetApply(this._commandModel, this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    undo(): void {
        const workbook = this.getWorkBook();
        InsertSheetApply(this._commandModel, this._oldActionData);
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
