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

import type { Workbook } from '@univerjs/core';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { IUniverInstanceService, Range, UniverInstanceType } from '@univerjs/core';
import {
    AddConditionalRuleMutation,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    DeleteConditionalRuleMutation,
    SetConditionalRuleMutation,
} from '@univerjs/sheets-conditional-formatting';
import { COPY_TYPE, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCfUiTestBed } from '../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingCopyPasteController } from '../cf.copy-paste.controller';

describe('ConditionalFormattingCopyPasteController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('creates copy-paste mutations from the real rule model and view model', async () => {
        vi.spyOn(Range, 'foreach').mockImplementation(() => {
            throw new Error('must not enumerate cells');
        });
        const testBed = createCfUiTestBed();
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);

        const sourceRule: IConditionFormattingRule = {
            cfId: 'cf-source',
            ranges: [{
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.notContainsText,
                value: 'A1',
                style: { bg: { rgb: '#0f0' } },
            },
        };
        const targetRule: IConditionFormattingRule = {
            cfId: 'cf-target',
            ranges: [{
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
            }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.notContainsText,
                value: 'B2',
                style: { bg: { rgb: '#f00' } },
            },
        };

        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: sourceRule,
        });
        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: targetRule,
        });

        const hook = testBed.getClipboardHook()!;
        expect(hook).toBeDefined();

        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });

        const result = hook.onPasteCells(
            {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                range: { rows: [0], cols: [0] },
            },
            {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                range: { rows: [1], cols: [1] },
            },
            null,
            {
                copyType: COPY_TYPE.COPY,
                pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
            }
        ) as {
            redos: Array<{ id: string; params: unknown }>;
            undos: Array<{ id: string; params: unknown }>;
        };

        const redoIds = result.redos.map((item: { id: string }) => item.id);
        expect(redoIds).toContain(DeleteConditionalRuleMutation.id);
        expect(redoIds.some((id: string) => id === AddConditionalRuleMutation.id || id === SetConditionalRuleMutation.id)).toBe(true);
        expect(result.undos.length).toBeGreaterThan(0);

        const copiedRuleRedo = result.redos.find((item) => {
            const params = item.params as {
                rule?: {
                    cfId?: string;
                    ranges?: Array<{ startRow: number; endRow: number; startColumn: number; endColumn: number }>;
                };
            };

            return (item.id === AddConditionalRuleMutation.id || item.id === SetConditionalRuleMutation.id) &&
                params.rule?.cfId === 'cf-source';
        });
        const copiedRuleParams = copiedRuleRedo?.params as {
            rule?: {
                ranges?: Array<{ startRow: number; endRow: number; startColumn: number; endColumn: number }>;
            };
        } | undefined;
        expect(copiedRuleParams?.rule?.ranges?.some((range: { startRow: number; endRow: number; startColumn: number; endColumn: number }) =>
            range.startRow <= 1 &&
            range.endRow >= 1 &&
            range.startColumn <= 1 &&
            range.endColumn >= 1
        )).toBe(true);

        testBed.univer.dispose();
    });

    it('keeps identical overlapping source rules distinct when copying', async () => {
        const testBed = createCfUiTestBed();
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);
        const config: IConditionFormattingRule['rule'] = {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            operator: CFTextOperator.notContainsText,
            value: 'A1',
            style: { bg: { rgb: '#0f0' } },
        };

        for (const cfId of ['cf-source-1', 'cf-source-2']) {
            await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule: {
                    cfId,
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                    stopIfTrue: false,
                    rule: config,
                },
            });
        }

        const hook = testBed.getClipboardHook()!;
        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });
        const result = hook.onPasteCells(
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [0], cols: [0] } },
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        const copiedRuleIds = result.redos.flatMap((mutation) => {
            if (mutation.id !== AddConditionalRuleMutation.id && mutation.id !== SetConditionalRuleMutation.id) {
                return [];
            }
            const rule = (mutation.params as { rule: IConditionFormattingRule }).rule;
            return rule.ranges.some((range) => range.startRow <= 1 && range.endRow >= 1 && range.startColumn <= 1 && range.endColumn >= 1)
                ? [rule.cfId]
                : [];
        });
        expect(new Set(copiedRuleIds)).toEqual(new Set(['cf-source-1', 'cf-source-2']));
        testBed.univer.dispose();
    });

    it('does not reuse a target rule with different stop-if-true semantics', async () => {
        const testBed = createCfUiTestBed();
        const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>(testBed.unitId, UniverInstanceType.UNIVER_SHEET)!;
        workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'sheet2' });
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);
        const config: IConditionFormattingRule['rule'] = {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            operator: CFTextOperator.notContainsText,
            value: 'A1',
            style: { bg: { rgb: '#0f0' } },
        };
        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: {
                cfId: 'cf-source',
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                stopIfTrue: true,
                rule: config,
            },
        });
        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: 'sheet2',
            rule: {
                cfId: 'cf-target',
                ranges: [{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }],
                stopIfTrue: false,
                rule: config,
            },
        });

        const hook = testBed.getClipboardHook()!;
        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });
        const result = hook.onPasteCells(
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [0], cols: [0] } },
            { unitId: testBed.unitId, subUnitId: 'sheet2', range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        const addedRule = result.redos.find((mutation) => mutation.id === AddConditionalRuleMutation.id)?.params as { rule: IConditionFormattingRule } | undefined;
        expect(addedRule?.rule.stopIfTrue).toBe(true);
        testBed.univer.dispose();
    });

    it.each([
        { name: 'matching semantics', targetValue: 'source' },
        { name: 'different semantics', targetValue: 'target' },
    ])('isolates source and target rules with colliding IDs during cross-sheet cut: $name', async ({ targetValue }) => {
        const testBed = createCfUiTestBed();
        const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>(testBed.unitId, UniverInstanceType.UNIVER_SHEET)!;
        workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'sheet2' });
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);
        const createRule = (value: string, ranges: IConditionFormattingRule['ranges']): IConditionFormattingRule => ({
            cfId: 'cf-collision',
            ranges,
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.notContainsText,
                value,
                style: { bg: { rgb: value === 'source' ? '#0f0' : '#f00' } },
            },
        });
        const sourceRule = createRule('source', [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);
        const targetRule = createRule(targetValue, [
            { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
        ]);
        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: sourceRule,
        });
        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: 'sheet2',
            rule: targetRule,
        });

        const hook = testBed.getClipboardHook()!;
        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });
        const result = hook.onPasteCells(
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [0], cols: [0] } },
            { unitId: testBed.unitId, subUnitId: 'sheet2', range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.CUT, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        ) as { redos: Array<{ id: string; params: object }>; undos: Array<{ id: string; params: object }> };

        for (const mutation of result.redos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }
        expect(testBed.ruleModel.getRule(testBed.unitId, testBed.subUnitId, 'cf-collision')).toBeFalsy();
        expect(testBed.ruleModel.getRule(testBed.unitId, 'sheet2', 'cf-collision')?.ranges).toEqual([
            { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
        ]);
        const copiedRules = testBed.ruleModel.getSubunitRules(testBed.unitId, 'sheet2')?.filter((rule) => (
            rule.cfId !== 'cf-collision' && rule.rule.type === CFRuleType.highlightCell && 'value' in rule.rule && rule.rule.value === 'source'
        ));
        expect(copiedRules).toHaveLength(1);
        expect(copiedRules?.[0].ranges).toEqual([{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }]);

        for (const mutation of result.undos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }
        expect(testBed.ruleModel.getRule(testBed.unitId, testBed.subUnitId, 'cf-collision')).toEqual(sourceRule);
        expect(testBed.ruleModel.getSubunitRules(testBed.unitId, 'sheet2')).toEqual([targetRule]);
        testBed.univer.dispose();
    });

    it('preserves source rule priority when copying across worksheets', async () => {
        const testBed = createCfUiTestBed();
        const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>(testBed.unitId, UniverInstanceType.UNIVER_SHEET)!;
        workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'sheet2' });
        testBed.injector.add([ConditionalFormattingCopyPasteController]);
        testBed.injector.get(ConditionalFormattingCopyPasteController);
        for (const value of ['low', 'high']) {
            await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule: {
                    cfId: `cf-${value}`,
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                    stopIfTrue: false,
                    rule: {
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.notContainsText,
                        value,
                        style: { bg: { rgb: value === 'high' ? '#0f0' : '#f00' } },
                    },
                },
            });
        }

        const hook = testBed.getClipboardHook()!;
        hook.onBeforeCopy(testBed.unitId, testBed.subUnitId, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });
        const result = hook.onPasteCells(
            { unitId: testBed.unitId, subUnitId: testBed.subUnitId, range: { rows: [0], cols: [0] } },
            { unitId: testBed.unitId, subUnitId: 'sheet2', range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        ) as { redos: Array<{ id: string; params: object }>; undos: Array<{ id: string; params: object }> };
        for (const mutation of result.redos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }

        const copiedValues = testBed.ruleModel.getSubunitRules(testBed.unitId, 'sheet2')?.map((rule) => (
            rule.rule.type === CFRuleType.highlightCell && 'value' in rule.rule ? rule.rule.value : undefined
        ));
        expect(copiedValues).toEqual(['high', 'low']);
        for (const mutation of result.undos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }
        expect(testBed.ruleModel.getSubunitRules(testBed.unitId, 'sheet2')).toEqual([]);
        testBed.univer.dispose();
    });
});
