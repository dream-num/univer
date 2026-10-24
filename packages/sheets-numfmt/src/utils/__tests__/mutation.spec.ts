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

import { cellToRange } from '@univerjs/core';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { mergeNumfmtMutations } from '../mutation';

describe('mergeNumfmtMutations', () => {
    it('mergeNumfmtMutations', () => {
        const result = mergeNumfmtMutations([
            {
                id: SetNumfmtMutation.id,
                params: {
                    values: {
                        a: { ranges: [cellToRange(2, 3), cellToRange(2, 4), cellToRange(4, 5)] },
                    },
                    refMap: { a: { pattern: '', type: '' } },
                },
            },
            {
                id: RemoveNumfmtMutation.id,
                params: {
                    ranges: [cellToRange(2, 3), cellToRange(2, 4), cellToRange(4, 5)],
                },
            },
            {
                id: SetNumfmtMutation.id,
                params: {
                    values: {
                        a: { ranges: [cellToRange(4, 6), cellToRange(4, 5)] },
                    },
                    refMap: { a: { pattern: '', type: '' } },
                },
            },
        ]);

        const removeMutation = result[0] as { params: { ranges: unknown } };
        const setMutation = result[1] as { params: { values: Record<string, { ranges: unknown }> } };

        expect(result[0].id).toBe(RemoveNumfmtMutation.id);
        expect(result[1].id).toBe(SetNumfmtMutation.id);
        expect(removeMutation.params.ranges).toEqual([
            {
                startRow: 2,
                endRow: 2,
                startColumn: 3,
                endColumn: 4,
            },
            {
                startRow: 4,
                endRow: 4,
                startColumn: 5,
                endColumn: 5,
            },
        ]);
        expect(setMutation.params.values['1'].ranges).toEqual([
            {
                startRow: 2,
                endRow: 2,
                startColumn: 3,
                endColumn: 4,
            },
            {
                startRow: 4,
                endRow: 4,
                startColumn: 5,
                endColumn: 6,
            },
        ]);
    });

    it('mergeNumfmtMutations multiple data formats of different types', () => {
        const result = mergeNumfmtMutations([
            {
                id: SetNumfmtMutation.id,
                params: {
                    values: {
                        a: { ranges: [cellToRange(2, 3), cellToRange(2, 4), cellToRange(4, 5)] },
                    },
                    refMap: { a: { pattern: 'a', type: '' } },
                },
            },
            {
                id: RemoveNumfmtMutation.id,
                params: {
                    ranges: [cellToRange(2, 3), cellToRange(2, 4), cellToRange(4, 5)],
                },
            },
            {
                id: SetNumfmtMutation.id,
                params: {
                    values: {
                        a: { ranges: [cellToRange(4, 6), cellToRange(4, 5)] },
                    },
                    refMap: { a: { pattern: 'b', type: '' } },
                },
            },
        ]);
        expect(result).toEqual([
            {
                id: 'sheet.mutation.remove.numfmt',
                params: {
                    ranges: [
                        {
                            startRow: 2,
                            endRow: 2,
                            startColumn: 3,
                            endColumn: 4,
                        },
                        {
                            startRow: 4,
                            endRow: 4,
                            startColumn: 5,
                            endColumn: 5,
                        },
                    ],
                    unitId: undefined,
                    subUnitId: undefined,
                },
            },
            {
                id: 'sheet.mutation.set.numfmt',
                params: {
                    values: {
                        1: {
                            ranges: [
                                {
                                    startRow: 2,
                                    endRow: 2,
                                    startColumn: 3,
                                    endColumn: 4,
                                },
                                {
                                    startRow: 4,
                                    endRow: 4,
                                    startColumn: 5,
                                    endColumn: 5,
                                },
                            ],
                        },
                        2: {
                            ranges: [
                                {
                                    startRow: 4,
                                    endRow: 4,
                                    startColumn: 5,
                                    endColumn: 6,
                                },
                            ],
                        },
                    },
                    refMap: {
                        1: {
                            pattern: 'a',
                            type: '',
                        },
                        2: {
                            pattern: 'b',
                            type: '',
                        },
                    },
                    unitId: undefined,
                    subUnitId: undefined,
                },
            },
        ]);
    });
});
