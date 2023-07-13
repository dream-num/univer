import { Command, ISetColumnHideActionData, ISetColumnShowActionData, SetColumnHideAction, SetColumnShowAction, SheetContext } from '@univerjs/core';
import { ISheetContext } from '../../../Services/tokens';
import { BaseColumnRulerFactory } from './ColumnRulerFactory';
import { ColumnRulerRegister } from './ColumnRulerRegister';

/**
 *  ColumnRulerManager
   
    Features that affect column state: grouping, hiding columns, etc.

    Idea: 
    Set: plugin update => RulerManager setHidden => RulerList result => worksheet column data update

    Get: Whether to support copy, get worksheet column data to determine whether a column is hidden
 * 
 */
export class ColumnRulerManager {
    private _register: ColumnRulerRegister;

    private _columnRulerFactoryList: BaseColumnRulerFactory[];

    constructor(@ISheetContext private readonly _sheetContext: SheetContext) {
        this._register = new ColumnRulerRegister();
    }

    getRegister(): ColumnRulerRegister {
        return this._register;
    }

    /**
     * set hidden state by all rulers
     * @returns
     */
    setHidden(sheetId: string, columnIndex: number, numColumns: number) {
        const columnRulerFactoryList = this._register.columnRulerFactoryList;
        if (!columnRulerFactoryList) return false;
        this._columnRulerFactoryList = columnRulerFactoryList;
        this._checkExtension(sheetId, columnIndex, numColumns);
    }

    /**
     * Traverse all rulers
     * @returns
     */
    private _checkExtension(sheetId: string, columnIndex: number, numColumns: number) {
        if (!this._columnRulerFactoryList) return false;

        const hiddenDataList = [];
        for (let i = 0; i < this._columnRulerFactoryList.length; i++) {
            const extensionFactory = this._columnRulerFactoryList[i];
            const extension = extensionFactory.check(sheetId, columnIndex, numColumns);
            const hiddenArray = extension.getUpdatedHidden();
            hiddenDataList.push(hiddenArray);
        }

        const actionDataList = [];
        for (let i = columnIndex; i < columnIndex + numColumns; i++) {
            for (let j = 0; j < hiddenDataList.length; j++) {
                const hiddenArray = hiddenDataList[j];

                const column = hiddenArray.get(i);

                if (column && column.hd) {
                    const actionData: ISetColumnHideActionData = {
                        actionName: SetColumnHideAction.NAME,
                        sheetId,
                        columnCount: 1,
                        columnIndex: i,
                    };
                    actionDataList.push(actionData);
                } else {
                    const actionData: ISetColumnShowActionData = {
                        actionName: SetColumnShowAction.NAME,
                        sheetId,
                        columnCount: 1,
                        columnIndex: i,
                    };
                    actionDataList.push(actionData);
                }
            }
        }

        if (actionDataList.length > 0) {
            const _commandManager = this._sheetContext.getCommandManager();
            const _workBook = this._sheetContext.getWorkBook();
            const command = new Command(
                {
                    WorkBookUnit: _workBook,
                },
                ...actionDataList
            );
            _commandManager.invoke(command);
        }
    }
}
