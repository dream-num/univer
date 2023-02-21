import { InsertSheetApply, RemoveSheetApply } from '../Apply';
import { IWorksheetConfig } from '../../Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { CommandManager, CommandUnit } from '../../Command';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveSheetActionData } from './RemoveSheetAction';

export interface IInsertSheetActionData extends ISheetActionData {
    index: number;
    sheet: IWorksheetConfig;
}

export class InsertSheetAction extends SheetActionBase<
    IInsertSheetActionData,
    IRemoveSheetActionData
> {
    static NAME = 'InsertSheetAction';

    constructor(
        actionData: IInsertSheetActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            sheetId: this.do(),
        };
    }

    do(): string {
        const result = InsertSheetApply(this._commandUnit, this._doActionData);
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
        RemoveSheetApply(this._commandUnit, this._oldActionData);
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

CommandManager.register(InsertSheetAction.NAME, InsertSheetAction);
