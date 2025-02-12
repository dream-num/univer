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
import { ErrorType } from '../../../basics/error-type';
import { romanToArabicMap } from '../../../basics/math';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
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

    // eslint-disable-next-line
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

        let textValue = text.getValue().toLocaleString().toLocaleUpperCase();

        if (textValue.length > 255) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const isNegtive = textValue.startsWith('-');

        if (isNegtive) {
            textValue = textValue.slice(1);
        }

        let result = 0;

        for (let i = 0; i < textValue.length; i++) {
            const currentCharValue = romanToArabicMap.get(textValue[i]) || 0;
            const nextCharValue = romanToArabicMap.get(textValue[i + 1]) || 0;
            const nextnextCharValue = romanToArabicMap.get(textValue[i + 2]) || 0;
            const nextnextnextCharValue = romanToArabicMap.get(textValue[i + 3]) || 0;

            if (
                !currentCharValue ||
                (nextnextCharValue >= nextCharValue && nextnextCharValue > currentCharValue) ||
                (currentCharValue === nextCharValue && currentCharValue === nextnextCharValue && currentCharValue === nextnextnextCharValue) ||
                currentCharValue === nextCharValue / 2
            ) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (currentCharValue < nextCharValue) {
                result -= currentCharValue;
            } else {
                result += currentCharValue;
            }
        }

        return NumberValueObject.create(isNegtive ? -result : result);
    }
}
