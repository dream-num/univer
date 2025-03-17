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

import type { IRange, LocaleType, Nullable } from '@univerjs/core';
import type { IFunctionNames } from '../basics/function';
import type { BaseReferenceObject, FunctionVariantType, NodeValueType } from '../engine/reference-object/base-reference-object';
import type { ArrayBinarySearchType } from '../engine/utils/compare';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import type { FormulaFunctionResultValueType, FormulaFunctionValueType } from '../engine/value-object/primitive-object';
import type { FormulaDataModel } from '../models/formula-data.model';
import type { IDefinedNameMapItem } from '../services/defined-names.service';
import { ErrorType } from '../basics/error-type';
import { regexTestSingeRange, regexTestSingleColumn, regexTestSingleRow } from '../basics/regex';
import { compareToken } from '../basics/token';
import { CellReferenceObject } from '../engine/reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../engine/reference-object/column-reference-object';
import { RangeReferenceObject } from '../engine/reference-object/range-reference-object';
import { RowReferenceObject } from '../engine/reference-object/row-reference-object';
import { createNewArray } from '../engine/utils/array-object';
import { ArrayOrderSearchType } from '../engine/utils/compare';
import { serializeRangeToRefString } from '../engine/utils/reference';
import { convertTonNumber } from '../engine/utils/value-object';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../engine/value-object/primitive-object';

export class BaseFunction {
    private _unitId: Nullable<string>;
    private _subUnitId: Nullable<string>;
    private _row: number = -1;
    private _column: number = -1;
    private _definedNames: Nullable<IDefinedNameMapItem>;
    private _locale: LocaleType;
    private _sheetOrder: string[];
    private _sheetNameMap: { [sheetId: string]: string };
    protected _formulaDataModel: Nullable<FormulaDataModel>;
    protected _rowCount: number = -1;
    protected _columnCount: number = -1;

    /**
     * Whether the function needs to expand the parameters
     */
    needsExpandParams: boolean = false;

    /**
     * Whether the function needs to pass in reference object
     */
    needsReferenceObject: boolean = false;

    /**
     * Whether the function needs handle locale
     */
    needsLocale: boolean = false;

    /**
     * Whether the function needs sheets info
     */
    needsSheetsInfo: boolean = false;

    /**
     * Whether the function needs function methods in FormulaDataModel
     */
    needsFormulaDataModel: boolean = false;

    /**
     * Whether the function needs the number of rows and columns in the sheet
     */
    needsSheetRowColumnCount: boolean = false;

    /**
     * Whether the function needs to filter out rows
     */
    needsFilteredOutRows: boolean = false;

    /**
     * Minimum number of parameters
     */
    minParams: number = -1;

    /**
     * Maximum number of parameters
     */
    maxParams: number = -1;

    constructor(private _name: IFunctionNames) {

    }

    get name() {
        return this._name;
    }

    get unitId() {
        return this._unitId;
    }

    get subUnitId() {
        return this._subUnitId;
    }

    get row() {
        return this._row;
    }

    get column() {
        return this._column;
    }

    dispose() {

    }

    /**
     * In Excel, to inject a defined name into a function that has positioning capabilities,
     * such as using the INDIRECT function to reference a named range,
     * you can write it as follows:
     * =INDIRECT("DefinedName1")
     */
    getDefinedName(name: string) {
        const nameMap = this._definedNames;
        if (nameMap == null) {
            return null;
        }
        return Array.from(Object.values(nameMap)).filter((value) => {
            return value.name === name;
        })?.[0];
    }

    setDefinedNames(definedNames: IDefinedNameMapItem) {
        this._definedNames = definedNames;
    }

    getLocale() {
        return this._locale;
    }

    setLocale(locale: LocaleType) {
        this._locale = locale;
    }

    getSheetsInfo() {
        return {
            sheetOrder: this._sheetOrder,
            sheetNameMap: this._sheetNameMap,
        };
    }

    setSheetsInfo({
        sheetOrder,
        sheetNameMap,
    }: {
        sheetOrder: string[];
        sheetNameMap: { [sheetId: string]: string };
    }) {
        this._sheetOrder = sheetOrder;
        this._sheetNameMap = sheetNameMap;
    }

    setFormulaDataModel(_formulaDataModel: FormulaDataModel) {
        this._formulaDataModel = _formulaDataModel;
    }

    setSheetRowColumnCount(rowCount: number, columnCount: number) {
        this._rowCount = rowCount;
        this._columnCount = columnCount;
    }

    isAsync() {
        return false;
    }

    isAddress() {
        return false;
    }

    isCustom() {
        return false;
    }

    setRefInfo(unitId: string, subUnitId: string, row: number, column: number) {
        this._unitId = unitId;
        this._subUnitId = subUnitId;
        this._row = row;
        this._column = column;
    }

    calculateCustom(
        ...arg: Array<FormulaFunctionValueType>
    ): FormulaFunctionResultValueType | Promise<FormulaFunctionResultValueType> {
        return null;
    }

    calculate(...arg: BaseValueObject[]): NodeValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    checkArrayType(variant: FunctionVariantType) {
        return variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray());
    }

    /**
     * Starting with 1
     * For instance, The column number (starting with 1 for the left-most column of table_array) that contains the return value.
     * https://support.microsoft.com/en-us/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1
     * @param indexNum
     */
    getIndexNumValue(indexNum: BaseValueObject, defaultValue = 1) {
        let _indexNum = indexNum;

        if (_indexNum.isArray()) {
            _indexNum = (_indexNum as ArrayValueObject).getFirstCell();
        }

        if (_indexNum.isBoolean()) {
            const colIndexNumV = _indexNum.getValue() as boolean;
            if (colIndexNumV === false) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return defaultValue;
        }
        if (_indexNum.isString()) {
            const colIndexNumV = Number(_indexNum.getValue() as string);
            if (Number.isNaN(colIndexNumV)) {
                return ErrorValueObject.create(ErrorType.REF);
            }
            return colIndexNumV;
        } else if (_indexNum.isNumber()) {
            const colIndexNumV = _indexNum.getValue() as number;
            return colIndexNumV;
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }

    /**
     * A logical value that specifies 1/TRUE , 0/FALSE, default 1
     * For instance range_lookup, A logical value that specifies whether you want VLOOKUP to find an approximate or an exact match
     * Approximate match - 1/TRUE
     * Exact match - 0/FALSE
     * https://support.microsoft.com/en-us/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1
     * For instance A1, A logical value that specifies what type of reference is contained in the cell ref_text.
     * If a1 is TRUE or omitted, ref_text is interpreted as an A1-style reference.
     * If a1 is FALSE, ref_text is interpreted as an R1C1-style reference.
     * https://support.microsoft.com/zh-cn/office/indirect-%E5%87%BD%E6%95%B0-474b3a3a-8a26-4f44-b491-92b6306fa261
     * @param logicValueObject
     */
    getZeroOrOneByOneDefault(logicValueObject?: BaseValueObject) {
        if (logicValueObject == null) {
            return 1;
        }

        let logicValue = 1;

        if (logicValueObject.isArray()) {
            logicValueObject = (logicValueObject as ArrayValueObject).getFirstCell();
        }

        if (logicValueObject.isBoolean()) {
            const logicV = logicValueObject.getValue() as boolean;
            if (logicV === false) {
                logicValue = 0;
            }
        } else if (logicValueObject.isString()) {
            return;
        } else if (logicValueObject.isNumber()) {
            const logicV = logicValueObject.getValue() as number;
            if (logicV === 0) {
                logicValue = 0;
            }
        }

        return logicValue;
    }

    /**
     * A logical value that specifies 1/TRUE , 0/FALSE, -1, default 1.
     * The difference from getZeroOrOneByOneDefault is that we need to get -1
     * @param logicValueObject
     */
    getMatchTypeValue(logicValueObject?: BaseValueObject) {
        if (logicValueObject == null) {
            return 1;
        }

        let logicValue = 1;

        if (logicValueObject.isArray()) {
            logicValueObject = (logicValueObject as ArrayValueObject).getFirstCell();
        }

        if (logicValueObject.isBoolean()) {
            const logicV = logicValueObject.getValue() as boolean;
            if (logicV === false) {
                logicValue = 0;
            }
        } else if (logicValueObject.isString()) {
            return;
        } else if (logicValueObject.isNumber()) {
            const logicV = logicValueObject.getValue() as number;
            if (logicV <= 0) {
                logicValue = logicV;
            }
        }

        return logicValue;
    }

    binarySearch(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        searchType?: ArrayBinarySearchType,
        matchType?: ArrayOrderSearchType
    ) {
        const rowOrColumn = searchArray.binarySearch(value, searchType, matchType);

        if (rowOrColumn == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        let resultValue: BaseValueObject;

        if (resultArray.getRowCount() === 1) {
            resultValue = resultArray.get(0, rowOrColumn) || NullValueObject.create();
        } else {
            resultValue = resultArray.get(rowOrColumn, 0) || NullValueObject.create();
        }

        if (resultValue.isNull()) {
            // return ErrorValueObject.create(ErrorType.NA);
            return NumberValueObject.create(0);
        }

        return resultValue;
    }

    private _getOneFirstByRaw(array: Nullable<BaseValueObject>[][]) {
        if (array.length === 0) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        return array[0][0] || ErrorValueObject.create(ErrorType.NA);
    }

    private _getOneLastByRaw(array: Nullable<BaseValueObject>[][]) {
        if (array.length === 0) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        return array[array.length - 1][array[0].length - 1] || ErrorValueObject.create(ErrorType.NA);
    }

    equalSearch(value: BaseValueObject, searchArray: ArrayValueObject, resultArray: ArrayValueObject, isFirst = true) {
        const resultArrayValue = resultArray.pickRaw(searchArray.isEqual(value) as ArrayValueObject);

        if (isFirst) {
            return this._getOneFirstByRaw(resultArrayValue);
        }

        return this._getOneLastByRaw(resultArrayValue);
    }

    fuzzySearch(value: BaseValueObject, searchArray: ArrayValueObject, resultArray: ArrayValueObject, isFirst = true) {
        const resultArrayValue = resultArray.pickRaw(searchArray.compare(value, compareToken.EQUALS) as ArrayValueObject);

        if (isFirst) {
            return this._getOneFirstByRaw(resultArrayValue);
        }

        return this._getOneLastByRaw(resultArrayValue);
    }

    orderSearch(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        searchType: ArrayOrderSearchType = ArrayOrderSearchType.MIN,
        isDesc = false
    ) {
        const position = searchArray.orderSearch(value, searchType, isDesc);

        if (position == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const resultValue = resultArray.get(position.row, position.column) || NullValueObject.create();

        if (resultValue.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        return resultValue;
    }

    binarySearchExpand(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        axis = 0,
        searchType?: ArrayBinarySearchType,
        matchType?: ArrayOrderSearchType
    ) {
        const rowOrColumn = searchArray.binarySearch(value, searchType, matchType);

        if (rowOrColumn == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (axis === 0) {
            return resultArray.slice([rowOrColumn, rowOrColumn + 1]);
        }
        return resultArray.slice(undefined, [rowOrColumn, rowOrColumn + 1]);
    }

    equalSearchExpand(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        isFirst = true,
        axis = 0
    ) {
        const matchObject = searchArray.isEqual(value) as ArrayValueObject;

        let position: Nullable<{ row: number; column: number }>;

        if (isFirst) {
            position = matchObject.getFirstTruePosition();
        } else {
            position = matchObject.getLastTruePosition();
        }

        if (position == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (axis === 0) {
            return resultArray.slice([position.row, position.row + 1]);
        }
        return resultArray.slice(undefined, [position.column, position.column + 1]);
    }

    fuzzySearchExpand(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        isFirst = true,
        axis = 0
    ) {
        const matchObject = searchArray.compare(value, compareToken.EQUALS) as ArrayValueObject;

        let position: Nullable<{ row: number; column: number }>;

        if (isFirst) {
            position = matchObject.getFirstTruePosition();
        } else {
            position = matchObject.getLastTruePosition();
        }

        if (position == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (axis === 0) {
            return resultArray.slice([position.row, position.row + 1]);
        }
        return resultArray.slice(undefined, [position.column, position.column + 1]);
    }

    orderSearchExpand(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        searchType: ArrayOrderSearchType = ArrayOrderSearchType.MIN,
        isDesc = false,
        axis = 0
    ) {
        const position = searchArray.orderSearch(value, searchType, isDesc);

        if (position == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (axis === 0) {
            return resultArray.slice([position.row, position.row + 1]);
        }
        return resultArray.slice(undefined, [position.column, position.column + 1]);
    }

    flattenArray(variants: BaseValueObject[], ignoreLogicalValuesAndText: boolean = true): ArrayValueObject | BaseValueObject {
        const flattenValues: BaseValueObject[][] = [];
        flattenValues[0] = [];

        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isString() || variant.isBoolean() || variant.isNull()) {
                variant = variant.convertToNumberObjectValue();
            }

            if (variant.isError()) {
                return variant;
            }

            if (variant.isArray()) {
                let errorValue: Nullable<BaseValueObject>;

                (variant as ArrayValueObject).iterator((valueObject) => {
                    if (valueObject == null || valueObject.isNull()) {
                        return true;
                    }

                    if (ignoreLogicalValuesAndText && (valueObject.isString() || valueObject.isBoolean())) {
                        return true;
                    }

                    valueObject = this._includingLogicalValuesAndText(valueObject);

                    if (valueObject.isError()) {
                        errorValue = valueObject;
                        return false;
                    }

                    flattenValues[0].push(valueObject);
                });

                if (errorValue?.isError()) {
                    return errorValue;
                }
            } else {
                flattenValues[0].push(variant);
            }
        }

        return createNewArray(flattenValues, 1, flattenValues[0].length);
    }

    private _includingLogicalValuesAndText(valueObject: BaseValueObject) {
        // Including logical values
        if (valueObject.isBoolean()) {
            valueObject = convertTonNumber(valueObject);
        }

        // Including number string
        if (valueObject.isString()) {
            const value = Number(valueObject.getValue());

            // Non-text numbers also need to be counted to the sample size
            valueObject = NumberValueObject.create(Number.isNaN(value) ? 0 : value);
        }

        return valueObject;
    }

    createReferenceObject(reference: BaseReferenceObject, range: IRange) {
        const unitId = reference.getForcedUnitId();
        const sheetId = reference.getForcedSheetId() || '';
        const sheetName = reference.getForcedSheetName();

        const gridRangeName = {
            unitId,
            sheetName,
            range,
        };

        const token = serializeRangeToRefString(gridRangeName);

        let referenceObject: BaseReferenceObject;

        if (regexTestSingeRange(token)) {
            referenceObject = new CellReferenceObject(token);
        } else if (regexTestSingleRow(token)) {
            referenceObject = new RowReferenceObject(token);
        } else if (regexTestSingleColumn(token)) {
            referenceObject = new ColumnReferenceObject(token);
        } else {
            referenceObject = new RangeReferenceObject(range, sheetId, unitId);
        }

        return this._setReferenceDefault(reference, referenceObject);
    }

    private _setReferenceDefault(reference: BaseReferenceObject, object: BaseReferenceObject) {
        if (this.unitId == null || this.subUnitId == null) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        object.setDefaultUnitId(this.unitId);
        object.setDefaultSheetId(this.subUnitId);
        object.setUnitData(reference.getUnitData());
        object.setRuntimeData(reference.getRuntimeData());
        object.setArrayFormulaCellData(reference.getArrayFormulaCellData());
        object.setRuntimeArrayFormulaCellData(reference.getRuntimeArrayFormulaCellData());

        return object;
    }
}
