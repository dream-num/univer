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

export default {
    ENCODEURL: {
        description: 'Возвращает строку, закодированную в формате URL',
        abstract: 'Возвращает строку, закодированную в формате URL',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/encodeurl-function-07c7fb90-7c60-4bff-8687-fac50fe33d0e',
            },
        ],
        functionParameter: {
            text: { name: 'tекст', detail: 'Строка для кодирования URL-адреса' },
        },
    },
    FILTERXML: {
        description: 'Возвращает конкретные данные из XML-содержимого, используя указанный XPath',
        abstract: 'Возвращает конкретные данные из XML-содержимого, используя указанный XPath',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/filterxml-function-4df72efc-11ec-4951-86f5-c1374812f5b7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
    WEBSERVICE: {
        description: 'Возвращает данные с веб-сервиса',
        abstract: 'Возвращает данные с веб-сервиса',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/webservice-function-0546a35a-ecc6-4739-aed7-c0b7ce1562c4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
};
