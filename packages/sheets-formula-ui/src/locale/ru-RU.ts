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

import array from './function-list/array/ru-RU'; // TODO
import compatibility from './function-list/compatibility/ru-RU'; // TODO
import cube from './function-list/cube/ru-RU';
import database from './function-list/database/ru-RU';
import date from './function-list/date/ru-RU'; // TODO
import engineering from './function-list/engineering/ru-RU'; // TODO
import financial from './function-list/financial/ru-RU'; // TODO
import information from './function-list/information/ru-RU'; // TODO
import logical from './function-list/logical/ru-RU'; // TODO
import lookup from './function-list/lookup/ru-RU'; // TODO
import math from './function-list/math/en-US'; // TODO
import statistical from './function-list/statistical/en-US'; // TODO
import text from './function-list/text/ru-RU';
import univer from './function-list/univer/ru-RU';
import web from './function-list/web/ru-RU';

export default {
    formula: {
        insert: {
            tooltip: 'Функции',
            sum: 'СУММ',
            average: 'СРЗНАЧ',
            count: 'СЧЁТ',
            max: 'МАКС',
            min: 'МИН',
            more: 'Другие функции...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
        },
        prompt: {
            helpExample: 'ПРИМЕР',
            helpAbstract: 'ОПИСАНИЕ',
            required: 'Обязательно.',
            optional: 'Необязательно.',
        },
        error: {
            title: 'Ошибка',
            divByZero: 'Ошибка деления на ноль',
            name: 'Ошибка неверного имени',
            value: 'Ошибка в значении',
            num: 'Ошибка числа',
            na: 'Ошибка недоступного значения',
            cycle: 'Ошибка циклической ссылки',
            ref: 'Ошибка неверной ссылки на ячейку',
            spill: 'Диапазон разлива не пуст',
            calc: 'Ошибка вычисления',
            error: 'Ошибка',
            connect: 'Получение данных',
            null: 'Ошибка нулевого значения',
        },

        functionType: {
            financial: 'Финансовые',
            date: 'Дата и время',
            math: 'Математика и тригонометрия',
            statistical: 'Статистические',
            lookup: 'Поиск и ссылки',
            database: 'База данных',
            text: 'Текстовые',
            logical: 'Логические',
            information: 'Информационные',
            engineering: 'Инженерные',
            cube: 'Куб',
            compatibility: 'Совместимость',
            web: 'Веб',
            array: 'Массив',
            univer: 'Универсальные',
            user: 'Пользовательские',
        },
        moreFunctions: {
            confirm: 'Подтвердить',
            prev: 'Предыдущий',
            next: 'Следующий',
            searchFunctionPlaceholder: 'Поиск функции',
            allFunctions: 'Все функции',
            syntax: 'СИНТАКСИС',
        },
        operation: {
            pasteFormula: 'Вставить Формулу',
        },
    },
};
