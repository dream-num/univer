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
import type { IAverageHighlightCell, IConditionFormatRule, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell } from '../../models/type';
import { NumberOperator, RuleType, SubRuleType, TextOperator } from '../../base/const';
import { EMPTY_STYLE } from '../calculate-unit/type';
import { createTestBed } from './test.util';

describe('Test conditional format service', () => {
    let testBed: ReturnType<typeof createTestBed>;
    beforeEach(() => {
        testBed && testBed.univer.dispose();
        testBed = createTestBed();
    });

    describe('Test highlight', () => {
        describe('Test Number', () => {
            it(`Is ${NumberOperator.between}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.between,
                        value: [0, 10],
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${NumberOperator.between}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.between,
                        value: [5, 10],
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${NumberOperator.equal}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.equal,
                        value: 2,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${NumberOperator.equal}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.equal,
                        value: 2,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 2);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${NumberOperator.greaterThan}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.greaterThan,
                        value: 0,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${NumberOperator.greaterThan}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.greaterThan,
                        value: 2,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${NumberOperator.greaterThanOrEqual}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.greaterThanOrEqual,
                        value: 0,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${NumberOperator.greaterThanOrEqual}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.greaterThanOrEqual,
                        value: 3,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${NumberOperator.lessThan}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.lessThan,
                        value: 3,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${NumberOperator.lessThan}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.lessThan,
                        value: 0,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${NumberOperator.lessThanOrEqual}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.lessThanOrEqual,
                        value: 3,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${NumberOperator.lessThanOrEqual}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.lessThanOrEqual,
                        value: 0,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${NumberOperator.notBetween}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.notBetween,
                        value: [5, 7],
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${NumberOperator.notBetween}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.notBetween,
                        value: [0, 3],
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${NumberOperator.notEqual}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.notEqual,
                        value: 11,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${NumberOperator.notEqual}`, () => {
                const params: IConditionFormatRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.number,
                        operator: NumberOperator.notEqual,
                        value: 2,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
        });
        describe('Test Text', () => {
            it(`is ${TextOperator.beginsWith}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.beginsWith,
                        value: '2',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${TextOperator.beginsWith}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.beginsWith,
                        value: '11',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });

            it(`is ${TextOperator.endsWith}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.endsWith,
                        value: '2',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${TextOperator.endsWith}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.endsWith,
                        value: '11',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });

            it(`is ${TextOperator.containsText}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.containsText,
                        value: '2',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${TextOperator.containsText}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.containsText,
                        value: '11',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`is ${TextOperator.equal}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.containsText,
                        value: '2',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${TextOperator.equal}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.containsText,
                        value: '11',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`is ${TextOperator.notEqual}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.notEqual,
                        value: '22',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${TextOperator.notEqual}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.notEqual,
                        value: '2',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`is ${TextOperator.notContainsText}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.notEqual,
                        value: '11',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${TextOperator.notContainsText}`, () => {
                const params: IConditionFormatRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.text,
                        operator: TextOperator.notEqual,
                        value: '2',
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
        });
        describe('Test average', () => {
            it(`is ${NumberOperator.greaterThanOrEqual} average`, () => {
                const params: IConditionFormatRule<IAverageHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.average,
                        operator: NumberOperator.greaterThanOrEqual,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is ${NumberOperator.lessThanOrEqual} average`, () => {
                const params: IConditionFormatRule<IAverageHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.average,
                        operator: NumberOperator.lessThanOrEqual,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
        });
        describe('Test rank', () => {
            it('is bottom 2', () => {
                const params: IConditionFormatRule<IRankHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 4, endColumn: 4 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.rank,
                        isBottom: true,
                        isPercent: false,
                        value: 2,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it('is bottom 6', () => {
                const params: IConditionFormatRule<IRankHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 4, endColumn: 4 }],
                    cfId: testBed.getConditionalFormatRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: RuleType.highlightCell,
                        subType: SubRuleType.rank,
                        isBottom: true,
                        isPercent: false,
                        value: 6,
                    },
                };
                testBed.getConditionalFormatRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormatService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormatService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
        });
        describe('Test timePeriod', () => {
            // wait
        });
    });
});
