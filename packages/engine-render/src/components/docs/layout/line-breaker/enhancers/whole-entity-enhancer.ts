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

import type { ICustomRange, Nullable } from '@univerjs/core';
import type { Break } from '../break';
import type { IBreakPoints } from '../line-breaker';

/**
 * Removes line-break opportunities from the interior of measured whole
 * entities. The model keeps the entity's complete source text, while shaping
 * treats the inclusive custom range as one unbreakable inline object.
 */
export class LineBreakerWholeEntityEnhancer implements IBreakPoints {
    readonly content: string;

    private readonly _ranges: readonly ICustomRange[];
    private _rangeIndex = 0;

    constructor(
        private readonly _lineBreaker: IBreakPoints,
        ranges: readonly ICustomRange[],
        private readonly _contentStartIndex: number
    ) {
        this.content = _lineBreaker.content;
        this._ranges = [...ranges].sort((a, b) => a.startIndex - b.startIndex);
    }

    nextBreakPoint(): Nullable<Break> {
        let breakPoint = this._lineBreaker.nextBreakPoint();

        while (breakPoint && this._isInsideWholeEntity(breakPoint.position)) {
            breakPoint = this._lineBreaker.nextBreakPoint();
        }

        return breakPoint;
    }

    private _isInsideWholeEntity(position: number): boolean {
        const absolutePosition = this._contentStartIndex + position;
        let range = this._ranges[this._rangeIndex];

        while (range && absolutePosition > range.endIndex) {
            this._rangeIndex++;
            range = this._ranges[this._rangeIndex];
        }

        return range != null &&
            absolutePosition > range.startIndex &&
            absolutePosition <= range.endIndex;
    }
}
