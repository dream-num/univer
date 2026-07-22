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
        description: 'A função ENCODEURL retorna uma cadeia de caracteres codificada por URL, substituindo determinados caracteres não alfanuméricos pelo símbolo percentual (%) e um número hexadecimal.',
        abstract: 'A função ENCODEURL retorna uma cadeia de caracteres codificada por URL, substituindo determinados caracteres não alfanuméricos pelo símbolo percentual (%) e um número hexadecimal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Uma cadeia de caracteres a ser codificada por URL' },
        },
    },
    FILTERXML: {
        description: 'A função FILTERXML devolve dados específicos do conteúdo XML com o xpath especificado.',
        abstract: 'A função FILTERXML devolve dados específicos do conteúdo XML com o xpath especificado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Uma cadeia no formato XML válido.' },
            xpath: { name: 'xpath', detail: 'Uma cadeia no formato XPath padrão.' },
        },
    },
    WEBSERVICE: {
        description: 'A função WEBSERVICE retorna dados de um serviço Web na Internet ou intranet.',
        abstract: 'A função WEBSERVICE retorna dados de um serviço Web na Internet ou intranet.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'A URL do serviço Web.' },
        },
    },
};

export default locale;
