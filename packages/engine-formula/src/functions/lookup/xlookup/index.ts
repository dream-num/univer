/**
 * Copyright 2023-present DreamNum Inc.
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

import { ErrorType } from '../../../basics/error-type';
import { ArrayBinarySearchType, ArrayOrderSearchType } from '../../../engine/utils/compare';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Xlookup extends BaseFunction {
    override minParams = 3;

    override maxParams = 6;

    override calculate(
        lookupValue: BaseValueObject,
        lookupArray: ArrayValueObject,
        returnArray: ArrayValueObject,
        ifNotFound?: BaseValueObject,
        matchMode?: BaseValueObject,
        searchMode?: BaseValueObject
    ) {
        if (lookupValue.isError()) {
            return lookupValue;
        }

        if (lookupArray.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!lookupArray.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const rowCountLookup = lookupArray.getRowCount();

        const columnCountLookup = lookupArray.getColumnCount();

        if (rowCountLookup !== 1 && columnCountLookup !== 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (returnArray.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!returnArray.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const rowCountReturn = returnArray.getRowCount();

        const columnCountReturn = returnArray.getColumnCount();

        if (rowCountLookup !== rowCountReturn && columnCountLookup !== columnCountReturn) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (ifNotFound?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (matchMode?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (searchMode?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (ifNotFound == null) {
            ifNotFound = ErrorValueObject.create(ErrorType.NA);
        }

        const matchModeValue = this.getIndexNumValue(matchMode || NumberValueObject.create(0));

        if (matchModeValue instanceof ErrorValueObject) {
            return matchModeValue;
        }

        const searchModeValue = this.getIndexNumValue(searchMode || NumberValueObject.create(1));

        if (searchModeValue instanceof ErrorValueObject) {
            return searchModeValue;
        }

        if (lookupValue.isArray()) {
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
                const result = this._handleSingleObject(
                    value,
                    lookupArray,
                    resultArray!,
                    matchModeValue,
                    searchModeValue
                );

                if (result.isError()) {
                    return ifNotFound!;
                }

                return result;
            });
        }

        if (columnCountLookup === columnCountReturn && rowCountLookup === rowCountReturn) {
            const result = this._handleSingleObject(
                lookupValue,
                lookupArray,
                returnArray!,
                matchModeValue,
                searchModeValue
            );

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

        const resultArray = this._handleExpandObject(
            lookupValue,
            lookupArray,
            returnArray,
            matchModeValue,
            searchModeValue,
            axis
        );

        if (resultArray == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        return resultArray;

        // if (rowCountLookup === 1) {
        //     resultArray = (returnArray as ArrayValueObject).slice([0, 1]);
        // } else {
        //     resultArray = (returnArray as ArrayValueObject).slice(undefined, [0, 1]);
        // }

        // return ErrorValueObject.create(ErrorType.NA);

        // const searchArray = (tableArray as ArrayValueObject).slice([0, 1]);

        // const resultArray = (tableArray as ArrayValueObject).slice([rowIndexNumValue - 1, rowIndexNumValue]);

        // if (searchArray == null || resultArray == null) {
        //     return ErrorValueObject.create(ErrorType.VALUE);
        // }

        // if (lookupValue.isArray()) {
        //     return lookupValue.map((value) => {
        //         return this._handleSingleObject(value, searchArray, resultArray, rangeLookupValue);
        //     });
        // }

        // return this._handleSingleObject(lookupValue, searchArray, resultArray, rangeLookupValue);
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
            return this.binarySearchExpand(
                value,
                searchArray,
                resultArray,
                axis,
                this._getSearchModeValue(searchModeValue)
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
            return this.binarySearch(value, searchArray, resultArray, this._getSearchModeValue(searchModeValue));
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

    private _getSearchModeValue(searchModeValue: number) {
        return searchModeValue === -2 ? ArrayBinarySearchType.MAX : ArrayBinarySearchType.MIN;
    }
}
