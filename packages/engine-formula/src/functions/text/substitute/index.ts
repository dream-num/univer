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
import type { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Substitute extends BaseFunction {
    override minParams = 3;

    override maxParams = 4;

    override calculate(text: BaseValueObject, oldText: BaseValueObject, newText: BaseValueObject, instanceNum?: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            oldText.isArray() ? (oldText as ArrayValueObject).getRowCount() : 1,
            newText.isArray() ? (newText as ArrayValueObject).getRowCount() : 1,
            instanceNum?.isArray() ? (instanceNum as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            oldText.isArray() ? (oldText as ArrayValueObject).getColumnCount() : 1,
            newText.isArray() ? (newText as ArrayValueObject).getColumnCount() : 1,
            instanceNum?.isArray() ? (instanceNum as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const oldTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, oldText, ErrorValueObject.create(ErrorType.NA));
        const newTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, newText, ErrorValueObject.create(ErrorType.NA));
        const instanceNumArray = instanceNum ? expandArrayValueObject(maxRowLength, maxColumnLength, instanceNum, ErrorValueObject.create(ErrorType.NA)) : undefined;

        const resultArray = textArray.mapValue((textObject, rowIndex, columnIndex) => {
            const oldTextObject = oldTextArray.get(rowIndex, columnIndex) as BaseValueObject;
            const newTextObject = newTextArray.get(rowIndex, columnIndex) as BaseValueObject;
            let instanceNumObject = instanceNum ? (instanceNumArray as ArrayValueObject).get(rowIndex, columnIndex) as BaseValueObject : undefined;

            if (textObject.isError()) {
                return textObject;
            }

            if (oldTextObject.isError()) {
                return oldTextObject;
            }

            if (newTextObject.isError()) {
                return newTextObject;
            }

            if (instanceNumObject?.isError()) {
                return instanceNumObject;
            }

            if (instanceNumObject?.isNull() || instanceNumObject?.isBoolean()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (instanceNumObject?.isString()) {
                instanceNumObject = instanceNumObject.convertToNumberObjectValue();
            }

            if (instanceNumObject?.isError()) {
                return instanceNumObject;
            }

            return this._handleSingleObject(textObject, oldTextObject, newTextObject, instanceNumObject as NumberValueObject | undefined);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(text: BaseValueObject, oldText: BaseValueObject, newText: BaseValueObject, instanceNum: NumberValueObject | undefined): BaseValueObject {
        const textValue = this._getObjectString(text);
        const oldTextValue = this._getObjectString(oldText);
        const newTextValue = this._getObjectString(newText);
        const instanceNumValue = instanceNum ? Math.floor(+instanceNum.getValue()) : undefined;

        if (instanceNum && (instanceNumValue as number) <= 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (oldTextValue === '') {
            return StringValueObject.create(textValue);
        }

        let result = '';
        let num = 0;

        for (let i = 0; i < textValue.length; i++) {
            const str = textValue.substr(i, oldTextValue.length);

            if (str === oldTextValue || (str.length === oldTextValue.length && str.trim() === oldTextValue.trim())) {
                num++;

                if (num === instanceNumValue) {
                    result = textValue.substr(0, i) + newTextValue + textValue.substr(i + oldTextValue.length);
                    break;
                }

                if (instanceNumValue === undefined) {
                    result += newTextValue;
                }

                i += oldTextValue.length - 1;
            } else {
                if (instanceNumValue === undefined) {
                    result += textValue[i];
                }
            }
        }

        if (instanceNumValue && num < instanceNumValue) {
            result = textValue;
        }

        return StringValueObject.create(result);
    }

    private _getObjectString(variant: BaseValueObject): string {
        let value = `${variant.getValue()}`;

        if (variant.isNull()) {
            value = '';
        }

        if (variant.isBoolean()) {
            value = value.toLocaleUpperCase();
        }

        return value;
    }
}
