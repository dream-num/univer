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

import type { IDeleteAction, IDocumentBody, IRetainAction, ITextRange } from '@univerjs/core';
import { TextXActionType } from '@univerjs/core';
import { isIntersecting, shouldDeleteCustomRange } from './custom-range';

export function getRetainAndDeleteFromReplace(
    range: ITextRange,
    segmentId: string = '',
    memoryCursor: number,
    body: IDocumentBody
) {
    const { startOffset, endOffset } = range;
    const dos: Array<IRetainAction | IDeleteAction> = [];
    const textStart = startOffset - memoryCursor;
    const textEnd = endOffset - memoryCursor;
    const dataStream = body.dataStream;
    const relativeCustomRanges = body.customRanges?.filter((customRange) => isIntersecting(customRange.startIndex, customRange.endIndex, startOffset, endOffset));
    const toDeleteRanges = new Set(relativeCustomRanges?.filter((customRange) => shouldDeleteCustomRange(startOffset, endOffset - startOffset, customRange, dataStream)));
    const retainPoints = new Set<number>();
    relativeCustomRanges?.forEach((range) => {
        if (toDeleteRanges.has(range)) {
            return;
        }

        if (range.startIndex - memoryCursor >= textStart &&
            range.startIndex - memoryCursor <= textEnd &&
            range.endIndex - memoryCursor > textEnd) {
            retainPoints.add(range.startIndex);
        }
        if (range.endIndex - memoryCursor >= textStart &&
            range.endIndex - memoryCursor <= textEnd &&
            range.startIndex < textStart) {
            retainPoints.add(range.endIndex);
        }
    });

    if (textStart > 0) {
        dos.push({
            t: TextXActionType.RETAIN,
            len: textStart,
            segmentId,
        });
    }

    const sortedRetains = [...retainPoints].sort((pre, aft) => pre - aft);
    let cursor = textStart;
    sortedRetains.forEach((pos) => {
        const len = pos - cursor;
        if (len > 0) {
            dos.push({
                t: TextXActionType.DELETE,
                len,
                line: 0,
                segmentId,
            });
        }
        dos.push({
            t: TextXActionType.RETAIN,
            len: 1,
            segmentId,
        });
        cursor = pos + 1;
    });

    if (cursor < textEnd) {
        dos.push({
            t: TextXActionType.DELETE,
            len: textEnd - cursor,
            line: 0,
            segmentId,
        });
        cursor = textEnd + 1;
    }

    return {
        dos,
        cursor,
        retain: retainPoints.size,
    };
}
