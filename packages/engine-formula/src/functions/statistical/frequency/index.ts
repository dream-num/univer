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

import { isRealNum } from '@univerjs/core';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Frequency extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(dataArray: BaseValueObject, binsArray: BaseValueObject): BaseValueObject {
        const { isError, errorObject, values: dataArrayValues } = this._getValues(dataArray);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if (dataArray.isNull() || binsArray.isNull()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let { values: binsArrayValues } = this._getValues(binsArray, true);

        if (binsArrayValues.length === 0) {
            binsArrayValues = [0];
        }

        const newBinsArrayValues = this._getNewBinsArrayValues(binsArrayValues);

        const result: number[] = new Array(newBinsArrayValues.length).fill(0);

        for (let i = 0; i < dataArrayValues.length; i++) {
            const value = dataArrayValues[i];
            let low = 0;
            let high = newBinsArrayValues.length - 1;

            // Find the first upper bound that contains the value. Equal bins
            // remain stable, so only the first duplicate receives a count.
            while (low < high) {
                const middle = Math.floor((low + high) / 2);
                if (value <= newBinsArrayValues[middle].end) {
                    high = middle;
                } else {
                    low = middle + 1;
                }
            }

            const bin = newBinsArrayValues[low];
            if (value > bin.start && value <= bin.end) {
                result[bin.index]++;
            }
        }

        return ArrayValueObject.createByArray(result.map((item) => [item]));
    }

    private _getValues(array: BaseValueObject, isIgnoreError: boolean = false) {
        const values: number[] = [];

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        for (let r = 0; r < arrayRowCount; r++) {
            for (let c = 0; c < arrayColumnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    if (!isIgnoreError) {
                        return {
                            isError: true,
                            errorObject: valueObject as ErrorValueObject,
                            values,
                        };
                    }

                    continue;
                }

                if (valueObject.isNull() || valueObject.isBoolean()) {
                    continue;
                }

                const value = valueObject.getValue();

                if (!isRealNum(value)) {
                    continue;
                }

                values.push(+value);
            }
        }

        return {
            isError: false,
            errorObject: null,
            values,
        };
    }

    private _getNewBinsArrayValues(binsArrayValues: number[]) {
        const _binsArrayValues = binsArrayValues.map((value, index) => {
            return {
                value,
                index,
            };
        }).sort((a, b) => a.value - b.value);

        const newBinsArrayValues = _binsArrayValues.map((bin, i) => ({
            start: i === 0 ? -Infinity : _binsArrayValues[i - 1].value,
            end: bin.value,
            index: bin.index,
        }));

        newBinsArrayValues.push({
            start: _binsArrayValues[_binsArrayValues.length - 1].value,
            end: Infinity,
            index: _binsArrayValues.length,
        });

        return newBinsArrayValues;
    }
}
