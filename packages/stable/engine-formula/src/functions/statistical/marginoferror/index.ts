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
import { ErrorType } from '../../../basics/error-type';
import { studentTINV } from '../../../basics/statistical';
import { checkVariantErrorIsArray, checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Marginoferror extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(range: BaseValueObject, confidence: BaseValueObject): BaseValueObject {
        const rangeValues = this._getRangeValues(range);

        if (rangeValues instanceof ErrorValueObject) {
            return rangeValues;
        }

        const _confidence = checkVariantErrorIsArray(confidence);

        if (_confidence.isError()) {
            return _confidence;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(_confidence);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [confidenceObject] = variants as BaseValueObject[];

        const confidenceValue = +confidenceObject.getValue();

        if (confidenceValue <= 0 || confidenceValue >= 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (rangeValues.length < 2) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        const alpha = 1 - confidenceValue;
        const size = rangeValues.length;
        const mean = rangeValues.reduce((acc, value) => acc + value, 0) / size;
        const variance = rangeValues.reduce((acc, value) => acc + (value - mean) ** 2, 0) / (size - 1);
        const standardDev = Math.sqrt(variance);

        if (standardDev <= 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = Math.abs(studentTINV(alpha / 2, size - 1) * standardDev / Math.sqrt(size));

        return NumberValueObject.create(result);
    }

    private _getRangeValues(range: BaseValueObject): number[] | ErrorValueObject {
        const rangeValues: number[] = [];

        const rowCount = range.isArray() ? (range as ArrayValueObject).getRowCount() : 1;
        const columnCount = range.isArray() ? (range as ArrayValueObject).getColumnCount() : 1;

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                const valueObject = range.isArray() ? (range as ArrayValueObject).get(r, c) as BaseValueObject : range;

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
                }

                if (valueObject.isNull() || valueObject.isBoolean() || valueObject.isString()) {
                    continue;
                }

                rangeValues.push(+valueObject.getValue());
            }
        }

        return rangeValues;
    }
}
