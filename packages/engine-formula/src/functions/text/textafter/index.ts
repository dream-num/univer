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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Textafter extends BaseFunction {
    override minParams = 2;

    override maxParams = 6;

    override calculate(text: BaseValueObject, delimiter: BaseValueObject, instanceNum?: BaseValueObject, matchMode?: BaseValueObject, matchEnd?: BaseValueObject, ifNotFound?: BaseValueObject) {
        const onlyThreeVariant = !matchMode;

        instanceNum = instanceNum ?? NumberValueObject.create(1);
        matchMode = matchMode ?? NumberValueObject.create(0);
        matchEnd = matchEnd ?? NumberValueObject.create(0);
        ifNotFound = ifNotFound ?? ErrorValueObject.create(ErrorType.NA);

        if (delimiter.isArray()) {
            delimiter = (delimiter as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        // get max row length
        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            instanceNum?.isArray() ? (instanceNum as ArrayValueObject).getRowCount() : 1,
            matchMode?.isArray() ? (matchMode as ArrayValueObject).getRowCount() : 1,
            matchEnd?.isArray() ? (matchEnd as ArrayValueObject).getRowCount() : 1,
            ifNotFound?.isArray() ? (ifNotFound as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            instanceNum?.isArray() ? (instanceNum as ArrayValueObject).getColumnCount() : 1,
            matchMode?.isArray() ? (matchMode as ArrayValueObject).getColumnCount() : 1,
            matchEnd?.isArray() ? (matchEnd as ArrayValueObject).getColumnCount() : 1,
            ifNotFound?.isArray() ? (ifNotFound as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const instanceNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, instanceNum, ErrorValueObject.create(ErrorType.NA));
        const matchModeArray = expandArrayValueObject(maxRowLength, maxColumnLength, matchMode, ErrorValueObject.create(ErrorType.NA));
        const matchEndArray = expandArrayValueObject(maxRowLength, maxColumnLength, matchEnd, ErrorValueObject.create(ErrorType.NA));
        const ifNotFoundArray = expandArrayValueObject(maxRowLength, maxColumnLength, ifNotFound, ErrorValueObject.create(ErrorType.NA));

        const resultArray = textArray.map((textObject, rowIndex, columnIndex) => {
            let instanceNumObject = instanceNumArray.get(rowIndex, columnIndex) as BaseValueObject;
            let matchModeObject = matchModeArray.get(rowIndex, columnIndex) as BaseValueObject;
            let matchEndObject = matchEndArray.get(rowIndex, columnIndex) as BaseValueObject;
            const ifNotFoundObject = ifNotFoundArray.get(rowIndex, columnIndex) as BaseValueObject;

            // variant error order (text > instanceNum > matchMode > matchEnd > delimiter)
            if (textObject.isError()) {
                return textObject;
            }

            if (instanceNumObject.isError()) {
                return instanceNumObject;
            }

            if (matchModeObject.isError()) {
                return matchModeObject;
            }

            if (matchEndObject.isError()) {
                return matchEndObject;
            }

            if (delimiter.isError()) {
                return delimiter;
            }

            let textValue = textObject.getValue() as string;

            if (textObject.isNull()) {
                textValue = '';
            }

            if (textObject.isBoolean()) {
                textValue = textValue ? 'TRUE' : 'FALSE';
            }

            textValue += '';

            let delimiterValue = delimiter.getValue() as string;

            if (delimiter.isNull()) {
                delimiterValue = '';
            }

            if (delimiter.isBoolean()) {
                delimiterValue = delimiterValue ? 'TRUE' : 'FALSE';
            }

            delimiterValue += '';

            if (instanceNumObject.isString()) {
                instanceNumObject = instanceNumObject.convertToNumberObjectValue();

                if (instanceNumObject.isError()) {
                    return instanceNumObject;
                }
            }

            const instanceNumValue = Math.floor(+instanceNumObject.getValue());

            // if instance_num = 0 returns a #VALUE! error
            if (instanceNumValue === 0) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (matchModeObject.isString()) {
                matchModeObject = matchModeObject.convertToNumberObjectValue();

                if (matchModeObject.isError()) {
                    return matchModeObject;
                }
            }

            const matchModeValue = Math.floor(+matchModeObject.getValue());

            if (matchModeValue < 0 || matchModeValue > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (matchEndObject.isString()) {
                matchEndObject = matchEndObject.convertToNumberObjectValue();

                if (matchEndObject.isError()) {
                    return matchEndObject;
                }
            }

            const matchEndValue = Math.floor(+matchEndObject.getValue());

            if (matchEndValue < 0 || matchEndValue > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            // When searching with an empty delimiter value, TEXTAFTER matches immediately.
            // It returns the entire text when searching from the front (if instance_num is positive) and empty text when searching from the end (if instance_num is negative).
            if (delimiterValue === '') {
                if (instanceNumValue > 0) {
                    return StringValueObject.create(textValue);
                } else {
                    return StringValueObject.create('');
                }
            }

            // if instance_num is greater than the length of text returns a #VALUE! error
            if (Math.abs(instanceNumValue) > textValue.length) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const matchNum = textValue.match(new RegExp(delimiterValue, `g${!matchModeValue ? '' : 'i'}`));

            // only three variant and if instance_num is greater than the number of occurrences of delimiter. returns a #N/A error
            if (matchNum && matchNum.length < Math.abs(instanceNumValue) && onlyThreeVariant) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            if (!matchNum || matchNum.length < Math.abs(instanceNumValue)) {
                if (matchEndValue) {
                    if (instanceNumValue > 0) {
                        return StringValueObject.create('');
                    } else {
                        return StringValueObject.create(textValue);
                    }
                }

                return ifNotFoundObject;
            }

            let substrText = !matchModeValue ? textValue : textValue.toLocaleLowerCase();
            delimiterValue = !matchModeValue ? delimiterValue : delimiterValue.toLocaleLowerCase();

            let resultIndex = 0;

            for (let i = 0; i < Math.abs(instanceNumValue); i++) {
                if (instanceNumValue < 0) {
                    const index = substrText.lastIndexOf(delimiterValue);
                    resultIndex = index;
                    substrText = substrText.substr(0, index);
                } else {
                    const index = substrText.indexOf(delimiterValue);
                    resultIndex += (index + i * delimiterValue.length);
                    substrText = substrText.substr(index + delimiterValue.length);
                }
            }

            const result = textValue.substr(resultIndex + delimiterValue.length);

            return StringValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as StringValueObject;
        }

        return resultArray;
    }
}
