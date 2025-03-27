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
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class QuartileExc extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(array: BaseValueObject, quart: BaseValueObject): BaseValueObject {
        const arrayValues = this._getValues(array);

        if (quart.isArray()) {
            const resultArray = (quart as ArrayValueObject).mapValue((quartObject) => this._handleSingleObject(arrayValues, quartObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(arrayValues, quart);
    }

    private _handleSingleObject(array: number[] | ErrorValueObject, quart: BaseValueObject): BaseValueObject {
        if (array instanceof ErrorValueObject) {
            return array;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(quart);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [quartObject] = variants as BaseValueObject[];

        const quartValue = Math.floor(+quartObject.getValue());

        if (quartValue <= 0 || quartValue >= 4) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const k = quartValue / 4;
        const n = array.length;

        if (k < 1 / (n + 1) || k > 1 - 1 / (n + 1)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const kIndex = k * (n + 1) - 1;
        const integerPart = Math.floor(kIndex);
        const fractionPart = kIndex - integerPart;

        if (fractionPart === 0) {
            return NumberValueObject.create(array[integerPart]);
        }

        const result = array[integerPart] + fractionPart * (array[integerPart + 1] - array[integerPart]);

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

        if (values.length === 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return values.sort((a, b) => a - b);
    }
}
