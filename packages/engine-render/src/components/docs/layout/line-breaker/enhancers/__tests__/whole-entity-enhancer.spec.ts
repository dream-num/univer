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

import type { ICustomRange } from '@univerjs/core';
import { CustomRangeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { LineBreaker } from '../../line-breaker';
import { LineBreakerWholeEntityEnhancer } from '../whole-entity-enhancer';

function collectBreakPositions(content: string, ranges: readonly ICustomRange[], contentStartIndex = 0): number[] {
    const enhancer = new LineBreakerWholeEntityEnhancer(
        new LineBreaker(content),
        ranges,
        contentStartIndex
    );
    const positions: number[] = [];

    while (true) {
        const breakPoint = enhancer.nextBreakPoint();
        if (!breakPoint) {
            return positions;
        }
        positions.push(breakPoint.position);
    }
}

describe('LineBreakerWholeEntityEnhancer', () => {
    it('removes break opportunities inside a whole entity but preserves surrounding breaks', () => {
        const source = String.raw`\ce{Zn^2+ <=>[+ 2OH-] Zn(OH)2}`;
        const prefix = 'before ';
        const content = `${prefix}${source} after`;
        const startIndex = prefix.length;
        const endIndex = startIndex + source.length - 1;
        const positions = collectBreakPositions(content, [{
            startIndex,
            endIndex,
            rangeId: 'formula-1',
            rangeType: CustomRangeType.CUSTOM,
        }]);

        expect(positions.some((position) => position > startIndex && position <= endIndex)).toBe(false);
        expect(positions).toContain(content.length);
    });

    it('supports document offsets when shaping a paragraph segment', () => {
        const contentStartIndex = 20;
        const content = 'A B C';
        const positions = collectBreakPositions(content, [{
            startIndex: contentStartIndex + 2,
            endIndex: contentStartIndex + 4,
            rangeId: 'formula-1',
            rangeType: CustomRangeType.CUSTOM,
        }], contentStartIndex);

        expect(positions.some((position) => position > 2 && position <= 4)).toBe(false);
    });

    it('handles multiple ranges in model order even when the input is unsorted', () => {
        const content = 'A B C D E';
        const positions = collectBreakPositions(content, [
            {
                startIndex: 6,
                endIndex: 8,
                rangeId: 'formula-2',
                rangeType: CustomRangeType.CUSTOM,
            },
            {
                startIndex: 2,
                endIndex: 4,
                rangeId: 'formula-1',
                rangeType: CustomRangeType.CUSTOM,
            },
        ]);

        expect(positions.some((position) => position > 2 && position <= 4)).toBe(false);
        expect(positions.some((position) => position > 6 && position <= 8)).toBe(false);
        expect(positions).toContain(content.length);
    });
});
