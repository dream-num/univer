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
import { transformSheetDrawingReference } from '../drawing-reference';

describe('drawing anchor references', () => {
    it.each(['row', 'column'] as const)('preserves raw offsets when inserting at the %s anchor', (axis) => {
        const marker = { row: 3, column: 3, rowOffset: 144, columnOffset: 144 };
        const result = transformSheetDrawingReference(marker, { axis, action: 'insert', start: 3, end: 4, limit: 32, boundaryOffset: 24 });
        expect(result).toEqual({ ...marker, [axis]: 5 });
        expect(marker).toEqual({ row: 3, column: 3, rowOffset: 144, columnOffset: 144 });
    });

    it.each(['row', 'column'] as const)('clips a deleted last %s marker at the remaining sheet edge', (axis) => {
        const marker = { row: 10, column: 10, rowOffset: 144, columnOffset: 144 };
        const result = transformSheetDrawingReference(marker, { axis, action: 'remove', start: 8, end: 11, limit: 8, boundaryOffset: 24 });
        expect(result).toEqual({ ...marker, [axis]: 7, [axis === 'row' ? 'rowOffset' : 'columnOffset']: 24 });
    });

    it('retains imported overflow offsets on a hidden final row after deleting a preceding row', () => {
        expect(transformSheetDrawingReference({ row: 29, column: 0, rowOffset: 144, columnOffset: 0 }, {
            axis: 'row',
            action: 'remove',
            start: 0,
            end: 0,
            limit: 29,
            boundaryOffset: 0,
        })).toEqual({ row: 28, column: 0, rowOffset: 144, columnOffset: 0 });
    });

    it.each(['row', 'column'] as const)('preserves negative %s offsets used by rotated frames at a header boundary', (axis) => {
        const marker = { row: 0, column: 0, rowOffset: -60, columnOffset: -60 };
        expect(transformSheetDrawingReference(marker, { axis, action: 'insert', start: 0, end: 0, limit: 31, boundaryOffset: 24 }))
            .toEqual({ ...marker, [axis]: 1 });
    });

    it.each([{ limit: 0 }, { start: -1 }, { end: 0.5 }, { action: 'move' }, { axis: 'depth' }])('rejects invalid wire references %j', (invalid) => {
        const reference = JSON.parse(JSON.stringify({ axis: 'row', action: 'insert', start: 0, end: 0, limit: 30, boundaryOffset: 24, ...invalid }));
        expect(() => transformSheetDrawingReference({ row: 3, column: 0, rowOffset: 0, columnOffset: 0 }, reference)).toThrow('Invalid drawing reference change.');
    });
});
