import { ISetSelectionValueActionData, SelectionModel, SetSelectionValueAction, ISelectionManager, SelectionManager, SelectionController } from '@univerjs/base-sheets';
import {
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
    ACTION_NAMES,
    ISetColumnWidthActionData,
    ISetRowHeightActionData,
    SetRowHeightAction,
    DEFAULT_SELECTION,
    DEFAULT_CELL,
    ICurrentUniverService,
    IDCurrentUniverService,
} from '@univerjs/core';
import { handleTableMergeData } from '@univerjs/base-ui';

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
    // constructor(pasteList: RightMenuProps[]) { }

    paste(e: Event) {}
}

export class UniverPaste extends Paste {
    constructor(@IDCurrentUniverService private readonly _currentUniverService: ICurrentUniverService, @ISelectionManager private readonly _selectionManager: SelectionManager) {
        const pasteList = [
            {
                label: 'rightClick.paste',
                onClick: () => {
                    // this.pasteTo();
                },
            },
        ];
        // super(pasteList);
        super();
    }

    pasteTo(info: PasteInfo): IActionData[] {
        let actionDataList: IActionData[] = [];
        const { data, colInfo, rowInfo } = info;
        // const data = await this.pasteResolver(e);
        // if (data.length === 0) return;
        if (!data || !data.length) return [];
        const sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
        if (!sheet) return [];
        const sheetId = sheet.getSheetId();
        const controls = this._selectionManager.getCurrentControls();
        const selections: any = controls?.map((control: SelectionController) => {
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

        const copyH = data.length;
        const copyC = data[0].length;

        const minH = selection.startRow; //应用范围首尾行
        const maxH = minH + copyH - 1;
        const minC = selection.startColumn; //应用范围首尾列
        const maxC = minC + copyC - 1;
        const isMerge = sheet.getMerges().getByRowColumn(minH, maxH, minC, maxC);
        if (isMerge) {
            // const prompt = this.getContext()
            //     .getUniver()
            //     .getGlobalContext()
            //     .getPluginManager()
            //     .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            //     .getSlot(SHEET_UI_PLUGIN_NAME + Prompt.name);
            // prompt.props.title = 'info.tooltip';
            // prompt.props.content = 'info.notChangeMerge';
            // prompt.showModal(true);

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
        const removeAction: IRemoveMergeActionData = {
            actionName: RemoveMergeAction.NAME,
            sheetId,
            rectangles: [mergeData],
        };
        const appendAction: IAddMergeActionData = {
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
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            cellValue: cellValue.getData(),
        };

        return setValue;
    }

    private _getColumnWidthActionData(sheetId: string, colInfo: Nullable<number[]>, minC: number) {
        const actionDataList: ISetColumnWidthActionData[] = [];
        if (colInfo && colInfo.length) {
            for (let i = 0; i < colInfo.length; i++) {
                const columnIndex = minC + i;
                const columnWidth = [colInfo[i]];
                const setColumnWidth: ISetColumnWidthActionData = {
                    sheetId,
                    actionName: ACTION_NAMES.SET_COLUMN_WIDTH_ACTION,
                    columnIndex,
                    columnWidth,
                };

                actionDataList.push(setColumnWidth);
            }
        }

        return actionDataList;
    }

    private _getRowHeightActionData(sheetId: string, rowInfo: Nullable<number[]>, minH: number) {
        const actionDataList: ISetRowHeightActionData[] = [];

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
        // TODO 从粘贴的表格中解析出来 @tony
        const selectionRange = DEFAULT_SELECTION;
        const curCellRange = DEFAULT_CELL;
        this._selectionManager.clearSelectionControls();
        const models = this._selectionManager.addControlToCurrentByRangeData(selectionRange, curCellRange, false);
        this._selectionManager.updatePreviousSelection();
        if (!models) return;

        const actionData: ISetSelectionValueActionData = {
            sheetId,
            actionName: SetSelectionValueAction.NAME,
            selections: models,
        };

        return actionData;
    }
}
