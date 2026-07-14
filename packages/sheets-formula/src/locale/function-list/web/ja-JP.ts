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
        description: 'ENCODEURL 関数は、URL でエンコードされた文字列を返し、特定の英数字以外の文字をパーセント記号 (%) と 16 進数に置き換えます。',
        abstract: 'ENCODEURL 関数は、URL でエンコードされた文字列を返し、特定の英数字以外の文字をパーセント記号 (%) と 16 進数に置き換えます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: 'URL エンコードされる文字列' },
        },
    },
    FILTERXML: {
        description: 'FILTERXML 関数は、指定された xpath を使用して XML コンテンツから特定のデータを返します。',
        abstract: 'FILTERXML 関数は、指定された xpath を使用して XML コンテンツから特定のデータを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: '有効な XML 形式の文字列。' },
            xpath: { name: 'xpath', detail: '標準の XPath 形式の文字列。' },
        },
    },
    WEBSERVICE: {
        description: 'WEBSERVICE 関数は、インターネットまたはイントラネット上の Web サービスからデータを返します。',
        abstract: 'WEBSERVICE 関数は、インターネットまたはイントラネット上の Web サービスからデータを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'Web サービスの URL。' },
        },
    },
};

export default locale;
