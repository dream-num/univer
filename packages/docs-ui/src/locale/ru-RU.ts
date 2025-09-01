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
    toolbar: {
        undo: 'Отменить',
        redo: 'Повторить',
        font: 'Шрифт',
        fontSize: 'Размер шрифта',
        bold: 'Полужирный',
        italic: 'Курсив',
        strikethrough: 'Зачеркнутый',
        subscript: 'Нижний индекс',
        superscript: 'Верхний индекс',
        underline: 'Подчеркнутый',
        textColor: {
            main: 'Цвет текста',
            right: 'Выбрать цвет',
        },
        fillColor: {
            main: 'Цвет фона текста',
            right: 'Выбрать цвет',
        },
        table: {
            main: 'Таблица',
            insert: 'Добавить таблицу',
            colCount: 'Количество столбцов',
            rowCount: 'Количество строк',
        },
        resetColor: 'Сбросить',
        order: 'Упорядоченный список',
        unorder: 'Неупорядоченный список',
        alignLeft: 'Выровнять по левому краю',
        alignCenter: 'Выровнять по центру',
        alignRight: 'Выровнять по правому краю',
        alignJustify: 'Выровнять по ширине',
        horizontalLine: 'Горизонтальная линия',
        headerFooter: 'Верхние и нижние колонтитулы',
        checklist: 'Список задач',
        documentFlavor: 'Современный режим',
        pageSetup: 'Настройки страницы',
    },
    table: {
        insert: 'Вставить',
        insertRowAbove: 'Вставить строку выше',
        insertRowBelow: 'Вставить строку ниже',
        insertColumnLeft: 'Вставить столбец слева',
        insertColumnRight: 'Вставить столбец справа',
        delete: 'Удалить таблицу',
        deleteRows: 'Удалить строку',
        deleteColumns: 'Удалить столбец',
        deleteTable: 'Удалить таблицу',
    },
    headerFooter: {
        header: 'Верхний колонтитул',
        footer: 'Нижний колонтитул',
        panel: 'Настройки верхнего и нижнего колонтитулов',
        firstPageCheckBox: 'Особенная первая страница',
        oddEvenCheckBox: 'Разные четные и нечетные страницы',
        headerTopMargin: 'Верхнее поле верхнего колонтитула (px)',
        footerBottomMargin: 'Нижнее поле нижнего колонтитула (px)',
        closeHeaderFooter: 'Закрыть верхний и нижний колонтитулы',
        disableText: 'Настройки верхнего и нижнего колонтитулов отключены',
    },
    doc: {
        menu: {
            paragraphSetting: 'Настройка абзаца',
        },
        slider: {
            paragraphSetting: 'Настройка абзаца',
        },
        paragraphSetting: {
            alignment: 'Выравнивание',
            indentation: 'Отступ',
            left: 'Левый',
            right: 'Правый',
            firstLine: 'Первая строка',
            hanging: 'Висит',
            spacing: 'Расстояние',
            before: 'До',
            after: 'После',
            lineSpace: 'Высота строки',
            multiSpace: 'Двойной отступ',
            fixedValue: 'Фиксированное значение (px)',
        },
    },
    rightClick: {
        copy: 'Копировать',
        cut: 'Вырезать',
        paste: 'Вставить',
        delete: 'Удалить',
        bulletList: 'Неупорядоченный список',
        orderList: 'Упорядоченный список',
        checkList: 'Список задач',
        insertBellow: 'Вставить ниже',
    },
    'page-settings': {
        'document-setting': 'Настройки документа',
        'page-size': {
            main: 'Размер бумаги',
            a4: 'A4',
            a3: 'A3',
            a5: 'A5',
            b4: 'B4',
            b5: 'B5',
            letter: 'Американский формат',
            legal: 'Юридический формат',
            tabloid: 'Таблоидный формат',
            statement: 'Формат заявления',
            executive: 'Исполнительный формат',
            folio: 'Формат фолио',
        },
        'paper-size': 'Размер бумаги',
        orientation: 'Ориентация',
        portrait: 'Книжная',
        landscape: 'Альбомная',
        'custom-paper-size': 'Пользовательский размер бумаги',
        top: 'Верх',
        bottom: 'Низ',
        left: 'Слева',
        right: 'Справа',
        cancel: 'Отмена',
        confirm: 'Подтвердить',
    },
};

export default locale;
