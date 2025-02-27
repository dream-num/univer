/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ICellWithCoord, IRangeWithCoord, Nullable } from '@univerjs/core';
import type { ISelectionWithCoord } from '@univerjs/sheets';
import { convertCellToRange, RANGE_TYPE } from '@univerjs/core';

/**
 * Data model for SelectionControl.model
 * NOT Same as @univerjs/sheet.WorkbookSelectionModel, that's data model for Workbook
 */
export class SelectionRenderModel implements IRangeWithCoord {
    private _startColumn: number = -1;
    private _startRow: number = -1;
    private _endColumn: number = -1;
    private _endRow: number = -1;
    private _startX: number = 0;
    private _startY: number = 0;
    private _endX: number = 0;
    private _endY: number = 0;

    /**
     * The highlight cell of a selection. aka: current cell
     */
    private _primary: Nullable<ICellWithCoord>;
    private _rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL;

    constructor() {
    }

    get startColumn() { return this._startColumn; }
    get startRow() { return this._startRow; }
    get endColumn() { return this._endColumn; }
    get endRow() { return this._endRow; }
    get startX() { return this._startX; }
    get startY() { return this._startY; }
    get endX() { return this._endX; }
    get endY() { return this._endY; }
    get currentCell() { return this._primary; }
    get rangeType() { return this._rangeType; }

    /**
     * @deprecated, Duplicate with `Rectangle`
     */
    isEqual(rangeWithCoord: IRangeWithCoord) {
        const { startColumn, startRow, endColumn, endRow } = this;
        const {
            startColumn: newStartColumn,
            startRow: newStartRow,
            endColumn: newEndColumn,
            endRow: newEndRow,
        } = rangeWithCoord;

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

    highlightToSelection(): Nullable<IRangeWithCoord> {
        if (!this._primary) return;
        return convertCellToRange(this._primary);
    }

    getRange(): IRangeWithCoord {
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
        return this._primary;
    }

    getRangeType() {
        return this._rangeType;
    }

    setRangeType(rangeType: RANGE_TYPE) {
        this._rangeType = rangeType;
    }

    getValue(): ISelectionWithCoord {
        return {
            rangeWithCoord: this.getRange(),
            primaryWithCoord: this._primary,
        };
    }

    setValue(newSelectionRange: IRangeWithCoord, currentCell: Nullable<ICellWithCoord>) {
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

        // !! rangeType various from 0 ~ 3
        if (rangeType !== undefined) {
            this._rangeType = rangeType;
        }
        if (currentCell !== undefined) {
            this.setCurrentCell(currentCell);
        }
    }

    /**
     * Set primary cell.
     * @TODO lumixraku there are 3 concepts for same thing, primary and current and highlight
     * highlight is best. primary sometimes means the actual cell(actual means ignore merge)
     * @param currentCell
     */
    setCurrentCell(currentCell: Nullable<ICellWithCoord>) {
        this._primary = currentCell;
    }

    clearCurrentCell() {
        this._primary = null;
    }
}
