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
        description: 'Funkcja ENCODEURL zwraca ciąg zakodowany w adresie URL, zastępując niektóre znaki niealfanumeryczne symbolem procentu (%) i liczbą szesnastkową.',
        abstract: 'Funkcja ENCODEURL zwraca ciąg zakodowany w adresie URL, zastępując niektóre znaki niealfanumeryczne symbolem procentu (%) i liczbą szesnastkową.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Ciąg, który ma zostać zakodowany w adresie URL' },
        },
    },
    FILTERXML: {
        description: 'Funkcja FILTERXML zwraca określone dane z zawartości XML przy użyciu określonego ciągu xpath.',
        abstract: 'Funkcja FILTERXML zwraca określone dane z zawartości XML przy użyciu określonego ciągu xpath.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Ciąg w prawidłowym formacie XML.' },
            xpath: { name: 'xpath', detail: 'Ciąg w standardowym formacie XPath.' },
        },
    },
    WEBSERVICE: {
        description: 'Funkcja WEBSERVICE zwraca dane z usługi sieci Web w Internecie lub intranecie.',
        abstract: 'Funkcja WEBSERVICE zwraca dane z usługi sieci Web w Internecie lub intranecie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'Adres URL usługi sieci Web.' },
        },
    },
};

export default locale;
