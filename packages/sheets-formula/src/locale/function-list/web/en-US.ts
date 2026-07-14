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

const locale = {
    ENCODEURL: {
        description: 'The ENCODEURL function returns a URL-encoded string, replacing certain non-alphanumeric characters with the percentage symbol (%) and a hexadecimal number.',
        abstract: 'The ENCODEURL function returns a URL-encoded string, replacing certain non-alphanumeric characters with the percentage symbol (%) and a hexadecimal number.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'A string to be URL encoded' },
        },
    },
    FILTERXML: {
        description: 'The FILTERXML function returns specific data from XML content by using the specified xpath.',
        abstract: 'The FILTERXML function returns specific data from XML content by using the specified xpath.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'A string in valid XML format.' },
            xpath: { name: 'xpath', detail: 'A string in standard XPath format.' },
        },
    },
    WEBSERVICE: {
        description: 'The WEBSERVICE function returns data from a web service on the Internet or Intranet.',
        abstract: 'The WEBSERVICE function returns data from a web service on the Internet or Intranet.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'The URL of the web service.' },
        },
    },
};

export default locale;
