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
import { getFormatPreview } from '../../../basics/format';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Text extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(text: BaseValueObject, formatText: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (formatText.isError()) {
            return formatText;
        }

        // get max row length
        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            formatText.isArray() ? (formatText as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            formatText.isArray() ? (formatText as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text);
        const formatTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, formatText);

        return textArray.map((textValue, rowIndex, columnIndex) => {
            if (textValue.isError() || textValue.isString() || textValue.isBoolean()) {
                return textValue;
            }

            let formatTextValue = formatTextArray.get(rowIndex, columnIndex) || StringValueObject.create(' ');

            if (formatTextValue.isError()) {
                return formatTextValue;
            }

            if (formatTextValue.isBoolean()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (formatTextValue.isNull()) {
                formatTextValue = StringValueObject.create(' ');
            }

            const formatTextValueString = `${formatTextValue.getValue()}`;

            if (textValue.isNull()) {
                textValue = NumberValueObject.create(0);
            }

            const textValueNumber = textValue.getValue() as number;

            const previewText = getFormatPreview(formatTextValueString, textValueNumber);

            return StringValueObject.create(previewText);
        });
    }
}
