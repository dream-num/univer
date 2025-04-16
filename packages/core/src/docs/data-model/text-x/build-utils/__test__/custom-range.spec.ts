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

import type { ITextRange } from '../../../../../sheets/typedef';
import { describe, expect, it } from 'vitest';
import { CustomRangeType, type ICustomRange } from '../../../../../types/interfaces';
import { excludePointsFromRange, getCustomRangesInterestsWithSelection } from '../custom-range';

describe('excludePointsFromRange function', () => {
    it('should handle empty points array', () => {
        const range: [number, number] = [0, 10];
        const points: number[] = [];
        expect(excludePointsFromRange(range, points)).toEqual([[0, 10]]);
    });

    it('should handle points at the beginning and end', () => {
        const range: [number, number] = [0, 10];
        const points = [0, 10];
        expect(excludePointsFromRange(range, points)).toEqual([[1, 9]]);
    });

    it('should handle overlapping points', () => {
        const range: [number, number] = [0, 10];
        const points = [2, 3, 3, 5];
        expect(excludePointsFromRange(range, points)).toEqual([[0, 1], [4, 4], [6, 10]]);
    });

    it('should handle points outside the range', () => {
        const range: [number, number] = [0, 10];
        const points = [-1, 12];
        expect(excludePointsFromRange(range, points)).toEqual([[0, 10]]);
    });

    it('should handle a single point in the middle', () => {
        const range: [number, number] = [0, 10];
        const points = [5];
        expect(excludePointsFromRange(range, points)).toEqual([[0, 4], [6, 10]]);
    });

    it('should handle multiple ranges', () => {
        const range: [number, number] = [0, 20];
        const points = [2, 5, 10, 15];
        expect(excludePointsFromRange(range, points)).toEqual([[0, 1], [3, 4], [6, 9], [11, 14], [16, 20]]);
    });

    it('should handle points in ascending order', () => {
        const range: [number, number] = [0, 10];
        const points = [2, 4, 6, 8];
        expect(excludePointsFromRange(range, points)).toEqual([[0, 1], [3, 3], [5, 5], [7, 7], [9, 10]]);
    });

    describe('excludePointsFromRange function', () => {
        it('should handle empty points array', () => {
            const range: [number, number] = [0, 10];
            const points: number[] = [];
            expect(excludePointsFromRange(range, points)).toEqual([[0, 10]]);
        });

        it('should handle points at the beginning and end', () => {
            const range: [number, number] = [0, 10];
            const points = [0, 10];
            expect(excludePointsFromRange(range, points)).toEqual([[1, 9]]);
        });

        it('should handle overlapping points', () => {
            const range: [number, number] = [0, 10];
            const points = [2, 3, 3, 5];
            expect(excludePointsFromRange(range, points)).toEqual([[0, 1], [4, 4], [6, 10]]);
        });

        it('should handle points outside the range', () => {
            const range: [number, number] = [0, 10];
            const points = [-1, 12];
            expect(excludePointsFromRange(range, points)).toEqual([[0, 10]]);
        });

        it('should handle a single point in the middle', () => {
            const range: [number, number] = [0, 10];
            const points = [5];
            expect(excludePointsFromRange(range, points)).toEqual([[0, 4], [6, 10]]);
        });

        it('should handle multiple ranges', () => {
            const range: [number, number] = [0, 20];
            const points = [2, 5, 10, 15];
            expect(excludePointsFromRange(range, points)).toEqual([[0, 1], [3, 4], [6, 9], [11, 14], [16, 20]]);
        });

        it('should handle points in ascending order', () => {
            const range: [number, number] = [0, 10];
            const points = [2, 4, 6, 8];
            expect(excludePointsFromRange(range, points)).toEqual([[0, 1], [3, 3], [5, 5], [7, 7], [9, 10]]);
        });
    });
});

describe('getCustomRangesInterestsWithSelection function', () => {
    it('should return empty array if no custom ranges intersect', () => {
        const range: ITextRange = { startOffset: 5, endOffset: 10, collapsed: false };
        const customRanges: ICustomRange[] = [
            { startIndex: 0, endIndex: 4, rangeId: '1', rangeType: CustomRangeType.HYPERLINK, properties: {} },
            { startIndex: 11, endIndex: 15, rangeId: '2', rangeType: CustomRangeType.HYPERLINK, properties: {} },
        ];
        expect(getCustomRangesInterestsWithSelection(range, customRanges)).toEqual([]);
    });

    it('should return intersecting custom ranges', () => {
        const range: ITextRange = { startOffset: 5, endOffset: 10, collapsed: false };
        const customRanges: ICustomRange[] = [
            { startIndex: 0, endIndex: 6, rangeId: '1', rangeType: CustomRangeType.HYPERLINK, properties: {} },
            { startIndex: 8, endIndex: 12, rangeId: '2', rangeType: CustomRangeType.HYPERLINK, properties: {} },
        ];
        expect(getCustomRangesInterestsWithSelection(range, customRanges)).toEqual([
            { startIndex: 0, endIndex: 6, rangeId: '1', rangeType: CustomRangeType.HYPERLINK, properties: {} },
            { startIndex: 8, endIndex: 12, rangeId: '2', rangeType: CustomRangeType.HYPERLINK, properties: {} },
        ]);
    });

    it('should handle collapsed range', () => {
        const range: ITextRange = { startOffset: 5, endOffset: 5, collapsed: true };
        const customRanges: ICustomRange[] = [
            { startIndex: 0, endIndex: 4, rangeId: '1', rangeType: CustomRangeType.HYPERLINK, properties: {} },
            { startIndex: 5, endIndex: 10, rangeId: '2', rangeType: CustomRangeType.HYPERLINK, properties: {} },
        ];
        expect(getCustomRangesInterestsWithSelection(range, customRanges)).toEqual([]);
    });

    it('should handle multiple intersecting custom ranges', () => {
        const range: ITextRange = { startOffset: 5, endOffset: 15, collapsed: false };
        const customRanges: ICustomRange[] = [
            { startIndex: 0, endIndex: 6, rangeId: '1', rangeType: CustomRangeType.HYPERLINK, properties: {} },
            { startIndex: 8, endIndex: 12, rangeId: '2', rangeType: CustomRangeType.HYPERLINK, properties: {} },
            { startIndex: 14, endIndex: 20, rangeId: '3', rangeType: CustomRangeType.HYPERLINK, properties: {} },
        ];

        expect(getCustomRangesInterestsWithSelection(range, customRanges)).toEqual([
            { startIndex: 0, endIndex: 6, rangeId: '1', rangeType: CustomRangeType.HYPERLINK, properties: {} },
            { startIndex: 8, endIndex: 12, rangeId: '2', rangeType: CustomRangeType.HYPERLINK, properties: {} },
            { startIndex: 14, endIndex: 20, rangeId: '3', rangeType: CustomRangeType.HYPERLINK, properties: {} },
        ]);
    });
});
