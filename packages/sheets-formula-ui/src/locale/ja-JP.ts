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
import array from './function-list/array/ja-JP';
import compatibility from './function-list/compatibility/ja-JP';
import cube from './function-list/cube/ja-JP';
import database from './function-list/database/ja-JP';
import date from './function-list/date/ja-JP';
import engineering from './function-list/engineering/ja-JP';
import financial from './function-list/financial/ja-JP';
import information from './function-list/information/ja-JP';
import logical from './function-list/logical/ja-JP';
import lookup from './function-list/lookup/ja-JP';
import math from './function-list/math/ja-JP';
import statistical from './function-list/statistical/ja-JP';
import text from './function-list/text/ja-JP';
import univer from './function-list/univer/ja-JP';
import web from './function-list/web/ja-JP';

const locale: typeof enUS = {
    shortcut: {
        'sheets-formula-ui': {
            'quick-sum': 'クイック合計',
        },
    },
    formula: {
        insert: {
            tooltip: '関数',
            sum: 'SUM',
            average: 'AVERAGE',
            count: 'COUNT',
            max: 'MAX',
            min: 'MIN',
            more: 'その他の関数...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
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
            pasteFormula: '数式を貼り付け',
        },
    },
};

export default locale;
