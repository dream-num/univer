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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { floor } from '../../../engine/utils/math-kit';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class PercentrankExc extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(array: BaseValueObject, x: BaseValueObject, significance?: BaseValueObject): BaseValueObject {
        const arrayValues = this._getValues(array);

        let _significance = significance ?? NumberValueObject.create(3);

        if (_significance.isNull()) {
            _significance = NumberValueObject.create(3);
        }

        const maxRowLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            _significance.isArray() ? (_significance as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            _significance.isArray() ? (_significance as ArrayValueObject).getColumnCount() : 1
        );

        const xArray = expandArrayValueObject(maxRowLength, maxColumnLength, x, ErrorValueObject.create(ErrorType.NA));
        const significanceArray = expandArrayValueObject(maxRowLength, maxColumnLength, _significance, ErrorValueObject.create(ErrorType.NA));

        const resultArray = xArray.mapValue((xObject, rowIndex, columnIndex) => {
            const significanceObject = significanceArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (xObject.isError()) {
                return xObject;
            }

            if (significanceObject.isError()) {
                return significanceObject;
            }

            return this._handleSingleObject(arrayValues, xObject, significanceObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(array: number[] | ErrorValueObject, x: BaseValueObject, significance: BaseValueObject): BaseValueObject {
        if (array instanceof ErrorValueObject) {
            return array;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(x, significance);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [xObject, significanceObject] = variants as BaseValueObject[];

        const xValue = +xObject.getValue();
        const significanceValue = Math.floor(+significanceObject.getValue());

        const n = array.length;

        if (n === 0 || xValue < array[0] || xValue > array[n - 1]) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (n === 1) {
            if (xValue === array[0]) {
                return NumberValueObject.create(1);
            } else {
                return ErrorValueObject.create(ErrorType.NA);
            }
        }

        let result = 0;
        let match = false;
        let i = 0;

        while (!match && i < n) {
            if (xValue === array[i]) {
                result = (i + 1) / (n + 1);
                match = true;
            } else if (xValue > array[i] && i + 1 < n && xValue < array[i + 1]) {
                result = (i + 1 + (xValue - array[i]) / (array[i + 1] - array[i])) / (n + 1);
                match = true;
            }

            i++;
        }

        if (!match) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (significanceValue < 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        result = floor(result, significanceValue);

        return NumberValueObject.create(result);
    }

    private _getValues(array: BaseValueObject): number[] | ErrorValueObject {
        const rowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const columnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const values: number[] = [];

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
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

        return values.sort((a, b) => a - b);
    }
}
