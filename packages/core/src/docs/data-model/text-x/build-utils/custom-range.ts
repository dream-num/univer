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

import { DataStreamTreeTokenType, generateRandomId, Tools } from '@univerjs/core';
import type { ICustomRange, ITextRange } from '@univerjs/core';

export function isCustomRangeSplitSymbol(text: string) {
    return text === DataStreamTreeTokenType.CUSTOM_RANGE_END || text === DataStreamTreeTokenType.CUSTOM_RANGE_START;
}

export function isIntersecting(line1Start: number, line1End: number, line2Start: number, line2End: number) {
    if ((line1Start <= line2Start && line1End >= line2Start) ||
        (line1Start >= line2Start && line1Start <= line2End)) {
        return true;
    }
    return false;
}

export function shouldDeleteCustomRange(deleteStart: number, deleteLen: number, customRange: ICustomRange, dataStream: string) {
    const dataStreamSlice = dataStream.slice(customRange.startIndex + 1, customRange.endIndex);
    const start = Math.max(deleteStart - (customRange.startIndex + 1), 0);
    const end = (deleteStart + deleteLen - 1) - (customRange.startIndex + 1);

    if (end < 0) {
        return false;
    }

    if (start === 0 && end >= dataStreamSlice.length) {
        return true;
    }

    const result = dataStreamSlice.slice(0, start) + dataStreamSlice.slice(start + deleteLen);

    for (let i = 0, len = result.length; i < len; i++) {
        const letter = result[i];
        if (!isCustomRangeSplitSymbol(letter)) {
            return false;
        }
    }

    return true;
}

export function getCustomRangesInterestsWithRange(range: ITextRange, customRanges: ICustomRange[]) {
    const result: ICustomRange[] = [];
    for (let i = 0, len = customRanges.length; i < len; i++) {
        const customRange = customRanges[i];
        if (range.collapsed) {
            if (customRange.startIndex < range.startOffset && range.startOffset <= customRange.endIndex) {
                result.push(customRange);
            }
        } else {
            if (isIntersecting(range.startOffset, range.endOffset, customRange.startIndex, customRange.endIndex)) {
                result.push(customRange);
            }
        }
    }

    return result;
}

export function copyCustomRange(range: ICustomRange) {
    return {
        ...Tools.deepClone(range),
        rangeId: generateRandomId(),
    };
}

export function excludePointsFromRange(range: [number, number], points: number[]): [number, number][] {
    const newRanges = [];
    let start = range[0];

    for (const point of points) {
        if (point < range[0] || point > range[1]) {
            continue;
        }

        if (start < point) {
            newRanges.push([start, point - 1] as [number, number]);
        }

        start = point + 1;
    }

    if (start <= range[1]) {
        newRanges.push([start, range[1]] as [number, number]);
    }

    return newRanges;
}

