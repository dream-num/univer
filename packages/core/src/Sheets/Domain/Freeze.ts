// eslint-disable-next-line import/no-unresolved
import { ICurrentUniverService } from 'src/Service/Current.service';
import { Inject } from '@wendellhu/redi';
import { Command, CommandManager } from '../../Command';
import { Worksheet } from './Worksheet';
import { ACTION_NAMES } from '../../Types/Const';

export class Freeze {
    private _worksheet: Worksheet;

    constructor(
        workSheet: Worksheet,
        @Inject(CommandManager) private readonly _commandManager: CommandManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        this._worksheet = workSheet;
    }

    setFrozenColumns(columns: number): Worksheet {
        const { _commandManager } = this;
        const configure = {
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            sheetId: this._worksheet.getSheetId(),
            numColumns: columns,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            configure
        );
        _commandManager.invoke(command);

        return this._worksheet;
    }

    setFrozenRows(rows: number): Worksheet {
        const { _commandManager } = this;
        const configure = {
            actionName: ACTION_NAMES.SET_FROZEN_ROWS_ACTION,
            sheetId: this._worksheet.getSheetId(),
            numRows: rows,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            configure
        );
        _commandManager.invoke(command);

        return this._worksheet;
    }
}
