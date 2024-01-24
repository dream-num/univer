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

export enum TextOperator {
    beginsWith = 'beginsWith',
    endWith = 'endWith',
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
}

export enum ValueType {
    num = 'num',
    min = 'min',
    max = 'max',
    percent = 'percent',
    percentile = 'percentile',
    auto = 'auto',
    formula = 'formula',
}
