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

import { calculateFV, calculatePMT } from '../../../basics/financial';
import { ErrorType } from '../../../basics/error-type';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

export class Cumipmt extends BaseFunction {
    override minParams = 6;

    override maxParams = 6;

    override calculate(rate: BaseValueObject, nper: BaseValueObject, pv: BaseValueObject, startPeriod: BaseValueObject, endPeriod: BaseValueObject, type: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(rate, nper, pv, startPeriod, endPeriod, type);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [rateObject, nperObject, pvObject, startPeriodObject, endPeriodObject, typeObject] = variants as BaseValueObject[];

        const rateValue = +rateObject.getValue();
        const nperValue = +nperObject.getValue();
        const pvValue = +pvObject.getValue();
        const startPeriodValue = +startPeriodObject.getValue();
        const endPeriodValue = +endPeriodObject.getValue();
        const typeValue = +typeObject.getValue();

        if (Number.isNaN(rateValue) || Number.isNaN(nperValue) || Number.isNaN(pvValue) || Number.isNaN(startPeriodValue) || Number.isNaN(endPeriodValue) || Number.isNaN(typeValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            rateValue <= 0 ||
            nperValue <= 0 ||
            pvValue <= 0 ||
            startPeriodValue < 1 ||
            endPeriodValue < 1 ||
            startPeriodValue > endPeriodValue ||
            startPeriodValue > nperValue ||
            endPeriodValue > nperValue ||
            ![0, 1].includes(typeValue)
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (Math.trunc(startPeriodValue) !== startPeriodValue && Math.trunc(endPeriodValue) !== endPeriodValue && Math.trunc(startPeriodValue) === Math.trunc(endPeriodValue)) {
            return NumberValueObject.create(0);
        }

        return this._getResult(rateValue, nperValue, pvValue, startPeriodValue, endPeriodValue, typeValue);
    }

    private _getResult(
        rateValue: number,
        nperValue: number,
        pvValue: number,
        startPeriodValue: number,
        endPeriodValue: number,
        typeValue: number
    ): NumberValueObject {
        const payment = calculatePMT(rateValue, nperValue, pvValue, 0, typeValue);

        let result = 0;
        let _startPeriodValue = Math.ceil(startPeriodValue);

        if (_startPeriodValue === 1) {
            if (typeValue === 0) {
                result = -pvValue;
            }

            _startPeriodValue++;
        }

        let canNotCalculate = false;

        for (let i = _startPeriodValue; i <= endPeriodValue; i++) {
            const principal = typeValue === 1
                ? calculateFV(rateValue, i - 2, payment, pvValue, 1)
                : calculateFV(rateValue, i - 1, payment, pvValue, 0);

            if (principal === 0) {
                canNotCalculate = true;
                break;
            }

            result += typeValue === 1 ? principal - payment : principal;
        }

        result *= rateValue;

        if (result < payment * (endPeriodValue - startPeriodValue + 1) || canNotCalculate) {
            result = payment * (endPeriodValue - startPeriodValue + 1);
        }

        return NumberValueObject.create(result);
    }
}
