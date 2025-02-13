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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Count extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]) {
        let accumulatorAll: BaseValueObject = NumberValueObject.create(0);
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isError()) {
                continue;
            }

            if (variant.isArray()) {
                accumulatorAll = accumulatorAll.plus(variant.count());
            } else if (variant.isString()) {
                if (!variant.convertToNumberObjectValue().isError()) {
                    accumulatorAll = accumulatorAll.plus(NumberValueObject.create(1));
                }
            } else if (!variant.isNull()) {
                accumulatorAll = accumulatorAll.plus(NumberValueObject.create(1));
            }
        }

        return accumulatorAll;
    }
}
