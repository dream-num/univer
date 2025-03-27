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

import type { ITextRun } from '../types/interfaces/i-document-data';

interface AnyObject {
    [key: number | string]: AnyObject | AnyObject[] | Array<[number | string]> | any;
}

export function deepCompare(arg1: AnyObject, arg2: AnyObject): boolean {
    if (Object.prototype.toString.call(arg1) === Object.prototype.toString.call(arg2)) {
        if (
            Object.prototype.toString.call(arg1) === '[object Object]' ||
            Object.prototype.toString.call(arg1) === '[object Array]'
        ) {
            if (Object.keys(arg1).length !== Object.keys(arg2).length) {
                return false;
            }
            return Object.keys(arg1).every((key) => deepCompare(arg1[key] as AnyObject, arg2[key] as AnyObject));
        }
        return arg1 === arg2;
    }
    return false;
}

export function isSameStyleTextRun(tr1: ITextRun, tr2: ITextRun) {
    const ts1 = tr1.ts || {};
    const ts2 = tr2.ts || {};

    if (tr1.sId !== tr2.sId) {
        return false;
    }

    return deepCompare(ts1, ts2);
}

export function checkForSubstrings(searchString: string, substrings: string[]): boolean {
    return substrings.some((substring) => searchString.indexOf(substring) > -1);
}
