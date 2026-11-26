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
import { getNumfmtParseValueFilter, isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { getFormatPreview } from '../../../basics/format';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { parseFormulaNumericText, StringValueObject } from '../../../engine/value-object/primitive-object';
import { RegionalNumberFormatFunction } from '../regional-number-format.function';

export class Text extends RegionalNumberFormatFunction {
    override minParams = 2;

    override maxParams = 2;

    override isArgumentsIgnoreNumberPattern() {
        return true;
    }

    protected getFormatInput(value: BaseValueObject): number | string {
        if (value.isNull()) return 0;
        if (value.isBoolean()) return value.getValue() ? 'TRUE' : 'FALSE';
        if (value.isNumber()) return Number(value.getValue());
        const raw = String(value.getValue());
        if (isRealNum(raw)) return Number(raw);
        if (raw.includes(',')) {
            const region = this.getNumberFormatRegion();
            const parsed = parseFormulaNumericText(raw, region ? () => region : undefined);
            if (parsed) return 'v' in parsed ? parsed.v : raw;
        }
        const parsed = getNumfmtParseValueFilter(raw, { dateSystem: value.getDateSystem() });
        return typeof parsed?.v === 'number' ? parsed.v : raw;
    }

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

        const resultArray = textArray.map((textValue, rowIndex, columnIndex) => {
            if (textValue.isError()) {
                return textValue;
            }

            let formatTextValue = formatTextArray.get(rowIndex, columnIndex) || StringValueObject.create(' ');

            if (formatTextValue.isError()) {
                return formatTextValue;
            }

            if (formatTextValue.isBoolean()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (textValue.isBoolean()) {
                return textValue;
            }

            if (formatTextValue.isNull()) {
                formatTextValue = StringValueObject.create(' ');
            }

            const formatTextValueString = `${formatTextValue.getValue()}`;
            const normalizedFormatTextValueString = normalizeExcelWeekdayFormat(formatTextValueString);

            const previewText = getFormatPreview(
                normalizedFormatTextValueString,
                this.getFormatInput(textValue),
                textValue.getDateSystem(),
                this.getNumberFormatRegion()
            );

            return StringValueObject.create(formatTextValueString === ' ' ? previewText.trimEnd() : previewText);
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}

export function normalizeExcelWeekdayFormat(formatText: string): string {
    if (!formatText.includes('\u00C5')) {
        return formatText;
    }

    return formatText.replace(/\u00C5{4,}/g, 'dddd').replace(/\u00C5{1,3}/g, 'ddd');
}
