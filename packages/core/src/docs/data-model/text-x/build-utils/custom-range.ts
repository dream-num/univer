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

import type { ITextRange } from '../../../../sheets/typedef';
import type { CustomRangeType, ICustomRange, IDocumentBody } from '../../../../types/interfaces';
import { generateRandomId, Tools } from '../../../../shared';

/**
 * Check if two ranges intersect
 * @param line1Start - The start of the first range
 * @param line1End - The end of the first range
 * @param line2Start - The start of the second range
 * @param line2End - The end of the second range
 * @returns True if the ranges intersect, false otherwise
 */
export function isIntersecting(line1Start: number, line1End: number, line2Start: number, line2End: number) {
    if ((line1Start <= line2Start && line1End >= line2Start) ||
        (line1Start >= line2Start && line1Start <= line2End)) {
        return true;
    }
    return false;
}

export function getCustomRangesInterestsWithSelection(range: ITextRange, customRanges: ICustomRange[]) {
    const result: ICustomRange[] = [];
    for (let i = 0, len = customRanges.length; i < len; i++) {
        const customRange = customRanges[i];
        if (range.collapsed) {
            if (customRange.startIndex < range.startOffset && range.startOffset <= customRange.endIndex) {
                result.push(customRange);
            }
        } else {
            if (isIntersecting(range.startOffset, range.endOffset - 1, customRange.startIndex, customRange.endIndex)) {
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

export function getIntersectingCustomRanges(startIndex: number, endIndex: number, customRanges: ICustomRange[], rangeType?: CustomRangeType) {
    const relativeCustomRanges = [];

    for (let i = 0, len = customRanges.length; i < len; i++) {
        const customRange = customRanges[i];
        // intersect
        if ((rangeType === undefined || customRange.rangeType === rangeType) && Math.max(customRange.startIndex, startIndex) <= Math.min(customRange.endIndex, endIndex)) {
            relativeCustomRanges.push({ ...customRange });
        }

        // optimize
        if (customRange.startIndex > endIndex) {
            break;
        }
    }

    return relativeCustomRanges;
}

export function getSelectionForAddCustomRange(range: ITextRange, body: IDocumentBody) {
    const ranges = getIntersectingCustomRanges(range.startOffset, range.collapsed ? range.startOffset : range.endOffset - 1, body.customRanges ?? []);
    const startOffset = Math.min(range.startOffset, (ranges[0]?.startIndex ?? Infinity));
    const endOffset = Math.max(range.endOffset, (ranges[ranges.length - 1]?.endIndex ?? -Infinity) + 1);

    return {
        startOffset,
        endOffset,
        collapsed: startOffset === endOffset,
    };
}
