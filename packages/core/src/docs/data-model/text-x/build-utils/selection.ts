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

import type { Nullable } from '../../../../shared';
import type { ITextRange } from '../../../../sheets/typedef';
import type { IParagraph, IParagraphRange } from '../../../../types/interfaces';

export function makeSelection(startOffset: number, endOffset?: number): ITextRange {
    if (typeof endOffset === 'undefined') {
        return { startOffset, endOffset: startOffset, collapsed: true };
    }

    if (endOffset < startOffset) {
        throw new Error(`Cannot make a doc selection when endOffset ${endOffset} is less than startOffset ${startOffset}.`);
    }

    return { startOffset, endOffset, collapsed: startOffset === endOffset };
}

export function normalizeSelection(selection: ITextRange): ITextRange {
    const { startOffset, endOffset, collapsed } = selection;
    const start = Math.min(startOffset, endOffset);
    const end = Math.max(startOffset, endOffset);

    return {
        startOffset: start,
        endOffset: end,
        collapsed,
    };
}

export function isSegmentIntersects(start: number, end: number, start2: number, end2: number) {
    return Math.max(start, start2) <= Math.min(end, end2);
}

export function getParagraphsInRange(activeRange: ITextRange, paragraphs: IParagraph[]) {
    const { startOffset, endOffset } = activeRange;
    const results: IParagraphRange[] = [];

    let start = -1;

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const prevParagraph: Nullable<IParagraph> = paragraphs[i - 1];
        const { startIndex } = paragraph;

        if ((startOffset > start && startOffset <= startIndex) || (endOffset > start && endOffset <= startIndex)) {
            results.push({
                ...paragraph,
                paragraphStart: (prevParagraph?.startIndex ?? -1) + 1,
                paragraphEnd: paragraph.startIndex,
            });
        } else if (startIndex >= startOffset && startIndex <= endOffset) {
            results.push({
                ...paragraph,
                paragraphStart: (prevParagraph?.startIndex ?? -1) + 1,
                paragraphEnd: paragraph.startIndex,
            });
        }

        start = startIndex;
    }

    return results;
}

export function getParagraphsInRanges(ranges: readonly ITextRange[], paragraphs: IParagraph[]) {
    const results: IParagraphRange[] = [];

    for (const range of ranges) {
        const ps = getParagraphsInRange(range, paragraphs);

        results.push(...ps);
    }

    return results;
}
