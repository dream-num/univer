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

import type { IObjectArrayPrimitiveType } from '../shared/object-matrix';
import type { Nullable } from '../shared/types';
import type { IStyleData } from '../types/interfaces';
import type { CustomData, IRange, IRowData, IWorksheetData } from './typedef';
import type { SheetViewModel } from './view-model';
import { getArrayLength } from '../shared/object-matrix';
import { BooleanNumber } from '../types/enum';
import { RANGE_TYPE } from './typedef';

const MAXIMUM_ROW_HEIGHT = 2000;

/**
 * Manage configuration information of all rows, get row height, row length, set row height, etc.
 */
export class RowManager {
    private _rowData: IObjectArrayPrimitiveType<Partial<IRowData>>;

    constructor(
        private readonly _config: IWorksheetData,
        private readonly _viewModel: SheetViewModel,
        data: IObjectArrayPrimitiveType<Partial<IRowData>>
    ) {
        this._rowData = data;
    }

    /**
     * Get height and hidden status of columns in the sheet
     * @returns {IObjectArrayPrimitiveType<Partial<IRowData>>} Row data, including height, hidden status, etc.
     */
    getRowData(): IObjectArrayPrimitiveType<Partial<IRowData>> {
        return this._rowData;
    }

    /**
     * Get the row style
     * @param {number} row Row index
     * @returns {string | Nullable<IStyleData>} Style data, may be undefined
     */
    getRowStyle(row: number) {
        return this._rowData[row]?.s;
    }

    /**
     * Set row default style
     * @param {number} row The row index
     * @param {string | Nullable<IStyleData>} style The style data
     */
    setRowStyle(row: number, style: string | Nullable<IStyleData>) {
        const rowData = this.getRowOrCreate(row);
        rowData.s = style;
    }

    getRowDatas(rowPos: number, numRows: number): IObjectArrayPrimitiveType<Partial<IRowData>> {
        const rowData: IObjectArrayPrimitiveType<Partial<IRowData>> = {};
        let index = 0;
        for (let i = rowPos; i < rowPos + numRows; i++) {
            const data = this.getRow(i);
            rowData[index] = data ?? {
                h: this._config.defaultRowHeight,
                hd: BooleanNumber.FALSE,
            };
            index++;
        }
        return rowData;
    }

    getRowHeight(rowPos: number): number;
    getRowHeight(rowPos: number, count: number): number;
    getRowHeight(rowPos: number, count: number = 1): number {
        const { _rowData } = this;
        const config = this._config;
        let height: number = 0;

        for (let i = 0; i < count; i++) {
            const row = _rowData[i + rowPos] || {
                hd: BooleanNumber.FALSE,
                h: config.defaultRowHeight,
            };
            const { ia, ah, h = config.defaultRowHeight } = row;

            height += (ia == null || ia === BooleanNumber.TRUE) && typeof ah === 'number' ? ah : h;
        }

        return height;
    }

    /**
     * Set row height of given row
     * @param rowPos row index
     * @param height row height
     */
    setRowHeight(rowPos: number, height: number) {
        const row = this._rowData[rowPos];

        // To prevent data redundancy, we only set the height when it is different from the default row height.
        if (height === this._config.defaultRowHeight) {
            if (row) {
                delete row.h;

                if (Object.keys(row).length === 0) {
                    delete this._rowData[rowPos];
                }
            }
        } else {
            const _height = Math.min(height, MAXIMUM_ROW_HEIGHT);
            this._rowData[rowPos] = row ? { ...row, h: _height } : { h: _height };
        }
    }

    /**
     * Get row data of given row
     * @param rowPos row index
     * @returns {Nullable<Partial<IRowData>>} rowData
     */
    getRow(rowPos: number): Nullable<Partial<IRowData>> {
        return this._rowData[rowPos];
    }

    /**
     * Remove row data of given row
     * @param rowPos
     */
    removeRow(rowPos: number) {
        delete this._rowData[rowPos];
    }

    /**
     * Get given row data or create a row data when it's null
     * This method is used to ensure that the row data should not be null when setting row properties.
     * To prevent data redundancy, if is not setting row properties, you can use `getRow` method to get row data. don't use this method.
     * @param rowPos row index
     * @returns {Partial<IRowData>} rowData
     */
    getRowOrCreate(rowPos: number): Partial<IRowData> {
        const { _rowData } = this;
        const row = _rowData[rowPos];
        if (row) {
            return row;
        }

        const create = {};
        _rowData[rowPos] = create;

        return create;
    }

    /**
     * Get all hidden rows
     * @param start Start index
     * @param end End index
     * @returns Hidden rows range list
     */
    getHiddenRows(start: number = 0, end: number = this.getSize() - 1): IRange[] {
        const hiddenRows: IRange[] = [];

        let inHiddenRange = false;
        let startRow = -1;

        for (let i = start; i <= end; i++) {
            const visible = this.getRowRawVisible(i);
            if (inHiddenRange && visible) {
                inHiddenRange = false;
                hiddenRows.push({
                    startRow,
                    endRow: i - 1,
                    startColumn: 0,
                    endColumn: 0,
                    rangeType: RANGE_TYPE.ROW,
                });
            } else if (!inHiddenRange && !visible) {
                inHiddenRange = true;
                startRow = i;
            }
        }

        if (inHiddenRange) {
            hiddenRows.push({ startRow, endRow: end, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW });
        }

        return hiddenRows;
    }

    /**
     * Get all visible rows
     * @param start Start index
     * @param end End index
     * @returns Visible rows range list
     */
    getVisibleRows(start: number = 0, end: number = this.getSize() - 1): IRange[] {
        const visibleRows: IRange[] = [];

        let inVisibleRange = false;
        let startRow = -1;

        for (let i = start; i <= end; i++) {
            const visible = this.getRowRawVisible(i);
            if (inVisibleRange && !visible) {
                inVisibleRange = false;
                visibleRows.push({
                    startRow,
                    endRow: i - 1,
                    startColumn: 0,
                    endColumn: 0,
                    rangeType: RANGE_TYPE.ROW,
                });
            } else if (!inVisibleRange && visible) {
                inVisibleRange = true;
                startRow = i;
            }
        }

        if (inVisibleRange) {
            visibleRows.push({ startRow, endRow: end, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW });
        }

        return visibleRows;
    }

    getRowRawVisible(row: number): boolean {
        const rowData = this.getRow(row);
        if (!rowData) {
            return true;
        }

        return rowData.hd !== BooleanNumber.TRUE;
    }

    /**
     * Get count of row in the sheet
     * @returns {number} row count
     */
    getSize(): number {
        return getArrayLength(this._rowData);
    }

    setCustomMetadata(index: number, custom: CustomData | undefined) {
        const row = this.getRow(index);
        if (row) {
            row.custom = custom;
        }
    }

    getCustomMetadata(index: number): CustomData | undefined {
        return this.getRow(index)?.custom;
    }
}
