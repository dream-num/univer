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
import { DataValidationType, IUniverInstanceService } from '@univerjs/core';
import { AddDataValidationMutation, DataValidatorRegistryService, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SheetDataValidationModel } from '../../../models/sheet-data-validation-model';
import { getDataValidationDiffMutations } from '../data-validation.command';

function createAccessor(withTarget = true, offset = true) {
    const worksheet = {
        getSheetId: () => 'sheet-1',
        getCellMatrix: vi.fn(() => ({
            getValue: vi.fn(() => ({})),
        })),
        getCellRaw: vi.fn((row: number, col: number) => {
            if (row === 0 && col === 0) {
                return { v: '' };
            }

            return { v: '0' };
        }),
    };
    const workbook = {
        getUnitId: () => 'unit-1',
        getStyles: vi.fn(() => ({
            getStyleByCell: vi.fn(() => null),
        })),
        getSheetBySheetId: vi.fn(() => (withTarget ? worksheet : null)),
        getActiveSheet: vi.fn(() => worksheet),
    };
    const sheetDataValidationModel = {
        getRuleById: vi.fn((_unitId: string, _subUnitId: string, ruleId: string) => ({
            uid: ruleId,
            type: DataValidationType.CHECKBOX,
            formula1: '=A1',
            formula2: '=B1',
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }],
        })),
        getValidator: vi.fn(() => ({
            parseFormulaSync: vi.fn(() => ({ formula2: '0', originFormula2: '0' })),
        })),
    };

    return {
        worksheet,
        accessor: {
            get(token: unknown) {
                if (token === LexerTreeBuilder) {
                    return {
                        moveFormulaRefOffset: vi.fn((formula: string, col: number, row: number) => `${formula}:${col},${row}`),
                    };
                }
                if (token === DataValidatorRegistryService) {
                    return {
                        getValidatorItem: vi.fn(() => ({ offsetFormulaByRange: offset })),
                    };
                }
                if (token === SheetDataValidationModel) {
                    return sheetDataValidationModel;
                }
                if (token === IUniverInstanceService) {
                    return {
                        getUnit: vi.fn(() => (withTarget ? workbook : null)),
                        getCurrentUnitOfType: vi.fn(() => workbook),
                        getUniverSheetInstance: vi.fn(() => workbook),
                    };
                }

                throw new Error(`Unknown token: ${String(token)}`);
            },
        } as IAccessor,
        sheetDataValidationModel,
    };
}

describe('getDataValidationDiffMutations', () => {
    it('returns empty mutations when the target sheet cannot be resolved', () => {
        const { accessor } = createAccessor(false);

        expect(getDataValidationDiffMutations('unit-1', 'sheet-1', [], accessor)).toEqual({
            redoMutations: [],
            undoMutations: [],
        });
    });

    it('builds delete, update, and add mutations including checkbox default fills', () => {
        const { accessor } = createAccessor(true, true);
        const diffs = [
            {
                type: 'delete',
                rule: { uid: 'rule-delete', ranges: [] },
                index: 0,
            },
            {
                type: 'update',
                ruleId: 'rule-update',
                oldRanges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                newRanges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
                rule: {
                    uid: 'rule-update',
                    type: DataValidationType.CHECKBOX,
                    formula1: '=A1',
                    formula2: '=B1',
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
            {
                type: 'add',
                rule: {
                    uid: 'rule-add',
                    type: DataValidationType.CHECKBOX,
                    formula1: '=A1',
                    formula2: '=B1',
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }],
                },
            },
        ] as any;

        const { redoMutations, undoMutations } = getDataValidationDiffMutations('unit-1', 'sheet-1', diffs, accessor);

        expect(redoMutations.map((m) => m.id)).toEqual([
            RemoveDataValidationMutation.id,
            UpdateDataValidationMutation.id,
            AddDataValidationMutation.id,
            SetRangeValuesMutation.id,
        ]);
        expect((redoMutations[1].params as any).payload.type).toBe(UpdateRuleType.ALL);
        expect((redoMutations[3].params as any).cellValue).toBeTruthy();
        expect(undoMutations.map((m) => m.id)).toContain(AddDataValidationMutation.id);
        expect(undoMutations.map((m) => m.id)).toContain(RemoveDataValidationMutation.id);
        expect(undoMutations.map((m) => m.id)).toContain(UpdateDataValidationMutation.id);
        expect(undoMutations.map((m) => m.id)).toContain(SetRangeValuesMutation.id);
    });

    it('uses range-only updates when formulas do not offset or default filling is disabled', () => {
        const { accessor } = createAccessor(true, false);
        const diffs = [
            {
                type: 'update',
                ruleId: 'rule-update',
                oldRanges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                newRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
                rule: {
                    uid: 'rule-update',
                    type: DataValidationType.DECIMAL,
                    formula1: '1',
                    formula2: '2',
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
        ] as any;

        const { redoMutations, undoMutations } = getDataValidationDiffMutations('unit-1', 'sheet-1', diffs, accessor, 'command', false);

        expect(redoMutations).toHaveLength(1);
        expect((redoMutations[0].params as any).payload.type).toBe(UpdateRuleType.RANGE);
        expect(undoMutations).toHaveLength(1);
        expect((undoMutations[0].params as any).payload.type).toBe(UpdateRuleType.RANGE);
    });
});
