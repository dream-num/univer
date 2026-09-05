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
import emojiLocale from './emoji-locale/ru-RU.generated';

const locale: typeof enUS = {
    ui: {
        objectPermission: {
            addPeople: 'Add people',
            searchPeople: 'Search people',
            noPeople: 'No people selected',
            noMatchingPeople: 'No matching people',
            canEdit: 'Can edit',
            removePerson: 'Remove',
            confirmPeople: 'Confirm',
            document: 'Document',
            section: 'Section',
            paragraph: 'Paragraph',
            entity: 'Object',
            presentation: 'Presentation',
            page: 'Slide',
            master: 'Master view',
            base: 'Base',
            table: 'Table',
            field: 'Field',
            record: 'Record',
            view: 'View',
            board: 'Board',
            objectName: '{0}: {1}',

            search: 'Search objects',
            empty: 'No matching objects',
            more: 'Showing the first 100 objects. Search to narrow the list.',
            title: 'Permission settings',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving…',
            loading: 'Loading…',
            conflict: 'Permissions changed. Reload before saving.',
            error: 'Could not load or save permissions. Your changes have been kept.',
            reload: 'Reload',
            denied: 'You cannot manage permissions for this object.',
            edit: 'Who can edit',
            all: 'All file editors',
            owner: 'Object owner only',
            members: 'Selected members',
            copy: 'Allow editors to copy',
            print: 'Allow editors to print',
            export: 'Allow editors to export',
            comment: 'Allow editors to comment',
            parentHint: 'File and parent object restrictions still apply.',
        },
        featureSearch: {
            title: 'Поиск функций',
            placeholder: 'Введите название функции или меню...',
            empty: 'Доступные функции не найдены',
            ribbon: 'Лента',
            contextMenu: 'Контекстное меню',
        },
        emojiPicker: {
            search: 'Поиск',
            random: 'Случайный эмодзи',
            recents: 'Недавние',
            emojis: 'Эмодзи',
            animals: 'Животные',
            food: 'Еда',
            activities: 'Активности',
            places: 'Места',
            objects: 'Объекты',
            symbols: 'Символы',
            searchResults: 'Результаты поиска',
            noResults: 'Эмодзи не найден',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Математика',
            greek: 'Греческие буквы',
            common: 'Общие',
        },
        toolbar: {
            heading: {
                normal: 'Обычный текст',
                title: 'Заголовок',
                subTitle: 'Подзаголовок',
                1: 'Заголовок 1',
                2: 'Заголовок 2',
                3: 'Заголовок 3',
                4: 'Заголовок 4',
                5: 'Заголовок 5',
            },
        },
        ribbon: {
            start: 'Начало',
            startDesc: 'Инициализация рабочей таблицы и установка основных параметров.',
            insert: 'Вставка',
            insertDesc: 'Вставка строк, столбцов, графиков и различных других элементов.',
            formulas: 'Формулы',
            formulasDesc: 'Использование функций и формул для вычислений данных.',
            data: 'Данные',
            dataDesc: 'Управление данными, включая импорт, сортировку и фильтрацию.',
            view: 'Вид',
            viewDesc: 'Смена режимов отображения и настройка эффекта отображения.',
            others: 'Другие',
            othersDesc: 'Другие функции и настройки.',
            more: 'Больше',
        },
        fontFamily: {
            'not-supported': 'В системе не найден такой шрифт, используется шрифт по умолчанию.',
        },
        'shortcut-panel': {
            title: 'Сочетания клавиш',
        },
        shortcut: {
            undo: 'Отменить',
            redo: 'Повторить',
            cut: 'Вырезать',
            copy: 'Копировать',
            paste: 'Вставить',
            'shortcut-panel': 'Переключить панель сочетания клавиш',
        },
        'common-edit': 'Общие команды редактирования',
        'toggle-shortcut-panel': 'Переключить панель сочетания клавиш',
        navigation: {
            back: 'Назад',
            previous: 'Предыдущий',
            next: 'Следующий',
        },
        sidebar: {
            panel: 'Боковая панель',
            resize: 'Изменить размер боковой панели',
            close: 'Закрыть боковую панель',
        },
        beforeClose: {
            title: 'Некоторые изменения не сохранены',
        },
        clipboard: {
            authentication: {
                title: 'Доступ запрещен',
                content: 'Пожалуйста, разрешите Univer доступ к вашему буферу обмена.',
            },
        },
        rangeSelector: {
            cancel: 'Отменить',
        },
        'global-shortcut': 'Сочетания клавиш',
        row: 'Строка',
        column: 'Столбец',
    },
};

export default locale;
