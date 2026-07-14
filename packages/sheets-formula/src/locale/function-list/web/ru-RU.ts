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
        description: 'Функция ENCODEURL возвращает строку в кодировке URL-адреса, заменяя некоторые небукенно-цифровые символы символами процента (%) и шестнадцатеричным числом.',
        abstract: 'Функция ENCODEURL возвращает строку в кодировке URL-адреса, заменяя некоторые небукенно-цифровые символы символами процента (%) и шестнадцатеричным числом.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'tекст', detail: 'Строка для кодирования URL-адреса' },
        },
    },
    FILTERXML: {
        description: 'Функция FILTERXML возвращает определенные данные из XML-содержимого с помощью указанного xpath.',
        abstract: 'Функция FILTERXML возвращает определенные данные из XML-содержимого с помощью указанного xpath.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Строка в допустимом формате XML.' },
            xpath: { name: 'xpath', detail: 'Строка в стандартном формате XPath.' },
        },
    },
    WEBSERVICE: {
        description: 'Функция WEBSERVICE возвращает данные из веб-службы в Интернете или интрасети.',
        abstract: 'Функция WEBSERVICE возвращает данные из веб-службы в Интернете или интрасети.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'URL-адрес веб-службы.' },
        },
    },
};

export default locale;
