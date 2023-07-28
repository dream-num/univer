import { Column } from './Column';
import { Row } from './Row';
import { SpreadsheetCommand } from './SpreadsheetCommand';
import { Merge } from './Merge';
import { CommandManager } from '../../Command';
import { Range } from './Range';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import {
    IInsertRowActionData,
    IInsertRowDataActionData,
    IInsertSheetActionData,
    IRemoveColumnAction,
    IRemoveColumnDataAction,
    IRemoveRowActionData,
    IRemoveRowDataActionData,
    IRemoveSheetActionData,
    ISetColumnHideActionData,
    ISetColumnShowActionData,
    ISetRowHideActionData,
    ISetRowShowActionData,
    ISetWorkSheetActivateActionData,
} from '../../Types/Interfaces/ISheetActionInterfaces';
import { SHEET_ACTION_NAMES } from '../../Types/Const';
import { BooleanNumber } from '../../Types/Enum';
import { Nullable, ObjectMatrix } from '../../Shared';
import { Style } from './Style';
import { ISpreadsheetConfig } from '../../Types/Interfaces/ISpreadsheetData';
import { ICellData } from '../../Types/Interfaces';

export class Spreadsheet {
    private range: Range;

    private model: SpreadsheetModel;

    private merge: Merge;

    private spreadsheetModel: SpreadsheetModel;

    private column: Column;

    private row: Row;

    private style: Style;

    constructor(private snapshot: Partial<ISpreadsheetConfig>, private commandManager: CommandManager) {
        this.model = new SpreadsheetModel(snapshot);
        this.range = new Range(this.commandManager, this.model);
        this.merge = new Merge();
        this.row = new Row(this.commandManager, this.model);
        this.column = new Column(this.commandManager, this.model);
        this.style = new Style(this.model);
    }

    getModel() {
        return this.model;
    }

    insertSheet(): string;
    insertSheet(index: number): string;
    insertSheet(...parameter: any[]): string {
        switch (parameter.length) {
            case 0: {
                const insertSheetAction: IInsertSheetActionData = {
                    actionName: SHEET_ACTION_NAMES.INSERT_SHEET_ACTION,
                    index: -1,
                    sheetId: '',
                };
                const command = new SpreadsheetCommand(this.model, insertSheetAction);
                this.commandManager.invoke(command);
                return insertSheetAction.sheetId;
            }
            case 1: {
                const index: number = parameter[0];

                const insertSheetAction: IInsertSheetActionData = {
                    actionName: SHEET_ACTION_NAMES.INSERT_SHEET_ACTION,
                    index,
                    sheetId: '',
                };
                const command = new SpreadsheetCommand(this.model, insertSheetAction);
                this.commandManager.invoke(command);
                return insertSheetAction.actionName;
            }
        }
        throw new Error('overload method error');
    }

    getActiveSheetIndex(): number {
        return Object.keys(this.model.worksheets).findIndex((sheetId) => this.model.worksheets[sheetId].activation);
    }

    getSheetSize(): number {
        return Object.keys(this.model.worksheets).length;
    }

    getActiveSheet(): Nullable<string> {
        return Object.keys(this.model.worksheets).find((sheetId) => this.model.worksheets[sheetId].activation);
    }

    setActiveSheet(sheetId: string): void {
        const insertSheetAction: ISetWorkSheetActivateActionData = {
            actionName: SHEET_ACTION_NAMES.INSERT_SHEET_ACTION,
            sheetId,
            status: BooleanNumber.TRUE,
        };
        const command = new SpreadsheetCommand(this.model, insertSheetAction);
        this.commandManager.invoke(command);
    }

    removeSheetById(sheetId: string): void {
        const removeSheetAction: IRemoveSheetActionData = {
            actionName: SHEET_ACTION_NAMES.REMOVE_SHEET_ACTION,
            sheetId,
        };
        const command = new SpreadsheetCommand(this.model, removeSheetAction);
        this.commandManager.invoke(command);
    }

    /**
     * Hides one or more consecutive columns starting at the given index.
     * @param columnIndex column index
     * @param columnCount column count
     * @returns WorkSheet Instance
     */
    hideColumns(columnIndex: number, columnCount: number, sheetId: string): string {
        const hideColumnAction: ISetColumnHideActionData = {
            actionName: SHEET_ACTION_NAMES.SET_COLUMN_HIDE_ACTION,
            columnCount,
            columnIndex,
            sheetId,
        };
        const command = new SpreadsheetCommand(this.model, hideColumnAction);
        this.commandManager.invoke(command);
        return sheetId;
    }

    /**
     * Unhides one or more consecutive columns starting at the given index.
     * @param columnIndex column index
     * @param columnCount column count
     * @returns WorkSheet Instance
     */
    showColumns(columnIndex: number, columnCount: number, sheetId: string): string {
        const showColumnAction: ISetColumnShowActionData = {
            actionName: SHEET_ACTION_NAMES.SET_COLUMN_SHOW_ACTION,
            sheetId,
            columnCount,
            columnIndex,
        };
        const command = new SpreadsheetCommand(this.model, showColumnAction);
        this.commandManager.invoke(command);
        return sheetId;
    }

    /**
     * Hides one or more consecutive rows starting at the given index.
     * @param rowIndex row index
     * @param rowCount row count
     * @returns WorkSheet Instance
     */
    hideRows(rowIndex: number, rowCount: number, sheetId: string): string {
        const hideRowAction: ISetRowHideActionData = {
            actionName: SHEET_ACTION_NAMES.SET_ROW_HIDE_ACTION,
            sheetId,
            rowCount,
            rowIndex,
        };
        const command = new SpreadsheetCommand(this.model, hideRowAction);
        this.commandManager.invoke(command);
        return sheetId;
    }

    /**
     * Unhides one or more consecutive rows starting at the given index.
     * @param rowIndex row index
     * @param rowCount row count
     * @returns WorkSheet Instance
     */
    showRows(rowIndex: number, rowCount: number, sheetId: string): string {
        const showRowAction: ISetRowShowActionData = {
            actionName: SHEET_ACTION_NAMES.SET_ROW_SHOW_ACTION,
            sheetId,
            rowCount,
            rowIndex,
        };
        const command = new SpreadsheetCommand(this.model, showRowAction);
        this.commandManager.invoke(command);
        return sheetId;
    }

    /**
     * Deletes a number of rows starting at the given row position.
     * @param rowPosition row index
     * @param howMany row count
     * @returns WorkSheet Instance
     */
    deleteRows(rowPosition: number, howMany: number, sheetId: string): string {
        const dataRowDeleteAction: IRemoveRowDataActionData = {
            actionName: SHEET_ACTION_NAMES.REMOVE_ROW_DATA_ACTION,
            sheetId,
            rowCount: howMany,
            rowIndex: rowPosition,
        };
        const rowDeleteAction: IRemoveRowActionData = {
            actionName: SHEET_ACTION_NAMES.REMOVE_ROW_ACTION,
            sheetId,
            rowCount: howMany,
            rowIndex: rowPosition,
        };
        const command = new SpreadsheetCommand(this.model, dataRowDeleteAction, rowDeleteAction);
        this.commandManager.invoke(command);

        return sheetId;
    }

    /**
     * Deletes a number of columns starting at the given column position.
     * @param columnPosition column index
     * @param howMany column count
     * @returns WorkSheet Instance
     */
    deleteColumns(columnPosition: number, howMany: number, sheetId: string): string {
        const deleteColumnDataAction: IRemoveColumnDataAction = {
            actionName: SHEET_ACTION_NAMES.REMOVE_COLUMN_DATA_ACTION,
            sheetId,
            columnCount: howMany,
            columnIndex: columnPosition,
        };
        const deleteColumnAction: IRemoveColumnAction = {
            actionName: SHEET_ACTION_NAMES.REMOVE_COLUMN_ACTION,
            sheetId,
            columnCount: howMany,
            columnIndex: columnPosition,
        };
        const command = new SpreadsheetCommand(this.model, deleteColumnDataAction, deleteColumnAction);
        this.commandManager.invoke(command);

        return sheetId;
    }

    /**
     * Inserts a blank row in a sheet at the specified location.
     * @param rowPosition row index
     * @param numberRows row count
     * @returns WorkSheet Instance
     */
    insertRows(rowPosition: number, howMany: number, sheetId: string): string {
        const insertRowDataAction: IInsertRowDataActionData = {
            actionName: SHEET_ACTION_NAMES.INSERT_ROW_DATA_ACTION,
            sheetId,
            rowIndex: rowPosition,
            rowData: ObjectMatrix.MakeObjectMatrixSize<ICellData>(howMany).toJSON(),
        };
        const insertRowAction: IInsertRowActionData = {
            actionName: SHEET_ACTION_NAMES.INSERT_ROW_ACTION,
            sheetId,
            rowIndex: rowPosition,
            rowCount: howMany,
        };
        const command = new SpreadsheetCommand(this.model, insertRowDataAction, insertRowAction);
        this.commandManager.invoke(command);

        return sheetId;
    }

    /**
     * Inserts a blank column in a sheet at the specified location.
     * @param columnPosition column index
     * @param howMany column count
     * @returns WorkSheet Instance
     */
    insertColumns(columnPosition: number, howMany: number, sheetId: string): string {
        const columnData = new ObjectMatrix<ICellData>();
        const sheet = this.model.worksheets[sheetId];
        const { cell } = sheet;
        cell.forEach((index) => {
            for (let i = columnPosition; i < columnPosition + howMany; i++) {
                columnData.setValue(index, i - columnPosition, {});
            }
        });
        const insertColumnDataAction = {
            actionName: SHEET_ACTION_NAMES.INSERT_COLUMN_DATA_ACTION,
            sheetId,
            columnIndex: columnPosition,
            columnData: columnData.toJSON(),
        };
        const insertColumnAction = {
            actionName: SHEET_ACTION_NAMES.INSERT_COLUMN_ACTION,
            sheetId,
            columnIndex: columnPosition,
            columnCount: howMany,
        };
        const command = new SpreadsheetCommand(this.model, insertColumnDataAction, insertColumnAction);
        this.commandManager.invoke(command);

        return sheetId;
    }
}
