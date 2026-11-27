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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Frequency extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override needsReferenceObject = true;

    override calculate(data: FunctionVariantType, bins: FunctionVariantType): BaseValueObject {
        const dataValue = this._resolve(data);
        const binsValue = this._resolve(bins);
        if ((!data.isReferenceObject() && dataValue.isNull()) || (!bins.isReferenceObject() && binsValue.isNull())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        const observations = this._numbers(dataValue, false);
        if (observations instanceof ErrorValueObject) {
            return observations;
        }

        if (binsValue.isError()) {
            return binsValue;
        }

        const thresholds = this._numbers(binsValue, true) as number[];
        if (thresholds.length === 0) {
            thresholds.push(0);
        }
        const ordered = thresholds.map((threshold, index) => ({ threshold, index })).sort((left, right) => left.threshold - right.threshold);

        const counts: number[] = new Array(thresholds.length + 1).fill(0);
        for (const observation of observations) {
            let start = 0;
            let end = thresholds.length;
            while (start < end) {
                const middle = start + Math.floor((end - start) / 2);
                if (observation > ordered[middle].threshold) {
                    start = middle + 1;
                } else {
                    end = middle;
                }
            }
            counts[ordered[start]?.index ?? thresholds.length]++;
        }

        return ArrayValueObject.createByArray(counts.map((count) => [count]));
    }

    private _resolve(input: FunctionVariantType): BaseValueObject {
        return input.isReferenceObject() ? (input as BaseReferenceObject).toArrayValueObject() : input as BaseValueObject;
    }

    private _numbers(input: BaseValueObject, ignoreErrors: boolean): number[] | ErrorValueObject {
        const rows = input.isArray() ? (input as ArrayValueObject).getArrayValue() : [[input]];
        const values: number[] = [];
        for (const row of rows) {
            for (const cell of row) {
                if (!ignoreErrors && cell?.isError()) {
                    return cell as ErrorValueObject;
                }
                if (cell?.isNumber()) {
                    values.push(Number(cell.getValue()));
                }
            }
        }
        return values;
    }
}
