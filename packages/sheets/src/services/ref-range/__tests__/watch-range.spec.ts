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

import type { IMutationInfo, IRange } from '@univerjs/core';
import type { IRemoveColMutationParams, IRemoveRowsMutationParams } from '../../../basics';

import type { IMoveRowsMutationParams } from '../../../commands/mutations/move-rows-cols.mutation';
import { beforeEach, describe, expect, it } from 'vitest';
import { MoveRowsMutation } from '../../../commands/mutations/move-rows-cols.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../../commands/mutations/remove-row-col.mutation';
import { EffectRefRangId } from '../type';
import {
    adjustRangeOnMutation,
    handleIRemoveRow,
    runRefRangeMutations,
} from '../util';

describe('test ref-range move', () => {
    describe('handleMoveRows', () => {
        // see docs/tldr/handMoveRowsCols.tldr
        const startCol = 0;
        const endCol = 999;
        let moveSourceRange: IRange;
        let moveTargetRange: IRange;
        let getMoveRowsMutation: () => IMutationInfo<IMoveRowsMutationParams>;

        describe('sourceRange is top of toRange', () => {
            beforeEach(() => {
                moveSourceRange = { startRow: 5, endRow: 10, startColumn: startCol, endColumn: endCol };
                moveTargetRange = { startRow: 15, endRow: 20, startColumn: startCol, endColumn: endCol };
                getMoveRowsMutation = () => {
                    return {
                        params: {
                            sourceRange: moveSourceRange,
                            targetRange: moveTargetRange,
                            unitId: '',
                            subUnitId: '',
                        },
                        id: MoveRowsMutation.id,
                    };
                };
            });

            it('1-1 unchanged', () => {
                const originRange = { startRow: 3, endRow: 4, startColumn: startCol, endColumn: endCol };
                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 4,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-3 unchanged', () => {
                const originRange = { startRow: 25, endRow: 26, startColumn: startCol, endColumn: endCol };
                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 25,
                    endRow: 26,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-11 unchanged', () => {
                const originRange = { startRow: 3, endRow: 26, startColumn: startCol, endColumn: endCol };
                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 26,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-2 move left', () => {
                const originRange = { startRow: 12, endRow: 13, startColumn: startCol, endColumn: endCol };
                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 6,
                    endRow: 7,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-12 move right', () => {
                const originRange = { startRow: 6, endRow: 7, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 10,
                    endRow: 11,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-4 reduce', () => {
                const originRange = { startRow: 3, endRow: 7, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 4,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-5 reduce', () => {
                const originRange = { startRow: 8, endRow: 12, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 2,
                    endRow: 3,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-8 reduce', () => {
                const originRange = { startRow: 8, endRow: 16, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 2,
                    endRow: 7,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-9 reduce', () => {
                const originRange = { startRow: 3, endRow: 12, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 6,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-14 unchanged', () => {
                const originRange = { startRow: 3, endRow: 19, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 19,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-15 move left and expend', () => {
                const originRange = { startRow: 9, endRow: 19, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 17,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('1-6 expend', () => {
                const originRange = { startRow: 13, endRow: 18, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 7,
                    endRow: 18,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
        });

        describe('fromRange is bottom of toRange', () => {
            beforeEach(() => {
                moveSourceRange = { startRow: 15, endRow: 20, startColumn: startCol, endColumn: endCol };
                moveTargetRange = { startRow: 5, endRow: 10, startColumn: startCol, endColumn: endCol };
                getMoveRowsMutation = () => {
                    return {
                        params: {
                            sourceRange: moveSourceRange,
                            targetRange: moveTargetRange,
                            unitId: '',
                            subUnitId: '',
                        },
                        id: MoveRowsMutation.id,
                    };
                };
            });

            it('2-3 unchanged', () => {
                const originRange = { startRow: 25, endRow: 26, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 25,
                    endRow: 26,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-1 unchanged', () => {
                const originRange = { startRow: 2, endRow: 3, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 2,
                    endRow: 3,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-2 move right', () => {
                const originRange = { startRow: 12, endRow: 13, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 18,
                    endRow: 19,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-4 expend', () => {
                const originRange = { startRow: 3, endRow: 6, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 12,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-5 move right', () => {
                const originRange = { startRow: 7, endRow: 10, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 13,
                    endRow: 16,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-9 expend', () => {
                const originRange = { startRow: 3, endRow: 11, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 17,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-8 reduce and move right', () => {
                const originRange = { startRow: 8, endRow: 18, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 14,
                    endRow: 20,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
            it('2-11 unchanged', () => {
                const originRange = { startRow: 3, endRow: 25, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 25,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-12 move right', () => {
                const originRange = { startRow: 6, endRow: 7, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 12,
                    endRow: 13,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-14 expend', () => {
                const originRange = { startRow: 3, endRow: 18, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 3,
                    endRow: 20,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });

            it('2-13 move left', () => {
                const originRange = { startRow: 16, endRow: 17, startColumn: startCol, endColumn: endCol };

                expect(adjustRangeOnMutation(originRange, getMoveRowsMutation())).toEqual({
                    startRow: 6,
                    endRow: 7,
                    startColumn: startCol,
                    endColumn: endCol,
                });
            });
        });
    });

    describe('handleIRemoveCol', () => {
        let range: IRange;
        let getRemoveColMutation: (range: IRange) => IMutationInfo<IRemoveColMutationParams>;

        beforeEach(() => {
            getRemoveColMutation = (range) => {
                return { params: { range, unitId: '', subUnitId: '' }, id: RemoveColMutation.id };
            };
        });

        describe('the range contain targetRange', () => {
            beforeEach(() => {
                range = { startRow: 0, endColumn: 10, startColumn: 5, endRow: 99 };
            });

            it('the targetRange is single col', () => {
                const targetRange = { startRow: 0, endColumn: 5, startColumn: 5, endRow: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveColMutation(range));
                expect(result).toBe(null);
            });

            it('the targetRange is multiple col ', () => {
                const targetRange = { startRow: 0, endColumn: 5, startColumn: 6, endRow: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveColMutation(range));
                expect(result).toBe(null);
            });

            it('the targetRange is equal range', () => {
                const targetRange = { startRow: 0, endColumn: 5, startColumn: 10, endRow: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveColMutation(range));
                expect(result).toBe(null);
            });
        });

        describe('the targetRange in the range right', () => {
            beforeEach(() => {
                range = { startRow: 0, endColumn: 10, startColumn: 5, endRow: 99 };
            });

            it('targetRange is overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 11, startColumn: 10, endRow: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveColMutation(range));
                expect(result).toEqual({ startRow: 0, endColumn: 5, startColumn: 5, endRow: 99 });
            });

            it('targetRange is no overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 12, startColumn: 11, endRow: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveColMutation(range));
                expect(result).toEqual({ startRow: 0, endColumn: 6, startColumn: 5, endRow: 99 });
            });
        });

        describe('the targetRange in the range left', () => {
            beforeEach(() => {
                range = { startRow: 0, endColumn: 10, startColumn: 5, endRow: 99 };
            });

            it('targetRange is overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 5, startColumn: 4, endRow: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveColMutation(range));
                expect(result).toEqual({ startRow: 0, endColumn: 4, startColumn: 4, endRow: 99 });
            });

            it('targetRange is no overlap with range ', () => {
                const targetRange = { startRow: 0, endColumn: 3, startColumn: 2, endRow: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveColMutation(range));
                expect(result).toEqual({ startRow: 0, endColumn: 3, startColumn: 2, endRow: 99 });
            });
        });
    });

    describe('handleIRemoveRow', () => {
        let range: IRange;
        let getRemoveRowMutation: (range: IRange) => IMutationInfo<IRemoveRowsMutationParams>;

        beforeEach(() => {
            getRemoveRowMutation = (range) => {
                return { params: { range, unitId: '', subUnitId: '' }, id: RemoveRowMutation.id };
            };
        });

        describe('the range contain targetRange', () => {
            beforeEach(() => {
                range = { startRow: 5, endRow: 10, startColumn: 0, endColumn: 99 };
            });

            it('the targetRange is single row', () => {
                const targetRange = { startRow: 5, endRow: 5, startColumn: 0, endColumn: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveRowMutation(range));
                expect(result).toBe(null);
            });

            it('the targetRange is multiple row ', () => {
                const targetRange = { startRow: 0, endRow: 5, startColumn: 0, endColumn: 99 };
                const result = adjustRangeOnMutation(targetRange, getRemoveRowMutation(range));
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
});
