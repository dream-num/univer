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
    CRYPTO_PRICE: {
        description: '获取加密货币的价格。比如比特币（BTC）。',
        abstract: '获取加密货币的价格',
        links: [
            {
                title: '使用说明',
                url: '',
            },
        ],
        functionParameter: {
            symbol: { name: '加密货币符号', detail: '加密货币符号' },
        },
    },
};

export default locale;
