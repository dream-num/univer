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
    'sheets-data-validation-ui': {
        title: 'Data validation',
        operators: {
            legal: 'is legal type',
        },
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
        any: {
            title: 'Any value',
            error: 'The content of this cell violates the validation rule',
        },
        date: {
            title: 'Date',
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
        permission: {
            dialog: {
                setStyleErr: 'The range is protected, and you do not have permission to set styles. To set styles, please contact the creator.',
            },
        },
    },
};

export default locale;
