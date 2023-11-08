import { BooleanNumber, ICellData, IRange, IUnitRange, ObjectMatrix, ObjectMatrixPrimitiveType } from '@univerjs/core';

export type ArrayFormulaDataType = { [sheetId: string]: ObjectMatrix<IRange> };

export type UnitArrayFormulaDataType = { [unitId: string]: ArrayFormulaDataType };

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

export type SheetItemType = {
    cellData: ObjectMatrix<ICellData>;
    rowCount: number;
    columnCount: number;
};

export type SheetDataType = { [sheetId: string]: SheetItemType };

export type UnitDataType = { [unitId: string]: SheetDataType };

export type RuntimeSheetDataType = { [sheetId: string]: ObjectMatrix<ICellData> };

export type RuntimeUnitDataType = { [unitId: string]: RuntimeSheetDataType };

export type SheetNameMapType = { [sheetName: string]: string };

export interface IFormulaData {
    f: string; // formulaString
    si: string;
    // row: number;
    // column: number;
    // sheetId: string;
}

export type FormulaDataType = { [unitId: string]: { [sheetId: string]: ObjectMatrixPrimitiveType<IFormulaData> } };

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

export interface IFormulaDatasetConfig {
    unitData: UnitDataType;
    formulaData: FormulaDataType;
    sheetNameMap: SheetNameMapType;
    forceCalculate: boolean;
    updateRangeList: IUnitRange[];
}

export enum ConcatenateType {
    FRONT,
    BACK,
}
