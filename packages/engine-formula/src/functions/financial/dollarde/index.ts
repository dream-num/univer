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

import Decimal from 'decimal.js';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Dollarde extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(fractionalDollar: BaseValueObject, fraction: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(fractionalDollar, fraction);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [fractionalDollarObject, fractionObject] = variants as BaseValueObject[];

        const fractionalDollarValue = +fractionalDollarObject.getValue();
        const fractionValue = Math.floor(+fractionObject.getValue());

        if (Number.isNaN(fractionalDollarValue) || Number.isNaN(fractionValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (fractionValue < 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (fractionValue >= 0 && fractionValue < 1) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return NumberValueObject.create(this._convert(fractionalDollarValue, fractionValue));
    }

    protected _convert(fractionalDollarValue: number, fractionValue: number): number {
        const scaleDigits = Math.ceil(Math.log(fractionValue) / Math.LN10);
        let result = Math.trunc(fractionalDollarValue);
        result += ((fractionalDollarValue % 1) * 10 ** scaleDigits) / fractionValue;

        const roundingDigits = Math.ceil(Math.log(fractionValue) / Math.LN2) + 1;
        const power = 10 ** roundingDigits;
        const scaled = result * power;

        if (Number.isFinite(scaled) || !Number.isFinite(fractionalDollarValue) || !Number.isFinite(fractionValue)) {
            return Math.round(scaled) / power;
        }

        // An overflowing conversion or rounding scale must not erase a finite price.
        const preciseResult = Number.isFinite(result)
            ? new Decimal(result)
            : new Decimal(Math.trunc(fractionalDollarValue)).add(
                new Decimal(fractionalDollarValue % 1).mul(Decimal.pow(10, scaleDigits)).div(fractionValue)
            );

        return preciseResult.toDecimalPlaces(roundingDigits, Decimal.ROUND_HALF_CEIL).toNumber();
    }
}

export class ExcelDollarde extends Dollarde {
    protected override _convert(value: number, fraction: number): number {
        const integer = Math.trunc(value);
        return integer + ((value - integer) * 10 ** Math.ceil(Math.log10(fraction))) / fraction;
    }
}
