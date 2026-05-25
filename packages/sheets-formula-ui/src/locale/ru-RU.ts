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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'Быстрая сумма',
        },

        insert: {
            tooltip: 'Функции',
            common: 'Часто используемые функции',
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
            definedname: 'Defined Name',
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
            copyFormulaOnly: 'Копировать только формулу',
            pasteFormula: 'Вставить Формулу',
        },

        rangeSelector: {
            title: 'Выберите диапазон данных',
            addAnotherRange: 'Добавить диапазон',
            buttonTooltip: 'Выбрать диапазон данных',
            placeHolder: 'Выберите диапазон или введите.',
            confirm: 'Подтвердить',
            cancel: 'Отменить',
        },
    },
};

export default locale;
