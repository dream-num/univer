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
    'find-replace': {
        toolbar: 'Найти и заменить',
        shortcut: {
            'open-find-dialog': 'Открыть диалоговое окно поиска',
            'open-replace-dialog': 'Открыть диалоговое окно замены',
            'close-dialog': 'Закрыть диалоговое окно поиска и замены',
            'go-to-next-match': 'Перейти к следующему совпадению',
            'go-to-previous-match': 'Перейти к предыдущему совпадению',
            'focus-selection': 'Фокус на выделении',
            panel: 'Найти и заменить',
        },
        dialog: {
            title: 'Найти',
            find: 'Найти',
            replace: 'Заменить',
            'replace-all': 'Заменить все',
            'case-sensitive': 'Учитывать регистр',
            'find-placeholder': 'Найти на этом листе',
            'advanced-finding': 'Расширенный поиск и замена',
            'replace-placeholder': 'Введите строку для замены',
            'match-the-whole-cell': 'Соответствие всей ячейке',
            'find-direction': {
                title: 'Направление поиска',
                row: 'Искать по строкам',
                column: 'Искать по столбцам',
            },
            'find-scope': {
                title: 'Диапазон поиска',
                'current-sheet': 'Текущий лист',
                workbook: 'Книга',
            },
            'find-by': {
                title: 'Искать по',
                value: 'Искать по значению',
                formula: 'Искать формулу',
            },
            'no-match': 'Поиск завершен, но совпадений не найдено.',
            'no-result': 'Нет результатов',
        },
        replace: {
            'all-success': 'Заменены все совпадения: {0}',
            'partial-success': 'Заменено совпадений: {0}, не удалось заменить: {1}',
            'all-failure': 'Ошибка замены',
            confirm: {
                title: 'Вы уверены, что хотите заменить все совпадения?',
            },
        },
        button: {
            confirm: 'ОК',
            cancel: 'Отмена',
        },
    },
};

export default locale;
