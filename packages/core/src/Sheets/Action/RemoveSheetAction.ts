import { InsertSheet, RemoveSheet } from '../Apply';
import { IWorksheetConfig } from '../../Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertSheetActionData } from './InsertSheetAction';
import { CommandUnit } from '../../Command';

export interface IRemoveSheetActionData extends ISheetActionData {
    sheetId: string;
}

export class RemoveSheetAction extends SheetActionBase<
    IRemoveSheetActionData,
    IInsertSheetActionData
> {
    constructor(
        actionData: IRemoveSheetActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            ...this.do(),
            convertor: [],
        };
    }

    do(): { index: number; sheet: IWorksheetConfig } {
        return this.redo();
    }

    redo(): { index: number; sheet: IWorksheetConfig } {
        const workbook = this.getWorkBook();
        const result = RemoveSheet(workbook, this._doActionData.sheetId);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    undo(): void {
        const workbook = this.getWorkBook();
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
        InsertSheet(workbook, this._oldActionData.index, this._oldActionData.sheet);
    }

    validate(): boolean {
        throw new Error('Method not implemented.');
    }
}
