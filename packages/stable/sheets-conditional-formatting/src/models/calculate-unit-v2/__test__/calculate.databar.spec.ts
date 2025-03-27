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

import type { IConditionFormattingRule, IDataBar } from '../../../models/type';
import { beforeEach, describe, expect, it } from 'vitest';
import { CFRuleType, CFValueType } from '../../../base/const';
import { createTestBed } from './test.util';

describe('Test conditional formatting data bar', () => {
    let testBed: ReturnType<typeof createTestBed>;

    beforeEach(() => {
        testBed && testBed.univer.dispose();
        testBed = createTestBed();
        testBed.getConditionalFormattingViewModel();
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

        const start = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 0);
        const end = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 6);

        expect(start).toEqual({});

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

    it('test data bar normal', () => {
        const params: IConditionFormattingRule<IDataBar> = {
            ranges: [{ startRow: 0, startColumn: 0, endRow: 6, endColumn: 6 }],
            cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
            stopIfTrue: false,
            rule: {
                type: CFRuleType.dataBar,
                isShowValue: true,
                config: {
                    min: { value: 2, type: CFValueType.num },
                    max: { value: 5, type: CFValueType.num },
                    isGradient: true,
                    positiveColor: '#abd91a',
                    nativeColor: '#ffbe38',
                },
            },

        };
        testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
        const one = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
        const two = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
        const three = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 2);
        const four = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 3);
        const five = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 4);
        const six = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 6, 0);

        // If less than the minimum value,do not render the data bar.
        expect(one).toEqual({});
        expect(two).toEqual({});
        expect(three).toEqual({
            dataBar: {
                color: '#abd91a',
                startPoint: 0,
                value: 33.333333333333336,
                isGradient: true,
                isShowValue: true,
            },
            isShowValue: true,

        });

        expect(four).toEqual({
            dataBar: {
                color: '#abd91a',
                startPoint: 0,
                value: 66.66666666666667,
                isGradient: true,
                isShowValue: true,
            },
            isShowValue: true,

        });
        expect(five).toEqual({
            dataBar: {
                color: '#abd91a',
                startPoint: 0,
                value: 100,
                isGradient: true,
                isShowValue: true,
            },
            isShowValue: true,
        });
        expect(six).toEqual({});
    });
});
