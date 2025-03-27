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
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Type extends BaseFunction {
    override needsReferenceObject = true;

    override minParams = 1;

    override maxParams = 1;

    override calculate(value: FunctionVariantType) {
        if (value.isReferenceObject()) {
            const rowCount = (value as BaseReferenceObject).getRowCount();
            const columnCount = (value as BaseReferenceObject).getColumnCount();

            if (rowCount === 1 && columnCount === 1) {
                const _value = (value as BaseReferenceObject).getFirstCell();

                if (_value.isError()) {
                    return NumberValueObject.create(16);
                }

                if ((_value as BaseValueObject).isBoolean()) {
                    return NumberValueObject.create(4);
                }

                if ((_value as BaseValueObject).isString()) {
                    return NumberValueObject.create(2);
                }

                if ((_value as BaseValueObject).isNumber() || (_value as BaseValueObject).isNull()) {
                    return NumberValueObject.create(1);
                }
            } else {
                return NumberValueObject.create(64);
            }
        } else {
            if (value.isArray()) {
                return NumberValueObject.create(64);
            }

            if (value.isError()) {
                return NumberValueObject.create(16);
            }

            if ((value as BaseValueObject).isBoolean()) {
                return NumberValueObject.create(4);
            }

            if ((value as BaseValueObject).isString()) {
                return NumberValueObject.create(2);
            }

            if ((value as BaseValueObject).isNumber() || (value as BaseValueObject).isNull()) {
                return NumberValueObject.create(1);
            }
        }

        return NumberValueObject.create(128);
    }
}
