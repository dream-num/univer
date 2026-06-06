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
    'sheets-data-validation-ui': {
        title: 'Проверка данных',
        operators: {
            legal: 'является допустимым типом',
        },
        validFail: {
            value: 'Пожалуйста, введите значение',
            common: 'Пожалуйста, введите значение или формулу',
            number: 'Пожалуйста, введите число или формулу',
            formula: 'Пожалуйста, введите формулу',
            integer: 'Пожалуйста, введите целое число или формулу',
            date: 'Пожалуйста, введите дату или формулу',
            list: 'Пожалуйста, введите параметры',
            listInvalid: 'Источник списка должен быть разделенным списком или ссылкой на одну строку или столбец',
            checkboxEqual: 'Для выбранных и не выбранных ячеек введите разные значения',
            formulaError: 'Диапазон ссылок содержит невидимые данные, пожалуйста, пересмотрите диапазон',
            listIntersects: 'Выбранный диапазон не может пересекаться с диапазоном правила.',
            primitive: 'Формулы не разрешены для пользовательских отмеченных и неотмеченных значений.',
        },
        panel: {
            title: 'Управление проверкой данных',
            addTitle: 'Создать новую проверку данных',
            removeAll: 'Удалить все',
            add: 'Добавить правило',
            range: 'Диапазоны',
            rangeError: 'Диапазоны не являются законными',
            type: 'Тип',
            options: 'Дополнительные параметры',
            operator: 'Оператор',
            removeRule: 'Удалить',
            done: 'Готово',
            formulaPlaceholder: 'Пожалуйста, введите значение или формулу',
            valuePlaceholder: 'Пожалуйста, введите значение',
            formulaAnd: 'и',
            invalid: 'Недопустимо',
            showWarning: 'Показать предупреждение',
            rejectInput: 'Отклонить ввод',
            messageInfo: 'Сообщение помощи',
            showInfo: 'Показать текст помощи для выбранной ячейки',
            allowBlank: 'Игнорировать пустые значения',
        },
        any: {
            title: 'Любое значение',
            error: 'Содержимое этой ячейки нарушает правило проверки',
        },
        date: {
            title: 'Дата',
        },
        list: {
            title: 'Выпадающий список',
            name: 'Значение содержит одно из диапазона',
            error: 'Ввод должен соответствовать указанному диапазону',
            emptyError: 'Пожалуйста, введите значение',
            add: 'Добавить',
            dropdown: 'Выбрать',
            options: 'Параметры',
            customOptions: 'Пользовательские',
            refOptions: 'Из диапазона',
            formulaError: 'Источник списка должен быть разделенным списком данных или ссылкой на одну строку или столбец.',
            edit: 'Редактировать',
        },
        listMultiple: {
            title: 'Выпадающий список - Множественный',
            dropdown: 'Множественный выбор',
        },
        textLength: {
            title: 'Длина текста',
        },
        decimal: {
            title: 'Число',
        },
        whole: {
            title: 'Целое число',
        },
        checkbox: {
            title: 'Флажок',
            error: 'Содержимое этой ячейки нарушает правило проверки',
            tips: 'Используйте пользовательские значения в ячейках',
            checked: 'Выбранное значение',
            unchecked: 'Не выбранное значение',
        },
        custom: {
            title: 'Пользовательская формула',
            error: 'Содержимое этой ячейки нарушает правило проверки',
            validFail: 'Пожалуйста, введите допустимую формулу',
        },
        alert: {
            title: 'Ошибка',
            ok: 'OK',
        },
        error: {
            title: 'Недопустимо:',
        },
        renderMode: {
            arrow: 'Стрелка',
            chip: 'Чип',
            text: 'Обычный текст',
            label: 'Стиль отображения',
        },
        showTime: {
            label: 'Показать выбор времени',
        },
        permission: {
            dialog: {
                setStyleErr: 'Диапазон защищен, и у вас нет разрешения на установку стилей. Для установки стилей свяжитесь с создателем.',
            },
        },
    },
};

export default locale;
