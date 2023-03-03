import { SheetContext } from '../../Basics';
import { Command, CommandManager } from '../../Command';

import {
    ISetSelectionActivateActionData,
    SetSelectionActivateAction,
} from '../Action';

import { DEFAULT_SELECTION } from '../../Const';
import { Direction } from '../../Enum';
import { IRangeData, IRangeType, ISelectionData } from '../../Interfaces';
import { Nullable, Tools } from '../../Shared';
import { Range } from './Range';
import { RangeList } from './RangeList';
import { Workbook } from './Workbook';
import { Worksheet } from './Worksheet';

/**
 *
 * Access the current active selection in the active sheet.
 *
 * @remarks
 * A selection is the set of cells the user has highlighted in the sheet, which can be non-adjacent ranges. One cell in the selection is the current cell, where the user's current focus is. The current cell is highlighted with a darker border in the UniverSheet UI.
 *
 * Current selection, each worksheet contains an array of selections, the last selection is the current active selection by default, or the selection with the active field set to true is the current active selection
 *
 * Reference: https://developers.google.com/apps-script/reference/spreadsheet/selection
 *
 * @privateRemarks
 * zh: 当前选区，每个工作表包含一个选区数组，默认最后一个选区为当前激活选区，或者当前激活单元格所在选区为激活选区
 *
 * @beta
 */
export class Selection {
    private _commandManager: CommandManager;

    private _context: SheetContext;

    private _workbook: Workbook;

    private _workSheet: Worksheet;

    private _activeRange: Range;

    private _currentCell: Range;

    private _activeRangeList: RangeList;

    constructor(worksheet: Worksheet) {
        this._workSheet = worksheet;
        this._context = worksheet.getContext();
        this._commandManager = this._context.getCommandManager();
        this._workbook = worksheet.getContext().getWorkBook();

        // set default selection
        this._activeRangeList = this._workSheet.getRangeList([DEFAULT_SELECTION]);
        this._activeRange = this._workSheet.getRange(DEFAULT_SELECTION);
        this._currentCell = this._workSheet.getRange(DEFAULT_SELECTION);
    }

    /**
     * Determine whether the cell is in the rangeList
     *
     * @param rangeList
     * @param cell
     * @returns
     */
    static cellInRange(
        rangeList: IRangeData[],
        cell: IRangeData
    ): Nullable<IRangeData> {
        for (const item of rangeList) {
            if (
                item.startRow <= cell.startRow &&
                cell.endRow <= item.endRow &&
                item.startColumn <= cell.startColumn &&
                cell.endColumn <= item.endColumn
            ) {
                return item;
            }
        }

        return null;
    }

    setWorkSheet(workSheet: Worksheet): void {
        this._workSheet = workSheet;
    }

    /**
     * Update the range of the selection
     *
     * @param param0 - selection data
     * @returns
     */
    setSelection({ selection, cell }: ISelectionData = {}): Range {
        // if (!selection && !cell){
        //     return console.error('Must provide selection or cell parameters');
        // }

        let activeRangeList: IRangeData[];

        let activeRange: IRangeData;

        let currentCell: IRangeData;

        // selection is Range instance
        if (selection instanceof Range) {
            // get range data
            activeRange = selection.getRangeData();

            // The user entered an invalid range
            if (activeRange.startRow === -1) {
                console.error('Invalid selection, default set startRow -1');
            }

            // set range list
            activeRangeList = [activeRange];

            // get top-left cell in active range as current cell
            currentCell = {
                startRow: activeRange.startRow,
                endRow: activeRange.startRow,
                startColumn: activeRange.startColumn,
                endColumn: activeRange.startColumn,
            };
        } else if (selection && Workbook.isIRangeType(selection)) {
            // Convert the selection passed in by the user into a standard format
            // activeRange = new TransformTool(this._workbook).transformRangeType(
            //     selection
            // );
            activeRange = this._workbook.transformRangeType(selection).rangeData;
            // The user entered an invalid range
            if (activeRange.startRow === -1) {
                console.error('Invalid selection, default set startRow -1');
            }

            // set range list
            activeRangeList = [activeRange];

            // get top-left cell in active range as current cell
            currentCell = {
                startRow: activeRange.startRow,
                endRow: activeRange.startRow,
                startColumn: activeRange.startColumn,
                endColumn: activeRange.startColumn,
            };
        } else if (selection instanceof Array) {
            // Array is to prevent type detection

            // Convert the selection passed in by the user into a standard format
            activeRangeList = selection.map((item: IRangeType) => {
                // item = new TransformTool(this._workbook).transformRangeType(item);
                const itemData: IRangeData =
                    this._workbook.transformRangeType(item).rangeData;
                // The user entered an invalid range
                if (itemData.startRow === -1) {
                    console.error('Invalid selection, default set startRow -1');
                }

                return itemData;
            });

            activeRange = activeRangeList[activeRangeList.length - 1];

            currentCell = {
                startRow: activeRange.startRow,
                endRow: activeRange.startRow,
                startColumn: activeRange.startColumn,
                endColumn: activeRange.startColumn,
            };
        } else {
            // The current selection is taken by default
            activeRangeList = this._activeRangeList.getRangeList();
            activeRange = this._activeRange.getRangeData();
            currentCell = this._currentCell.getRangeData();
        }

        // update current cell based on currentCell
        if (cell) {
            // currentCell = new TransformTool(this._workbook).transformRangeType(cell);
            currentCell = this._workbook.transformRangeType(cell).rangeData;
            const activeRangeData: Nullable<IRangeData> = Selection.cellInRange(
                activeRangeList,
                currentCell
            );

            // if cell not in range, reset new active range and active range list based on current cell
            if (!activeRangeData) {
                activeRange = currentCell;
                activeRangeList = [activeRange];
            }
        }

        const { _context, _workSheet, _commandManager } = this;
        const setSelection: ISetSelectionActivateActionData = {
            sheetId: _workSheet.getSheetId(),
            actionName: SetSelectionActivateAction.NAME,
            activeRangeList,
            activeRange,
            currentCell,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setSelection
        );
        _commandManager.invoke(command);

        // 设置后获取范围(以A1:B10形式)
        const text = `${
            Tools.chatAtABC(activeRange.startColumn) + (activeRange.startRow + 1)
        }:${Tools.chatAtABC(activeRange.endColumn)}${activeRange.endRow + 1}`;
        this._context
            .getObserverManager()
            .getObserver<string>('onAfterSetSelectionObservable')
            ?.notifyObservers(text);
        return this._activeRange;
    }

    /**
     * get selection from active range instance
     * @returns
     */
    getSelection(): IRangeData {
        return Tools.deepClone(this._activeRange.getRangeData());
    }

    /**
     * Returns the selected range in the active sheet, or null if there is no active range. If multiple ranges are selected this method returns only the last selected range.
     *
     * @returns
     */
    getActiveRange(): Range {
        return this._activeRange;
    }

    /**
     * Returns the list of active ranges in the active sheet or null if there are no active ranges.
     * If there is a single range selected, this behaves as a getActiveRange() call.
     * 已迁移到SelectionManager
     * @returns
     */
    getActiveRangeList(): RangeList {
        return this._activeRangeList;
    }

    /**
     * Returns the active sheet in the spreadsheet.
     *
     * @returns
     */
    getActiveSheet(): Nullable<Worksheet> {
        return this._workbook.getActiveSheet();
    }

    /**
     * Returns the current (highlighted) cell that is selected in one of the active ranges or null if there is no current cell.
     *
     * @returns
     */
    getCurrentCell(): Range {
        return this._currentCell;
    }

    /**
     * set current cell by range data
     *
     * @remarks
     * Provide actual methods for range.activateAsCurrentCell
     * If the specified cell is not present in any existing range, then the existing selection is removed and the cell becomes the current cell and the active range.
     * Note: The specified Range must consist of one cell, otherwise it throws an exception.
     *
     * @param range - range data
     * @returns
     */
    setCurrentCell(range: Range | IRangeData): Selection {
        if (Tools.isAssignableFrom(range, Range)) {
            range = range.getRangeData();
        }

        if (range?.startRow === -1) {
            console.error('Invalid range,default set startRow -1');
            return this;
        }

        if (
            !(
                range.startRow === range.endRow &&
                range.startColumn === range.endColumn
            )
        ) {
            console.error('Exception: Range must have a single cell.');
            return this;
        }
        // 2. set current cell
        // this._currentCell = this._workSheet.getRange(range);
        // const activeRange = this._workSheet.getRange(range);

        // 3. change active range
        const activeRangeList = this._activeRangeList.getRangeList();

        // If the specified cell is present in an existing range, then that range becomes the active range with the cell as the current cell.
        // const _range = Selection.cellInRange(rangeList, range);

        // if (_range) {
        //     this._activeRange = this._workSheet.getRange(_range);
        // } else {
        //     this._activeRange = this._workSheet.getRange(range);
        //     this._activeRangeList = this._workSheet.getRangeList([range]);
        // }

        const { _context, _workSheet, _commandManager } = this;
        const setSelection: ISetSelectionActivateActionData = {
            sheetId: _workSheet.getSheetId(),
            actionName: SetSelectionActivateAction.NAME,
            activeRangeList,
            activeRange: range,
            currentCell: range,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setSelection
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * set activeRangeList, avtiveRange, currentCell
     * @param activeRangeList active range list
     * @param activeRange last selected range
     * @param currentCell current cell range
     * @returns
     */
    setRanges(
        activeRangeList: IRangeData | IRangeData[],
        activeRange: IRangeData,
        currentCell: IRangeData
    ): void {
        // Construct selection instance

        this._activeRangeList = this._workSheet.getRangeList(
            activeRangeList as IRangeType[]
        );
        this._activeRange = this._workSheet.getRange(activeRange);
        this._currentCell = this._workSheet.getRange(currentCell);
    }

    /**
     * move to next range by direction
     *
     * @remarks
     * Starting from the current cell and active range and moving in the given direction, returns an adjusted range where the appropriate edge of the range has been shifted to cover the next data cell while still covering the current cell. If the active range is unbounded along the dimension of the direction, the original active range is returned. If there is no current cell or active range, null is returned. This is equivalent to selecting a range in the editor and hitting Ctrl+Shift+[arrow key].
     *
     * @returns
     */
    getNextDataRange(direction: Direction): Range {
        const expandRangeData = this._expandRange(direction);

        this.setSelection({ selection: expandRangeData });

        return this.getActiveRange();
    }

    /**
     * expend data range by Ctrl+Shift+[arrow key]
     *
     * @returns
     */
    private _expandRange(direction: Direction): IRangeData {
        const lastColumn = this._workSheet.getColumnCount();
        const lastRow = this._workSheet.getRowCount();
        const range = this._activeRange.getRangeData();
        let expandRangeData = DEFAULT_SELECTION;
        const currentCell = this.getCurrentCell().getRangeData();

        if (direction === Direction.RIGHT) {
            if (currentCell.startColumn === range.startColumn) {
                const cellValue = this._workSheet
                    .getCellMatrix()
                    .getValue(currentCell.startRow, range.endColumn);
                let endColumn;
                if (cellValue && cellValue.v === undefined) {
                    for (let i = range.endColumn + 1; i <= lastColumn; i++) {
                        if (i === lastColumn) {
                            endColumn = lastColumn;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(currentCell.startRow, i);
                        if (curCellValue && curCellValue.v !== undefined) {
                            endColumn = i;
                            break;
                        }
                    }
                } else {
                    for (let i = range.endColumn + 1; i <= lastColumn; i++) {
                        if (i === lastColumn) {
                            endColumn = lastColumn;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(currentCell.startRow, i);
                        if (curCellValue && curCellValue.v === undefined) {
                            const prevCellValue = this._workSheet
                                .getCellMatrix()
                                .getValue(currentCell.startRow, i - 1);
                            if (prevCellValue && prevCellValue.v !== undefined) {
                                endColumn = i - 1;
                                break;
                            }
                        }
                    }
                }
                expandRangeData = {
                    startRow: range.startRow,
                    endRow: range.endRow,
                    startColumn: range.startColumn,
                    endColumn: endColumn !== undefined ? endColumn : range.endColumn,
                };
            } else {
                const cellValue = this._workSheet
                    .getCellMatrix()
                    .getValue(currentCell.startRow, range.startColumn);
                let startColumn;
                if (cellValue && cellValue.v === undefined) {
                    for (
                        let i = range.startColumn + 1;
                        i <= currentCell.startColumn;
                        i++
                    ) {
                        if (i === currentCell.startColumn) {
                            startColumn = currentCell.startColumn;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(currentCell.startRow, i);
                        if (curCellValue && curCellValue.v !== undefined) {
                            startColumn = i;
                            break;
                        }
                    }
                } else {
                    for (
                        let i = range.startColumn + 1;
                        i <= currentCell.startColumn;
                        i++
                    ) {
                        if (i === currentCell.startColumn) {
                            startColumn = currentCell.startColumn;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(currentCell.startRow, i);
                        if (curCellValue && curCellValue.v === undefined) {
                            const prevCellValue = this._workSheet
                                .getCellMatrix()
                                .getValue(currentCell.startRow, i - 1);
                            if (prevCellValue && prevCellValue.v !== undefined) {
                                startColumn = i - 1;
                                break;
                            }
                        }
                    }
                }
                expandRangeData = {
                    startRow: range.startRow,
                    endRow: range.endRow,
                    startColumn: startColumn || currentCell.startColumn,
                    endColumn: range.endColumn,
                };
            }
        }
        if (direction === Direction.LEFT) {
            let startColumn;
            let endColumn;
            if (currentCell.endColumn === range.endColumn) {
                const cellValue = this._workSheet
                    .getCellMatrix()
                    .getValue(currentCell.startRow, range.startColumn);
                if (cellValue && cellValue.v === undefined) {
                    for (let i = range.startColumn - 1; i >= 0; i--) {
                        if (i === 0) {
                            startColumn = 0;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(currentCell.startRow, i);
                        if (curCellValue && curCellValue.v !== undefined) {
                            startColumn = i;
                            break;
                        }
                    }
                } else {
                    for (let i = range.startColumn - 1; i >= 0; i--) {
                        if (i === 0) {
                            startColumn = 0;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(currentCell.startRow, i);
                        if (curCellValue && curCellValue.v === undefined) {
                            const prevCellValue = this._workSheet
                                .getCellMatrix()
                                .getValue(currentCell.startRow, i - 1);
                            if (prevCellValue && prevCellValue.v !== undefined) {
                                startColumn = i - 1;
                                break;
                            }
                        }
                    }
                }
            } else {
                const cellValue = this._workSheet
                    .getCellMatrix()
                    .getValue(currentCell.startRow, range.endColumn);
                if (cellValue && cellValue.v === undefined) {
                    for (
                        let i = range.endColumn - 1;
                        i >= currentCell.startColumn;
                        i--
                    ) {
                        if (i === currentCell.startColumn) {
                            endColumn = i;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(currentCell.startRow, i);
                        if (curCellValue && curCellValue.v !== undefined) {
                            endColumn = i;
                            break;
                        }
                    }
                } else {
                    for (
                        let i = range.endColumn - 1;
                        i >= currentCell.startColumn;
                        i--
                    ) {
                        if (i === currentCell.startColumn) {
                            endColumn = i;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(currentCell.startRow, i);
                        if (curCellValue && curCellValue.v === undefined) {
                            const prevCellValue = this._workSheet
                                .getCellMatrix()
                                .getValue(currentCell.startRow, i - 1);
                            if (prevCellValue && prevCellValue.v !== undefined) {
                                endColumn = i - 1;
                                break;
                            }
                        }
                    }
                }
            }
            expandRangeData = {
                startRow: range.startRow,
                endRow: range.endRow,
                startColumn:
                    startColumn !== undefined ? startColumn : range.startColumn,
                endColumn: endColumn !== undefined ? endColumn : range.endColumn,
            };
        }
        if (direction === Direction.TOP) {
            let startRow;
            let endRow;
            if (currentCell.endRow === range.endRow) {
                const cellValue = this._workSheet
                    .getCellMatrix()
                    .getValue(range.startRow, currentCell.startColumn);
                if (cellValue && cellValue.v === undefined) {
                    for (let i = range.endRow - 1; i >= 0; i--) {
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(i, currentCell.startColumn);
                        if (
                            (curCellValue && curCellValue.v !== undefined) ||
                            i === 0
                        ) {
                            startRow = i;
                            break;
                        }
                    }
                } else {
                    for (let i = range.startRow - 1; i >= 0; i--) {
                        if (i === 0) {
                            startRow = 0;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(i, currentCell.startColumn);
                        if (curCellValue && curCellValue.v === undefined) {
                            const prevCellValue = this._workSheet
                                .getCellMatrix()
                                .getValue(i - 1, currentCell.startColumn);
                            if (prevCellValue && prevCellValue.v !== undefined) {
                                startRow = i - 1;
                                break;
                            }
                        }
                    }
                }
            } else {
                const cellValue = this._workSheet
                    .getCellMatrix()
                    .getValue(range.endRow, currentCell.startColumn);
                if (cellValue && cellValue.v === undefined) {
                    for (let i = range.endRow - 1; i >= currentCell.startRow; i--) {
                        if (i === currentCell.startRow) {
                            endRow = currentCell.startRow;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(i, currentCell.startColumn);
                        // if (i <= range.startRow) {
                        //     endRow = range.startRow;
                        //     if (i == 0) {
                        //         startRow = 0;
                        //         break;
                        //     }
                        //     if (i == range.startRow) continue;
                        //     if (curCellValue && curCellValue.v !== undefined) {
                        //         startRow = i;
                        //         break;
                        //     }
                        // } else {
                        if (curCellValue && curCellValue.v !== undefined) {
                            endRow = i;
                            break;
                        }
                        // }
                    }
                } else {
                    for (let i = range.endRow - 1; i >= currentCell.startRow; i--) {
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(i, currentCell.startColumn);

                        if (i === currentCell.startRow) {
                            endRow = currentCell.startRow;
                            break;
                        } else if (
                            curCellValue &&
                            curCellValue.v === undefined &&
                            i !== range.endRow - 1
                        ) {
                            const nextCellValue = this._workSheet
                                .getCellMatrix()
                                .getValue(i + 1, currentCell.startColumn);
                            if (nextCellValue && nextCellValue.v !== undefined) {
                                endRow = i + 1;
                                break;
                            }
                        }
                    }
                }
            }
            expandRangeData = {
                startRow: startRow !== undefined ? startRow : range.startRow,
                endRow: endRow !== undefined ? endRow : range.endRow,
                startColumn: range.startColumn,
                endColumn: range.endColumn,
            };
        }
        if (direction === Direction.BOTTOM) {
            let startRow;
            let endRow;
            if (currentCell.startRow === range.startRow) {
                const cellValue = this._workSheet
                    .getCellMatrix()
                    .getValue(range.endRow, currentCell.startColumn);
                if (cellValue && cellValue.v === undefined) {
                    for (let i = range.endRow + 1; i <= lastRow; i++) {
                        if (i === lastRow) {
                            endRow = lastRow;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(i, currentCell.startColumn);
                        if (curCellValue && curCellValue.v !== undefined) {
                            endRow = i;
                            break;
                        }
                    }
                } else {
                    for (let i = range.endRow + 1; i <= lastRow; i++) {
                        if (i === lastRow) {
                            endRow = lastRow;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(i, currentCell.startColumn);
                        if (curCellValue && curCellValue.v === undefined) {
                            const nextCellValue = this._workSheet
                                .getCellMatrix()
                                .getValue(i + 1, currentCell.startColumn);
                            if (nextCellValue && nextCellValue.v !== undefined) {
                                endRow = i + 1;
                                break;
                            }
                        }
                    }
                }
            } else {
                const cellValue = this._workSheet
                    .getCellMatrix()
                    .getValue(range.startRow + 1, currentCell.startColumn);
                if (cellValue && cellValue.v === undefined) {
                    for (
                        let i = range.startRow + 1;
                        i <= currentCell.startRow;
                        i++
                    ) {
                        if (i === currentCell.startRow) {
                            startRow = currentCell.startRow;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(i, currentCell.startColumn);
                        if (curCellValue && curCellValue.v !== undefined) {
                            startRow = i;
                            break;
                        }
                    }
                } else {
                    for (
                        let i = range.startRow + 1;
                        i <= currentCell.startRow;
                        i++
                    ) {
                        if (i === currentCell.startRow) {
                            startRow = currentCell.startRow;
                            break;
                        }
                        const curCellValue = this._workSheet
                            .getCellMatrix()
                            .getValue(i, currentCell.startColumn);
                        if (
                            curCellValue &&
                            curCellValue.v === undefined &&
                            i !== range.startRow + 1
                        ) {
                            const prevCellValue = this._workSheet
                                .getCellMatrix()
                                .getValue(i - 1, currentCell.startColumn);
                            if (prevCellValue && prevCellValue.v !== undefined) {
                                startRow = i - 1;
                                break;
                            }
                        }
                    }
                }
            }
            expandRangeData = {
                startRow: startRow !== undefined ? startRow : range.startRow,
                endRow: endRow !== undefined ? endRow : range.endRow,
                startColumn: range.startColumn,
                endColumn: range.endColumn,
            };
        }
        return expandRangeData;
    }
}
