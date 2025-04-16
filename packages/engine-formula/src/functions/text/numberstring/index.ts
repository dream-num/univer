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
import type { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

const chineseLowercaseNumbers = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const chineseUppercaseNumbers = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const chineseLowercaseUnits = ['', '十', '百', '千'];
const chineseUppercaseUnits = ['', '拾', '佰', '仟'];
const suffixUnits = ['', '万', '亿', '兆'];

export class Numberstring extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(number: BaseValueObject, type: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const typeArray = expandArrayValueObject(maxRowLength, maxColumnLength, type, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.mapValue((numberObject, rowIndex, columnIndex) => {
            const typeObject = typeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (numberObject.isError()) {
                return numberObject;
            }

            if (typeObject.isError()) {
                return typeObject;
            }

            return this._handleSingleObject(numberObject, typeObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    // eslint-disable-next-line
    private _handleSingleObject(number: BaseValueObject, type: BaseValueObject): BaseValueObject {
        const _number = number.convertToNumberObjectValue();

        if (_number.isError()) {
            return _number;
        }

        const _type = type.convertToNumberObjectValue();

        if (_type.isError()) {
            return _type;
        }

        let numberValue = (_number as NumberValueObject).getValue();
        const typeValue = Math.trunc((_type as NumberValueObject).getValue());

        if (numberValue < 0 || ![1, 2, 3].includes(typeValue)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        numberValue = Math.round(numberValue);

        const numberString = numberValue.toString();
        const len = numberString.length;

        let result = '';
        let hasZero = false;

        for (let i = 0; i < len; i++) {
            const num = Number(numberString[i]);

            // 0
            if (len === 1 && num === 0) {
                result += typeValue === 2 ? chineseUppercaseNumbers[0] : chineseLowercaseNumbers[0];
                break;
            }

            // type is 3, directly return the chinese lowercase equivalent of a number.
            if (typeValue === 3) {
                result += chineseLowercaseNumbers[num];
                continue;
            }

            // type is 1 or 2, return chinese currency format in lowercase or uppercase of a number.
            const pos = len - i - 1;
            const unit = pos % 4;
            const suffixUnit = Math.trunc(pos / 4);

            if (len >= 17 && suffixUnit > 2) {
                result += typeValue === 1 ? chineseLowercaseNumbers[num] : chineseUppercaseNumbers[num];

                if (suffixUnit > 3) {
                    continue;
                }
            } else {
                if (num === 0) {
                    hasZero = unit !== 0;
                } else {
                    if (hasZero) {
                        result += typeValue === 1 ? chineseLowercaseNumbers[0] : chineseUppercaseNumbers[0];
                        hasZero = false;
                    }

                    result += typeValue === 1 ? chineseLowercaseNumbers[num] + chineseLowercaseUnits[unit] : chineseUppercaseNumbers[num] + chineseUppercaseUnits[unit];
                }
            }

            if (unit === 0 && suffixUnit > 0) {
                const segment = numberString.slice(Math.max(0, i - 3), i + 1);

                if (segment !== '0000') {
                    result += suffixUnits[suffixUnit];
                }
            }
        }

        return StringValueObject.create(result);
    }
}
