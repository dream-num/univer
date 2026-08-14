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
            between: 'بین',
            greaterThan: 'بزرگتر از',
            greaterThanOrEqual: 'بزرگتر از یا برابر با',
            lessThan: 'کوچکتر از',
            lessThanOrEqual: 'کوچکتر از یا برابر با',
            equal: 'برابر با',
            notEqual: 'نابرابر با',
            notBetween: 'بین نیست',
        },
        ruleName: {
            between: 'بین {FORMULA1} و {FORMULA2} است',
            greaterThan: 'بزرگتر از {FORMULA1} است',
            greaterThanOrEqual: 'بزرگتر از یا برابر با {FORMULA1} است',
            lessThan: 'کوچکتر از {FORMULA1} است',
            lessThanOrEqual: 'کوچکتر از یا برابر با {FORMULA1} است',
            equal: 'برابر است با {FORMULA1}',
            notEqual: 'برابر نیست با {FORMULA1}',
            notBetween: 'بین {FORMULA1} و {FORMULA2} نیست',
            legal: 'یک {TYPE} قانونی است',
        },
        errorMsg: {
            between: 'مقدار باید بین {FORMULA1} و {FORMULA2} باشد',
            greaterThan: 'مقدار باید بزرگتر از {FORMULA1} باشد',
            greaterThanOrEqual: 'مقدار باید بزرگتر از یا برابر با {FORMULA1} باشد',
            lessThan: 'مقدار باید کوچکتر از {FORMULA1} باشد',
            lessThanOrEqual: 'مقدار باید کوچکتر از یا برابر با {FORMULA1} باشد',
            equal: 'مقدار باید برابر با {FORMULA1} باشد',
            notEqual: 'مقدار باید برابر نیست با {FORMULA1}',
            notBetween: 'مقدار باید بین {FORMULA1} و {FORMULA2} نباشد',
            legal: 'مقدار باید یک {TYPE} قانونی باشد',
        },
    },
};

export default locale;
