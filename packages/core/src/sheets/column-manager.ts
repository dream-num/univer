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
import type { CustomData, IColumnData, IRange, IScopeColumnDataInfo, IWorksheetData } from './typedef';
import { getArrayLength, insertMatrixArray, moveMatrixArray, spliceArray } from '../shared/object-matrix';
import { BooleanNumber } from '../types/enum';
import { RANGE_TYPE } from './typedef';

function removeScopeDataByCol(
    data: IScopeColumnDataInfo[],
    col: number
): IScopeColumnDataInfo[] {
    let left = 0;
    let right = data.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const info = data[mid];

        if (col < info.s) {
            right = mid - 1;
        } else if (col > info.e) {
            left = mid + 1;
        } else {
            // Found the scope containing the column
            if (info.e - info.s > 0) {
                // Split the scope into two parts
                const newScopes = [];
                if (info.s < col) {
                    newScopes.push({ ...info, e: col - 1 });
                }
                if (info.e > col) {
                    newScopes.push({ ...info, s: col + 1 });
                }
                return [...data.slice(0, mid), ...newScopes, ...data.slice(mid + 1)];
            } else {
                // Remove the scope if it's a single column
                return [...data.slice(0, mid), ...data.slice(mid + 1)];
            }
        }
    }

    // If no scope contains the column, return the original data
    return data;
}

/**
 * Manage configuration information of all columns, get column width, column length, set column width, etc.
 */
export class ColumnManager {
    private _columnData: IObjectArrayPrimitiveType<Partial<IColumnData>> = {};

    constructor(
        private readonly _config: IWorksheetData,
        data: IObjectArrayPrimitiveType<Partial<IColumnData>>
    ) {
        if (data === undefined || data === null || getArrayLength(data) === 1) {
            const scopeColumnInfo = this._config.scopeColumnInfo;
            this._columnData = {};
            if (scopeColumnInfo) {
                for (const info of scopeColumnInfo) {
                    this._expandColumnData(info);
                }
            }
        } else {
            this._columnData = data;
        }
    }

    private _expandColumnData(info: IScopeColumnDataInfo) {
        for (let i = info.s; i <= info.e; i++) {
            this._columnData[i] = {
                ...info.d,
            };
        }
    }

    private _removeScopeColumnData(index: number) {
        const scopeColumnInfo = this._config.scopeColumnInfo;
        if (scopeColumnInfo) {
            this._config.scopeColumnInfo = removeScopeDataByCol(scopeColumnInfo, index);
        }
    }

    /**
     * Get width and hidden status of columns in the sheet
     * @deprecated The `getColumnData` method is deprecated.We will provide a group methods like add, remove, move, update.
     * @returns {IObjectArrayPrimitiveType<Partial<IColumnData>>} Column data, including width, hidden status, etc.
     */
    getColumnData(): IObjectArrayPrimitiveType<Partial<IColumnData>> {
        return this._columnData;
    }

    setColumnDataByCol(col: number, dataInfo: Nullable<IColumnData>) {
        if (dataInfo === null || dataInfo === undefined) {
            this.removeColumn(col);
            return;
        }
        const currentColInfo = this.getColumnOrCreate(Number(col));
        Object.assign(currentColInfo, dataInfo);
    }

    insertColumnData(range: IRange, colInfo: IObjectArrayPrimitiveType<IColumnData> | undefined) {
        const columnPrimitive = this.getColumnData();
        const columnWrapper = columnPrimitive;

        const colIndex = range.startColumn;
        const colCount = range.endColumn - range.startColumn + 1;
        const defaultColWidth = this._config.defaultColumnWidth;
        for (let j = colIndex; j < colIndex + colCount; j++) {
            const defaultColInfo = {
                w: defaultColWidth,
                hd: 0,
            };
            if (colInfo) {
                insertMatrixArray(j, colInfo[j - range.startColumn] ?? defaultColInfo, columnWrapper);
            }
        }
    }

    moveColumnData(fromIndex: number, count: number, toIndex: number) {
        const o = this.getColumnData();
        moveMatrixArray(fromIndex, count, toIndex, o);
    }

    getColVisible(colPos: number): boolean {
        const { _columnData } = this;
        const col = _columnData[colPos];
        if (!col) {
            return true;
        }
        return col.hd !== BooleanNumber.TRUE;
    }

    setColVisible(colPos: number, visible: boolean) {
        const columnData = this.getColumnData();
        if (visible) {
            if (columnData[colPos]?.hd === BooleanNumber.FALSE) {
                delete columnData[colPos].hd;
            }
        } else {
            if (columnData[colPos]) {
                columnData[colPos].hd = BooleanNumber.TRUE;
            } else {
                columnData[colPos] = { hd: BooleanNumber.TRUE };
            }
        }
    }

    /**
     * Get the column style
     * @param {number} col Column index
     * @returns {string | Nullable<IStyleData>} Style data, may be undefined
     */
    getColumnStyle(col: number) {
        return this._columnData[col]?.s;
    }

    /**
     * Set the set column  default style
     * @param {number} col Column index
     * @param {string | Nullable<IStyleData>} style Style data
     */
    setColumnStyle(col: number, style: string | Nullable<IStyleData>) {
        const coldData = this.getColumnOrCreate(col);
        coldData.s = style;
    }

    /**
     * Get all hidden columns
     * @param start Start index
     * @param end End index
     * @returns Hidden columns range list
     */
    getHiddenCols(start: number = 0, end: number = this.getSize() - 1): IRange[] {
        const hiddenCols: IRange[] = [];

        let inHiddenRange = false;
        let startColumn = -1;

        for (let i = start; i <= end; i++) {
            const visible = this.getColVisible(i);
            if (inHiddenRange && visible) {
                inHiddenRange = false;
                hiddenCols.push({
                    rangeType: RANGE_TYPE.COLUMN,
                    startColumn,
                    endColumn: i - 1,
                    startRow: 0,
                    endRow: 0,
                });
            } else if (!inHiddenRange && !visible) {
                inHiddenRange = true;
                startColumn = i;
            }
        }

        if (inHiddenRange) {
            hiddenCols.push({
                startRow: 0,
                endRow: 0,
                startColumn,
                endColumn: end,
                rangeType: RANGE_TYPE.COLUMN,
            });
        }

        return hiddenCols;
    }

    /**
     * Get all visible columns
     * @param start Start index
     * @param end End index
     * @returns Visible columns range list
     */
    getVisibleCols(start: number = 0, end: number = this.getSize() - 1): IRange[] {
        const visibleCols: IRange[] = [];

        let inVisibleRange = false;
        let startColumn = -1;

        for (let i = start; i <= end; i++) {
            const visible = this.getColVisible(i);
            if (inVisibleRange && !visible) {
                inVisibleRange = false;
                visibleCols.push({
                    rangeType: RANGE_TYPE.COLUMN,
                    startColumn,
                    endColumn: i - 1,
                    startRow: 0,
                    endRow: 0,
                });
            } else if (!inVisibleRange && visible) {
                inVisibleRange = true;
                startColumn = i;
            }
        }

        if (inVisibleRange) {
            visibleCols.push({
                startRow: 0,
                endRow: 0,
                startColumn,
                endColumn: end,
                rangeType: RANGE_TYPE.COLUMN,
            });
        }

        return visibleCols;
    }

    getColumnDatas(columnPos: number, numColumns: number): IObjectArrayPrimitiveType<Partial<IColumnData>> {
        const columnData: IObjectArrayPrimitiveType<Partial<IColumnData>> = {};
        let index = 0;
        for (let i = columnPos; i < columnPos + numColumns; i++) {
            const data = this.getColumn(i);
            columnData[index] = data ?? {
                w: this._config.defaultColumnWidth,
                hd: BooleanNumber.FALSE,
            };
            index++;
        }
        return columnData;
    }

    /**
     * Get count of column in the sheet
     * @returns {number} count of column
     */
    getSize(): number {
        return getArrayLength(this._columnData) - 1;
    }

    /**
     * Get the width of column
     * @param columnPos column index
     * @returns {number} width of column
     */
    getColumnWidth(columnPos: number): number {
        return this._columnData[columnPos]?.w ?? this._config.defaultColumnWidth;
    }

    /**
     * Set the width of column
     * @param columnPos column index
     * @param width width of column
     */
    setColumnWidth(columnPos: number, width: number) {
        const column = this._columnData[columnPos];

        // To prevent data redundancy, we only set the width when it is different from the default column width.
        if (width === this._config.defaultColumnWidth) {
            if (column) {
                delete column.w;

                if (Object.keys(column).length === 0) {
                    delete this._columnData[columnPos];
                }
            }
        } else {
            this._columnData[columnPos] = column ? { ...column, w: width } : { w: width };
        }
    }

    /**
     * Get given column data
     * @param columnPos column index
     */
    getColumn(columnPos: number): Nullable<Partial<IColumnData>> {
        return this._columnData[columnPos];
    }

    /**
     * Remove column data of given column
     * @param columnPos
     */
    removeColumn(columnPos: number) {
        delete this._columnData[columnPos];
        this._removeScopeColumnData(columnPos);
    }

    removeColumns(start: number, end: number) {
        const colCount = end - start + 1;
        spliceArray(start, colCount, this.getColumnData());
    }

    /**
     * Get given column data or create a column data when it's null
     * This method is used to ensure that the column data should not be null when setting column properties.
     * To prevent data redundancy, if is not setting column properties, you can use `getColumn` method to get column data. don't use this method.
     * @param columnPos column index
     * @returns {Partial<IColumnData>} columnData
     */
    getColumnOrCreate(columnPos: number): Partial<IColumnData> {
        const { _columnData } = this;
        const column = _columnData[columnPos];
        if (column) {
            return column;
        }
        const create = {};
        this._columnData[columnPos] = create;
        return create;
    }

    setCustomMetadata(index: number, custom: CustomData | undefined) {
        const row = this.getColumn(index);
        if (row) {
            row.custom = custom;
        }
    }

    getCustomMetadata(index: number): CustomData | undefined {
        return this.getColumn(index)?.custom;
    }
}
