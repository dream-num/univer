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
    'docs-ui': {
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
            },
            fillColor: {
                main: 'Цвет фона текста',
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
            checklist: 'Список задач',
            documentFlavor: 'Современный режим',
            alignLeft: 'Выровнять по левому краю',
            alignCenter: 'Выровнять по центру',
            alignRight: 'Выровнять по правому краю',
            alignJustify: 'Выровнять по ширине',
            horizontalLine: 'Горизонтальная линия',
            headerFooter: 'Верхние и нижние колонтитулы',
            pageSetup: 'Настройки страницы',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                leading1: 'Heading 1',
                leading2: 'Heading 2',
                leading3: 'Heading 3',
                leading4: 'Heading 4',
                leading5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
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
            linkToPrevious: 'Link to previous',
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
        placeholder: {
            heading1: 'Заголовок 1',
            heading2: 'Заголовок 2',
            heading3: 'Заголовок 3',
            heading4: 'Заголовок 4',
            heading5: 'Заголовок 5',
            normalText: 'Введите текст или нажмите «/» для вызова команд',
            listItem: 'Элемент',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Перетащить блок',
            },

            menu: {
                paragraphSetting: 'Настройка абзаца',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Настройка абзаца',
                sectionSetting: 'Section Settings',
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
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Фиксированное значение (px)',
            },
            sectionSetting: {
                selectedSections: '{0} sections selected',
                columnCount: 'Column count',
                columnGap: 'Column gap',
                columnSeparator: 'Separator',
                none: 'None',
                betweenColumns: 'Between columns',
                sectionStart: 'Section start',
                unspecified: 'Unspecified',
                continuous: 'Continuous',
                nextPage: 'Next page',
                evenPage: 'Even page',
                oddPage: 'Odd page',
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
        paragraphMenu: {
            alignAndIndent: 'Выравнивание и отступ',
            align: 'Выравнивание',
            indent: 'Отступ',
            color: 'Цвета',
            increase: 'Увеличить',
            decrease: 'Уменьшить',
            increaseIndent: 'Увеличить отступ',
            decreaseIndent: 'Уменьшить отступ',
            defaultTextColor: 'Цвет текста по умолчанию',
            noBackground: 'Без фона',
        },
        'page-settings': {
            'document-setting': 'Настройки документа',
            mode: 'Режим',
            'modern-mode': 'Современный',
            'classic-mode': 'Классический',
            'modern-width': 'Ширина содержимого',
            'modern-width-narrow': 'Узкая',
            'modern-width-medium': 'Средняя',
            'modern-width-wide': 'Широкая',
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
    },
};

export default locale;
