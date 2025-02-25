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
import { ArrayOrderSearchType, getMatchModeValue, getSearchModeValue } from '../../../engine/utils/compare';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Xlookup extends BaseFunction {
    override minParams = 3;

    override maxParams = 6;

    // eslint-disable-next-line
    override calculate(
        lookupValue: BaseValueObject,
        lookupArray: ArrayValueObject,
        returnArray: ArrayValueObject,
        ifNotFound?: BaseValueObject,
        matchMode?: BaseValueObject,
        searchMode?: BaseValueObject
    ) {
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

        if (lookupValue.isError()) {
            return lookupValue;
        }

        if (lookupArray.isError() || returnArray.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!lookupArray.isArray() || !returnArray.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const rowCountLookup = lookupArray.getRowCount();
        const columnCountLookup = lookupArray.getColumnCount();
        const rowCountReturn = returnArray.getRowCount();
        const columnCountReturn = returnArray.getColumnCount();

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
            lookupValue,
            lookupArray,
            returnArray,
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
                const checkErrorCombination = this._checkErrorCombination(matchModeValue, searchModeValue);

                if (checkErrorCombination) {
                    return checkErrorCombination;
                }

                const result = this._handleSingleObject(value, lookupArray, resultArray!, matchModeValue, searchModeValue);

                if (result.isError()) {
                    return ifNotFound;
                }

                return result;
            });
        }

        const _lookupValue = lookupValue.isArray() ? (lookupValue as ArrayValueObject).get(0, 0) as BaseValueObject : lookupValue;

        if (columnCountLookup === columnCountReturn && rowCountLookup === rowCountReturn) {
            const checkErrorCombination = this._checkErrorCombination(matchModeValue, searchModeValue);

            if (checkErrorCombination) {
                return checkErrorCombination;
            }

            const result = this._handleSingleObject(_lookupValue, lookupArray, returnArray!, matchModeValue, searchModeValue);

            if (result.isError()) {
                return ifNotFound!;
            }

            return result;
        }

        let axis = 0;
        /**
         * 0 for rows
         * 1 for columns
         */
        if (columnCountLookup === columnCountReturn) {
            axis = 1;
        }

        const resultArray = this._handleExpandObject(_lookupValue, lookupArray, returnArray, matchModeValue, searchModeValue, axis);

        if (resultArray == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        return resultArray;
    }

    private _handleExpandObject(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        matchModeValue: number,
        searchModeValue: number,
        axis: number = 0
    ) {
        if ((searchModeValue === 2 || searchModeValue === -2) && matchModeValue !== 2) {
            const searchType = getSearchModeValue(searchModeValue);
            const matchType = getMatchModeValue(matchModeValue);
            return this.binarySearchExpand(
                value,
                searchArray,
                resultArray,
                axis,
                searchType,
                matchType
            );
        }

        if (matchModeValue === 2) {
            return this.fuzzySearchExpand(value, searchArray, resultArray, searchModeValue !== -1, axis);
        }
        if (matchModeValue === -1 || matchModeValue === 1) {
            return this.orderSearchExpand(
                value,
                searchArray,
                resultArray,
                matchModeValue === 1 ? ArrayOrderSearchType.MAX : ArrayOrderSearchType.MIN,
                searchModeValue === -1,
                axis
            );
        }

        return this.equalSearchExpand(value, searchArray, resultArray, searchModeValue !== -1, axis);
    }

    private _handleSingleObject(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        matchModeValue: number,
        searchModeValue: number
    ) {
        if ((searchModeValue === 2 || searchModeValue === -2) && matchModeValue !== 2) {
            const searchType = getSearchModeValue(searchModeValue);
            const matchType = getMatchModeValue(matchModeValue);
            return this.binarySearch(value, searchArray, resultArray, searchType, matchType);
        }

        if (matchModeValue === 2) {
            return this.fuzzySearch(value, searchArray, resultArray, searchModeValue !== -1);
        }

        if (matchModeValue === -1 || matchModeValue === 1) {
            return this.orderSearch(
                value,
                searchArray,
                resultArray,
                matchModeValue === 1 ? ArrayOrderSearchType.MAX : ArrayOrderSearchType.MIN,
                searchModeValue === -1
            );
        }

        return this.equalSearch(value, searchArray, resultArray, searchModeValue !== -1);
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
