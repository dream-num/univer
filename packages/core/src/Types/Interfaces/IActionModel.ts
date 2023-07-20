import { ISheetActionData } from '../../Command';
import { ObjectMatrixPrimitiveType, Nullable } from '../../Shared';
import { Dimension, BooleanNumber } from '../Enum';
import { ICellData, ICellV } from './ICellData';
import { INamedRange } from './INamedRange';
import { IRangeData, IOptionData, ICopyToOptionsData } from './IRangeData';
import { IStyleData } from './IStyleData';

/**
 * @internal
 * Format of AddMergeActionData param
 */
export interface IAddMergeActionData extends ISheetActionData {
    rectangles: IRangeData[];
}

export interface IAddNamedRangeActionData extends ISheetActionData {
    namedRange: INamedRange;
}

/**
 * @internal
 */
export interface IClearRangeActionData extends ISheetActionData {
    options: IOptionData;
    rangeData: IRangeData;
}

export interface IDeleteNamedRangeActionData extends ISheetActionData {
    namedRangeId: string;
}

/**
 * @internal
 */
export interface IDeleteRangeActionData extends ISheetActionData {
    shiftDimension: Dimension;
    rangeData: IRangeData;
}

/**
 * @internal
 */
export interface IInsertColumnActionData extends ISheetActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * @internal
 */
export interface IInsertColumnDataActionData extends ISheetActionData {
    columnIndex: number;
    columnData: ObjectMatrixPrimitiveType<ICellData>; // TODO Does it need to be merged with IKeyValue
}

/**
 * @internal
 */
export interface IInsertRangeActionData extends ISheetActionData {
    shiftDimension: Dimension;
    rangeData: IRangeData;
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
}

/**
 * @internal
 */
export interface IInsertRowActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * @internal
 */
export interface IInsertRowDataActionData extends ISheetActionData {
    rowIndex: number;
    rowData: ObjectMatrixPrimitiveType<ICellData>;
}

export interface IInsertSheetActionData extends ISheetActionData {
    index: number;
}

/**
 * @internal
 */
export interface IRemoveColumnAction extends ISheetActionData {
    columnCount: number;
    columnIndex: number;
}

/**
 * @internal
 */
export interface IRemoveColumnDataAction extends ISheetActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * @internal
 */
export interface IRemoveMergeActionData extends ISheetActionData {
    rectangles: IRangeData[];
}

/**
 * @internal
 */
export interface IRemoveRowActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * @internal
 */
export interface IRemoveRowDataActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

export interface IRemoveSheetActionData extends ISheetActionData {
    sheetId: string;
}

/**
 * @internal
 * Border style format
 */
export interface BorderStyleData extends ISheetActionData {
    styles: ObjectMatrixPrimitiveType<IStyleData>;
}

/**
 * @internal
 */
export interface ISetColumnHideActionData extends ISheetActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * @internal
 */
export interface ISetColumnShowActionData extends ISheetActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * @internal
 */
export interface ISetColumnWidthActionData extends ISheetActionData {
    columnIndex: number;
    columnWidth: number[];
}

/**
 * @internal
 */
export interface ISetHiddenGridlinesActionData extends ISheetActionData {
    hideGridlines: boolean;
}

export interface ISetNamedRangeActionData extends ISheetActionData {
    namedRange: INamedRange;
}

/**
 * 设置数据时的类型
 */
enum SetRangeDataType {
    DEFAULT = 'default',

    /**
     *
     */
    PASTE = 'paste',
}

/**
 * @internal
 */
export interface ISetRangeDataActionData extends ISheetActionData {
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
    options?: ICopyToOptionsData;
    type?: SetRangeDataType;
}

/**
 *
 */
export interface ISetRangeFormattedValueActionData extends ISheetActionData {
    cellValue: ObjectMatrixPrimitiveType<ICellV>;
    rangeData: IRangeData;
}

/**
 * @internal
 */
export interface ISetRangeNoteActionData extends ISheetActionData {
    cellNote: ObjectMatrixPrimitiveType<string>;
    rangeData: IRangeData;
}

export interface ISetRangeStyleActionData extends ISheetActionData {
    value: ObjectMatrixPrimitiveType<IStyleData>; //
    rangeData: IRangeData;
}

/**
 * @internal
 */
export interface ISetRightToLeftActionData extends ISheetActionData {
    rightToLeft: BooleanNumber;
}

/**
 * @internal
 */
export interface ISetRowHeightActionData extends ISheetActionData {
    rowIndex: number;
    rowHeight: number[];
}

/**
 * @internal
 */
export interface ISetRowHideActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * @internal
 */
export interface ISetRowShowActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * @internal
 */
export interface ISetSelectionActivateActionData extends ISheetActionData {
    activeRangeList: IRangeData | IRangeData[];
    activeRange: IRangeData;
    currentCell: IRangeData;
}

/**
 * @internal
 */
export interface ISetSelectionActivateServiceData {
    activeRangeList: IRangeData | IRangeData[];
    activeRange: IRangeData;
    currentCell: IRangeData;
}

export interface ISetSheetOrderActionData extends ISheetActionData {
    sheetId: string;
    order: number;
}

/**
 * @internal
 */
export interface ISetTabColorActionData extends ISheetActionData {
    color: Nullable<string>;
}
/**
 * @internal
 */
export interface ISetWorkSheetActivateActionData extends ISheetActionData {
    status: BooleanNumber;
}

/**
 * @internal
 */
export interface ISheetStatus {
    oldSheetId: string;
    status: BooleanNumber;
}

/**
 * @internal
 */
export interface ISetWorkSheetHideActionData extends ISheetActionData {
    hidden: BooleanNumber;
}

/**
 * @internal
 */
export interface ISetWorkSheetNameActionData extends ISheetActionData {
    sheetName: string;
}

/**
 * @internal
 */
export interface ISetWorkSheetStatusActionData extends ISheetActionData {
    sheetStatus: BooleanNumber;
}

export interface ISetZoomRatioActionData extends ISheetActionData {
    zoom: number;
    sheetId: string;
}
