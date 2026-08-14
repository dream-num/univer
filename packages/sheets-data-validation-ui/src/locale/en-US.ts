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
        ribbon: {
            setCheckbox: 'Set Checkbox',
            clearCheckbox: 'Clear Checkbox',
            dropdownPresetTitle: 'Apply a preset:',
            editDropdown: 'Edit options',
            clearDropdown: 'Clear Dropdown',
            dateTime: 'Date & Time',
            presets: {
                yes: 'Yes',
                no: 'No',
                notStarted: 'Not Started',
                inProgress: 'In Progress',
                completed: 'Completed',
                option1: 'Option 1',
                option2: 'Option 2',
            },
        },
        operators: {
            legal: 'is legal type',
        },
        validFail: {
            formulaError: 'The reference range contains invisible data, please readjust the range',
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
        date: {
            title: 'Date',
        },
        list: {
            title: 'Dropdown',
            add: 'Add',
            options: 'Options',
            customOptions: 'Custom',
            refOptions: 'From a range',
            edit: 'Edit',
        },
        checkbox: {
            title: 'Checkbox',
            tips: 'Use custom values within cells',
            checked: 'Selected value',
            unchecked: 'Unselected value',
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
