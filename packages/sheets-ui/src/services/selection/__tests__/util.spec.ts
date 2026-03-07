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
import { attachPrimaryWithCoord, attachRangeWithCoord, attachSelectionWithCoord } from '../util';

describe('selection util', () => {
    it('should attach coordinates and normalize reversed ranges', () => {
        const skeleton = {
            getNoMergeCellWithCoordByIndex: (row: number, col: number) => {
                if (row === 1 && col === 2) return { startX: 10, startY: 20, endX: 20, endY: 30 };
                if (row === 3 && col === 4) return { startX: 40, startY: 60, endX: 50, endY: 80 };
                return { startX: 0, startY: 0, endX: 0, endY: 0 };
            },
        } as any;

        const range = attachRangeWithCoord(skeleton, {
            startRow: 3,
            endRow: 1,
            startColumn: 4,
            endColumn: 2,
        } as any);

        expect(range.startRow).toBe(3);
        expect(range.endRow).toBe(1);
        expect(range.startX).toBe(10);
        expect(range.startY).toBe(20);
        expect(range.endX).toBe(50);
        expect(range.endY).toBe(80);
    });

    it('should attach primary and selection coordinates', () => {
        const skeleton = {
            getNoMergeCellWithCoordByIndex: (row: number, col: number) => {
                if (row === 2 && col === 3) return { startX: 30, startY: 40, endX: 35, endY: 45 };
                if (row === 1 && col === 1) return { startX: 10, startY: 10, endX: 15, endY: 15 };
                if (row === 4 && col === 5) return { startX: 50, startY: 70, endX: 80, endY: 90 };
                return { startX: 0, startY: 0, endX: 0, endY: 0 };
            },
        } as any;

        const primary = attachPrimaryWithCoord(skeleton, {
            actualRow: 2,
            actualColumn: 3,
            isMerged: true,
            isMergedMainCell: false,
            startRow: 1,
            startColumn: 1,
            endRow: 4,
            endColumn: 5,
        } as any);

        expect(primary.actualRow).toBe(2);
        expect(primary.startX).toBe(30);
        expect(primary.mergeInfo.startX).toBe(10);
        expect(primary.mergeInfo.endY).toBe(90);

        const selection = attachSelectionWithCoord({
            range: { startRow: 1, endRow: 4, startColumn: 1, endColumn: 5 },
            primary: {
                actualRow: 2,
                actualColumn: 3,
                isMerged: true,
                isMergedMainCell: false,
                startRow: 1,
                startColumn: 1,
                endRow: 4,
                endColumn: 5,
            },
            style: { stroke: '#000' },
        } as any, skeleton);

        expect(selection.rangeWithCoord.startX).toBe(10);
        expect(selection.primaryWithCoord?.actualColumn).toBe(3);
        expect(selection.style).toEqual({ stroke: '#000' });
    });
});
