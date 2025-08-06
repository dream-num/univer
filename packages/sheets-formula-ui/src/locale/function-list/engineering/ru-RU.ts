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
    BESSELI: {
        description: 'Возвращает модифицированную функцию Бесселя',
        abstract: 'Возвращает модифицированную функцию Бесселя',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B1%D0%B5%D1%81%D1%81%D0%B5%D0%BB%D1%8C-i-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B5%D1%81%D1%81%D0%B5%D0%BB%D1%8C-i-8d33855c-9a8d-444b-98e0-852267b1c0df',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Значение, для которого вычисляется функция.' },
            n: { name: 'N', detail: 'Порядок функции Бесселя. Если n не является целым числом, оно усекается.' },
        },
    },
    BESSELJ: {
        description: 'Возвращает функцию Бесселя',
        abstract: 'Возвращает функцию Бесселя',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B5%D1%81%D1%81%D0%B5%D0%BB%D1%8C-j-839cb181-48de-408b-9d80-bd02982d94f7',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Значение, для которого вычисляется функция.' },
            n: { name: 'N', detail: 'Порядок функции Бесселя. Если n не является целым числом, оно усекается.' },
        },
    },
    BESSELK: {
        description: 'Возвращает модифицированную функцию Бесселя',
        abstract: 'Возвращает модифицированную функцию Бесселя',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B5%D1%81%D1%81%D0%B5%D0%BB%D1%8C-k-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Значение, для которого вычисляется функция.' },
            n: { name: 'N', detail: 'Порядок функции Бесселя. Если n не является целым числом, оно усекается.' },
        },
    },
    BESSELY: {
        description: 'Возвращает функцию Бесселя, также называемую функцией Вебера или функцией Неймана',
        abstract: 'Возвращает функцию Бесселя, также называемую функцией Вебера или функцией Неймана',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B5%D1%81%D1%81%D0%B5%D0%BB%D1%8C-y-f3a356b3-da89-42c3-8974-2da54d6353a2',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Значение, для которого вычисляется функция.' },
            n: { name: 'N', detail: 'Порядок функции Бесселя. Если n не является целым числом, оно усекается.' },
        },
    },
    BIN2DEC: {
        description: 'Преобразует двоичное число в десятичное',
        abstract: 'Преобразует двоичное число в десятичное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B2-%D0%B2-%D0%B4%D0%B5%D1%81-63905b57-b3a0-453d-99f4-647bb519cd6c',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое двоичное число.' },
        },
    },
    BIN2HEX: {
        description: 'Преобразует двоичное число в шестнадцатеричное',
        abstract: 'Преобразует двоичное число в шестнадцатеричное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B2-%D0%B2-%D1%88%D0%B5%D1%81%D1%82%D0%BD-0375e507-f5e5-4077-9af8-28d84f9f41cc',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое двоичное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    BIN2OCT: {
        description: 'Преобразует двоичное число в восьмеричное',
        abstract: 'Преобразует двоичное число в восьмеричное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B2-%D0%B2-%D0%B2%D0%BE%D1%81%D1%8C%D0%BC-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое двоичное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    BITAND: {
        description: 'Возвращает результат операции поразрядного И для двух чисел',
        abstract: 'Возвращает результат операции поразрядного И для двух чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B1%D0%B8%D1%82-%D0%B8-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B8%D1%82-%D0%B8-8a2be3d7-91c3-4b48-9517-64548008563a',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Должен быть в десятичной форме и больше 0.' },
            number2: { name: 'число2', detail: 'Должен быть в десятичной форме и больше 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Возвращает число со сдвигом влево на указанное число бит',
        abstract: 'Возвращает число со сдвигом влево на указанное число бит',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B1%D0%B8%D1%82-%D1%81%D0%B4%D0%B2%D0%B8%D0%B3%D0%BB-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B8%D1%82-%D1%81%D0%B4%D0%B2%D0%B8%D0%B3%D0%BB-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Должен быть целым числом, большим или равным 0.' },
            shiftAmount: { name: 'число бит', detail: 'Число бит должно быть целым' },
        },
    },
    BITOR: {
        description: 'Возвращает результат операции поразрядного ИЛИ для двух чисел',
        abstract: 'Возвращает результат операции поразрядного ИЛИ для двух чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B1%D0%B8%D1%82-%D0%B8%D0%BB%D0%B8-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B8%D1%82-%D0%B8%D0%BB%D0%B8-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Должен быть в десятичной форме и больше 0.' },
            number2: { name: 'число2', detail: 'Должен быть в десятичной форме и больше 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Возвращает число со сдвигом вправо на указанное число бит',
        abstract: 'Возвращает число со сдвигом вправо на указанное число бит',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B1%D0%B8%D1%82-%D1%81%D0%B4%D0%B2%D0%B8%D0%B3%D0%BF-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B8%D1%82-%D1%81%D0%B4%D0%B2%D0%B8%D0%B3%D0%BF-274d6996-f42c-4743-abdb-4ff95351222c',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Должен быть целым числом, большим или равным 0.' },
            shiftAmount: { name: 'число бит', detail: 'Число бит должно быть целым' },
        },
    },
    BITXOR: {
        description: 'Возвращает результат операции поразрядного исключающего ИЛИ для двух чисел',
        abstract: 'Возвращает результат операции поразрядного исключающего ИЛИ для двух чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B1%D0%B8%D1%82-%D0%B8%D1%81%D0%BA%D0%BB%D0%B8%D0%BB%D0%B8-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B1%D0%B8%D1%82-%D0%B8%D1%81%D0%BA%D0%BB%D0%B8%D0%BB%D0%B8-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Должен быть в десятичной форме и больше 0.' },
            number2: { name: 'число2', detail: 'Должен быть в десятичной форме и больше 0.' },
        },
    },
    COMPLEX: {
        description: 'Преобразует коэффициенты при вещественной и мнимой частях комплексного числа в комплексное число',
        abstract: 'Преобразует коэффициенты при вещественной и мнимой частях комплексного числа в комплексное число',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81%D0%BD-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
            },
        ],
        functionParameter: {
            realNum: { name: 'действительная часть', detail: 'Действительная часть комплексного числа.' },
            iNum: { name: 'мнимая часть', detail: 'Мнимая часть комплексного числа.' },
            suffix: { name: 'мнимая единица', detail: 'Обозначение мнимой единицы в комплексном числе. Если аргумент "мнимая_единица" опущен, используется суффикс "i".' },
        },
    },
    CONVERT: {
        description: 'Преобразует число из одной системы мер в другую',
        abstract: 'Преобразует число из одной системы мер в другую',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BF%D1%80%D0%B5%D0%BE%D0%B1%D1%80-d785bef1-808e-4aac-bdcd-666c810f9af2',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Значение в исходных единицах измерения, которое нужно преобразовать.' },
            fromUnit: { name: 'исходная единица измерения', detail: 'Единицы измерения аргумента "число".' },
            toUnit: { name: 'конечная единица измерения', detail: 'Единицы измерения результата. CONVERT допускает указанные ниже текстовые значения (в кавычках) для аргументов "исходная единица измерения" и "конечная единица измерения".' },
        },
    },
    DEC2BIN: {
        description: 'Преобразует десятичное число в двоичное',
        abstract: 'Преобразует десятичное число в двоичное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B5%D1%81-%D0%B2-%D0%B4%D0%B2-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое десятичное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    DEC2HEX: {
        description: 'Преобразует десятичное число в шестнадцатеричное',
        abstract: 'Преобразует десятичное число в шестнадцатеричное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B5%D1%81-%D0%B2-%D1%88%D0%B5%D1%81%D1%82%D0%BD-6344ee8b-b6b5-4c6a-a672-f64666704619',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое десятичное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    DEC2OCT: {
        description: 'Преобразует десятичное число в восьмеричное',
        abstract: 'Преобразует десятичное число в восьмеричное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B5%D1%81-%D0%B2-%D0%B2%D0%BE%D1%81%D1%8C%D0%BC-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое десятичное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    DELTA: {
        description: 'Проверяет равенство двух значений',
        abstract: 'Проверяет равенство двух значений',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B5%D0%BB%D1%8C%D1%82%D0%B0-2f763672-c959-4e07-ac33-fe03220ba432',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Первое число.' },
            number2: { name: 'число2', detail: 'Второе число. Если этот параметр опущен, число2 считается равным нулю.' },
        },
    },
    ERF: {
        description: 'Возвращает функцию ошибки',
        abstract: 'Возвращает функцию ошибки',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%84%D0%BE%D1%88-c53c7e7b-5482-4b6c-883e-56df3c9af349',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'нижний предел', detail: 'Нижний предел интегрирования ERF.' },
            upperLimit: { name: 'верхний предел', detail: 'Верхний предел интегрирования ERF. Если аргумент "верхний предел" опущен, функция ERF выполняет интегрирование в пределах от 0 до значения аргумента "нижний предел".' },
        },
    },
    ERF_PRECISE: {
        description: 'Возвращает функцию ошибки',
        abstract: 'Возвращает функцию ошибки',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/erf-precise-function-9a349593-705c-4278-9a98-e4122831a8e0',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Нижний предел интегрирования функции ERF.PRECISE.' },
        },
    },
    ERFC: {
        description: 'Возвращает дополнительную функцию ERF, проинтегрированную в пределах от x до бесконечности',
        abstract: 'Возвращает дополнительную функцию ERF, проинтегрированную в пределах от x до бесконечности',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D1%84%D0%BE%D1%88-736e0318-70ba-4e8b-8d08-461fe68b71b3',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Нижний предел интегрирования функции ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Возвращает дополнительную функцию ERF, проинтегрированную в пределах от x до бесконечности',
        abstract: 'Возвращает дополнительную функцию ERF, проинтегрированную в пределах от x до бесконечности',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B4%D1%84%D0%BE%D1%88-%D1%82%D0%BE%D1%87%D0%BD-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D1%84%D0%BE%D1%88-%D1%82%D0%BE%D1%87%D0%BD-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Нижний предел интегрирования функции ERFC.PRECISE.' },
        },
    },
    GESTEP: {
        description: 'Используется для фильтрации множества значений',
        abstract: 'Используется для фильтрации множества значений',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BF%D0%BE%D1%80%D0%BE%D0%B3-f37e7d2a-41da-4129-be95-640883fca9df',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Проверяемое значение.' },
            step: { name: 'шаг', detail: ' Пороговое значение. Если аргумент "порог" опущен, функция GESTEP предполагает, что он равен нулю.' },
        },
    },
    HEX2BIN: {
        description: 'Преобразует шестнадцатеричное число в двоичное',
        abstract: 'Преобразует шестнадцатеричное число в двоичное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%88%D0%B5%D1%81%D1%82%D0%BD-%D0%B2-%D0%B4%D0%B2-a13aafaa-5737-4920-8424-643e581828c1',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое шестнадцатеричное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    HEX2DEC: {
        description: 'Преобразует шестнадцатеричное число в десятичное',
        abstract: 'Преобразует шестнадцатеричное число в десятичное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%88%D0%B5%D1%81%D1%82%D0%BD-%D0%B2-%D0%B4%D0%B5%D1%81-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое шестнадцатеричное число.' },
        },
    },
    HEX2OCT: {
        description: 'Преобразует шестнадцатеричное число в восьмеричное',
        abstract: 'Преобразует шестнадцатеричное число в восьмеричное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%88%D0%B5%D1%81%D1%82%D0%BD-%D0%B2-%D0%B2%D0%BE%D1%81%D1%8C%D0%BC-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%88%D0%B5%D1%81%D1%82%D0%BD-%D0%B2-%D0%B2%D0%BE%D1%81%D1%8C%D0%BC-54d52808-5d19-4bd0-8a63-1096a5d11912',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое шестнадцатеричное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    IMABS: {
        description: 'Возвращает абсолютную величину (модуль) комплексного числа, представленного в текстовом формате',
        abstract: 'Возвращает абсолютную величину (модуль) комплексного числа, представленного в текстовом формате',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-abs-b31e73c6-d90c-4062-90bc-8eb351d765a1',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется найти абсолютную величину.' },
        },
    },
    IMAGINARY: {
        description: 'Возвращает коэффициент при мнимой части комплексного числа',
        abstract: 'Возвращает коэффициент при мнимой части комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D1%87%D0%B0%D1%81%D1%82%D1%8C-dd5952fd-473d-44d9-95a1-9a17b23e428a',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить коэффициент при мнимой части.' },
        },
    },
    IMARGUMENT: {
        description: 'Возвращает аргумент Тета(theta), угол, выраженный в радианах',
        abstract: 'Возвращает аргумент Тета(theta), угол, выраженный в радианах,',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D0%B0%D1%80%D0%B3%D1%83%D0%BC%D0%B5%D0%BD%D1%82-eed37ec1-23b3-4f59-b9f3-d340358a034a',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется аргумент Тета.' },
        },
    },
    IMCONJUGATE: {
        description: 'Возвращает комплексно-сопряженное число для комплексного числа',
        abstract: 'Возвращает комплексно-сопряженное число для комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-%D1%81%D0%BE%D0%BF%D1%80%D1%8F%D0%B6-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D1%81%D0%BE%D0%BF%D1%80%D1%8F%D0%B6-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить сопряженное комплексное число.' },
        },
    },
    IMCOS: {
        description: 'Возвращает косинус комплексного числа',
        abstract: 'Возвращает косинус комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-cos-dad75277-f592-4a6b-ad6c-be93a808a53c',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить косинус.' },
        },
    },
    IMCOSH: {
        description: 'Возвращает гиперболический косинус комплексного числа',
        abstract: 'Возвращает гиперболический косинус комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-cosh-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-cosh-053e4ddb-4122-458b-be9a-457c405e90ff',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить гиперболический косинус.' },
        },
    },
    IMCOT: {
        description: 'Возвращает котангенс комплексного числа',
        abstract: 'Возвращает котангенс комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-cot-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-cot-dc6a3607-d26a-4d06-8b41-8931da36442c',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить котангенс.' },
        },
    },
    IMCOTH: {
        description: 'Возвращает гиперболический котангенс заданного комплексного числа.',
        abstract: 'Возвращает гиперболический котангенс заданного комплексного числа.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/9366256?hl=ru&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, гиперболический котангенс которого нужно вычислить.' },
        },
    },
    IMCSC: {
        description: 'Возвращает косеканс комплексного числа',
        abstract: 'Возвращает косеканс комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-csc-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-csc-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить косеканс.' },
        },
    },
    IMCSCH: {
        description: 'Возвращает гиперболический косеканс комплексного числа',
        abstract: 'Возвращает гиперболический косеканс комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-csch-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-csch-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить гиперболический косеканс.' },
        },
    },
    IMDIV: {
        description: 'Возвращает частное от деления двух комплексных чисел',
        abstract: 'Возвращает частное от деления двух комплексных чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D0%B4%D0%B5%D0%BB-a505aff7-af8a-4451-8142-77ec3d74d83f',
            },
        ],
        functionParameter: {
            inumber1: { name: 'комлексное число1', detail: 'Комплексный числитель (делимое).' },
            inumber2: { name: 'комлексное число2', detail: 'Комплексный знаменатель (делитель).' },
        },
    },
    IMEXP: {
        description: 'Возвращает экспоненту комплексного числа',
        abstract: 'Возвращает экспоненту комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-exp-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить экспоненту.' },
        },
    },
    IMLN: {
        description: 'Возвращает натуральный логарифм комплексного числа',
        abstract: 'Возвращает натуральный логарифм комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-ln-32b98bcf-8b81-437c-a636-6fb3aad509d8',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить натуральный логарифм.' },
        },
    },
    IMLOG: {
        description: 'Возвращает логарифм комплексного числа по указанному основанию',
        abstract: 'Возвращает логарифм комплексного числа по указанному основанию',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/9366486?hl=ru-Hans&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Значение логарифмической функции, которое нужно указать.' },
            base: { name: 'основание', detail: 'Основание для вычисления логарифма.' },
        },
    },
    IMLOG10: {
        description: 'Возвращает десятичный логарифм комплексного числа',
        abstract: 'Возвращает десятичный логарифм комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-log10-58200fca-e2a2-4271-8a98-ccd4360213a5',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется общий логарифм.' },
        },
    },
    IMLOG2: {
        description: 'Возвращает двоичный логарифм комплексного числа',
        abstract: 'Возвращает двоичный логарифм комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-log2-152e13b4-bc79-486c-a243-e6a676878c51',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить двоичный логарифм.' },
        },
    },
    IMPOWER: {
        description: 'Возвращает комплексное число возведенное в степень',
        abstract: 'Возвращает комплексное число возведенное в степень',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D1%81%D1%82%D0%B5%D0%BF%D0%B5%D0%BD%D1%8C-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, возводимое в степень.' },
            number: { name: 'число', detail: ' Степень, в которую необходимо возвести комплексное число.' },
        },
    },
    IMPRODUCT: {
        description: 'Возвращает произведение от 1 до 255 комплексных чисел',
        abstract: 'Возвращает произведение от 1 до 255 комплексных чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%B5%D0%B4-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
            },
        ],
        functionParameter: {
            inumber1: { name: 'комлексное число1', detail: 'От 1 до 255 перемножаемых комплексных чисел.' },
            inumber2: { name: 'комлексное число2', detail: 'От 1 до 255 перемножаемых комплексных чисел.' },
        },
    },
    IMREAL: {
        description: 'Возвращает коэффициент при вещественной части комплексного числа ',
        abstract: 'Возвращает коэффициент при вещественной части комплексного числа ',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D0%B2%D0%B5%D1%89-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить коэффициент при вещественной (действительной) части.' },
        },
    },
    IMSEC: {
        description: 'Возвращает секанс комплексного числа',
        abstract: 'Возвращает секанс комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-sec-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-sec-6df11132-4411-4df4-a3dc-1f17372459e0',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить секанс.' },
        },
    },
    IMSECH: {
        description: 'Возвращает гиперболический секанс комплексного числа',
        abstract: 'Возвращает гиперболический секанс комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-sech-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-sech-f250304f-788b-4505-954e-eb01fa50903b',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить гиперболический секанс.' },
        },
    },
    IMSIN: {
        description: 'Возвращает синус комплексного числа',
        abstract: 'Возвращает синус комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/imsin-function-1ab02a39-a721-48de-82ef-f52bf37859f6',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить синус.' },
        },
    },
    IMSINH: {
        description: 'Возвращает гиперболический синус комплексного числа',
        abstract: 'Возвращает гиперболический синус комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-sinh-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-sinh-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить гиперболический синус.' },
        },
    },
    IMSQRT: {
        description: 'Возвращает значение квадратного корня из комплексного числа',
        abstract: 'Возвращает значение квадратного корня из комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D1%8C-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D1%8C-e1753f80-ba11-4664-a10e-e17368396b70',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, из которого требуется извлечь квадратный корень.' },
        },
    },
    IMSUB: {
        description: 'Возвращает разность двух комплексных чисел,',
        abstract: 'Возвращает разность двух комплексных чисел,',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D1%80%D0%B0%D0%B7%D0%BD-2e404b4d-4935-4e85-9f52-cb08b9a45054',
            },
        ],
        functionParameter: {
            inumber1: { name: 'комлексное число1', detail: 'Уменьшаемое комплексное число.' },
            inumber2: { name: 'комлексное число2', detail: 'Вычитаемое комплексное число..' },
        },
    },
    IMSUM: {
        description: 'Возвращает сумму двух или более комплексных чисел',
        abstract: 'Возвращает сумму двух или более комплексных чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-%D1%81%D1%83%D0%BC%D0%BC-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
            },
        ],
        functionParameter: {
            inumber1: { name: 'комлексное число1', detail: 'От 1 до 255 суммируемых комплексных чисел.' },
            inumber2: { name: 'комлексное число2', detail: 'От 1 до 255 суммируемых комплексных чисел.' },
        },
    },
    IMTAN: {
        description: 'Возвращает тангенс комплексного числа',
        abstract: 'Возвращает тангенс комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%BD%D0%B8%D0%BC-tan-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BD%D0%B8%D0%BC-tan-8478f45d-610a-43cf-8544-9fc0b553a132',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить тангенс.' },
        },
    },
    IMTANH: {
        description: 'Возвращает гиперболический тангенс комплексного числа',
        abstract: 'Возвращает гиперболический тангенс комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/9366655?hl=ru&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, гиперболический тангенс которого нужно вычислить.' },
        },
    },
    OCT2BIN: {
        description: 'Преобразует восьмеричное число в двоичное',
        abstract: 'Преобразует восьмеричное число в двоичное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B2%D0%BE%D1%81%D1%8C%D0%BC-%D0%B2-%D0%B4%D0%B2-55383471-3c56-4d27-9522-1a8ec646c589',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое восьмеричное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    OCT2DEC: {
        description: 'Преобразует восьмеричное число в десятичное',
        abstract: 'Преобразует восьмеричное число в десятичное.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B2%D0%BE%D1%81%D1%8C%D0%BC-%D0%B2-%D0%B4%D0%B5%D1%81-87606014-cb98-44b2-8dbb-e48f8ced1554',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое восьмеричное число.' },
        },
    },
    OCT2HEX: {
        description: 'Преобразует восьмеричное число в шестнадцатеричное',
        abstract: 'Преобразует восьмеричное число в шестнадцатеричное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B2%D0%BE%D1%81%D1%8C%D0%BC-%D0%B2-%D1%88%D0%B5%D1%81%D1%82%D0%BD-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое восьмеричное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
};

export default locale;
