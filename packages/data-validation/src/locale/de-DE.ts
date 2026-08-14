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
            between: 'zwischen',
            greaterThan: 'größer als',
            greaterThanOrEqual: 'größer als oder gleich',
            lessThan: 'kleiner als',
            lessThanOrEqual: 'kleiner als oder gleich',
            equal: 'gleich',
            notEqual: 'ungleich',
            notBetween: 'nicht zwischen',
        },
        ruleName: {
            between: 'Ist zwischen {FORMULA1} und {FORMULA2}',
            greaterThan: 'Ist größer als {FORMULA1}',
            greaterThanOrEqual: 'Ist größer als oder gleich {FORMULA1}',
            lessThan: 'Ist kleiner als {FORMULA1}',
            lessThanOrEqual: 'Ist kleiner als oder gleich {FORMULA1}',
            equal: 'Ist gleich {FORMULA1}',
            notEqual: 'Ist ungleich {FORMULA1}',
            notBetween: 'Ist nicht zwischen {FORMULA1} und {FORMULA2}',
            legal: 'Ist ein gültiger {TYPE}',
        },
        errorMsg: {
            between: 'Wert muss zwischen {FORMULA1} und {FORMULA2} liegen',
            greaterThan: 'Wert muss größer als {FORMULA1} sein',
            greaterThanOrEqual: 'Wert muss größer als oder gleich {FORMULA1} sein',
            lessThan: 'Wert muss kleiner als {FORMULA1} sein',
            lessThanOrEqual: 'Wert muss kleiner als oder gleich {FORMULA1} sein',
            equal: 'Wert muss gleich {FORMULA1} sein',
            notEqual: 'Wert muss ungleich {FORMULA1} sein',
            notBetween: 'Wert muss nicht zwischen {FORMULA1} und {FORMULA2} liegen',
            legal: 'Wert muss ein gültiger {TYPE} sein',
        },
    },
};

export default locale;
