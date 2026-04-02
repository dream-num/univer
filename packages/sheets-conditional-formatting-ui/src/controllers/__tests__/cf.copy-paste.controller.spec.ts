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

import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import {
    AddConditionalRuleMutation,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    DeleteConditionalRuleMutation,
    SetConditionalRuleMutation,
} from '@univerjs/sheets-conditional-formatting';
import { COPY_TYPE, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingCopyPasteController } from '../cf.copy-paste.controller';

describe('ConditionalFormattingCopyPasteController', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    it('creates copy-paste mutations from the real rule model and view model', async () => {
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
});
