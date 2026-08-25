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

import type { DateSystem } from '@univerjs/core';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import { numfmt } from '@univerjs/core';
import { stripErrorMargin } from '../engine/utils/math-kit';

/**
 * Convert a number to a preview string using the specified pattern.
 *
 * @param pattern Number format pattern.
 * @param value Number to format.
 * @returns Formatted preview string.
 */
export const getFormatPreview = (pattern: string, value: number, dateSystem?: DateSystem) => {
    return numfmt.format(pattern, value, { dateSystem, throws: false });
};

export const getTextValueOfNumberFormat = (text: BaseValueObject): string => {
    let textValue = `${text.getValue()}`;

    if (text.isNull()) {
        textValue = '';
    }

    if (text.isBoolean()) {
        textValue = textValue.toLocaleUpperCase();
    }

    if (text.isNumber()) {
        if (text.getPattern() !== '') {
            textValue = getFormatPreview(text.getPattern(), +text.getValue(), text.getDateSystem());
        } else {
            // Specify Number.EPSILON to not discard necessary digits in the case of non-precision errors, for example, the length of 1/3 is 17
            textValue = `${stripErrorMargin(+text.getValue())}`;
        }
    }

    return textValue;
};
