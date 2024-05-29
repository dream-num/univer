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

import type { IRange } from '@univerjs/core';

const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
const regex = new RegExp(expression);

export function isLegalLink(link:string) {
    return Boolean(link.match(regex));
}

export function hasProtocol(urlString: string) {
    const pattern = /^[a-zA-Z]+:\/\//;
    return pattern.test(urlString);
  }

export function isLegalRange(range: IRange) {
    const { startColumn, startRow, endColumn, endRow } = range;
    return !Number.isNaN(startColumn) && !Number.isNaN(startRow) && !Number.isNaN(endColumn) && !Number.isNaN(endRow);
}
