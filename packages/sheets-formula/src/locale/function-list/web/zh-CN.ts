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
        description: 'ENCODEURL 函数返回 URL 编码的字符串，将某些非字母数字字符替换为百分比符号 (%) 和十六进制数字。',
        abstract: 'ENCODEURL 函数返回 URL 编码的字符串，将某些非字母数字字符替换为百分比符号 (%) 和十六进制数字。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要进行 URL 编码的字符串' },
        },
    },
    FILTERXML: {
        description: 'FILTERXML 函数使用指定的 xpath 从 XML 内容返回特定数据。',
        abstract: 'FILTERXML 函数使用指定的 xpath 从 XML 内容返回特定数据。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: '有效 XML 格式的字符串。' },
            xpath: { name: 'xpath', detail: '采用标准 XPath 格式的字符串。' },
        },
    },
    WEBSERVICE: {
        description: 'WEBSERVICE 函数从 Internet 或 Intranet 上的 Web 服务返回数据。',
        abstract: 'WEBSERVICE 函数从 Internet 或 Intranet 上的 Web 服务返回数据。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'Web 服务的 URL。' },
        },
    },
};

export default locale;
