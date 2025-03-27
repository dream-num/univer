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
    'find-replace': {
        toolbar: 'Найти и заменить',
        shortcut: {
            'open-find-dialog': 'Открыть диалог поиска',
            'open-replace-dialog': 'Открыть диалог замены',
            'close-dialog': 'Закрыть диалог поиска и замены',
            'go-to-next-match': 'Перейти к следующему совпадению',
            'go-to-previous-match': 'Перейти к предыдущему совпадению',
            'focus-selection': 'Фокус на выделении',
        },
        dialog: {
            title: 'Найти',
            find: 'Найти',
            replace: 'Заменить',
            'replace-all': 'Заменить все',
            'case-sensitive': 'С учетом регистра',
            'find-placeholder': 'Найти в этом листе',
            'advanced-finding': 'Расширенный поиск и замена',
            'replace-placeholder': 'Введите строку для замены',
            'match-the-whole-cell': 'Точное совпадение',
            'find-direction': {
                title: 'Направление поиска',
                row: 'Поиск по строкам',
                column: 'Поиск по столбцам',
            },
            'find-scope': {
                title: 'Область поиска',
                'current-sheet': 'Текущий лист',
                workbook: 'Книга',
            },
            'find-by': {
                title: 'Поиск по',
                value: 'Поиск по значению',
                formula: 'Поиск по формуле',
            },
            'no-match': 'Поиск завершен, совпадений не найдено.',
            'no-result': 'Нет результатов',
        },
        replace: {
            'all-success': 'Заменены все {0} совпадений',
            'all-failure': 'Не удалось заменить',
            confirm: {
                title: 'Вы уверены, что хотите заменить все совпадения?',
            },
        },
    },
    'find-replace-shortcuts': 'Найти и заменить',
};

export default locale;
