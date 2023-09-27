import {
    ISelectionCellWithCoord,
    ISelectionRangeWithCoord,
    makeCellToSelection,
    Nullable,
    SELECTION_TYPE,
} from '@univerjs/core';

export class SelectionTransformerModel implements ISelectionRangeWithCoord {
    private _startColumn: number = -1;

    private _startRow: number = -1;

    private _endColumn: number = -1;

    private _endRow: number = -1;

    private _startX: number = 0;

    private _startY: number = 0;

    private _endX: number = 0;

    private _endY: number = 0;

    private _currentCell: Nullable<ISelectionCellWithCoord>;

    private _selectionType: SELECTION_TYPE = SELECTION_TYPE.NORMAL;

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

    get currentCell() {
        return this._currentCell;
    }

    get selectionType() {
        return this._selectionType;
    }

    isEqual(selectionRange: ISelectionRangeWithCoord) {
        const { startColumn, startRow, endColumn, endRow } = this;
        const {
            startColumn: newStartColumn,
            startRow: newStartRow,
            endColumn: newEndColumn,
            endRow: newEndRow,
        } = selectionRange;
        // if (type !== newType) {
        //     return false;
        // }
        if (
            startColumn === newStartColumn &&
            startRow === newStartRow &&
            endColumn === newEndColumn &&
            endRow === newEndRow
        ) {
            return true;
        }
        return false;
    }

    isInclude(selectionRange: ISelectionRangeWithCoord) {
        const { startColumn, startRow, endColumn, endRow } = this;
        const {
            startColumn: newStartColumn,
            startRow: newStartRow,
            endColumn: newEndColumn,
            endRow: newEndRow,
        } = selectionRange;

        // if (type !== newType) {
        //     return false;
        // }

        if (
            !(newEndColumn < startColumn || newStartColumn > endColumn || newStartRow > endRow || newEndRow < startRow)
        ) {
            return true;
        }
        return false;
    }

    highlightToSelection() {
        return makeCellToSelection(this._currentCell);
    }

    getSelection() {
        return {
            startColumn: this._startColumn,
            startRow: this._startRow,
            endColumn: this._endColumn,
            endRow: this._endRow,

            startX: this._startX,
            startY: this._startY,
            endX: this._endX,
            endY: this._endY,
        };
    }

    getCell() {
        return this._currentCell;
    }

    getSelectionType() {
        return this._selectionType;
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
            cellInfo: this._currentCell,
            selectionType: this._selectionType,
        };
    }

    setValue(
        newSelectionRange: ISelectionRangeWithCoord,
        currentCell: Nullable<ISelectionCellWithCoord>,
        selectionType: Nullable<SELECTION_TYPE>
    ) {
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

        if (selectionType != null) {
            this._selectionType = selectionType;
        }

        this.setCurrentCell(currentCell);
    }

    setCurrentCell(currentCell: Nullable<ISelectionCellWithCoord>) {
        if (currentCell) {
            this._currentCell = currentCell;
        }
    }

    clearCurrentCell() {
        this._currentCell = null;
    }
}
