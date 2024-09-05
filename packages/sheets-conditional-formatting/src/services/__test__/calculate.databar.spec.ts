/**
 * Copyright 2023-present DreamNum Inc.
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

import { beforeEach, describe, expect, it } from 'vitest';
import { Range } from '@univerjs/core';
import type { IConditionFormattingRule, IDataBar } from '../../models/type';
import { CFRuleType, CFValueType } from '../../base/const';
import { createTestBed } from './test.util';

describe('Test conditional formatting data bar', () => {
    let testBed: ReturnType<typeof createTestBed>;

    beforeEach(() => {
        testBed && testBed.univer.dispose();
        testBed = createTestBed();
        (testBed.getConditionalFormattingService() as any)._calculateUnit$.subscribe((config: any) => {
            (testBed.getConditionalFormattingService() as any)._handleCalculateUnit(config.unitId, config.subUnitId, config.rule);
        });
        (testBed.getConditionalFormattingRuleModel() as any)._ruleChange$.subscribe((config: any) => {
            config.rule.ranges.forEach((range: any) => {
                const viewModel = testBed.getConditionalFormattingViewModel();
                Range.foreach(range, (row, col) => {
                    viewModel.pushCellCf(config.unitId, config.subUnitId, row, col, config.rule.cfId);
                });
            });
        });
    });

    it('The maximum and minimum values of the data bar are corrected automatically when minimum is greater than maximum.', () => {
        const params: IConditionFormattingRule<IDataBar> = {
            ranges: [{ startRow: 0, startColumn: 0, endRow: 0, endColumn: 6 }],
            cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
            stopIfTrue: false,
            rule: {
                type: CFRuleType.dataBar,
                isShowValue: false,
                config: {
                    // The minimum is greater than the maximum
                    min: { type: CFValueType.num, value: 7 },
                    max: { type: CFValueType.num, value: 1 },
                    isGradient: false,
                    positiveColor: '#abd91a',
                    nativeColor: '#ffbe38',
                },
            },
        };
        testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);

        const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
            dispose.unsubscribe();
            const start = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 0);
            const end = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 6);

            expect(start).toEqual({
                dataBar: {
                    color: '#abd91a',
                    startPoint: 0,
                    value: 0,
                    isGradient: false,
                    isShowValue: false,
                },
                isShowValue: false,
            });

            expect(end).toEqual({
                dataBar: {
                    color: '#abd91a',
                    startPoint: 0,
                    value: 100,
                    isGradient: false,
                    isShowValue: false,
                },
                isShowValue: false,
            });
        });
        testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 1);
    });
});
