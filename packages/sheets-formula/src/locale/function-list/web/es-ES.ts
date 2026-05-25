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
        description: 'Devuelve una cadena codificada en URL',
        abstract: 'Devuelve una cadena codificada en URL',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/en-us/office/encodeurl-function-07c7fb90-7c60-4bff-8687-fac50fe33d0e',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'Una cadena que se va a codificar en URL' },
        },
    },
    FILTERXML: {
        description: 'Devuelve datos específicos del contenido XML utilizando la XPath especificada',
        abstract: 'Devuelve datos específicos del contenido XML utilizando la XPath especificada',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/en-us/office/filterxml-function-4df72efc-11ec-4951-86f5-c1374812f5b7',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    WEBSERVICE: {
        description: 'Devuelve datos de un servicio web',
        abstract: 'Devuelve datos de un servicio web',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/en-us/office/webservice-function-0546a35a-ecc6-4739-aed7-c0b7ce1562c4',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
};

export default locale;
