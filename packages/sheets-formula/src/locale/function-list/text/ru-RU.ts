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
    ASC: {
        description: 'Преобразует символы полного (двойного) байта английских букв или катаканы внутри строки символов в символы половинного (одинарного) байта',
        abstract: 'Преобразует символы полного (двойного) байта английских букв или катаканы внутри строки символов в символы половинного (одинарного) байта',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст или ссылка на ячейку с текстом, который необходимо изменить. Если текст не содержит полноширинных знаков, он не изменяется.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Возвращает массив текстовых значений из любого указанного диапазона',
        abstract: 'Возвращает массив текстовых значений из любого указанного диапазона',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'массив', detail: 'Массив, возвращаемый в виде текста.' },
            format: { name: 'формат', detail: 'Формат возвращаемых данных. Это может быть одно из двух значений:\n0 По умолчанию. Краткий формат, удобный для чтения.\n1 Строгий формат, включающий escape-символы и разделители строк. Создает строку, которую можно анализировать при вводе в строку формул. Заключает возвращаемые строки в кавычки, кроме логических значений, чисел и ошибок.' },
        },
    },
    BAHTTEXT: {
        description: 'Преобразует число в текст, используя валютный формат ß (бат)',
        abstract: 'Преобразует число в текст, используя валютный формат ß (бат)',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число, которое нужно преобразовать в текст, ссылка на ячейку, содержащую число, или формула, дающая в результате числовое значение.' },
        },
    },
    CHAR: {
        description: 'Возвращает символ, указанный номером кода',
        abstract: 'Возвращает символ, указанный номером кода',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число от 1 до 255, определяющее нужный знак. Знаки выбираются из набора знаков компьютера.' },
        },
    },
    CLEAN: {
        description: 'Удаляет все непечатаемые символы из текста',
        abstract: 'Удаляет все непечатаемые символы из текста',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Любые данные на листе, из которых нужно удалить непечатаемые знаки.' },
        },
    },
    CODE: {
        description: 'Возвращает числовой код для первого символа в текстовой строке',
        abstract: 'Возвращает числовой код для первого символа в текстовой строке',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст, для которого требуется узнать код первого знака.' },
        },
    },
    CONCAT: {
        description: 'Объединяет текст из нескольких диапазонов и/или строк, но не предоставляет аргументы разделителя или IgnoreEmpty.',
        abstract: 'Объединяет текст из нескольких диапазонов и/или строк, но не предоставляет аргументы разделителя или IgnoreEmpty.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'текст1', detail: 'Элемент текста, который нужно присоединить. Строка или массив строк, например диапазон ячеек.' },
            text2: { name: 'текст2', detail: 'Дополнительные текстовые элементы для объединения. Для текстовых элементов можно указать до 253 аргументов. Каждый из них может быть строкой или массивом строк, например диапазоном ячеек.' },
        },
    },
    CONCATENATE: {
        description: 'Объединяет несколько текстовых элементов в один текстовый элемент',
        abstract: 'Объединяет несколько текстовых элементов в один текстовый элемент',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'Текст 1', detail: 'Первый элемент для объединения. Элемент может быть текстовым значением, числом или ссылкой на ячейку.' },
            text2: { name: 'Текст 2', detail: 'Дополнительные текстовые элементы для объединения. Можно использовать до 255 элементов, общей длиной до 8192 символов.' },
        },
    },
    DBCS: {
        description: 'Преобразует символы половинного (одинарного) байта английских букв или катаканы внутри строки символов в символы полного (двойного) байта',
        abstract: 'Преобразует символы половинного (одинарного) байта английских букв или катаканы внутри строки символов в символы полного (двойного) байта',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст или ссылка на ячейку с текстом, который необходимо изменить. Если текст не содержит полуширинных английских букв или знаков катаканы, он не изменяется.' },
        },
    },
    DOLLAR: {
        description: 'Преобразует число в текст, используя валютный формат $ (доллар)',
        abstract: 'Преобразует число в текст, используя валютный формат $ (доллар)',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число, ссылка на ячейку, содержащую число, или формула, вычисление которой дает число.' },
            decimals: { name: 'число_знаков', detail: 'Число цифр справа от десятичной запятой. Если значение отрицательное, число округляется слева от десятичной запятой. Если аргумент "число_знаков" опущен, то он полагается равным 2.' },
        },
    },
    EXACT: {
        description: 'Проверяет, идентичны ли два текстовых значения',
        abstract: 'Проверяет, идентичны ли два текстовых значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'текст1', detail: 'Первая текстовая строка.' },
            text2: { name: 'текст2', detail: 'Вторая текстовая строка.' },
        },
    },
    FIND: {
        description: 'Находит одно текстовое значение внутри другого (с учетом регистра)',
        abstract: 'Находит одно текстовое значение внутри другого (с учетом регистра)',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'строка поиска', detail: 'Строка, которую нужно найти в «Текст для поиска».' },
            withinText: { name: 'текст для поиска', detail: 'Первое вхождение текста для поиска «строки поиска».' },
            startNum: { name: 'стартовая позиция', detail: 'Позиция символа, с которой начинается поиск в «тексте для поиска». Если опущено, предполагается значение 1.' },
        },
    },
    FINDB: {
        description: 'Находит одно текстовое значение внутри другого (с учетом регистра)',
        abstract: 'Находит одно текстовое значение внутри другого (с учетом регистра)',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'строка поиска', detail: 'Строка, которую нужно найти в «Текст для поиска».' },
            withinText: { name: 'текст для поиска', detail: 'Первое вхождение текста для поиска «строки поиска».' },
            startNum: { name: 'стартовая позиция', detail: 'Позиция символа, с которой начинается поиск в «тексте для поиска». Если опущено, предполагается значение 1.' },
        },
    },
    FIXED: {
        description: 'Форматирует число как текст с фиксированным количеством десятичных знаков',
        abstract: 'Форматирует число как текст с фиксированным количеством десятичных знаков',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'Число, которое требуется округлить и преобразовать в текст.' },
            decimals: { name: 'число_знаков', detail: 'Число цифр справа от десятичной запятой. Если значение отрицательное, число округляется слева от десятичной запятой. Если аргумент "число_знаков" опущен, то он полагается равным 2.' },
            noCommas: { name: 'без_разделителей', detail: 'Логическое значение, которое, если значение TRUE, не позволяет FIXED включать запятые в возвращаемый текст.' },
        },
    },
    LEFT: {
        description: 'Возвращает крайние левые символы из текстового значения',
        abstract: 'Возвращает крайние левые символы из текстового значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текстовая строка, содержащая символы, которые требуется извлечь.' },
            numChars: { name: 'количество_знаков', detail: 'Количество символов, извлекаемых функцией LEFT.' },
        },
    },
    LEFTB: {
        description: 'Возвращает крайние левые символы из текстового значения',
        abstract: 'Возвращает крайние левые символы из текстового значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текстовая строка, содержащая символы, которые требуется извлечь.' },
            numBytes: { name: 'количество_байтов', detail: 'Указывает в байтах количество символов, извлекаемых функцией LEFTB.' },
        },
    },
    LEN: {
        description: 'Возвращает количество символов в текстовой строке',
        abstract: 'Возвращает количество символов в текстовой строке',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст, длину которого вы хотите узнать. Пробелы считаются символами.' },
        },
    },
    LENB: {
        description: 'Возвращает количество байтов, используемых для представления символов в текстовой строке.',
        abstract: 'Возвращает количество байтов, используемых для представления символов в текстовой строке',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст, длину которого вы хотите узнать. Пробелы считаются символами.' },
        },
    },
    LOWER: {
        description: 'Преобразует текст в нижний регистр.',
        abstract: 'Преобразует текст в нижний регистр',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'tекст', detail: 'Текст, преобразуемый в нижний регистр.' },
        },
    },
    MID: {
        description: 'Возвращает определенное количество символов из текстовой строки, начиная с указанной позиции',
        abstract: 'Возвращает определенное количество символов из текстовой строки, начиная с указанной позиции',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текстовая строка, содержащая символы, которые требуется извлечь.' },
            startNum: { name: 'стартовая позиция', detail: 'Позиция первого знака, извлекаемого из текста.' },
            numChars: { name: 'количество_знаков', detail: 'Количество символов, извлекаемых функцией MID.' },
        },
    },
    MIDB: {
        description: 'Возвращает определенное количество символов из текстовой строки, начиная с указанной позиции',
        abstract: 'Возвращает определенное количество символов из текстовой строки, начиная с указанной позиции',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текстовая строка, содержащая символы, которые требуется извлечь.' },
            startNum: { name: 'стартовая позиция', detail: 'Позиция первого знака, извлекаемого из текста.' },
            numBytes: { name: 'количество_байтов', detail: 'Указывает в байтах количество символов, извлекаемых функцией MIDB.' },
        },
    },
    NUMBERSTRING: {
        description: 'Преобразовать числа в китайские строки',
        abstract: 'Преобразовать числа в китайские строки',
        links: [
            {
                title: 'Инструкция',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'Числовой', detail: 'Числовое значение, преобразуемое в китайскую строку.' },
            type: { name: 'тип', detail: 'Тип возвращаемого результата. \n1. Китайские иероглифы в нижнем регистре \n2. Китайские иероглифы в верхнем регистре \n3. Чтение и написание китайских иероглифов' },
        },
    },
    NUMBERVALUE: {
        description: 'Преобразует текст в число независимо от региональных стандартов',
        abstract: 'Преобразует текст в число независимо от региональных стандартов',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст для преобразования в число.' },
            decimalSeparator: { name: 'десятичный_разделитель', detail: 'Символ, который будет использоваться для разделения дробной и целой части результата.' },
            groupSeparator: { name: 'разделитель_групп', detail: 'Символ, используемый для разделения групп цифр, например тысяч от сотен и миллионов от тысяч.' },
        },
    },
    PHONETIC: {
        description: 'Извлекает фонетические (фуригана) символы из текстовой строки',
        abstract: 'Извлекает фонетические (фуригана) символы из текстовой строки',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Ссылка', detail: 'Текст, диапазон или ссылка, содержащие извлекаемый фонетический текст.' },
        },
    },
    PROPER: {
        description: 'Преобразует первый символ каждого слова в текстовом значении в заглавную букву',
        abstract: 'Преобразует первый символ каждого слова в текстовом значении в заглавную букву',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст в кавычках, формула, возвращающая текст, либо ссылка на ячейку, содержащую текст, в котором требуется заменить некоторые буквы на прописные.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Извлекает первые части текста, соответствующие регулярному выражению.',
        abstract: 'Извлекает первые части текста, соответствующие регулярному выражению.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/3098244?hl=ru',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Примечание. Для приведенного выше примера будет возвращено два столбца с данными: один для варианта "извлечь", а второй – для варианта "значений".' },
            regularExpression: { name: 'регулярное_выражение', detail: 'заданное выражение. Будет показано первое совпадение с ним в тексте.' },
        },
    },
    REGEXMATCH: {
        description: 'Проверяет, соответствует ли текст регулярному выражению.',
        abstract: 'Проверяет, соответствует ли текст регулярному выражению.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/3098292?hl=ru',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'текст, в котором проверяется наличие заданного выражения.' },
            regularExpression: { name: 'регулярное_выражение', detail: 'фраза, которую нужно найти в тексте.' },
        },
    },
    REGEXREPLACE: {
        description: 'Заменяет часть строки на другой текст с помощью регулярного выражения.',
        abstract: 'Заменяет часть строки на другой текст с помощью регулярного выражения.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/3098245?hl=ru',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'текст, часть которого нужно заменить.' },
            regularExpression: { name: 'регулярное_выражение', detail: 'регулярное выражение. Все совпадения с ним в тексте будут заменены.' },
            replacement: { name: 'замена', detail: 'текст, который нужно вставить.' },
        },
    },
    REPLACE: {
        description: 'Заменяет символы в тексте',
        abstract: 'Заменяет символы в тексте',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'старый текст', detail: 'Текст, в котором требуется заменить некоторые символы.' },
            startNum: { name: 'стартовая позиция', detail: 'Позиция первого символа заменяемого текста.' },
            numChars: { name: 'количество_знаков', detail: 'Количество символов, замененных функцией REPLACE.' },
            newText: { name: 'текст замены', detail: 'Текст, который заменит символы в старом тексте.' },
        },
    },
    REPLACEB: {
        description: 'Заменяет символы в тексте',
        abstract: 'Заменяет символы в тексте',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'старый текст', detail: 'Текст, в котором требуется заменить некоторые символы.' },
            startNum: { name: 'стартовая позиция', detail: 'Позиция первого символа заменяемого текста.' },
            numBytes: { name: 'количество_байтов', detail: 'Указывает в байтах количество символов, которые заменяет функция REPLACEB.' },
            newText: { name: 'текст замены', detail: 'Текст, который заменит символы в старом тексте.' },
        },
    },
    REPT: {
        description: 'Повторяет текст заданное количество раз',
        abstract: 'Повторяет текст заданное количество раз',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Повторяемый текст.' },
            numberTimes: { name: 'число_повторений', detail: 'Положительное число, определяющее, сколько раз требуется повторить текст.' },
        },
    },
    RIGHT: {
        description: 'Возвращает крайние правые символы из текстового значения',
        abstract: 'Возвращает крайние правые символы из текстового значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текстовая строка, содержащая символы, которые требуется извлечь.' },
            numChars: { name: 'количество_знаков', detail: 'Количество символов, извлекаемых функцией RIGHT.' },
        },
    },
    RIGHTB: {
        description: 'Возвращает крайние правые символы из текстового значения',
        abstract: 'Возвращает крайние правые символы из текстового значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текстовая строка, содержащая символы, которые требуется извлечь.' },
            numBytes: { name: 'количество_байтов', detail: 'Указывает в байтах количество символов, извлекаемых функцией RIGHTB.' },
        },
    },
    SEARCH: {
        description: 'Находит одно текстовое значение внутри другого (без учета регистра)',
        abstract: 'Находит одно текстовое значение внутри другого (без учета регистра)',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'строка поиска', detail: 'Строка, которую нужно найти в «Текст для поиска».' },
            withinText: { name: 'текст для поиска', detail: 'Первое вхождение текста для поиска «строки поиска».' },
            startNum: { name: 'стартовая позиция', detail: 'Позиция символа, с которой начинается поиск в «тексте для поиска». Если опущено, предполагается значение 1.' },
        },
    },
    SEARCHB: {
        description: 'Находит одно текстовое значение внутри другого (без учета регистра)',
        abstract: 'Находит одно текстовое значение внутри другого (без учета регистра)',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'строка поиска', detail: 'Строка, которую нужно найти в «Текст для поиска».' },
            withinText: { name: 'текст для поиска', detail: 'Первое вхождение текста для поиска «строки поиска».' },
            startNum: { name: 'стартовая позиция', detail: 'Позиция символа, с которой начинается поиск в «тексте для поиска». Если опущено, предполагается значение 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Заменяет новый текст на старый текст в строке текста',
        abstract: 'Заменяет новый текст на старый текст в строке текста',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст или ссылка на ячейку, содержащую текст, в котором подставляются знаки.' },
            oldText: { name: 'стар_текст', detail: 'Заменяемый текст.' },
            newText: { name: 'нов_текст', detail: 'Текст, на который заменяется "стар_текст".' },
            instanceNum: { name: 'номер_вхождения', detail: 'Определяет, какое вхождение фрагмента "стар_текст" нужно заменить фрагментом "нов_текст". Если этот аргумент определен, то заменяется только заданное вхождение фрагмента "стар_текст". В противном случае все вхождения фрагмента "стар_текст" в тексте заменяются фрагментом "нов_текст".' },
        },
    },
    T: {
        description: 'Преобразует свои аргументы в текст',
        abstract: 'Преобразует свои аргументы в текст',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Проверяемое значение.' },
        },
    },
    TEXT: {
        description: 'Форматирует число и преобразует его в текст',
        abstract: 'Форматирует число и преобразует его в текст',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Числовое значение, которое вы хотите преобразовать в текст.' },
            formatText: { name: 'формат_текста', detail: 'Строка текста, которая определяет форматирование, которое вы хотите применить к указанному значению.' },
        },
    },
    TEXTAFTER: {
        description: 'Возвращает текст, который находится после указанного символа или строки',
        abstract: 'Возвращает текст, который находится после указанного символа или строки',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст, в котором производится поиск. Использовать подстановочные знаки не разрешено.' },
            delimiter: { name: 'разделитель', detail: 'Текст, помечающий точку, после которой нужно извлечь текст.' },
            instanceNum: { name: 'номер_вхождения', detail: 'Экземпляр разделителя, после которого вы хотите извлечь текст.' },
            matchMode: { name: 'шаблон соответствия', detail: 'Определяет, учитывается ли регистр в текстовом поиске. По умолчанию регистр учитывается.' },
            matchEnd: { name: 'конец матча', detail: 'Рассматривает конец текста как разделитель. По умолчанию текст является точным совпадением.' },
            ifNotFound: { name: 'если не найдено', detail: 'Значение возвращается, если совпадение не найдено. По умолчанию возвращается значение #N/A.' },
        },
    },
    TEXTBEFORE: {
        description: 'Возвращает текст, который находится до указанного символа или строки',
        abstract: 'Возвращает текст, который находится до указанного символа или строки',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст, в котором производится поиск. Использовать подстановочные знаки не разрешено.' },
            delimiter: { name: 'разделитель', detail: 'Текст, помечающий точку, после которой нужно извлечь текст.' },
            instanceNum: { name: 'номер_вхождения', detail: 'Экземпляр разделителя, после которого вы хотите извлечь текст.' },
            matchMode: { name: 'шаблон соответствия', detail: 'Определяет, учитывается ли регистр в текстовом поиске. По умолчанию регистр учитывается.' },
            matchEnd: { name: 'конец матча', detail: 'Рассматривает конец текста как разделитель. По умолчанию текст является точным совпадением.' },
            ifNotFound: { name: 'если не найдено', detail: 'Значение возвращается, если совпадение не найдено. По умолчанию возвращается значение #N/A.' },
        },
    },
    TEXTJOIN: {
        description: 'Объединяет текст из нескольких диапазонов и/или строк',
        abstract: 'Объединяет текст из нескольких диапазонов и/или строк',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'разделитель', detail: 'Текстовая строка (пустая или с символами в двойных кавычках) или ссылка на действительную текстовую строку.' },
            ignoreEmpty: { name: 'игнорировать_пустые', detail: 'В случае значения ИСТИНА игнорирует пустые ячейки.' },
            text1: { name: 'текст1', detail: 'Элемент текста, который нужно присоединить. Текстовая строка или массив строк, например диапазон ячеек.' },
            text2: { name: 'текст2', detail: 'Дополнительные текстовые элементы для объединения. Для текстовых элементов можно указать до 252 аргументов, включая текст1. Каждый из них может быть текстовой строкой или массивом строк, например диапазоном ячеек.' },
        },
    },
    TEXTSPLIT: {
        description: 'Разделяет текстовые строки, используя разделители столбцов и строк',
        abstract: 'Разделяет текстовые строки, используя разделители столбцов и строк',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст, который нужно разделить.' },
            colDelimiter: { name: 'разделитель_столбцов', detail: 'Текст, помечающий точку, в которой текст разлит по столбцам.' },
            rowDelimiter: { name: 'разделитель_строк', detail: 'Текст, помечающий точку, в которую следует слить текст вниз по строкам.' },
            ignoreEmpty: { name: 'игнорировать_пустые', detail: 'В случае значения ИСТИНА игнорирует пустые ячейки.' },
            matchMode: { name: 'шаблон соответствия', detail: 'Определяет, учитывается ли регистр в текстовом поиске. По умолчанию регистр учитывается.' },
            padWith: { name: 'заполняющее_значение', detail: 'Значение, которым нужно дополнить результат. Значение по умолчанию: #N/A.' },
        },
    },
    TRIM: {
        description: 'Удаляет из текста все пробелы, за исключением одиночных пробелов между словами.',
        abstract: 'Удаляет пробелы из текста',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'tекст', detail: 'Текст, из которого удаляются пробелы.' },
        },
    },
    UNICHAR: {
        description: 'Возвращает Юникод-символ, на который ссылается заданное числовое значение',
        abstract: 'Возвращает Юникод-символ, на который ссылается заданное числовое значение',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'число', detail: 'это число Юникод, которое представляет символ.' },
        },
    },
    UNICODE: {
        description: 'Возвращает номер (кодовый пункт), соответствующий первому символу текста',
        abstract: 'Возвращает номер (кодовый пункт), соответствующий первому символу текста',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'это символ, для которого необходимо установить значение Юникод.' },
        },
    },
    UPPER: {
        description: 'Преобразует текст в верхний регистр',
        abstract: 'Преобразует текст в верхний регистр',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'tекст', detail: 'Текст, преобразуемый в верхний регистр.' },
        },
    },
    VALUE: {
        description: 'Преобразует текстовый аргумент в число',
        abstract: 'Преобразует текстовый аргумент в число',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'текст', detail: 'Текст в кавычках или ссылка на ячейку, содержащую текст, который нужно преобразовать.' },
        },
    },
    VALUETOTEXT: {
        description: 'Возвращает текст из любого указанного значения',
        abstract: 'Возвращает текст из любого указанного значения',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'значение', detail: 'Значение, возвращаемое в виде текста.' },
            format: { name: 'формат', detail: 'Формат возвращаемых данных. Это может быть одно из двух значений:\n0 По умолчанию. Краткий формат, удобный для чтения.\n1 Строгий формат, включающий escape-символы и разделители строк. Создает строку, которую можно анализировать при вводе в строку формул. Заключает возвращаемые строки в кавычки, кроме логических значений, чисел и ошибок.' },
        },
    },
    CALL: {
        description: 'Вызывает процедуру в динамической библиотеке или ресурсе кода',
        abstract: 'Вызывает процедуру в динамической библиотеке или ресурсе кода',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Текст модуля', detail: 'Имя библиотеки DLL, содержащей процедуру.' },
            procedure: { name: 'Процедура', detail: 'Имя или порядковый номер процедуры в DLL.' },
            typeText: { name: 'Текст типа', detail: 'Строка, задающая типы данных аргументов и возвращаемого значения.' },
            argument1: { name: 'Аргумент 1', detail: 'Необязательно. Первый аргумент, передаваемый процедуре.' },
        },
    },
    EUROCONVERT: {
        description: 'Преобразует число в евро, преобразует число из евро в валюту страны-члена еврозоны или преобразует число из одной валюты страны-члена еврозоны в другую, используя евро в качестве промежуточного звена (триангуляция)',
        abstract: 'Преобразует число в евро, преобразует число из евро в валюту страны-члена еврозоны или преобразует число из одной валюты страны-члена еврозоны в другую, используя евро в качестве промежуточного звена (триангуляция)',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Число', detail: 'Денежное значение для преобразования.' },
            source: { name: 'Исходная валюта', detail: 'Код исходной валюты.' },
            target: { name: 'Целевая валюта', detail: 'Код целевой валюты.' },
            fullPrecision: { name: 'Полная точность', detail: 'Логическое значение, управляющее округлением по правилам валюты.' },
            triangulationPrecision: { name: 'Точность триангуляции', detail: 'Необязательно. Число значащих цифр при промежуточном преобразовании через евро.' },
        },
    },
    REGISTER_ID: {
        description: 'Возвращает ID регистрации указанной динамической библиотеки (DLL) или ресурса кода, который был ранее зарегистрирован',
        abstract: 'Возвращает ID регистрации указанной динамической библиотеки (DLL) или ресурса кода, который был ранее зарегистрирован',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Текст модуля', detail: 'Имя DLL или ресурса кода, содержащего процедуру.' },
            procedure: { name: 'Процедура', detail: 'Имя или порядковый номер процедуры.' },
            typeText: { name: 'Текст типа', detail: 'Необязательно. Строка, задающая типы данных аргументов и возвращаемого значения.' },
        },
    },
};

export default locale;
