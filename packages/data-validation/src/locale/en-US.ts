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
    'data-validation': {
        operators: {
            between: 'between',
            greaterThan: 'greater than',
            greaterThanOrEqual: 'greater than or equal',
            lessThan: 'less than',
            lessThanOrEqual: 'less than or equal',
            equal: 'equal',
            notEqual: 'not equal',
            notBetween: 'not between',
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
    },
};

export default locale;
