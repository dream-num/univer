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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { romanToArabicMap } from '../../../basics/math';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Arabic extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(text: BaseValueObject): BaseValueObject {
        if (text.isArray()) {
            const resultArray = (text as ArrayValueObject).mapValue((textObject) => this._handleSingleObject(textObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(text);
    }

    private _handleSingleObject(text: BaseValueObject): BaseValueObject {
        if (text.isError()) {
            return text;
        }

        if (text.isNull()) {
            return NumberValueObject.create(0);
        }

        if (text.isBoolean() || text.isNumber()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let textValue = String(text.getValue()).toUpperCase();

        if (textValue.length > 255) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        textValue = textValue.replace(/^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g, '');
        const isNegative = textValue.startsWith('-');

        if (isNegative) {
            textValue = textValue.slice(1);
            if (!textValue) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
        }

        let result = 0;
        let largest = 0;
        for (let i = textValue.length - 1; i >= 0; i--) {
            const value = romanToArabicMap.get(textValue[i]);
            if (value == null) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
            result += value < largest ? -value : value;
            largest = Math.max(largest, value);
        }

        return NumberValueObject.create(isNegative ? -result : result);
    }
}
