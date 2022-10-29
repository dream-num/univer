import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { AsyncObject } from '../OtherObject/AsyncObject';
import { BooleanNumber, ICellData, IRangeData, Nullable, ObjectMatrix, ObjectMatrixPrimitiveType } from '@univer/core';
import { BaseAstNode } from '../AstNode/BaseAstNode';
import { ReferenceNode } from '../AstNode/ReferenceNode';
import { UnionNode } from '../AstNode/UnionNode';
import { PrefixNode } from '../AstNode/PrefixNode';
import { SuffixNode } from '../AstNode/SuffixNode';

export type NodeValueType = BaseValueObject | BaseReferenceObject | ErrorValueObject | AsyncObject;

export type FunctionVariantType = BaseValueObject | BaseReferenceObject | ErrorValueObject;

export type LambdaPrivacyVarType = Map<string, Nullable<BaseAstNode>>;

export type SheetDataType = { [sheetId: string]: ObjectMatrix<ICellData> };

export type UnitDataType = { [unitId: string]: SheetDataType };

export type CalculateValueType = BaseValueObject | ErrorValueObject;

export type PreCalculateNodeType = ReferenceNode | UnionNode | PrefixNode | SuffixNode;

export interface IFormulaData {
    formula: string; // formulaString
    row: number;
    column: number;
    sheetId: string;
}

export type FormulaDataType = { [sheetId: string]: ObjectMatrixPrimitiveType<IFormulaData> };

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
    rangeData: IRangeData;
}

export interface IArrayValueObject {
    calculateValueList: CalculateValueType[][];
    rowCount: number;
    columnCount: number;
}

export enum ConcatenateType {
    FRONT,
    BACK,
}
