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
import { Rectangle } from '@univerjs/core';

export interface IRangeAnchor {
    row: number;
    col: number;
}

export class ConditionalFormattingRangeTransformService {
    subtractRanges(sourceRanges: IRange[], rangesToSubtract: IRange[]) {
        return Rectangle.mergeRanges(Rectangle.subtractMulti(sourceRanges, rangesToSubtract));
    }

    addRanges(sourceRanges: IRange[], rangesToAdd: IRange[]) {
        return Rectangle.mergeRanges([...sourceRanges, ...rangesToAdd]);
    }

    applyRangeDelta(sourceRanges: IRange[], rangesToSubtract: IRange[], rangesToAdd: IRange[]) {
        const ranges = rangesToSubtract.length
            ? this.subtractRanges(sourceRanges, rangesToSubtract)
            : sourceRanges;

        return rangesToAdd.length
            ? this.addRanges(ranges, rangesToAdd)
            : ranges;
    }

    copyIntersectingRanges(sourceRanges: IRange[], sourceRange: IRange, targetAnchor: IRangeAnchor) {
        const fragments: IRange[] = [];

        sourceRanges.forEach((range) => {
            const intersect = Rectangle.getIntersects(range, sourceRange);
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
}
