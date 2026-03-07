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

import type { IRange, ISheetDataValidationRule, IUniverInstanceService, Workbook, Worksheet } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { RuleMatrix } from '../rule-matrix';

function createRule(uid: string, ranges: IRange[]): ISheetDataValidationRule {
    return {
        uid,
        type: 'decimal',
        ranges,
    } as ISheetDataValidationRule;
}

function createMatrix(initial: Map<string, IRange[]> = new Map()) {
    const worksheet = {
        getMaxColumns: () => 20,
        getMaxRows: () => 20,
    } as unknown as Worksheet;
    const workbook = {
        getSheetBySheetId: () => worksheet,
    } as unknown as Workbook;
    const univerInstanceService = {
        getUnit: () => workbook,
    } as unknown as IUniverInstanceService;

    return new RuleMatrix(initial, 'unit-1', 'sheet-1', univerInstanceService);
}

describe('RuleMatrix', () => {
    it('overwrites overlapped cells with the latest rule and supports lookups', () => {
        const matrix = createMatrix();

        matrix.addRule(createRule('rule-1', [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }]));
        matrix.addRule(createRule('rule-2', [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }]));

        expect(matrix.getValue(0, 0)).toBe('rule-1');
        expect(matrix.getValue(1, 1)).toBe('rule-2');
        expect(matrix.getValue(2, 2)).toBe('rule-2');
        expect(matrix.getValue(5, 5)).toBeUndefined();
    });

    it('updates, removes, and merges rule ranges correctly', () => {
        const matrix = createMatrix(new Map([
            ['rule-1', [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]],
            ['rule-2', [{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }]],
        ]));

        matrix.updateRange('rule-1', [{ startRow: 3, endRow: 3, startColumn: 3, endColumn: 3 }]);
        expect(matrix.getValue(0, 0)).toBeUndefined();
        expect(matrix.getValue(3, 3)).toBe('rule-1');

        matrix.addRangeRules([
            {
                id: 'rule-1',
                ranges: [
                    { startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 },
                    { startRow: 4, endRow: 4, startColumn: 5, endColumn: 5 },
                ],
            },
        ]);
        expect(matrix.getValue(4, 4)).toBe('rule-1');
        expect(matrix.getValue(4, 5)).toBe('rule-1');

        matrix.removeRange([{ startRow: 4, endRow: 4, startColumn: 5, endColumn: 5 }]);
        expect(matrix.getValue(4, 4)).toBe('rule-1');
        expect(matrix.getValue(4, 5)).toBeUndefined();

        matrix.removeRule(createRule('rule-2', []));
        expect(matrix.getValue(2, 2)).toBeUndefined();
    });

    it('reports update, delete, add mutations and clones independently', () => {
        const ranges1 = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }];
        const ranges2 = [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }];
        const matrix = createMatrix(new Map([
            ['rule-1', ranges1],
            ['rule-2', ranges2],
        ]));

        const cloned = matrix.clone();
        cloned.updateRange('rule-1', [{ startRow: 3, endRow: 3, startColumn: 3, endColumn: 3 }]);

        expect(matrix.getValue(0, 0)).toBe('rule-1');

        const baseRules = [
            createRule('rule-1', ranges1),
            createRule('rule-2', ranges2),
        ];

        cloned.removeRule(createRule('rule-2', ranges2));

        expect(cloned.diff(baseRules)).toEqual([
            {
                type: 'update',
                ruleId: 'rule-1',
                oldRanges: ranges1,
                newRanges: [{ startRow: 3, endRow: 3, startColumn: 3, endColumn: 3 }],
                rule: baseRules[0],
            },
            {
                type: 'delete',
                rule: baseRules[1],
                index: 1,
            },
        ]);

        expect(cloned.diffWithAddition(baseRules, [createRule('rule-3', [{ startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 }])].values())).toEqual([
            {
                type: 'update',
                ruleId: 'rule-1',
                oldRanges: ranges1,
                newRanges: [{ startRow: 3, endRow: 3, startColumn: 3, endColumn: 3 }],
                rule: baseRules[0],
            },
            {
                type: 'delete',
                rule: baseRules[1],
                index: 1,
            },
            {
                type: 'add',
                rule: {
                    uid: 'rule-3',
                    type: 'decimal',
                    ranges: [],
                },
            },
        ]);
    });
});
