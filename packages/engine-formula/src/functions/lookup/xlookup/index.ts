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

import type { Nullable } from '@univerjs/core';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { compareToken } from '../../../basics/token';
import { ArrayOrderSearchType, getMatchModeValue, getSearchModeValue } from '../../../engine/utils/compare';
import { baseValueObjectToArrayValueObject } from '../../../engine/utils/value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Xlookup extends BaseFunction {
    override minParams = 3;

    override maxParams = 6;

    // eslint-disable-next-line
    override calculate(
        lookupValue: BaseValueObject,
        lookupArray: BaseValueObject,
        returnArray: BaseValueObject,
        ifNotFound?: BaseValueObject,
        matchMode?: BaseValueObject,
        searchMode?: BaseValueObject
    ): BaseValueObject {
        let _ifNotFound = ifNotFound ?? ErrorValueObject.create(ErrorType.NA);
        if (ifNotFound?.isNull()) {
            _ifNotFound = ErrorValueObject.create(ErrorType.NA);
        }

        let _matchMode = matchMode ?? NumberValueObject.create(0);
        if (matchMode?.isNull()) {
            _matchMode = NumberValueObject.create(0);
        }

        let _searchMode = searchMode ?? NumberValueObject.create(1);
        if (searchMode?.isNull()) {
            _searchMode = NumberValueObject.create(1);
        }

        const _lookupValue = this.currentFormulaRowCount > 1 || this.currentFormulaColumnCount > 1
            ? lookupValue
            : this._legacyImplicitLookupValue(lookupValue);

        if (_lookupValue.isError()) {
            return _lookupValue;
        }

        const rowCountLookup = lookupArray.isArray() ? (lookupArray as ArrayValueObject).getRowCount() : 1;
        const columnCountLookup = lookupArray.isArray() ? (lookupArray as ArrayValueObject).getColumnCount() : 1;
        const rowCountReturn = returnArray.isArray() ? (returnArray as ArrayValueObject).getRowCount() : 1;
        const columnCountReturn = returnArray.isArray() ? (returnArray as ArrayValueObject).getColumnCount() : 1;

        if (
            (rowCountLookup !== 1 && columnCountLookup !== 1) ||
            (rowCountLookup === 1 && columnCountLookup > 1 && columnCountLookup !== columnCountReturn) ||
            (columnCountLookup === 1 && rowCountLookup > 1 && rowCountLookup !== rowCountReturn)
        ) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (_matchMode.isError()) {
            return _matchMode;
        }

        if (_searchMode.isError()) {
            return _searchMode;
        }

        const matchModeValue = this.getIndexNumValue(_matchMode);

        if (matchModeValue instanceof ErrorValueObject) {
            return matchModeValue;
        }

        const searchModeValue = this.getIndexNumValue(_searchMode);

        if (searchModeValue instanceof ErrorValueObject) {
            return searchModeValue;
        }

        return this._getResult(
            _lookupValue,
            baseValueObjectToArrayValueObject(lookupArray),
            baseValueObjectToArrayValueObject(returnArray),
            _ifNotFound,
            matchModeValue,
            searchModeValue,
            rowCountLookup,
            columnCountLookup,
            rowCountReturn,
            columnCountReturn
        );
    }

    private _getResult(
        lookupValue: BaseValueObject,
        lookupArray: ArrayValueObject,
        returnArray: ArrayValueObject,
        ifNotFound: BaseValueObject,
        matchModeValue: number,
        searchModeValue: number,
        rowCountLookup: number,
        columnCountLookup: number,
        rowCountReturn: number,
        columnCountReturn: number
    ) {
        const lookupValueRowCount = lookupValue.isArray() ? (lookupValue as ArrayValueObject).getRowCount() : 1;
        const lookupValueColumnCount = lookupValue.isArray() ? (lookupValue as ArrayValueObject).getColumnCount() : 1;

        if (lookupValueRowCount > 1 || lookupValueColumnCount > 1) {
            let resultArray: Nullable<ArrayValueObject>;

            if (rowCountLookup === 1) {
                resultArray = (returnArray as ArrayValueObject).slice([0, 1]);
            } else {
                resultArray = (returnArray as ArrayValueObject).slice(undefined, [0, 1]);
            }

            if (resultArray == null) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            return lookupValue.map((value) => {
                return this._getLookupResult(value, lookupArray, resultArray!, ifNotFound, matchModeValue, searchModeValue);
            });
        }

        const _lookupValue = lookupValue.isArray() ? (lookupValue as ArrayValueObject).get(0, 0) as BaseValueObject : lookupValue;

        if (columnCountLookup === columnCountReturn && rowCountLookup === rowCountReturn) {
            return this._getLookupResult(_lookupValue, lookupArray, returnArray, ifNotFound, matchModeValue, searchModeValue);
        }

        let axis = 0;
        /**
         * 0 for rows
         * 1 for columns
         */
        if (columnCountLookup === columnCountReturn) {
            axis = 1;
        }

        return this._getLookupResult(_lookupValue, lookupArray, returnArray, ifNotFound, matchModeValue, searchModeValue, axis);
    }

    private _legacyImplicitLookupValue(lookupValue: BaseValueObject): BaseValueObject {
        if (!lookupValue.isArray()) {
            return lookupValue;
        }

        const array = lookupValue as ArrayValueObject;

        if (
            array.getUnitId() === '' ||
            array.getSheetId() === '' ||
            array.getCurrentRow() < 0 ||
            array.getCurrentColumn() < 0
        ) {
            return lookupValue;
        }

        const startRow = array.getCurrentRow();
        const startColumn = array.getCurrentColumn();
        const rowCount = array.getRowCount();
        const columnCount = array.getColumnCount();

        let rowIndex = -1;
        let columnIndex = -1;
        if (rowCount === 1 && columnCount === 1) {
            rowIndex = 0;
            columnIndex = 0;
        } else if (rowCount === 1) {
            rowIndex = 0;
            columnIndex = this.column - startColumn;
        } else if (columnCount === 1) {
            rowIndex = this.row - startRow;
            columnIndex = 0;
        } else {
            rowIndex = this.row - startRow;
            columnIndex = this.column - startColumn;
        }

        if (rowIndex < 0 || rowIndex >= rowCount || columnIndex < 0 || columnIndex >= columnCount) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return array.get(rowIndex, columnIndex) as BaseValueObject || ErrorValueObject.create(ErrorType.VALUE);
    }

    private _getLookupResult(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        ifNotFound: BaseValueObject,
        matchModeValue: number,
        searchModeValue: number,
        axis?: number
    ) {
        if (value.isError()) {
            return value;
        }

        const checkErrorCombination = this._checkErrorCombination(matchModeValue, searchModeValue);
        if (checkErrorCombination) {
            return checkErrorCombination;
        }

        const position = this._findPosition(value, searchArray, matchModeValue, searchModeValue);
        if (position == null) {
            return ifNotFound;
        }

        if (axis === 0) {
            return resultArray.slice([position.row, position.row + 1]) ?? ErrorValueObject.create(ErrorType.NA);
        }
        if (axis === 1) {
            return resultArray.slice(undefined, [position.column, position.column + 1]) ?? ErrorValueObject.create(ErrorType.NA);
        }

        const result = resultArray.get(position.row, position.column) ?? ErrorValueObject.create(ErrorType.NA);
        return this._blankResultAsZero(result);
    }

    private _findPosition(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        matchModeValue: number,
        searchModeValue: number
    ): Nullable<{ row: number; column: number }> {
        if ((searchModeValue === 2 || searchModeValue === -2) && matchModeValue !== 2) {
            const searchType = getSearchModeValue(searchModeValue);
            const matchType = getMatchModeValue(matchModeValue);
            const rowOrColumn = searchArray.binarySearch(value, searchType, matchType);
            if (rowOrColumn == null) {
                return null;
            }

            return searchArray.getRowCount() === 1
                ? { row: 0, column: rowOrColumn }
                : { row: rowOrColumn, column: 0 };
        }

        if (matchModeValue === 2) {
            const matches = searchArray.compare(value, compareToken.EQUALS) as ArrayValueObject;
            return searchModeValue === -1 ? matches.getLastTruePosition() : matches.getFirstTruePosition();
        }

        if (matchModeValue === -1 || matchModeValue === 1) {
            return searchArray.orderSearch(
                value,
                matchModeValue === 1 ? ArrayOrderSearchType.MAX : ArrayOrderSearchType.MIN,
                searchModeValue === -1,
                false,
                true
            );
        }

        return this._findExactPosition(value, searchArray, searchModeValue !== -1);
    }

    private _findExactPosition(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        isFirst: boolean
    ): Nullable<{ row: number; column: number }> {
        let position: Nullable<{ row: number; column: number }>;
        const find = (candidate: Nullable<BaseValueObject>, row: number, column: number) => {
            if (candidate != null && this._isExactMatch(candidate, value)) {
                position = { row, column };
                return false;
            }
        };

        if (isFirst) {
            searchArray.iterator(find);
        } else {
            searchArray.iteratorReverse(find);
        }

        return position;
    }

    private _isExactMatch(candidate: BaseValueObject, value: BaseValueObject): boolean {
        if (candidate.isError() || value.isError()) {
            return candidate.isError() && value.isError() && candidate.getValue() === value.getValue();
        }
        if (
            candidate.isNull() !== value.isNull() ||
            candidate.isNumber() !== value.isNumber() ||
            candidate.isString() !== value.isString() ||
            candidate.isBoolean() !== value.isBoolean()
        ) {
            return false;
        }

        return candidate.isEqual(value).getValue() === true;
    }

    private _blankResultAsZero(value: BaseValueObject) {
        if (value.isNull()) {
            return NumberValueObject.create(0);
        }

        return value;
    }

    /**
     * Wildcard matching and binary search cannot appear at the same time
     * @param matchModeValue
     * @param searchModeValue
     * @returns
     */
    private _checkErrorCombination(matchModeValue: number, searchModeValue: number) {
        if (matchModeValue === 2 && (searchModeValue === -2 || searchModeValue === 2)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return null;
    }
}
