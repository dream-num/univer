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

import type { IRange, Worksheet } from '@univerjs/core';
import { getIntersectRange, Rectangle } from '@univerjs/core';
import type { IConditionalFormattingRenderRangeResolver } from './type';

export function resolveRenderRanges(
    worksheet: Worksheet,
    sourceRanges: IRange[],
    resolver: IConditionalFormattingRenderRangeResolver | null
): IRange[] {
    if (!resolver) {
        return sourceRanges;
    }
    const mergedRanges = worksheet.getMergeData().length
        ? sourceRanges.flatMap((range) => worksheet.getMergedCellRange(
            range.startRow,
            range.startColumn,
            range.endRow,
            range.endColumn
        ))
        : [];
    // A visible merged cell can obtain its formatting from an offscreen anchor.
    const queryRanges = mergedRanges.length
        ? [...sourceRanges, ...mergedRanges.map((range) => ({
            startRow: range.startRow,
            endRow: range.startRow,
            startColumn: range.startColumn,
            endColumn: range.startColumn,
        }))]
        : sourceRanges;
    const resolved = resolver(worksheet.getUnitId(), worksheet.getSheetId(), queryRanges);
    if (!resolved) {
        return sourceRanges;
    }
    if (!mergedRanges.length || !resolved.length) {
        return resolved;
    }
    const formattedMerges = mergedRanges.filter((merge) => resolved.some((range) => Rectangle.intersects(merge, range)));
    const clipped: IRange[] = [];
    for (const source of sourceRanges) {
        for (const range of [...resolved, ...formattedMerges]) {
            const intersection = getIntersectRange(source, range);
            if (intersection) {
                clipped.push(intersection);
            }
        }
    }
    return clipped.length > 1 ? Rectangle.mergeRanges(clipped) : clipped;
}
