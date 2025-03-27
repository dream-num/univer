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

import type { IAverageHighlightCell, IConditionFormattingRule, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell } from '../../../models/type';
import { beforeEach, describe, expect, it } from 'vitest';
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator } from '../../../base/const';
import { createTestBed } from './test.util';

describe('Test conditional formatting highlight', () => {
    let testBed: ReturnType<typeof createTestBed>;

    beforeEach(() => {
        testBed && testBed.univer.dispose();
        testBed = createTestBed();
        testBed.getConditionalFormattingViewModel();
    });

    describe('Test Number', async () => {
        it('Is CFNumberOperator.between', async () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });

        it('Is not CFNumberOperator.between', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
        it('Is CFNumberOperator.equal', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('Is not CFNumberOperator.equal', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 2);
            expect(result).toEqual({ style: {} });
        });
        it('Is CFNumberOperator.greaterThan', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('Is not CFNumberOperator.greaterThan', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
        it('Is CFNumberOperator.greaterThanOrEqual', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('Is not CFNumberOperator.greaterThanOrEqual', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
        it('Is CFNumberOperator.lessThan', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('Is not CFNumberOperator.lessThanOrEqual', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
        it('Is CFNumberOperator.notBetween', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('Is not CFNumberOperator.notBetween', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
        it('Is CFNumberOperator.notEqual', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('Is not CFNumberOperator.notEqual', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
    });
    describe('Test Text', () => {
        it('is CFTextOperator.beginsWith', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('is not CFTextOperator.beginsWith', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });

        it('is CFTextOperator.endsWith', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('is not CFTextOperator.endsWith', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });

        it('is CFTextOperator.containsText', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('is not CFTextOperator.containsText', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
        it('is CFTextOperator.equal', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('is not CFTextOperator.equal', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
        it('is CFTextOperator.notEqual', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('is not CFTextOperator.notEqual', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
        });
        it('is CFTextOperator.notContainsText', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });
        it('is not CFTextOperator.notContainsText', () => {
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: {} });
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 0);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
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
            const result = testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 1, 1);
            expect(result).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
        });

        it('is bottom 22%', () => {
            const params: IConditionFormattingRule<IRankHighlightCell> = {
                ranges: [{ startRow: 0, startColumn: 0, endRow: 0, endColumn: 8 }],
                cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                stopIfTrue: false,
                rule: {
                    style: { bg: { rgb: '#2AEAEA' } },
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.rank,
                    isBottom: true,
                    isPercent: true,
                    value: 22,
                },
            };
            testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
            const results = [
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 0),
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 1),
            ];
            expect(results[0]).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
            expect(results[1]).toEqual({ style: {} });
        });

        it('is bottom 23%', () => {
            const params: IConditionFormattingRule<IRankHighlightCell> = {
                ranges: [{ startRow: 0, startColumn: 0, endRow: 0, endColumn: 8 }],
                cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                stopIfTrue: false,
                rule: {
                    style: { bg: { rgb: '#2AEAEA' } },
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.rank,
                    isBottom: true,
                    isPercent: true,
                    value: 23,
                },
            };
            testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
            const results = [
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 0),
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 1),
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 0, 2),
            ];
            expect(results[0]).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
            expect(results[1]).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
            expect(results[2]).toEqual({ style: {} });
        });

        // In this case, 2 items should be highlighted. Where the second item is exactly 20%.
        it('is bottom 20%', () => {
            const params: IConditionFormattingRule<IRankHighlightCell> = {
                ranges: [{ startRow: 7, startColumn: 0, endRow: 7, endColumn: 9 }],
                cfId: testBed.getConditionalFormattingRuleModel().createCfId(testBed.unitId, testBed.subUnitId),
                stopIfTrue: false,
                rule: {
                    style: { bg: { rgb: '#2AEAEA' } },
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.rank,
                    isBottom: true,
                    isPercent: true,
                    value: 20,
                },
            };
            testBed.getConditionalFormattingRuleModel().addRule(testBed.unitId, testBed.subUnitId, params);
            const results = [
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 7, 0),
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 7, 1),
                testBed.getConditionalFormattingService().composeStyle(testBed.unitId, testBed.subUnitId, 7, 2),
            ];
            expect(results[0]).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
            expect(results[1]).toEqual({ style: { bg: { rgb: '#2AEAEA' } } });
            expect(results[2]).toEqual({ style: {} });
        });
    });
});
