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
            between: 'entre',
            greaterThan: 'maior que',
            greaterThanOrEqual: 'maior ou igual',
            lessThan: 'menor que',
            lessThanOrEqual: 'menor ou igual',
            equal: 'igual',
            notEqual: 'diferente',
            notBetween: 'não está entre',
        },
        ruleName: {
            between: 'Está entre {FORMULA1} e {FORMULA2}',
            greaterThan: 'É maior que {FORMULA1}',
            greaterThanOrEqual: 'É maior ou igual a {FORMULA1}',
            lessThan: 'É menor que {FORMULA1}',
            lessThanOrEqual: 'É menor ou igual a {FORMULA1}',
            equal: 'É igual a {FORMULA1}',
            notEqual: 'É diferente de {FORMULA1}',
            notBetween: 'Não está entre {FORMULA1} e {FORMULA2}',
            legal: 'É um {TYPE} válido',
        },
        errorMsg: {
            between: 'O valor deve estar entre {FORMULA1} e {FORMULA2}',
            greaterThan: 'O valor deve ser maior que {FORMULA1}',
            greaterThanOrEqual: 'O valor deve ser maior ou igual a {FORMULA1}',
            lessThan: 'O valor deve ser menor que {FORMULA1}',
            lessThanOrEqual: 'O valor deve ser menor ou igual a {FORMULA1}',
            equal: 'O valor deve ser igual a {FORMULA1}',
            notEqual: 'O valor deve ser diferente de {FORMULA1}',
            notBetween: 'O valor não deve estar entre {FORMULA1} e {FORMULA2}',
            legal: 'O valor deve ser um {TYPE} válido',
        },
    },
};

export default locale;
