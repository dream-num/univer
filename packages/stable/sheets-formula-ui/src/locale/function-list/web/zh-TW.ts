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

export default {
    ENCODEURL: {
        description: '傳回 URL 編碼的字串',
        abstract: '傳回 URL 編碼的字串',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/encodeurl-%E5%87%BD%E6%95%B0-07c7fb90-7c60-4bff-8687-fac50fe33d0e',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要編碼 URL 的字串' },
        },
    },
    FILTERXML: {
        description: '透過使用指定的 XPath，傳回 XML 內容中的特定資料',
        abstract: '透過使用指定的 XPath，傳回 XML 內容中的特定資料',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/filterxml-%E5%87%BD%E6%95%B0-4df72efc-11ec-4951-86f5-c1374812f5b7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WEBSERVICE: {
        description: '傳回 Web 服務中的資料。',
        abstract: '傳回 Web 服務中的資料。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/webservice-%E5%87%BD%E6%95%B0-0546a35a-ecc6-4739-aed7-c0b7ce1562c4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
