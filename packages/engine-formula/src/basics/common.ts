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

import type {
    BooleanNumber,
    ICellData,
    IColumnData,
    IObjectArrayPrimitiveType,
    IObjectMatrixPrimitiveType,
    IRange,
    IRowData,
    IUnitRange,
    Nullable,
    ObjectMatrix,
    Styles,
} from '@univerjs/core';

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
    rowData: IObjectArrayPrimitiveType<Partial<IRowData>>;
    columnData: IObjectArrayPrimitiveType<Partial<IColumnData>>;
    defaultColumnWidth?: number;
    defaultRowHeight?: number;
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

/**
 * Style data, numfmt needs to be queried from the style sheet
 */
export interface IUnitStylesData {
    [unitId: string]: Styles;
}

export interface IRuntimeUnitDataType {
    [unitId: string]: Nullable<{ [sheetId: string]: ObjectMatrix<Nullable<ICellData>> }>;
}

export interface IRuntimeUnitDataPrimitiveType {
    [unitId: string]: Nullable<{ [sheetId: string]: IObjectMatrixPrimitiveType<Nullable<ICellData>> }>;
}

export interface IRuntimeOtherUnitDataType {
    [unitId: string]: Nullable<{ [sheetId: string]: Nullable<{ [formulaId: string]: IObjectMatrixPrimitiveType<Nullable<ICellData>[][]> }> }>;
}

export interface IUnitSheetNameMap {
    [unitId: string]: Nullable<{ [sheetName: string]: string }>;
}

export interface IUnitSheetIdToNameMap {
    [unitId: string]: Nullable<{ [sheetId: string]: string }>;
}

export interface IDirtyUnitSheetNameMap {
    [unitId: string]: Nullable<{ [sheetId: string]: string }>;
}

export interface IDirtyUnitSheetDefinedNameMap {
    [unitId: string]: Nullable<{ [name: string]: string }>;
}

export interface IDirtyUnitFeatureMap {
    [unitId: string]: Nullable<{ [sheetId: string]: { [featureId: string]: boolean } }>;
}

export interface IDirtyUnitOtherFormulaMap {
    [unitId: string]: Nullable<{ [sheetId: string]: { [formulaId: string]: boolean } }>;
}

export interface IArrayFormulaRangeType {
    [unitId: string]: Nullable<{ [sheetId: string]: IObjectMatrixPrimitiveType<IRange> }>;
}

export interface IFeatureDirtyRangeType {
    [unitId: string]: Nullable<{ [sheetId: string]: IRange[] }>;
}

export interface IArrayFormulaUnitCellType extends IRuntimeUnitDataPrimitiveType {}

export interface IFormulaData {
    [unitId: string]: Nullable<{ [sheetId: string]: Nullable<IObjectMatrixPrimitiveType<Nullable<IFormulaDataItem>>> }>;
}

export interface IFormulaIdMap {
    f: string;
    r: number;
    c: number;
}

export interface IFormulaIdMapData {
    [unitId: string]: Nullable<{ [subUnitId: string]: Nullable<{ [formulaId: string]: IFormulaIdMap }> }>;
}

export interface IOtherFormulaData {
    [unitId: string]: Nullable<{ [subUnitId: string]: Nullable<{ [formulaId: string]: IOtherFormulaDataItem }> }>;
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

export interface IOtherFormulaDataItem {
    f: string; // formulaString
    ranges: IRange[];
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
    [unitId: string]: Nullable<{ [sheetId: string]: ObjectMatrix<boolean> }>;
}

export interface IUnitRowData {
    [unitId: string]: Nullable<{ [sheetId: string]: IObjectArrayPrimitiveType<Partial<IRowData>> }>;
}

export interface IFormulaDatasetConfig {
    formulaData: IFormulaData;
    arrayFormulaCellData: IArrayFormulaUnitCellType;
    arrayFormulaRange: IArrayFormulaRangeType;
    forceCalculate: boolean;
    dirtyRanges: IUnitRange[];
    dirtyNameMap: IDirtyUnitSheetNameMap;
    dirtyDefinedNameMap: IDirtyUnitSheetNameMap;
    dirtyUnitFeatureMap: IDirtyUnitFeatureMap;
    dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap;
    clearDependencyTreeCache?: IUnitSheetIdToNameMap;
    excludedCell?: IUnitExcludedCell;
    allUnitData?: IUnitData;
    unitStylesData?: IUnitStylesData;
    unitSheetNameMap?: IUnitSheetNameMap;
    maxIteration?: number;
    rowData?: IUnitRowData; // Include rows hidden by filters
}

export enum ConcatenateType {
    FRONT,
    BACK,
}
