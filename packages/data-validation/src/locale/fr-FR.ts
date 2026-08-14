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
            greaterThan: 'supérieur à',
            greaterThanOrEqual: 'supérieur ou égal à',
            lessThan: 'inférieur à',
            lessThanOrEqual: 'inférieur ou égal à',
            equal: 'égal à',
            notEqual: 'différent de',
            notBetween: 'pas entre',
        },
        ruleName: {
            between: 'est entre {FORMULA1} et {FORMULA2}',
            greaterThan: 'est supérieur à {FORMULA1}',
            greaterThanOrEqual: 'est supérieur ou égal à {FORMULA1}',
            lessThan: 'est inférieur à {FORMULA1}',
            lessThanOrEqual: 'est inférieur ou égal à {FORMULA1}',
            equal: 'est égal à {FORMULA1}',
            notEqual: 'est différent de {FORMULA1}',
            notBetween: 'n\'est pas entre {FORMULA1} et {FORMULA2}',
            legal: 'est un {TYPE} légal',
        },
        errorMsg: {
            between: 'La valeur doit être entre {FORMULA1} et {FORMULA2}',
            greaterThan: 'La valeur doit être supérieure à {FORMULA1}',
            greaterThanOrEqual: 'La valeur doit être supérieure ou égale à {FORMULA1}',
            lessThan: 'La valeur doit être inférieure à {FORMULA1}',
            lessThanOrEqual: 'La valeur doit être inférieure ou égale à {FORMULA1}',
            equal: 'La valeur doit être égale à {FORMULA1}',
            notEqual: 'La valeur doit être différente de {FORMULA1}',
            notBetween: 'La valeur ne doit pas être entre {FORMULA1} et {FORMULA2}',
            legal: 'La valeur doit être un {TYPE} légal',
        },
    },
};

export default locale;
