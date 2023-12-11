/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IRangeWithCoord, ISelectionCellWithCoord, ISelectionWithCoord, Nullable } from '@univerjs/core';
import { makeCellToSelection, RANGE_TYPE } from '@univerjs/core';

export class SelectionRenderModel implements IRangeWithCoord {
    private _startColumn: number = -1;

    private _startRow: number = -1;

    private _endColumn: number = -1;

    private _endRow: number = -1;

    private _startX: number = 0;

    private _startY: number = 0;

    private _endX: number = 0;

    private _endY: number = 0;

    private _currentCell: Nullable<ISelectionCellWithCoord>;

    private _rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL;

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

    get rangeType() {
        return this._rangeType;
    }

    isEqual(rangeWithCoord: IRangeWithCoord) {
        const { startColumn, startRow, endColumn, endRow } = this;
        const {
            startColumn: newStartColumn,
            startRow: newStartRow,
            endColumn: newEndColumn,
            endRow: newEndRow,
        } = rangeWithCoord;
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

    isInclude(rangeWithCoord: IRangeWithCoord) {
        const { startColumn, startRow, endColumn, endRow } = this;
        const {
            startColumn: newStartColumn,
            startRow: newStartRow,
            endColumn: newEndColumn,
            endRow: newEndRow,
        } = rangeWithCoord;

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

    getRange() {
        return {
            startColumn: this._startColumn,
            startRow: this._startRow,
            endColumn: this._endColumn,
            endRow: this._endRow,

            startX: this._startX,
            startY: this._startY,
            endX: this._endX,
            endY: this._endY,

            rangeType: this.rangeType,
        };
    }

    getCell() {
        return this._currentCell;
    }

    getRangeType() {
        return this._rangeType;
    }

    getValue(): ISelectionWithCoord {
        return {
            rangeWithCoord: {
                startColumn: this._startColumn,
                startRow: this._startRow,
                endColumn: this._endColumn,
                endRow: this._endRow,

                startX: this._startX,
                startY: this._startY,
                endX: this._endX,
                endY: this._endY,

                rangeType: this._rangeType,
            },
            primaryWithCoord: this._currentCell,
        };
    }

    setValue(newSelectionRange: IRangeWithCoord, currentCell: Nullable<ISelectionCellWithCoord>) {
        const {
            startColumn,
            startRow,
            endColumn,
            endRow,

            startX,
            startY,
            endX,
            endY,

            rangeType,
        } = newSelectionRange;

        this._startColumn = startColumn;

        this._startRow = startRow;

        this._endColumn = endColumn;

        this._endRow = endRow;

        this._startX = startX;

        this._startY = startY;

        this._endX = endX;

        this._endY = endY;

        if (rangeType != null) {
            this._rangeType = rangeType;
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
