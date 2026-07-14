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
        description: 'La función URLCODIF devuelve una cadena con codificación URL que reemplaza ciertos caracteres no alfanuméricos por el símbolo de porcentaje (%) y un número hexadecimal.',
        abstract: 'La función URLCODIF devuelve una cadena con codificación URL que reemplaza ciertos caracteres no alfanuméricos por el símbolo de porcentaje (%) y un número hexadecimal.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'Una cadena a la que se va a codificar la dirección URL' },
        },
    },
    FILTERXML: {
        description: 'La función XMLFILTRO devuelve datos específicos del contenido XML mediante la ruta x especificada.',
        abstract: 'La función XMLFILTRO devuelve datos específicos del contenido XML mediante la ruta x especificada.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Una cadena en formato XML válido.' },
            xpath: { name: 'xpath', detail: 'Una cadena con formato XPath estándar.' },
        },
    },
    WEBSERVICE: {
        description: 'La función SERVICIOWEB devuelve datos de un servicio web en Internet o en la Intranet.',
        abstract: 'La función SERVICIOWEB devuelve datos de un servicio web en Internet o en la Intranet.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'La dirección URL del servicio web.' },
        },
    },
};

export default locale;
