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
    sheet: {
        numfmt: {
            title: '表示形式',
            numfmtType: '形式の種類',
            cancel: 'キャンセル',
            confirm: '確認',
            general: '標準',
            accounting: '会計',
            text: '文字列',
            number: '数値',
            percent: 'パーセンテージ',
            scientific: '指数表示',
            currency: '通貨',
            date: '日付',
            time: '時刻',
            thousandthPercentile: '桁区切り',
            preview: 'プレビュー',
            dateTime: '日付と時刻',
            decimalLength: '小数点以下の桁数',
            currencyType: '通貨記号',
            moreFmt: 'その他の表示形式',
            financialValue: '財務値',
            roundingCurrency: '通貨の丸め',
            timeDuration: '時間の長さ',
            currencyDes: '通貨表示形式は一般的な通貨の値を表示するために使用します。会計表示形式は小数点で値を揃えます。',
            accountingDes: '会計表示形式は通貨記号と小数点で値を揃えます。',
            dateType: '日付の種類',
            dateDes: '日付表示形式は日付や時刻の値を所定の日付書式で表示します。',
            negType: '負数の表示形式',
            generalDes: '標準表示形式は特定の数値表示形式を適用しません。',
            thousandthPercentileDes: 'パーセンテージ表示形式は通常の数値をパーセンテージとして表示します。通貨や会計は金額表示に特化しています。',
            addDecimal: '小数点以下の桁数を増やす',
            subtractDecimal: '小数点以下の桁数を減らす',
            customFormat: 'ユーザー定義表示形式',
            customFormatDes: '既存の表示形式を基にユーザー定義の数値表示形式を作成します。',
        },
    },
};

export default locale;
