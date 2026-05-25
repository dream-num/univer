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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'クイック合計',
        },

        insert: {
            tooltip: '関数',
            common: 'よく使う関数',
        },
        prompt: {
            helpExample: '例',
            helpAbstract: '説明',
            required: '必須.',
            optional: '省略.',
        },
        error: {
            title: 'エラー',
            divByZero: '0での除算エラー',
            name: '名前エラー',
            value: '値エラー',
            num: '数値エラー',
            na: '利用できない値エラー',
            cycle: '循環参照エラー',
            ref: '不正なセル参照エラー',
            spill: 'スピル範囲のエラー',
            calc: '計算エラー',
            error: 'エラー',
            connect: 'データ取得中',
            null: 'Null エラー',
        },

        functionType: {
            financial: '財務',
            date: '日付と時刻',
            math: '数学および三角関数',
            statistical: '統計',
            lookup: '検索と参照',
            database: 'データベース',
            text: 'テキスト',
            logical: '論理',
            information: '情報',
            engineering: '工学',
            cube: 'キューブ',
            compatibility: '互換性',
            web: 'Web',
            array: '配列',
            univer: 'Univer',
            user: 'ユーザー定義',
            definedname: '定義済みの名前',
        },
        moreFunctions: {
            confirm: 'OK',
            prev: '前へ',
            next: '次へ',
            searchFunctionPlaceholder: '関数を検索',
            allFunctions: 'すべての関数',
            syntax: '構文',
        },
        operation: {
            copyFormulaOnly: '数式のみをコピー',
            pasteFormula: '数式を貼り付け',
        },

        rangeSelector: {
            title: 'データ範囲の選択',
            addAnotherRange: '範囲を追加',
            buttonTooltip: 'データ範囲を選択',
            placeHolder: '範囲を選択または入力してください。',
            confirm: '確認',
            cancel: 'キャンセル',
        },
    },
};

export default locale;
