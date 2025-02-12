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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Xor extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...logicalValues: BaseValueObject[]) {
        let trueCount = 0;
        let noBoolean = true;
        let errorValue = null;

        for (const logicalValue of logicalValues) {
            if (logicalValue.isError()) {
                return logicalValue;
            }

            if (logicalValue.isArray()) {
                (logicalValue as ArrayValueObject).iterator((value) => {
                    if (value?.isError()) {
                        errorValue = value;
                        return false;
                    } else if (value?.isBoolean() || value?.isNumber()) {
                        if (value.getValue()) {
                            trueCount++;
                        }
                        noBoolean = false;
                    }
                });

                if (errorValue) {
                    return errorValue;
                }
            } else if (logicalValue.isBoolean() || logicalValue.isNumber()) {
                if (logicalValue.getValue()) {
                    trueCount++;
                }
                noBoolean = false;
            }
        }

        return noBoolean ? ErrorValueObject.create(ErrorType.VALUE) : BooleanValueObject.create(trueCount % 2 === 1);
    }
}
