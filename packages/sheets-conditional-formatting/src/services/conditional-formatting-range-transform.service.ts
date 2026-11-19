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

import type { IRange } from '@univerjs/core';
import { getIntersectRange, Rectangle } from '@univerjs/core';

export interface IRangeAnchor {
    row: number;
    col: number;
}

export class ConditionalFormattingRangeTransformService {
    subtractRanges(sourceRanges: IRange[], rangesToSubtract: IRange[]) {
        return this._keepCoveredRangeType(
            Rectangle.mergeRanges(Rectangle.subtractMulti(sourceRanges, rangesToSubtract)),
            sourceRanges
        );
    }

    addRanges(sourceRanges: IRange[], rangesToAdd: IRange[]) {
        return this._keepCoveredRangeType(
            Rectangle.mergeRanges([...sourceRanges, ...rangesToAdd]),
            sourceRanges
        );
    }

    applyRangeDelta(sourceRanges: IRange[], rangesToSubtract: IRange[], rangesToAdd: IRange[]) {
        const ranges = rangesToSubtract.length
            ? Rectangle.mergeRanges(Rectangle.subtractMulti(sourceRanges, rangesToSubtract))
            : sourceRanges;

        const merged = rangesToAdd.length
            ? Rectangle.mergeRanges([...ranges, ...rangesToAdd])
            : ranges;

        // the delta is applied to the original ranges: when the net coverage is unchanged (auto fill
        // or paste back into the same cells) the whole column/row type has to survive, even though
        // the intermediate subtract/add results are plain coordinates
        return this._keepCoveredRangeType(merged, sourceRanges);
    }

    copyIntersectingRanges(sourceRanges: IRange[], sourceRange: IRange, targetAnchor: IRangeAnchor) {
        const fragments: IRange[] = [];

        sourceRanges.forEach((range) => {
            const intersect = getIntersectRange(range, sourceRange);
            if (!intersect) {
                return;
            }

            fragments.push(this.translateRange(intersect, {
                row: targetAnchor.row - sourceRange.startRow,
                col: targetAnchor.col - sourceRange.startColumn,
            }));
        });

        return Rectangle.mergeRanges(fragments);
    }

    translateRange(range: IRange, offset: IRangeAnchor): IRange {
        return {
            startRow: range.startRow + offset.row,
            endRow: range.endRow + offset.row,
            startColumn: range.startColumn + offset.col,
            endColumn: range.endColumn + offset.col,
        };
    }

    /**
     * Rebuilding ranges from coordinates drops `rangeType`. A result range that still covers exactly
     * the same cells as a whole column/row source has to keep that type, otherwise a rule that was
     * not actually changed (for example adding an already covered range) degrades to concrete rows.
     * Results that no longer match a source range are genuine partial coverage and stay concrete.
     */
    private _keepCoveredRangeType(ranges: IRange[], sourceRanges: IRange[]) {
        return ranges.map((range) => {
            const source = sourceRanges.find((item) => item.rangeType
                && item.startRow === range.startRow
                && item.endRow === range.endRow
                && item.startColumn === range.startColumn
                && item.endColumn === range.endColumn);

            return source ? { ...range, rangeType: source.rangeType } : range;
        });
    }
}
