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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-abs-3420200f-5628-4e8c-99da-c99d7c87713c',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-acos-cb73173f-d089-4582-afa1-76e5524b5d5b',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-acosh-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
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
                url: 'https://support.microsoft.com/ru-ru/office/acot-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-acot-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
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
                url: 'https://support.microsoft.com/ru-ru/office/acoth-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-acoth-cc49480f-f684-4171-9fc5-73e4e852300f',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B0%D0%B3%D1%80%D0%B5%D0%B3%D0%B0%D1%82-43b9278e-6aa7-4f17-92b6-e19993fa26df',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'первое' },
            number2: { name: 'числое2', detail: 'второе' },
        },
    },
    ARABIC: {
        description: 'Преобразует римское число в арабское',
        abstract: 'Преобразует римское число в арабское',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B0%D1%80%D0%B0%D0%B1%D1%81%D0%BA%D0%BE%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B0%D1%80%D0%B0%D0%B1%D1%81%D0%BA%D0%BE%D0%B5-9a8da418-c17b-4ef9-a657-9370a30a674f',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-asin-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-asinh-4e00475a-067a-43cf-926a-765b0249717c',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-atan-50746fa8-630a-406b-81d0-4a2aed395543',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-atan2-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'x', detail: 'X-координата точки.' },
            yNum: { name: 'y', detail: 'Y-координата точки.' },
        },
    },
    ATANH: {
        description: 'Возвращает гиперболический арктангенс числа',
        abstract: 'Возвращает гиперболический арктангенс числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-atanh-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Любое вещественное число в интервале от -1 до 1.' },
        },
    },
    BASE: {
        description: 'Преобразует число в текстовое представление с указанным основанием системы счисления',
        abstract: 'Преобразует число в текстовое представление с указанным основанием системы счисления',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BE%D1%81%D0%BD%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D1%81%D0%BD%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-2ef61411-aee9-4f29-a811-1c42456c6342',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D0%B2%D0%B2%D0%B5%D1%80%D1%85-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BE%D0%BA%D1%80%D0%B2%D0%B2%D0%B5%D1%80%D1%85-%D0%BC%D0%B0%D1%82-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D0%B2%D0%B2%D0%B5%D1%80%D1%85-%D0%BC%D0%B0%D1%82-80f95d2f-b499-4eee-9f16-f795a8e306c8',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D0%B2%D0%B2%D0%B5%D1%80%D1%85-%D1%82%D0%BE%D1%87%D0%BD-f366a774-527a-4c92-ba49-af0a196e66cb',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%87%D0%B8%D1%81%D0%BB%D0%BA%D0%BE%D0%BC%D0%B1-12a3f276-0a21-423a-8de6-06990aaf638a',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%87%D0%B8%D1%81%D0%BB%D0%BA%D0%BE%D0%BC%D0%B1%D0%B0-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%87%D0%B8%D1%81%D0%BB%D0%BA%D0%BE%D0%BC%D0%B1%D0%B0-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-cos-0fb808a5-95d6-4553-8148-22aebdce5f05',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-cosh-e460d426-c471-43e8-9540-a57ff3b70555',
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
                url: 'https://support.microsoft.com/ru-ru/office/cot-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-cot-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
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
                url: 'https://support.microsoft.com/ru-ru/office/coth-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-coth-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
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
                url: 'https://support.microsoft.com/ru-ru/office/csc-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-csc-07379361-219a-4398-8675-07ddc4f135c1',
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
                url: 'https://support.microsoft.com/ru-ru/office/csch-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-csch-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D0%B4%D0%B5%D1%81-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B5%D1%81-ee554665-6176-46ef-82de-0a283658da2e',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B3%D1%80%D0%B0%D0%B4%D1%83%D1%81%D1%8B-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%87%D1%91%D1%82%D0%BD-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-exp-c578f034-2c45-4c37-bc8c-329660a63abe',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%84%D0%B0%D0%BA%D1%82%D1%80-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%B2%D1%84%D0%B0%D0%BA%D1%82%D1%80-e67697ac-d214-48eb-b7b7-cce2589ecac8',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D0%B2%D0%BD%D0%B8%D0%B7-14bb497c-24f2-4e04-b327-b0b4de5a8886',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BE%D0%BA%D1%80%D0%B2%D0%BD%D0%B8%D0%B7-%D0%BC%D0%B0%D1%82-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D0%B2%D0%BD%D0%B8%D0%B7-%D0%BC%D0%B0%D1%82-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D0%B2%D0%BD%D0%B8%D0%B7-%D1%82%D0%BE%D1%87%D0%BD-f769b468-1452-4617-8dc3-02f842a0702e',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BD%D0%BE%D0%B4-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%86%D0%B5%D0%BB%D0%BE%D0%B5-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
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
                url: 'https://support.microsoft.com/ru-ru/office/iso-%D0%BE%D0%BA%D1%80%D0%B2%D0%B2%D0%B5%D1%80%D1%85-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-iso-%D0%BE%D0%BA%D1%80%D0%B2%D0%B2%D0%B5%D1%80%D1%85-e587bb73-6cc2-4113-b664-ff5b09859a83',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'первое' },
            number2: { name: 'число2', detail: 'второе' },
        },
    },
    LCM: {
        description: 'Возвращает наименьшее общее кратное целых чисел',
        abstract: 'Возвращает наименьшее общее кратное целых чисел',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BD%D0%BE%D0%BA-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'Чтобы найти первое число наименьшего общего кратного, вы также можете использовать один массив или ссылку на массив вместо параметров, разделенных запятыми.' },
            number2: { name: 'число2', detail: 'Второе число, наименьшее общее кратное которого требуется найти. Таким образом можно указать до 255 чисел.' },
        },
    },
    LET: {
        description: 'Функция LET присваивает имена результатам вычисления. Это позволяет сохранять промежуточные расчеты, значения и определять имена в формуле',
        abstract: 'Функция LET присваивает имена результатам вычисления',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-let-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'число1', detail: 'первое' },
            number2: { name: 'число2', detail: 'второе' },
        },
    },
    LN: {
        description: 'Возвращает натуральный логарифм числа',
        abstract: 'Возвращает натуральный логарифм числа',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-ln-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-log-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-log10-c75b881b-49dd-44fb-b6f4-37e3486a0211',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BE%D0%BF%D1%80%D0%B5%D0%B4-e7bfa857-3834-422b-b871-0ffd03717020',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%BE%D0%B1%D1%80-11f55086-adde-4c9f-8eb9-59da2d72efc6',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D1%83%D0%BC%D0%BD%D0%BE%D0%B6-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D1%81%D1%82%D0%B0%D1%82-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D1%83%D0%B3%D0%BB%D1%82-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D1%83%D0%BB%D1%8C%D1%82%D0%B8%D0%BD%D0%BE%D0%BC-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BC%D0%B5%D0%B4%D0%B8%D0%BD-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BC%D0%B5%D0%B4%D0%B8%D0%BD-c9fe916a-dc26-4105-997d-ba22799853a3',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BD%D0%B5%D1%87%D1%91%D1%82-deae64eb-e08a-4c88-8b40-6d0b42575c98',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BF%D0%B8-264199d0-a3ba-46b8-975a-c4a04608989b',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%82%D0%B5%D0%BF%D0%B5%D0%BD%D1%8C-d3f2908b-56f4-4c3f-895a-07fb519c362a',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%B5%D0%B4-8e6b5b24-90ee-4650-aeec-80982a0512ce',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%87%D0%B0%D1%81%D1%82%D0%BD%D0%BE%D0%B5-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%87%D0%B0%D1%81%D1%82%D0%BD%D0%BE%D0%B5-9f7bf099-2a18-4282-8fa4-65290cc99dee',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%80%D0%B0%D0%B4%D0%B8%D0%B0%D0%BD%D1%8B-ac409508-3d48-45f5-ac02-1497c92de5bf',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D0%BB%D1%87%D0%B8%D1%81-4cbfa695-8869-4788-8d90-021ea9f5be73',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%81%D0%BB%D1%83%D1%87%D0%BC%D0%B0%D1%81%D1%81%D0%B8%D0%B2-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D0%BB%D1%83%D1%87%D0%BC%D0%B0%D1%81%D1%81%D0%B8%D0%B2-21261e55-3bec-4885-86a6-8b0a47fd4d33',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D0%BB%D1%83%D1%87%D0%BC%D0%B5%D0%B6%D0%B4%D1%83-4cc7f0d1-87dc-4eb7-987f-a469ab381685',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%80%D0%B8%D0%BC%D1%81%D0%BA%D0%BE%D0%B5-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D1%83%D0%B3%D0%BB-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BE%D0%BA%D1%80%D1%83%D0%B3%D0%BB%D0%B2%D0%BD%D0%B8%D0%B7-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D1%83%D0%B3%D0%BB%D0%B2%D0%BD%D0%B8%D0%B7-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BE%D0%BA%D1%80%D1%83%D0%B3%D0%BB%D0%B2%D0%B2%D0%B5%D1%80%D1%85-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D0%BA%D1%80%D1%83%D0%B3%D0%BB%D0%B2%D0%B2%D0%B5%D1%80%D1%85-f8bc9b23-e795-47db-8703-db171d0c42a7',
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
                url: 'https://support.microsoft.com/ru-ru/office/sec-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-sec-ff224717-9c87-4170-9b58-d069ced6d5f7',
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
                url: 'https://support.microsoft.com/ru-ru/office/sech-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-sech-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%80%D1%8F%D0%B4-%D1%81%D1%83%D0%BC%D0%BC-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%80%D1%8F%D0%B4-%D1%81%D1%83%D0%BC%D0%BC-a3ab25b5-1093-4f5b-b084-96c49087f637',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D0%BF%D0%BE%D1%81%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BF%D0%BE%D1%81%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2-57467a98-57e0-4817-9f14-2eb78519ca90',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B7%D0%BD%D0%B0%D0%BA-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
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
                url: 'https://support.microsoft.com/ru-ru/office/sin-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-sin-cf0e3432-8b9e-483c-bc55-a76651c95602',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-sinh-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D1%8C-654975c2-05c4-4831-9a24-2c65e4040fdf',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D1%8C%D0%BF%D0%B8-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BF%D1%80%D0%BE%D0%BC%D0%B5%D0%B6%D1%83%D1%82%D0%BE%D1%87%D0%BD%D1%8B%D0%B5-%D0%B8%D1%82%D0%BE%D0%B3%D0%B8-7b027003-f060-4ade-9040-e478765b9939',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%81%D1%83%D0%BC%D0%BC-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%83%D0%BC%D0%BC-043e1c7d-7726-4e80-8f32-07b23e057f89',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%83%D0%BC%D0%BC%D0%B5%D1%81%D0%BB%D0%B8-169b8c99-c05c-4483-a712-1697a653039b',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%83%D0%BC%D0%BC%D0%B5%D1%81%D0%BB%D0%B8%D0%BC%D0%BD-c9e748f5-7ea7-455d-9406-611cebce642b',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%81%D1%83%D0%BC%D0%BC%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%83%D0%BC%D0%BC%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2-16753e75-9f68-4874-94ac-4d2145a2fd2e',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%83%D0%BC%D0%BC%D0%BA%D0%B2-e3313c02-51cc-4963-aae6-31442d9ec307',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%81%D1%83%D0%BC%D0%BC%D1%80%D0%B0%D0%B7%D0%BD%D0%BA%D0%B2-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%83%D0%BC%D0%BC%D1%80%D0%B0%D0%B7%D0%BD%D0%BA%D0%B2-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%83%D0%BC%D0%BC%D1%81%D1%83%D0%BC%D0%BC%D0%BA%D0%B2-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D1%81%D1%83%D0%BC%D0%BC%D0%BA%D0%B2%D1%80%D0%B0%D0%B7%D0%BD-9d144ac1-4d79-43de-b524-e2ecee23b299',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-tan-08851a40-179f-4052-b789-d7f699447401',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-tanh-017222f0-a0c3-4f69-9787-b3202295dc6c',
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
                url: 'https://support.microsoft.com/ru-ru/office/%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%BE%D1%82%D0%B1%D1%80-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Усекаемое число.' },
            numDigits: { name: 'число разрядов', detail: 'Число, определяющее точность усечения. Значение по умолчанию — 0 (нуль).' },
        },
    },
};

export default locale;
