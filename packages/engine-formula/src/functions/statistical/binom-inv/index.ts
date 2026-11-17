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
import { betaCDF, binomialCDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class BinomInv extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(
        trials: BaseValueObject,
        probabilityS: BaseValueObject,
        alpha: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            trials.isArray() ? (trials as ArrayValueObject).getRowCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getRowCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            trials.isArray() ? (trials as ArrayValueObject).getColumnCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getColumnCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getColumnCount() : 1
        );

        const trialsArray = expandArrayValueObject(maxRowLength, maxColumnLength, trials, ErrorValueObject.create(ErrorType.NA));
        const probabilitySArray = expandArrayValueObject(maxRowLength, maxColumnLength, probabilityS, ErrorValueObject.create(ErrorType.NA));
        const alphaArray = expandArrayValueObject(maxRowLength, maxColumnLength, alpha, ErrorValueObject.create(ErrorType.NA));

        const resultArray = trialsArray.mapValue((trialsObject, rowIndex, columnIndex) => {
            const probabilitySObject = probabilitySArray.get(rowIndex, columnIndex) as BaseValueObject;
            const alphaObject = alphaArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (trialsObject.isError()) {
                return trialsObject;
            }

            if (probabilitySObject.isError()) {
                return probabilitySObject;
            }

            if (alphaObject.isError()) {
                return alphaObject;
            }

            return this._handleSingleObject(trialsObject, probabilitySObject, alphaObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(
        trialsObject: BaseValueObject,
        probabilitySObject: BaseValueObject,
        alphaObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(trialsObject, probabilitySObject, alphaObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_trialsObject, _probabilitySObject, _alphaObject] = variants as BaseValueObject[];

        const trialsValue = Math.floor(+_trialsObject.getValue());
        const probabilitySValue = +_probabilitySObject.getValue();
        const alphaValue = +_alphaObject.getValue();

        if (trialsValue < 0 || probabilitySValue <= 0 || probabilitySValue >= 1 || alphaValue <= 0 || alphaValue >= 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const quantile = findBinomialQuantile(trialsValue, probabilitySValue, alphaValue);
        if (quantile !== undefined) {
            return Number.isFinite(quantile)
                ? NumberValueObject.create(quantile)
                : ErrorValueObject.create(ErrorType.NUM);
        }

        let result = 0;

        while (result <= trialsValue) {
            if (binomialCDF(result, trialsValue, probabilitySValue) >= alphaValue) {
                break;
            }

            result++;
        }

        return NumberValueObject.create(result);
    }
}

function findBinomialQuantile(trials: number, probability: number, alpha: number): number | undefined {
    if (!Number.isSafeInteger(trials) || !Number.isFinite(probability) || !Number.isFinite(alpha)) {
        return undefined;
    }

    const direct = searchBinomialQuantile(trials, (successes) => {
        const cdf = binomialCDF(successes, trials, probability);
        return Number.isFinite(cdf) ? cdf >= alpha : undefined;
    });
    if (direct !== undefined) {
        return direct;
    }

    // Restart the bracket when the direct combination sum overflows: its
    // accumulated rounding error can place the previous lower bound too high.
    return searchBinomialQuantile(trials, (successes) => {
        const upperTail = alpha > 0.5;
        const probabilityAtSuccesses = upperTail
            ? betaCDF(probability, successes + 1, trials - successes)
            : betaCDF(1 - probability, trials - successes, successes + 1);
        if (!Number.isFinite(probabilityAtSuccesses)) {
            return undefined;
        }

        // P(X <= k) = I_(1-p)(n-k, k+1); compare its complement directly
        // near alpha = 1 so subtracting a small tail does not lose precision.
        return upperTail ? probabilityAtSuccesses <= 1 - alpha : probabilityAtSuccesses >= alpha;
    }) ?? Number.NaN;
}

function searchBinomialQuantile(trials: number, reachesAlpha: (successes: number) => boolean | undefined): number | undefined {
    const atZero = reachesAlpha(0);
    if (atZero === undefined) {
        return undefined;
    }
    if (atZero) {
        return 0;
    }

    let lower = 0;
    let upper = Math.min(1, trials);

    while (upper < trials) {
        const reached = reachesAlpha(upper);
        if (reached === undefined) {
            return undefined;
        }
        if (reached) {
            break;
        }
        lower = upper;
        upper = Math.min(2 * upper, trials);
    }

    while (upper - lower > 1) {
        const middle = lower + Math.floor((upper - lower) / 2);
        const reached = reachesAlpha(middle);
        if (reached === undefined) {
            return undefined;
        }
        if (reached) {
            upper = middle;
        } else {
            lower = middle;
        }
    }

    return upper;
}
