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

import type { ErrorType } from './error-type';
import { ERROR_TYPE_SET } from './error-type';

export const NUMBER_LITERAL_REGEX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/** Parse the contents between array braces in canonical formula syntax. */
export function parseArrayConstant(value: string, formula = true): string[][] | null {
    const rows: string[][] = [[]];
    let start = 0;
    let inQuotes = false;
    for (let index = 0; index <= value.length; index++) {
        const character = value[index];
        if (character === '"') {
            if (inQuotes && value[index + 1] === '"') {
                index++;
                continue;
            }
            inQuotes = !inQuotes;
        }
        if (index === value.length || (!inQuotes && (character === ',' || character === ';'))) {
            const token = value.slice(start, index).trim();
            if (formula && !NUMBER_LITERAL_REGEX.test(token) && !/^"(?:[^"]|"")*"$/.test(token) &&
                !/^(?:TRUE|FALSE)$/i.test(token) && !ERROR_TYPE_SET.has(token.toUpperCase() as ErrorType)) {
                return null;
            }
            const row = rows[rows.length - 1];
            row.push(token);
            if (formula && character !== ',' && row.length !== rows[0].length) return null;
            start = index + 1;
            if (character === ';') {
                rows.push([]);
            }
        }
    }
    return inQuotes ? null : rows;
}
