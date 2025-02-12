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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Переключить фильтр',
            'clear-filter-criteria': 'Очистить условия фильтра',
            're-calc-filter-conditions': 'Пересчитать условия фильтра',
        },
        command: {
            'not-valid-filter-range': 'Выбранный диапазон содержит только одну строку и не подходит для фильтра.',
        },
        shortcut: {
            'smart-toggle-filter': 'Переключить фильтр',
        },
        panel: {
            'clear-filter': 'Очистить фильтр',
            cancel: 'Отмена',
            confirm: 'Подтвердить',
            'by-values': 'По значениям',
            'by-conditions': 'По условиям',
            'filter-only': 'Только фильтр',
            'search-placeholder': 'Используйте пробел для разделения ключевых слов',
            'select-all': 'Выбрать все',
            'input-values-placeholder': 'Введите значения',
            and: 'И',
            or: 'ИЛИ',
            empty: '(пусто)',
            '?': 'Используйте “?” для обозначения одного символа.',
            '*': 'Используйте “*” для обозначения нескольких символов.',
        },
        conditions: {
            none: 'Нет',
            empty: 'Пусто',
            'not-empty': 'Не пусто',
            'text-contains': 'Содержит текст',
            'does-not-contain': 'Не содержит текст',
            'starts-with': 'Начинается с',
            'ends-with': 'Заканчивается на',
            equals: 'Равно',
            'greater-than': 'Больше чем',
            'greater-than-or-equal': 'Больше или равно',
            'less-than': 'Меньше чем',
            'less-than-or-equal': 'Меньше или равно',
            equal: 'Равно',
            'not-equal': 'Не равно',
            between: 'Между',
            'not-between': 'Не между',
            custom: 'Пользовательский',
        },
        msg: {
            'filter-header-forbidden': 'Вы не можете переместить строку заголовка фильтра.',
        },
        date: {
            1: 'Январь',
            2: 'Февраль',
            3: 'Март',
            4: 'Апрель',
            5: 'Май',
            6: 'Июнь',
            7: 'Июль',
            8: 'Август',
            9: 'Сентябрь',
            10: 'Октябрь',
            11: 'Ноябрь',
            12: 'Декабрь',
        },
    },
};

export default locale;
