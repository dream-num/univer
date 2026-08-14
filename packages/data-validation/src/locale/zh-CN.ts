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
            between: '介于',
            greaterThan: '大于',
            greaterThanOrEqual: '大于或等于',
            lessThan: '小于',
            lessThanOrEqual: '小于或等于',
            equal: '等于',
            notEqual: '不等于',
            notBetween: '未介于',
        },
        ruleName: {
            between: '介于 {FORMULA1} 和 {FORMULA2} 之间',
            greaterThan: '大于 {FORMULA1}',
            greaterThanOrEqual: '大于或等于 {FORMULA1}',
            lessThan: '小于 {FORMULA1}',
            lessThanOrEqual: '小于或等于 {FORMULA1}',
            equal: '等于 {FORMULA1}',
            notEqual: '不等于 {FORMULA1}',
            notBetween: '在 {FORMULA1} 和 {FORMULA2} 范围之外',
            legal: '是一个合法的 {TYPE}',
        },
        errorMsg: {
            between: '值必须介于 {FORMULA1} 和 {FORMULA2} 之间',
            greaterThan: '值必须大于 {FORMULA1}',
            greaterThanOrEqual: '值必须大于或等于 {FORMULA1}',
            lessThan: '值必须小于 {FORMULA1}',
            lessThanOrEqual: '值必须小于或等于 {FORMULA1}',
            equal: '值必须等于 {FORMULA1}',
            notEqual: '值必须不等于 {FORMULA1}',
            notBetween: '值必须在 {FORMULA1} 和 {FORMULA2} 范围之外',
            legal: '值必须是一个合法的 {TYPE}',
        },
    },
};

export default locale;
