import { BooleanNumber, ICellData, ISelectionRange, ObjectMatrix, ObjectMatrixPrimitiveType } from '@univerjs/core';

export type SheetDataType = { [sheetId: string]: ObjectMatrix<ICellData> };

export type UnitDataType = { [unitId: string]: SheetDataType };

export type ArrayFormulaDataType = { [sheetId: string]: ObjectMatrix<ISelectionRange> };

export type UnitArrayFormulaDataType = { [unitId: string]: ArrayFormulaDataType };

export interface IFormulaData {
    formula: string; // formulaString
    row: number;
    column: number;
    sheetId: string;
}

export type FormulaDataType = { [unitId: string]: { [sheetId: string]: ObjectMatrixPrimitiveType<IFormulaData> } };

export type SheetNameMapType = { [sheetName: string]: string };

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

export enum TableOptionType {
    ALL = '#All',
    DATA = '#Data',
    HEADERS = '#Headers',
    TOTALS = '#Totals',
}

export interface IInterpreterDatasetConfig {
    unitData: UnitDataType;
    formulaData: FormulaDataType;
    sheetNameMap: SheetNameMapType;
    currentRow: number;
    currentColumn: number;
    currentSheetId: string;
    currentUnitId: string;
    rowCount: number;
    columnCount: number;
}

export interface ISuperTable {
    sheetId: string;
    hasCustomTitle: BooleanNumber;
    titleMap: Map<string, number>;
    rangeData: ISelectionRange;
}

export enum ConcatenateType {
    FRONT,
    BACK,
}
