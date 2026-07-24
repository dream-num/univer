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
        description: 'La funzione CODIFICA.URL restituisce una stringa con codifica URL, sostituendo alcuni caratteri non alfanumerici con il simbolo percentuale (%) e un numero esadecimale.',
        abstract: 'La funzione CODIFICA.URL restituisce una stringa con codifica URL, sostituendo alcuni caratteri non alfanumerici con il simbolo percentuale (%) e un numero esadecimale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Stringa da codificare per l\'URL' },
        },
    },
    FILTERXML: {
        description: 'La funzione FILTERXML restituisce dati specifici dal contenuto XML usando il percorso x specificato.',
        abstract: 'La funzione FILTERXML restituisce dati specifici dal contenuto XML usando il percorso x specificato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Stringa in formato XML valido.' },
            xpath: { name: 'xpath', detail: 'Stringa in formato XPath standard.' },
        },
    },
    WEBSERVICE: {
        description: 'La funzione SERVIZIO.WEB restituisce dati da un servizio Web su Internet o Intranet.',
        abstract: 'La funzione SERVIZIO.WEB restituisce dati da un servizio Web su Internet o Intranet.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'L’URL del servizio Web.' },
        },
    },
};

export default locale;
