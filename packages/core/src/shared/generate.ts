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

/**
 * Determine whether it is a pure number, "12" and "12e+3" are both true
 * @param val The number or string to be judged
 * @returns Result
 */
const $blank = /\s/g;
export function isRealNum(val: string | number | boolean) {
    if (val === null || val.toString().replace($blank, '') === '') {
        return false;
    }

    if (typeof val === 'boolean') {
        return false;
    }

    if (!isNaN(val as number)) {
        return true;
    }
    return false;
}
