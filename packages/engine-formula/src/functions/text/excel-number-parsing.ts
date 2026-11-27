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

import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { Numbervalue } from './numbervalue';
import { Value } from './value';

export class ExcelValue extends Value {
    protected override _handleSingleObject(value: BaseValueObject): BaseValueObject {
        if (value.isString() && invalidValueText(String(value.getValue()))) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        return super._handleSingleObject(value);
    }
}

function invalidValueText(raw: string): boolean {
    const text = raw.trim();
    return /[₩¥£￥０-９]/u.test(text) ||
        /[$€]$/u.test(text) ||
        /%(?!\s*\)?$)/u.test(text) ||
        /[0-9][Ee][^,]*,/u.test(text) ||
        (!text.includes('/') && hasNumericGap(text));
}

function hasNumericGap(text: string): boolean {
    return text.split(/\s+/u).some((left, index, parts) => {
        const right = parts[index + 1];
        return right !== undefined && /[0-9]$/u.test(left) && /^[0-9]/u.test(right) &&
            !(right.includes(':') && /^\d{1,4}-\d{1,2}-\d{1,4}$/u.test(left));
    });
}

interface INumbervalueText {
    text: string;
    negative: boolean;
    percentCount: number;
}

function splitNumbervalueText(compact: string): INumbervalueText | undefined {
    let text = compact.replace(/%+$/u, '');
    let percentCount = compact.length - text.length;
    if (text === '') return { text, negative: false, percentCount };

    const sign = /^[+-]/u.test(text) ? text[0] : '';
    text = text.slice(sign.length);
    const currency = /^[$€]/u.test(text);
    if (currency) text = text.slice(1);
    if (text.startsWith('(') && text.endsWith(')')) {
        const inner = text.slice(1, -1);
        text = inner.replace(/%+$/u, '');
        const innerPercent = inner.length - text.length;
        const innerCurrency = /^[$€]/u.test(text);
        if (innerCurrency) text = text.slice(1);
        if (sign !== '' || (currency && innerCurrency) || (innerPercent > 0 && (currency || innerCurrency)) ||
            /^[+-]/u.test(text) || text === '') {
            return;
        }
        percentCount += innerPercent;
        return { text, negative: true, percentCount };
    }
    if (text === '' || (sign !== '' && /^[+-]/u.test(text))) return;
    return { text, negative: sign === '-', percentCount };
}

function parseNumbervalueDate(text: string, original: BaseValueObject): number {
    if (!/^\d+(?:\/\d+){1,2}$|^\d+(?::\d+){1,2}$/u.test(text)) return Number.NaN;
    return Number(StringValueObject.create(text).withDateSystem(original.getDateSystem()).convertToNumberObjectValue().getValue());
}

export class ExcelNumbervalue extends Numbervalue {
    protected override _handleSingleObject(value: BaseValueObject, decimal: BaseValueObject, group: BaseValueObject | undefined): BaseValueObject {
        const decimalSeparator = String(decimal.getValue()).charAt(0);
        const groupSeparator = group ? String(group.getValue()).charAt(0) : decimalSeparator === ',' ? '.' : ',';
        if (decimalSeparator === '' || groupSeparator === '' || decimalSeparator === groupSeparator) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        const sum = splitNumbervalueText(String(value.getValue()).replace(/[\t\n\v\f\r ]+/gu, ''));
        if (!sum) return ErrorValueObject.create(ErrorType.VALUE);
        const { text, negative, percentCount } = sum;
        const [integer, fraction, ...other] = text.split(decimalSeparator);
        if (other.length > 0 || fraction?.includes(groupSeparator)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        const normalized = integer.split(groupSeparator).join('') + (fraction === undefined ? '' : `.${fraction}`);
        const numericText = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?$/u;
        const number = normalized === '' ? 0 : numericText.test(normalized) ? Number(normalized) : parseNumbervalueDate(text, value);
        if (!Number.isFinite(number)) return ErrorValueObject.create(ErrorType.VALUE);
        return NumberValueObject.create((negative ? -number : number) / 100 ** percentCount + 0);
    }
}
