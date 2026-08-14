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
            greaterThan: 'mayor que',
            greaterThanOrEqual: 'mayor o igual que',
            lessThan: 'menor que',
            lessThanOrEqual: 'menor o igual que',
            equal: 'igual',
            notEqual: 'no igual',
            notBetween: 'no entre',
        },
        ruleName: {
            between: 'Está entre {FORMULA1} y {FORMULA2}',
            greaterThan: 'Es mayor que {FORMULA1}',
            greaterThanOrEqual: 'Es mayor o igual que {FORMULA1}',
            lessThan: 'Es menor que {FORMULA1}',
            lessThanOrEqual: 'Es menor o igual que {FORMULA1}',
            equal: 'Es igual a {FORMULA1}',
            notEqual: 'No es igual a {FORMULA1}',
            notBetween: 'No está entre {FORMULA1} y {FORMULA2}',
            legal: 'Es un {TYPE} legal',
        },
        errorMsg: {
            between: 'El valor debe estar entre {FORMULA1} y {FORMULA2}',
            greaterThan: 'El valor debe ser mayor que {FORMULA1}',
            greaterThanOrEqual: 'El valor debe ser mayor o igual que {FORMULA1}',
            lessThan: 'El valor debe ser menor que {FORMULA1}',
            lessThanOrEqual: 'El valor debe ser menor o igual que {FORMULA1}',
            equal: 'El valor debe ser igual a {FORMULA1}',
            notEqual: 'El valor no debe ser igual a {FORMULA1}',
            notBetween: 'El valor no debe estar entre {FORMULA1} y {FORMULA2}',
            legal: 'El valor debe ser un {TYPE} legal',
        },
    },
};

export default locale;
