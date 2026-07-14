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
    ENCODEURL: {
        description: 'ENCODEURL 函式會回傳一個 URL 編碼的字串，將某些非字母數字字元替換為百分比符號 (%) 並以十六進位數字表示。',
        abstract: 'ENCODEURL 函式會回傳一個 URL 編碼的字串，將某些非字母數字字元替換為百分比符號 (%) 並以十六進位數字表示。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '一個要編碼為 URL 的字串' },
        },
    },
    FILTERXML: {
        description: 'FILTERXML 函式透過指定的 xpath 從 XML 內容中回傳特定資料。',
        abstract: 'FILTERXML 函式透過指定的 xpath 從 XML 內容中回傳特定資料。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: '有效 XML 格式的字串。' },
            xpath: { name: 'xpath', detail: '標準 XPath 格式的字串。' },
        },
    },
    WEBSERVICE: {
        description: 'WEBSERVICE 函式會回傳來自網際網路或內聯網網路上的網路服務資料。',
        abstract: 'WEBSERVICE 函式會回傳來自網際網路或內聯網網路上的網路服務資料。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: '網頁服務的 URL。' },
        },
    },
};

export default locale;
