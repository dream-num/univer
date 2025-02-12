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

export class Fvschedule extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(principal: BaseValueObject, schedule: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(principal);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [principalObject] = variants as BaseValueObject[];

        const principalValue = +principalObject.getValue();

        if (Number.isNaN(principalValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let result = principalValue;

        if (schedule.isArray()) {
            const scheduleValues = schedule.getArrayValue().flat();

            for (let i = 0; i < scheduleValues.length; i++) {
                const scheduleObject = scheduleValues[i] as BaseValueObject;

                if (scheduleObject.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                const scheduleValue = +scheduleObject.getValue();

                if (Number.isNaN(scheduleValue)) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                result *= 1 + scheduleValue;
            }
        } else {
            if (schedule.isBoolean()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const scheduleValue = +schedule.getValue();

            if (Number.isNaN(scheduleValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            result *= 1 + scheduleValue;
        }

        return NumberValueObject.create(result);
    }
}
