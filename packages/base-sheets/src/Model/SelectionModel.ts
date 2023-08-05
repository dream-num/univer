import { ICellInfo, ICurrentUniverService, ISelection, Nullable, makeCellToSelection } from '@univerjs/core';

import { SELECTION_TYPE } from '../Controller/Selection/SelectionController';

export class SelectionModel implements ISelection {
    private _startColumn: number;

    private _startRow: number;

    private _endColumn: number;

    private _endRow: number;

    private _startX: number;

    private _startY: number;

    private _endX: number;

    private _endY: number;

    private _type: SELECTION_TYPE;

    private _currentCell: Nullable<ICellInfo>;

    constructor(type: SELECTION_TYPE = SELECTION_TYPE.NORMAL, @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService) {
        this._type = type;
    }

    get startColumn() {
        return this._startColumn;
    }

    get startRow() {
        return this._startRow;
    }

    get endColumn() {
        return this._endColumn;
    }

    get endRow() {
        return this._endRow;
    }

    get startX() {
        return this._startX;
    }

    get startY() {
        return this._startY;
    }

    get endX() {
        return this._endX;
    }

    get endY() {
        return this._endY;
    }

    get type() {
        return this._type;
    }

    get currentCell() {
        return this._currentCell;
    }

    isEqual(selectionRange: ISelection) {
        const { startColumn, startRow, endColumn, endRow, type } = this;
        const { startColumn: newStartColumn, startRow: newStartRow, endColumn: newEndColumn, endRow: newEndRow } = selectionRange;
        // if (type !== newType) {
        //     return false;
        // }
        if (startColumn === newStartColumn && startRow === newStartRow && endColumn === newEndColumn && endRow === newEndRow) {
            return true;
        }
        return false;
    }

    isInclude(selectionRange: ISelection) {
        const { startColumn, startRow, endColumn, endRow, type } = this;
        const { startColumn: newStartColumn, startRow: newStartRow, endColumn: newEndColumn, endRow: newEndRow } = selectionRange;

        // if (type !== newType) {
        //     return false;
        // }

        if (!(newEndColumn < startColumn || newStartColumn > endColumn || newStartRow > endRow || newEndRow < startRow)) {
            return true;
        }
        return false;
    }

    highlightToSelection() {
        return makeCellToSelection(this._currentCell);
    }

    getValue() {
        return {
            selection: {
                startColumn: this._startColumn,
                startRow: this._startRow,
                endColumn: this._endColumn,
                endRow: this._endRow,

                startX: this._startX,
                startY: this._startY,
                endX: this._endX,
                endY: this._endY,
            },
            cell: this._currentCell,
        };
    }

    setValue(newSelectionRange: ISelection, currentCell: Nullable<ICellInfo>) {
        const {
            startColumn,
            startRow,
            endColumn,
            endRow,

            startX,
            startY,
            endX,
            endY,
        } = newSelectionRange;

        this._startColumn = startColumn;

        this._startRow = startRow;

        this._endColumn = endColumn;

        this._endRow = endRow;

        this._startX = startX;

        this._startY = startY;

        this._endX = endX;

        this._endY = endY;

        this.setTypeByData();

        this.setCurrentCell(currentCell);
    }

    setCurrentCell(currentCell: Nullable<ICellInfo>) {
        if (currentCell) {
            this._currentCell = currentCell;
        }
    }

    clearCurrentCell() {
        this._currentCell = null;
    }

    /**
     * Determine the type type based on the data
     */
    setTypeByData() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const rowCount = workbook.getActiveSheet().getConfig().rowCount;
        const columnCount = workbook.getActiveSheet().getConfig().columnCount;

        if (this._startRow === 0 && this._endRow === rowCount - 1) {
            return (this._type = SELECTION_TYPE.COLUMN);
        }
        if (this._startColumn === 0 && this._endColumn === columnCount - 1) {
            return (this._type = SELECTION_TYPE.ROW);
        }

        return (this._type = SELECTION_TYPE.NORMAL);
    }
}
