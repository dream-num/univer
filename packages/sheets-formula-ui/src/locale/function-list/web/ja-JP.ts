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
        description: 'URL 形式でエンコードされた文字列を返します。',
        abstract: 'URL 形式でエンコードされた文字列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/encodeurl-%E9%96%A2%E6%95%B0-07c7fb90-7c60-4bff-8687-fac50fe33d0e',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: 'URL エンコードされる文字列' },
        },
    },
    FILTERXML: {
        description: '指定された XPath に基づいて XML コンテンツの特定のデータを返します。',
        abstract: '指定された XPath に基づいて XML コンテンツの特定のデータを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/filterxml-%E9%96%A2%E6%95%B0-4df72efc-11ec-4951-86f5-c1374812f5b7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WEBSERVICE: {
        description: 'Web サービスからのデータを返します。',
        abstract: 'Web サービスからのデータを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/webservice-%E9%96%A2%E6%95%B0-0546a35a-ecc6-4739-aed7-c0b7ce1562c4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
