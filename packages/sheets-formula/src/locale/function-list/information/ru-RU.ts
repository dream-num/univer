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
    CELL: {
        description: 'Возвращает сведения о форматировании, расположении или содержимом ячейки',
        abstract: 'Возвращает сведения о форматировании, расположении или содержимом ячейки',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%8F%D1%87%D0%B5%D0%B9%D0%BA%D0%B0-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%8F%D1%87%D0%B5%D0%B9%D0%BA%D0%B0-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
            },
        ],
        functionParameter: {
            infoType: { name: 'тип сведений', detail: 'Текстовое значение, задающее тип сведений о ячейке при возвращении.' },
            reference: { name: 'ссылка', detail: 'Ячейка, сведения о которой требуется получить.' },
        },
    },
    ERROR_TYPE: {
        description: 'Возвращает номер, соответствующий одному из возможных значений ошибок ',
        abstract: 'Возвращает номер, соответствующий одному из возможных значений ошибок ',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%82%D0%B8%D0%BF-%D0%BE%D1%88%D0%B8%D0%B1%D0%BA%D0%B8-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
            },
        ],
        functionParameter: {
            errorVal: { name: 'значение ошибки', detail: 'Значение ошибки, для которого определяется номер.' },
        },
    },
    INFO: {
        description: 'Возвращает информацию о текущей операционной среде',
        abstract: 'Возвращает информацию о текущей операционной среде',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B8%D0%BD%D1%84%D0%BE%D1%80%D0%BC-725f259a-0e4b-49b3-8b52-58815c69acae',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'first' },
            number2: { name: 'число2', detail: 'second' },
        },
    },
    ISBETWEEN: {
        description: 'Проверяет, относится ли указанное значение к интервалу между двумя числами (включительно или не включительно)',
        abstract: 'Проверяет, относится ли указанное значение к интервалу между двумя числами (включительно или не включительно)',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/10538337?hl=ru&sjid=7730820672019533290-AP',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'значение для сравнения', detail: 'Значение, которое нужно проверить на принадлежность к интервалу от "наименьшее значение" до "наибольшее значение".' },
            lowerValue: { name: 'наименьшее значение', detail: 'Нижняя граница диапазона значений, к которому может относиться значение "значение для сравнения".' },
            upperValue: { name: 'наибольшее значение', detail: 'Верхняя граница диапазона значений, к которому может относиться значение "значение для сравнения".' },
            lowerValueIsInclusive: { name: 'наименьшее значение вклюительно', detail: 'Указывает, входит ли в диапазон значение "наименьшее значение". Значение по умолчанию: TRUE.' },
            upperValueIsInclusive: { name: 'наибольшее значение вклюительно', detail: 'Указывает, входит ли в диапазон значение "наибольшее значение". Значение по умолчанию: TRUE.' },
        },
    },
    ISBLANK: {
        description: 'Возвращает TRUE, если значение пустое',
        abstract: 'Возвращает TRUE, если значение пустое.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISDATE: {
        description: 'Определяет, является ли указанное значение датой',
        abstract: 'Определяет, является ли указанное значение датой',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/9061381?hl=ru&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое необходимо проверить.' },
        },
    },
    ISEMAIL: {
        description: 'Проверяет, является ли значение допустимым адресом электронной почты',
        abstract: 'Проверяет, является ли значение допустимым адресом электронной почты',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/3256503?hl=ru&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, для которого необходимо проверить, является ли оно адресом электронной почты.' },
        },
    },
    ISERR: {
        description: 'Возвращает значение TRUE, если значение представляет собой любое значение ошибки, кроме #N/A',
        abstract: 'Возвращает значение TRUE, если значение представляет собой любое значение ошибки, кроме #N/A',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «Значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISERROR: {
        description: 'Возвращает TRUE, если значение является любым значением ошибки.',
        abstract: 'Возвращает TRUE, если значение является любым значением ошибки.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «Значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISEVEN: {
        description: 'Возвращает значение TRUE, если число четное.',
        abstract: 'Возвращает значение TRUE, если число четное.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B5%D1%87%D1%91%D1%82%D0%BD-aa15929a-d77b-4fbb-92f4-2f479af55356',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Проверяемое значение. Если число не является целым, оно усекается.' },
        },
    },
    ISFORMULA: {
        description: 'Возвращает значение TRUE, если значение является формулой',
        abstract: 'Возвращает значение TRUE, если значение является формулой',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5%D1%84%D0%BE%D1%80%D0%BC%D1%83%D0%BB%D0%B0-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B5%D1%84%D0%BE%D1%80%D0%BC%D1%83%D0%BB%D0%B0-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
            },
        ],
        functionParameter: {
            reference: { name: 'ссылка', detail: 'Аргумент "ссылка" представляет ссылку на ячейку, которую необходимо проверить.' },
        },
    },
    ISLOGICAL: {
        description: 'Возвращает TRUE, если значение является логическим значением',
        abstract: 'Возвращает TRUE, если значение является логическим значением',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «Значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISNA: {
        description: 'Возвращает значение TRUE, если значение равно значению ошибки #N/A',
        abstract: 'Возвращает значение TRUE, если значение равно значению ошибки #N/A',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «Значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISNONTEXT: {
        description: 'Возвращает TRUE, если значение не является текстом',
        abstract: 'Возвращает TRUE, если значение не является текстом',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «Значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISNUMBER: {
        description: 'Возвращает TRUE, если значение является числом',
        abstract: 'Возвращает TRUE, если значение является числом',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «Значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISODD: {
        description: 'Возвращает ИСТИНА, если число нечетное',
        abstract: 'Возвращает ИСТИНА, если число нечетное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B5%D0%BD%D0%B5%D1%87%D1%91%D1%82-1208a56d-4f10-4f44-a5fc-648cafd6c07a',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Проверяемое значение. Если число не является целым, оно усекается.' },
        },
    },
    ISOMITTED: {
        description: 'Проверяет, отсутствует ли значение в ЛЯМБДА, и возвращает значение True или False',
        abstract: 'Проверяет, отсутствует ли значение в ЛЯМБДА, и возвращает значение True или False',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-isomitted-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'first' },
            number2: { name: 'число2', detail: 'second' },
        },
    },
    ISREF: {
        description: 'Возвращает TRUE, если значение является ссылкой',
        abstract: 'Возвращает TRUE, если значение является ссылкой',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «Значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISTEXT: {
        description: 'Возвращает TRUE, если значение является текстом',
        abstract: 'Возвращает TRUE, если значение является текстом',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8-%D0%B5-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое вы хотите проверить. Аргументом «Значение» может быть пустая ячейка, ошибка, логическое значение, текст, число, ссылочное значение или имя, ссылающееся на любой из них.' },
        },
    },
    ISURL: {
        description: 'Проверяет, является ли значение допустимым URL',
        abstract: 'Проверяет, является ли значение допустимым URL.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/3256501?hl=ru&sjid=7312884847858065932-AP',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, для которого необходимо проверить, является ли оно URL.' },
        },
    },
    N: {
        description: 'Возвращает значение, преобразованное в число',
        abstract: 'Возвращает значение, преобразованное в число',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%87-a624cad1-3635-4208-b54a-29733d1278c9',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, которое требуется преобразовать' },
        },
    },
    NA: {
        description: 'Возвращает значение ошибки #N/A',
        abstract: 'Возвращает значение ошибки #N/A',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BD%D0%B4-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'Возвращает номер листа указанного листа или другой ссылки',
        abstract: 'Возвращает номер листа указанного листа или другой ссылки',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BB%D0%B8%D1%81%D1%82-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BB%D0%B8%D1%81%D1%82-44718b6f-8b87-47a1-a9d6-b701c06cff24',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Используйте его, чтобы указать имя листа или ссылку, для которой требуется получить номер листа. В противном случае функция вернет номер листа, содержащего функцию SHEET.' },
        },
    },
    SHEETS: {
        description: 'Возвращает количество листов в ссылке',
        abstract: 'Возвращает количество листов в ссылке',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BB%D0%B8%D1%81%D1%82%D1%8B-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BB%D0%B8%D1%81%D1%82%D1%8B-770515eb-e1e8-45ce-8066-b557e5e4b80b',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Возвращает тип значения',
        abstract: 'Возвращает тип значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%82%D0%B8%D0%BF-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%82%D0%B8%D0%BF-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Любое значение, например число, текст, логическое значение и т.д.' },
        },
    },
};

export default locale;
