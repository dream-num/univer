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

import type { IConditionFormatRule, ITextHighlightCell } from '../models/type';

export const SHEET_CONDITION_FORMAT_PLUGIN = 'SHEET_CONDITION_FORMAT_PLUGIN';
export enum TextOperator {
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
export enum TimePeriodOperator {
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
export enum NumberOperator {
    greaterThan = 'greaterThan',
    greaterThanOrEqual = 'greaterThanOrEqual',
    lessThan = 'lessThan',
    lessThanOrEqual = 'lessThanOrEqual',
    notBetween = 'notBetween',
    between = 'between',
    equal = 'equal',
    notEqual = 'notEqual',
}

export enum RuleType {
    highlightCell = 'highlightCell',
    dataBar = 'dataBar',
    colorScale = 'colorScale',
}
export enum SubRuleType {
    uniqueValues = 'uniqueValues',
    duplicateValues = 'duplicateValues',
    rank = 'rank',
    text = 'text',
    timePeriod = 'timePeriod',
    number = 'number',
    average = 'average',
    formula = 'formula',

}

export enum ValueType {
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
    rule: { type: RuleType.highlightCell, subType: SubRuleType.text, operator: TextOperator.notContainsBlanks } as ITextHighlightCell,
} as IConditionFormatRule);
