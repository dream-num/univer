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
        description: 'Funkcia ENCODEURL vráti reťazec zakódovaný URL a niektoré nealfanumerické znaky nahradí symbolom percenta (%) a šestnástkovým číslom.',
        abstract: 'Funkcia ENCODEURL vráti reťazec zakódovaný URL a niektoré nealfanumerické znaky nahradí symbolom percenta (%) a šestnástkovým číslom.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Reťazec, ktorého URL adresa sa má zakódovať' },
        },
    },
    FILTERXML: {
        description: 'Funkcia FILTERXML vráti určité údaje z obsahu XML s použitím zadanej xpath.',
        abstract: 'Funkcia FILTERXML vráti určité údaje z obsahu XML s použitím zadanej xpath.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Reťazec v platnom formáte XML.' },
            xpath: { name: 'xpath', detail: 'Reťazec v štandardnom formáte XPath.' },
        },
    },
    WEBSERVICE: {
        description: 'Funkcia WEBSERVICE vráti údaje z webovej služby na internete alebo intranete.',
        abstract: 'Funkcia WEBSERVICE vráti údaje z webovej služby na internete alebo intranete.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'Adresa URL webovej služby.' },
        },
    },
};

export default locale;
