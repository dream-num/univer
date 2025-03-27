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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    sheet: {
        cf: {
            title: 'Conditional Formatting',
            menu: {
                manageConditionalFormatting: 'Manage Conditional Formatting',
                createConditionalFormatting: 'Create Conditional Formatting',
                clearRangeRules: 'Clear Rules for Selected Range',
                clearWorkSheetRules: 'Clear Rules for Entire Sheet',

            },
            form: {
                lessThan: 'The value must be less than {0}',
                lessThanOrEqual: 'The value must be less than or equal to {0}',
                greaterThan: 'The value must be greater than {0}',
                greaterThanOrEqual: 'The value must be greater than or equal to {0}',
                rangeSelector: 'Select Range or Enter Value',
            },
            iconSet: {
                direction: 'Direction',
                shape: 'Shape',
                mark: 'Mark',
                rank: 'Rank',
                rule: 'Rule',
                icon: 'Icon',
                type: 'Type',
                value: 'Value',
                reverseIconOrder: 'Reverse Icon Order',
                and: 'And',
                when: 'When',
                onlyShowIcon: 'Only Show Icon',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: 'Create Rule',
                clear: 'Clear All Rules',
                range: 'Apply Range',
                styleType: 'Style Type',
                submit: 'Submit',
                cancel: 'Cancel',
                rankAndAverage: 'Top/Bottom/Average',
                styleRule: 'Style Rule',
                isNotBottom: 'Top',
                isBottom: 'Bottom',
                greaterThanAverage: 'Greater Than Average',
                lessThanAverage: 'Less Than Average',
                medianValue: 'Median Value',
                fillType: 'Fill Type',
                pureColor: 'Solid Color',
                gradient: 'Gradient',
                colorSet: 'Color Set',
                positive: 'Positive',
                native: 'Negative',
                workSheet: 'Entire Sheet',
                selectedRange: 'Selected Range',
                managerRuleSelect: 'Manage {0} Rules',
                onlyShowDataBar: 'Only Show Data Bars',
            },
            preview: {
                describe: {
                    beginsWith: 'Begins with {0}',
                    endsWith: 'Ends with {0}',
                    containsText: 'Text contains {0}',
                    notContainsText: 'Text does not contain {0}',
                    equal: 'Equal to {0}',
                    notEqual: 'Not equal to {0}',
                    containsBlanks: 'Contains Blanks',
                    notContainsBlanks: 'Does not contain Blanks',
                    containsErrors: 'Contains Errors',
                    notContainsErrors: 'Does not contain Errors',
                    greaterThan: 'Greater than {0}',
                    greaterThanOrEqual: 'Greater than or equal to {0}',
                    lessThan: 'Less than {0}',
                    lessThanOrEqual: 'Less than or equal to {0}',
                    notBetween: 'Not between {0} and {1}',
                    between: 'Between {0} and {1}',
                    yesterday: 'Yesterday',
                    tomorrow: 'Tomorrow',
                    last7Days: 'Last 7 Days',
                    thisMonth: 'This Month',
                    lastMonth: 'Last Month',
                    nextMonth: 'Next Month',
                    thisWeek: 'This Week',
                    lastWeek: 'Last Week',
                    nextWeek: 'Next Week',
                    today: 'Today',
                    topN: 'Top {0}',
                    bottomN: 'Bottom {0}',
                    topNPercent: 'Top {0}%',
                    bottomNPercent: 'Bottom {0}%',
                },
            },
            operator: {
                beginsWith: 'Begins with',
                endsWith: 'Ends with',
                containsText: 'Text contains',
                notContainsText: 'Text does not contain',
                equal: 'Equal to',
                notEqual: 'Not equal to',
                containsBlanks: 'Contains Blanks',
                notContainsBlanks: 'Does not contain Blanks',
                containsErrors: 'Contains Errors',
                notContainsErrors: 'Does not contain Errors',
                greaterThan: 'Greater than',
                greaterThanOrEqual: 'Greater than or equal to',
                lessThan: 'Less than',
                lessThanOrEqual: 'Less than or equal to',
                notBetween: 'Not between',
                between: 'Between',
                yesterday: 'Yesterday',
                tomorrow: 'Tomorrow',
                last7Days: 'Last 7 Days',
                thisMonth: 'This Month',
                lastMonth: 'Last Month',
                nextMonth: 'Next Month',
                thisWeek: 'This Week',
                lastWeek: 'Last Week',
                nextWeek: 'Next Week',
                today: 'Today',
            },
            ruleType: {
                highlightCell: 'Highlight Cell',
                dataBar: 'Data Bar',
                colorScale: 'Color Scale',
                formula: 'Custom Formula',
                iconSet: 'Icon Set',
                duplicateValues: 'Duplicate Values',
                uniqueValues: 'Unique Values',
            },
            subRuleType: {
                uniqueValues: 'Unique Values',
                duplicateValues: 'Duplicate Values',
                rank: 'Rank',
                text: 'Text',
                timePeriod: 'Time Period',
                number: 'Number',
                average: 'Average',
            },
            valueType: {
                num: 'Number',
                min: 'Minimum',
                max: 'Maximum',
                percent: 'Percentage',
                percentile: 'Percentile',
                formula: 'Formula',
                none: 'None',
            },
            errorMessage: {
                notBlank: 'Condition can not be empty',
                formulaError: 'Wrong formula',
                rangeError: 'Bad selection',
            },
        },
    },
};

export default locale;
