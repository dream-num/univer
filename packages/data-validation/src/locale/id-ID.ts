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
            between: 'antara',
            greaterThan: 'lebih besar dari',
            greaterThanOrEqual: 'lebih besar dari atau sama dengan',
            lessThan: 'lebih kecil dari',
            lessThanOrEqual: 'lebih kecil dari atau sama dengan',
            equal: 'sama dengan',
            notEqual: 'tidak sama dengan',
            notBetween: 'tidak antara',
        },
        ruleName: {
            between: 'Di antara {FORMULA1} dan {FORMULA2}',
            greaterThan: 'Lebih besar dari {FORMULA1}',
            greaterThanOrEqual: 'Lebih besar dari atau sama dengan {FORMULA1}',
            lessThan: 'Lebih kecil dari {FORMULA1}',
            lessThanOrEqual: 'Lebih kecil dari atau sama dengan {FORMULA1}',
            equal: 'Sama dengan {FORMULA1}',
            notEqual: 'Tidak sama dengan {FORMULA1}',
            notBetween: 'Tidak di antara {FORMULA1} dan {FORMULA2}',
            legal: 'Adalah {TYPE} yang valid',
        },
        errorMsg: {
            between: 'Nilai harus di antara {FORMULA1} dan {FORMULA2}',
            greaterThan: 'Nilai harus lebih besar dari {FORMULA1}',
            greaterThanOrEqual: 'Nilai harus lebih besar dari atau sama dengan {FORMULA1}',
            lessThan: 'Nilai harus lebih kecil dari {FORMULA1}',
            lessThanOrEqual: 'Nilai harus lebih kecil dari atau sama dengan {FORMULA1}',
            equal: 'Nilai harus sama dengan {FORMULA1}',
            notEqual: 'Nilai harus tidak sama dengan {FORMULA1}',
            notBetween: 'Nilai harus tidak di antara {FORMULA1} dan {FORMULA2}',
            legal: 'Nilai harus merupakan {TYPE} yang valid',
        },
    },
};

export default locale;
