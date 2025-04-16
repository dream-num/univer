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

import type { IColorScale, IConditionFormattingRule } from '../../../models/type';
import { beforeEach, describe, expect, it } from 'vitest';
import { CFRuleType, CFValueType } from '../../../base/const';
import { createTestBed } from './test.util';

describe('Test colorScale', () => {
    let testBed: ReturnType<typeof createTestBed>;

    beforeEach(() => {
        testBed && testBed.univer.dispose();
        testBed = createTestBed();
        testBed.getConditionalFormattingViewModel();
    });

    it('colorScale normal test', () => {
        const params: IConditionFormattingRule<IColorScale> = {
            ranges: [{ startRow: 0, startColumn: 0, endRow: 5, endColumn: 6 }],
            cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
            stopIfTrue: false,
            rule: {
                type: CFRuleType.colorScale,
                config: [{
                    index: 0,
                    color: '#d0d9fb',
                    value: {
                        type: CFValueType.min,
                    },
                }, {
                    index: 1,
                    color: '#2e55ef',
                    value: {
                        type: CFValueType.max,
                    },
                }],
            },

        };
        testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
        testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
        const one = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
        const two = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
        const three = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 2);
        const four = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 3);
        const five = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 4);
        expect(one).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(208,217,251)',
                },
            },
        });
        expect(two).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(181,195,249)',
                },
            },
        });
        expect(three).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(154,173,247)',
                },
            },
        });
        expect(four).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(127,151,245)',
                },
            },
        });
        expect(five).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(100,129,243)',
                },
            },
        });
    });
    it('The colors are consistent, but the values are interchangeable', () => {
        const params: IConditionFormattingRule<IColorScale> = {
            ranges: [{ startRow: 0, startColumn: 0, endRow: 5, endColumn: 6 }],
            cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
            stopIfTrue: false,
            rule: {
                type: CFRuleType.colorScale,
                config: [{
                    index: 0,
                    color: '#d0d9fb',
                    value: {
                        type: CFValueType.num,
                        value: 1,
                    },
                }, {
                    index: 1,
                    color: '#2e55ef',
                    value: {
                        type: CFValueType.num,
                        value: -5,
                    },
                }, {
                    index: 2,
                    color: 'rgb(231, 37, 143)',
                    value: {
                        type: CFValueType.num,
                        value: 3,
                    },
                }],
            },
        };
        testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
        testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
        const one = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0); // 1
        const two = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1); // 2
        const three = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 2);// 3
        const four = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 3); // 4
        const five = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 6); // is same as 3
        expect(one).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(46,85,239)',
                },
            },
        });
        expect(two).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(139,61,191)',
                },
            },
        });
        expect(three).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(231,37,143)',
                },
            },
        });
        expect(four).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(231,37,143)',
                },
            },
        });
        expect(five).toEqual({
            style: {
                bg: {
                    rgb: 'rgb(231,37,143)',
                },
            },
        });
    });
});
