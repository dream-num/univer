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
            greaterThan: 'més gran que',
            greaterThanOrEqual: 'més gran o igual que',
            lessThan: 'menys que',
            lessThanOrEqual: 'menys o igual que',
            equal: 'igual',
            notEqual: 'no igual',
            notBetween: 'no entre',
        },
        ruleName: {
            between: 'Està entre {FORMULA1} i {FORMULA2}',
            greaterThan: 'És més gran que {FORMULA1}',
            greaterThanOrEqual: 'És més gran o igual que {FORMULA1}',
            lessThan: 'És menys que {FORMULA1}',
            lessThanOrEqual: 'És menys o igual que {FORMULA1}',
            equal: 'És igual a {FORMULA1}',
            notEqual: 'No és igual a {FORMULA1}',
            notBetween: 'No està entre {FORMULA1} i {FORMULA2}',
            legal: 'És un {TYPE} legal',
        },
        errorMsg: {
            between: 'El valor ha d’estar entre {FORMULA1} i {FORMULA2}',
            greaterThan: 'El valor ha de ser més gran que {FORMULA1}',
            greaterThanOrEqual: 'El valor ha de ser més gran o igual que {FORMULA1}',
            lessThan: 'El valor ha de ser menys que {FORMULA1}',
            lessThanOrEqual: 'El valor ha de ser menys o igual que {FORMULA1}',
            equal: 'El valor ha de ser igual a {FORMULA1}',
            notEqual: 'El valor no ha de ser igual a {FORMULA1}',
            notBetween: 'El valor no ha d’estar entre {FORMULA1} i {FORMULA2}',
            legal: 'El valor ha de ser un {TYPE} legal',
        },
    },
};

export default locale;
