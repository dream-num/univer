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

import type { IRange, Nullable, Worksheet } from '@univerjs/core';
import { getIntersectRange, Range } from '@univerjs/core';

export function getRangeInWorksheet(range: IRange, worksheet: Worksheet): Nullable<IRange> {
    const maxRows = worksheet.getMaxRows();
    const maxColumns = worksheet.getMaxColumns();
    if (maxRows <= 0 || maxColumns <= 0) {
        return null;
    }

    const effectiveRange = getIntersectRange(Range.transformRange(range, worksheet), {
        startRow: 0,
        endRow: maxRows - 1,
        startColumn: 0,
        endColumn: maxColumns - 1,
    });
    if (!effectiveRange) {
        return null;
    }

    return {
        startRow: effectiveRange.startRow,
        endRow: effectiveRange.endRow,
        startColumn: effectiveRange.startColumn,
        endColumn: effectiveRange.endColumn,
    };
}

export function getRangesInWorksheet(ranges: IRange[], worksheet: Worksheet): IRange[] {
    const effectiveRanges: IRange[] = [];
    ranges.forEach((range) => {
        const effectiveRange = getRangeInWorksheet(range, worksheet);
        if (effectiveRange) {
            effectiveRanges.push(effectiveRange);
        }
    });

    return effectiveRanges;
}
