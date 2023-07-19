import { Column } from './Column';
import { Row } from './Row';
import { SpreadsheetCommand } from './SpreadsheetCommand';
import { Merge } from './Merge';
import { Range } from './Range';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { CommandManager } from '../../Command';
import { IInsertSheetActionData, ISetWorkSheetActivateActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const';
import { BooleanNumber } from '../../Types/Enum';

export class Spreadsheet {
    private range: Range;

    private row: Row;

    private spreadsheetModel: SpreadsheetModel;

    private merge: Merge;

    private column: Column;

    private commandManager: CommandManager;

    constructor() {
        this.range = new Range();
        this.merge = new Merge();
        this.row = new Row();
        this.column = new Column();
    }

    insertSheet(): string;
    insertSheet(index: number): string;
    insertSheet(...parameter: any[]): string {
        switch (parameter.length) {
            case 0: {
                const insertSheetAction: IInsertSheetActionData = {
                    actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                    index: -1,
                    sheetId: '',
                };
                const command = new SpreadsheetCommand(this.spreadsheetModel, insertSheetAction);
                this.commandManager.invoke(command);
                return insertSheetAction.sheetId;
            }
            case 1: {
                const index: number = parameter[0];

                const insertSheetAction: IInsertSheetActionData = {
                    actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                    index,
                    sheetId: '',
                };
                const command = new SpreadsheetCommand(this.spreadsheetModel, insertSheetAction);
                this.commandManager.invoke(command);
                return insertSheetAction.actionName;
            }
        }
        throw new Error('overload method error');
    }

    getSheetSize(): number {
        return Object.keys(this.spreadsheetModel.worksheets).length;
    }

    getActiveSheetIndex(): number {
        return 0;
    }

    getActiveSheet(): number {
        return 0;
    }

    setActiveSheet(sheetId: string): void {
        const insertSheetAction: ISetWorkSheetActivateActionData = {
            actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
            sheetId,
            status: BooleanNumber.TRUE,
        };
        const command = new SpreadsheetCommand(this.spreadsheetModel, insertSheetAction);
        this.commandManager.invoke(command);
    }

    removeSheetById(sheetId: string): void {}
}
