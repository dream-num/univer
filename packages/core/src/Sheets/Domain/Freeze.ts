import { Context } from '../../Basics';
import { Command, CommandManager } from '../../Command';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { Worksheet } from './Worksheet';

export class Freeze {
    private _commandManager: CommandManager;

    private _context: Context;

    private _worksheet: Worksheet;

    constructor(workSheet: Worksheet) {
        this._context = workSheet.getContext();
        this._commandManager = this._context.getCommandManager();
        this._worksheet = workSheet;
    }

    setFrozenColumns(columns: number): Worksheet {
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

    setFrozenRows(rows: number): Worksheet {
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
