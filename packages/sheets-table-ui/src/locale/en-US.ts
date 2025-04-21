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

const locale = {
    'sheets-table': {
        title: 'Table',
        selectRange: 'Select Table Range',
        rename: 'Rename Table',
        updateRange: 'Update Table Range',
        tableRangeWithMergeError: 'Table range cannot overlap with merged cells',
        tableRangeWithOtherTableError: 'Table range cannot overlap with other tables',
        tableRangeSingleRowError: 'Table range cannot be a single row',
        updateError: 'Cannot set table range to an area that does not overlap with the original and is not in the same row',
        tableStyle: 'Table Style',
        defaultStyle: 'Default Style',
        customStyle: 'Custom Style',
        customTooMore: 'The number of custom themes exceeds the maximum limit, please delete some unnecessary themes and add them again',
        setTheme: 'Set Table Theme',
        removeTable: 'Remove Table',
        cancel: 'Cancel',
        confirm: 'Confirm',
        header: 'Header',
        footer: 'Footer',
        firstLine: 'First Line',
        secondLine: 'Second Line',
        columnPrefix: 'Column',
        tablePrefix: 'Table',

        insert: {
            main: 'Insert Table',
            row: 'Insert Table Row',
            col: 'Insert Table Column',
        },

        remove: {
            main: 'Remove Table',
            row: 'Remove Table Row',
            col: 'Remove Table Column',
        },
        condition: {
            string: 'Text',
            number: 'Number',
            date: 'Date',

            empty: '(Empty)',
        },
        string: {
            compare: {
                equal: 'Equal to',
                notEqual: 'Not equal to',
                contains: 'Contains',
                notContains: 'Does not contain',
                startsWith: 'Starts with',
                endsWith: 'Ends with',
            },
        },
        number: {
            compare: {
                equal: 'Equal to',
                notEqual: 'Not equal to',
                greaterThan: 'Greater than',
                greaterThanOrEqual: 'Greater than or equal to',
                lessThan: 'Less than',
                lessThanOrEqual: 'Less than or equal to',
                between: 'Between',
                notBetween: 'Not between',
                above: 'Above',
                below: 'Below',
                topN: 'Top {0}',
            },
        },
        date: {
            compare: {
                equal: 'Equal to',
                notEqual: 'Not equal to',
                after: 'After',
                afterOrEqual: 'After or equal to',
                before: 'Before',
                beforeOrEqual: 'Before or equal to',
                between: 'Between',
                notBetween: 'Not between',
                today: 'Today',
                yesterday: 'Yesterday',
                tomorrow: 'Tomorrow',
                thisWeek: 'This week',
                lastWeek: 'Last week',
                nextWeek: 'Next week',
                thisMonth: 'This month',
                lastMonth: 'Last month',
                nextMonth: 'Next month',
                thisQuarter: 'This quarter',
                lastQuarter: 'Last quarter',
                nextQuarter: 'Next quarter',
                thisYear: 'This year',
                nextYear: 'Next year',
                lastYear: 'Last year',
                quarter: 'By quarter',
                month: 'By month',
                q1: 'First quarter',
                q2: 'Second quarter',
                q3: 'Third quarter',
                q4: 'Fourth quarter',
                m1: 'January',
                m2: 'February',
                m3: 'March',
                m4: 'April',
                m5: 'May',
                m6: 'June',
                m7: 'July',
                m8: 'August',
                m9: 'September',
                m10: 'October',
                m11: 'November',
                m12: 'December',
            },
        },
    },
};

export default locale;
