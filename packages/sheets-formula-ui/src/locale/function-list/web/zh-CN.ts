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
        description: '返回 URL 编码的字符串',
        abstract: '返回 URL 编码的字符串',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/encodeurl-%E5%87%BD%E6%95%B0-07c7fb90-7c60-4bff-8687-fac50fe33d0e',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要进行 URL 编码的字符串' },
        },
    },
    FILTERXML: {
        description: '通过使用指定的 XPath，返回 XML 内容中的特定数据',
        abstract: '通过使用指定的 XPath，返回 XML 内容中的特定数据',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/filterxml-%E5%87%BD%E6%95%B0-4df72efc-11ec-4951-86f5-c1374812f5b7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WEBSERVICE: {
        description: '返回 Web 服务中的数据。',
        abstract: '返回 Web 服务中的数据。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/webservice-%E5%87%BD%E6%95%B0-0546a35a-ecc6-4739-aed7-c0b7ce1562c4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
