import { SelectionControl, ISetSelectionValueActionData, SelectionModel, SetSelectionValueAction, SheetPlugin } from '@univerjs/base-sheets';
import {
    SheetContext,
    PLUGIN_NAMES,
    Nullable,
    IRemoveMergeActionData,
    RemoveMergeAction,
    IAddMergeActionData,
    AddMergeAction,
    IRangeData,
    IActionData,
    ObjectMatrix,
    ICellData,
    ISetRangeDataActionData,
    SHEET_ACTION_NAMES,
    ISetColumnWidthActionData,
    ISetRowHeightActionData,
    SetRowHeightAction,
    DEFAULT_SELECTION,
    DEFAULT_CELL,
} from '@univerjs/core';
import { handleTableMergeData, Prompt } from '@univerjs/base-ui';
import { RightMenuProps, SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';

export interface PasteType {
    type: string;
    result: string | ArrayBuffer | null;
}

export interface PasteInfo {
    data: Nullable<Array<[]>>;
    colInfo: Nullable<number[]>;
    rowInfo: Nullable<number[]>;
}

export abstract class Paste {
    private _context: SheetContext;

    constructor(context: SheetContext, pasteList: RightMenuProps[]) {
        this._context = context;
    }

    getContext() {
        return this._context;
    }

    paste(e: Event) {}
}

export class UniverPaste extends Paste {
    constructor(context: SheetContext) {
        const pasteList = [
            {
                label: 'rightClick.paste',
                onClick: () => {
                    // this.pasteTo();
                },
            },
        ];
        super(context, pasteList);
    }

    pasteTo(info: PasteInfo): IActionData[] {
        let actionDataList: IActionData[] = [];
        const { data, colInfo, rowInfo } = info;
        // const data = await this.pasteResolver(e);
        // if (data.length === 0) return;

        if (!data || !data.length) return [];
        const sheet = this.getContext().getWorkBook().getActiveSheet();
        if (!sheet) return [];
        const sheetId = sheet.getSheetId();
        const SheetPlugin = this.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);
        if (!SheetPlugin) return [];
        const spreadsheet = SheetPlugin?.getMainComponent();
        if (!spreadsheet) return [];
        const controls = SheetPlugin?.getSelectionManager().getCurrentControls();
        const selections: any = controls?.map((control: SelectionControl) => {
            const model: SelectionModel = control.model;
            return {
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            };
        });

        if (!selections.length) {
            return [];
        }

        if (selections.length > 1) {
            return [];
        }

        const selection = selections[0];

        let copyH = data.length;
        let copyC = data[0].length;

        let minH = selection.startRow; //应用范围首尾行
        let maxH = minH + copyH - 1;
        let minC = selection.startColumn; //应用范围首尾列
        let maxC = minC + copyC - 1;
        const isMerge = sheet.getMerges().getByRowColumn(minH, maxH, minC, maxC);
        if (isMerge) {
            const prompt = this.getContext()
                .getUniver()
                .getGlobalContext()
                .getPluginManager()
                .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
                .getSlot(SHEET_UI_PLUGIN_NAME + Prompt.name);
            prompt.props.title = 'info.tooltip';
            prompt.props.content = 'info.notChangeMerge';
            prompt.showModal(true);

            return [];
        }
        // 最终渲染数据
        const tableData = handleTableMergeData(data, selection);
        const mergeData = tableData.mergeData;
        for (let i = 0; i < mergeData.length; i++) {
            // sheet.getMerges().add(mergeData[i]);

            // Don't trigger the API, return to the ExtensionManager after collection and trigger it in one Command, which is convenient for undo
            const mergeActionDataList = this._getMergeActionData(sheetId, mergeData[i]);
            actionDataList = actionDataList.concat(mergeActionDataList);
        }
        // sheet.getRange(minH, minC, maxH, maxC).setRangeDatas(tableData.data);
        const rangeActionData = this._getRangeActionData(sheetId, minH, minC, maxH, maxC, tableData.data);
        actionDataList.push(rangeActionData);

        const columnWidthActionDataList = this._getColumnWidthActionData(sheetId, colInfo, minC);
        actionDataList = actionDataList.concat(columnWidthActionDataList);

        const rowHeightActionDataList = this._getRowHeightActionData(sheetId, rowInfo, minH);
        actionDataList = actionDataList.concat(rowHeightActionDataList);

        // TODO
        // const selectionActionData = this._getSelectionActionData(sheetId);
        // selectionActionData && actionDataList.push(selectionActionData)

        return actionDataList;
    }

    private _getMergeActionData(sheetId: string, mergeData: IRangeData) {
        let removeAction: IRemoveMergeActionData = {
            actionName: RemoveMergeAction.NAME,
            sheetId,
            rectangles: [mergeData],
        };
        let appendAction: IAddMergeActionData = {
            actionName: AddMergeAction.NAME,
            sheetId,
            rectangles: [mergeData],
        };
        return [removeAction, appendAction];
    }

    private _getRangeActionData(sheetId: string, startRow: number, startColumn: number, endRow: number, endColumn: number, values: ICellData[][]) {
        const cellValue = new ObjectMatrix<ICellData>();
        for (let r = 0; r <= endRow - startRow; r++) {
            for (let c = 0; c <= endColumn - startColumn; c++) {
                cellValue.setValue(r + startRow, c + startColumn, values[r][c]);
            }
        }

        const setValue: ISetRangeDataActionData = {
            sheetId,
            actionName: SHEET_ACTION_NAMES.SET_RANGE_DATA_ACTION,
            cellValue: cellValue.getData(),
        };

        return setValue;
    }

    private _getColumnWidthActionData(sheetId: string, colInfo: Nullable<number[]>, minC: number) {
        const actionDataList = [];
        if (colInfo && colInfo.length) {
            for (let i = 0; i < colInfo.length; i++) {
                const columnIndex = minC + i;
                const columnWidth = [colInfo[i]];
                const setColumnWidth: ISetColumnWidthActionData = {
                    sheetId,
                    actionName: SHEET_ACTION_NAMES.SET_COLUMN_WIDTH_ACTION,
                    columnIndex,
                    columnWidth,
                };

                actionDataList.push(setColumnWidth);
            }
        }

        return actionDataList;
    }

    private _getRowHeightActionData(sheetId: string, rowInfo: Nullable<number[]>, minH: number) {
        const actionDataList = [];

        if (rowInfo && rowInfo.length) {
            for (let i = 0; i < rowInfo.length; i++) {
                const rowIndex = minH + i;
                const rowHeight = [rowInfo[i]];
                const setRowHeight: ISetRowHeightActionData = {
                    sheetId,
                    actionName: SetRowHeightAction.NAME,
                    rowIndex,
                    rowHeight,
                };
                actionDataList.push(setRowHeight);
            }
        }

        return actionDataList;
    }

    private _getSelectionActionData(sheetId: string) {
        const selectionManager = this.getContext().getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET).getSelectionManager();

        // TODO 从粘贴的表格中解析出来 @tony
        const selectionRange = DEFAULT_SELECTION;
        const curCellRange = DEFAULT_CELL;
        selectionManager.clearSelectionControls();
        const models = selectionManager.addControlToCurrentByRangeData(selectionRange, curCellRange, false);
        selectionManager.updatePreviousSelection();
        if (!models) return;

        let actionData: ISetSelectionValueActionData = {
            sheetId,
            actionName: SetSelectionValueAction.NAME,
            selections: models,
        };

        return actionData;
    }
}
