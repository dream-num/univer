import type {
    BooleanNumber,
    ICellData,
    IRange,
    IUnitRange,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
} from '@univerjs/core';

export interface IArrayFormulaDataType {
    [sheetId: string]: ObjectMatrixPrimitiveType<IRange>;
}

export interface IUnitArrayFormulaDataType {
    [unitId: string]: IArrayFormulaDataType;
}

export interface IArrayFormulaUnitDataType {
    [unitId: string]: { [sheetId: string]: ObjectMatrixPrimitiveType<ICellData> };
}

export const ERROR_VALUE_OBJECT_CLASS_TYPE = 'errorValueObject';

export const ASYNC_OBJECT_CLASS_TYPE = 'asyncObject';

export const REFERENCE_OBJECT_CLASS_TYPE = 'referenceObject';

export const VALUE_OBJECT_CLASS_TYPE = 'valueObject';

export enum BooleanValue {
    FALSE = 'FALSE',
    TRUE = 'TRUE',
}

export enum AstNodePromiseType {
    SUCCESS,
    ERROR,
}

export interface ISheetItem {
    cellData: ObjectMatrix<ICellData>;
    rowCount: number;
    columnCount: number;
}

export interface ISheetData {
    [sheetId: string]: ISheetItem;
}

/**
 * The subset of workbook data needs to be assembled into a new reference object when being passed in,
 * and then input through the FormulaCurrentConfigService.
 */
export interface IUnitData {
    [unitId: string]: ISheetData;
}

export interface IRuntimeSheetData {
    [sheetId: string]: ObjectMatrix<ICellData>;
}

export interface IRuntimeUnitDataType {
    [unitId: string]: IRuntimeSheetData;
}

export interface IRuntimeOtherUnitDataType {
    [unitId: string]: { [sheetId: string]: { [formulaId: string]: ICellData } };
}

export interface IUnitSheetNameMap {
    [unitId: string]: { [sheetName: string]: string };
}

/**
 * @f  formulaString, the text string of the formula.
 * @si The formula ID can be utilized in scenarios such as copy-pasting and drag-filling to convert formulas into references, eliminating the need for recreating the formulaString.
 */
export interface IFormulaDataItem {
    f: string; // formulaString
    x?: number; // Offset from x direction
    y?: number; // Offset from y direction
    si?: string; // formulaId,
    // row: number;
    // column: number;
    // sheetId: string;
}

export interface IFormulaData {
    [unitId: string]: { [sheetId: string]: ObjectMatrixPrimitiveType<IFormulaDataItem> };
}

export interface IOtherFormulaData {
    [unitId: string]: { [subComponentId: string]: { [formulaId: string]: IFormulaDataItem } };
}

export interface ISuperTable {
    sheetId: string;
    hasCustomTitle: BooleanNumber;
    titleMap: Map<string, number>;
    range: IRange;
}

export enum TableOptionType {
    ALL = '#All',
    DATA = '#Data',
    HEADERS = '#Headers',
    TOTALS = '#Totals',
}

export interface IUnitExcludedCell {
    [unitId: string]: { [sheetId: string]: ObjectMatrix<boolean> };
}

export interface IFormulaDatasetConfig {
    formulaData: IFormulaData;
    arrayFormulaUnitData: IArrayFormulaUnitDataType;
    forceCalculate: boolean;
    dirtyRanges: IUnitRange[];
    excludedCell?: IUnitExcludedCell;
}

export enum ConcatenateType {
    FRONT,
    BACK,
}
