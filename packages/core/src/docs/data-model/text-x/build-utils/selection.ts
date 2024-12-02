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

import type { ITextRange } from '../../../../sheets/typedef';

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

