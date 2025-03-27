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

import type { IConditionFormattingRule, ITextHighlightCell } from '../models/type';

export const SHEET_CONDITIONAL_FORMATTING_PLUGIN = 'SHEET_CONDITIONAL_FORMATTING_PLUGIN';
export enum CFTextOperator {
    beginsWith = 'beginsWith',
    endsWith = 'endsWith',
    containsText = 'containsText',
    notContainsText = 'notContainsText',
    equal = 'equal',
    notEqual = 'notEqual',
    containsBlanks = 'containsBlanks',
    notContainsBlanks = 'notContainsBlanks',
    containsErrors = 'containsErrors',
    notContainsErrors = 'notContainsErrors',
}
export enum CFTimePeriodOperator {
    today = 'today',
    yesterday = 'yesterday',
    tomorrow = 'tomorrow',
    last7Days = 'last7Days',
    thisMonth = 'thisMonth',
    lastMonth = 'lastMonth',
    nextMonth = 'nextMonth',
    thisWeek = 'thisWeek',
    lastWeek = 'lastWeek',
    nextWeek = 'nextWeek',
}
export enum CFNumberOperator {
    greaterThan = 'greaterThan',
    greaterThanOrEqual = 'greaterThanOrEqual',
    lessThan = 'lessThan',
    lessThanOrEqual = 'lessThanOrEqual',
    notBetween = 'notBetween',
    between = 'between',
    equal = 'equal',
    notEqual = 'notEqual',
}

export enum CFRuleType {
    highlightCell = 'highlightCell',
    dataBar = 'dataBar',
    colorScale = 'colorScale',
    iconSet = 'iconSet',
}
export enum CFSubRuleType {
    uniqueValues = 'uniqueValues',
    duplicateValues = 'duplicateValues',
    rank = 'rank',
    text = 'text',
    timePeriod = 'timePeriod',
    number = 'number',
    average = 'average',
    formula = 'formula',

}

export enum CFValueType {
    num = 'num',
    min = 'min',
    max = 'max',
    percent = 'percent',

    percentile = 'percentile',

    formula = 'formula',
}

export const DEFAULT_BG_COLOR = '#fff';
export const DEFAULT_FONT_COLOR = '#000000';

export const createDefaultRule = () => ({
    cfId: undefined as unknown as string,
    ranges: [],
    stopIfTrue: false,
    rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.text, operator: CFTextOperator.containsText } as ITextHighlightCell,
} as IConditionFormattingRule);

export const createDefaultValue = (subType: CFSubRuleType, operator: CFTextOperator | CFNumberOperator | CFTimePeriodOperator) => {
    switch (subType) {
        case CFSubRuleType.text:{
            if ([CFTextOperator.beginsWith, CFTextOperator.containsText, CFTextOperator.endsWith, CFTextOperator.equal, CFTextOperator.notContainsText, CFTextOperator.notEqual].includes(operator as CFTextOperator)) {
                return '';
            }
            break;
        }
        case CFSubRuleType.number:{
            if ([CFNumberOperator.between, CFNumberOperator.notBetween].includes(operator as CFNumberOperator)) {
                return [10, 100] as [number, number];
            }
            return 10;
        }
    }
    return '';
};

export const createDefaultValueByValueType = (type: CFValueType, defaultValue?: number) => {
    switch (type) {
        case CFValueType.formula:{
            return '=';
        }
        case CFValueType.max:
        case CFValueType.min:{
            return '';
        }
        case CFValueType.percent:
        case CFValueType.percentile:
        case CFValueType.num:{
            return defaultValue !== undefined ? defaultValue : 10;
        }
    }
    return '';
};
