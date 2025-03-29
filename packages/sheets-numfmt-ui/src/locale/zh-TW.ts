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
            title: '數字格式',
            numfmtType: '格式類型',
            cancel: '取消',
            confirm: '確認',
            general: '常規',
            accounting: '會計',
            text: '文字',
            number: '數值',
            percent: '百分比',
            scientific: '工程型',
            currency: '貨幣',
            date: '日期',
            time: '時間',
            thousandthPercentile: '千分位符',
            preview: '範例',
            dateTime: '日期時間',
            decimalLength: '小數位數',
            currencyType: '貨幣類型',
            moreFmt: '更多格式',
            financialValue: '財務數值',
            roundingCurrency: '貨幣取整',
            timeDuration: '持續時間',
            currencyDes: '貨幣格式用來表示一般貨幣數值。會計格式可以對一列數值進行小數點對齊',
            accountingDes: '會計數字格式可對一列數值進行貨幣符號和小數點對齊',
            dateType: '日期類型',
            dateDes: '日期格式將日期和時間系列數值品顯示為日期值。',
            negType: '負數型別',
            generalDes: '常規格式不包含任何特定的數字格式。',
            thousandthPercentileDes: '千分位符號格式用於一般數字的表示。貨幣和會計格式則提供貨幣值計算的專用格式。',
            addDecimal: '增加小數位',
            subtractDecimal: '減少小數位',
            customFormat: 'Custom Format',
            customFormatDes: 'Generate custom number formats based on existing formats.',
        },
    },
};

export default locale;
