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
    'sheets-data-validation': {
        operators: {
            between: '次の値の間',
            greaterThan: '次の値より大きい',
            greaterThanOrEqual: '次の値以上',
            lessThan: '次の値より小さい',
            lessThanOrEqual: '次の値以下',
            equal: '次の値に等しい',
            notEqual: '次の値に等しくない',
            notBetween: '次の値の間以外',
            legal: '有効な形式',
        },
        ruleName: {
            between: '{FORMULA1} と {FORMULA2} の間',
            greaterThan: '{FORMULA1} より大きい',
            greaterThanOrEqual: '{FORMULA1} 以上',
            lessThan: '{FORMULA1} より小さい',
            lessThanOrEqual: '{FORMULA1} 以下',
            equal: '{FORMULA1} に等しい',
            notEqual: '{FORMULA1} に等しくない',
            notBetween: '{FORMULA1} と {FORMULA2} の間以外',
            legal: '有効な {TYPE} 形式',
        },
        errorMsg: {
            between: '値は {FORMULA1} と {FORMULA2} の間である必要があります',
            greaterThan: '値は {FORMULA1} より大きい必要があります',
            greaterThanOrEqual: '値は {FORMULA1} 以上である必要があります',
            lessThan: '値は {FORMULA1} より小さい必要があります',
            lessThanOrEqual: '値は {FORMULA1} 以下である必要があります',
            equal: '値は {FORMULA1} に等しい必要があります',
            notEqual: '値は {FORMULA1} に等しくない必要があります',
            notBetween: '値は {FORMULA1} と {FORMULA2} の間以外である必要があります',
            legal: '値は有効な {TYPE} 形式である必要があります',
        },
        date: {
            operators: {
                between: '次の値の間',
                greaterThan: '次の値より大きい',
                greaterThanOrEqual: '次の値以上',
                lessThan: '次の値より小さい',
                lessThanOrEqual: '次の値以下',
                equal: '次の値に等しい',
                notEqual: '次の値に等しくない',
                notBetween: '次の値の間以外',
                legal: '有効な日付',
            },
            ruleName: {
                between: '{FORMULA1} と {FORMULA2} の間',
                greaterThan: '{FORMULA1} より後',
                greaterThanOrEqual: '{FORMULA1} 以降',
                lessThan: '{FORMULA1} より前',
                lessThanOrEqual: '{FORMULA1} 以前',
                equal: '{FORMULA1} に等しい',
                notEqual: '{FORMULA1} に等しくない',
                notBetween: '{FORMULA1} と {FORMULA2} の間以外',
                legal: '有効な日付',
            },
            errorMsg: {
                between: '値は有効な日付で、{FORMULA1} と {FORMULA2} の間である必要があります',
                greaterThan: '値は有効な日付で、{FORMULA1} より後である必要があります',
                greaterThanOrEqual: '値は有効な日付で、{FORMULA1} 以降である必要があります',
                lessThan: '値は有効な日付で、{FORMULA1} より前である必要があります',
                lessThanOrEqual: '値は有効な日付で、{FORMULA1} 以前である必要があります',
                equal: '値は有効な日付で、{FORMULA1} に等しい必要があります',
                notEqual: '値は有効な日付で、{FORMULA1} に等しくない必要があります',
                notBetween: '値は有効な日付で、{FORMULA1} と {FORMULA2} の間以外である必要があります',
                legal: '値は有効な日付である必要があります',
            },
            title: '日付',
        },
        textLength: {
            errorMsg: {
                between: '文字列の長さは {FORMULA1} と {FORMULA2} の間である必要があります',
                greaterThan: '文字列の長さは {FORMULA1} より長い必要があります',
                greaterThanOrEqual: '文字列の長さは {FORMULA1} 以上である必要があります',
                lessThan: '文字列の長さは {FORMULA1} より短い必要があります',
                lessThanOrEqual: '文字列の長さは {FORMULA1} 以下である必要があります',
                equal: '文字列の長さは {FORMULA1} に等しい必要があります',
                notEqual: '文字列の長さは {FORMULA1} に等しくない必要があります',
                notBetween: '文字列の長さは {FORMULA1} と {FORMULA2} の間以外である必要があります',
            },
            title: '文字列の長さ',
        },
        custom: {
            ruleName: 'ユーザー設定数式: {FORMULA1}',
            title: 'ユーザー設定',
            validFail: '有効な数式を入力してください',
            error: 'このセルの内容は入力規則に違反しています',
        },
        validFail: {
            value: '値を入力してください',
            common: '値または数式を入力してください',
            number: '数値または数式を入力してください',
            formula: '数式を入力してください',
            integer: '整数または数式を入力してください',
            date: '日付または数式を入力してください',
            list: 'リストのオプションを入力してください',
            listInvalid: 'リスト元の値は、区切りリスト、または単一の行または列の参照である必要があります',
            checkboxEqual: 'チェックされた値とチェックされていない値には異なる値を入力してください',
            formulaError: '参照範囲に見えないデータが含まれています。範囲を再設定してください',
            listIntersects: '選択した範囲はルール範囲と重なることはできません',
            primitive: 'カスタムの選択/未選択値には数式を使用できません',
        },
        any: {
            title: 'すべての値',
            error: 'このセルの内容は入力規則に違反しています',
        },
        list: {
            title: 'リスト',
            name: 'リスト範囲内の値',
            error: '入力値は指定された範囲内にある必要があります',
            emptyError: '値を入力してください',
            add: '追加',
            dropdown: 'ドロップダウンリストから選択する',
            options: 'オプション',
            customOptions: 'カスタム',
            refOptions: '範囲を参照',
            formulaError: 'リスト元の値は、区切りリスト、または単一の行または列の参照である必要があります',
            edit: '編集',
        },
        listMultiple: {
            title: '複数選択リスト',
            dropdown: '複数項目を選択',
        },
        decimal: {
            title: '小数点数',
        },
        whole: {
            title: '整数',
        },
        checkbox: {
            title: 'チェックボックス',
            error: 'このセルの内容は入力規則に違反しています',
            tips: 'セル内のカスタム値を使用してください',
            checked: 'チェックされた値',
            unchecked: 'チェックされていない値',
        },
    },
};

export default locale;
