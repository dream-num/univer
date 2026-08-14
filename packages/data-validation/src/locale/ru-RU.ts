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
            between: 'между',
            greaterThan: 'больше чем',
            greaterThanOrEqual: 'больше или равно',
            lessThan: 'меньше чем',
            lessThanOrEqual: 'меньше или равно',
            equal: 'равно',
            notEqual: 'не равно',
            notBetween: 'не между',
        },
        ruleName: {
            between: 'между {FORMULA1} и {FORMULA2}',
            greaterThan: 'больше чем {FORMULA1}',
            greaterThanOrEqual: 'больше или равно {FORMULA1}',
            lessThan: 'меньше чем {FORMULA1}',
            lessThanOrEqual: 'меньше или равно {FORMULA1}',
            equal: 'равно {FORMULA1}',
            notEqual: 'не равно {FORMULA1}',
            notBetween: 'не между {FORMULA1} и {FORMULA2}',
            legal: 'является допустимым {TYPE}',
        },
        errorMsg: {
            between: 'Значение должно быть между {FORMULA1} и {FORMULA2}',
            greaterThan: 'Значение должно быть больше {FORMULA1}',
            greaterThanOrEqual: 'Значение должно быть больше или равно {FORMULA1}',
            lessThan: 'Значение должно быть меньше {FORMULA1}',
            lessThanOrEqual: 'Значение должно быть меньше или равно {FORMULA1}',
            equal: 'Значение должно быть равно {FORMULA1}',
            notEqual: 'Значение должно быть не равно {FORMULA1}',
            notBetween: 'Значение должно быть не между {FORMULA1} и {FORMULA2}',
            legal: 'Значение должно быть допустимым {TYPE}',
        },
    },
};

export default locale;
