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
import { CFNumberOperator, CFRuleType, CFSubRuleType } from '@univerjs/sheets-conditional-formatting';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../../__tests__/create-cf-ui-test-bed';
import { AddColorScaleConditionalRuleCommand } from '../add-color-scale-cf.command';
import { AddDataBarConditionalRuleCommand } from '../add-data-bar-cf.command';
import { AddNumberCfCommand } from '../add-number-cf.command';

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
});
