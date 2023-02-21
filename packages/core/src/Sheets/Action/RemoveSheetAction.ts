import { InsertSheetApply, RemoveSheetApply } from '../Apply';
import { IWorksheetConfig } from '../../Interfaces';
import { CommandManager, CommandUnit } from '../../Command';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { IInsertSheetActionData } from './InsertSheetAction';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

export interface IRemoveSheetActionData extends ISheetActionData {
    sheetId: string;
}

export class RemoveSheetAction extends SheetActionBase<
    IRemoveSheetActionData,
    IInsertSheetActionData
> {
    static NAME = 'RemoveSheetAction';

    constructor(
        actionData: IRemoveSheetActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
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
        const result = RemoveSheetApply(this._commandUnit, this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    undo(): void {
        const workbook = this.getWorkBook();
        InsertSheetApply(this._commandUnit, this._oldActionData);
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

CommandManager.register(RemoveSheetAction.NAME, RemoveSheetAction);
