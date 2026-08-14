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
            between: '次の値の間',
            greaterThan: '次の値より大きい',
            greaterThanOrEqual: '次の値以上',
            lessThan: '次の値より小さい',
            lessThanOrEqual: '次の値以下',
            equal: '次の値に等しい',
            notEqual: '次の値に等しくない',
            notBetween: '次の値の間以外',
        },
        ruleName: {
            between: '{FORMULA1} と {FORMULA2} の間',
            greaterThan: '{FORMULA1} より大きい',
            greaterThanOrEqual: '{FORMULA1} 以上',
            lessThan: '{FORMULA1} より小さい',
            lessThanOrEqual: '{FORMULA1} 以下',
            equal: '{FORMULA1} に等しい',
            notEqual: '{FORMULA1} に等しくない',
            notBetween: '{FORMULA1} と {FORMULA2} の間以外',
            legal: '有効な {TYPE} 形式',
        },
        errorMsg: {
            between: '値は {FORMULA1} と {FORMULA2} の間である必要があります',
            greaterThan: '値は {FORMULA1} より大きい必要があります',
            greaterThanOrEqual: '値は {FORMULA1} 以上である必要があります',
            lessThan: '値は {FORMULA1} より小さい必要があります',
            lessThanOrEqual: '値は {FORMULA1} 以下である必要があります',
            equal: '値は {FORMULA1} に等しい必要があります',
            notEqual: '値は {FORMULA1} に等しくない必要があります',
            notBetween: '値は {FORMULA1} と {FORMULA2} の間以外である必要があります',
            legal: '値は有効な {TYPE} 形式である必要があります',
        },
    },
};

export default locale;
