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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class AverageWeighted extends BaseFunction {
    override minParams = 2;

    override maxParams = 254;

    // eslint-disable-next-line
    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        let isOtherError = false;
        let otherErrorObject: ErrorValueObject | undefined;

        if (variants.length % 2 !== 0) {
            isOtherError = true;
            otherErrorObject = ErrorValueObject.create(ErrorType.NA);
        }

        const values: number[] = [];
        const weights: number[] = [];

        for (let i = 0; i < variants.length; i += 2) {
            const valueObject = variants[i];
            const valueObjectRowCount = valueObject.isArray() ? (valueObject as ArrayValueObject).getRowCount() : 1;
            const valueObjectColumnCount = valueObject.isArray() ? (valueObject as ArrayValueObject).getColumnCount() : 1;

            for (let r = 0; r < valueObjectRowCount; r++) {
                for (let c = 0; c < valueObjectColumnCount; c++) {
                    const obj = valueObject.isArray() ? (valueObject as ArrayValueObject).get(r, c) as BaseValueObject : valueObject;

                    if (obj.isError()) {
                        return obj;
                    }

                    if (isOtherError) {
                        continue;
                    }

                    if (obj.isNull() || obj.isBoolean() || obj.isString()) {
                        isOtherError = true;
                        otherErrorObject = ErrorValueObject.create(ErrorType.VALUE);
                        continue;
                    }

                    values.push(+obj.getValue());
                }
            }

            if (i + 1 >= variants.length) {
                continue;
            }

            const weightObject = variants[i + 1];
            const weightObjectRowCount = weightObject.isArray() ? (weightObject as ArrayValueObject).getRowCount() : 1;
            const weightObjectColumnCount = weightObject.isArray() ? (weightObject as ArrayValueObject).getColumnCount() : 1;

            if (weightObjectRowCount !== valueObjectRowCount || weightObjectColumnCount !== valueObjectColumnCount) {
                isOtherError = true;
                otherErrorObject = ErrorValueObject.create(ErrorType.VALUE);
            }

            for (let r = 0; r < weightObjectRowCount; r++) {
                for (let c = 0; c < weightObjectColumnCount; c++) {
                    const obj = weightObject.isArray() ? (weightObject as ArrayValueObject).get(r, c) as BaseValueObject : weightObject;

                    if (obj.isError()) {
                        return obj;
                    }

                    if (isOtherError) {
                        continue;
                    }

                    if (obj.isNull() || obj.isBoolean() || obj.isString()) {
                        isOtherError = true;
                        otherErrorObject = ErrorValueObject.create(ErrorType.VALUE);
                        continue;
                    }

                    const weight = +obj.getValue();

                    if (weight < 0) {
                        isOtherError = true;
                        otherErrorObject = ErrorValueObject.create(ErrorType.VALUE);
                        continue;
                    }

                    weights.push(weight);
                }
            }
        }

        if (isOtherError) {
            return otherErrorObject as ErrorValueObject;
        }

        return this._getResult(values, weights);
    }

    private _getResult(values: number[], weights: number[]): BaseValueObject {
        const n = values.length;

        let sum = 0;
        let sumWeight = 0;

        for (let i = 0; i < n; i++) {
            sum += values[i] * weights[i];
            sumWeight += weights[i];
        }

        const result = sum / sumWeight;

        return NumberValueObject.create(result);
    }
}
