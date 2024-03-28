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

import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Vlookup extends BaseFunction {
    override calculate(
        lookupValue: BaseValueObject,
        tableArray: BaseValueObject,
        colIndexNum: BaseValueObject,
        rangeLookup?: BaseValueObject
    ) {
        if (lookupValue == null || tableArray == null || colIndexNum == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (lookupValue.isError()) {
            return lookupValue;
        }

        if (tableArray.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!tableArray.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (colIndexNum.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (rangeLookup?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        rangeLookup = rangeLookup ?? BooleanValueObject.create(true);

        // When neither lookupValue nor rangeLookup is an array, but colIndexNum is an array, expansion is allowed based on the value of colIndexNum. However, if an error is encountered in subsequent matching, the first error needs to be returned (not the entire array)
        // Otherwise colIndexNum takes the first value

        if (!lookupValue.isArray() && !rangeLookup.isArray() && colIndexNum.isArray()) {
            const rangeLookupValue = this.getZeroOrOneByOneDefault(rangeLookup);

            if (rangeLookupValue == null) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            let errorValue: ErrorValueObject | undefined;

            const result = colIndexNum.map((colIndexNumValueObject: BaseValueObject) => {
                const colIndexNumValue = this.getIndexNumValue(colIndexNumValueObject);

                if (colIndexNumValue instanceof ErrorValueObject) {
                    errorValue = colIndexNumValue;
                    return errorValue;
                }

                const searchArray = (tableArray as ArrayValueObject).slice(undefined, [0, 1]);

                if (searchArray == null) {
                    errorValue = ErrorValueObject.create(ErrorType.VALUE);
                    return errorValue;
                }

                const resultArray = (tableArray as ArrayValueObject).slice(undefined, [colIndexNumValue - 1, colIndexNumValue]);

                if (resultArray == null) {
                    errorValue = ErrorValueObject.create(ErrorType.REF);
                    return errorValue;
                }

                // The error reporting priority of lookupValue in Excel is higher than colIndexNum. It is required to execute the query from the first column first, and then take the value of colIndexNum column from the query result.
                // Here we will first throw the colIndexNum error to avoid unnecessary queries and improve performance.
                return this._handleSingleObject(lookupValue, searchArray, resultArray, rangeLookupValue);
            });

            if (errorValue) {
                return errorValue;
            }

            return result;
        }

        // max row length
        const maxRowLength = Math.max(
            lookupValue.isArray() ? (lookupValue as ArrayValueObject).getRowCount() : 1,
            rangeLookup.isArray() ? (rangeLookup as ArrayValueObject).getRowCount() : 1
        );

        // max column length
        const maxColumnLength = Math.max(
            lookupValue.isArray() ? (lookupValue as ArrayValueObject).getColumnCount() : 1,
            rangeLookup.isArray() ? (rangeLookup as ArrayValueObject).getColumnCount() : 1
        );

        const lookupValueArray = expandArrayValueObject(maxRowLength, maxColumnLength, lookupValue);
        const rangeLookupArray = expandArrayValueObject(maxRowLength, maxColumnLength, rangeLookup);

        return lookupValueArray.map((lookupValue, rowIndex, columnIndex) => {
            if (lookupValue.isError()) {
                return lookupValue;
            }

            const rangeLookupValueObject = rangeLookupArray.get(rowIndex, columnIndex);

            if (rangeLookupValueObject == null) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (rangeLookupValueObject.isError()) {
                return rangeLookupValueObject;
            }

            const rangeLookupValue = this.getZeroOrOneByOneDefault(rangeLookupValueObject);

            if (rangeLookupValue == null) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const colIndexNumValue = this.getIndexNumValue(colIndexNum);

            if (colIndexNumValue instanceof ErrorValueObject) {
                return colIndexNumValue;
            }

            const searchArray = (tableArray as ArrayValueObject).slice(undefined, [0, 1]);

            if (searchArray == null) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const resultArray = (tableArray as ArrayValueObject).slice(undefined, [colIndexNumValue - 1, colIndexNumValue]);

            if (resultArray == null) {
                return ErrorValueObject.create(ErrorType.REF);
            }

            return this._handleSingleObject(lookupValue, searchArray, resultArray, rangeLookupValue);
        });
    }

    private _handleSingleObject(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        rangeLookupValue: number
    ) {
        if (rangeLookupValue === 0) {
            return this.equalSearch(value, searchArray, resultArray);
        }

        return this.binarySearch(value, searchArray, resultArray);
    }
}
