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

import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/other-object/error-value-object';
import type { FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { IFunctionService } from '../../../services/function.service';
import { BaseFunction } from '../../base-function';
import { FUNCTION_NAMES_MATH } from '../../math/function-names';
import { FUNCTION_NAMES_STATISTICAL } from '../function-names';

export class Average extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        const functionService = this.accessor.get(IFunctionService);

        const accumulatorSum = functionService.getExecutor(FUNCTION_NAMES_MATH.SUM)?.calculate(...variants);
        const accumulatorCount = functionService.getExecutor(FUNCTION_NAMES_STATISTICAL.COUNT)?.calculate(...variants);
        //TODO@DR-Univer: accumulatorCount should be calculated by numeric type count instead of all counts

        if (
            accumulatorSum == null ||
            accumulatorCount == null ||
            accumulatorSum.isErrorObject() ||
            accumulatorCount.isErrorObject()
        ) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return (accumulatorSum as BaseValueObject).divided(accumulatorCount as BaseValueObject);
    }
}
