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

import { describe, expect, it } from 'vitest';
import { compareNodePosition, compareNodePositionLogic, getOneTextSelectionRange, pushToPoints } from '../convert-text-range';
import { getAnchorBounding, getLineBounding } from '../text-range';

describe('selection convert text range helpers', () => {
    it('compares node positions in document order', () => {
        const start = { page: 0, section: 0, column: 0, line: 0, divide: 0, glyph: 0 } as never;
        const end = { page: 0, section: 0, column: 0, line: 1, divide: 0, glyph: 0 } as never;
        const earlierPage = { page: 0, section: 1, column: 0, line: 0, divide: 0, glyph: 0 } as never;
        const laterPage = { page: 1, section: 0, column: 0, line: 0, divide: 0, glyph: 0 } as never;

        expect(compareNodePositionLogic(start, end)).toBe(true);
        expect(compareNodePositionLogic(end, start)).toBe(false);
        expect(compareNodePositionLogic(earlierPage, laterPage)).toBe(true);
        expect(compareNodePosition(start, end)).toEqual({ start, end });
        expect(compareNodePosition(end, start)).toEqual({ start, end });
    });

    it('merges cursor fragments into one text range', () => {
        expect(getOneTextSelectionRange([])).toBeUndefined();
        expect(getOneTextSelectionRange([
            { startOffset: 2, endOffset: 2, collapsed: true },
        ] as never)).toEqual({
            startOffset: 2,
            endOffset: 2,
            collapsed: true,
        });
        expect(getOneTextSelectionRange([
            { startOffset: 2, endOffset: 4, collapsed: false },
            { startOffset: 5, endOffset: 8, collapsed: false },
        ] as never)).toEqual({
            startOffset: 2,
            endOffset: 8,
            collapsed: false,
        });
    });

    it('converts positions into polygon points and bounding boxes', () => {
        const points = pushToPoints({
            startX: 10,
            startY: 20,
            endX: 30,
            endY: 40,
        });

        expect(points).toEqual([
            { x: 10, y: 20 },
            { x: 30, y: 20 },
            { x: 30, y: 40 },
            { x: 10, y: 40 },
            { x: 10, y: 20 },
        ]);
        expect(getAnchorBounding([points])).toEqual({
            left: 10,
            top: 20,
            width: 20,
            height: 20,
        });
        expect(getLineBounding([
            points,
            [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 0, y: 2 }],
        ])).toEqual([
            { left: 10, right: 30, top: 20, bottom: 40 },
            { left: 0, right: 4, top: 0, bottom: 2 },
        ]);
    });
});
