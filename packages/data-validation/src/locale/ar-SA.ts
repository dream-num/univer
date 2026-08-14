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
            between: 'بين',
            greaterThan: 'أكبر من',
            greaterThanOrEqual: 'أكبر من أو يساوي',
            lessThan: 'أقل من',
            lessThanOrEqual: 'أقل من أو يساوي',
            equal: 'يساوي',
            notEqual: 'لا يساوي',
            notBetween: 'ليس بين',
        },
        ruleName: {
            between: 'بين {FORMULA1} و{FORMULA2}',
            greaterThan: 'أكبر من {FORMULA1}',
            greaterThanOrEqual: 'أكبر من أو يساوي {FORMULA1}',
            lessThan: 'أقل من {FORMULA1}',
            lessThanOrEqual: 'أقل من أو يساوي {FORMULA1}',
            equal: 'يساوي {FORMULA1}',
            notEqual: 'لا يساوي {FORMULA1}',
            notBetween: 'ليس بين {FORMULA1} و{FORMULA2}',
            legal: 'نوع قانوني {TYPE}',
        },
        errorMsg: {
            between: 'يجب أن تكون القيمة بين {FORMULA1} و{FORMULA2}',
            greaterThan: 'يجب أن تكون القيمة أكبر من {FORMULA1}',
            greaterThanOrEqual: 'يجب أن تكون القيمة أكبر من أو تساوي {FORMULA1}',
            lessThan: 'يجب أن تكون القيمة أقل من {FORMULA1}',
            lessThanOrEqual: 'يجب أن تكون القيمة أقل من أو تساوي {FORMULA1}',
            equal: 'يجب أن تكون القيمة تساوي {FORMULA1}',
            notEqual: 'يجب ألا تكون القيمة تساوي {FORMULA1}',
            notBetween: 'يجب ألا تكون القيمة بين {FORMULA1} و{FORMULA2}',
            legal: 'يجب أن تكون القيمة من نوع قانوني {TYPE}',
        },
    },
};

export default locale;
