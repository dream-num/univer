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

const locale = {
    'sheets-table': {
        title: 'Таблица',
        selectRange: 'Выбрать диапазон таблицы',
        rename: 'Переименовать таблицу',
        updateRange: 'Обновить диапазон таблицы',
        tableRangeWithMergeError: 'Диапазон таблицы не может перекрываться с объединенными ячейками',
        tableRangeWithOtherTableError: 'Диапазон таблицы не может перекрываться с другими таблицами',
        tableRangeSingleRowError: 'Диапазон таблицы не может быть одной строкой',
        updateError: 'Невозможно установить диапазон таблицы в область, которая не перекрывается с исходной и не находится в той же строке',
        tableStyle: 'Стиль таблицы',
        defaultStyle: 'Стиль по умолчанию',
        customStyle: 'Пользовательский стиль',
        customTooMore: 'Количество пользовательских тем превышает максимальный лимит, пожалуйста, удалите некоторые ненужные темы и добавьте снова',
        setTheme: 'Установить тему таблицы',
        removeTable: 'Удалить таблицу',
        cancel: 'Отмена',
        confirm: 'Подтвердить',
        header: 'Заголовок',
        footer: 'Нижний колонтитул',
        firstLine: 'Первая строка',
        secondLine: 'Вторая строка',
        columnPrefix: 'Столбец',
        tablePrefix: 'Таблица',

        insert: {
            main: 'Вставить таблицу',
            row: 'Вставить строку таблицы',
            col: 'Вставить столбец таблицы',
        },

        remove: {
            main: 'Удалить таблицу',
            row: 'Удалить строку таблицы',
            col: 'Удалить столбец таблицы',
        },

        condition: {
            string: 'Текст',
            number: 'Число',
            date: 'Дата',

            empty: '(Пусто)',

        },
        string: {
            compare: {
                equal: 'Равно',
                notEqual: 'Не равно',
                contains: 'Содержит',
                notContains: 'Не содержит',
                startsWith: 'Начинается с',
                endsWith: 'Заканчивается на',
            },
        },
        number: {
            compare: {
                equal: 'Равно',
                notEqual: 'Не равно',
                greaterThan: 'Больше',
                greaterThanOrEqual: 'Больше или равно',
                lessThan: 'Меньше',
                lessThanOrEqual: 'Меньше или равно',
                between: 'Между',
                notBetween: 'Не между',
                above: 'Больше',
                below: 'Меньше',
                topN: 'Топ {0}',
            },
        },
        date: {
            compare: {
                equal: 'Равно',
                notEqual: 'Не равно',
                after: 'После',
                afterOrEqual: 'После или равно',
                before: 'До',
                beforeOrEqual: 'До или равно',
                between: 'Между',
                notBetween: 'Не между',
                today: 'Сегодня',
                yesterday: 'Вчера',
                tomorrow: 'Завтра',
                thisWeek: 'На этой неделе',
                lastWeek: 'На прошлой неделе',
                nextWeek: 'На следующей неделе',
                thisMonth: 'В этом месяце',
                lastMonth: 'В прошлом месяце',
                nextMonth: 'В следующем месяце',
                thisQuarter: 'В этом квартале',
                lastQuarter: 'В прошлом квартале',
                nextQuarter: 'В следующем квартале',
                thisYear: 'В этом году',
                nextYear: 'В следующем году',
                lastYear: 'В прошлом году',
                quarter: 'По кварталам',
                month: 'По месяцам',
                q1: 'Первый квартал',
                q2: 'Второй квартал',
                q3: 'Третий квартал',
                q4: 'Четвертый квартал',
                m1: 'Январь',
                m2: 'Февраль',
                m3: 'Март',
                m4: 'Апрель',
                m5: 'Май',
                m6: 'Июнь',
                m7: 'Июль',
                m8: 'Август',
                m9: 'Сентябрь',
                m10: 'Октябрь',
                m11: 'Ноябрь',
                m12: 'Декабрь',
            },
        },
    },
};

export default locale;
