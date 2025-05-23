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
export function willLoseNumericPrecision(str: string): boolean {
    return Number(str) > Number.MAX_SAFE_INTEGER || str.length >= 18;
}
