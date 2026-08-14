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
        ribbon: {
            setCheckbox: 'Установить флажок',
            clearCheckbox: 'Очистить флажок',
            dropdownPresetTitle: 'Применить шаблон:',
            editDropdown: 'Изменить варианты',
            clearDropdown: 'Очистить раскрывающийся список',
            dateTime: 'Дата и время',
            presets: {
                yes: 'Да',
                no: 'Нет',
                notStarted: 'Не начато',
                inProgress: 'В процессе',
                completed: 'Завершено',
                option1: 'Вариант 1',
                option2: 'Вариант 2',
            },
        },
        operators: {
            legal: 'является допустимым типом',
        },
        validFail: {
            formulaError: 'Диапазон ссылок содержит невидимые данные, пожалуйста, пересмотрите диапазон',
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
        date: {
            title: 'Дата',
        },
        list: {
            title: 'Выпадающий список',
            add: 'Добавить',
            options: 'Параметры',
            customOptions: 'Пользовательские',
            refOptions: 'Из диапазона',
            edit: 'Редактировать',
        },
        checkbox: {
            title: 'Флажок',
            tips: 'Используйте пользовательские значения в ячейках',
            checked: 'Выбранное значение',
            unchecked: 'Не выбранное значение',
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
