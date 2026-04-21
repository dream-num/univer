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
import { ClearSelectionAllCommand, ClearSelectionFormatCommand } from '@univerjs/sheets';
import { AddConditionalRuleMutation, CFRuleType, CFSubRuleType, CFTextOperator } from '@univerjs/sheets-conditional-formatting';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingClearController } from '../cf.clear.controller';

describe('ConditionalFormattingClearController', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    it('clips intersecting conditional formatting ranges when clearing selection format', async () => {
        const testBed = createCfUiTestBed();
        testBed.injector.add([ConditionalFormattingClearController]);
        testBed.injector.get(ConditionalFormattingClearController);
        testBed.commandService.registerCommand(ClearSelectionFormatCommand);

        const rule: IConditionFormattingRule = {
            cfId: 'cf-1',
            ranges: [{
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 1,
            }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.notContainsText,
                value: 'A',
                style: { bg: { rgb: '#ff0' } },
            },
        };

        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule,
        });
        testBed.setSelection({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });

        expect(await testBed.commandService.executeCommand(ClearSelectionFormatCommand.id)).toBe(true);
        expect(testBed.ruleModel.getRule(testBed.unitId, testBed.subUnitId, 'cf-1')?.ranges).toEqual([{
            startRow: 0,
            endRow: 0,
            startColumn: 1,
            endColumn: 1,
        }]);

        testBed.univer.dispose();
    });

    it('removes fully covered conditional formatting rules when clearing selection all', async () => {
        const testBed = createCfUiTestBed();
        testBed.injector.add([ConditionalFormattingClearController]);
        testBed.injector.get(ConditionalFormattingClearController);
        testBed.commandService.registerCommand(ClearSelectionAllCommand);

        const rule: IConditionFormattingRule = {
            cfId: 'cf-2',
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
                value: 'A',
                style: { bg: { rgb: '#ff0' } },
            },
        };

        await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule,
        });
        testBed.setSelection({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });

        expect(await testBed.commandService.executeCommand(ClearSelectionAllCommand.id)).toBe(true);
        expect(testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toEqual([]);

        testBed.univer.dispose();
    });
});
