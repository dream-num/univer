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

export const enUS = {
    dataValidation: {
        title: '',
        operators: {
            between: 'is between {FORMULA1} and {FORMULA2}',
            greaterThan: 'is greater than {FORMULA1}',
            greaterThanOrEqual: 'is greater than or equal to {FORMULA1}',
            lessThan: 'is less than {FORMULA1}',
            lessThanOrEqual: 'is less than or equal to {FORMULA1}',
            equal: 'is equal to {FORMULA1}',
            notEqual: 'is not equal to {FORMULA1}',
            notBetween: 'is not between {FORMULA1} and {FORMULA2}',
        },
        date: {
            title: 'Date',
            operators: {
                between: 'is between {FORMULA1} and {FORMULA2}',
                greaterThan: 'is after {FORMULA1}',
                greaterThanOrEqual: 'is on or after {FORMULA1}',
                lessThan: 'is before {FORMULA1}',
                lessThanOrEqual: 'is on or before {FORMULA1}',
                equal: 'is {FORMULA1}',
                notEqual: 'is not {FORMULA1}',
                notBetween: 'is not between {FORMULA1}',
            },
        },
        list: {
            title: 'Dropdown',
            name: 'Value contains one from range',
            error: 'Input must fall within specified range',
            emptyError: 'Please enter a value',
        },
        textLength: {
            title: 'Text length',
        },
        number: {
            title: 'number',
        },
    },
};
