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
            between: '사이',
            greaterThan: '초과',
            greaterThanOrEqual: '이상',
            lessThan: '미만',
            lessThanOrEqual: '이하',
            equal: '같음',
            notEqual: '같지 않음',
            notBetween: '사이가 아님',
        },
        ruleName: {
            between: '{FORMULA1}와 {FORMULA2} 사이',
            greaterThan: '{FORMULA1} 초과',
            greaterThanOrEqual: '{FORMULA1} 이상',
            lessThan: '{FORMULA1} 미만',
            lessThanOrEqual: '{FORMULA1} 이하',
            equal: '{FORMULA1}와 같음',
            notEqual: '{FORMULA1}와 다름',
            notBetween: '{FORMULA1}와 {FORMULA2} 사이 아님',
            legal: '유효한 {TYPE} 형식',
        },
        errorMsg: {
            between: '값은 {FORMULA1}와 {FORMULA2} 사이여야 합니다',
            greaterThan: '값은 {FORMULA1} 초과여야 합니다',
            greaterThanOrEqual: '값은 {FORMULA1} 이상이어야 합니다',
            lessThan: '값은 {FORMULA1} 미만이어야 합니다',
            lessThanOrEqual: '값은 {FORMULA1} 이하이어야 합니다',
            equal: '값은 {FORMULA1}와 같아야 합니다',
            notEqual: '값은 {FORMULA1}와 달라야 합니다',
            notBetween: '값은 {FORMULA1}와 {FORMULA2} 사이가 아니어야 합니다',
            legal: '값은 유효한 {TYPE} 형식이어야 합니다',
        },
    },
};

export default locale;
