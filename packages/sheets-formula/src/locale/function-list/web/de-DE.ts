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
        description: 'Die ENCODEURL-Funktion gibt eine URL-codierte Zeichenfolge zurück, wobei bestimmte nicht alphanumerische Zeichen durch das Prozentsymbol (%) und eine Hexadezimalzahl ersetzt werden.',
        abstract: 'Die ENCODEURL-Funktion gibt eine URL-codierte Zeichenfolge zurück, wobei bestimmte nicht alphanumerische Zeichen durch das Prozentsymbol (%) und eine Hexadezimalzahl ersetzt werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Eine Zeichenfolge, die URL-codiert werden soll' },
        },
    },
    FILTERXML: {
        description: 'Die FILTERXML-Funktion gibt bestimmte Daten aus XML-Inhalten mithilfe des angegebenen xpath zurück.',
        abstract: 'Die FILTERXML-Funktion gibt bestimmte Daten aus XML-Inhalten mithilfe des angegebenen xpath zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Eine Zeichenfolge im gültigen XML-Format.' },
            xpath: { name: 'xpath', detail: 'Eine Zeichenfolge im XPath-Standardformat.' },
        },
    },
    WEBSERVICE: {
        description: 'Die WEBSERVICE-Funktion gibt Daten aus einem Webdienst im Internet oder Intranet zurück.',
        abstract: 'Die WEBSERVICE-Funktion gibt Daten aus einem Webdienst im Internet oder Intranet zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'Die URL des Webdiensts.' },
        },
    },
};

export default locale;
