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

/**
 * Determine whether it is a pure number, "12" and "12e+3" are both true
 * @param val The number or string to be judged
 * @returns Result
 */
export function isRealNum(val: string | number | boolean): boolean {
    if (val === null || val === undefined) {
        return false;
    }

    if (typeof val === 'boolean') {
        return false;
    }

    if (typeof val === 'number') {
        return !isNaN(val);
    }

    if (typeof val === 'string') {
        const trimmedVal = val.trim();
        if (trimmedVal === '') {
            return false;
        }
        return !isNaN(Number(trimmedVal));
    }

    return false;
}
