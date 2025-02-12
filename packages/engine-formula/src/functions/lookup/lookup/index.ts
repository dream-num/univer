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
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Lookup extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsExpandParams = true;

    override calculate(
        lookupValue: BaseValueObject,
        lookupVectorOrArray: ArrayValueObject,
        resultVector?: BaseValueObject
    ) {
        if (lookupValue.isError()) {
            return lookupValue;
        }

        if (lookupVectorOrArray.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!lookupVectorOrArray.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (resultVector?.isError()) {
            return resultVector;
        }

        if (lookupVectorOrArray.getColumnCount() === 1 || lookupVectorOrArray.getRowCount() === 1) {
            if (resultVector != null && !resultVector.isArray()) {
                return ErrorValueObject.create(ErrorType.REF);
            }
            return this._handleVector(lookupValue, lookupVectorOrArray, resultVector as ArrayValueObject);
        }

        return this._handleArray(lookupValue, lookupVectorOrArray);
    }

    private _handleVector(
        lookupValue: BaseValueObject,
        lookupVector: ArrayValueObject,
        resultVector?: ArrayValueObject
    ) {
        let _resultVector = resultVector;

        if (_resultVector == null) {
            _resultVector = lookupVector;
        } else if (
            _resultVector.getRowCount() !== lookupVector.getRowCount() ||
            _resultVector.getColumnCount() !== lookupVector.getColumnCount()
        ) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (lookupValue.isArray()) {
            return lookupValue.map((value) => {
                return this.binarySearch(value, lookupVector, _resultVector!);
            });
        }

        return this.binarySearch(lookupValue, lookupVector, _resultVector);
    }

    private _handleArray(lookupValue: BaseValueObject, lookupArray: ArrayValueObject) {
        const rowCount = lookupArray.getRowCount();

        const columnCount = lookupArray.getColumnCount();

        let searchArray: Nullable<ArrayValueObject>;

        let resultArray: Nullable<ArrayValueObject>;

        if (columnCount > rowCount) {
            searchArray = (lookupArray as ArrayValueObject).slice([0, 1]);

            resultArray = (lookupArray as ArrayValueObject).slice([rowCount - 1, rowCount]);
        } else {
            searchArray = (lookupArray as ArrayValueObject).slice(undefined, [0, 1]);

            resultArray = (lookupArray as ArrayValueObject).slice(undefined, [columnCount - 1, columnCount]);
        }

        if (searchArray == null || resultArray == null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (lookupValue.isArray()) {
            return lookupValue.map((value) => {
                return this.binarySearch(value, searchArray!, resultArray!);
            });
        }

        return this.binarySearch(lookupValue, searchArray, resultArray);
    }
}
