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

import type { IAccessor } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, ISetNumfmtMutationParams } from '../numfmt-mutation';
import { cellToRange } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { INumfmtService } from '../../../services/numfmt/type';
import {
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,

    RemoveNumfmtMutation,
    SetNumfmtMutation,
    transformCellsToRange,
} from '../numfmt-mutation';

function createAccessor(numfmtService: {
    getValue: ReturnType<typeof vi.fn>;
    setValues: ReturnType<typeof vi.fn>;
    deleteValues: ReturnType<typeof vi.fn>;
}): IAccessor {
    return {
        get: (token: unknown) => {
            if (token === INumfmtService) {
                return numfmtService as never;
            }

            return null as never;
        },
        has: () => true,
    } as unknown as IAccessor;
}

describe('numfmt-mutation', () => {
    it('transformCellsToRange groups cells by pattern', () => {
        const result = transformCellsToRange('unit-1', 'sheet-1', [
            { pattern: '0%', row: 1, col: 1 },
            { pattern: '0%', row: 1, col: 2 },
            { pattern: '#,##0', row: 3, col: 0 },
        ]);

        expect(result.unitId).toBe('unit-1');
        expect(result.subUnitId).toBe('sheet-1');

        const rangesByPattern = Object.entries(result.refMap).reduce<Record<string, ReturnType<typeof cellToRange>[]>>(
            (acc, [key, ref]) => {
                acc[ref.pattern] = result.values[key].ranges;
                return acc;
            },
            {}
        );

        expect(rangesByPattern['0%']).toEqual([cellToRange(1, 1), cellToRange(1, 2)]);
        expect(rangesByPattern['#,##0']).toEqual([cellToRange(3, 0)]);
    });

    it('SetNumfmtMutation handler checks params and calls service', () => {
        const numfmtService = {
            getValue: vi.fn(),
            setValues: vi.fn(),
            deleteValues: vi.fn(),
        };
        const accessor = createAccessor(numfmtService);

        expect(SetNumfmtMutation.handler(accessor, undefined as never)).toBe(false);

        const result = SetNumfmtMutation.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            refMap: {
                a: { pattern: '0%' },
            },
            values: {
                a: { ranges: [cellToRange(0, 0)] },
                b: { ranges: [cellToRange(1, 1)] }, // ignored because refMap has no b
            },
        });

        expect(result).toBe(true);
        expect(numfmtService.setValues).toHaveBeenCalledWith('unit-1', 'sheet-1', [
            { pattern: '0%', ranges: [cellToRange(0, 0)] },
        ]);
    });

    it('RemoveNumfmtMutation handler checks params and calls service', () => {
        const numfmtService = {
            getValue: vi.fn(),
            setValues: vi.fn(),
            deleteValues: vi.fn(),
        };
        const accessor = createAccessor(numfmtService);

        expect(RemoveNumfmtMutation.handler(accessor, undefined as never)).toBe(false);

        const result = RemoveNumfmtMutation.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [cellToRange(2, 3)],
        });

        expect(result).toBe(true);
        expect(numfmtService.deleteValues).toHaveBeenCalledWith('unit-1', 'sheet-1', [cellToRange(2, 3)]);
    });

    it('factoryRemoveNumfmtUndoMutation rebuilds previous numfmt values', () => {
        const numfmtService = {
            getValue: vi.fn((unitId: string, subUnitId: string, row: number, col: number) => {
                if (row === 1 && col === 1) {
                    return { pattern: '0%' };
                }
                return null;
            }),
            setValues: vi.fn(),
            deleteValues: vi.fn(),
        };
        const accessor = createAccessor(numfmtService);

        const result = factoryRemoveNumfmtUndoMutation(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 }],
        });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(SetNumfmtMutation.id);

        const params = result[0].params;
        const keys = Object.keys(params.refMap);
        expect(keys).toHaveLength(1);
        expect(params.refMap[keys[0]].pattern).toBe('0%');
        expect(params.values[keys[0]].ranges).toEqual([cellToRange(1, 1)]);
    });

    it('factoryRemoveNumfmtUndoMutation returns empty list when no old value', () => {
        const numfmtService = {
            getValue: vi.fn(() => null),
            setValues: vi.fn(),
            deleteValues: vi.fn(),
        };
        const accessor = createAccessor(numfmtService);

        expect(
            factoryRemoveNumfmtUndoMutation(accessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                ranges: [cellToRange(0, 0)],
            })
        ).toEqual([]);
    });

    it('factorySetNumfmtUndoMutation builds both set and remove undo mutations', () => {
        const numfmtService = {
            getValue: vi.fn((unitId: string, subUnitId: string, row: number, col: number) => {
                if (row === 1 && col === 1) {
                    return { pattern: 'old-1' };
                }
                if (row === 2 && col === 2) {
                    return { pattern: 'old-2' };
                }
                return null;
            }),
            setValues: vi.fn(),
            deleteValues: vi.fn(),
        };
        const accessor = createAccessor(numfmtService);

        const result = factorySetNumfmtUndoMutation(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            refMap: {
                a: { pattern: 'new-1' },
                b: { pattern: 'new-2' },
            },
            values: {
                a: { ranges: [cellToRange(1, 1), cellToRange(1, 2)] },
                b: { ranges: [cellToRange(2, 2)] },
            },
        });

        expect(result.map((item) => item.id)).toEqual([SetNumfmtMutation.id, RemoveNumfmtMutation.id]);

        const setParams = result[0].params as ISetNumfmtMutationParams;
        const setPatterns = Object.keys(setParams.refMap).map((key) => setParams.refMap[key].pattern).sort();
        expect(setPatterns).toEqual(['old-1', 'old-2']);

        const removeParams = result[1].params as IRemoveNumfmtMutationParams;
        expect(removeParams.ranges).toEqual([cellToRange(1, 2)]);
    });
});
