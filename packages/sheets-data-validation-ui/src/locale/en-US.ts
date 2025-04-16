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
    dataValidation: {
        title: 'Data validation',
        validFail: {
            value: 'Please input a value',
            common: 'Please input value or formula',
            number: 'Please input number or formula',
            formula: 'Please input formula',
            integer: 'Please input integer or formula',
            date: 'Please input date or formula',
            list: 'Please input options',
            listInvalid: 'The list source must be a delimited list or a reference to a single row or column',
            checkboxEqual: 'Enter different values for ticked and unticked cell contents.',
            formulaError: 'The reference range contains invisible data, please readjust the range',
            listIntersects: 'The selected range cannot intersect with the scope of the rules',
            primitive: 'Formulas are not permitted for custom ticked and unticked values.',
        },
        panel: {
            title: 'Data validation management',
            addTitle: 'Create new data validation',
            removeAll: 'Remove All',
            add: 'Add Rule',
            range: 'Ranges',
            type: 'Type',
            options: 'Advance options',
            operator: 'Operator',
            removeRule: 'Remove',
            done: 'Done',
            formulaPlaceholder: 'Please input value or formula',
            valuePlaceholder: 'Please input value',
            formulaAnd: 'and',
            invalid: 'Invalid',
            showWarning: 'Show warning',
            rejectInput: 'Reject input',
            messageInfo: 'Helper message',
            showInfo: 'Show help text for a selected cell',
            rangeError: 'Ranges are not legal',
            allowBlank: 'Allow blank values',
        },
        operators: {
            between: 'between',
            greaterThan: 'greater than',
            greaterThanOrEqual: 'greater than or equal',
            lessThan: 'less than',
            lessThanOrEqual: 'less than or equal',
            equal: 'equal',
            notEqual: 'not equal',
            notBetween: 'not between',
            legal: 'is legal type',
        },
        ruleName: {
            between: 'Is between {FORMULA1} and {FORMULA2}',
            greaterThan: 'Is greater than {FORMULA1}',
            greaterThanOrEqual: 'Is greater than or equal to {FORMULA1}',
            lessThan: 'Is less than {FORMULA1}',
            lessThanOrEqual: 'Is less than or equal to {FORMULA1}',
            equal: 'Is equal to {FORMULA1}',
            notEqual: 'Is not equal to {FORMULA1}',
            notBetween: 'Is not between {FORMULA1} and {FORMULA2}',
            legal: 'Is a legal {TYPE}',
        },
        errorMsg: {
            between: 'Value must be between {FORMULA1} and {FORMULA2}',
            greaterThan: 'Value must be greater than {FORMULA1}',
            greaterThanOrEqual: 'Value must be greater than or equal to {FORMULA1}',
            lessThan: 'Value must be less than {FORMULA1}',
            lessThanOrEqual: 'Value must be less than or equal to {FORMULA1}',
            equal: 'Value must be equal to {FORMULA1}',
            notEqual: 'Value must be not equal to {FORMULA1}',
            notBetween: 'Value must be not between {FORMULA1} and {FORMULA2}',
            legal: 'Value must be a legal {TYPE}',
        },
        any: {
            title: 'Any value',
            error: 'The content of this cell violates the validation rule',
        },
        date: {
            title: 'Date',
            operators: {
                between: 'between',
                greaterThan: 'after',
                greaterThanOrEqual: 'on or after',
                lessThan: 'before',
                lessThanOrEqual: 'on or before',
                equal: 'equal',
                notEqual: 'not equal',
                notBetween: 'not between',
                legal: 'is a legal date',
            },
            ruleName: {
                between: 'is between {FORMULA1} and {FORMULA2}',
                greaterThan: 'is after {FORMULA1}',
                greaterThanOrEqual: 'is on or after {FORMULA1}',
                lessThan: 'is before {FORMULA1}',
                lessThanOrEqual: 'is on or before {FORMULA1}',
                equal: 'is {FORMULA1}',
                notEqual: 'is not {FORMULA1}',
                notBetween: 'is not between {FORMULA1}',
                legal: 'is a legal date',
            },
            errorMsg: {
                between: 'Value must be a legal date and between {FORMULA1} and {FORMULA2}',
                greaterThan: 'Value must be a legal date and after {FORMULA1}',
                greaterThanOrEqual: 'Value must be a legal date and on or after {FORMULA1}',
                lessThan: 'Value must be a legal date and before {FORMULA1}',
                lessThanOrEqual: 'Value must be a legal date and on or before {FORMULA1}',
                equal: 'Value must be a legal date and {FORMULA1}',
                notEqual: 'Value must be a legal date and not {FORMULA1}',
                notBetween: 'Value must be a legal date and not between {FORMULA1}',
                legal: 'Value must be a legal date',
            },
        },
        list: {
            title: 'Dropdown',
            name: 'Value contains one from range',
            error: 'Input must fall within specified range',
            emptyError: 'Please enter a value',
            add: 'Add',
            dropdown: 'Select',
            options: 'Options',
            customOptions: 'Custom',
            refOptions: 'From a range',
            formulaError: 'The list source must be a delimited list of data, or a reference to a single row or column.',
            edit: 'Edit',
        },
        listMultiple: {
            title: 'Dropdown-Multiple',
            dropdown: 'Multiple select',
        },
        textLength: {
            title: 'Text length',
            errorMsg: {
                between: 'Text length must be between {FORMULA1} and {FORMULA2}',
                greaterThan: 'Text length must be after {FORMULA1}',
                greaterThanOrEqual: 'Text length must be on or after {FORMULA1}',
                lessThan: 'Text length must be before {FORMULA1}',
                lessThanOrEqual: 'Text length must be on or before {FORMULA1}',
                equal: 'Text length must be {FORMULA1}',
                notEqual: 'Text length must be not {FORMULA1}',
                notBetween: 'Text length must be not between {FORMULA1}',
            },
        },
        decimal: {
            title: 'Number',
        },
        whole: {
            title: 'Integer',
        },
        checkbox: {
            title: 'Checkbox',
            error: 'This cell\'s contents violate its validation rule',
            tips: 'Use custom values within cells',
            checked: 'Selected value',
            unchecked: 'Unselected value',
        },
        custom: {
            title: 'Custom formula',
            error: 'This cell\'s contents violate its validation rule',
            validFail: 'Please input a valid formula',
            ruleName: 'Custom formula is {FORMULA1}',
        },
        alert: {
            title: 'Error',
            ok: 'OK',
        },
        error: {
            title: 'Invalid:',
        },
        renderMode: {
            arrow: 'Arrow',
            chip: 'Chip',
            text: 'Plain text',
            label: 'Display style',
        },
        showTime: {
            label: 'Show TimePicker',
        },
    },
};

export default locale;
