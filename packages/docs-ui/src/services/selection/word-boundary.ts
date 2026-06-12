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

import { Direction } from '@univerjs/core';

export interface IWordBoundary {
    startOffset: number;
    endOffset: number;
}

interface IWordRange {
    start: number;
    end: number;
}

function getWordRanges(content: string): IWordRange[] {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });

    return Array.from(segmenter.segment(content))
        .filter((item) => item.isWordLike)
        .map((item) => ({
            start: item.index,
            end: item.index + item.segment.length,
        }));
}

export function getWordBoundaryByIndex(
    content: string,
    nodeIndex: number,
    paragraphStartOffset: number
): IWordBoundary | null {
    if (nodeIndex < 0) {
        return null;
    }

    const range = getWordRanges(content).find((range) => range.start <= nodeIndex && nodeIndex < range.end);

    if (range == null) {
        return null;
    }

    return {
        startOffset: paragraphStartOffset + range.start,
        endOffset: paragraphStartOffset + range.end,
    };
}

export function getNextWordBoundaryOffset(
    content: string,
    nodeIndex: number,
    paragraphStartOffset: number,
    direction: Direction
): number | null {
    if (nodeIndex < 0) {
        return null;
    }

    const ranges = getWordRanges(content);

    if (direction === Direction.LEFT) {
        for (let i = ranges.length - 1; i >= 0; i--) {
            const range = ranges[i];
            if (range.start < nodeIndex) {
                return paragraphStartOffset + range.start;
            }
        }

        return paragraphStartOffset;
    }

    if (direction === Direction.RIGHT) {
        const target = ranges.find((range) => range.end > nodeIndex);
        return paragraphStartOffset + (target?.end ?? content.length);
    }

    return null;
}
