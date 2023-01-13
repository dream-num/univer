import { InsertSheet, RemoveSheet } from '../Apply';
import { IWorksheetConfig } from '../../Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveSheetActionData } from './RemoveSheetAction';
import { CommandUnit } from '../../Command';

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
        const workbook = this.getWorkBook();
        const result = InsertSheet(
            workbook,
            this._doActionData.index,
            this._doActionData.sheet
        );
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
        const workbook = this.getWorkBook();
        RemoveSheet(workbook, this._oldActionData.sheetId);
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
