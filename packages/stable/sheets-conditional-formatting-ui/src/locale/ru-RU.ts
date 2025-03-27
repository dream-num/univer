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
    sheet: {
        cf: {
            title: 'Условное форматирование',
            menu: {
                manageConditionalFormatting: 'Управление условным форматированием',
                createConditionalFormatting: 'Создание условного форматирования',
                clearRangeRules: 'Очистить правила для выбранного диапазона',
                clearWorkSheetRules: 'Очистить правила для всего листа',
            },
            form: {
                lessThan: 'Значение должно быть меньше {0}',
                lessThanOrEqual: 'Значение должно быть меньше или равно {0}',
                greaterThan: 'Значение должно быть больше {0}',
                greaterThanOrEqual: 'Значение должно быть больше или равно {0}',
                rangeSelector: 'Выберите диапазон или введите значение',
            },
            iconSet: {
                direction: 'Направление',
                shape: 'Форма',
                mark: 'Знак',
                rank: 'Ранг',
                rule: 'Правило',
                icon: 'Иконка',
                type: 'Тип',
                value: 'Значение',
                reverseIconOrder: 'Обратный порядок иконок',
                and: 'И',
                when: 'Когда',
                onlyShowIcon: 'Показывать только иконку',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: 'Создать правило',
                clear: 'Очистить все правила',
                range: 'Применить диапазон',
                styleType: 'Тип стиля',
                submit: 'Подтвердить',
                cancel: 'Отменить',
                rankAndAverage: 'Верх/Низ/Среднее',
                styleRule: 'Правило стиля',
                isNotBottom: 'Верх',
                isBottom: 'Низ',
                greaterThanAverage: 'Больше среднего',
                lessThanAverage: 'Меньше среднего',
                medianValue: 'Медианное значение',
                fillType: 'Тип заполнения',
                pureColor: 'Сплошной цвет',
                gradient: 'Градиент',
                colorSet: 'Набор цветов',
                positive: 'Положительный',
                native: 'Отрицательный',
                workSheet: 'Весь лист',
                selectedRange: 'Выбранный диапазон',
                managerRuleSelect: 'Управление правилами {0}',
                onlyShowDataBar: 'Показывать только гистограммы данных',
            },
            preview: {
                describe: {
                    beginsWith: 'Начинается с {0}',
                    endsWith: 'Заканчивается на {0}',
                    containsText: 'Содержит текст {0}',
                    notContainsText: 'Не содержит текст {0}',
                    equal: 'Равно {0}',
                    notEqual: 'Не равно {0}',
                    containsBlanks: 'Содержит пустые ячейки',
                    notContainsBlanks: 'Не содержит пустых ячеек',
                    containsErrors: 'Содержит ошибки',
                    notContainsErrors: 'Не содержит ошибок',
                    greaterThan: 'Больше чем {0}',
                    greaterThanOrEqual: 'Больше или равно {0}',
                    lessThan: 'Меньше чем {0}',
                    lessThanOrEqual: 'Меньше или равно {0}',
                    notBetween: 'Не между {0} и {1}',
                    between: 'Между {0} и {1}',
                    yesterday: 'Вчера',
                    tomorrow: 'Завтра',
                    last7Days: 'Последние 7 дней',
                    thisMonth: 'Этот месяц',
                    lastMonth: 'Прошлый месяц',
                    nextMonth: 'Следующий месяц',
                    thisWeek: 'Эта неделя',
                    lastWeek: 'Прошлая неделя',
                    nextWeek: 'Следующая неделя',
                    today: 'Сегодня',
                    topN: 'Топ {0}',
                    bottomN: 'Низ {0}',
                    topNPercent: 'Топ {0}%',
                    bottomNPercent: 'Низ {0}%',
                },
            },
            operator: {
                beginsWith: 'Начинается с',
                endsWith: 'Заканчивается на',
                containsText: 'Содержит текст',
                notContainsText: 'Не содержит текст',
                equal: 'Равно',
                notEqual: 'Не равно',
                containsBlanks: 'Содержит пустые ячейки',
                notContainsBlanks: 'Не содержит пустых ячеек',
                containsErrors: 'Содержит ошибки',
                notContainsErrors: 'Не содержит ошибок',
                greaterThan: 'Больше чем',
                greaterThanOrEqual: 'Больше или равно',
                lessThan: 'Меньше чем',
                lessThanOrEqual: 'Меньше или равно',
                notBetween: 'Не между',
                between: 'Между',
                yesterday: 'Вчера',
                tomorrow: 'Завтра',
                last7Days: 'Последние 7 дней',
                thisMonth: 'Этот месяц',
                lastMonth: 'Прошлый месяц',
                nextMonth: 'Следующий месяц',
                thisWeek: 'Эта неделя',
                lastWeek: 'Прошлая неделя',
                nextWeek: 'Следующая неделя',
                today: 'Сегодня',
            },
            ruleType: {
                highlightCell: 'Выделение ячеек',
                dataBar: 'Гистограмма данных',
                colorScale: 'Цветовая шкала',
                formula: 'Пользовательская формула',
                iconSet: 'Набор иконок',
                duplicateValues: 'Дублирующиеся значения',
                uniqueValues: 'Уникальные значения',
            },
            subRuleType: {
                uniqueValues: 'Уникальные значения',
                duplicateValues: 'Дублирующиеся значения',
                rank: 'Ранг',
                text: 'Текст',
                timePeriod: 'Период времени',
                number: 'Число',
                average: 'Среднее',
            },
            valueType: {
                num: 'Число',
                min: 'Минимум',
                max: 'Максимум',
                percent: 'Процент',
                percentile: 'Процентиль',
                formula: 'Формула',
                none: 'Нет',
            },
            errorMessage: {
                notBlank: 'Условие не может быть пустым',
                formulaError: 'Ошибка формулы',
                rangeError: 'Bad selection',
            },
        },
    },
};

export default locale;
