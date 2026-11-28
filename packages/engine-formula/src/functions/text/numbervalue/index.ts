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

import { getRegionalNumberFormat, normalizeNativeDigits } from '@univerjs/core';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, parseFormulaNumericText, StringValueObject } from '../../../engine/value-object/primitive-object';
import { RegionalNumberFormatFunction } from '../regional-number-format.function';

export class Numbervalue extends RegionalNumberFormatFunction {
    override needsLocale = true;

    override minParams = 1;

    override maxParams = 3;

    override isArgumentsIgnoreNumberPattern(): boolean {
        return true;
    }

    override calculate(text: BaseValueObject, decimalSeparator?: BaseValueObject, groupSeparator?: BaseValueObject): BaseValueObject {
        const _decimalSeparator = decimalSeparator ?? StringValueObject.create(getRegionalNumberFormat(this.getNumberFormatRegion()).decimal);

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

    protected _handleSingleObject(text: BaseValueObject, decimalSeparator: BaseValueObject, groupSeparator: BaseValueObject | undefined): BaseValueObject {
        const region = this.getNumberFormatRegion();
        const format = getRegionalNumberFormat(region);
        const separator = (value: BaseValueObject) => {
            const string = String(value.getValue());
            return (value.isBoolean() ? string.toUpperCase() : string).charAt(0);
        };
        const decimal = separator(decimalSeparator);
        const defaultGroup = format.group || (format.decimal === '.' ? ',' : '٬');
        const group = groupSeparator ? separator(groupSeparator) : defaultGroup;
        if (groupSeparator && group === decimal) return ErrorValueObject.create(ErrorType.VALUE);
        let content = String(text.getValue()).replace(/\s+/g, '');
        if (/[^\p{ASCII}]/u.test(content)) content = normalizeNativeDigits(content, region, this.getLocale()).value;
        if (text.isNumber()) content = content.replace('.', format.decimal);
        if (!content) return NumberValueObject.create(0);
        const percent = content.match(/%+$/)?.[0].length ?? 0;
        if (percent) content = content.slice(0, -percent);
        const parts = decimal ? content.split(decimal) : [content];
        if (parts.length > 2 || (group && group !== decimal && parts[1]?.includes(group))) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (group && group !== decimal) parts[0] = parts[0].split(group).join('');
        const parsed = parseFormulaNumericText(parts.join(format.decimal), text.getDateSystem(), region, this.getLocale());
        return parsed && 'v' in parsed && !parsed.z?.includes('%')
            ? NumberValueObject.create(parsed.v / 100 ** percent)
            : ErrorValueObject.create(ErrorType.VALUE);
    }
}
