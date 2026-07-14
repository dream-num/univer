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
    ABS: {
        description: 'Возвращает абсолютную величину числа. Абсолютная величина числа  — это число без знака',
        abstract: 'Возвращает абсолютную величину числа. ',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Вещественное число, абсолютное значение которого необходимо найти.' },
        },
    },
    ACOS: {
        description: 'Возвращает арккосинус числа. Арккосинус числа — это угол, косинус которого равен числу. Угол определяется в радианах в интервале от 0 до "пи"',
        abstract: 'Возвращает арккосинус числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Косинус искомого угла; значение должно находиться в диапазоне от -1 до 1.' },
        },
    },
    ACOSH: {
        description: 'Возвращает гиперболический арккосинус числа. Число должно быть больше или равно 1. Гиперболический арккосинус числа — это значение, гиперболический косинус которого равен числу, следовательно, ACOSH(COSH(число)) равняется числу',
        abstract: 'Возвращает гиперболический арккосинус числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Любое вещественное число, большее или равное 1.' },
        },
    },
    ACOT: {
        description: 'Возвращает главное значение арккотангенса, или обратного котангенса, числа',
        abstract: 'Возвращает главное значение арккотангенса, или обратного котангенса, числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: {
                name: 'число',
                detail: 'Число ― это котангенс искомого угла. Он должен быть действительным числом.',
            },
        },
    },
    ACOTH: {
        description: 'Возвращает гиперболический арккотангенс числа',
        abstract: 'Возвращает гиперболический арккотангенс числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Абсолютное значение Числа должно быть больше 1.' },
        },
    },
    AGGREGATE: {
        description: 'Возвращает агрегатный результат вычислений по списку или базе данных',
        abstract: 'Возвращает агрегатный результат вычислений по списку или базе данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'номер_функции', detail: 'Число от 1 до 19, определяющее функцию, которую необходимо использовать.' },
            options: { name: 'параметры', detail: 'Числовое значение, определяющее, какие значения при вычислении функции следует пропускать.' },
            ref1: { name: 'ссылка1', detail: 'Первый числовой аргумент для функций, которые принимают несколько числовых аргументов, для которых требуется агрегированное значение.' },
            ref2: { name: 'ссылка2', detail: 'Числовые аргументы от 2 до 252, для которых необходимо вычислить агрегатное значение.' },
        },
    },
    ARABIC: {
        description: 'Преобразует римское число в арабское',
        abstract: 'Преобразует римское число в арабское',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Строка, ограниченная кавычками, пустая строка ("") или ссылка на ячейку, содержащую текст.' },
        },
    },
    ASIN: {
        description: 'Возвращает арксинус числа',
        abstract: 'Возвращает арксинус числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Синус искомого угла; значение должно находиться в диапазоне от -1 до 1.' },
        },
    },
    ASINH: {
        description: 'Возвращает гиперболический арксинус числа',
        abstract: 'Возвращает гиперболический арксинус числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Любое вещественное число.' },
        },
    },
    ATAN: {
        description: 'Возвращает арктангенс числа',
        abstract: 'Возвращает арктангенс числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Тангенс искомого угла.' },
        },
    },
    ATAN2: {
        description: 'Возвращает арктангенс для заданных координат x и y',
        abstract: 'Возвращает арктангенс для заданных координат x и y',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x', detail: 'X-координата точки.' },
            yNum: { name: 'y', detail: 'Y-координата точки.' },
        },
    },
    ATANH: {
        description: 'Возвращает гиперболический арктангенс числа. Число должно быть в интервале от -1 до 1 (исключая -1 и 1). Гиперболический арктангенс числа — это значение, гиперболический тангенс которого равен числу , следовательно ATANH(TANH(число)) равняется числу .',
        abstract: 'Возвращает гиперболический арктангенс числа. Число должно быть в интервале от -1 до 1 (исключая -1 и 1). Гиперболический арктангенс числа — это значение, гиперболический тангенс которого равен числу , следовательно ATANH(TANH(число)) равняется числу .',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Обязательный аргумент. Любое вещественное число в интервале от -1 до 1.' },
        },
    },
    BASE: {
        description: 'Преобразует число в текстовое представление с указанным основанием системы счисления',
        abstract: 'Преобразует число в текстовое представление с указанным основанием системы счисления',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число, которое нужно преобразовать. Должен быть целым числом, большим или равным 0, но меньшим 2^53.' },
            radix: { name: 'основание', detail: 'Основание системы счисления, в которую нужно преобразовать число. Должен быть целым числом, большим или равным 2, но меньшим 36.' },
            minLength: { name: 'минимальная длина.', detail: 'Минимальная длина возвращаемой строки. Должен быть целым числом, меньшим или равным 0.' },
        },
    },
    CEILING: {
        description: 'Возвращает результат округления с избытком до ближайшего числа, кратного значению точности',
        abstract: 'Возвращает результат округления с избытком до ближайшего числа, кратного значению точности',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
            significance: { name: 'точность', detail: 'Кратное, до которого требуется округлить значение.' },
        },
    },
    CEILING_MATH: {
        description: 'Округляет число до ближайшего целого числа или, при необходимости, до ближайшего кратного значения',
        abstract: 'Округляет число до ближайшего целого числа или, при необходимости, до ближайшего кратного значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
            significance: { name: 'точность', detail: 'Кратное, до которого требуется округлить значение.' },
            mode: { name: 'режим', detail: 'Определяет, округляются ли отрицательные числа к нулю или от них. ' },
        },
    },
    CEILING_PRECISE: {
        description: 'Округляет число вверх до ближайшего целого или до ближайшего кратного указанному значению. Число округляется до большего значения вне зависимости от его знака',
        abstract: 'Округляет число вверх до ближайшего целого или до ближайшего кратного указанному значению. Число округляется до большего значения вне зависимости от его знака',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
            significance: { name: 'точность', detail: 'Кратное, до которого требуется округлить значение.' },
        },
    },
    COMBIN: {
        description: 'Возвращает количество комбинаций для заданного числа элементов',
        abstract: 'Возвращает количество комбинаций для заданного числа элементов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Количество элементов.' },
            numberChosen: { name: 'число выбранных', detail: 'Количество элементов в каждой комбинации.' },
        },
    },
    COMBINA: {
        description: 'Возвращает количество комбинаций (с повторениями) для заданного числа элементов',
        abstract: 'Возвращает количество комбинаций (с повторениями) для заданного числа элементов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Количество элементов.' },
            numberChosen: { name: 'число выбранных', detail: 'Количество элементов в каждой комбинации.' },
        },
    },
    COS: {
        description: 'Возвращает косинус заданного угла',
        abstract: 'Возвращает косинус заданного угла',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: ' Угол в радианах, для которого определяется косинус.' },
        },
    },
    COSH: {
        description: 'Возвращает гиперболический косинус числа',
        abstract: 'Возвращает гиперболический косинус числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Любое вещественное число, для которого требуется найти гиперболический косинус.' },
        },
    },
    COT: {
        description: 'Возвращает значение котангенса заданного угла в радианах',
        abstract: 'Возвращает значение котангенса заданного угла в радианах',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Угол в радианах, для которого определяется котангенс.' },
        },
    },
    COTH: {
        description: 'Возвращает гиперболический котангенс гиперболического угла',
        abstract: 'Возвращает гиперболический котангенс гиперболического угла',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Любое вещественные число, для которого вы хотите найти гиперболический котангенс.' },
        },
    },
    CSC: {
        description: 'Возвращает значение косеканса заданного угла в радианах',
        abstract: 'Возвращает значение косеканса заданного угла в радианах',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Угол в радианах, для которого требуется вычислить косеканс' },
        },
    },
    CSCH: {
        description: 'Возвращает значение гиперболического косеканса заданного угла в радианах',
        abstract: 'Возвращает значение гиперболического косеканса заданного угла в радианах',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Угол в радианах, для которого требуется найти гиперболический косеканс.' },
        },
    },
    DECIMAL: {
        description: 'Преобразует текстовое представление числа с указанным основанием в десятичное число',
        abstract: 'Преобразует текстовое представление числа с указанным основанием в десятичное число',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Длина строки текста должна быть меньше или равна 255 символам.' },
            radix: { name: 'основание', detail: 'Основание системы счисления, в которую нужно преобразовать число. Должен быть целым числом, большим или равным 2, но меньшим 36.' },
        },
    },
    DEGREES: {
        description: 'Преобразует радианы в градусы',
        abstract: 'Преобразует радианы в градусы',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'угол', detail: 'Угол в радианах, который необходимо преобразовать в градусы.' },
        },
    },
    EVEN: {
        description: 'Возвращает число, округленное до ближайшего четного целого',
        abstract: 'Возвращает число, округленное до ближайшего четного целого.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
        },
    },
    EXP: {
        description: 'Возвращает число e, возведенное в указанную степень',
        abstract: 'Возвращает число e, возведенное в указанную степень',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Показатель степени, в которую возводится основание e.' },
        },
    },
    FACT: {
        description: 'Возвращает факториал числа',
        abstract: 'Возвращает факториал числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Неотрицательное число, для которого вычисляется факториал. Если число не является целым, оно усекается.' },
        },
    },
    FACTDOUBLE: {
        description: 'Возвращает двойной факториал числа',
        abstract: 'Возвращает двойной факториал числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Значение, для которого вычисляется двойной факториал. Если число не является целым, оно усекается.' },
        },
    },
    FLOOR: {
        description: 'Округляет указанное число до ближайшего указанного кратного значения',
        abstract: 'Округляет указанное число до ближайшего указанного кратного значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
            significance: { name: 'точность', detail: 'Кратное, до которого требуется округлить значение.' },
        },
    },
    FLOOR_MATH: {
        description: 'Округляет число в меньшую сторону до ближайшего целого или до ближайшего кратного указанному значению',
        abstract: 'Округляет число в меньшую сторону до ближайшего целого или до ближайшего кратного указанному значению',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
            significance: { name: 'точность', detail: 'Кратное, до которого требуется округлить значение.' },
            mode: { name: 'режим', detail: 'Определяет, округляются ли отрицательные числа к нулю или от них. ' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Возвращает число, округленное с недостатком до ближайшего целого или до ближайшего кратного разрядности. Число округляется с недостатком независимо от знака',
        abstract: 'Возвращает число, округленное с недостатком до ближайшего целого или до ближайшего кратного разрядности.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
            significance: { name: 'точность', detail: 'Кратное, до которого требуется округлить значение.' },
        },
    },
    GCD: {
        description: 'Возвращает наибольший общий делитель двух или более целых чисел',
        abstract: 'Возвращает наибольший общий делитель двух или более целых чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Чтобы найти первое число наибольшего общего делителя, вы также можете использовать один массив или ссылку на массив вместо параметров, разделенных запятыми.' },
            number2: { name: 'число2', detail: 'Второе число, наибольший общий делитель которого требуется найти. Таким образом можно указать до 255 чисел.' },
        },
    },
    INT: {
        description: 'Округляет число до ближайшего меньшего целого',
        abstract: 'Округляет число до ближайшего меньшего целого',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Вещественное число, округляемое до ближайшего меньшего целого.' },
        },
    },
    ISO_CEILING: {
        description: 'Округляет число вверх до ближайшего целого или до ближайшего кратного указанному значению',
        abstract: 'Округляет число вверх до ближайшего целого или до ближайшего кратного указанному значению',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
            significance: { name: 'точность', detail: 'Кратное, до которого требуется округлить значение.' },
        },
    },
    LCM: {
        description: 'Возвращает наименьшее общее кратное целых чисел',
        abstract: 'Возвращает наименьшее общее кратное целых чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Чтобы найти первое число наименьшего общего кратного, вы также можете использовать один массив или ссылку на массив вместо параметров, разделенных запятыми.' },
            number2: { name: 'число2', detail: 'Второе число, наименьшее общее кратное которого требуется найти. Таким образом можно указать до 255 чисел.' },
        },
    },
    LN: {
        description: 'Возвращает натуральный логарифм числа',
        abstract: 'Возвращает натуральный логарифм числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Положительное вещественное число, для которого вычисляется натуральный логарифм.' },
        },
    },
    LOG: {
        description: 'Возвращает логарифм числа по заданному основанию',
        abstract: 'Возвращает логарифм числа по заданному основанию',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Положительное вещественное число, для которого вычисляется логарифм.' },
            base: { name: 'base', detail: 'Основание логарифма. Если аргумент "основание" опущен, предполагается, что он равен 10.' },
        },
    },
    LOG10: {
        description: 'Возвращает десятичный логарифм числа',
        abstract: 'Возвращает десятичный логарифм числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Положительное вещественное число, для которого вычисляется десятичный логарифм.' },
        },
    },
    MDETERM: {
        description: 'Возвращает определитель матрицы',
        abstract: 'Возвращает определитель матрицы',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'массив', detail: 'Числовой массив с равным количеством строк и столбцов.' },
        },
    },
    MINVERSE: {
        description: 'Возвращает обратную матрицу для матрицы, хранящейся в массиве.',
        abstract: 'Возвращает обратную матрицу для матрицы, хранящейся в массиве.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'массив', detail: 'Числовой массив с равным количеством строк и столбцов.' },
        },
    },
    MMULT: {
        description: 'Возвращает матричное произведение двух массивов',
        abstract: 'Возвращает матричное произведение двух массивов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'массив1', detail: 'Перемножаемые массивы.' },
            array2: { name: 'массив2', detail: 'Перемножаемые массивы.' },
        },
    },
    MOD: {
        description: 'Возвращает остаток от деления аргумента "число" на значение аргумента "делитель". Результат имеет тот же знак, что и делитель',
        abstract: 'Возвращает остаток от деления аргумента "число" на значение аргумента "делитель"',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число, остаток от деления которого требуется определить.' },
            divisor: { name: 'делитель', detail: 'Число, на которое нужно разделить (делитель).' },
        },
    },
    MROUND: {
        description: 'Возвращает число, округленное до нужного кратного',
        abstract: 'Возвращает число, округленное до нужного кратного',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
            multiple: { name: 'точность', detail: 'Точность, с которой требуется округлить число.' },
        },
    },
    MULTINOMIAL: {
        description: 'Возвращает отношение факториала суммы значений к произведению факториалов',
        abstract: 'Возвращает отношение факториала суммы значений к произведению факториалов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Первое значение или диапазон для использования в расчетах.' },
            number2: { name: 'число2', detail: 'Дополнительные значения или диапазоны для использования в расчетах.' },
        },
    },
    MUNIT: {
        description: 'Возвращает матрицу единиц измерения для указанного измерения',
        abstract: 'Возвращает матрицу единиц измерения для указанного измерения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'измерение', detail: 'Размерность — это целое число, определяющее размерность единичной матрицы, которую необходимо возвратить. Она возвращает массив. Размерность должна быть больше нуля.' },
        },
    },
    ODD: {
        description: 'Возвращает число, округленное до ближайшего нечетного целого',
        abstract: 'Возвращает число, округленное до ближайшего нечетного целого.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое значение.' },
        },
    },
    PI: {
        description: 'Возвращает число "пи"',
        abstract: 'Возвращает число "пи"',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Возвращает результат возведения числа в степень',
        abstract: 'Возвращает результат возведения числа в степень',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Базовый номер. Это может быть любое реальное число.' },
            power: { name: 'power', detail: 'Показатель степени, в которую возводится основание.' },
        },
    },
    PRODUCT: {
        description: 'Перемножает все числа, переданные как аргументы, и возвращает произведение',
        abstract: 'Перемножает все числа, переданные как аргументы',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Первый множитель или диапазон множителей.' },
            number2: { name: 'число2', detail: 'Дополнительные множители или диапазоны множителей. Аргументов может быть не более 255.' },
        },
    },
    QUOTIENT: {
        description: 'Возвращает целую часть результата деления с остатком',
        abstract: 'Возвращает целую часть результата деления с остатком',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'числитель', detail: 'Делимое.' },
            denominator: { name: 'знаменатель', detail: 'Делитель.' },
        },
    },
    RADIANS: {
        description: 'Преобразует градусы в радианы',
        abstract: 'Преобразует градусы в радианы',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'угол', detail: 'Величина угла в градусах, которую требуется преобразовать.' },
        },
    },
    RAND: {
        description: 'Возвращает равномерно распределенное случайное вещественное число, большее или равное 0, но меньшее 1',
        abstract: 'Возвращает равномерно распределенное случайное вещественное число, большее или равное 0, но меньшее 1',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Возвращает массив случайных чисел. Вы можете указать количество заполняемых строк и столбцов, минимальное и максимальное значения, а также какие значения необходимо возвращать: целые или десятичные',
        abstract: 'Возвращает массив случайных чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'строки', detail: 'Количество возвращаемых строк.' },
            columns: { name: 'столбцы', detail: 'Количество возвращаемых столбцов.' },
            min: { name: 'минимум', detail: 'Минимальное число, которое нужно вернуть.' },
            max: { name: 'максимум', detail: 'Максимальное число, которое нужно вернуть.' },
            wholeNumber: { name: 'целое число', detail: 'Возврат целого числа или десятичного значения' },
        },
    },
    RANDBETWEEN: {
        description: 'Возвращает случайное целое число, находящееся в диапазоне между двумя заданными числами',
        abstract: 'Возвращает случайное целое число, находящееся в диапазоне между двумя заданными числами',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'нижняя граница', detail: 'Наименьшее целое число, которое возвращает функция RANDBETWEEN' },
            top: { name: 'верхняя граница ', detail: 'Наибольшее целое число, которое возвращает функция RANDBETWEEN' },
        },
    },
    ROMAN: {
        description: 'Преобразует арабское число в римское в текстовом формате',
        abstract: 'Преобразует арабское число в римское в текстовом формате',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Преобразуемое арабское число.' },
            form: { name: 'форма', detail: 'Число, указывающее нужный тип римской цифры. Римский стиль числовых значений варьируется от классического до упрощенного, становясь более кратким по мере увеличения значения формы.' },
        },
    },
    ROUND: {
        description: 'Округляет число до указанного количества дробных разрядов',
        abstract: 'Округляет число до указанного количества дробных разрядов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое числовое значение.' },
            numDigits: { name: 'число разрядов', detail: 'Количество дробных разрядов, до которого требуется округлить число.' },
        },
    },
    ROUNDBANK: {
        description: 'Округляет число по банковскому методу',
        abstract: 'Округляет число по банковскому методу',
        links: [
            {
                title: 'Инструкция',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число, которое вы хотите округлить по банковскому методу.' },
            numDigits: { name: 'число разрядов', detail: 'Количество цифр, до которого вы хотите округлить число при банковском округлении.' },
        },
    },
    ROUNDDOWN: {
        description: 'Округляет число до ближайшего меньшего по модулю значения',
        abstract: 'Округляет число до ближайшего меньшего по модулю значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое числовое значение.' },
            numDigits: { name: 'число разрядов', detail: 'Количество дробных разрядов, до которого требуется округлить число.' },
        },
    },
    ROUNDUP: {
        description: 'Округляет число до ближайшего большего по модулю',
        abstract: 'Округляет число до ближайшего большего по модулю',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Округляемое числовое значение.' },
            numDigits: { name: 'число разрядов', detail: 'Количество дробных разрядов, до которого требуется округлить число.' },
        },
    },
    SEC: {
        description: 'Возвращает секанс угла',
        abstract: 'Возвращает секанс угла',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число — угол в радианах, для которого определяется секанс.' },
        },
    },
    SECH: {
        description: 'Возвращает гиперболический секанс угла',
        abstract: 'Возвращает гиперболический секанс угла',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число — угол в радианах, для которого определяется гиперболический секанс.' },
        },
    },
    SERIESSUM: {
        description: 'Возвращает сумму степенного ряда, вычисленную по формуле',
        abstract: 'Возвращает сумму степенного ряда, вычисленную по формуле',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Значение переменной степенного ряда.' },
            n: { name: 'n', detail: 'Показатель степени x для первого члена степенного ряда.' },
            m: { name: 'm', detail: 'Шаг, на который увеличивается показатель степени n для каждого следующего члена степенного ряда.' },
            coefficients: { name: 'коэффициенты', detail: 'Набор коэффициентов при соответствующих степенях x.' },
        },
    },
    SEQUENCE: {
        description: 'Позволяет создать список последовательных чисел в массиве, например 1, 2, 3, 4.',
        abstract: 'Позволяет создать список последовательных чисел в массиве, например 1, 2, 3, 4.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'строки', detail: 'Количество возвращаемых строк.' },
            columns: { name: 'столбцы', detail: 'Количество возвращаемых столбцов.' },
            start: { name: 'начало', detail: 'Первое число в последовательности.' },
            step: { name: 'шаг', detail: 'Величина приращения каждого последующего значения в массиве.' },
        },
    },
    SIGN: {
        description: 'Определяет знак числа',
        abstract: 'Определяет знак числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Любое вещественное число.' },
        },
    },
    SIN: {
        description: 'Возвращает синус заданного угла',
        abstract: 'Возвращает синус заданного угла',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Угол в радианах, для которого вычисляется синус.' },
        },
    },
    SINH: {
        description: 'Возвращает гиперболический синус числа',
        abstract: 'Возвращает гиперболический синус числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Любое вещественное число.' },
        },
    },
    SQRT: {
        description: 'Возвращает положительное значение квадратного корня',
        abstract: 'Возвращает положительное значение квадратного корня',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число, для которого вычисляется квадратный корень.' },
        },
    },
    SQRTPI: {
        description: 'Возвращает квадратный корень из значения выражения (число * пи).',
        abstract: 'Возвращает квадратный корень из значения выражения (число * пи).',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число, которое умножается на число "пи".' },
        },
    },
    SUBTOTAL: {
        description: 'Возвращает промежуточный итог в список или базу данных',
        abstract: 'Возвращает промежуточный итог в список или базу данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'номер функции', detail: 'Число от 1 до 11 или от 101 до 111, которое обозначает функцию, используемую для расчета промежуточных итогов. Функции с 1 по 11 учитывают строки, скрытые вручную, в то время как функции с 101 по 111 пропускают такие строки; отфильтрованные ячейки всегда исключаются.' },
            ref1: { name: 'ссылка1', detail: 'Первый именованный диапазон или ссылка, для которых требуется вычислить промежуточные итоги.' },
            ref2: { name: 'ссылка2', detail: 'Именованные диапазоны или ссылки 2—254, для которых требуется вычислить промежуточные итоги.' },
        },
    },
    SUM: {
        description: 'Вы можете складывать отдельные значения, диапазоны ячеек, ссылки на ячейки или данные всех этих трех видов.',
        abstract: 'Складывает значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'Число 1',
                detail: 'Первое число для сложения. Это может быть число 4, ссылка на ячейку, например B6, или диапазон ячеек, например B2:B8.',
            },
            number2: {
                name: 'Число 2',
                detail: 'то второе число для сложения. Можно указать до 255 чисел.',
            },
        },
    },
    SUMIF: {
        description: 'Используется, если необходимо просуммировать значения диапазона, соответствующие заданным условиям',
        abstract: 'Складывает ячейки, соответствующие заданным условиям',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: {
                name: 'диапазон',
                detail: 'Диапазон ячеек, оцениваемых на соответствие условиям.',
            },
            criteria: {
                name: 'условие',
                detail: 'Условие в форме числа, выражения, ссылки на ячейку, текста или функции, определяющее, какие ячейки необходимо суммировать. Можно включить подстановочные знаки : вопросительный знак (?) для сопоставления с любым одним символом, звездочка (*) для соответствия любой последовательности символов. Если требуется найти непосредственно вопросительный знак (или звездочку), необходимо поставить перед ним знак "тильда" (~).',
            },
            sumRange: {
                name: 'диапазон суммирования',
                detail: 'Ячейки, значения из которых суммируются, если они отличаются от ячеек, указанных в качестве диапазона. Если аргумент "диапазон суммирования" опущен, Excel суммирует ячейки, указанные в аргументе "диапазон" (те же ячейки, к которым применяется условие).',
            },
        },
    },
    SUMIFS: {
        description: 'Cуммирует все аргументы, удовлетворяющие нескольким условиям',
        abstract: 'Cуммирует все аргументы, удовлетворяющие нескольким условиям',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'диапазон суммирования', detail: 'Диапазон ячеек для суммирования.' },
            criteriaRange1: { name: 'диапазон условия1', detail: ' Диапазон, в котором проверяется "условие1". "Диапазон условия1" и "условие1" составляют пару, определяющую, к какому диапазону применяется определенное условие при поиске. Соответствующие значения найденных в этом диапазоне ячеек суммируются в пределах аргумента "диапазон суммирования".' },
            criteria1: { name: 'условие1', detail: 'Условие, определяющее, какие ячейки суммируются в аргументе "диапазон условия1". Например, условия могут вводится в следующем виде: 32, ">32", B4, "яблоки" или "32".' },
            criteriaRange2: { name: 'диапазон условия2', detail: 'Дополнительный диапазон. Можно ввести до 127 пар диапазонов.' },
            criteria2: { name: 'условие2', detail: 'Дополнительное условие. Можно ввести до 127 пар условий.' },
        },
    },
    SUMPRODUCT: {
        description: 'Возвращает сумму продуктов соответствующих диапазонов или массивов',
        abstract: 'Возвращает сумму продуктов соответствующих диапазонов или массивов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'массив1', detail: 'Первый массив, компоненты которого нужно перемножить, а затем сложить результаты.' },
            array2: { name: 'массив2', detail: 'От 2 до 255 массивов, компоненты которых нужно перемножить, а затем сложить результаты.' },
        },
    },
    SUMSQ: {
        description: 'Возвращает сумму квадратов аргументов',
        abstract: 'Возвращает сумму квадратов аргументов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Чтобы возвести в квадрат и найти первое число, вы также можете использовать один массив или ссылку на массив вместо параметров, разделенных запятыми.' },
            number2: { name: 'число2', detail: 'Второе число, которое нужно возвести в квадрат и суммировать. Можно указать до 255 чисел.' },
        },
    },
    SUMX2MY2: {
        description: 'Возвращает сумму разности квадратов соответствующих значений в двух массивах',
        abstract: 'Возвращает сумму разности квадратов соответствующих значений в двух массивах',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'массив X', detail: 'Первый массив или диапазон значений.' },
            arrayY: { name: 'массив Y', detail: 'Второй массив или диапазон значений.' },
        },
    },
    SUMX2PY2: {
        description: 'Возвращает сумму сумм квадратов соответствующих элементов двух массивов',
        abstract: 'Возвращает сумму сумм квадратов соответствующих элементов двух массивов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'массив X', detail: 'Первый массив или диапазон значений.' },
            arrayY: { name: 'массив Y', detail: 'Второй массив или диапазон значений.' },
        },
    },
    SUMXMY2: {
        description: 'Возвращает сумму квадратов различий соответствующих значений в двух массивах',
        abstract: 'Возвращает сумму квадратов различий соответствующих значений в двух массивах',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'массив X', detail: 'Первый массив или диапазон значений.' },
            arrayY: { name: 'массив Y', detail: 'Второй массив или диапазон значений.' },
        },
    },
    TAN: {
        description: 'Возвращает тангенс заданного угла',
        abstract: 'Возвращает тангенс заданного угла',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Угол в радианах, для которого вычисляется тангенс.' },
        },
    },
    TANH: {
        description: 'Возвращает гиперболический тангенс числа',
        abstract: 'Возвращает гиперболический тангенс числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Любое вещественное число.' },
        },
    },
    TRUNC: {
        description: 'Усекает число до целого числа, удаляя дробную часть числа',
        abstract: 'Усекает число до целого числа, удаляя дробную часть числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Усекаемое число.' },
            numDigits: { name: 'число разрядов', detail: 'Число, определяющее точность усечения. Значение по умолчанию — 0 (нуль).' },
        },
    },
};

export default locale;
