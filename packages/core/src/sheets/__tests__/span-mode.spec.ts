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
import { Rectangle } from '../../shared';
import { SpanModel } from '../span-model';
import { type IRange, RANGE_TYPE } from '../typedef';

function getMergeRange(mergeData: IRange[], startRow: number, startColumn: number, endRow: number, endColumn: number) {
    const ranges: IRange[] = [];
    for (const range of mergeData || []) {
        if (Rectangle.intersects(range, {
            startRow,
            endRow,
            startColumn,
            endColumn,
        })) {
            ranges.push({
                ...range,
            });
        }
    }
    return ranges;
}

describe('test span mode', () => {
    it('test getMergedCell', () => {
        const ranges: IRange[] = [
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
        ];
        const spanModel = new SpanModel(ranges);

        const mergedCell = spanModel.getMergedCell(1, 1);
        expect(mergedCell).toEqual({ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 });

        const mergedCell2 = spanModel.getMergedCell(1, 2);
        expect(mergedCell2).toEqual({ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 });

        const mergedCell3 = spanModel.getMergedCell(2, 4);
        expect(mergedCell3).toEqual(null);
    });

    it('test getMergedCellByRange', () => {
        const ranges: IRange[] = [
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 },
        ];
        const spanModel = new SpanModel(ranges);

        const range1 = getMergeRange(ranges, 1, 1, 2, 2);
        const mergedCell = spanModel.getMergedCellRange(1, 1, 2, 2);

        expect(mergedCell).toEqual(range1);
    });

    it('test getMergedCellByRange complex', () => {
        const ranges: IRange[] = [
            {
                startRow: 0,
                startColumn: 0,
                endRow: 3,
                endColumn: 2,
                rangeType: 0,
            },
            {
                startRow: 4,
                startColumn: 3,
                endRow: 9,
                endColumn: 3,
                rangeType: 0,
            },
            {
                startRow: 1,
                startColumn: 3,
                endRow: 1,
                endColumn: 7,
                rangeType: 0,
            },
            {
                startRow: 5,
                startColumn: 4,
                endRow: 13,
                endColumn: 6,
                rangeType: 0,
            },
            {
                startRow: 1,
                startColumn: 8,
                endRow: 18,
                endColumn: 8,
                rangeType: 0,
            },
            {
                startRow: 20,
                startColumn: 0,
                endRow: 21,
                endColumn: 10,
                rangeType: 0,
            },
        ];
        const spanModel = new SpanModel(ranges);

        const range1 = getMergeRange(ranges, 1, 1, 2, 2);
        const mergedCell = spanModel.getMergedCellRange(1, 1, 2, 2);

        expect(mergedCell).toEqual(range1);
    });

    it('test getMergedCellByRange repeat using cache', () => {
        const ranges: IRange[] = [
            {
                startRow: 0,
                startColumn: 0,
                endRow: 3,
                endColumn: 2,
                rangeType: 0,
            },
            {
                startRow: 4,
                startColumn: 3,
                endRow: 9,
                endColumn: 3,
                rangeType: 0,
            },
            {
                startRow: 1,
                startColumn: 3,
                endRow: 1,
                endColumn: 7,
                rangeType: 0,
            },
            {
                startRow: 5,
                startColumn: 4,
                endRow: 13,
                endColumn: 6,
                rangeType: 0,
            },
            {
                startRow: 1,
                startColumn: 8,
                endRow: 18,
                endColumn: 8,
                rangeType: 0,
            },
            {
                startRow: 20,
                startColumn: 0,
                endRow: 21,
                endColumn: 10,
                rangeType: 0,
            },
        ];
        const spanModel = new SpanModel(ranges);

        const range1 = getMergeRange(ranges, 1, 1, 2, 2);
        const mergedCell = spanModel.getMergedCellRange(1, 1, 2, 2);

        expect(mergedCell).toEqual(range1);

        const mergedCell1 = spanModel.getMergedCellRange(1, 1, 2, 2);
        expect(mergedCell1).toEqual(range1);

        const mergedCell2 = spanModel.getMergedCellRange(1, 1, 2, 2);
        expect(mergedCell2).toEqual(mergedCell1);
    });

    it('test update snapshot', () => {
        const ranges: IRange[] = [
            {
                startRow: 0,
                startColumn: 0,
                endRow: 3,
                endColumn: 2,
                rangeType: 0,
            },
            {
                startRow: 4,
                startColumn: 3,
                endRow: 9,
                endColumn: 3,
                rangeType: 0,
            },
            {
                startRow: 1,
                startColumn: 3,
                endRow: 1,
                endColumn: 7,
                rangeType: 0,
            },
            {
                startRow: 5,
                startColumn: 4,
                endRow: 13,
                endColumn: 6,
                rangeType: 0,
            },
            {
                startRow: 1,
                startColumn: 8,
                endRow: 18,
                endColumn: 8,
                rangeType: 0,
            },
            {
                startRow: 20,
                startColumn: 0,
                endRow: 21,
                endColumn: 10,
                rangeType: 0,
            },
        ];
        const spanModel = new SpanModel(ranges);

        const range1 = getMergeRange(ranges, 1, 1, 2, 2);
        const mergedCell = spanModel.getMergedCellRange(1, 1, 2, 2);

        expect(mergedCell).toEqual(range1);

        ranges.push({ startRow: 30, endRow: 32, startColumn: 1, endColumn: 2 });
        spanModel.rebuild(ranges);

        const range2 = getMergeRange(ranges, 30, 1, 32, 2);
        const mergedCell2 = spanModel.getMergedCellRange(30, 1, 32, 2);

        expect(mergedCell2).toEqual(range2);
    });

    it('test column range', () => {
        const ranges: IRange[] = [
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.COLUMN },
        ];
        const spanModel = new SpanModel(ranges);
        expect(Boolean(spanModel.getMergedCell(1, 1))).toEqual(true);
        expect(Boolean(spanModel.getMergedCell(1, 2))).toEqual(true);
        expect(Boolean(spanModel.getMergedCell(1, 3))).toEqual(false);
    });
    it('test row range', () => {
        const ranges: IRange[] = [
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.ROW },
        ];
        const spanModel = new SpanModel(ranges);
        expect(Boolean(spanModel.getMergedCell(1, 1))).toEqual(true);
        expect(Boolean(spanModel.getMergedCell(2, 1))).toEqual(true);
        expect(Boolean(spanModel.getMergedCell(3, 1))).toEqual(false);
    });

    it('test all range', () => {
        const ranges: IRange[] = [
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.ALL },
        ];
        const spanModel = new SpanModel(ranges);
        expect(Boolean(spanModel.getMergedCell(1, 1))).toEqual(true);
        expect(Boolean(spanModel.getMergedCell(2, 1))).toEqual(true);
        expect(Boolean(spanModel.getMergedCell(3, 1))).toEqual(true);
    });

    it('test isRowContainsMergedCell', () => {
        const spanModelAll = new SpanModel([{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.ALL }]);
        expect(Boolean(spanModelAll.isRowContainsMergedCell(1))).toEqual(true);
        expect(Boolean(spanModelAll.isRowContainsMergedCell(2))).toEqual(true);
        expect(Boolean(spanModelAll.isRowContainsMergedCell(3))).toEqual(true);

        const spanModelRow = new SpanModel([{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.COLUMN }]);
        expect(Boolean(spanModelRow.isRowContainsMergedCell(1))).toEqual(true);

        const spanModelCell = new SpanModel([{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }]);
        expect(Boolean(spanModelCell.isRowContainsMergedCell(1))).toEqual(true);
        expect(Boolean(spanModelCell.isRowContainsMergedCell(2))).toEqual(true);
        expect(Boolean(spanModelCell.isRowContainsMergedCell(3))).toEqual(false);
    });

    it('test isColumnContainsMergedCell', () => {
        const spanModelAll = new SpanModel([{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.ALL }]);
        expect(Boolean(spanModelAll.isColumnContainsMergedCell(1))).toEqual(true);
        expect(Boolean(spanModelAll.isColumnContainsMergedCell(2))).toEqual(true);
        expect(Boolean(spanModelAll.isColumnContainsMergedCell(3))).toEqual(true);

        const spanModelRow = new SpanModel([{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.ROW }]);
        expect(Boolean(spanModelRow.isColumnContainsMergedCell(1))).toEqual(true);

        const spanModelCell = new SpanModel([{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }]);
        expect(Boolean(spanModelCell.isColumnContainsMergedCell(1))).toEqual(true);
    });
});
