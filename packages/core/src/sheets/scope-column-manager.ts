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

import type { IObjectArrayPrimitiveType } from '../shared';
import type { CustomData, IColumnData, IRange, IScopeColumnDataInfo, IWorksheetData } from './typedef';
import { BooleanNumber } from '../types/enum';
import { RANGE_TYPE } from './typedef';

/**
 * ScopeColumnManger is a class that manages the scope of columns in a spreadsheet.
 * It matches the data structure of the <cols> element in the XML representation of a spreadsheet.:
 * <cols>
 *     <col min="1" max="1" width="8.5" style="1" customWidth="1"/>
 *     <col min="2" max="2" width="8" style="2" customWidth="1"/>
 *     <col min="3" max="3" width="27.1333333333333" style="3" customWidth="1"/>
 *     <col min="4" max="5" width="13" style="1" customWidth="1"/>
 *     <col min="6" max="7" width="14.1333333333333" style="1" customWidth="1"/>
 *     <col min="8" max="16" width="14.8833333333333" style="1" customWidth="1"/>
 *     <col min="17" max="16384" width="9" style="4"/>
 * </cols>
 * The data structure is an array of objects, each object represents a column or a range of columns:
 * We define the data structure as follows:
 * 1. s: the start index of the column or range
 * 2. e: the end index of the column or range
 * 3. d: the data of the column or range, which is an object that contains the properties of the column, such as width, style, customWidth, etc.
 * The data structure is sorted by the start index of the column or range.
 */
export class ScopeColumnManger {
    data: IScopeColumnDataInfo[];
    constructor(data: IScopeColumnDataInfo[]) {
        this.data = data;
    }

    /**
     * compare two column data objects to check if they are equal.
     * If the width, hidden status, style, and custom properties are the same, return true.
     * If the style is a string, it is considered as equal if both are the same.
     * @param info1  The first column data object to compare.
     * @param info2  The second column data object to compare.
     * @returns {boolean} Returns true if the two column data objects are equal, otherwise false.
     */
    static isDataEqual(info1: IColumnData, info2: IColumnData): boolean {
        if (info1 === undefined || info2 === undefined) {
            return true;
        }
        if ((info1 === undefined && info2 !== undefined) || (info1 !== undefined && info2 === undefined)) {
            return false;
        }
        // in fact , The hd is boolean number, wo the undefined value is considered as 0 (false). if we support the boolean value, we should check the hd value.
        if (info1.w !== info2.w || info1.hd !== info2.hd) {
            return false;
        }
        if (info1.s !== info2.s && typeof info1.s === 'string' && typeof info2.s === 'string') {
            return false;
        }
        if (info1.custom && info2.custom && JSON.stringify(info1.custom) !== JSON.stringify(info2.custom)) {
            return false;
        }
        return true;
    }

    static formatColumnData(data: IColumnData): IColumnData {
        const formattedData: IColumnData = { ...data };
        if (formattedData.w === undefined) {
            delete formattedData.w; // Remove width if undefined
        }
        if (formattedData.hd === undefined) {
            delete formattedData.hd; // Remove hidden status if undefined
        }
        if (formattedData.s === undefined) {
            delete formattedData.s; // Remove style if undefined
        }
        if (formattedData.custom === undefined) {
            delete formattedData.custom; // Remove custom properties if undefined
        }
        return formattedData;
    }

    static mergeDataToTargetData(target: IColumnData, data: IColumnData): IColumnData {
        const mergedData: IColumnData = { ...target };
        for (const key in data) {
            const val = data[key as keyof IColumnData];
            if (val === undefined || val === null) {
                delete mergedData[key as keyof IColumnData]; // Remove the key if it exists in the target
            } else {
                (mergedData as any)[key] = val; // Add the key from data to mergedData
            }
        }
        return mergedData;
    }

    getScopeDataByCol(col: number): IScopeColumnDataInfo | undefined {
        const index = this._getScopeDataIndexByCol(col);
        if (index !== -1) {
            return this.data[index];
        }

        return undefined;
    }

    private _getScopeDataIndexByCol(col: number): number {
        let left = 0;
        let right = this.data.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midStart = this.data[mid].s;
            const midEnd = this.data[mid].e;

            if (midStart <= col && col <= midEnd) {
                return mid;
            } else if (midEnd < col) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1; // Not found
    }

    // eslint-disable-next-line max-lines-per-function
    addOrUpdateScopeDataByCol(col: number, colData: IColumnData, ignoreMerge = false) {
        // Find the index to insert the new scope data
        let index = this._getScopeDataIndexByCol(col);
        if (index === -1) {
            index = this.data.length; // If not found, append to the end
            this.data.splice(index, 0, {
                s: col,
                e: col,
                d: colData,
            });
            if (!ignoreMerge) {
                this.mergeLeftScopeDataByCol(this.data, index);
            }
            return;
        }

        // If the column already exists, update it
        const existingData = this.data[index];
        if (ScopeColumnManger.isDataEqual(existingData.d, colData)) {
            // If the data is the same, no need to update
            return;
        }
        // If the column is already a single column scope, update the data
        if (existingData.s === col && existingData.e === col) {
            existingData.d = colData;
            if (!ignoreMerge) {
                this.mergeLeftScopeDataByCol(this.data, index);
                this.mergeRightScopeDataByCol(this.data, index);
            }
            return;
        }
        // If the column is part of a range, update the data and adjust the range
        if (existingData.s === col) {
            const mid = {
                s: col,
                e: col,
                d: { ...existingData.d, ...colData },
            };
            const right = {
                s: col + 1,
                e: existingData.e,
                d: existingData.d,
            };
            this.data.splice(index, 1, mid, right);

            if (!ignoreMerge) {
                this.mergeLeftScopeDataByCol(this.data, index);
                this.mergeRightScopeDataByCol(this.data, index + 1);
            }
        }

        if (existingData.e === col) {
            const mid = {
                s: col,
                e: col,
                d: { ...existingData.d, ...colData },
            };
            const left = {
                s: existingData.s,
                e: col - 1,
                d: existingData.d,
            };
            this.data.splice(index, 1, left, mid);

            if (!ignoreMerge) {
                this.mergeLeftScopeDataByCol(this.data, index);
                this.mergeRightScopeDataByCol(this.data, index + 1);
            }
        } else if (existingData.s < col && col < existingData.e) { // If the column is in the middle of a range, split the range and update
            const left = {
                s: existingData.s,
                e: col - 1,
                d: existingData.d,
            };
            const right = {
                s: col + 1,
                e: existingData.e,
                d: existingData.d,
            };
            this.data.splice(index, 1, left, {
                s: col,
                e: col,
                d: colData,
            }, right);
            if (!ignoreMerge) {
                this.mergeLeftScopeDataByCol(this.data, index);
                this.mergeRightScopeDataByCol(this.data, index + 2);
            }
        }
    }

    /**
    /** Uses binary search to find the overlapping range indices for the given start and end.
     */
    private _getOverlappingRangeIndices(start: number, end: number): [number, number] {
        let left = 0;
        let right = this.data.length - 1;
        let from = -1;
        let to = -1;

        // 找第一个 e >= start
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (this.data[mid].e < start) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        from = left;

        left = 0;
        right = this.data.length - 1;
        // 找最后一个 s <= end
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (this.data[mid].s > end) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        to = right;

        if (from > to) return [-1, -1];
        return [from, to];
    }

    /**
     * Sets the scope data range from start to end with the provided column data.
     * If there are overlapping ranges, it merges them accordingly.
     *
     * @param start - The starting index of the range.
     * @param end - The ending index of the range.
     * @param colData - The column data to be set for the range.
     */
    // eslint-disable-next-line complexity, max-lines-per-function
    setScopeDataRange(start: number, end: number, colData: IColumnData) {
        const result: IScopeColumnDataInfo[] = [];
        const [from, to] = this._getOverlappingRangeIndices(start, end);

        const formattedColData = ScopeColumnManger.formatColumnData(colData);
        const isEmptyFormattedColData = Object.keys(formattedColData).length === 0;

        // If no overlapping ranges, just add the new range
        if (from === -1 && to === -1) {
            const first = this.data[0];
            // add before
            if (first && first.s > start && !isEmptyFormattedColData) {
                // If the first range starts after the new range, insert the new range at the beginning
                this.data.unshift({ s: start, e: end, d: formattedColData });
            } else {
                // Otherwise, append the new range to the end
                if (!isEmptyFormattedColData) {
                    this.data.push({ s: start, e: end, d: formattedColData });
                }
            }
            return;
        }

        // copy the part before the overlapping range
        for (let i = 0; i < (from === -1 ? this.data.length : from); i++) {
            result.push(this.data[i]);
        }

        // split the overlapping ranges
        for (let i = from; i <= to; i++) {
            const item = this.data[i];
            const intersect = this.getIntersect(item.s, item.e, start, end);
            if (intersect) {
                const [intersectStart, intersectEnd] = intersect;
                // If the intersection is the same as the existing range, update the data
                if (intersectStart === item.s && intersectEnd === item.e) {
                    const mergedData = ScopeColumnManger.mergeDataToTargetData(item.d, colData);
                    if (Object.keys(mergedData).length !== 0) {
                        result.push({ s: item.s, e: item.e, d: mergedData });
                    }
                } else {
                    // Split the existing range into two parts
                    if (intersectStart > item.s) {
                        result.push({ s: item.s, e: intersectStart - 1, d: item.d });
                    }
                    const mergedData = ScopeColumnManger.mergeDataToTargetData(item.d, colData);
                    if (Object.keys(mergedData).length !== 0) {
                        result.push({ s: intersectStart, e: intersectEnd, d: mergedData });
                    }
                    if (intersectEnd < item.e) {
                        result.push({ s: intersectEnd + 1, e: item.e, d: item.d });
                    }
                }
            }
        }

        // add the blank area between the new range and the existing ranges
        let cur = start;
        for (const item of result) {
            if (item.s > cur && !isEmptyFormattedColData) {
                result.push({ s: cur, e: item.s - 1, d: formattedColData });
            }
            cur = Math.max(cur, item.e + 1);
        }
        if (cur <= end && cur > start && !isEmptyFormattedColData) {
            result.push({ s: cur, e: end, d: formattedColData });
        }

        // copy the part after the overlapping range
        for (let i = (to === -1 ? 0 : to + 1); i < this.data.length; i++) {
            result.push(this.data[i]);
        }

        result.sort((a, b) => a.s - b.s);
        const mergedResult: IScopeColumnDataInfo[] = [];
        for (const item of result) {
            const lastItem = mergedResult[mergedResult.length - 1];
            if (lastItem && lastItem.e + 1 === item.s && ScopeColumnManger.isDataEqual(lastItem.d, item.d)) {
                lastItem.e = item.e; // 合并区间
            } else {
                mergedResult.push(item);
            }
        }

        this.data = mergedResult;
    }

    getIntersect(start1: number, end1: number, start2: number, end2: number): [number, number] | null {
        // Check if the two ranges [start1, end1] and [start2, end2] intersect
        const start = Math.max(start1, start2);
        const end = Math.min(end1, end2);

        if (start <= end) {
            return [start, end]; // Return the intersection range
        }
        return null; // No intersection
    }

    deleteScopeDataByCol(col: number) {
        const index = this._getScopeDataIndexByCol(col);
        if (index === -1) return [-1, -1]; // If the column is not found, return [-1, -1]

        const left = this.data.slice(0, index);
        const right = this.data.slice(index + 1);
        const target = this.data[index];

        // if the start equal to end, it means the target is a single column scope,so we can remove it directly
        if (target.s === target.e && target.s === col) {
            this.data = [...left, ...right];
        } else if (target.s === col) { // If col matches the start of the range, adjust the start
            this.data = [...left, { ...target, s: col + 1 }, ...right];
        } else if (target.e === col) { // If col matches the end of the range, adjust the end
            this.data = [...left, { ...target, e: col - 1 }, ...right];
        } else if (target.s < col && col < target.e) {
            // If col is in the middle of the range, split into two parts
            const splitList = [
                { ...target, e: col - 1 },
                { ...target, s: col + 1 },
            ];
            this.data = [...left, ...splitList, ...right];
        }
    }

    insertColumns(start: number, end: number, info: IColumnData) {
        if (this.data.length === 0) {
            // If there is no existing data, simply add the new range
            this.data.push({ s: start, e: end, d: info });
            return;
        }

        const colLength = end - start + 1;

        for (let i = this.data.length - 1; i >= 0; i--) {
            const item = this.data[i];

            if (item.s > start) {
                item.s += colLength;
                item.e += colLength;
                continue;
            }
            if (item.s < start && item.e >= start) {
                // If the item starts before the new range and ends after it, adjust the end

                const rightItem = { s: start + colLength, e: item.e + colLength, d: { ...item.d } };
                // reset the start to end
                item.e = start - 1;
                this.data.splice(i + 1, 0, rightItem);
                continue;
            }
        }

        // Add the new range if it doesn't overlap with any existing items
        const newRange = { s: start, e: end, d: info };
        this.data.push(newRange);

        // Sort the data by the start index
        this.data.sort((a, b) => a.s - b.s);

        // Merge adjacent ranges with the same data after adjustments
        const mergedResult: IScopeColumnDataInfo[] = [];
        for (const item of this.data) {
            const lastItem = mergedResult[mergedResult.length - 1];
            if (lastItem && lastItem.e + 1 === item.s && ScopeColumnManger.isDataEqual(lastItem.d, item.d)) {
                lastItem.e = item.e; // Merge ranges
            } else {
                mergedResult.push(item);
            }
        }

        this.data = mergedResult;
    }

    removeColumns(start: number, end: number) {
        if (this.data.length === 0) {
            return;
        }

        const colLength = end - start + 1;

        for (let i = this.data.length - 1; i >= 0; i--) {
            const item = this.data[i];

            // Case 4: If the range is entirely to the right of the item, no changes are needed
            // -------------item.s --------item.e--------------------------------
            // ------------------------------------start-------------------end---
            if (item.e < start) {
                continue;
            }

            // Case 1: If the range is entirely to the left of the item, adjust the item's indices
            // -------------start----------end-----------------------------------------------
            // ------------------------------------item.s -------------------------item.e----
            if (item.s > end) {
                item.s -= colLength;
                item.e -= colLength;
                continue;
            }

            // Case 3: If the range completely contains the item, remove the item
            // -------------start-----------------------------end-------------
            // ---------------------item.s --------item.e---------------------
            if (item.s >= start && item.e <= end) {
                this.data.splice(i, 1);
                continue;
            }

            // Case 2: If the range partially overlaps the item, adjust the item's indices
            // -------------item.s ----------------------------------item.e---------------
            // -----------------------start-------------------end-------------------------
            if (item.s < start && item.e > end) {
                const leftPart = { s: item.s, e: start - 1, d: item.d };
                const rightPart = { s: end + 1 - colLength, e: item.e - colLength, d: item.d };
                this.data.splice(i, 1, leftPart, rightPart);
                continue;
            }

            // Adjust the end of the item if it partially overlaps the start of the range
            // -------------item.s ----------------------------------item.e---------------
            // ------------------------------------------start-------------------end------
            if (item.s < start && item.e >= start) {
                item.e = start - 1;
                continue;
            }

            // Adjust the start of the item if it partially overlaps the end of the range
            // ----------------item.s ----------------------------------item.e------------
            //------start-------------------end-------------------------------------------
            if (item.s < start && item.s <= end && item.e > end) {
                item.e = end - 1;
                continue;
            }

            if (item.s <= end && item.e > end) {
                item.s = end + 1 - colLength;
                item.e = item.e - colLength;
                continue;
            }
        }

        // Merge adjacent ranges with the same data after adjustments
        const mergedResult: IScopeColumnDataInfo[] = [];
        for (const item of this.data) {
            const lastItem = mergedResult[mergedResult.length - 1];
            if (lastItem && lastItem.e + 1 === item.s && ScopeColumnManger.isDataEqual(lastItem.d, item.d)) {
                lastItem.e = item.e; // Merge ranges
            } else {
                mergedResult.push(item);
            }
        }

        this.data = mergedResult;
    }

    mergeLeftScopeDataByCol(data: IScopeColumnDataInfo[], col: number): number {
        if (data.length < 2) return -1; // No need to merge if there are less than two elements

        const lastIndex = data.length - 1;
        const lastItem = data[col];
        const prevItem = data[col - 1];

        if (prevItem === undefined || lastItem === undefined) {
            return -1; // If there is no previous item or last item, return the current column index
        }

        if (prevItem.e + 1 === lastItem.s && ScopeColumnManger.isDataEqual(prevItem.d, lastItem.d)) {
            // Merge the previous and last items
            prevItem.e = lastItem.e;
            data.splice(lastIndex, 1); // Remove the last item after merging

            // Recursively check if the merged item can be merged further
            return this.mergeLeftScopeDataByCol(data, col - 1);
        }
        return col;
    }

    mergeRightScopeDataByCol(data: IScopeColumnDataInfo[], col: number): number {
        if (data.length < 2) return -1; // No need to merge if there are less than two elements

        const firstItem = data[0];
        const secondItem = data[1];

        if (firstItem.e + 1 === secondItem.s && ScopeColumnManger.isDataEqual(firstItem.d, secondItem.d)) {
            // Merge the first and second items
            firstItem.e = secondItem.e;
            data.splice(1, 1); // Remove the second item after merging

            // Recursively check if the merged item can be merged further
            return this.mergeRightScopeDataByCol(data, col + 1);
        }
        return col;
    }
}

export class ColumnManager extends ScopeColumnManger {
    constructor(private readonly _config: IWorksheetData, data: IScopeColumnDataInfo[]) {
        super(data);
    }

    /**
     * Get the object column data like old version. This func only use for test case.
     */
    getColumnData(): IObjectArrayPrimitiveType<Partial<IColumnData>> {
        const scopeData: IObjectArrayPrimitiveType<Partial<IColumnData>> = {};
        for (const item of this.data) {
            for (let i = item.s; i <= item.e; i++) {
                scopeData[i] = ScopeColumnManger.formatColumnData(item.d);
            }
        }
        return scopeData;
    }

    getDefaultColumnWidth() {
        return this._config.defaultColumnWidth;
    }

    insertColumnData(range: IRange, colInfo: IObjectArrayPrimitiveType<IColumnData> | undefined) {
        this.insertColumns(range.startColumn, range.endColumn, colInfo ? colInfo[0] : {});
    }

    moveColumnData(fromIndex: number, count: number, toIndex: number) {
        // todo: mcc
    }

    getColVisible(colPos: number): boolean {
        const data = this.getScopeDataByCol(colPos);
        if (!data) {
            return true; // If no data found, consider the column visible
        }
        return data.d.hd !== BooleanNumber.TRUE;
    }

    getColumnStyle(col: number) {
        const data = this.getScopeDataByCol(col);
        return data?.s;
    }

    setColumnStyle(col: number, style: string) {
        this.setScopeDataRange(col, col, { s: style });
    }

    getHiddenCols(start: number = 0, end: number = this.getSize() - 1): IRange[] {
        const hiddenCols: IRange[] = [];
        for (const item of this.data) {
            if (item.s > end || item.e < start) {
                continue;
            }
            if (item.d?.hd === BooleanNumber.TRUE) {
                const intersect = this.getIntersect(item.s, item.e, start, end);
                if (intersect) {
                    const [intersectStart, intersectEnd] = intersect;
                    hiddenCols.push({
                        rangeType: RANGE_TYPE.COLUMN,
                        startRow: 0, // Assuming no row information is needed
                        endRow: 0, // Assuming no row information is needed
                        startColumn: intersectStart,
                        endColumn: intersectEnd,
                    });
                }
            }
        }

        return hiddenCols;
    }

    getVisibleCols(start: number = 0, end: number = this.getSize() - 1): IRange[] {
        const visibleCols: IRange[] = [];

        for (const item of this.data) {
            if (item.s > end || item.e < start) {
                continue;
            }
            if (item.d?.hd !== BooleanNumber.TRUE) {
                const intersect = this.getIntersect(item.s, item.e, start, end);
                if (intersect) {
                    const [intersectStart, intersectEnd] = intersect;
                    visibleCols.push({
                        rangeType: RANGE_TYPE.COLUMN,
                        startRow: 0, // Assuming no row information is needed
                        endRow: 0, // Assuming no row information is needed
                        startColumn: intersectStart,
                        endColumn: intersectEnd,
                    });
                }
            }
        }
        return visibleCols;
    }

    getSize(): number {
        if (this.data.length === 0) {
            return 0; // If no data, size is 0
        }
        const lastItem = this.data[this.data.length - 1];
        return lastItem.e + 1; // Size is the end index of the last item + 1
    }

    getColumnWidth(col: number): number {
        const data = this.getScopeDataByCol(col);
        return data?.d.w || this.getDefaultColumnWidth();
    }

    setColumnWidth(col: number, width: number) {
        const realWidth = width === this.getDefaultColumnWidth() ? undefined : width;
        this.setScopeDataRange(col, col, { w: realWidth });
    }

    getColumn(columnPos: number) {
        const data = this.getScopeDataByCol(columnPos);
        return data?.d;
    }

    override removeColumns(start: number, end: number): void {
        super.removeColumns(start, end);
    }

    removeColumn(columnPos: number) {
        this.removeColumns(columnPos, columnPos);
    }

    setCustomMetadata(index: number, custom: CustomData | undefined) {
        const data = this.getScopeDataByCol(index);
        if (data) {
            data.d.custom = custom;
        } else {
            this.setScopeDataRange(index, index, { custom });
        }
    }

    getCustomMetadata(index: number): CustomData | undefined {
        const data = this.getScopeDataByCol(index);
        return data?.d.custom;
    }
}

/**
 * This function is used to convert the column data to scope column data info.
 * @param colDatas The key value pair of column data, where the key is the column index and the value is the column data.
 * @returns {IScopeColumnDataInfo[]} scopeColumnData
 * @example
 * ```typescript
 * const colDatas = {
 *   0: { w: 100, hd: 0, s: 'A' },
 *   1: { w: 200, hd: 0, s: 'B' },
 *   2: { w: 300, hd: 0, s: 'C' },
 * };
 * const scopeColumnData = transColumnDataToScopeColumnDataInfo(colDatas);
 * // scopeColumnData will be:
 * // [
 * //   { s: 0, e: 0, d: { w: 100, hd: 0, s: 'A' } },
 * //   { s: 1, e: 1, d: { w: 200, hd: 0, s: 'B' } },
 * //   { s: 2, e: 2, d: { w: 300, hd: 0, s: 'C' } },
 * // ]
 *
 * const colDataCanMerge = {
 *   0: { w: 100, hd: 0, s: 'A' },
 *   1: { w: 100, hd: 0, s: 'A' },
 *   2: { w: 300, hd: 0, s: 'A' },
 *   3: { w: 400, hd: 0, s: 'B' },
 *   4: { w: 400, hd: 0, s: 'B' },
 * };
 * const scopeColumnDataCanMerge = transColumnDataToScopeColumnDataInfo(colDataCanMerge);
 * // scopeColumnDataCanMerge will be:
 * // [
 * //   { s: 0, e: 1, d: { w: 100, hd: 0, s: 'A' } },
 * //   { s: 2, e: 2, d: { w: 300, hd: 0, s: 'A' } },
 * //   { s: 3, e: 4, d: { w: 400, hd: 0, s: 'B' } },
 * // ]
 * ```
 */
export function transColumnDataToScopeColumnDataInfo(
    colDatas: IObjectArrayPrimitiveType<Partial<IColumnData>>
): IScopeColumnDataInfo[] {
    const scopeColumnData: IScopeColumnDataInfo[] = [];
    // by default, all keys are number like string, it will be sorted in V8 engine, so we no need sort
    const cols = Object.keys(colDatas);
    for (const col of cols) {
        const colIndex = Number.parseInt(col, 10);
        const colData = colDatas[colIndex] as IColumnData;

        if (colData) {
            scopeColumnData.push({
                s: colIndex,
                e: colIndex,
                d: ScopeColumnManger.formatColumnData(colData),
            });
        }
    }
    for (let i = scopeColumnData.length - 1; i > 0; i--) {
        const current = scopeColumnData[i];
        const prev = scopeColumnData[i - 1];

        if (prev.e + 1 === current.s && ScopeColumnManger.isDataEqual(prev.d, current.d)) {
            // Merge the previous and current items
            prev.e = current.e;
            scopeColumnData.splice(i, 1); // Remove the current item after merging
        }
    }
    return scopeColumnData;
}
