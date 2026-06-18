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

import { Dimension, ObjectMatrix, RANGE_TYPE } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SelectionMoveType } from '../../../services/selections/type';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { AddMergeRedoSelectionsOperationFactory, AddMergeUndoSelectionsOperationFactory } from '../../utils/handle-merge-operation';
import {
    DeleteRangeUndoMutationFactory,
    handleDeleteRangeMutation,
    handleInsertRangeMutation,
    InsertRangeUndoMutationFactory,
} from '../../utils/handle-range.mutation';
import { countCells, getSuitableRangesInView } from '../util';
import {
    alignToMergedCellsBorders,
    calculateTotalLength,
    copyRangeStyles,
    copyRangeStylesWithoutBorder,
    createRangeIteratorWithSkipFilteredRows,
    followSelectionOperation,
    getCellAtRowCol,
    getPrimaryForRange,
    isSingleCellSelection,
    setEndForRange,
} from '../utils/selection-utils';

describe('sheets command util', () => {
    it('should select nearest ranges and split overflow range by max visible row quota', () => {
        const ranges = [
            { startRow: 50, endRow: 749, startColumn: 0, endColumn: 2 },
            { startRow: 2000, endRow: 2499, startColumn: 0, endColumn: 2 },
        ];

        const result = getSuitableRangesInView(ranges, {
            worksheet: { getColumnCount: () => 10 },
            scrollY: 0,
            getOffsetRelativeToRowCol: () => ({ row: 100 }),
        } as any);

        expect(result.suitableRanges).toEqual([
            { startRow: 50, endRow: 749, startColumn: 0, endColumn: 2 },
            { startRow: 2000, endRow: 2299, startColumn: 0, endColumn: 2 },
        ]);
        expect(result.remainingRanges).toEqual([
            { startRow: 2300, endRow: 2499, startColumn: 0, endColumn: 2 },
        ]);
    });

    it('should return original ranges when skeleton is absent', () => {
        const ranges = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }];
        const result = getSuitableRangesInView(ranges, null);
        expect(result).toEqual({ suitableRanges: ranges, remainingRanges: [] });
    });

    it('should count matrix cells with values only', () => {
        const matrix = new ObjectMatrix<number>();
        matrix.setValue(0, 0, 1);
        matrix.setValue(1, 2, 2);
        matrix.setValue(10, 4, 3);

        expect(countCells(matrix)).toBe(3);
    });

    it('should generate merge selection redo and undo operations from the current primary cell', () => {
        const currentSelections = [
            {
                range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                primary: { actualRow: 1, actualColumn: 1 },
            },
        ];
        const accessor = {
            get: (token: unknown) => token === SheetsSelectionsService ? { getCurrentSelections: () => currentSelections } : null,
        } as any;
        const params = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            value: Dimension.ROWS,
            selections: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
        };

        expect(AddMergeRedoSelectionsOperationFactory(accessor, params as any, [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 4 }])).toEqual({
            id: SetSelectionsOperation.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                type: SelectionMoveType.ONLY_SET,
                selections: [{
                    range: currentSelections[0].range,
                    style: null,
                    primary: {
                        startRow: 1,
                        startColumn: 1,
                        endRow: 1,
                        endColumn: 4,
                        actualRow: 1,
                        actualColumn: 1,
                        isMerged: true,
                        isMergedMainCell: true,
                    },
                }],
            },
        });
        expect(AddMergeUndoSelectionsOperationFactory(accessor, params as any)).toEqual({
            id: SetSelectionsOperation.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                type: SelectionMoveType.ONLY_SET,
                selections: currentSelections,
            },
        });
        expect(AddMergeRedoSelectionsOperationFactory({ get: () => ({ getCurrentSelections: () => [] }) } as any, params as any, [])).toBeNull();
        expect(AddMergeUndoSelectionsOperationFactory({ get: () => ({ getCurrentSelections: () => [{ range: {}, primary: null }] }) } as any, params as any)).toBeNull();
    });

    it('should shift object matrix cells when inserting or deleting ranges', () => {
        const rowMatrix = new ObjectMatrix<string>({
            0: { 0: 'A0' },
            1: { 0: 'A1' },
            2: { 0: 'A2' },
        });
        handleInsertRangeMutation(rowMatrix, { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }, 2, 0, Dimension.ROWS, { 1: { 0: 'inserted' } });
        expect(rowMatrix.getValue(1, 0)).toBe('inserted');
        expect(rowMatrix.getValue(2, 0)).toBe('A1');
        expect(rowMatrix.getValue(3, 0)).toBe('A2');

        handleDeleteRangeMutation(rowMatrix, { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }, 3, 0, Dimension.ROWS);
        expect(rowMatrix.getValue(1, 0)).toBe('A1');
        expect(rowMatrix.getValue(2, 0)).toBe('A2');

        const colMatrix = new ObjectMatrix<string>({
            0: { 0: 'A', 1: 'B', 2: 'C' },
        });
        handleInsertRangeMutation(colMatrix, { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }, 0, 2, Dimension.COLUMNS, { 0: { 1: 'inserted' } });
        expect(colMatrix.getValue(0, 1)).toBe('inserted');
        expect(colMatrix.getValue(0, 2)).toBe('B');
        expect(colMatrix.getValue(0, 3)).toBe('C');

        handleDeleteRangeMutation(colMatrix, { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }, 0, 3, Dimension.COLUMNS);
        expect(colMatrix.getValue(0, 1)).toBe('B');
        expect(colMatrix.getValue(0, 2)).toBe('C');
    });

    it('should build range mutation undo params from worksheet state', () => {
        const cellMatrix = new ObjectMatrix({ 0: { 0: { v: 'A' }, 1: { v: 'B' } } });
        const worksheet = {
            getCellMatrix: () => cellMatrix,
            getConfig: () => ({ rowCount: 2, columnCount: 2 }),
        };
        const accessor = {
            get: () => ({
                getUnit: () => ({ getSheetBySheetId: () => worksheet }),
            }),
        } as any;
        const params = { unitId: 'unit-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, shiftDimension: Dimension.ROWS };

        expect(InsertRangeUndoMutationFactory(accessor, params)).toEqual(params);
        expect(DeleteRangeUndoMutationFactory(accessor, params)).toMatchObject({
            ...params,
            cellValue: { 0: { 0: { v: 'A' } } },
        });
        expect(DeleteRangeUndoMutationFactory({ get: () => ({ getUnit: () => null }) } as any, params)).toBeNull();
    });

    it('should align selection helpers to merged cells and worksheet bounds', () => {
        const mergedMatrix = new ObjectMatrix({ 0: { 0: { rowSpan: 2, colSpan: 2 } } });
        const worksheet = {
            getMatrixWithMergedCells: () => mergedMatrix,
            getMergedCell: () => ({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }),
        };

        expect(alignToMergedCellsBorders({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, worksheet as any)).toMatchObject({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        });
        expect(getCellAtRowCol(0, 0, worksheet as any)).toEqual({
            actualRow: 0,
            actualColumn: 0,
            startRow: 0,
            startColumn: 0,
            endRow: 1,
            endColumn: 1,
            isMerged: true,
            isMergedMainCell: true,
            rangeType: RANGE_TYPE.NORMAL,
        });
        expect(getPrimaryForRange({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, worksheet as any)).toMatchObject({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
            actualRow: 0,
            actualColumn: 0,
            isMerged: true,
            isMergedMainCell: true,
        });

        expect(setEndForRange({ startRow: Number.NaN, endRow: Number.NaN, startColumn: Number.NaN, endColumn: Number.NaN }, 10, 5)).toEqual({
            startRow: 0,
            endRow: 9,
            startColumn: 0,
            endColumn: 4,
        });
        expect(calculateTotalLength({ a: [0, 2], b: [5, 7] })).toBe(8);
        expect(isSingleCellSelection({ range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }, primary: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } } as any)).toBe(true);
        expect(isSingleCellSelection(null)).toBe(false);
        expect(followSelectionOperation({ startRow: 2, endRow: 2, startColumn: 3, endColumn: 3 }, { getUnitId: () => 'unit-1' } as any, { getSheetId: () => 'sheet-1', getMergedCell: () => null } as any)).toMatchObject({
            id: SetSelectionsOperation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', reveal: true },
        });
    });

    it('should iterate only operable cells and copy reusable range styles', () => {
        const visited: Array<[number, number]> = [];
        const iterator = createRangeIteratorWithSkipFilteredRows({
            getRowFiltered: (row: number) => row === 1,
        } as any);
        iterator.forOperableEach({ startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 }, (row, col) => visited.push([row, col]));
        expect(visited).toEqual([[0, 0], [0, 1], [2, 0], [2, 1]]);

        const worksheet = {
            getCellWithFilteredInterceptors: (row: number, col: number) => {
                if (row === 0 && col === 0) return { s: { bg: { rgb: '#fff' } } };
                if (row === 0 && col === 1) return { s: {} };
                return null;
            },
            getStyleDataByHash: () => ({ bg: { rgb: '#000' }, bd: { t: { s: 1 } } }),
            setStyleData: (style: unknown) => `style:${JSON.stringify(style)}`,
        };
        expect(copyRangeStyles(worksheet as any, 1, 1, 0, 1, true, 0)).toEqual({
            1: { 0: { s: { bg: { rgb: '#fff' } } } },
        });
        expect(copyRangeStylesWithoutBorder({ ...worksheet, getCellWithFilteredInterceptors: () => ({ s: 'style-hash' }) } as any, 1, 1, 0, 0, true, 0)).toEqual({
            1: { 0: { s: 'style:{"bg":{"rgb":"#000"}}' } },
        });
    });
});
