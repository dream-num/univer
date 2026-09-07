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
        accessibility: {
            menu: 'Меню',
            zoom: 'Масштаб',
            zoomIn: 'Увеличить',
            zoomOut: 'Уменьшить',
            resetZoom: 'Сбросить масштаб',
        },
        objectPermission: {
            operationDenied: 'Этот контент защищён. Действие недоступно.',
            remove: 'Удалить защиту',
            roleOwner: 'Владелец файла',
            roleEditor: 'Редактор файла',
            selectedCount: 'Выбрано: {0}',
            searchPeople: 'Поиск пользователей',
            noMatchingPeople: 'Подходящие пользователи не найдены',
            loadMore: 'Загрузить ещё',
            fileHint: 'Состав участников определяется настройками общего доступа к файлу. Эти настройки ограничивают действия участников.',
            documentParent: 'Ограничения на редактирование документа также действуют для этого раздела.',
            paragraphParent: 'Ограничения на редактирование документа и содержащего раздела также действуют для этого абзаца.',
            documentObjectParent: 'Документ, а также разделы и абзацы, содержащие этот объект или служащие его привязкой, также могут ограничивать редактирование.',
            slideParent: 'Ограничения на редактирование презентации также действуют.',
            slideObjectParent: 'Ограничения на редактирование презентации и содержащего слайда или образца также действуют.',
            baseParent: 'Ограничения на редактирование Base также действуют.',
            baseObjectParent: 'Ограничения на редактирование Base и содержащей таблицы также действуют.',
            recordParent: 'Ограничения Base и таблицы сохраняются. Для изменения значения также требуется разрешение на редактирование его поля.',
            boardParent: 'Ограничения на редактирование доски также действуют для этого объекта.',
            ownerInherit: 'Владелец файла, унаследованный доступ',
            peopleError: 'Не удалось загрузить пользователей. Повторите попытку.',
            document: 'Документ',
            section: 'Раздел',
            paragraph: 'Абзац',
            entity: 'Объект',
            presentation: 'Презентация',
            page: 'Слайд',
            master: 'Режим образца',
            base: 'Base',
            table: 'Таблица',
            field: 'Поле',
            record: 'Запись',
            view: 'Представление',
            board: 'Доска',
            objectName: '{0}: {1}',

            search: 'Поиск объектов',
            empty: 'Подходящие объекты не найдены',
            more: 'Показаны первые 100 объектов. Используйте поиск, чтобы сузить список.',
            title: 'Права доступа',
            cancel: 'Отмена',
            save: 'Сохранить',
            saving: 'Сохранение…',
            loading: 'Загрузка…',
            conflict: 'Разрешения изменились. Перезагрузите их перед сохранением.',
            error: 'Не удалось загрузить или сохранить разрешения. Ваши изменения сохранены.',
            reload: 'Перезагрузить',
            denied: 'Вы не можете управлять разрешениями для этого объекта.',
            edit: 'Кто может редактировать',
            all: 'Все редакторы файла',
            owner: 'Только владелец объекта',
            members: 'Выбранные участники',
            copy: 'Разрешить редакторам копирование',
            print: 'Разрешить редакторам печать',
            export: 'Разрешить редакторам экспорт',
            comment: 'Разрешить редакторам комментарии',
            parentHint: 'Ограничения файла и родительского объекта сохраняются.',
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
