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
import {
    CFNumberOperator,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    CFTimePeriodOperator,
} from '@univerjs/sheets-conditional-formatting';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../../__tests__/create-cf-ui-test-bed';
import { AddAverageCfCommand } from '../add-average-cf.command';
import { AddColorScaleConditionalRuleCommand } from '../add-color-scale-cf.command';
import { AddDataBarConditionalRuleCommand } from '../add-data-bar-cf.command';
import { AddDuplicateValuesCfCommand } from '../add-duplicate-values-cf.command';
import { AddNumberCfCommand } from '../add-number-cf.command';
import { AddRankCfCommand } from '../add-rank-cf.command';
import { AddTextCfCommand } from '../add-text-cf.command';
import { AddTimePeriodCfCommand } from '../add-time-period-cf.command';
import { AddUniqueValuesCfCommand } from '../add-unique-values-cf.command';

const range: IRange = {
    startRow: 1,
    endRow: 3,
    startColumn: 2,
    endColumn: 4,
};

describe('conditional formatting add commands', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    it('adds number highlight rules into the real rule model', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddNumberCfCommand);

        expect(await testBed.commandService.executeCommand(AddNumberCfCommand.id, {
            ranges: [range],
            operator: CFNumberOperator.between,
            style: { bg: { rgb: '#aaf' } },
            value: [10, 20],
            stopIfTrue: true,
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [range],
            stopIfTrue: true,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.number,
                operator: CFNumberOperator.between,
                style: { bg: { rgb: '#aaf' } },
                value: [10, 20],
            },
        });

        testBed.univer.dispose();
    });

    it('adds number highlight rules with a single comparison value', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddNumberCfCommand);

        expect(await testBed.commandService.executeCommand(AddNumberCfCommand.id, {
            ranges: [range],
            operator: CFNumberOperator.greaterThan,
            style: { bg: { rgb: '#afa' } },
            value: 100,
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [range],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.number,
                operator: CFNumberOperator.greaterThan,
                style: { bg: { rgb: '#afa' } },
                value: 100,
            },
        });

        testBed.univer.dispose();
    });

    it('adds color scale rules into the real rule model', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddColorScaleConditionalRuleCommand);

        expect(await testBed.commandService.executeCommand(AddColorScaleConditionalRuleCommand.id, {
            ranges: [range],
            config: [{ index: 0, color: '#f00' }, { index: 1, color: '#0f0' }],
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [range],
            rule: {
                type: CFRuleType.colorScale,
                config: [{ index: 0, color: '#f00' }, { index: 1, color: '#0f0' }],
            },
        });

        testBed.univer.dispose();
    });

    it('adds data bar rules into the real rule model', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddDataBarConditionalRuleCommand);

        expect(await testBed.commandService.executeCommand(AddDataBarConditionalRuleCommand.id, {
            ranges: [range],
            min: { type: 'min' },
            max: { type: 'max' },
            nativeColor: '#ddd',
            positiveColor: '#0f0',
            isGradient: true,
            isShowValue: false,
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [range],
            rule: {
                type: CFRuleType.dataBar,
                isShowValue: false,
                config: {
                    min: { type: 'min' },
                    max: { type: 'max' },
                    nativeColor: '#ddd',
                    positiveColor: '#0f0',
                    isGradient: true,
                },
            },
        });

        testBed.univer.dispose();
    });

    it('adds rank highlight rules for bottom percent scenarios', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddRankCfCommand);

        expect(await testBed.commandService.executeCommand(AddRankCfCommand.id, {
            ranges: [range],
            isPercent: true,
            isBottom: true,
            value: 10,
            style: { bg: { rgb: '#fed' } },
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [range],
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.rank,
                isPercent: true,
                isBottom: true,
                value: 10,
                style: { bg: { rgb: '#fed' } },
            },
        });

        testBed.univer.dispose();
    });

    it('adds average highlight rules for above-average cells', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddAverageCfCommand);

        expect(await testBed.commandService.executeCommand(AddAverageCfCommand.id, {
            ranges: [range],
            operator: CFNumberOperator.greaterThan,
            style: { cl: { rgb: '#080' } },
            stopIfTrue: true,
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [range],
            stopIfTrue: true,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.average,
                operator: CFNumberOperator.greaterThan,
                style: { cl: { rgb: '#080' } },
            },
        });

        testBed.univer.dispose();
    });

    it('adds text highlight rules for matching cell contents', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddTextCfCommand);

        expect(await testBed.commandService.executeCommand(AddTextCfCommand.id, {
            ranges: [range],
            operator: CFTextOperator.containsText,
            value: 'overdue',
            style: { bl: 1 },
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [range],
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.containsText,
                value: 'overdue',
                style: { bl: 1 },
            },
        });

        testBed.univer.dispose();
    });

    it('adds time period rules for recent dates', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddTimePeriodCfCommand);

        expect(await testBed.commandService.executeCommand(AddTimePeriodCfCommand.id, {
            ranges: [range],
            operator: CFTimePeriodOperator.last7Days,
            style: { it: 1 },
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [range],
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.timePeriod,
                operator: CFTimePeriodOperator.last7Days,
                style: { it: 1 },
            },
        });

        testBed.univer.dispose();
    });

    it('adds duplicate and unique value rules independently', async () => {
        const testBed = createCfUiTestBed();
        testBed.commandService.registerCommand(AddDuplicateValuesCfCommand);
        testBed.commandService.registerCommand(AddUniqueValuesCfCommand);

        expect(await testBed.commandService.executeCommand(AddDuplicateValuesCfCommand.id, {
            ranges: [range],
            style: { bg: { rgb: '#fcc' } },
        })).toBe(true);
        expect(await testBed.commandService.executeCommand(AddUniqueValuesCfCommand.id, {
            ranges: [range],
            style: { bg: { rgb: '#ccf' } },
            stopIfTrue: true,
        })).toBe(true);

        const rules = testBed.ruleModel.getSubunitRules(testBed.unitId, testBed.subUnitId);
        expect(rules).toHaveLength(2);
        let duplicateRule = rules?.[0];
        let uniqueRule = rules?.[1];
        if (duplicateRule?.rule.type !== CFRuleType.highlightCell || duplicateRule.rule.subType !== CFSubRuleType.duplicateValues) {
            duplicateRule = rules?.[1];
            uniqueRule = rules?.[0];
        }

        expect(duplicateRule).toMatchObject({
            ranges: [range],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.duplicateValues,
                style: { bg: { rgb: '#fcc' } },
            },
        });
        expect(uniqueRule).toMatchObject({
            ranges: [range],
            stopIfTrue: true,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.uniqueValues,
                style: { bg: { rgb: '#ccf' } },
            },
        });

        testBed.univer.dispose();
    });
});
