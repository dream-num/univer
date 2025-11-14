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
    'sheets-table': {
        title: '表',
        selectRange: '表の範囲を選択',
        rename: '表の名前を変更',
        updateRange: '表の範囲を更新',
        tableRangeWithMergeError: '表の範囲は結合セルと重複できません',
        tableRangeWithOtherTableError: '表の範囲は他の表と重複できません',
        tableRangeSingleRowError: '表の範囲は1行のみでは構成できません',
        updateError: '表の範囲は元の範囲と重複しない、または同じ行上にない場合に設定できます',
        tableStyle: '表のスタイル',
        defaultStyle: '既定のスタイル',
        customStyle: 'ユーザー設定のスタイル',
        customTooMore: 'ユーザー定義テーマの数が上限を超えています。いくつか削除してから再度追加してください',
        setTheme: '表のテーマを設定',
        removeTable: '表を削除',
        cancel: 'キャンセル',
        confirm: '確認',
        header: 'ヘッダー',
        footer: 'フッター',
        firstLine: '先頭行',
        secondLine: '2行目',
        columnPrefix: '列',
        tablePrefix: '表',
        tableNameError: '表の名前は空白を含めることはできず、数字で始めることはできず、既存の表名と重複できません',

        insert: {
            main: '表を挿入',
            row: '表の行を挿入',
            col: '表の列を挿入',
        },

        remove: {
            main: '表を削除',
            row: '表の行を削除',
            col: '表の列を削除',
        },
        condition: {
            string: '文字列',
            number: '数値',
            date: '日付',

            empty: '(空白)',
        },
        string: {
            compare: {
                equal: '等しい',
                notEqual: '等しくない',
                contains: '含む',
                notContains: '含まない',
                startsWith: '前方一致',
                endsWith: '後方一致',
            },
        },
        number: {
            compare: {
                equal: '等しい',
                notEqual: '等しくない',
                greaterThan: 'より大きい',
                greaterThanOrEqual: '以上',
                lessThan: 'より小さい',
                lessThanOrEqual: '以下',
                between: '範囲内',
                notBetween: '範囲外',
                above: 'より大きい',
                below: 'より小さい',
                topN: '上位 {0} 件',
            },
        },
        date: {
            compare: {
                equal: '同じ日付',
                notEqual: '異なる日付',
                after: '以降',
                afterOrEqual: '以降または同じ',
                before: '以前',
                beforeOrEqual: '以前または同じ',
                between: '範囲内',
                notBetween: '範囲外',
                today: '今日',
                yesterday: '昨日',
                tomorrow: '明日',
                thisWeek: '今週',
                lastWeek: '先週',
                nextWeek: '来週',
                thisMonth: '今月',
                lastMonth: '先月',
                nextMonth: '来月',
                thisQuarter: '今四半期',
                lastQuarter: '前四半期',
                nextQuarter: '次の四半期',
                thisYear: '今年',
                nextYear: '来年',
                lastYear: '昨年',
                quarter: '四半期',
                month: '月別',
                q1: '第1四半期',
                q2: '第2四半期',
                q3: '第3四半期',
                q4: '第4四半期',
                m1: '1月',
                m2: '2月',
                m3: '3月',
                m4: '4月',
                m5: '5月',
                m6: '6月',
                m7: '7月',
                m8: '8月',
                m9: '9月',
                m10: '10月',
                m11: '11月',
                m12: '12月',
            },
        },
        filter: {
            'by-values': '値でフィルタ',
            'by-conditions': '条件でフィルタ',
            'clear-filter': 'フィルタをクリア',
            cancel: 'キャンセル',
            confirm: '確認',
            'search-placeholder': '検索語はスペースで区切る',
            'select-all': 'すべて選択',
        },
    },
};

export default locale;
