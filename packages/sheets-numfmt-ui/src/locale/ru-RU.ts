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
        numfmt: {
            title: 'Формат числа',
            numfmtType: 'Типы форматов',
            cancel: 'Отмена',
            confirm: 'Подтвердить',
            general: 'Общий',
            accounting: 'Бухгалтерский',
            text: 'Текст',
            number: 'Число',
            percent: 'Процент',
            scientific: 'Экспоненциальный',
            currency: 'Валюта',
            date: 'Дата',
            time: 'Время',
            thousandthPercentile: 'Разделитель тысяч',
            preview: 'Предпросмотр',
            dateTime: 'Дата и время',
            decimalLength: 'Десятичные знаки',
            currencyType: 'Символ валюты',
            moreFmt: 'Другие форматы',
            financialValue: 'Финансовое значение',
            roundingCurrency: 'Округление валюты',
            timeDuration: 'Продолжительность времени',
            currencyDes: 'Формат валюты используется для представления общих значений валюты. Формат бухгалтерского учета выравнивает столбец значений по десятичным точкам.',
            accountingDes: 'Формат бухгалтерских чисел выравнивает столбец значений по символам валюты и десятичным точкам.',
            dateType: 'Тип даты',
            dateDes: 'Формат даты представляет значения времени и даты как значения даты.',
            negType: 'Тип отрицательного числа',
            generalDes: 'Обычный формат не содержит никакого специфического формата числа.',
            thousandthPercentileDes: 'Формат процента используется для представления обычных чисел. Монетарные и бухгалтерские форматы предоставляют специальный формат для вычислений монетарных значений.',
            addDecimal: 'Увеличить количество десятичных знаков',
            subtractDecimal: 'Уменьшить количество десятичных знаков',
            customFormat: 'Custom Format',
            customFormatDes: 'Generate custom number formats based on existing formats.',
        },
    },
};

export default locale;
