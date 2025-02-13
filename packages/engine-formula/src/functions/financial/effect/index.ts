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

export class Effect extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(nominalRate: BaseValueObject, npery: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(nominalRate, npery);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [nominalRateObject, nperyObject] = variants as BaseValueObject[];

        const nominalRateValue = +nominalRateObject.getValue();
        let nperyValue = Math.floor(+nperyObject.getValue());

        if (Number.isNaN(nominalRateValue) || Number.isNaN(nperyValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (nominalRateValue <= 0 || nperyValue < 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        nperyValue = Number.parseInt(`${nperyValue}`, 10);

        // Return effective annual interest rate
        const result = (1 + nominalRateValue / nperyValue) ** nperyValue - 1;

        return NumberValueObject.create(result);
    }
}
