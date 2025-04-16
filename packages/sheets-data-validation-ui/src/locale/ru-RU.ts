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
    dataValidation: {
        title: 'Проверка данных',
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
            add: 'добавить правило',
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
        operators: {
            between: 'между',
            greaterThan: 'больше чем',
            greaterThanOrEqual: 'больше или равно',
            lessThan: 'меньше чем',
            lessThanOrEqual: 'меньше или равно',
            equal: 'равно',
            notEqual: 'не равно',
            notBetween: 'не между',
            legal: 'является допустимым типом',
        },
        ruleName: {
            between: 'между {FORMULA1} и {FORMULA2}',
            greaterThan: 'больше чем {FORMULA1}',
            greaterThanOrEqual: 'больше или равно {FORMULA1}',
            lessThan: 'меньше чем {FORMULA1}',
            lessThanOrEqual: 'меньше или равно {FORMULA1}',
            equal: 'равно {FORMULA1}',
            notEqual: 'не равно {FORMULA1}',
            notBetween: 'не между {FORMULA1} и {FORMULA2}',
            legal: 'является допустимым {TYPE}',
        },
        errorMsg: {
            between: 'Значение должно быть между {FORMULA1} и {FORMULA2}',
            greaterThan: 'Значение должно быть больше {FORMULA1}',
            greaterThanOrEqual: 'Значение должно быть больше или равно {FORMULA1}',
            lessThan: 'Значение должно быть меньше {FORMULA1}',
            lessThanOrEqual: 'Значение должно быть меньше или равно {FORMULA1}',
            equal: 'Значение должно быть равно {FORMULA1}',
            notEqual: 'Значение должно быть не равно {FORMULA1}',
            notBetween: 'Значение должно быть не между {FORMULA1} и {FORMULA2}',
            legal: 'Значение должно быть допустимым {TYPE}',
        },
        any: {
            title: 'Любое значение',
            error: 'Содержимое этой ячейки нарушает правило проверки',
        },
        date: {
            title: 'Дата',
            operators: {
                between: 'между',
                greaterThan: 'после',
                greaterThanOrEqual: 'в или после',
                lessThan: 'до',
                lessThanOrEqual: 'в или до',
                equal: 'равно',
                notEqual: 'не равно',
                notBetween: 'не между',
                legal: 'является допустимой датой',
            },
            ruleName: {
                between: 'между {FORMULA1} и {FORMULA2}',
                greaterThan: 'после {FORMULA1}',
                greaterThanOrEqual: 'в или после {FORMULA1}',
                lessThan: 'до {FORMULA1}',
                lessThanOrEqual: 'в или до {FORMULA1}',
                equal: 'равно {FORMULA1}',
                notEqual: 'не равно {FORMULA1}',
                notBetween: 'не между {FORMULA1} и {FORMULA2}',
                legal: 'является допустимой датой',
            },
            errorMsg: {
                between: 'Значение должно быть между {FORMULA1} и {FORMULA2}',
                greaterThan: 'Значение должно быть после {FORMULA1}',
                greaterThanOrEqual: 'Значение должно быть в или после {FORMULA1}',
                lessThan: 'Значение должно быть до {FORMULA1}',
                lessThanOrEqual: 'Значение должно быть в или до {FORMULA1}',
                equal: 'Значение должно быть {FORMULA1}',
                notEqual: 'Значение должно быть не {FORMULA1}',
                notBetween: 'Значение должно быть не между {FORMULA1} и {FORMULA2}',
                legal: 'Значение должно быть допустимой датой',
            },
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
            errorMsg: {
                between: 'Длина текста должна быть между {FORMULA1} и {FORMULA2}',
                greaterThan: 'Длина текста должна быть больше {FORMULA1}',
                greaterThanOrEqual: 'Длина текста должна быть больше или равна {FORMULA1}',
                lessThan: 'Длина текста должна быть меньше {FORMULA1}',
                lessThanOrEqual: 'Длина текста должна быть меньше или равна {FORMULA1}',
                equal: 'Длина текста должна быть равна {FORMULA1}',
                notEqual: 'Длина текста должна быть не равна {FORMULA1}',
                notBetween: 'Длина текста должна быть не между {FORMULA1} и {FORMULA2}',
            },
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
            ruleName: 'Пользовательская формула {FORMULA1}',
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
    },
};

export default locale;
