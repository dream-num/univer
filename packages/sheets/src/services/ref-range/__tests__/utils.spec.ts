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

import type { ICommandInfo, IMutationInfo, IRange } from '@univerjs/core';
import type { IRemoveSheetMutationParams } from '../../../basics';

import type { IInsertColCommandParams, IInsertRowCommandParams } from '../../../commands/commands/insert-row-col.command';
import type { IRemoveRowColCommandInterceptParams } from '../../../commands/commands/remove-row-col.command';
import type { IMoveRowsMutationParams } from '../../../commands/mutations/move-rows-cols.mutation';
import type { IRemoveRowColCommand } from '../type';
import { Direction } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { MoveRowsMutation } from '../../../commands/mutations/move-rows-cols.mutation';
import { RemoveSheetMutation } from '../../../commands/mutations/remove-sheet.mutation';
import { EffectRefRangId } from '../type';
import {
    adjustRangeOnMutation,
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveLeftCommon,
    handleDeleteRangeMoveUp,
    handleDeleteRangeMoveUpCommon,
    handleInsertCol,
    handleInsertColCommon,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveDownCommon,
    handleInsertRangeMoveRight,
    handleInsertRangeMoveRightCommon,
    handleInsertRow,
    handleInsertRowCommon,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveRange,
    handleMoveRangeCommon,
    handleMoveRows,
    handleMoveRowsCommon,
    handleRemoveRowCommon,
    runRefRangeMutations,
} from '../util';

const countRange = ([a, b, c, d]: readonly [number, number, number, number]) => (a * 1000 + b * 100 + c * 10 + d);

const formatRanges = (ranges: IRange[]) => ranges.map((range) => [range.startRow, range.endRow, range.startColumn, range.endColumn] as const).sort((prev, aft) => countRange(prev) - countRange(aft));

describe('test ref-range move', () => {
    describe('handleMoveRows', () => {
        // see docs/tldr/handMoveRowsCols.tldr
        const startCol = 0;
        const endCol = 999;
        let fromRange: IRange;
        let toRange: IRange;
        describe('fromRange is top of toRange', () => {
            beforeEach(() => {
                fromRange = { startRow: 5, endRow: 10, startColumn: startCol, endColumn: endCol };
                toRange = { startRow: 15, endRow: 20, startColumn: startCol, endColumn: endCol };
            });
            it('1-1 unchanged', () => {
                const targetRange = { startRow: 3, endRow: 4, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 4,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-3 unchanged', () => {
                const targetRange = { startRow: 25, endRow: 26, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 25,
                    endRow: 26,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-11 unchanged', () => {
                const targetRange = { startRow: 3, endRow: 26, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 26,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-2 move left', () => {
                const targetRange = { startRow: 12, endRow: 13, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 6,
                    endRow: 7,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-12 move right', () => {
                const targetRange = { startRow: 6, endRow: 7, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 10,
                    endRow: 11,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-4 reduce', () => {
                const targetRange = { startRow: 3, endRow: 7, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 4,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-5 reduce', () => {
                const targetRange = { startRow: 8, endRow: 12, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 2,
                    endRow: 3,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-8 reduce', () => {
                const targetRange = { startRow: 8, endRow: 16, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 2,
                    endRow: 7,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-9 reduce', () => {
                const targetRange = { startRow: 3, endRow: 12, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 6,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-14 unchanged', () => {
                const targetRange = { startRow: 3, endRow: 19, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 19,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-15 move left and expend', () => {
                const targetRange = { startRow: 9, endRow: 19, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 17,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('1-6 expend', () => {
                const targetRange = { startRow: 13, endRow: 18, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 7,
                    endRow: 18,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
        });
        describe('fromRange is bottom of toRange', () => {
            beforeEach(() => {
                fromRange = { startRow: 15, endRow: 20, startColumn: startCol, endColumn: endCol };
                toRange = { startRow: 5, endRow: 10, startColumn: startCol, endColumn: endCol };
            });
            it('2-3 unchanged', () => {
                const targetRange = { startRow: 25, endRow: 26, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 25,
                    endRow: 26,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-1 unchanged', () => {
                const targetRange = { startRow: 2, endRow: 3, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 2,
                    endRow: 3,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-2 move right', () => {
                const targetRange = { startRow: 12, endRow: 13, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 18,
                    endRow: 19,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-4 expend', () => {
                const targetRange = { startRow: 3, endRow: 6, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 12,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-5 move right', () => {
                const targetRange = { startRow: 7, endRow: 10, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 13,
                    endRow: 16,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-9 expend', () => {
                const targetRange = { startRow: 3, endRow: 11, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 17,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-8 reduce and move right', () => {
                const targetRange = { startRow: 8, endRow: 18, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 14,
                    endRow: 20,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-11 unchanged', () => {
                const targetRange = { startRow: 3, endRow: 25, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 25,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-12 move right', () => {
                const targetRange = { startRow: 6, endRow: 7, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 12,
                    endRow: 13,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-14 expend', () => {
                const targetRange = { startRow: 3, endRow: 18, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 3,
                    endRow: 20,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-13 move left', () => {
                const targetRange = { startRow: 16, endRow: 17, startColumn: startCol, endColumn: endCol };
                const operators = handleMoveRows(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                expect(runRefRangeMutations(operators!, targetRange)).toEqual({
                    startRow: 6,
                    endRow: 7,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
        });
    });
    describe('handleMoveRowsCommon', () => {
        // see docs/tldr/handMoveRowsCols.tldr
        const startCol = 0;
        const endCol = 999;
        let fromRange: IRange;
        let toRange: IRange;

        describe('formRange is top of toRange', () => {
            beforeEach(() => {
                fromRange = { startRow: 5, endRow: 10, startColumn: startCol, endColumn: endCol };
                toRange = { startRow: 15, endRow: 20, startColumn: startCol, endColumn: endCol };
            });

            it('contain', () => {
                const targetRange2_1: IRange = {
                    startRow: 6,
                    endRow: 9,
                    startColumn: 0,
                    endColumn: 2,
                };
                const targetRange2_2: IRange = {
                    startRow: 16,
                    endRow: 19,
                    startColumn: 0,
                    endColumn: 2,
                };

                const resRange2_1 = handleMoveRowsCommon(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange2_1
                );
                const resRange2_2 = handleMoveRowsCommon(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange2_2
                );
                expect(resRange2_1[0].startRow).toEqual(10);
                expect(resRange2_1[0].endRow).toEqual(13);

                expect(formatRanges(resRange2_2)).toEqual(formatRanges([targetRange2_2]));
            });

            it('intersect', () => {
                const targetRange1_1: IRange = {
                    startRow: 2,
                    endRow: 12,
                    startColumn: 0,
                    endColumn: 10,
                };
                const targetRange1_2: IRange = {
                    startRow: 12,
                    endRow: 22,
                    startColumn: 0,
                    endColumn: 10,
                };

                const resRange1_1 = handleMoveRowsCommon(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange1_1
                );
                const resRange1_2 = handleMoveRowsCommon(
                    { id: EffectRefRangId.MoveRowsCommandId, params: { toRange, fromRange } },
                    targetRange1_2
                );

                expect(resRange1_1).toEqual(
                    [
                        {
                            endColumn: 10,
                            endRow: 14,
                            startColumn: 0,
                            startRow: 9,
                        },
                        {
                            endColumn: 10,
                            endRow: 6,
                            startColumn: 0,
                            startRow: 2,
                        },
                    ]
                );
                expect(resRange1_2).toEqual([
                    {
                        endColumn: 10,
                        endRow: 22,
                        startColumn: 0,
                        startRow: 15,
                    },
                    {
                        endColumn: 10,
                        endRow: 8,
                        startColumn: 0,
                        startRow: 6,
                    },
                ]);
            });
        });
    });
    describe('handleInsertRangeMoveDown', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startRow: 5, endRow: 10, startColumn: 4, endColumn: 7 };
        });
        it('the targetRange is in the range bottom without overlap', () => {
            const targetRange = { startRow: 12, endRow: 13, startColumn: 5, endColumn: 5 };
            const operators = handleInsertRangeMoveDown(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveDownCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 18, endRow: 19, startColumn: 5, endColumn: 5 });
        });
        it('the targetRange is in the range bottom with overlap', () => {
            const targetRange = { startRow: 10, endRow: 11, startColumn: 5, endColumn: 5 };
            const operators = handleInsertRangeMoveDown(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveDownCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 16, endRow: 17, startColumn: 5, endColumn: 5 });
        });
        it('the targetRange is overlap with range ', () => {
            const targetRange = { startRow: 12, endRow: 13, startColumn: 4, endColumn: 6 };
            const operators = handleInsertRangeMoveDown(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveDownCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ ...targetRange, startRow: 18, endRow: 19 });
        });
    });

    describe('handleInsertRangeMoveDownCommon', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startRow: 2, endRow: 2, startColumn: 0, endColumn: 5 };
        });

        it('intersects', () => {
            const target = {
                startRow: 0,
                endRow: 5,
                startColumn: 0,
                endColumn: 5,
            };

            const res = handleInsertRangeMoveDownCommon(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveDownCommandId,
                },
                target
            );

            expect(formatRanges(res)).toEqual(
                formatRanges([
                    {
                        startRow: 3,
                        endRow: 6,
                        startColumn: 0,
                        endColumn: 5,
                    },
                    {
                        startRow: 0,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 5,
                    },
                ])
            );
        });

        it('no-intersects', () => {
            const target = {
                startRow: 0,
                endRow: 5,
                startColumn: 6,
                endColumn: 10,
            };

            const res = handleInsertRangeMoveDownCommon(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveDownCommandId,
                },
                target
            );

            expect(formatRanges(res)).toEqual(
                formatRanges([
                    {
                        startRow: 0,
                        endRow: 5,
                        startColumn: 6,
                        endColumn: 10,
                    },
                ])
            );
        });
    });

    describe('handleInsertRangeMoveRight', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startRow: 5, endRow: 10, startColumn: 4, endColumn: 7 };
        });
        it('the targetRange is in the range right without overlap', () => {
            const targetRange = { startRow: 6, endRow: 8, startColumn: 9, endColumn: 10 };
            const operators = handleInsertRangeMoveRight(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveRightCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 6, endRow: 8, startColumn: 13, endColumn: 14 });
        });
        it('the targetRange is in the range right with overlap', () => {
            const targetRange = { startRow: 6, endRow: 8, startColumn: 7, endColumn: 8 };
            const operators = handleInsertRangeMoveRight(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveRightCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 6, endRow: 8, startColumn: 11, endColumn: 12 });
        });
        it('the targetRange is overlap with range ', () => {
            const targetRange = { startRow: 10, endRow: 13, startColumn: 11, endColumn: 11 };
            const operators = handleInsertRangeMoveRight(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveRightCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual(targetRange);
        });
    });

    describe('handleInsertRangeMoveRightCommon', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startColumn: 2, endColumn: 2, startRow: 0, endRow: 5 };
        });

        it('intersects', () => {
            const target = {
                startColumn: 0,
                endColumn: 5,
                startRow: 0,
                endRow: 5,
            };

            const res = handleInsertRangeMoveRightCommon(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveRightCommandId,
                },
                target
            );

            expect(formatRanges(res)).toEqual(
                formatRanges([
                    {
                        startColumn: 3,
                        endColumn: 6,
                        startRow: 0,
                        endRow: 5,
                    },
                    {
                        startColumn: 0,
                        endColumn: 1,
                        startRow: 0,
                        endRow: 5,
                    },
                ])
            );
        });

        it('no-intersects', () => {
            const target = {
                startColumn: 0,
                endColumn: 5,
                startRow: 6,
                endRow: 10,
            };

            const res = handleInsertRangeMoveRightCommon(
                {
                    params: { range },
                    id: EffectRefRangId.InsertRangeMoveRightCommandId,
                },
                target
            );

            expect(formatRanges(res)).toEqual(
                formatRanges([
                    {
                        startColumn: 0,
                        endColumn: 5,
                        startRow: 6,
                        endRow: 10,
                    },
                ])
            );
        });
    });

    describe('handleDeleteRangeMoveLeft', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startRow: 5, endRow: 10, startColumn: 4, endColumn: 7 };
        });
        it('the targetRange is in the range right without overlap', () => {
            const targetRange = { startRow: 6, endRow: 8, startColumn: 9, endColumn: 10 };
            const operators = handleDeleteRangeMoveLeft(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 6, endRow: 8, startColumn: 5, endColumn: 6 });
        });
        it('the targetRange is in the range right with overlap', () => {
            const targetRange = { startRow: 6, endRow: 8, startColumn: 7, endColumn: 8 };
            const operators = handleDeleteRangeMoveLeft(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 6, endRow: 8, startColumn: 4, endColumn: 4 });
        });
        it('the targetRange is in the range right with overlap, but startColumn is the same', () => {
            const targetRange = { startRow: 6, endRow: 8, startColumn: 7, endColumn: 8 };
            const operators = handleDeleteRangeMoveLeft(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 6, endRow: 8, startColumn: 4, endColumn: 4 });
        });
        it('the targetRange is overlap with range ', () => {
            const targetRange = { startRow: 10, endRow: 13, startColumn: 11, endColumn: 11 };
            const operators = handleDeleteRangeMoveLeft(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual(targetRange);
        });
    });

    describe('handleDeleteRangeMoveLeftCommon', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startColumn: 2, endColumn: 2, startRow: 0, endRow: 5 };
        });

        it('intersects', () => {
            const target = {
                startRow: 0,
                endRow: 5,
                startColumn: 0,
                endColumn: 5,
            };

            const res = handleDeleteRangeMoveLeftCommon(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                },
                target
            );

            expect(formatRanges(res)).toEqual(
                formatRanges([
                    {
                        startRow: 0,
                        endRow: 5,
                        startColumn: 0,
                        endColumn: 4,
                    },
                ])
            );
        });

        it('no-intersects', () => {
            const target = {
                startRow: 6,
                endRow: 10,
                startColumn: 0,
                endColumn: 5,
            };

            const res = handleDeleteRangeMoveLeftCommon(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                },
                target
            );

            expect(formatRanges(res)).toEqual(
                formatRanges([
                    {
                        startRow: 6,
                        endRow: 10,
                        startColumn: 0,
                        endColumn: 5,
                    },
                ])
            );
        });
    });

    describe('handleDeleteRangeMoveUpCommon', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startRow: 2, endRow: 2, startColumn: 0, endColumn: 5 };
        });

        it('intersects', () => {
            const target = {
                startRow: 0,
                endRow: 5,
                startColumn: 0,
                endColumn: 5,
            };

            const res = handleDeleteRangeMoveUpCommon(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                },
                target
            );

            expect(formatRanges(res)).toEqual(
                formatRanges([
                    {
                        startRow: 0,
                        endRow: 4,
                        startColumn: 0,
                        endColumn: 5,
                    },
                ])
            );
        });

        it('no-intersects', () => {
            const target = {
                startRow: 0,
                endRow: 5,
                startColumn: 6,
                endColumn: 10,
            };

            const res = handleDeleteRangeMoveUpCommon(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                },
                target
            );

            expect(formatRanges(res)).toEqual(
                formatRanges([
                    {
                        startRow: 0,
                        endRow: 5,
                        startColumn: 6,
                        endColumn: 10,
                    },
                ])
            );
        });
    });
    describe('handleDeleteRangeMoveUp', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startRow: 5, endRow: 10, startColumn: 4, endColumn: 7 };
        });
        it('the targetRange is in the range bottom without overlap', () => {
            const targetRange = { startRow: 12, endRow: 13, startColumn: 5, endColumn: 5 };
            const operators = handleDeleteRangeMoveUp(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 6, endRow: 7, startColumn: 5, endColumn: 5 });
        });
        it('the targetRange is in the range bottom with overlap', () => {
            const targetRange = { startRow: 10, endRow: 11, startColumn: 5, endColumn: 5 };
            const operators = handleDeleteRangeMoveUp(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 5, endRow: 5, startColumn: 5, endColumn: 5 });
        });

        it('the targetRange is not overlap with range ', () => {
            const targetRange = { startRow: 0, endRow: 1, startColumn: 5, endColumn: 5 };
            const operators = handleDeleteRangeMoveUp(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 0, endRow: 1, startColumn: 5, endColumn: 5 });
        });
        it('the targetRange is  overlap with range 2', () => {
            const targetRange = { startRow: 5, endRow: 5, startColumn: 4, endColumn: 7 };
            const operators = handleDeleteRangeMoveUp(
                {
                    params: { range },
                    id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual(null);
        });
    });

    describe('handleInsertCol', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startRow: 0, endRow: 99, startColumn: 5, endColumn: 10 };
        });
        it('the targetRange is on the range left', () => {
            const targetRange = { startRow: 0, endRow: 99, startColumn: 2, endColumn: 3 };
            const operators = handleInsertCol(
                {
                    id: EffectRefRangId.InsertColCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 0, endRow: 99, startColumn: 2, endColumn: 3 });
        });
        it('the targetRange is in the range', () => {
            const targetRange = { startRow: 0, endRow: 99, startColumn: 5, endColumn: 6 };
            const operators = handleInsertCol(
                {
                    id: EffectRefRangId.InsertColCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 0, endRow: 99, startColumn: 11, endColumn: 12 });
        });
        it('the targetRange is contain the range', () => {
            const targetRange = { startRow: 0, endRow: 99, startColumn: 4, endColumn: 11 };
            const operators = handleInsertCol(
                {
                    id: EffectRefRangId.InsertColCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 0, endRow: 99, startColumn: 4, endColumn: 17 });
        });
        it('the targetRange is overlap with  range', () => {
            const targetRange = { startRow: 0, endRow: 99, startColumn: 4, endColumn: 6 };
            const operators = handleInsertCol(
                {
                    id: EffectRefRangId.InsertColCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ ...targetRange, endColumn: 12 });
        });
        it('the targetRange is on the range bottom', () => {
            const targetRange = { startRow: 0, endRow: 99, startColumn: 12, endColumn: 13 };

            const operators = handleInsertCol(
                {
                    id: EffectRefRangId.InsertColCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 0, endRow: 99, startColumn: 18, endColumn: 19 });
        });

        it('the targetRange is on the range start', () => {
            const targetRange = { startRow: 0, endRow: 99, startColumn: 5, endColumn: 6 };

            const operators = handleInsertCol(
                {
                    id: EffectRefRangId.InsertColCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 0, endRow: 99, startColumn: 11, endColumn: 12 });
        });
    });

    describe('handleInsertRow', () => {
        let range: IRange;
        beforeEach(() => {
            range = { startRow: 5, endRow: 10, startColumn: 0, endColumn: 99 };
        });
        it('the targetRange is on the range top', () => {
            const targetRange = { startRow: 3, endColumn: 99, startColumn: 0, endRow: 4 };
            const operators = handleInsertRow(
                {
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 3, endColumn: 99, startColumn: 0, endRow: 4 });
        });
        it('the targetRange is in the range', () => {
            const targetRange = { startRow: 5, endRow: 6, endColumn: 99, startColumn: 0 };
            const operators = handleInsertRow(
                {
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 11, endColumn: 99, startColumn: 0, endRow: 12 });
        });
        it('the targetRange is contain the range', () => {
            const targetRange = { startRow: 4, endRow: 11, endColumn: 99, startColumn: 0 };
            const operators = handleInsertRow(
                {
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 4, endRow: 17, endColumn: 99, startColumn: 0 });
        });
        it('the targetRange is overlap with range', () => {
            const targetRange = { startRow: 4, endRow: 6, endColumn: 99, startColumn: 0 };
            const operators = handleInsertRow(
                {
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ ...targetRange, endRow: 12 });
        });
        it('the targetRange is on the range bottom', () => {
            const targetRange = { startRow: 12, endColumn: 99, startColumn: 0, endRow: 13 };
            const operators = handleInsertRow(
                {
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 18, endColumn: 99, startColumn: 0, endRow: 19 });
        });

        it('the targetRange is on the range start', () => {
            const targetRange = { startRow: 5, endRow: 6, endColumn: 99, startColumn: 0 };
            const operators = handleInsertRow(
                {
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 11, endColumn: 99, startColumn: 0, endRow: 12 });
        });

        it('the targetRange is overlap range 2', () => {
            const targetRange = { startRow: 4, endRow: 6, endColumn: 99, startColumn: 0 };
            const operators = handleInsertRow(
                {
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: '' as any },
                },
                targetRange
            );
            const result = runRefRangeMutations(operators!, targetRange);
            expect(result).toEqual({ startRow: 4, endRow: 12, endColumn: 99, startColumn: 0 });
        });
    });
    describe('handleInsertRowCommon', () => {
        it('should shift range down when range is below insertion point', () => {
            const info: ICommandInfo<IInsertRowCommandParams> = {
                params: {
                    range: { startRow: 5, endRow: 7, startColumn: 0, endColumn: 5 },
                    unitId: '',
                    subUnitId: '',
                    direction: 0,
                },
                id: '',
            };
            const targetRange = { startRow: 10, endRow: 15, startColumn: 2, endColumn: 8 };

            const result = handleInsertRowCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 13, // 10 + (7 - 5 + 1)
                endRow: 18, // 15 + (7 - 5 + 1)
                startColumn: 2,
                endColumn: 8,
            }]);
        });

        it('should not change range when range is above insertion point', () => {
            const info: ICommandInfo<IInsertRowCommandParams> = {
                params: {
                    range: { startRow: 10, endRow: 12, startColumn: 0, endColumn: 5 },
                    unitId: '',
                    subUnitId: '',
                    direction: 0,
                },
                id: '',
            };
            const targetRange = { startRow: 3, endRow: 8, startColumn: 2, endColumn: 8 };

            const result = handleInsertRowCommon(info, targetRange);

            expect(result).toEqual([targetRange]);
        });

        it('should expand range when insertion point is within the range', () => {
            const info: ICommandInfo<IInsertRowCommandParams> = {
                params: {
                    range: { startRow: 7, endRow: 9, startColumn: 0, endColumn: 5 },
                    unitId: '',
                    subUnitId: '',
                    direction: 0,
                },
                id: '',
            };
            const targetRange = { startRow: 5, endRow: 12, startColumn: 2, endColumn: 8 };

            const result = handleInsertRowCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 5,
                endRow: 15, // 12 + (9 - 7 + 1)
                startColumn: 2,
                endColumn: 8,
            }]);
        });

        it('should handle insertion at the start of the range', () => {
            const info: ICommandInfo<IInsertRowCommandParams> = {
                params: {
                    range: { startRow: 5, endRow: 7, startColumn: 0, endColumn: 5 },
                    unitId: '',
                    subUnitId: '',
                    direction: 0,
                },
                id: '',
            };
            const targetRange = { startRow: 5, endRow: 10, startColumn: 2, endColumn: 8 };

            const result = handleInsertRowCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 8,
                endRow: 13, // 10 + (7 - 5 + 1)
                startColumn: 2,
                endColumn: 8,
            }]);
        });

        it('should handle insertion at the end of the range', () => {
            const info = {
                params: {
                    range: { startRow: 10, endRow: 12, startColumn: 0, endColumn: 5 },
                    unitId: '',
                    subUnitId: '',
                    direction: 0,
                },
                id: '',
            };
            const targetRange = { startRow: 5, endRow: 10, startColumn: 2, endColumn: 8 };

            const result = handleInsertRowCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 5,
                endRow: 13, // 10 + (12 - 10 + 1)
                startColumn: 2,
                endColumn: 8,
            }]);
        });

        it('should handle insertion of multiple rows', () => {
            const info = {
                params: {
                    range: { startRow: 5, endRow: 10, startColumn: 0, endColumn: 5 },
                    unitId: '',
                    subUnitId: '',
                    direction: 0,
                },
                id: '',
            };
            const targetRange = { startRow: 15, endRow: 20, startColumn: 2, endColumn: 8 };

            const result = handleInsertRowCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 21, // 15 + (10 - 5 + 1)
                endRow: 26, // 20 + (10 - 5 + 1)
                startColumn: 2,
                endColumn: 8,
            }]);
        });
    });
    describe('handleInsertColCommon', () => {
        it('should shift range right when range is to the right of insertion point', () => {
            const info: ICommandInfo<IInsertColCommandParams> = {
                params: {
                    range: { startRow: 0, endRow: 5, startColumn: 5, endColumn: 7 },
                    unitId: '',
                    subUnitId: '',
                    direction: Direction.LEFT,
                },
                id: '',
            };
            const targetRange = { startRow: 2, endRow: 8, startColumn: 10, endColumn: 15 };

            const result = handleInsertColCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 2,
                endRow: 8,
                startColumn: 13, // 10 + (7 - 5 + 1)
                endColumn: 18, // 15 + (7 - 5 + 1)
            }]);
        });

        it('should not change range when range is to the left of insertion point', () => {
            const info: ICommandInfo<IInsertColCommandParams> = {
                params: {
                    range: { startRow: 0, endRow: 5, startColumn: 10, endColumn: 12 },
                    unitId: '',
                    subUnitId: '',
                    direction: Direction.LEFT,
                },
                id: '',
            };
            const targetRange = { startRow: 2, endRow: 8, startColumn: 3, endColumn: 8 };

            const result = handleInsertColCommon(info, targetRange);

            expect(result).toEqual([targetRange]);
        });

        it('should expand range when insertion point is within the range', () => {
            const info: ICommandInfo<IInsertColCommandParams> = {
                params: {
                    range: { startRow: 0, endRow: 5, startColumn: 7, endColumn: 9 },
                    unitId: '',
                    subUnitId: '',
                    direction: Direction.LEFT,
                },
                id: '',
            };
            const targetRange = { startRow: 2, endRow: 8, startColumn: 5, endColumn: 12 };

            const result = handleInsertColCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 2,
                endRow: 8,
                startColumn: 5,
                endColumn: 15, // 12 + (9 - 7 + 1)
            }]);
        });

        it('should handle insertion at the start of the range', () => {
            const info: ICommandInfo<IInsertColCommandParams> = {
                params: {
                    range: { startRow: 0, endRow: 5, startColumn: 5, endColumn: 7 },
                    unitId: '',
                    subUnitId: '',
                    direction: Direction.LEFT,
                },
                id: '',
            };
            const targetRange = { startRow: 2, endRow: 8, startColumn: 5, endColumn: 10 };

            const result = handleInsertColCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 2,
                endRow: 8,
                startColumn: 8, // 5 + (7 - 5 + 1)
                endColumn: 13, // 10 + (7 - 5 + 1)
            }]);
        });

        it('should handle insertion at the end of the range', () => {
            const info: ICommandInfo<IInsertColCommandParams> = {
                params: {
                    range: { startRow: 0, endRow: 5, startColumn: 10, endColumn: 12 },
                    unitId: '',
                    subUnitId: '',
                    direction: Direction.LEFT,
                },
                id: '',
            };
            const targetRange = { startRow: 2, endRow: 8, startColumn: 5, endColumn: 10 };

            const result = handleInsertColCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 2,
                endRow: 8,
                startColumn: 5,
                endColumn: 13, // 10 + (12 - 10 + 1)
            }]);
        });

        it('should handle insertion of multiple columns', () => {
            const info: ICommandInfo<IInsertColCommandParams> = {
                params: {
                    range: { startRow: 0, endRow: 5, startColumn: 5, endColumn: 10 },
                    unitId: '',
                    subUnitId: '',
                    direction: Direction.LEFT,
                },
                id: '',
            };
            const targetRange = { startRow: 2, endRow: 8, startColumn: 15, endColumn: 20 };

            const result = handleInsertColCommon(info, targetRange);

            expect(result).toEqual([{
                startRow: 2,
                endRow: 8,
                startColumn: 21, // 15 + (10 - 5 + 1)
                endColumn: 26, // 20 + (10 - 5 + 1)
            }]);
        });
    });
    describe('handleMoveRange', () => {
        describe('fromRange and toRange is no overlap', () => {
            let toRange: IRange;
            let fromRange: IRange;
            beforeEach(() => {
                toRange = { startRow: 4, endColumn: 7, startColumn: 4, endRow: 7 };
                fromRange = { startRow: 0, endColumn: 3, startColumn: 0, endRow: 3 };
            });
            it('fromRange contain targetRange  ', () => {
                const targetRange: IRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ endColumn: 5, endRow: 5, startColumn: 4, startRow: 4 });
            });
            it('fromRange intersect targetRange  ', () => {
                const targetRange: IRange = { startRow: 3, endRow: 4, startColumn: 0, endColumn: 1 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual(targetRange);
            });

            it('toRange intersect targetRange  ', () => {
                const targetRange: IRange = { startRow: 4, endRow: 9, startColumn: 4, endColumn: 5 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual(targetRange);
            });
            it('toRange contain targetRange  ', () => {
                const targetRange: IRange = { startRow: 4, endRow: 5, startColumn: 4, endColumn: 5 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual(null);
            });

            it('toRange and  fromRange not overlap with targetRange', () => {
                const targetRange: IRange = { startRow: 20, endRow: 30, startColumn: 20, endColumn: 30 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 20, endRow: 30, startColumn: 20, endColumn: 30 });
            });
        });
        describe('fromRange and toRang is overlap ', () => {
            let toRange: IRange;
            let fromRange: IRange;
            beforeEach(() => {
                fromRange = { startRow: 0, endColumn: 3, startColumn: 0, endRow: 3 };
                toRange = { startRow: 2, endRow: 5, startColumn: 2, endColumn: 5 };
            });
            it('fromRange contain targetRange and is not intersect toRange', () => {
                const targetRange: IRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ endColumn: 3, endRow: 3, startColumn: 2, startRow: 2 });
            });
            it('fromRange contain targetRange and is intersect toRange', () => {
                const targetRange: IRange = { startRow: 2, endRow: 3, startColumn: 1, endColumn: 2 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ endColumn: 4, endRow: 5, startColumn: 3, startRow: 4 });
            });
            it('targetRange is equal with the intersect with fromRange and toRange  ', () => {
                const targetRange: IRange = { startRow: 2, endRow: 3, startColumn: 2, endColumn: 3 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ endColumn: 5, endRow: 5, startColumn: 4, startRow: 4 });
            });
            it('toRange and  fromRange not overlap with targetRange', () => {
                const targetRange: IRange = { startRow: 20, endRow: 30, startColumn: 20, endColumn: 30 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 20, endRow: 30, startColumn: 20, endColumn: 30 });
            });
            it('targetRange is intersect with toRange ', () => {
                const targetRange: IRange = { startRow: 2, endRow: 3, startColumn: 4, endColumn: 5 };
                const operators = handleMoveRange(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual(null);
            });
        });
    });

    describe('handleMoveRangeCommon', () => {
        describe('intersects', () => {
            let toRange: IRange;
            let fromRange: IRange;
            beforeEach(() => {
                toRange = { startRow: 4, endColumn: 7, startColumn: 4, endRow: 7 };
                fromRange = { startRow: 0, endColumn: 3, startColumn: 0, endRow: 3 };
            });

            it('should work', () => {
                const range1 = {
                    startRow: 0,
                    endColumn: 5,
                    startColumn: 0,
                    endRow: 5,
                };
                const range2 = {
                    startRow: 6,
                    endColumn: 10,
                    startColumn: 6,
                    endRow: 10,
                };
                const res1 = handleMoveRangeCommon(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    range1
                );

                const res2 = handleMoveRangeCommon(
                    { id: EffectRefRangId.MoveRangeCommandId, params: { toRange, fromRange } },
                    range2
                );

                expect(formatRanges(res1)).toEqual(
                    formatRanges(
                        [{
                            endColumn: 7,
                            endRow: 5,
                            startColumn: 0,
                            startRow: 4,
                        }, {
                            endColumn: 5,
                            endRow: 3,
                            startColumn: 4,
                            startRow: 0,
                        }, {
                            endColumn: 7,
                            endRow: 7,
                            startColumn: 4,
                            startRow: 6,
                        }]
                    )
                );
                expect(formatRanges(res2)).toEqual(
                    formatRanges(
                        [{
                            endColumn: 10,
                            endRow: 10,
                            startColumn: 8,
                            startRow: 6,
                        }, {
                            endColumn: 7,
                            endRow: 10,
                            startColumn: 6,
                            startRow: 8,
                        }]
                    )
                );
            });
        });
    });
    describe('handleIRemoveCol', () => {
        let range: IRange;
        describe('the range contain targetRange', () => {
            beforeEach(() => {
                range = { startRow: 0, endColumn: 10, startColumn: 5, endRow: 99 };
            });
            it('the targetRange is single col', () => {
                const targetRange = { startRow: 0, endColumn: 5, startColumn: 5, endRow: 99 };
                const operators = handleIRemoveCol(
                    { params: { range }, id: EffectRefRangId.RemoveColCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toBe(null);
            });
            it('the targetRange is multiple col ', () => {
                const targetRange = { startRow: 0, endColumn: 5, startColumn: 6, endRow: 99 };
                const operators = handleIRemoveCol(
                    { params: { range }, id: EffectRefRangId.RemoveColCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toBe(null);
            });
            it('the targetRange is equal range', () => {
                const targetRange = { startRow: 0, endColumn: 5, startColumn: 10, endRow: 99 };
                const operators = handleIRemoveCol(
                    { params: { range }, id: EffectRefRangId.RemoveColCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toBe(null);
            });
        });
        describe('the targetRange in the range right', () => {
            beforeEach(() => {
                range = { startRow: 0, endColumn: 10, startColumn: 5, endRow: 99 };
            });
            it('targetRange is overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 11, startColumn: 10, endRow: 99 };
                const operators = handleIRemoveCol(
                    { params: { range }, id: EffectRefRangId.RemoveColCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 0, endColumn: 5, startColumn: 5, endRow: 99 });
            });
            it('targetRange is no overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 12, startColumn: 11, endRow: 99 };
                const operators = handleIRemoveCol(
                    { params: { range }, id: EffectRefRangId.RemoveColCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 0, endColumn: 6, startColumn: 5, endRow: 99 });
            });
        });
        describe('the targetRange in the range left', () => {
            beforeEach(() => {
                range = { startRow: 0, endColumn: 10, startColumn: 5, endRow: 99 };
            });
            it('targetRange is overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 5, startColumn: 4, endRow: 99 };
                const operators = handleIRemoveCol(
                    { params: { range }, id: EffectRefRangId.RemoveColCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 0, endColumn: 4, startColumn: 4, endRow: 99 });
            });
            it('targetRange is no overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 3, startColumn: 2, endRow: 99 };
                const operators = handleIRemoveCol(
                    { params: { range }, id: EffectRefRangId.RemoveColCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 0, endColumn: 3, startColumn: 2, endRow: 99 });
            });
        });
    });
    // eslint-disable-next-line test/no-identical-title
    describe('handleIRemoveCol', () => {
        it('should delete the target range when it is completely contained within the removed range', () => {
            const param: IRemoveRowColCommand = {
                id: EffectRefRangId.RemoveColCommandId,
                params: {
                    range: { startRow: 0, endRow: 10, startColumn: 3, endColumn: 8 },

                },
            };
            const targetRange = { startRow: 2, endRow: 5, startColumn: 4, endColumn: 7 };

            const operators = handleIRemoveCol(param, targetRange);
            const result = runRefRangeMutations(operators, targetRange);

            expect(result).toBeNull();
        });

        it('should shift the target range left when it is to the right of the removed range', () => {
            const param: IRemoveRowColCommand = {
                id: EffectRefRangId.RemoveColCommandId,
                params: {
                    range: { startRow: 0, endRow: 10, startColumn: 3, endColumn: 5 },

                },
            };
            const targetRange = { startRow: 2, endRow: 5, startColumn: 8, endColumn: 12 };

            const operators = handleIRemoveCol(param, targetRange);
            const result = runRefRangeMutations(operators, targetRange);

            expect(result).toEqual({
                startRow: 2,
                endRow: 5,
                startColumn: 5, // 8 - (5 - 3 + 1)
                endColumn: 9, // 12 - (5 - 3 + 1)
            });
        });

        it('should not affect the target range when it is to the left of the removed range', () => {
            const param: IRemoveRowColCommand = {
                id: EffectRefRangId.RemoveColCommandId,
                params: {
                    range: { startRow: 0, endRow: 10, startColumn: 8, endColumn: 10 },

                },
            };
            const targetRange = { startRow: 2, endRow: 5, startColumn: 3, endColumn: 6 };

            const operators = handleIRemoveCol(param, targetRange);
            const result = runRefRangeMutations(operators, targetRange);

            expect(result).toEqual(targetRange);
        });

        it('should reduce the width of the target range when it overlaps with the right side of the removed range', () => {
            const param: IRemoveRowColCommand = {
                id: EffectRefRangId.RemoveColCommandId,
                params: {
                    range: { startRow: 0, endRow: 10, startColumn: 5, endColumn: 8 },

                },
            };
            const targetRange = { startRow: 2, endRow: 5, startColumn: 3, endColumn: 10 };

            const operators = handleIRemoveCol(param, targetRange);
            const result = runRefRangeMutations(operators, targetRange);

            expect(result).toEqual({
                startRow: 2,
                endRow: 5,
                startColumn: 3,
                endColumn: 6, // 10 - (8 - 5 + 1)
            });
        });

        it('should reduce the width of the target range when it overlaps with the left side of the removed range', () => {
            const param: IRemoveRowColCommand = {
                id: EffectRefRangId.RemoveColCommandId,
                params: {
                    range: { startRow: 0, endRow: 10, startColumn: 3, endColumn: 6 },

                },
            };
            const targetRange = { startRow: 2, endRow: 5, startColumn: 1, endColumn: 5 };

            const operators = handleIRemoveCol(param, targetRange);
            const result = runRefRangeMutations(operators, targetRange);

            expect(result).toEqual({
                startRow: 2,
                endRow: 5,
                startColumn: 1,
                endColumn: 2, // 5 - (6 - 3 + 1)
            });
        });

        it('should handle the case when the removed range starts at the same column as the target range', () => {
            const param: IRemoveRowColCommand = {
                id: EffectRefRangId.RemoveColCommandId,
                params: {
                    range: { startRow: 0, endRow: 10, startColumn: 3, endColumn: 5 },

                },
            };
            const targetRange = { startRow: 2, endRow: 5, startColumn: 3, endColumn: 8 };

            const operators = handleIRemoveCol(param, targetRange);
            const result = runRefRangeMutations(operators, targetRange);

            expect(result).toEqual({
                startRow: 2,
                endRow: 5,
                startColumn: 3,
                endColumn: 5, // 8 - (5 - 3 + 1)
            });
        });

        it('should handle the case when the removed range ends at the same column as the target range', () => {
            const param: IRemoveRowColCommand = {
                id: EffectRefRangId.RemoveColCommandId,
                params: {
                    range: { startRow: 0, endRow: 10, startColumn: 3, endColumn: 8 },

                },
            };
            const targetRange = { startRow: 2, endRow: 5, startColumn: 6, endColumn: 8 };

            const operators = handleIRemoveCol(param, targetRange);
            const result = runRefRangeMutations(operators, targetRange);

            expect(result).toBeNull();
        });

        it('should return empty operators when range is not provided', () => {
            const param: IRemoveRowColCommand = {
                id: EffectRefRangId.RemoveColCommandId,
                params: undefined,
            };
            const targetRange = { startRow: 2, endRow: 5, startColumn: 3, endColumn: 8 };

            const operators = handleIRemoveCol(param, targetRange);

            expect(operators).toEqual([]);
        });
    });
    describe('handleIRemoveRow', () => {
        let range: IRange;
        describe('the range contain targetRange', () => {
            beforeEach(() => {
                range = { startRow: 5, endRow: 10, startColumn: 0, endColumn: 99 };
            });
            it('the targetRange is single row', () => {
                const targetRange = { startRow: 5, endRow: 5, startColumn: 0, endColumn: 99 };
                const operators = handleIRemoveRow(
                    { params: { range }, id: EffectRefRangId.RemoveRowCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toBe(null);
            });
            it('the targetRange is multiple row ', () => {
                const targetRange = { startRow: 0, endRow: 5, startColumn: 0, endColumn: 99 };
                const operators = handleIRemoveRow(
                    { params: { range }, id: EffectRefRangId.RemoveRowCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({
                    endColumn: 99,
                    endRow: 4,
                    startColumn: 0,
                    startRow: 0,
                });
            });
        });
        describe('the targetRange in the range top', () => {
            beforeEach(() => {
                range = { startRow: 5, endColumn: 99, startColumn: 0, endRow: 10 };
            });
            it('targetRange is overlap with range ', () => {
                const targetRange = { startRow: 4, endRow: 5, endColumn: 99, startColumn: 0 };
                const operators = handleIRemoveRow(
                    { params: { range }, id: EffectRefRangId.RemoveRowCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 4, endColumn: 99, startColumn: 0, endRow: 4 });
            });
            it('targetRange is no overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 99, startColumn: 0, endRow: 3 };
                const operators = handleIRemoveRow(
                    { params: { range }, id: EffectRefRangId.RemoveRowCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 0, endColumn: 99, startColumn: 0, endRow: 3 });
            });
        });
        describe('the targetRange in the range bottom', () => {
            beforeEach(() => {
                range = { startRow: 5, endRow: 10, startColumn: 0, endColumn: 99 };
            });
            it('targetRange is overlap with range ', () => {
                const targetRange = { startRow: 10, endRow: 11, startColumn: 0, endColumn: 99 };
                const operators = handleIRemoveRow(
                    { params: { range }, id: EffectRefRangId.RemoveRowCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 5, endRow: 5, startColumn: 0, endColumn: 99 });
            });
            it('targetRange is no overlap with range ', () => {
                const targetRange = { startRow: 11, endRow: 13, endColumn: 99, startColumn: 0 };
                const operators = handleIRemoveRow(
                    { params: { range }, id: EffectRefRangId.RemoveRowCommandId },
                    targetRange
                );
                const result = runRefRangeMutations(operators!, targetRange);
                expect(result).toEqual({ startRow: 5, endRow: 7, endColumn: 99, startColumn: 0 });
            });
        });
    });

    describe('handleRemoveRowCommon', () => {
        it('should remove rows from the target range when removing a single range', () => {
            const param = {
                range: { startRow: 5, endRow: 7, startColumn: 0, endColumn: 10 },
                unitId: '',
                subUnitId: '',
            };
            const targetRange = { startRow: 3, endRow: 10, startColumn: 2, endColumn: 8 };

            const result = handleRemoveRowCommon(param, targetRange);

            // The result should have the rows 5-7 removed from the original range
            expect(result).toEqual([
                { startRow: 3, endRow: 7, startColumn: 2, endColumn: 8 },
            ]);
        });

        it('should remove rows from the target range when removing multiple ranges', () => {
            const param = {
                ranges: [
                    { startRow: 3, endRow: 4, startColumn: 0, endColumn: 10 },
                    { startRow: 8, endRow: 9, startColumn: 0, endColumn: 10 },
                ],
            } as IRemoveRowColCommandInterceptParams;
            const targetRange = { startRow: 2, endRow: 12, startColumn: 2, endColumn: 8 };

            const result = handleRemoveRowCommon(param, targetRange);

            // The result should have rows 3-4 and 8-9 removed
            expect(result).toEqual([
                { startRow: 2, endRow: 8, startColumn: 2, endColumn: 8 },
            ]);
        });

        it('should return empty array when all rows in the target range are removed', () => {
            const param = {
                range: { startRow: 5, endRow: 8, startColumn: 0, endColumn: 10 },
                unitId: '',
                subUnitId: '',
            };
            const targetRange = { startRow: 5, endRow: 8, startColumn: 2, endColumn: 8 };

            const result = handleRemoveRowCommon(param, targetRange);

            expect(result).toEqual([]);
        });

        it('should handle removing rows at the beginning of the target range', () => {
            const param = {
                range: { startRow: 3, endRow: 5, startColumn: 0, endColumn: 10 },
                unitId: '',
                subUnitId: '',
            };
            const targetRange = { startRow: 3, endRow: 10, startColumn: 2, endColumn: 8 };

            const result = handleRemoveRowCommon(param, targetRange);

            expect(result).toEqual([
                { startRow: 3, endRow: 7, startColumn: 2, endColumn: 8 },
            ]);
        });

        it('should handle removing rows at the end of the target range', () => {
            const param = {
                range: { startRow: 8, endRow: 10, startColumn: 0, endColumn: 10 },
                unitId: '',
                subUnitId: '',
            };
            const targetRange = { startRow: 3, endRow: 10, startColumn: 2, endColumn: 8 };

            const result = handleRemoveRowCommon(param, targetRange);

            expect(result).toEqual([
                { startRow: 3, endRow: 7, startColumn: 2, endColumn: 8 },
            ]);
        });

        it('should handle removing rows outside the target range', () => {
            const param = {
                range: { startRow: 15, endRow: 20, startColumn: 0, endColumn: 10 },
                unitId: '',
                subUnitId: '',
            };
            const targetRange = { startRow: 3, endRow: 10, startColumn: 2, endColumn: 8 };

            const result = handleRemoveRowCommon(param, targetRange);

            // The target range should remain unchanged
            expect(result).toEqual([targetRange]);
        });

        it('should handle removing rows that partially overlap with the target range', () => {
            const param = {
                range: { startRow: 8, endRow: 15, startColumn: 0, endColumn: 10 },
                unitId: '',
                subUnitId: '',
            };
            const targetRange = { startRow: 5, endRow: 12, startColumn: 2, endColumn: 8 };

            const result = handleRemoveRowCommon(param, targetRange);

            expect(result).toEqual([
                { startRow: 5, endRow: 7, startColumn: 2, endColumn: 8 },
            ]);
        });
    });

    describe('test different situations of adjustRangeOnMutation', () => {
        it('should "RemoveSheetMutation" drop all range in the same worksheet', () => {
            const range: IRange = { startRow: 0, endRow: 10, startColumn: 0, endColumn: 10 };
            const mutation = { id: RemoveSheetMutation.id, params: {} as IRemoveSheetMutationParams };
            const result = adjustRangeOnMutation(range, mutation);
            expect(result).toBe(null);
        });

        describe('test move row situations', () => {
            it('should move when the range is contained', () => {
                const range: IRange = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
                const mutation: IMutationInfo<IMoveRowsMutationParams> = {
                    id: MoveRowsMutation.id,
                    params: {
                        unitId: '',
                        subUnitId: '',
                        sourceRange: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 },
                        targetRange: { startRow: 7, endRow: 9, startColumn: 0, endColumn: 2 },
                    },
                };
                const result = adjustRangeOnMutation(range, mutation);
                expect(result).toEqual({ startRow: 5, endRow: 5, startColumn: 1, endColumn: 1 });
            });

            it('should expand when move inside', () => {
                const range: IRange = { startRow: 5, endRow: 7, startColumn: 1, endColumn: 1 };
                const mutation: IMutationInfo<IMoveRowsMutationParams> = {
                    id: MoveRowsMutation.id,
                    params: {
                        unitId: '',
                        subUnitId: '',
                        sourceRange: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 },
                        targetRange: { startRow: 6, endRow: 8, startColumn: 0, endColumn: 2 },
                    },
                };
                const result = adjustRangeOnMutation(range, mutation);
                expect(result).toEqual({ startRow: 2, endRow: 7, startColumn: 1, endColumn: 1 });
            });

            it('should expand when move inside 222', () => {
                const range: IRange = { startRow: 7, endRow: 9, startColumn: 1, endColumn: 1 };
                const mutation: IMutationInfo<IMoveRowsMutationParams> = {
                    id: MoveRowsMutation.id,
                    params: {
                        unitId: '',
                        subUnitId: '',
                        sourceRange: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 },
                        targetRange: { startRow: 6, endRow: 8, startColumn: 0, endColumn: 2 },
                    },
                };
                const result = adjustRangeOnMutation(range, mutation);
                expect(result).toEqual({ startRow: 7, endRow: 9, startColumn: 1, endColumn: 1 });
            });

            it('should be delete', () => {
                const targetRange: IRange = { startRow: 5, endRow: 7, startColumn: 1, endColumn: 1 };
                const resultRange = handleRemoveRowCommon({ range: { ...targetRange } }, targetRange);
                expect(resultRange.length).toBe(0);

                const resultRange2 = handleRemoveRowCommon({ range: { ...targetRange } }, { ...targetRange, startRow: 4 });
                expect(resultRange2).toEqual([{ startRow: 4, endRow: 4, startColumn: 1, endColumn: 1 }]);
            });

            it('should not be delete ', () => {
                const targetRange: IRange = { startRow: 5, endRow: 7, startColumn: 1, endColumn: 1 };
                const resultRange = handleRemoveRowCommon({ range: { ...targetRange }, ranges: [{ startRow: 5, endRow: 5, startColumn: 1, endColumn: 1 }, { startRow: 6, endRow: 6, startColumn: 1, endColumn: 1 }] }, targetRange);
                expect(resultRange).toEqual([{ startRow: 5, endRow: 5, startColumn: 1, endColumn: 1 }]);
            });
        });
    });
});
