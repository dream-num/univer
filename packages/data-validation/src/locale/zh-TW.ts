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
            between: '介於',
            greaterThan: '大於',
            greaterThanOrEqual: '大於或等於',
            lessThan: '小於',
            lessThanOrEqual: '小於或等於',
            equal: '等於',
            notEqual: '不等於',
            notBetween: '未介於',
        },
        ruleName: {
            between: '介於 {FORMULA1} 和 {FORMULA2} 之間',
            greaterThan: '大於 {FORMULA1}',
            greaterThanOrEqual: '大於或等於 {FORMULA1}',
            lessThan: '小於 {FORMULA1}',
            lessThanOrEqual: '小於或等於 {FORMULA1}',
            equal: '等於 {FORMULA1}',
            notEqual: '不等於 {FORMULA1}',
            notBetween: '在 {FORMULA1} 和 {FORMULA2} 範圍之外',
            legal: '是一個合法的 {TYPE}',
        },
        errorMsg: {
            between: '值必須介於 {FORMULA1} 和 {FORMULA2} 之間',
            greaterThan: '值必須大於 {FORMULA1}',
            greaterThanOrEqual: '值必須大於或等於 {FORMULA1}',
            lessThan: '值必須小於 {FORMULA1}',
            lessThanOrEqual: '值必須小於或等於 {FORMULA1}',
            equal: '值必須等於 {FORMULA1}',
            notEqual: '值必須不等於 {FORMULA1}',
            notBetween: '值必須在 {FORMULA1} 和 {FORMULA2} 範圍之外',
            legal: '值必須是一個合法的 {TYPE}',
        },
    },
};

export default locale;
