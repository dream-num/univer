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
        description: 'ENCODEURL 함수는 URL로 인코딩된 문자열을 반환하여 영숫자가 아닌 특정 문자를 백분율 기호(%) 및 16진수 숫자로 바꿉니다.',
        abstract: 'ENCODEURL 함수는 URL로 인코딩된 문자열을 반환하여 영숫자가 아닌 특정 문자를 백분율 기호(%) 및 16진수 숫자로 바꿉니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'URL로 인코딩할 문자열' },
        },
    },
    FILTERXML: {
        description: 'FILTERXML 함수는 지정된 xpath를 사용하여 XML 콘텐츠에서 특정 데이터를 반환합니다.',
        abstract: 'FILTERXML 함수는 지정된 xpath를 사용하여 XML 콘텐츠에서 특정 데이터를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: '유효한 XML 형식의 문자열입니다.' },
            xpath: { name: 'xpath', detail: '표준 XPath 형식의 문자열입니다.' },
        },
    },
    WEBSERVICE: {
        description: 'WEBSERVICE 함수는 인터넷 또는 인트라넷의 웹 서비스에서 데이터를 반환합니다.',
        abstract: 'WEBSERVICE 함수는 인터넷 또는 인트라넷의 웹 서비스에서 데이터를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: '웹 서비스의 URL입니다.' },
        },
    },
};

export default locale;
