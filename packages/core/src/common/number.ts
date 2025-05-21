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

export function isNumeric(str: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(str);
}

export function isSafeNumeric(str: string): boolean {
    const numeric = isNumeric(str);
    if (!numeric) {
        return false;
    }

    return Number(str) <= Number.MAX_SAFE_INTEGER;
}

/**
 * Whether the numeric string will lose precision when converted to a number.
 * e.g. '123456789123456789' -> 123456789123456780
 * e.g. '1212121212121212.2345' -> 1212121212121212.2
 */
export function isNumericWillLosePrecision(str: string): boolean {
    const num = Number(str);

    if (num > Number.MAX_SAFE_INTEGER) {
        return true;
    }

    const normalizeStr = str
        .replace(/^\+/, '') // Remove the leading plus sign, e.g. +123 -> 123
        .replace(/^(-?)0+(\d)/, '$1$2') // Remove leading zeros, e.g. 000123 -> 123
        .replace(/(\.\d*?[1-9])0+$/, '$1') // Remove the trailing zeros after the decimal point, e.g. 123.4500 -> 123.45
        .replace(/\.0*$/, ''); // If the number is an integer, remove the decimal point and trailing zeros, e.g. 123.0 -> 123

    return normalizeStr !== num.toString();
}
