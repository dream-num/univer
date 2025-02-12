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
    'sheets-sort': {
        general: {
            sort: 'Сортировка',
            'sort-asc': 'По возрастанию',
            'sort-desc': 'По убыванию',
            'sort-custom': 'Пользовательская сортировка',
            'sort-asc-ext': 'Расширенная сортировка по возрастанию',
            'sort-desc-ext': 'Расширенная сортировка по убыванию',
            'sort-asc-cur': 'По возрастанию',
            'sort-desc-cur': 'По убыванию',
        },
        error: {
            'merge-size': 'Выбранный диапазон содержит объединенные ячейки разного размера, которые нельзя отсортировать.',
            empty: 'Выбранный диапазон не содержит данных и не может быть отсортирован.',
            single: 'Выбранный диапазон содержит только одну строку и не может быть отсортирован.',
            'formula-array': 'Выбранный диапазон содержит массив формул и не может быть отсортирован.',
        },
        dialog: {
            'sort-reminder': 'Напоминание о сортировке',
            'sort-reminder-desc': 'Расширить сортировку диапазона или оставить сортировку диапазона?',
            'sort-reminder-ext': 'Расширить сортировку диапазона',
            'sort-reminder-no': 'Оставить сортировку диапазона',
            'first-row-check': 'Первая строка контента не участвует в сортировке',
            'add-condition': 'Добавить условие',
            cancel: 'Отмена',
            confirm: 'Подтвердить',
        },
    },
};

export default locale;
