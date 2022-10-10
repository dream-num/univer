import { Context } from '../../Basics';
import { Command, CommandManager } from '../../Command';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { Worksheet1 } from './Worksheet1';

export class Freeze {
    private _commandManager: CommandManager;

    private _context: Context;

    private _worksheet: Worksheet1;

    constructor(workSheet: Worksheet1) {
        this._context = workSheet.getContext();
        this._commandManager = this._context.getCommandManager();
        this._worksheet = workSheet;
    }

    setFrozenColumns(columns: number): Worksheet1 {
        const { _context, _commandManager } = this;
        const configure = {
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            sheetId: this._worksheet.getSheetId(),
            numColumns: columns,
        };
        const command = new Command(_context.getWorkBook(), configure);
        _commandManager.invoke(command);

        return this._worksheet;
    }

    setFrozenRows(rows: number): Worksheet1 {
        const { _context, _commandManager } = this;
        const configure = {
            actionName: ACTION_NAMES.SET_FROZEN_ROWS_ACTION,
            sheetId: this._worksheet.getSheetId(),
            numRows: rows,
        };
        const command = new Command(_context.getWorkBook(), configure);
        _commandManager.invoke(command);

        return this._worksheet;
    }
}
