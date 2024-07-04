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

import type { ICustomRange } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';

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
