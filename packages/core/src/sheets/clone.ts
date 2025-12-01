// #region Optimized Clone Functions

import { IObjectMatrixPrimitiveType, IObjectArrayPrimitiveType, Nullable } from "../shared";
import { ICellData, ICellDataWithSpanAndDisplay, IColumnData, IRange, IRowData, IWorksheetData } from "./typedef";

/**
 * Fast clone for primitive values and simple objects.
 * Avoids type checking overhead when we know the structure.
 */
export function cloneValue<T>(value: T): T {
    if (value === null || value === undefined) {
        return value;
    }

    const type = typeof value;
    // Primitives are immutable, return directly
    if (type !== 'object') {
        return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
        const len = value.length;
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            result[i] = cloneValue(value[i]);
        }
        return result as T;
    }

    // Handle plain objects
    const result: Record<string, any> = {};
    const keys = Object.keys(value as object);
    for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        result[key] = cloneValue((value as Record<string, any>)[key]);
    }
    return result as T;
}

/**
 * Fast clone for ICellData. Optimized for the known structure.
 * @param cell - The cell data to clone
 * @returns A deep clone of the cell data
 */
export function cloneCellData(cell: Nullable<ICellData>): Nullable<ICellData> {
    if (cell === null || cell === undefined) {
        return cell;
    }

    const result: ICellData = {};

    // p - IDocumentData (complex object, needs deep clone)
    if (cell.p !== undefined) {
        result.p = cell.p === null ? null : cloneValue(cell.p);
    }

    // s - style id (string) or IStyleData (object)
    if (cell.s !== undefined) {
        if (cell.s === null || typeof cell.s === 'string') {
            result.s = cell.s;
        } else {
            result.s = cloneValue(cell.s);
        }
    }

    // v - primitive value (string | number | boolean)
    if (cell.v !== undefined) {
        result.v = cell.v;
    }

    // t - CellValueType (number enum)
    if (cell.t !== undefined) {
        result.t = cell.t;
    }

    // f - formula string
    if (cell.f !== undefined) {
        result.f = cell.f;
    }

    // ref - formula array reference
    if (cell.ref !== undefined) {
        result.ref = cell.ref;
    }

    // xf - Excel formula prefix
    if (cell.xf !== undefined) {
        result.xf = cell.xf;
    }

    // si - formula id
    if (cell.si !== undefined) {
        result.si = cell.si;
    }

    // custom - user stored custom fields
    if (cell.custom !== undefined) {
        result.custom = cell.custom === null ? null : cloneValue(cell.custom);
    }

    return result;
}

/**
 * Fast clone for ICellDataWithSpanAndDisplay. Optimized for the known structure.
 * This extends cloneCellData with additional span and display properties.
 * @param cell - The cell data with span and display info to clone
 * @returns A deep clone of the cell data
 */
export function cloneCellDataWithSpanAndDisplay(cell: Nullable<ICellDataWithSpanAndDisplay>): Nullable<ICellDataWithSpanAndDisplay> {
    if (cell === null || cell === undefined) {
        return cell;
    }

    const result: ICellDataWithSpanAndDisplay = {};

    // p - IDocumentData (complex object, needs deep clone)
    if (cell.p !== undefined) {
        result.p = cell.p === null ? null : cloneValue(cell.p);
    }

    // s - style id (string) or IStyleData (object)
    if (cell.s !== undefined) {
        if (cell.s === null || typeof cell.s === 'string') {
            result.s = cell.s;
        } else {
            result.s = cloneValue(cell.s);
        }
    }

    // v - primitive value (string | number | boolean)
    if (cell.v !== undefined) {
        result.v = cell.v;
    }

    // t - CellValueType (number enum)
    if (cell.t !== undefined) {
        result.t = cell.t;
    }

    // f - formula string
    if (cell.f !== undefined) {
        result.f = cell.f;
    }

    // ref - formula array reference
    if (cell.ref !== undefined) {
        result.ref = cell.ref;
    }

    // xf - Excel formula prefix
    if (cell.xf !== undefined) {
        result.xf = cell.xf;
    }

    // si - formula id
    if (cell.si !== undefined) {
        result.si = cell.si;
    }

    // custom - user stored custom fields
    if (cell.custom !== undefined) {
        result.custom = cell.custom === null ? null : cloneValue(cell.custom);
    }

    // rowSpan - span properties (primitives)
    if (cell.rowSpan !== undefined) {
        result.rowSpan = cell.rowSpan;
    }

    // colSpan - span properties (primitives)
    if (cell.colSpan !== undefined) {
        result.colSpan = cell.colSpan;
    }

    // displayV - display value (primitive string)
    if (cell.displayV !== undefined) {
        result.displayV = cell.displayV;
    }

    return result;
}

/**
 * Fast clone for cell data matrix. Optimized for sparse matrix structure.
 * @param cellData - The cell data matrix to clone
 * @returns A deep clone of the cell data matrix
 */
export function cloneCellDataMatrix(
    cellData: IObjectMatrixPrimitiveType<ICellData>
): IObjectMatrixPrimitiveType<ICellData> {
    const result: IObjectMatrixPrimitiveType<ICellData> = {};
    const rowKeys = Object.keys(cellData);

    for (let i = 0, rowLen = rowKeys.length; i < rowLen; i++) {
        const rowKey = rowKeys[i];
        const rowNum = Number(rowKey);
        const rowData = cellData[rowNum];

        if (rowData === undefined) continue;

        const clonedRow: Record<number, ICellData> = {};
        const colKeys = Object.keys(rowData);

        for (let j = 0, colLen = colKeys.length; j < colLen; j++) {
            const colKey = colKeys[j];
            const colNum = Number(colKey);
            const cell = rowData[colNum];
            if (cell !== undefined && cell !== null) {
                clonedRow[colNum] = cloneCellData(cell) as ICellData;
            }
        }

        result[rowNum] = clonedRow;
    }

    return result;
}

/**
 * Fast clone for row/column data arrays (sparse arrays stored as objects).
 * @param data - The row or column data to clone
 * @returns A deep clone of the row or column data
 */
function cloneRowColumnData<T extends Partial<IRowData> | Partial<IColumnData>>(
    data: IObjectArrayPrimitiveType<T>
): IObjectArrayPrimitiveType<T> {
    const result: IObjectArrayPrimitiveType<T> = {};
    const keys = Object.keys(data);

    for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const idx = Number(key);
        const item = data[idx];

        if (item === undefined) continue;

        const cloned: Record<string, any> = {};

        // Handle common properties
        if ('h' in item && item.h !== undefined) cloned.h = item.h;
        if ('ia' in item && item.ia !== undefined) cloned.ia = item.ia;
        if ('ah' in item && item.ah !== undefined) cloned.ah = item.ah;
        if ('hd' in item && item.hd !== undefined) cloned.hd = item.hd;
        if ('w' in item && item.w !== undefined) cloned.w = item.w;

        // s - style (string or object)
        if ('s' in item && item.s !== undefined) {
            if (item.s === null || typeof item.s === 'string') {
                cloned.s = item.s;
            } else {
                cloned.s = cloneValue(item.s);
            }
        }

        // custom - user stored custom fields
        if ('custom' in item && item.custom !== undefined) {
            cloned.custom = item.custom === null ? null : cloneValue(item.custom);
        }

        result[idx] = cloned as T;
    }

    return result;
}

/**
 * Fast clone for IRange array (merge data).
 * @param ranges - The array of ranges to clone
 * @returns A shallow clone of the ranges (IRange contains only primitive values)
 */
function cloneMergeData(ranges: IRange[]): IRange[] {
    const len = ranges.length;
    const result = new Array<IRange>(len);

    for (let i = 0; i < len; i++) {
        const range = ranges[i];
        // IRange only contains primitive values, shallow copy is sufficient
        result[i] = {
            startRow: range.startRow,
            startColumn: range.startColumn,
            endRow: range.endRow,
            endColumn: range.endColumn,
            rangeType: range.rangeType,
            startAbsoluteRefType: range.startAbsoluteRefType,
            endAbsoluteRefType: range.endAbsoluteRefType,
        };
    }

    return result;
}

/**
 * Optimized deep clone specifically for IWorksheetData.
 * This is significantly faster than generic deepClone because:
 * 1. No recursive type checking - we know the structure
 * 2. Direct property access instead of Object.keys iteration for known properties
 * 3. Specialized handlers for cellData matrix (the largest data)
 * 4. Primitive values copied directly without cloning
 *
 * @param worksheet - The worksheet data to clone
 * @returns A deep clone of the worksheet data
 */
export function cloneWorksheetData(worksheet: IWorksheetData): IWorksheetData {
    const result: IWorksheetData = {
        // Primitive values - direct copy
        id: worksheet.id,
        name: worksheet.name,
        tabColor: worksheet.tabColor,
        hidden: worksheet.hidden,
        rowCount: worksheet.rowCount,
        columnCount: worksheet.columnCount,
        zoomRatio: worksheet.zoomRatio,
        scrollTop: worksheet.scrollTop,
        scrollLeft: worksheet.scrollLeft,
        defaultColumnWidth: worksheet.defaultColumnWidth,
        defaultRowHeight: worksheet.defaultRowHeight,
        showGridlines: worksheet.showGridlines,
        rightToLeft: worksheet.rightToLeft,

        // Freeze - simple object with primitive values
        freeze: {
            xSplit: worksheet.freeze.xSplit,
            ySplit: worksheet.freeze.ySplit,
            startRow: worksheet.freeze.startRow,
            startColumn: worksheet.freeze.startColumn,
        },

        // Row/column headers - simple objects
        rowHeader: {
            width: worksheet.rowHeader.width,
            hidden: worksheet.rowHeader.hidden,
        },
        columnHeader: {
            height: worksheet.columnHeader.height,
            hidden: worksheet.columnHeader.hidden,
        },

        // Merge data - array of IRange (primitives only)
        mergeData: cloneMergeData(worksheet.mergeData),

        // Cell data matrix - the largest data, use optimized clone
        cellData: cloneCellDataMatrix(worksheet.cellData),

        // Row/column data - sparse arrays
        rowData: cloneRowColumnData<Partial<IRowData>>(worksheet.rowData),
        columnData: cloneRowColumnData<Partial<IColumnData>>(worksheet.columnData),
    };

    // Optional properties
    if (worksheet.gridlinesColor !== undefined) {
        result.gridlinesColor = worksheet.gridlinesColor;
    }

    if (worksheet.defaultStyle !== undefined) {
        if (worksheet.defaultStyle === null || typeof worksheet.defaultStyle === 'string') {
            result.defaultStyle = worksheet.defaultStyle;
        } else {
            result.defaultStyle = cloneValue(worksheet.defaultStyle);
        }
    }

    if (worksheet.custom !== undefined) {
        result.custom = worksheet.custom === null ? null : cloneValue(worksheet.custom);
    }

    return result;
}

// #endregion