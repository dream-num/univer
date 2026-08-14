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

import type enUS from './en-US';

const locale: typeof enUS = {
    'data-validation': {
        operators: {
            between: 'między',
            greaterThan: 'większe niż',
            greaterThanOrEqual: 'większe lub równe',
            lessThan: 'mniejsze niż',
            lessThanOrEqual: 'mniejsze lub równe',
            equal: 'równe',
            notEqual: 'różne od',
            notBetween: 'nie między',
        },
        ruleName: {
            between: 'Jest między {FORMULA1} a {FORMULA2}',
            greaterThan: 'Jest większe niż {FORMULA1}',
            greaterThanOrEqual: 'Jest większe lub równe {FORMULA1}',
            lessThan: 'Jest mniejsze niż {FORMULA1}',
            lessThanOrEqual: 'Jest mniejsze lub równe {FORMULA1}',
            equal: 'Jest równe {FORMULA1}',
            notEqual: 'Jest różne od {FORMULA1}',
            notBetween: 'Nie jest między {FORMULA1} a {FORMULA2}',
            legal: 'Jest prawidłowym {TYPE}',
        },
        errorMsg: {
            between: 'Wartość musi być między {FORMULA1} a {FORMULA2}',
            greaterThan: 'Wartość musi być większa niż {FORMULA1}',
            greaterThanOrEqual: 'Wartość musi być większa lub równa {FORMULA1}',
            lessThan: 'Wartość musi być mniejsza niż {FORMULA1}',
            lessThanOrEqual: 'Wartość musi być mniejsza lub równa {FORMULA1}',
            equal: 'Wartość musi być równa {FORMULA1}',
            notEqual: 'Wartość musi być różna od {FORMULA1}',
            notBetween: 'Wartość nie może być między {FORMULA1} a {FORMULA2}',
            legal: 'Wartość musi być prawidłowym {TYPE}',
        },
    },
};

export default locale;
