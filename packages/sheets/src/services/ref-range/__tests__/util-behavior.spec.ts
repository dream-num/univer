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

import type { IAccessor, ICommandInfo, IRange } from '@univerjs/core';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../../basics';
import type { IMoveRangeMutationParams } from '../../../commands/mutations/move-range.mutation';
import type { IMoveColumnsMutationParams } from '../../../commands/mutations/move-rows-cols.mutation';
import { Direction, IUniverInstanceService, MAX_COLUMN_COUNT, MAX_ROW_COUNT, RANGE_TYPE } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { InsertColMutation, InsertRowMutation } from '../../../commands/mutations/insert-row-col.mutation';
import { MoveRangeMutation } from '../../../commands/mutations/move-range.mutation';
import { MoveColsMutation } from '../../../commands/mutations/move-rows-cols.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../../commands/mutations/remove-row-col.mutation';
import { EffectRefRangId } from '../type';
import {
    adjustRangeOnMutation,
    getEffectedRangesOnCommand,
    getEffectedRangesOnMutation,
    getSeparateEffectedRangesOnCommand,
    handleCommonDefaultRangeChangeWithEffectRefCommands,
    handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests,
    handleDefaultRangeChangeWithEffectRefCommands,
    handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests,
    handleDeleteRangeMoveLeftCommon,
    handleDeleteRangeMoveUpCommon,
    handleInsertColCommon,
    handleInsertRangeMoveDownCommon,
    handleInsertRangeMoveRightCommon,
    handleInsertRowCommon,
    handleIRemoveRow,
    handleMoveCols,
    handleMoveColsCommon,
    handleMoveRangeCommon,
    handleMoveRowsCommon,
    handleRangeTypeInput,
    handleRangeTypeOutput,
    handleReorderRange,
    handleReorderRangeCommon,
    rotateRange,
    runRefRangeMutations,
} from '../util';

const r = (startRow: number, endRow: number, startColumn: number, endColumn: number, rangeType?: RANGE_TYPE): IRange => ({
    startRow,
    endRow,
    startColumn,
    endColumn,
    ...(rangeType === undefined ? {} : { rangeType }),
});

const formatRanges = (ranges: IRange[]) =>
    ranges
        .map((range) => [range.startRow, range.endRow, range.startColumn, range.endColumn] as const)
        .sort((prev, aft) => prev[0] - aft[0] || prev[2] - aft[2] || prev[1] - aft[1] || prev[3] - aft[3]);

const selectionDeps = (range?: IRange) => ({
    selectionManagerService: {
        getCurrentSelections: () => range ? [{ range }] : [],
    },
} as any);

describe('ref range util behavior coverage', () => {
    describe('range type normalization', () => {
        it('expands typed and inferred column/row/all ranges for internal calculation', () => {
            expect(handleRangeTypeInput(r(Number.NaN, Number.NaN, 2, 4))).toEqual(r(0, MAX_ROW_COUNT - 1, 2, 4));
            expect(handleRangeTypeInput(r(2, 4, Number.NaN, Number.NaN))).toEqual(r(2, 4, 0, MAX_COLUMN_COUNT - 1));
            expect(handleRangeTypeInput(r(0, 0, 3, 5, RANGE_TYPE.COLUMN))).toEqual(r(0, MAX_ROW_COUNT - 1, 3, 5, RANGE_TYPE.COLUMN));
            expect(handleRangeTypeInput(r(3, 5, 0, 0, RANGE_TYPE.ROW))).toEqual(r(3, 5, 0, MAX_COLUMN_COUNT - 1, RANGE_TYPE.ROW));
            expect(handleRangeTypeInput(r(4, 6, 7, 9, RANGE_TYPE.ALL))).toEqual(r(0, MAX_ROW_COUNT - 1, 0, MAX_COLUMN_COUNT - 1, RANGE_TYPE.ALL));
        });

        it('clips concrete ranges and restores typed ranges to the current sheet size', () => {
            expect(handleRangeTypeOutput(r(-2, 12, -3, 15), 10, 8)).toEqual(r(0, 10, 0, 8));
            expect(handleRangeTypeOutput(r(2, 4, 3, 5, RANGE_TYPE.COLUMN), 99, 20)).toEqual(r(0, 99, 3, 5, RANGE_TYPE.COLUMN));
            expect(handleRangeTypeOutput(r(2, 4, 3, 5, RANGE_TYPE.ROW), 99, 20)).toEqual(r(2, 4, 0, 20, RANGE_TYPE.ROW));
            expect(handleRangeTypeOutput(r(2, 4, 3, 5, RANGE_TYPE.ALL), 99, 20)).toEqual(r(0, 99, 0, 20, RANGE_TYPE.ALL));
        });

        it('rotates row and column range types with their coordinates', () => {
            expect(rotateRange(r(2, 4, 5, 8, RANGE_TYPE.COLUMN))).toEqual(r(5, 8, 2, 4, RANGE_TYPE.ROW));
            expect(rotateRange(r(2, 4, 5, 8, RANGE_TYPE.ROW))).toEqual(r(5, 8, 2, 4, RANGE_TYPE.COLUMN));
        });
    });

    describe('column movement and reordered rows', () => {
        it('moves a watched column range when columns are moved across it', () => {
            const targetRange = r(0, 5, 6, 7);
            const operators = handleMoveCols({
                id: EffectRefRangId.MoveColsCommandId,
                params: {
                    fromRange: r(0, 20, 2, 3),
                    toRange: r(0, 20, 8, 9),
                },
            }, targetRange);

            expect(runRefRangeMutations(operators, targetRange)).toEqual(r(0, 5, 4, 5));
        });

        it('uses the matrix path to split a watched range after column moves', () => {
            const result = handleMoveColsCommon({
                id: EffectRefRangId.MoveColsCommandId,
                params: {
                    fromRange: r(0, 3, 1, 2),
                    toRange: r(0, 3, 5, 6),
                },
            }, r(0, 1, 0, 5));

            expect(formatRanges(result)).toEqual(formatRanges([
                r(0, 1, 0, 5),
            ]));
        });

        it('keeps a row watch attached to the row that was reordered into it', () => {
            const targetRange = r(2, 2, 0, 3);
            const operators = handleReorderRange({
                id: EffectRefRangId.ReorderRangeCommandId,
                params: {
                    unitId: 'unit',
                    subUnitId: 'sheet',
                    range: r(0, 3, 0, 3),
                    order: { 0: 2, 2: 0 },
                },
            }, targetRange);

            expect(runRefRangeMutations(operators, targetRange)).toEqual(r(0, 0, 0, 3));
        });

        it('rewrites reordered range cells with the common matrix path', () => {
            const result = handleReorderRangeCommon({
                id: EffectRefRangId.ReorderRangeCommandId,
                params: {
                    unitId: 'unit',
                    subUnitId: 'sheet',
                    range: r(0, 2, 0, 2),
                    order: { 0: 2, 2: 0 },
                },
            }, r(0, 0, 0, 2));

            expect(formatRanges(result)).toEqual([[2, 2, 0, 2]]);
        });
    });

    describe('insert/delete common range transformations', () => {
        it('moves only the inserted-over rows or columns and keeps the rest of the watched range', () => {
            expect(formatRanges(handleInsertRangeMoveDownCommon({
                id: EffectRefRangId.InsertRangeMoveDownCommandId,
                params: { range: r(3, 4, 1, 2) },
            }, r(2, 5, 0, 3)))).toEqual(formatRanges([
                r(2, 2, 0, 3),
                r(3, 5, 0, 0),
                r(3, 5, 3, 3),
                r(5, 7, 1, 2),
            ]));

            expect(formatRanges(handleInsertRangeMoveRightCommon({
                id: EffectRefRangId.InsertRangeMoveRightCommandId,
                params: { range: r(1, 2, 2, 3) },
            }, r(0, 3, 1, 4)))).toEqual(formatRanges([
                r(0, 0, 1, 4),
                r(1, 2, 1, 1),
                r(1, 2, 4, 6),
                r(3, 3, 1, 4),
            ]));
        });

        it('removes deleted cells and moves the trailing cells into the gap', () => {
            expect(formatRanges(handleDeleteRangeMoveLeftCommon({
                id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                params: { range: r(1, 2, 2, 3) },
            }, r(0, 3, 1, 5)))).toEqual(formatRanges([
                r(0, 3, 1, 3),
                r(0, 0, 4, 5),
                r(3, 3, 4, 5),
            ]));

            expect(formatRanges(handleDeleteRangeMoveUpCommon({
                id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                params: { range: r(2, 3, 1, 2) },
            }, r(1, 5, 0, 3)))).toEqual(formatRanges([
                r(1, 3, 0, 3),
                r(4, 5, 0, 0),
                r(4, 5, 3, 3),
            ]));
        });

        it('handles row/column insertion direction at the right and bottom boundaries', () => {
            expect(handleInsertRowCommon({
                id: EffectRefRangId.InsertRowCommandId,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(9, 10, 0, 10), direction: Direction.DOWN },
            }, r(5, 7, 2, 4))).toEqual([r(5, 7, 2, 4)]);

            expect(handleInsertRowCommon({
                id: EffectRefRangId.InsertRowCommandId,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(8, 9, 0, 10), direction: Direction.DOWN },
            }, r(5, 8, 2, 4))).toEqual([r(5, 10, 2, 4)]);

            expect(handleInsertColCommon({
                id: EffectRefRangId.InsertColCommandId,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 10, 9, 10), direction: Direction.RIGHT },
            }, r(2, 4, 5, 7))).toEqual([r(2, 4, 5, 7)]);

            expect(handleInsertColCommon({
                id: EffectRefRangId.InsertColCommandId,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 10, 8, 9), direction: Direction.RIGHT },
            }, r(2, 4, 5, 8))).toEqual([r(2, 4, 5, 10)]);
        });

        it('skips filtered rows when removing a row range', () => {
            const targetRange = r(3, 8, 0, 3);
            const operators = handleIRemoveRow({
                id: EffectRefRangId.RemoveRowCommandId,
                params: { range: r(3, 8, 0, 3) },
            }, targetRange, [4, 6]);

            expect(runRefRangeMutations(operators, targetRange)).toEqual(r(3, 4, 0, 3));
        });
    });

    describe('default command dispatchers', () => {
        it('adjusts ranges through the command dispatcher for each command family', () => {
            const cases: Array<[ICommandInfo, IRange, IRange | null]> = [
                [{
                    id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                    params: { range: r(2, 4, 3, 4) },
                }, r(2, 4, 6, 7), r(2, 4, 4, 5)],
                [{
                    id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                    params: { range: r(3, 4, 2, 4) },
                }, r(6, 7, 2, 4), r(4, 5, 2, 4)],
                [{
                    id: EffectRefRangId.InsertColCommandId,
                    params: { range: r(0, 10, 3, 4) },
                }, r(2, 4, 6, 7), r(2, 4, 8, 9)],
                [{
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range: r(3, 4, 0, 10) },
                }, r(6, 7, 2, 4), r(8, 9, 2, 4)],
                [{
                    id: EffectRefRangId.InsertRangeMoveDownCommandId,
                    params: { range: r(3, 4, 2, 4) },
                }, r(6, 7, 2, 4), r(8, 9, 2, 4)],
                [{
                    id: EffectRefRangId.InsertRangeMoveRightCommandId,
                    params: { range: r(2, 4, 3, 4) },
                }, r(2, 4, 6, 7), r(2, 4, 8, 9)],
                [{
                    id: EffectRefRangId.MoveColsCommandId,
                    params: { fromRange: r(0, 10, 2, 3), toRange: r(0, 10, 7, 8) },
                }, r(2, 4, 5, 6), r(2, 4, 3, 4)],
                [{
                    id: EffectRefRangId.MoveRowsCommandId,
                    params: { fromRange: r(2, 3, 0, 10), toRange: r(7, 8, 0, 10) },
                }, r(5, 6, 2, 4), r(3, 4, 2, 4)],
                [{
                    id: EffectRefRangId.MoveRangeCommandId,
                    params: { fromRange: r(2, 4, 2, 4), toRange: r(8, 10, 7, 9) },
                }, r(3, 3, 3, 3), r(9, 9, 8, 8)],
                [{
                    id: EffectRefRangId.RemoveColCommandId,
                    params: { range: r(0, 10, 3, 4) },
                }, r(2, 4, 6, 7), r(2, 4, 4, 5)],
                [{
                    id: EffectRefRangId.RemoveRowCommandId,
                    params: { range: r(3, 4, 0, 10) },
                }, r(6, 7, 2, 4), r(4, 5, 2, 4)],
                [{
                    id: EffectRefRangId.ReorderRangeCommandId,
                    params: { range: r(0, 2, 0, 4), order: { 0: 2, 2: 0 } },
                }, r(0, 0, 1, 2), r(2, 2, 1, 2)],
            ];

            cases.forEach(([command, targetRange, expected]) => {
                expect(handleDefaultRangeChangeWithEffectRefCommands(targetRange, command)).toEqual(expected);
            });
        });

        it('uses common range transformations for split range operations', () => {
            expect(formatRanges(handleCommonDefaultRangeChangeWithEffectRefCommands(r(0, 3, 1, 5), {
                id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                params: { range: r(1, 2, 2, 3) },
            }))).toEqual(formatRanges([
                r(0, 3, 1, 3),
                r(0, 0, 4, 5),
                r(3, 3, 4, 5),
            ]));

            expect(handleCommonDefaultRangeChangeWithEffectRefCommands(r(4, 5, 1, 2), {
                id: EffectRefRangId.InsertRowCommandId,
                params: { range: r(3, 3, 0, 10), direction: Direction.DOWN },
            })).toEqual([r(5, 6, 1, 2)]);
        });

        it('skips commands outside the watched range but still applies commands that always affect selection-local cells', () => {
            const targetRange = r(10, 12, 10, 12);
            expect(handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests(targetRange, {
                id: EffectRefRangId.InsertColCommandId,
                params: { range: r(0, 20, 2, 2) },
            }, selectionDeps())).toEqual(targetRange);

            expect(handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests(targetRange, {
                id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                params: { range: r(10, 12, 8, 9) },
            }, selectionDeps())).toEqual(r(10, 12, 8, 10));

            expect(handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests(targetRange, {
                id: EffectRefRangId.InsertRangeMoveRightCommandId,
                params: { range: r(10, 12, 8, 9) },
            }, selectionDeps())).toEqual([r(10, 12, 12, 14)]);
        });
    });

    describe('mutation dispatchers and affected ranges', () => {
        it('adjusts ranges for mutation families that mirror sheet edits', () => {
            expect(adjustRangeOnMutation(r(2, 4, 5, 6), {
                id: MoveColsMutation.id,
                params: {
                    unitId: 'unit',
                    subUnitId: 'sheet',
                    sourceRange: r(0, 10, 1, 2),
                    targetRange: r(0, 10, 8, 9),
                } satisfies IMoveColumnsMutationParams,
            })).toEqual(r(2, 4, 3, 4));

            expect(adjustRangeOnMutation(r(2, 4, 5, 6), {
                id: RemoveColMutation.id,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 10, 3, 4) } satisfies IRemoveColMutationParams,
            })).toEqual(r(2, 4, 3, 4));

            expect(adjustRangeOnMutation(r(5, 7, 2, 4), {
                id: RemoveRowMutation.id,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(3, 4, 0, 10) } satisfies IRemoveRowsMutationParams,
            })).toEqual(r(3, 5, 2, 4));

            expect(adjustRangeOnMutation(r(5, 7, 2, 4), {
                id: InsertRowMutation.id,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(3, 4, 0, 10) } satisfies IInsertRowMutationParams,
            })).toEqual(r(7, 9, 2, 4));

            expect(adjustRangeOnMutation(r(2, 4, 5, 6), {
                id: InsertColMutation.id,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 10, 3, 4) } satisfies IInsertColMutationParams,
            })).toEqual(r(2, 4, 7, 8));

            expect(adjustRangeOnMutation(r(2, 2, 2, 2), {
                id: MoveRangeMutation.id,
                params: {
                    unitId: 'unit',
                    fromRange: r(1, 3, 1, 3),
                    toRange: r(6, 8, 5, 7),
                    from: { subUnitId: 'sheet', value: {} },
                    to: { subUnitId: 'sheet', value: {} },
                } satisfies IMoveRangeMutationParams,
            })).toEqual(r(7, 7, 6, 6));
        });

        it('reports affected command ranges including selection fallbacks and reordered rows', () => {
            const selectedRange = r(6, 7, 3, 4);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.MoveColsCommandId,
                params: { fromRange: r(0, 10, 2, 3), toRange: r(0, 10, 8, 9) },
            }, selectionDeps())).toEqual([
                r(0, 10, 2, 3),
                r(0, 10, 7.5, 8.5),
            ]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.MoveRowsCommandId,
                params: { fromRange: r(2, 3, 0, 10), toRange: r(8, 9, 0, 10) },
            }, selectionDeps())).toEqual([
                r(2, 3, 0, 10),
                r(7.5, 7.5, 0, 10),
            ]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.MoveRangeCommandId,
                params: { fromRange: r(1, 2, 1, 2), toRange: r(5, 6, 5, 6) },
            }, selectionDeps())).toEqual([r(1, 2, 1, 2), r(5, 6, 5, 6)]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.InsertRowCommandId,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(5, 6, 0, 10), direction: Direction.DOWN },
            }, selectionDeps())).toEqual([r(4.5, 5.5, 0, 10)]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.InsertColCommandId,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 10, 5, 6), direction: Direction.RIGHT },
            }, selectionDeps())).toEqual([r(0, 10, 4.5, 5.5)]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.RemoveRowCommandId,
                params: { range: r(5, 6, 0, 10) },
            }, selectionDeps())).toEqual([r(5, 6, 0, 10)]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.RemoveColCommandId,
                params: { range: r(0, 10, 5, 6) },
            }, selectionDeps())).toEqual([r(0, 10, 5, 6)]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                params: undefined,
            }, selectionDeps(selectedRange))).toEqual([selectedRange]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                params: undefined,
            }, selectionDeps(selectedRange))).toEqual([selectedRange]);

            expect(getEffectedRangesOnCommand({
                id: EffectRefRangId.ReorderRangeCommandId,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 3, 2, 4), order: { 1: 3, 3: 1 } },
            }, selectionDeps())).toEqual([
                r(1, 1, 2, 4),
                r(3, 3, 2, 4),
            ]);
        });

        it('reports affected mutation ranges for move, insert, remove, and cell move mutations', () => {
            expect(getEffectedRangesOnMutation({
                id: MoveColsMutation.id,
                params: {
                    unitId: 'unit',
                    subUnitId: 'sheet',
                    sourceRange: r(0, 10, 2, 3),
                    targetRange: r(0, 10, 8, 9),
                } satisfies IMoveColumnsMutationParams,
            })).toEqual([
                r(0, 10, 2, 3),
                r(0, 10, 7.5, 7.5),
            ]);

            expect(getEffectedRangesOnMutation({
                id: InsertColMutation.id,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 10, 5, 6) } satisfies IInsertColMutationParams,
            })).toEqual([r(0, 10, 4.5, 4.5)]);

            expect(getEffectedRangesOnMutation({
                id: InsertRowMutation.id,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(5, 6, 0, 10) } satisfies IInsertRowMutationParams,
            })).toEqual([r(4.5, 4.5, 0, 10)]);

            expect(getEffectedRangesOnMutation({
                id: RemoveColMutation.id,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 10, 5, 6) } satisfies IRemoveColMutationParams,
            })).toEqual([r(0, 10, 5, 6)]);

            expect(getEffectedRangesOnMutation({
                id: RemoveRowMutation.id,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(5, 6, 0, 10) } satisfies IRemoveRowsMutationParams,
            })).toEqual([r(5, 6, 0, 10)]);

            expect(getEffectedRangesOnMutation({
                id: MoveRangeMutation.id,
                params: {
                    unitId: 'unit',
                    fromRange: r(0, 0, 0, 0),
                    toRange: r(0, 0, 0, 0),
                    from: { subUnitId: 'sheet', value: { 1: { 2: { v: 'from' } } } },
                    to: { subUnitId: 'sheet', value: { 5: { 6: { v: 'to' } } } },
                } satisfies IMoveRangeMutationParams,
            })).toEqual([r(0, 1, 0, 2), r(0, 5, 0, 6)]);
        });
    });

    describe('separate affected ranges with real target resolution shape', () => {
        const createAccessor = () => {
            const worksheet = {
                getRowCount: () => 20,
                getColumnCount: () => 12,
                getSheetId: () => 'sheet',
            };
            const workbook = {
                getUnitId: () => 'unit',
                getActiveSheet: () => worksheet,
                getSheetBySheetId: () => worksheet,
            };
            const univerInstanceService = {
                getUnit: () => workbook,
                getCurrentUnitOfType: () => workbook,
            };

            return {
                get: (identifier: unknown) => identifier === IUniverInstanceService ? univerInstanceService : undefined,
            } as unknown as IAccessor;
        };

        it('resolves command affected ranges against the workbook and worksheet target', () => {
            const accessor = createAccessor();
            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.MoveColsCommandId,
                params: {
                    unitId: 'unit',
                    subUnitId: 'sheet',
                    fromRange: r(0, 10, 2, 3),
                    toRange: r(0, 10, 8, 9),
                },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(0, 10, 2, 3), r(0, 10, 4, 8)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.MoveRowsCommandId,
                params: {
                    unitId: 'unit',
                    subUnitId: 'sheet',
                    fromRange: r(8, 9, 0, 10),
                    toRange: r(2, 3, 0, 10),
                },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(8, 9, 0, 10), r(2, 7, 0, 10)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.MoveRangeCommandId,
                params: {
                    fromRange: r(1, 2, 1, 2),
                    toRange: r(5, 6, 5, 6),
                },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(1, 2, 1, 2), r(5, 6, 5, 6)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.InsertRowCommandId,
                params: {
                    unitId: 'unit',
                    subUnitId: 'sheet',
                    range: r(5, 6, 0, 10),
                    direction: Direction.DOWN,
                },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(4, 5, 0, 10), r(5, 19, 0, 10)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.InsertColCommandId,
                params: {
                    unitId: 'unit',
                    subUnitId: 'sheet',
                    range: r(0, 10, 5, 6),
                    direction: Direction.RIGHT,
                },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(0, 10, 4, 5), r(0, 10, 5, 11)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.RemoveRowCommandId,
                params: { range: r(5, 6, 0, 10) },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(5, 6, 0, 10), r(7, 19, 0, 10)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.RemoveColCommandId,
                params: { range: r(0, 10, 5, 6) },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(0, 10, 5, 6), r(0, 10, 7, 11)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.InsertRangeMoveDownCommandId,
                params: { range: r(5, 6, 2, 4) },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(5, 6, 2, 4), r(7, 19, 2, 4)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.InsertRangeMoveRightCommandId,
                params: { range: r(5, 6, 2, 4) },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(5, 6, 2, 4), r(5, 6, 5, 11)],
            });

            expect(getSeparateEffectedRangesOnCommand(accessor, {
                id: EffectRefRangId.ReorderRangeCommandId,
                params: { unitId: 'unit', subUnitId: 'sheet', range: r(0, 3, 2, 4), order: { 1: 3, 3: 1 } },
            })).toEqual({
                unitId: 'unit',
                subUnitId: 'sheet',
                ranges: [r(1, 1, 2, 4), r(3, 3, 2, 4)],
            });
        });
    });

    describe('common matrix operations keep shape across move ranges', () => {
        it('keeps an unaffected watched range as-is when moved blocks do not touch it', () => {
            const targetRange = r(10, 12, 10, 12);
            expect(handleMoveRowsCommon({
                id: EffectRefRangId.MoveRowsCommandId,
                params: {
                    fromRange: r(1, 2, 0, 20),
                    toRange: r(5, 6, 0, 20),
                },
            }, targetRange)).toEqual([targetRange]);

            expect(handleMoveRangeCommon({
                id: EffectRefRangId.MoveRangeCommandId,
                params: {
                    fromRange: r(1, 2, 1, 2),
                    toRange: r(5, 6, 5, 6),
                },
            }, targetRange)).toEqual([targetRange]);
        });
    });
});
