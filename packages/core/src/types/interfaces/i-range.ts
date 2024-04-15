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

export enum RANGE_TYPE {
    NORMAL,
    ROW,
    COLUMN,
    ALL,
}

/**
 * none: A1
 * row: A$1
 * column: $A1
 * all: $A$1
 */
export enum AbsoluteRefType {
    NONE,
    ROW,
    COLUMN,
    ALL,
}

export interface IRowRange {
    /**
     * The start row (inclusive) of the range
     * startRow
     */
    startRow: number;

    /**
     * The end row (exclusive) of the range
     * endRow
     */
    endRow: number;
}

/**
 * Range data structure
 *
 * One of the range types,
 *
 * e.g.,
 * {
 *    startRow:0 ,
 *    startColumn:0,
 *    endRow:1,
 *    endColumn:1,
 * }
 *
 * means "A1:B2"
 */
export interface IRange extends IRowRange {
    /**
     * The start column (inclusive) of the range
     * startColumn
     */
    startColumn: number;

    /**
     * The end column (exclusive) of the range
     * endColumn
     */
    endColumn: number;

    rangeType?: RANGE_TYPE;

    startAbsoluteRefType?: AbsoluteRefType;

    endAbsoluteRefType?: AbsoluteRefType;
}

/**
 * Transform an `IRange` object to an array.
 * @param range
 * @returns [rowStart, colStart, rowEnd, colEnd]
 */
export function selectionToArray(range: IRange): [number, number, number, number] {
    return [range.startRow, range.startColumn, range.endRow, range.endColumn];
}

/**
 * Range data of grid
 */
export interface IGridRange {
    sheetId: string;
    range: IRange;
}

export interface IUnitRangeName {
    unitId: string;
    sheetName: string;
    range: IRange;
}

/**
 * Range data of Unit
 */
export interface IUnitRange extends IGridRange {
    unitId: string;
}

export interface IUnitRangeWithName extends IUnitRange {
    sheetName: string;
}

/**
 * One of the range types,
 *
 * e.g.,"A1:B2","sheet1!A1:B2","A1","1:1","A:A","AA1:BB2"
 */
export type IRangeStringData = string;

/**
 * Row data type
 */
export type IRowStartEndData = [startRow: number, endRow: number] | number[];

/**
 * Column data type
 */
export type IColumnStartEndData = [startColumn: number, endColumn: number] | number[];

/**
 * One of the range types,
 *
 * e.g.,
 * {
 *  row:[0,1],
 *  column:[0,1]
 * }
 *todo

 true false 枚举
 * means "A1:B2"
 */
export interface IRangeArrayData {
    /**
     * row
     */
    row: IRowStartEndData;
    /**
     * column
     */
    column: IColumnStartEndData;
}

/**
 * The row and column numbers represent a cell
 */
export interface IRangeCellData {
    /**
     * row
     */
    row: number;
    /**
     * column
     */
    column: number;
}

/**
 * range types
 *
 * Allow users to provide one of three formats, we need to convert to IRange to store
 */
export type IRangeType = IRange | IRangeStringData | IRangeArrayData | IRangeCellData;

// export interface IInfoObjData extends IRangeArrayData {
//     sheetId?: Nullable<string>;
// }

// export function isIRangeType(range: IRangeType | IRangeType[]) {
//     return typeof range === 'string' || 'startRow' in range || 'row' in range;
// }
// export function isIRangeData(range: IRangeType | IRangeType[]) {
//     return typeof range !== 'string' && 'startRow' in range;
// }
// export function isIRangeStringData(range: IRangeType | IRangeType[]) {
//     return typeof range === 'string';
// }
// export function isIRangeArrayData(range: IRangeType | IRangeType[]) {
//     return typeof range !== 'string' && 'row' in range;
// }

/**
 * Whether to clear only the contents.	Whether to clear only the format; note that clearing format also clears data validation rules.
 */
export interface IOptionData {
    /**
     * 1. designates that only the format should be copied
     *
     * 2. Whether to clear only the format; note that clearing format also clears data validation rules.
     *
     * 3. worksheet Whether to clear the format.
     */
    formatOnly?: boolean;
    /**
     * 1. designates that only the content should be copied
     *
     * 2. Whether to clear only the contents.
     *
     * 3. worksheet Whether to clear the content.
     *
     */
    contentsOnly?: boolean;
}

/**
 * Option of copyTo function
 */
export interface ICopyToOptionsData extends IOptionData {}
