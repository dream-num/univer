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

import type { IAccessor, ICommandInfo, IMutationInfo, IRange } from '@univerjs/core';
import type { IInsertRowMutationParams, IRemoveRowsMutationParams } from '../../../basics';
import type { IMoveRangeMutationParams } from '../../../commands/mutations/move-range.mutation';
import type { IMoveRowsMutationParams } from '../../../commands/mutations/move-rows-cols.mutation';
import type { EffectRefRangeParams } from '../type';
import { Direction, IUniverInstanceService, MAX_COLUMN_COUNT, MAX_ROW_COUNT, RANGE_TYPE } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DeleteRangeMoveLeftCommand } from '../../../commands/commands/delete-range-move-left.command';
import { InsertColCommand } from '../../../commands/commands/insert-row-col.command';
import { MoveRangeCommand } from '../../../commands/commands/move-range.command';
import { MoveRowsCommand } from '../../../commands/commands/move-rows-cols.command';
import { InsertRowMutation } from '../../../commands/mutations/insert-row-col.mutation';
import { MoveRangeMutation } from '../../../commands/mutations/move-range.mutation';
import { MoveRowsMutation } from '../../../commands/mutations/move-rows-cols.mutation';
import { RemoveRowMutation } from '../../../commands/mutations/remove-row-col.mutation';
import { EffectRefRangId } from '../type';
import {
    getEffectedRangesOnCommand,
    getEffectedRangesOnMutation,
    getSeparateEffectedRangesOnCommand,
    handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests,
    handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests,
    handleRangeTypeInput,
    handleRangeTypeOutput,
    rotateRange,
} from '../util';

describe('ref-range util extra branches', () => {
    it('should normalize range type input and output', () => {
        const rowInput = handleRangeTypeInput({
            startRow: 2,
            endRow: 4,
            startColumn: Number.NaN,
            endColumn: Number.NaN,
        });
        expect(rowInput).toEqual({
            startRow: 2,
            endRow: 4,
            startColumn: 0,
            endColumn: MAX_COLUMN_COUNT - 1,
        });

        const allInput = handleRangeTypeInput({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
            rangeType: RANGE_TYPE.ALL,
        });
        expect(allInput).toEqual({
            startRow: 0,
            endRow: MAX_ROW_COUNT - 1,
            startColumn: 0,
            endColumn: MAX_COLUMN_COUNT - 1,
            rangeType: RANGE_TYPE.ALL,
        });

        const output = handleRangeTypeOutput(
            {
                startRow: -2,
                endRow: 100,
                startColumn: -3,
                endColumn: 200,
            },
            10,
            20
        );
        expect(output).toEqual({
            startRow: 0,
            endRow: 10,
            startColumn: 0,
            endColumn: 20,
        });
    });

    it('should rotate row/column range type', () => {
        expect(
            rotateRange({
                startRow: 2,
                endRow: 4,
                startColumn: 7,
                endColumn: 9,
                rangeType: RANGE_TYPE.COLUMN,
            })
        ).toEqual({
            startRow: 7,
            endRow: 9,
            startColumn: 2,
            endColumn: 4,
            rangeType: RANGE_TYPE.ROW,
        });
    });

    it('should skip non-interest command for default handler and keep original range', () => {
        const range: IRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 };
        const command: ICommandInfo = {
            id: MoveRowsCommand.id,
            params: {
                fromRange: { startRow: 5, endRow: 6, startColumn: 0, endColumn: 10 },
                toRange: { startRow: 10, endRow: 11, startColumn: 0, endColumn: 10 },
            },
        };

        const result = handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests(range, command, {
            selectionManagerService: {
                getCurrentSelections: () => [],
            } as any,
        });
        expect(result).toEqual(range);
    });

    it('should always process delete-range-move-left in default skip handler', () => {
        const range: IRange = { startRow: 0, endRow: 0, startColumn: 5, endColumn: 8 };
        const result = handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests(
            range,
            {
                id: DeleteRangeMoveLeftCommand.id,
                params: {
                    range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
                },
            },
            { selectionManagerService: {} as any }
        );
        expect(result).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 3,
            endColumn: 6,
        });
    });

    it('should skip non-interest command for common handler', () => {
        const range: IRange = { startRow: 3, endRow: 5, startColumn: 3, endColumn: 5 };
        const command: ICommandInfo = {
            id: MoveRangeCommand.id,
            params: {
                fromRange: { startRow: 10, endRow: 11, startColumn: 10, endColumn: 11 },
                toRange: { startRow: 20, endRow: 21, startColumn: 20, endColumn: 21 },
            },
        };

        const result = handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests(range, command, {
            selectionManagerService: {} as any,
        });

        expect(result).toEqual(range);
    });

    it('should collect effected ranges from command variants', () => {
        const fromMoveCols = getEffectedRangesOnCommand(
            {
                id: EffectRefRangId.MoveColsCommandId,
                params: {
                    fromRange: { startRow: 0, endRow: 10, startColumn: 1, endColumn: 2 },
                    toRange: { startRow: 0, endRow: 10, startColumn: 8, endColumn: 9 },
                },
            } as unknown as EffectRefRangeParams,
            { selectionManagerService: {} as any }
        );
        expect(fromMoveCols).toEqual([
            { startRow: 0, endRow: 10, startColumn: 1, endColumn: 2 },
            { startRow: 0, endRow: 10, startColumn: 7.5, endColumn: 8.5 },
        ]);

        const fromSelection = getEffectedRangesOnCommand(
            {
                id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                params: {},
            } as unknown as EffectRefRangeParams,
            {
                selectionManagerService: {
                    getCurrentSelections: () => [{ range: { startRow: 4, endRow: 6, startColumn: 2, endColumn: 3 } }],
                } as any,
            }
        );
        expect(fromSelection).toEqual([{ startRow: 4, endRow: 6, startColumn: 2, endColumn: 3 }]);

        const fromReorder = getEffectedRangesOnCommand(
            {
                id: EffectRefRangId.ReorderRangeCommandId,
                params: {
                    range: { startRow: 3, endRow: 7, startColumn: 0, endColumn: 1 },
                    order: { 3: 7, 6: 4 },
                },
            } as unknown as EffectRefRangeParams,
            { selectionManagerService: {} as any }
        );
        expect(fromReorder).toEqual([
            { startRow: 3, endRow: 3, startColumn: 0, endColumn: 1 },
            { startRow: 6, endRow: 6, startColumn: 0, endColumn: 1 },
        ]);
    });

    it('should collect effected ranges from mutation variants', () => {
        const moveRowsMutation: IMutationInfo<IMoveRowsMutationParams> = {
            id: MoveRowsMutation.id,
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                sourceRange: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 5 },
                targetRange: { startRow: 9, endRow: 10, startColumn: 0, endColumn: 5 },
            },
        };
        expect(getEffectedRangesOnMutation(moveRowsMutation)).toEqual([
            { startRow: 1, endRow: 2, startColumn: 0, endColumn: 5 },
            { startRow: 8.5, endRow: 8.5, startColumn: 0, endColumn: 5 },
        ]);

        const moveRangeMutation: IMutationInfo<IMoveRangeMutationParams> = {
            id: MoveRangeMutation.id,
            params: {
                from: { value: { 0: { 0: 1, 1: 1 } } },
                to: { value: { 3: { 2: 1, 3: 1 } } },
            } as any,
        };
        const moveRangeEffected = getEffectedRangesOnMutation(moveRangeMutation);
        expect(moveRangeEffected).toHaveLength(2);
        expect(moveRangeEffected?.[0]).toEqual({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 });
        expect(moveRangeEffected?.[1].endRow).toBe(3);
        expect(moveRangeEffected?.[1].endColumn).toBe(3);

        const insertRowMutation: IMutationInfo<IInsertRowMutationParams> = {
            id: InsertRowMutation.id,
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                range: { startRow: 4, endRow: 6, startColumn: 0, endColumn: 10 },
            },
        };
        expect(getEffectedRangesOnMutation(insertRowMutation)).toEqual([
            { startRow: 3.5, endRow: 3.5, startColumn: 0, endColumn: 10 },
        ]);

        const removeRowMutation: IMutationInfo<IRemoveRowsMutationParams> = {
            id: RemoveRowMutation.id,
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                range: { startRow: 8, endRow: 9, startColumn: 0, endColumn: 10 },
            },
        };
        expect(getEffectedRangesOnMutation(removeRowMutation)).toEqual([
            { startRow: 8, endRow: 9, startColumn: 0, endColumn: 10 },
        ]);
    });

    it('should return separated effected ranges by command target', () => {
        const worksheet = {
            getSheetId: () => 's1',
            getRowCount: () => 100,
            getColumnCount: () => 50,
        };

        const workbook = {
            getUnitId: () => 'u1',
            getActiveSheet: () => worksheet,
            getSheetBySheetId: (subUnitId: string) => (subUnitId === 's1' ? worksheet : null),
        };

        const univerInstanceService = {
            getCurrentUnitOfType: () => workbook,
            getUnit: (unitId: string) => (unitId === 'u1' ? workbook : null),
        };

        const accessor: IAccessor = {
            get: (token: any) => {
                if (token === IUniverInstanceService) {
                    return univerInstanceService;
                }
                return null;
            },
        } as IAccessor;

        const moveCols = getSeparateEffectedRangesOnCommand(accessor, {
            id: EffectRefRangId.MoveColsCommandId,
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                fromRange: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 3 },
                toRange: { startRow: 0, endRow: 9, startColumn: 10, endColumn: 11 },
            },
        } as unknown as EffectRefRangeParams);
        expect(moveCols).toEqual({
            unitId: 'u1',
            subUnitId: 's1',
            ranges: [
                { startRow: 0, endRow: 9, startColumn: 2, endColumn: 3 },
                { startRow: 0, endRow: 9, startColumn: 4, endColumn: 10 },
            ],
        });

        const insertCol = getSeparateEffectedRangesOnCommand(accessor, {
            id: EffectRefRangId.InsertColCommandId,
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                range: { startRow: 0, endRow: 99, startColumn: 5, endColumn: 6 },
                direction: Direction.RIGHT,
            },
        } as unknown as EffectRefRangeParams);
        expect(insertCol).toEqual({
            unitId: 'u1',
            subUnitId: 's1',
            ranges: [
                { startRow: 0, endRow: 99, startColumn: 4, endColumn: 5 },
                { startRow: 0, endRow: 99, startColumn: 5, endColumn: 49 },
            ],
        });

        const removeCol = getSeparateEffectedRangesOnCommand(accessor, {
            id: EffectRefRangId.RemoveColCommandId,
            params: {
                range: { startRow: 0, endRow: 99, startColumn: 6, endColumn: 8 },
            },
        } as unknown as EffectRefRangeParams);
        expect(removeCol).toEqual({
            unitId: 'u1',
            subUnitId: 's1',
            ranges: [
                { startRow: 0, endRow: 99, startColumn: 6, endColumn: 8 },
                { startRow: 0, endRow: 99, startColumn: 9, endColumn: 49 },
            ],
        });
    });

    it('should return undefined from separate effected ranges when target workbook not found', () => {
        const accessor = {
            has: () => false,
            get: () => ({
                getCurrentUnitOfType: () => null,
                getUnit: () => null,
            }),
        } as unknown as IAccessor;

        const result = getSeparateEffectedRangesOnCommand(accessor, {
            id: EffectRefRangId.InsertColCommandId,
            params: {
                unitId: 'missing',
                subUnitId: 'missing',
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
                direction: Direction.LEFT,
            },
        } as unknown as EffectRefRangeParams);
        expect(result).toBeUndefined();
    });

    it('should include mutation command id constants in skip-logic usage smoke check', () => {
        expect(InsertColCommand.id).toBe(EffectRefRangId.InsertColCommandId);
    });
});
