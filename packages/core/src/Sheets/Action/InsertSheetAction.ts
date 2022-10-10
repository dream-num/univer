import { InsertSheet, RemoveSheet } from '../Apply';
import { IWorksheetConfig } from '../../Interfaces';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { Workbook } from '../Domain';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveSheetActionData } from './RemoveSheetAction';

export interface IInsertSheetActionData extends IActionData {
    index: number;
    sheet: IWorksheetConfig;
}

export class InsertSheetAction extends ActionBase<
    IInsertSheetActionData,
    IRemoveSheetActionData
> {
    constructor(
        actionData: IInsertSheetActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            sheetId: this.do(),
            convertor: [],
        };
    }

    redo(): string {
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

    undo(): void {
        const workbook = this.getWorkBook();
        RemoveSheet(workbook, this._oldActionData.sheetId);
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    do(): string {
        return this.redo();
    }

    validate(): boolean {
        throw new Error('Method not implemented.');
    }
}
