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
            between: 'tra',
            greaterThan: 'maggiore di',
            greaterThanOrEqual: 'maggiore o uguale a',
            lessThan: 'minore di',
            lessThanOrEqual: 'minore o uguale a',
            equal: 'uguale a',
            notEqual: 'diverso da',
            notBetween: 'non tra',
        },
        ruleName: {
            between: 'È tra {FORMULA1} e {FORMULA2}',
            greaterThan: 'È maggiore di {FORMULA1}',
            greaterThanOrEqual: 'È maggiore o uguale a {FORMULA1}',
            lessThan: 'È minore di {FORMULA1}',
            lessThanOrEqual: 'È minore o uguale a {FORMULA1}',
            equal: 'È uguale a {FORMULA1}',
            notEqual: 'È diverso da {FORMULA1}',
            notBetween: 'Non è tra {FORMULA1} e {FORMULA2}',
            legal: 'È un {TYPE} valido',
        },
        errorMsg: {
            between: 'Il valore deve essere tra {FORMULA1} e {FORMULA2}',
            greaterThan: 'Il valore deve essere maggiore di {FORMULA1}',
            greaterThanOrEqual: 'Il valore deve essere maggiore o uguale a {FORMULA1}',
            lessThan: 'Il valore deve essere minore di {FORMULA1}',
            lessThanOrEqual: 'Il valore deve essere minore o uguale a {FORMULA1}',
            equal: 'Il valore deve essere uguale a {FORMULA1}',
            notEqual: 'Il valore deve essere diverso da {FORMULA1}',
            notBetween: 'Il valore non deve essere tra {FORMULA1} e {FORMULA2}',
            legal: 'Il valore deve essere un {TYPE} valido',
        },
    },
};

export default locale;
