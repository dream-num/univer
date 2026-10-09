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

import type { IConditionalFormattingRuleConfig, IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import {
    CFNumberOperator,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    CFTimePeriodOperator,
    CFValueType,
    IIconSetType,
} from '@univerjs/sheets-conditional-formatting';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../locale/en-US';
import zhCN from '../../locale/zh-CN';
import { getRuleDescribe } from '../get-rule-describe';

describe('getRuleDescribe', () => {
    let injector: Injector;

    beforeEach(() => {
        injector = new Injector([[LocaleService]]);
    });

    afterEach(() => {
        injector.dispose();
    });

    it('preserves zero and translates using the current locale on each call', () => {
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const rule: IConditionFormattingRule = {
            cfId: 'zero-rule',
            ranges: [],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.number,
                operator: CFNumberOperator.greaterThan,
                value: 0,
                style: {},
            },
        };

        const englishDescription = getRuleDescribe(rule, localeService);
        localeService.setLocale(LocaleType.ZH_CN);

        expect([englishDescription, getRuleDescribe(rule, localeService)]).toEqual(['Greater than 0', '大于0']);
    });

    it.each<{ rule: IConditionalFormattingRuleConfig; expected: string }>([
        {
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.number,
                operator: CFNumberOperator.between,
                value: [-10, 0],
                style: {},
            },
            expected: 'Between -10 and 0',
        },
        {
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.number,
                operator: CFNumberOperator.notBetween,
                value: [0, 10],
                style: {},
            },
            expected: 'Not between 0 and 10',
        },
        {
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.containsText,
                value: 'North & South',
                style: {},
            },
            expected: 'Text contains North & South',
        },
        {
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.average,
                operator: CFNumberOperator.greaterThanOrEqual,
                style: {},
            },
            expected: 'Greater than or equal to Average',
        },
        {
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.timePeriod,
                operator: CFTimePeriodOperator.thisWeek,
                style: {},
            },
            expected: 'This Week',
        },
        {
            rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.uniqueValues, style: {} },
            expected: 'Unique Values',
        },
        {
            rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.duplicateValues, style: {} },
            expected: 'Duplicate Values',
        },
        {
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.formula,
                value: '=A1>0',
                style: {},
            },
            expected: 'Custom Formula',
        },
        {
            rule: {
                type: CFRuleType.dataBar,
                isShowValue: true,
                config: {
                    min: { type: CFValueType.min },
                    max: { type: CFValueType.max },
                    isGradient: false,
                    positiveColor: '#00ff00',
                    nativeColor: '#ff0000',
                },
            },
            expected: 'Data Bar',
        },
        {
            rule: {
                type: CFRuleType.colorScale,
                config: [
                    { index: 0, color: '#000000', value: { type: CFValueType.min } },
                    { index: 1, color: '#ffffff', value: { type: CFValueType.max } },
                ],
            },
            expected: 'Color Scale',
        },
        {
            rule: {
                type: CFRuleType.iconSet,
                isShowValue: true,
                config: [{
                    operator: CFNumberOperator.greaterThanOrEqual,
                    value: { type: CFValueType.num, value: 0 },
                    iconType: IIconSetType.threeArrows,
                    iconId: '0',
                }],
            },
            expected: 'Icon Set',
        },
    ])('describes a rule as "$expected"', ({ rule, expected }) => {
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');

        expect(getRuleDescribe({ cfId: 'rule', ranges: [], stopIfTrue: false, rule }, localeService)).toBe(expected);
    });

    it.each([
        { isBottom: false, isPercent: false, expected: 'Top 10' },
        { isBottom: true, isPercent: false, expected: 'Bottom 10' },
        { isBottom: false, isPercent: true, expected: 'Top 10%' },
        { isBottom: true, isPercent: true, expected: 'Bottom 10%' },
    ])('distinguishes the ranking rule "$expected"', ({ isBottom, isPercent, expected }) => {
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const rule: IConditionFormattingRule = {
            cfId: 'rank-rule',
            ranges: [],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.rank,
                isBottom,
                isPercent,
                value: 10,
                style: {},
            },
        };

        expect(getRuleDescribe(rule, localeService)).toBe(expected);
    });
});
