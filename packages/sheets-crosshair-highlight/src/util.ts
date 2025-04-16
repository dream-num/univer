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
import { RANGE_TYPE, Rectangle } from '@univerjs/core';

export class CrossHairRangeCollection {
    private _selectedRanges: IRange[] = [];
    private _ranges: IRange[] = [];

    public addRange(range: IRange) {
        if (range.rangeType === RANGE_TYPE.COLUMN || range.rangeType === RANGE_TYPE.ROW || range.rangeType === RANGE_TYPE.ALL) {
            return;
        }
        const intersects = this._getIntersects(range);

        const splitRanges = this._getSplitRanges(range, intersects);
        if (splitRanges.length > 0) {
            this._ranges.push(...splitRanges);
        }
    }

    public setSelectedRanges(selectedRange: IRange[]) {
        this._selectedRanges = selectedRange;
    }

    private _getSplitRanges(range: IRange, intersects: IRange[]) {
        let splitRanges: IRange[] = [range];
        for (const intersect of intersects.concat(this._selectedRanges)) {
            const newRanges = [];
            for (const splitRange of splitRanges) {
                const split = Rectangle.subtract(splitRange, intersect);
                if (split && split.length > 0) {
                    newRanges.push(...split);
                }
            }
            splitRanges = newRanges;
        }
        return splitRanges.filter((range) => range.startRow <= range.endRow && range.startColumn <= range.endColumn);
    }

    private _getIntersects(addRange: IRange) {
        const intersects = [];
        for (const range of this._ranges) {
            const intersect = Rectangle.getIntersects(range, addRange);
            if (intersect) {
                intersects.push(intersect);
            }
        }
        return intersects;
    }

    getRanges() {
        return this._ranges;
    }

    reset() {
        this._ranges = [];
        this._selectedRanges = [];
    }
}
