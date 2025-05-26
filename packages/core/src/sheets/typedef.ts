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

import type { IResources } from '../services/resource-manager/type';
import type { IObjectArrayPrimitiveType, IObjectMatrixPrimitiveType, Nullable } from '../shared';
import type { BooleanNumber } from '../types/enum';
import type { LocaleType } from '../types/enum/locale-type';
import type { IDocumentData } from '../types/interfaces';
import type { ICellCustomRender } from '../types/interfaces/i-cell-custom-render';
import type { IStyleData } from '../types/interfaces/i-style-data';
import { CellValueType } from '../types/enum';

/**
 * Snapshot of a workbook.
 */
export interface IWorkbookData {
    /**
     * Id of the Univer Sheet.
     */
    id: string;

    /**
     * Revision of this spreadsheet. Used in collaborated editing. Starts from one.
     * @ignore
     */
    rev?: number;

    /**
     * Name of the Univer Sheet.
     */
    name: string;

    /**
     * Version of Univer model definition.
     */
    appVersion: string;

    /**
     * Locale of the document.
     */
    locale: LocaleType;

    /**
     * Style references.
     */
    styles: Record<string, Nullable<IStyleData>>;

    /** Ids of {@link IWorksheetData}s of this Univer Sheet in sequence order. */
    sheetOrder: string[];

    /**
     * Data of each {@link IWorksheetData} in this Univer Sheet.
     */
    sheets: { [sheetId: string]: Partial<IWorksheetData> };

    /**
     * @property {string|Nullable<IStyleData>} [defaultStyle] - Default style id or style data of Workbook.
     */
    defaultStyle?: Nullable<IStyleData> | string;

    /**
     * Resources of the Univer Sheet. It is used to store the data of other plugins.
     */
    resources?: IResources;

    /**
     * User stored custom fields
     */
    custom?: CustomData;
}

/**
 * Snapshot of a worksheet.
 */
export interface IWorksheetData {
    /**
     * Id of the worksheet. This should be unique and immutable across the lifecycle of the worksheet.
     */
    id: string;

    /** Name of the sheet. */
    name: string;

    tabColor: string;

    /**
     * Determine whether the sheet is hidden.
     *
     * @remarks
     * See {@link BooleanNumber| the BooleanNumber enum} for more details.
     *
     * @defaultValue `BooleanNumber.FALSE`
     */
    hidden: BooleanNumber;

    freeze: IFreeze;

    rowCount: number;
    columnCount: number;
    /** @deprecated */
    zoomRatio: number;
    /** @deprecated */
    scrollTop: number;
    /** @deprecated */
    scrollLeft: number;
    defaultColumnWidth: number;
    defaultRowHeight: number;

    /** All merged cells in this worksheet. */
    mergeData: IRange[];

    /** A matrix storing cell contents by row and column index. */
    cellData: IObjectMatrixPrimitiveType<ICellData>;
    rowData: IObjectArrayPrimitiveType<Partial<IRowData>>;
    columnData: IObjectArrayPrimitiveType<Partial<IColumnData>>;

    /**
     * @property {string|Nullable<IStyleData>} [defaultStyle] - Default style id or style data of Worksheet.
     */
    defaultStyle?: Nullable<IStyleData> | string;

    rowHeader: {
        width: number;
        hidden?: BooleanNumber;
    };

    columnHeader: {
        height: number;
        hidden?: BooleanNumber;
    };

    showGridlines: BooleanNumber;
    /**
     * Color of the gridlines.
     */
    gridlinesColor?: string;

    rightToLeft: BooleanNumber;

    /**
     * User stored custom fields
     */
    custom?: CustomData;
}

export type CustomData = Nullable<Record<string, any>>;

/**
 * Properties of row data
 */
export interface IRowData {
    /**
     * height in pixel
     */
    h?: number;

    /**
     * is current row self-adaptive to its content, use `ah` to set row height when true, else use `h`.
     */
    ia?: BooleanNumber; // pre name `isAutoHeight`

    /**
     * auto height
     */
    ah?: number;

    /**
     * hidden
     */
    hd?: BooleanNumber;

    /**
     * style id
     */
    s?: Nullable<IStyleData | string>;

    /**
     * User stored custom fields
     */
    custom?: CustomData;
}

export interface IRowAutoHeightInfo {
    row: number;
    autoHeight?: number;
}

/**
 * Properties of column data
 */
export interface IColumnData {
    /**
     * width
     */
    w?: number;

    /**
     * hidden
     */
    hd?: BooleanNumber;

    /**
     * style id
     */
    s?: Nullable<IStyleData | string>;

    /**
     * User stored custom fields
     */
    custom?: CustomData;
}

export interface IColAutoWidthInfo {
    col: number;
    width?: number;
}

/**
 * Cell value type
 */
export type CellValue = string | number | boolean;

/**
 * Cell data
 */
export interface ICellData {
    /**
     * The unique key, a random string, is used for the plug-in to associate the cell. When the cell information changes,
     * the plug-in does not need to change the data, reducing the pressure on the back-end interface id?: string.
     */
    p?: Nullable<IDocumentData>; // univer docs, set null for cell clear all

    /** style id */
    s?: Nullable<IStyleData | string>;

    /**
     * Origin value
     */
    v?: Nullable<CellValue>;

    // Usually the type is automatically determined based on the data, or the user directly specifies
    t?: Nullable<CellValueType>; // 1 string, 2 number, 3 boolean, 4 force string, green icon, set null for cell clear all

    /**
     * Raw formula string. For example `=SUM(A1:B4)`.
     */
    f?: Nullable<string>;

    /**
     * Id of the formula.
     */
    si?: Nullable<string>;

    /**
     * User stored custom fields
     */
    custom?: CustomData;
}

export interface ICellMarksStyle {
    color: string;
    size: number;
}

export interface ICellMarks {
    tl?: ICellMarksStyle;
    tr?: ICellMarksStyle;
    bl?: ICellMarksStyle;
    br?: ICellMarksStyle;
    isSkip?: boolean;
}

export interface IFontRenderExtension {
    leftOffset?: number;
    rightOffset?: number;
    topOffset?: number;
    downOffset?: number;
    isSkip?: boolean;
}

// TODO@weird94: should be moved outside of the core package
export interface ICellDataForSheetInterceptor extends ICellData {
    interceptorStyle?: Nullable<IStyleData>;
    isInArrayFormulaRange?: Nullable<boolean>;
    markers?: ICellMarks;
    customRender?: Nullable<ICellCustomRender[]>;
    interceptorAutoHeight?: () => number | undefined;
    interceptorAutoWidth?: () => number | undefined;
    /**
     * can cell be covered when sibling is overflow
     */
    coverable?: boolean;
    linkUrl?: string;
    linkId?: string;
    fontRenderExtension?: IFontRenderExtension;
    // use for save the theme style, it  can not be composed directly
    themeStyle?: Nullable<IStyleData>;

}

export function isICellData(value: any): value is ICellData {
    return (
        value &&
        ((value as ICellData).s !== undefined ||
            (value as ICellData).p !== undefined ||
            (value as ICellData).v !== undefined ||
            (value as ICellData).t !== undefined ||
            (value as ICellData).f !== undefined ||
            (value as ICellData).si !== undefined ||
            (value as ICellData).custom !== undefined)
    );
}

export function getCellValueType(cell: ICellData) {
    if (cell.t !== undefined) {
        return cell.t;
    }
    if (typeof cell.v === 'string') {
        return CellValueType.STRING;
    }
    if (typeof cell.v === 'number') {
        return CellValueType.NUMBER;
    }
    if (typeof cell.v === 'boolean') {
        return CellValueType.BOOLEAN;
    }
}

export function isNullCell(cell: Nullable<ICellData>) {
    if (cell == null) {
        return true;
    }

    const { v, f, si, p, custom } = cell;

    if (!(v == null || (typeof v === 'string' && v.length === 0))) {
        return false;
    }

    if ((f != null && f.length > 0) || (si != null && si.length > 0)) {
        return false;
    }

    if (p != null) {
        return false;
    }

    if (custom != null) {
        return false;
    }

    return true;
}

export function isCellV(cell: Nullable<ICellData | CellValue>) {
    return cell != null && (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean');
}

export interface IFreeze {
    /**
     * count of fixed cols
     */
    xSplit: number;
    /**
     * count of fixed rows
     */
    ySplit: number;
    /**
     * scrollable start row(viewMain start row)
     */
    startRow: number;

    /**
     * scrollable start column(viewMain start column)
     */
    startColumn: number;
}

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

interface IRangeLocation {
    /**
     * Id of the Workbook the range belongs to.
     * When this field is not defined, it should be considered as the range in the currently activated worksheet.
     */
    unitId?: string;

    /**
     * Id of the Worksheet the range belongs to.
     * When this field is not defined, it should be considered as the range in the currently activated worksheet.
     */
    sheetId?: string;
}

export interface IRowRange extends IRangeLocation {
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

export interface IColumnRange extends IRangeLocation {
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
export interface IRange extends IRowRange, IColumnRange {
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

/**
 * Whether to clear only the contents. Whether to clear only the format; note that clearing format also clears data validation rules.
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
export interface ICopyToOptionsData extends IOptionData { }

export interface IRectLTRB {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width?: number;
    height?: number;
}

/**
 * Properties of selection data
 */
export interface IPosition {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface ISingleCell {
    actualRow: number;
    actualColumn: number;
    isMerged: boolean;
    isMergedMainCell: boolean;
}

export interface IRangeWithCoord extends IPosition, IRange { }

/**
 * @deprecated use ICellWithCoord instead.
 */
export interface ISelectionCellWithMergeInfo extends IPosition, ISingleCell {
    mergeInfo: IRangeWithCoord; // merge cell, start and end is upper left cell
}

/**
 * SingleCell & coordinate and mergeRange.
 */
// Original name: ISelectionCellWithMergeInfo
export interface ICellWithCoord extends IPosition, ISingleCell {
    mergeInfo: IRangeWithCoord; // merge cell, start and end is upper left cell

    /**
     * Coordinate of the single cell(actual row and column).
     */
    startX: number;
    /**
     * Coordinate of the single cell(actual row and column).
     */
    startY: number;
    /**
     * Coordinate of the single cell(actual row and column).
     */
    endX: number;
    /**
     * Coordinate of the single cell(actual row and column).
     */
    endY: number;

    // part of singleCell
    /**
     * The raw row index calculated by the offsetX (Without considering merged cells, this value is simply the row index.If there are merged cells, this value refers to the cell where the mouse was clicked.)
     */
    actualRow: number;

    /**
     * The raw col index calculated by the offsetX (Without considering merged cells)
     */
    actualColumn: number;
    /**
     * Whether the cell is merged. But main merged cell is false.
     */
    isMerged: boolean;
    /**
     * if Merged and is main merged cell.
     */
    isMergedMainCell: boolean;
}

/**
 * Range & SingleCell & isMerged.
 * startRow: number;
 * startColumn: number;
 * endRow: number;
 * endColumn: number;
 *
 * actualRow: number;
 * actualColumn: number;
 * isMerged: boolean;
 * isMergedMainCell: boolean;
 */
export interface ISelectionCell extends IRange, ISingleCell { }

/**
 * ICellInfo has the same properties as ISelectionCell, but the name ICellInfo might be more semantically appropriate in some contexts.
 */
export interface ICellInfo extends ISelectionCell { }

export interface ISelection {
    /**
     * Sheet selection range.
     */
    range: IRange;

    /**
     * The highlighted cell in the selection range. If there are several selections, only one selection would have a primary cell.
     *
     * This cell range should consider the merged cells.
     */
    primary: Nullable<ISelectionCell>;
}
export interface ITextRangeStart {
    startOffset: number;
}

export enum RANGE_DIRECTION {
    NONE = 'none',
    BACKWARD = 'backward',
    FORWARD = 'forward',
}

export interface ITextRange extends ITextRangeStart {
    endOffset: number;
    collapsed: boolean;
    direction?: RANGE_DIRECTION;
}

export enum DOC_RANGE_TYPE {
    RECT = 'RECT',
    TEXT = 'TEXT',
}

export interface ITextRangeParam extends ITextRange {
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
    segmentPage?: number; //The page number of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
    isActive?: boolean; // Whether the text range is active or current range.
    rangeType?: DOC_RANGE_TYPE;
}

/**
 * Determines whether the cell(row, column) is within the range of the merged cells.
 * @deprecated please use worksheet.getCellInfoInMergeData instead
 */
export function getCellInfoInMergeData(row: number, column: number, mergeData?: IRange[]): ISelectionCell {
    let isMerged = false; // The upper left cell only renders the content
    let isMergedMainCell = false;
    let newEndRow = row;
    let newEndColumn = column;
    let mergeRow = row;
    let mergeColumn = column;

    if (mergeData == null) {
        return {
            actualRow: row,
            actualColumn: column,
            isMergedMainCell,
            isMerged,
            endRow: newEndRow,
            endColumn: newEndColumn,
            startRow: mergeRow,
            startColumn: mergeColumn,
        };
    }

    for (let i = 0; i < mergeData.length; i++) {
        const {
            startRow: startRowMarge,
            endRow: endRowMarge,
            startColumn: startColumnMarge,
            endColumn: endColumnMarge,
        } = mergeData[i];
        if (row === startRowMarge && column === startColumnMarge) {
            newEndRow = endRowMarge;
            newEndColumn = endColumnMarge;
            mergeRow = startRowMarge;
            mergeColumn = startColumnMarge;

            isMergedMainCell = true;
            break;
        }
        if (row >= startRowMarge && row <= endRowMarge && column >= startColumnMarge && column <= endColumnMarge) {
            newEndRow = endRowMarge;
            newEndColumn = endColumnMarge;
            mergeRow = startRowMarge;
            mergeColumn = startColumnMarge;

            isMerged = true;
            break;
        }
    }

    return {
        actualRow: row,
        actualColumn: column,
        isMergedMainCell,
        isMerged,
        endRow: newEndRow,
        endColumn: newEndColumn,
        startRow: mergeRow,
        startColumn: mergeColumn,
    };
}

export type ICellDataWithSpanAndDisplay = ICellData & { rowSpan?: number; colSpan?: number; displayV?: string };

export enum CellModeEnum {
    Raw = 'raw',
    Intercepted = 'intercepted',
    Both = 'both',
}
