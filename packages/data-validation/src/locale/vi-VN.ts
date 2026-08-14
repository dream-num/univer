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
            between: 'Giữa',
            greaterThan: 'Lớn hơn',
            greaterThanOrEqual: 'Lớn hơn hoặc bằng',
            lessThan: 'Nhỏ hơn',
            lessThanOrEqual: 'Nhỏ hơn hoặc bằng',
            equal: 'Bằng',
            notEqual: 'Không bằng',
            notBetween: 'Không nằm giữa',
        },
        ruleName: {
            between: 'Giữa {FORMULA1} và {FORMULA2}',
            greaterThan: 'Lớn hơn {FORMULA1}',
            greaterThanOrEqual: 'Lớn hơn hoặc bằng {FORMULA1}',
            lessThan: 'Nhỏ hơn {FORMULA1}',
            lessThanOrEqual: 'Nhỏ hơn hoặc bằng {FORMULA1}',
            equal: 'Bằng {FORMULA1}',
            notEqual: 'Không bằng {FORMULA1}',
            notBetween: 'Không nằm giữa {FORMULA1} và {FORMULA2}',
            legal: 'là một {TYPE} hợp lệ',
        },
        errorMsg: {
            between: 'Giá trị phải nằm giữa {FORMULA1} và {FORMULA2}',
            greaterThan: 'Giá trị phải lớn hơn {FORMULA1}',
            greaterThanOrEqual: 'Giá trị phải lớn hơn hoặc bằng {FORMULA1}',
            lessThan: 'Giá trị phải nhỏ hơn {FORMULA1}',
            lessThanOrEqual: 'Giá trị phải nhỏ hơn hoặc bằng {FORMULA1}',
            equal: 'Giá trị phải bằng {FORMULA1}',
            notEqual: 'Giá trị phải không bằng {FORMULA1}',
            notBetween: 'Giá trị phải không nằm giữa {FORMULA1} và {FORMULA2}',
            legal: 'Giá trị phải là một {TYPE} hợp lệ',
        },
    },
};

export default locale;
