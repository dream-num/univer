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
import type { IAverageHighlightCell, IColorScale, IConditionFormattingRule, IDataBar, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell } from '../../models/type';
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator, CFValueType } from '../../base/const';
import { EMPTY_STYLE } from '../calculate-unit/type';
import { createTestBed } from './test.util';

describe('Test conditional formatting service', () => {
    let testBed: ReturnType<typeof createTestBed>;

    beforeEach(() => {
        testBed && testBed.univer.dispose();
        testBed = createTestBed();
        (testBed.getConditionalFormattingService() as any)._afterInitApplyPromise = Promise.resolve();
    });

    describe('Test highlight', () => {
        describe('Test Number', () => {
            it(`Is ${CFNumberOperator.between}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.between,
                        value: [0, 10],
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${CFNumberOperator.between}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.between,
                        value: [5, 10],
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${CFNumberOperator.equal}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.equal,
                        value: 2,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${CFNumberOperator.equal}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.equal,
                        value: 2,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 2);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${CFNumberOperator.greaterThan}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.greaterThan,
                        value: 0,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${CFNumberOperator.greaterThan}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.greaterThan,
                        value: 2,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${CFNumberOperator.greaterThanOrEqual}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.greaterThanOrEqual,
                        value: 0,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${CFNumberOperator.greaterThanOrEqual}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.greaterThanOrEqual,
                        value: 3,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${CFNumberOperator.lessThan}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.lessThan,
                        value: 3,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${CFNumberOperator.lessThan}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.lessThan,
                        value: 0,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${CFNumberOperator.lessThanOrEqual}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.lessThanOrEqual,
                        value: 3,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${CFNumberOperator.lessThanOrEqual}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.lessThanOrEqual,
                        value: 0,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${CFNumberOperator.notBetween}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.notBetween,
                        value: [5, 7],
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${CFNumberOperator.notBetween}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.notBetween,
                        value: [0, 3],
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`Is ${CFNumberOperator.notEqual}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.notEqual,
                        value: 11,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`Is not ${CFNumberOperator.notEqual}`, () => {
                const params: IConditionFormattingRule<INumberHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: CFNumberOperator.notEqual,
                        value: 2,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
        });
        describe('Test Text', () => {
            it(`is ${CFTextOperator.beginsWith}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.beginsWith,
                        value: '2',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${CFTextOperator.beginsWith}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.beginsWith,
                        value: '11',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });

            it(`is ${CFTextOperator.endsWith}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.endsWith,
                        value: '2',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${CFTextOperator.endsWith}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.endsWith,
                        value: '11',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });

            it(`is ${CFTextOperator.containsText}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.containsText,
                        value: '2',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${CFTextOperator.containsText}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.containsText,
                        value: '11',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`is ${CFTextOperator.equal}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.containsText,
                        value: '2',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${CFTextOperator.equal}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.containsText,
                        value: '11',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`is ${CFTextOperator.notEqual}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.notEqual,
                        value: '22',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${CFTextOperator.notEqual}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.notEqual,
                        value: '2',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
            it(`is ${CFTextOperator.notContainsText}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.notEqual,
                        value: '11',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is not ${CFTextOperator.notContainsText}`, () => {
                const params: IConditionFormattingRule<ITextHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.text,
                        operator: CFTextOperator.notEqual,
                        value: '2',
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: EMPTY_STYLE });
                });
            });
        });
        describe('Test average', () => {
            it(`is ${CFNumberOperator.greaterThanOrEqual} average`, () => {
                const params: IConditionFormattingRule<IAverageHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.average,
                        operator: CFNumberOperator.greaterThanOrEqual,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it(`is ${CFNumberOperator.lessThanOrEqual} average`, () => {
                const params: IConditionFormattingRule<IAverageHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.average,
                        operator: CFNumberOperator.lessThanOrEqual,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
        });
        describe('Test rank', () => {
            it('is bottom 2', () => {
                const params: IConditionFormattingRule<IRankHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 4, endColumn: 4 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.rank,
                        isBottom: true,
                        isPercent: false,
                        value: 2,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
            it('is bottom 6', () => {
                const params: IConditionFormattingRule<IRankHighlightCell> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 4, endColumn: 4 }],
                    cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                    stopIfTrue: false,
                    rule: {
                        style: { bg: { rgb: '#2AEAEA' } },
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.rank,
                        isBottom: true,
                        isPercent: false,
                        value: 6,
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
                });
            });
        });
        // describe('Test timePeriod', () => {
        //     // wait
        // });
        describe('Test dataBar', () => {
            it('dataBar', () => {
                const params: IConditionFormattingRule<IDataBar> = {
                    ranges: [{ startRow: 0, startColumn: 0, endRow: 5, endColumn: 6 }],
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
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
                    const one = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                    const two = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
                    const three = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 2);
                    const four = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 3);
                    const five = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 4);
                    expect(one).toEqual(EMPTY_STYLE);
                    expect(two).toEqual({
                        dataBar: {
                            color: '#abd91a',
                            startPoint: 0,
                            value: 0,
                            isGradient: true,
                            isShowValue: true,
                        },
                        isShowValue: true,
                    });
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
                });
            });
        });
        describe('Test colorScale', () => {
            it('colorScale', () => {
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
                        },
                        {
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
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
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
                        },
                        {
                            index: 1,
                            color: '#2e55ef',
                            value: {
                                type: CFValueType.num,
                                value: -5,
                            },
                        },
                        {
                            index: 2,
                            color: 'rgb(231, 37, 143)',
                            value: {
                                type: CFValueType.num,
                                value: 3,
                            },
                        },
                        ],
                    },
                };
                testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
                const dispose = testBed.getConditionalFormattingService().ruleComputeStatus$.subscribe(() => {
                    dispose.unsubscribe();
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
        });
    });
});
