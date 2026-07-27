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

import type { IDocumentBody } from '@univerjs/core';
import type { IFindQuery } from '@univerjs/find-replace';
import { regexp } from '@univerjs/core';

export interface IDocFindRange {
    startOffset: number;
    endOffset: number;
    replaceable: boolean;
}

export function findDocRanges(body: IDocumentBody, query: IFindQuery, disabled: boolean): IDocFindRange[] {
    if (!query.findString) return [];

    const expression = regexp.createLiteralRegExp(query.findString, query.caseSensitive ? 'gu' : 'giu');
    const wordRanges = query.matchesTheWholeWord
        ? new Set(Array.from(new Intl.Segmenter(undefined, { granularity: 'word' }).segment(body.dataStream))
            .filter((item) => item.isWordLike)
            .map((item) => `${item.index}:${item.index + item.segment.length}`))
        : null;
    return Array.from(body.dataStream.matchAll(expression))
        .filter((match) => {
            return wordRanges?.has(`${match.index}:${match.index + match[0].length}`) ?? true;
        })
        .map((match) => {
            const startOffset = match.index;
            const endOffset = startOffset + match[0].length;
            const overlapsWholeEntity = body.customRanges?.some((range) =>
                range.wholeEntity && range.startIndex < endOffset && range.endIndex + 1 > startOffset
            ) ?? false;

            return { startOffset, endOffset, replaceable: !disabled && !overlapsWholeEntity };
        });
}
