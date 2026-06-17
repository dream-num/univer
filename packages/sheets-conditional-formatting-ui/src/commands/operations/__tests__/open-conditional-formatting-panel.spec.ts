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

import type { IRange } from '@univerjs/core';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { AddConditionalRuleMutation, CFRuleType, CFSubRuleType, CFTextOperator } from '@univerjs/sheets-conditional-formatting';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingPanelController } from '../../../controllers/cf.panel.controller';
import { CF_MENU_OPERATION, OpenConditionalFormattingOperator } from '../open-conditional-formatting-panel';

const range: IRange = {
    startRow: 1,
    endRow: 2,
    startColumn: 3,
    endColumn: 4,
};

describe('OpenConditionalFormattingOperator', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    function createPanelTestBed() {
        const testBed = createCfUiTestBed();
        testBed.injector.add([ConditionalFormattingPanelController]);
        testBed.injector.get(ConditionalFormattingPanelController);
        testBed.commandService.registerCommand(OpenConditionalFormattingOperator);
        testBed.setSelection(range);

        return testBed;
    }

    async function openFromMenu(testBed: ReturnType<typeof createPanelTestBed>, value: CF_MENU_OPERATION) {
        expect(await testBed.commandService.executeCommand(OpenConditionalFormattingOperator.id, { value })).toBe(true);

        return testBed.sidebarService.options.children?.rule as IConditionFormattingRule | undefined;
    }

    it('opens the real sidebar panel with a rule seeded from the current selection', async () => {
        const testBed = createPanelTestBed();

        expect(await testBed.commandService.executeCommand(OpenConditionalFormattingOperator.id, {
            value: CF_MENU_OPERATION.formula,
        })).toBe(true);

        expect(testBed.sidebarService.visible).toBe(true);
        expect(testBed.sidebarService.options).toMatchObject({
            id: 'sheet.conditional.formatting.panel',
            children: expect.objectContaining({
                rule: {
                    ranges: [expect.objectContaining(range)],
                    rule: {
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.formula,
                        value: '=',
                    },
                },
            }),
        });

        testBed.univer.dispose();
    });

    it('opens the default rule editor for creating a new conditional formatting rule', async () => {
        const testBed = createPanelTestBed();

        const rule = await openFromMenu(testBed, CF_MENU_OPERATION.createRule);

        expect(testBed.sidebarService.visible).toBe(true);
        expect(rule).toMatchObject({
            ranges: [expect.objectContaining(range)],
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
            },
        });

        testBed.univer.dispose();
    });

    it('opens specialized rule editors from the conditional formatting menu', async () => {
        const testBed = createPanelTestBed();

        let rule = await openFromMenu(testBed, CF_MENU_OPERATION.rank);
        expect(rule).toMatchObject({
            ranges: [expect.objectContaining(range)],
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.rank,
            },
        });

        rule = await openFromMenu(testBed, CF_MENU_OPERATION.colorScale);
        expect(rule).toMatchObject({
            ranges: [expect.objectContaining(range)],
            rule: {
                type: CFRuleType.colorScale,
                config: [],
            },
        });

        rule = await openFromMenu(testBed, CF_MENU_OPERATION.dataBar);
        expect(rule).toMatchObject({
            ranges: [expect.objectContaining(range)],
            rule: {
                type: CFRuleType.dataBar,
                isShowValue: true,
            },
        });

        rule = await openFromMenu(testBed, CF_MENU_OPERATION.icon);
        expect(rule).toMatchObject({
            ranges: [expect.objectContaining(range)],
            rule: {
                type: CFRuleType.iconSet,
                config: [],
                isShowValue: true,
            },
        });

        testBed.univer.dispose();
    });

    it('opens the rule list without seeding a draft rule', async () => {
        const testBed = createPanelTestBed();

        const rule = await openFromMenu(testBed, CF_MENU_OPERATION.viewRule);

        expect(testBed.sidebarService.visible).toBe(true);
        expect(rule).toBeUndefined();

        testBed.univer.dispose();
    });

    it('clears range rules and worksheet rules through the real operator flow', async () => {
        const testBed = createPanelTestBed();

        const addRule = async (cfId: string, ranges = [range]) => {
            const rule: IConditionFormattingRule = {
                cfId,
                ranges,
                stopIfTrue: false,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.text,
                    operator: CFTextOperator.notContainsText,
                    value: 'A1',
                    style: { bg: { rgb: '#ff0' } },
                },
            };

            await testBed.commandService.executeCommand(AddConditionalRuleMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                rule,
            });
        };

        await addRule('cf-range');
        expect(testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toHaveLength(1);

        expect(await testBed.commandService.executeCommand(OpenConditionalFormattingOperator.id, {
            value: CF_MENU_OPERATION.clearRangeRules,
        })).toBe(true);
        expect(testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toEqual([]);

        await addRule('cf-sheet-1');
        await addRule('cf-sheet-2', [{
            startRow: 5,
            endRow: 5,
            startColumn: 5,
            endColumn: 5,
        }]);
        expect(testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toHaveLength(2);

        expect(await testBed.commandService.executeCommand(OpenConditionalFormattingOperator.id, {
            value: CF_MENU_OPERATION.clearWorkSheetRules,
        })).toBe(true);
        expect(testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId)).toEqual([]);

        testBed.univer.dispose();
    });
});
