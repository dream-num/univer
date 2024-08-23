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
import { stripErrorMargin } from '../../../engine/utils/math-kit';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Len extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(text: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (text.isArray()) {
            return text.mapValue((textValue: BaseValueObject) => {
                return this._handleSingleText(textValue);
            });
        }

        return this._handleSingleText(text);
    }

    private _handleSingleText(text: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (text.isNull()) {
            return NumberValueObject.create(0);
        }

        if (text.isNumber()) {
            const numberValue = text.getValue() as number;
            // Specify Number.EPSILON to not discard necessary digits in the case of non-precision errors, for example, the length of 1/3 is 17
            const numberValueString = stripErrorMargin(numberValue, 12, Number.EPSILON).toString();
            return NumberValueObject.create(numberValueString.length);
        }

        if (text.isString() || text.isBoolean() || text.isNumber()) {
            const textValue = text.getValue().toString();
            return NumberValueObject.create(textValue.length);
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
