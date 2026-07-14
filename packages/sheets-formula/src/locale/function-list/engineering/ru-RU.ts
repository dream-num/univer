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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/besseli-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/besselj-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/besselk-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bessely-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bin2dec-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое двоичное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
    BIN2OCT: {
        description: 'Преобразует двоичное число в восьмеричное.',
        abstract: 'Преобразует двоичное число в восьмеричное.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Обязательный аргумент. Преобразуемое двоичное число. Число не должно содержать более 10 знаков (10 бит). Первый значащий бит числа является знаковым битом. Остальные 9 бит являются битами значения. Отрицательные числа представляются в дополнительных кодах.' },
            places: { name: 'разрядность', detail: 'Дополнительные. Количество знаков в записи числа. Если разрядность не указана, функция ДВ.В.ВОСЬМ использует минимальное необходимое количество знаков. Разрядность используется для дополнения возвращаемого значения ведущими нулями.' },
        },
    },
    BITAND: {
        description: 'Возвращает результат операции поразрядного И для двух чисел',
        abstract: 'Возвращает результат операции поразрядного И для двух чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bitand-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bitlshift-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bitor-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bitrshift-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bitxor-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/complex-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/convert-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/dec2bin-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/dec2hex-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/dec2oct-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/delta-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/erf-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/erf-precise-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/erfc-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/erfc-precise-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/gestep-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/hex2bin-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/hex2dec-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/hex2oct-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется найти абсолютную величину.' },
        },
    },
    IMAGINARY: {
        description: 'Возвращает коэффициент при мнимой части комплексного числа, представленного в формате x + yi или x + yj.',
        abstract: 'Возвращает коэффициент при мнимой части комплексного числа, представленного в формате x + yi или x + yj.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Обязательно. Комплексное число, для которого требуется определить коэффициент при мнимой части.' },
        },
    },
    IMARGUMENT: {
        description: 'Возвращает аргумент Тета(theta), угол, выраженный в радианах',
        abstract: 'Возвращает аргумент Тета(theta), угол, выраженный в радианах,',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imargument-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imconjugate-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imcos-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imcosh-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить котангенс.' },
        },
    },
    IMCOTH: {
        description: 'Функция IMCOTH возвращает гиперболический котангенс заданного комплексного числа. Например, для заданного комплексного числа "x + yi" будет возвращено значение "coth(x + yi)".',
        abstract: 'Функция IMCOTH возвращает гиперболический котангенс заданного комплексного числа. Например, для заданного комплексного числа "x + yi" будет возвращено значение "coth(x + yi)".',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/9366256?hl=ru',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, гиперболический котангенс которого нужно вычислить. Это может быть или результат функции COMPLEX, или вещественное число (комплексное число с мнимыми частями, равными 0), или строка в формате "x + yi", где x и y – числовые значения.' },
        },
    },
    IMCSC: {
        description: 'Возвращает косеканс комплексного числа',
        abstract: 'Возвращает косеканс комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imcsc-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imcsch-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'комлексное число1', detail: 'Комплексный числитель (делимое).' },
            inumber2: { name: 'комлексное число2', detail: 'Комплексный знаменатель (делитель).' },
        },
    },
    IMEXP: {
        description: 'Возвращает экспоненту комплексного числа, представленного в текстовом формате x + yi или x + yj.',
        abstract: 'Возвращает экспоненту комплексного числа, представленного в текстовом формате x + yi или x + yj.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Обязательно. Комплексное число, для которого требуется определить экспоненту.' },
        },
    },
    IMLN: {
        description: 'Возвращает натуральный логарифм комплексного числа',
        abstract: 'Возвращает натуральный логарифм комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить натуральный логарифм.' },
        },
    },
    IMLOG: {
        description: 'Функция IMLOG возвращает логарифм комплексного числа по указанному основанию.',
        abstract: 'Функция IMLOG возвращает логарифм комплексного числа по указанному основанию.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/9366486?hl=ru',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Значение логарифмической функции, которое нужно указать. Чтобы введенное значение было интерпретировано как действительное число, используйте цифры (например, 1). Чтобы указать действительный и комплексный коэффициенты, запишите число в виде текста в кавычках.' },
            base: { name: 'основание', detail: 'Основание для вычисления логарифма. Значение должно быть положительным действительным числом.' },
        },
    },
    IMLOG10: {
        description: 'Возвращает десятичный логарифм комплексного числа',
        abstract: 'Возвращает десятичный логарифм комплексного числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imlog10-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imlog2-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/impower-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/improduct-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imreal-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imsec-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imsech-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imsin-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imsinh-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imsqrt-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imsub-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imsum-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, для которого требуется определить тангенс.' },
        },
    },
    IMTANH: {
        description: 'Функция IMTANH возвращает гиперболический тангенс заданного комплексного числа. Например, для заданного комплексного числа "x + yi" будет возвращено значение "tanh(x + yi)".',
        abstract: 'Функция IMTANH возвращает гиперболический тангенс заданного комплексного числа. Например, для заданного комплексного числа "x + yi" будет возвращено значение "tanh(x + yi)".',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/9366655?hl=ru',
            },
        ],
        functionParameter: {
            inumber: { name: 'комлексное число', detail: 'Комплексное число, гиперболический тангенс которого нужно вычислить. Это может быть или результат функции COMPLEX, или вещественное число (комплексное число с мнимыми частями, равными 0), или строка в формате "x + yi", где x и y – числовые значения.' },
        },
    },
    OCT2BIN: {
        description: 'Преобразует восьмеричное число в двоичное',
        abstract: 'Преобразует восьмеричное число в двоичное',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/oct2bin-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/oct2dec-function',
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
                url: 'https://support.microsoft.com/ru-ru/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое восьмеричное число.' },
            places: { name: 'разрядность', detail: 'Количество знаков в записи числа.' },
        },
    },
};

export default locale;
