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
export interface IRangeData {
    /**
     * The start row (inclusive) of the range
     * startRow
     */
    startRow: number;
    /**
     * The start column (inclusive) of the range
     * startColumn
     */
    startColumn: number;
    /**
     * The end row (exclusive) of the range
     * endRow
     */
    endRow: number;
    /**
     * The end column (exclusive) of the range
     * endColumn
     */
    endColumn: number;
}

/**
 * Range data of grid
 */
export interface IGridRange {
    sheetId: string;
    rangeData: IRangeData;
}

/**
 * Range data of Unit
 */
export interface IUnitRange extends IGridRange {
    unitId: string;
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
export type IRangeArrayData = {
    /**
     * row
     */
    row: IRowStartEndData;
    /**
     * column
     */
    column: IColumnStartEndData;
};

/**
 * The row and column numbers represent a cell
 */
export type IRangeCellData = {
    /**
     * row
     */
    row: number;
    /**
     * column
     */
    column: number;
};

/**
 * range types
 *
 * Allow users to provide one of three formats, we need to convert to IRangeData to store
 */
export type IRangeType = IRangeData | IRangeStringData | IRangeArrayData | IRangeCellData;

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
    /**
     *  Whether to clear only the comments.
     */
}
