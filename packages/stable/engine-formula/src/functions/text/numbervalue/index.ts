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
import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Numbervalue extends BaseFunction {
    override minParams = 1;

    override maxParams = 3;

    override calculate(text: BaseValueObject, decimalSeparator?: BaseValueObject, groupSeparator?: BaseValueObject): BaseValueObject {
        const _decimalSeparator = decimalSeparator ?? StringValueObject.create('.');

        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            _decimalSeparator.isArray() ? (_decimalSeparator as ArrayValueObject).getRowCount() : 1,
            groupSeparator?.isArray() ? (groupSeparator as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            _decimalSeparator.isArray() ? (_decimalSeparator as ArrayValueObject).getColumnCount() : 1,
            groupSeparator?.isArray() ? (groupSeparator as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const decimalSeparatorArray = expandArrayValueObject(maxRowLength, maxColumnLength, _decimalSeparator, ErrorValueObject.create(ErrorType.NA));
        const groupSeparatorArray = groupSeparator ? expandArrayValueObject(maxRowLength, maxColumnLength, groupSeparator, ErrorValueObject.create(ErrorType.NA)) : undefined;

        const resultArray = textArray.mapValue((textObject, rowIndex, columnIndex) => {
            const decimalSeparatorObject = decimalSeparatorArray.get(rowIndex, columnIndex) as BaseValueObject;
            const groupSeparatorObject = groupSeparator ? (groupSeparatorArray as ArrayValueObject).get(rowIndex, columnIndex) as BaseValueObject : undefined;

            if (textObject.isError()) {
                return textObject;
            }

            if (decimalSeparatorObject.isError()) {
                return decimalSeparatorObject;
            }

            if (groupSeparatorObject?.isError()) {
                return groupSeparatorObject;
            }

            if (decimalSeparatorObject.isNull() || groupSeparatorObject?.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (textObject.isNull()) {
                return NumberValueObject.create(0);
            }

            return this._handleSingleObject(textObject, decimalSeparatorObject, groupSeparatorObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    // eslint-disable-next-line
    private _handleSingleObject(text: BaseValueObject, decimalSeparator: BaseValueObject, groupSeparator: BaseValueObject | undefined): BaseValueObject {
        let textValue = `${text.getValue()}`;
        textValue = textValue.replace(/\s+/g, '');

        let decimalSeparatorValue = `${decimalSeparator.getValue()}`;

        if (decimalSeparator.isBoolean()) {
            decimalSeparatorValue = decimalSeparatorValue.toLocaleUpperCase();
        }

        decimalSeparatorValue = decimalSeparatorValue.charAt(0);

        let groupSeparatorValue: string | undefined;

        if (groupSeparator) {
            groupSeparatorValue = `${groupSeparator.getValue()}`;

            if (groupSeparator.isBoolean()) {
                groupSeparatorValue = groupSeparatorValue.toLocaleUpperCase();
            }

            groupSeparatorValue = groupSeparatorValue.charAt(0);

            if (decimalSeparatorValue === groupSeparatorValue) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
        }

        if (textValue.trim() === '') {
            return NumberValueObject.create(0);
        }

        if (!textValue.match(/^\s*[+-]?\s*(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?[ \t]*/)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const splitText = textValue.split(decimalSeparatorValue);

        if (splitText.length > 2) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let integerPart = splitText[0].replace(/,/g, '');

        if (groupSeparator) {
            integerPart = integerPart.split(groupSeparatorValue as string).join('');
        }

        let result = 0;

        if (splitText.length === 1) {
            if (decimalSeparatorValue === ',') {
                integerPart = integerPart.replace(/\./g, '');
            }

            let percentageCount = 0;

            while (integerPart.endsWith('%')) {
                integerPart = integerPart.slice(0, -1);
                percentageCount++;
            }

            if (percentageCount > 0) {
                result = +integerPart / (100 ** percentageCount);
            } else {
                result = +integerPart;
            }
        } else {
            if (!isRealNum(integerPart)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            let decimalPart = splitText[1];

            let percentageCount = 0;

            while (decimalPart.endsWith('%')) {
                decimalPart = decimalPart.slice(0, -1);
                percentageCount++;
            }

            const resultText = `${integerPart}.${decimalPart}`;

            if (!isRealNum(resultText)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (percentageCount > 0) {
                result = +resultText / (100 ** percentageCount);
            } else {
                result = +resultText;
            }
        }

        if (Number.isNaN(result)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return NumberValueObject.create(result);
    }
}
