import { Range, Worksheet, Workbook, SheetContext, Command, CommandManager, Inject } from '@univerjs/core';
import { IAscSortData } from '../Action';
import { ACTION_NAMES, SortOrderType, SortOrder } from '../Enum';

interface SortCriteria {
    key: string;
    basis: string;
    order: SortOrderType;
}

export class Sort {
    @Inject('CommandManager')
    private _commandManager: CommandManager;

    @Inject('WorkBook')
    private _workbook: Workbook;

    @Inject('Context')
    private _context: SheetContext;

    private _workSheet: Worksheet;

    private _range: Range;

    private _orderType: SortOrderType;

    // // 只影响选区
    // isOnlyRange: boolean;
    //
    // // 石头包含标题行
    // hasHeader: boolean;
    //
    // // 初始数据
    // soreBefore: any;
    //
    // // 排序后数据
    // soreAfter: any;
    //
    // sortCriteria: SortCriteria[];

    constructor(range: Range, order: SortOrderType = SortOrder.ASCENDING) {
        this._range = range;
        // this.isOnlyRange = false;
        this._orderType = order;
    }

    /**
     * TODO
     * @returns
     */
    getBackgroundColor() {
        const { _range } = this;
    }

    /**
     * TODO
     */
    getDataSourceColumn() {}

    /**
     * TODO
     */
    getDimensionIndex() {}

    /**
     * TODO
     */
    getForegroundColor() {}

    /**
     * TODO
     */
    getSortOrder() {
        return this._orderType;
    }

    /**
     * TODO
     */
    isAscending() {}

    /**
     * TODO
     */
    ASCSord() {
        const { _range, _context, _commandManager, _workSheet } = this;
        console.log(_workSheet);

        const actionData: IAscSortData = {
            actionName: ACTION_NAMES.ASC_SORT_ACTION,
            rangeData: _range.getRangeData(),
            sheetId: _workSheet.getSheetId(),
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            actionData
        );
        _commandManager.invoke(command);
    }
}
