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
            between: 'medzi',
            greaterThan: 'väčšie ako',
            greaterThanOrEqual: 'väčšie alebo rovné',
            lessThan: 'menšie ako',
            lessThanOrEqual: 'menšie alebo rovné',
            equal: 'rovné',
            notEqual: 'nerovné',
            notBetween: 'nie medzi',
        },
        ruleName: {
            between: 'Je medzi {FORMULA1} a {FORMULA2}',
            greaterThan: 'Je väčšie ako {FORMULA1}',
            greaterThanOrEqual: 'Je väčšie alebo rovné {FORMULA1}',
            lessThan: 'Je menšie ako {FORMULA1}',
            lessThanOrEqual: 'Je menšie alebo rovné {FORMULA1}',
            equal: 'Je rovné {FORMULA1}',
            notEqual: 'Nie je rovné {FORMULA1}',
            notBetween: 'Nie je medzi {FORMULA1} a {FORMULA2}',
            legal: 'Je platný {TYPE}',
        },
        errorMsg: {
            between: 'Hodnota musí byť medzi {FORMULA1} a {FORMULA2}',
            greaterThan: 'Hodnota musí byť väčšia ako {FORMULA1}',
            greaterThanOrEqual: 'Hodnota musí byť väčšia alebo rovná {FORMULA1}',
            lessThan: 'Hodnota musí byť menšia ako {FORMULA1}',
            lessThanOrEqual: 'Hodnota musí byť menšia alebo rovná {FORMULA1}',
            equal: 'Hodnota musí byť rovná {FORMULA1}',
            notEqual: 'Hodnota nesmie byť rovná {FORMULA1}',
            notBetween: 'Hodnota nesmie byť medzi {FORMULA1} a {FORMULA2}',
            legal: 'Hodnota musí byť platný {TYPE}',
        },
    },
};

export default locale;
