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
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Hlookup extends BaseFunction {
    override minParams = 3;

    override maxParams = 4;

    override calculate(
        lookupValue: BaseValueObject,
        tableArray: BaseValueObject,
        rowIndexNum: BaseValueObject,
        rangeLookup?: BaseValueObject
    ) {
        if (lookupValue.isError()) {
            return lookupValue;
        }

        if (tableArray.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!tableArray.isArray()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (rowIndexNum.isError()) {
            return rowIndexNum;
        }

        if (rangeLookup?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const rangeLookupValue = this.getZeroOrOneByOneDefault(rangeLookup);

        if (rangeLookupValue == null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const rowIndexNumValue = this.getIndexNumValue(rowIndexNum);

        if (rowIndexNumValue instanceof ErrorValueObject) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const rowIndex = Math.floor(rowIndexNumValue);

        const searchArray = (tableArray as ArrayValueObject).slice([0, 1]);

        const resultArray = (tableArray as ArrayValueObject).slice([rowIndex - 1, rowIndex]);

        if (searchArray == null) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (lookupValue.isArray()) {
            return lookupValue.map((value) => this._handleSingleObject(value, searchArray, resultArray, rangeLookupValue, rowIndex));
        }

        return this._handleSingleObject(lookupValue, searchArray, resultArray, rangeLookupValue, rowIndex);
    }

    private _handleSingleObject(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: Nullable<ArrayValueObject>,
        rangeLookupValue: number,
        rowIndex: number
    ): BaseValueObject {
        if (resultArray == null || rowIndex < 1) {
            const match = this._handleSingleObject(value, searchArray, searchArray, rangeLookupValue, 1);
            return match.isError() ? match : ErrorValueObject.create(rowIndex < 1 ? ErrorType.VALUE : ErrorType.REF);
        }

        if (rangeLookupValue === 0) {
            return this._blankResultAsZero(this.equalSearch(value, searchArray, resultArray));
        }

        return this.binarySearch(value, searchArray, resultArray);
    }

    private _blankResultAsZero(value: BaseValueObject) {
        if (value.isNull()) {
            return NumberValueObject.create(0);
        }

        return value;
    }
}
