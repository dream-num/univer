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

import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Nominal extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(effectRate: BaseValueObject, npery: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(effectRate, npery);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [effectRateObject, nperyObject] = variants as BaseValueObject[];

        const effectRateValue = +effectRateObject.getValue();
        let nperyValue = Math.floor(+nperyObject.getValue());

        if (Number.isNaN(effectRateValue) || Number.isNaN(nperyValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (effectRateValue <= 0 || nperyValue < 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        nperyValue = Number.parseInt(`${nperyValue}`, 10);

        // Return nominal annual interest rate
        const result = ((effectRateValue + 1) ** (1 / nperyValue) - 1) * nperyValue;

        return NumberValueObject.create(result);
    }
}
