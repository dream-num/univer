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
        cf: {
            title: '条件付き書式',
            menu: {
                manageConditionalFormatting: 'ルールの管理',
                createConditionalFormatting: '新しいルール',
                clearRangeRules: '選択したセルからルールをクリア',
                clearWorkSheetRules: 'シート全体からルールをクリア',
            },
            form: {
                lessThan: '{0} より小さい',
                lessThanOrEqual: '{0} 以下',
                greaterThan: '{0} より大きい',
                greaterThanOrEqual: '{0} 以上',
                rangeSelector: '範囲を選択するか値を入力してください',
            },
            iconSet: {
                direction: '方向',
                shape: '図形',
                mark: 'インジケーター',
                rank: '評価',
                rule: 'ルール',
                icon: 'アイコン',
                type: '種類',
                value: '値',
                reverseIconOrder: 'アイコンの順序を逆にする',
                and: 'かつ',
                when: '次の場合',
                onlyShowIcon: 'アイコンのみ表示',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '≥',
                lessThan: '<',
                lessThanOrEqual: '≤',
            },
            panel: {
                createRule: '新しいルール',
                clear: 'ルールのクリア',
                range: '適用先',
                styleType: 'スタイルの種類',
                submit: 'OK',
                cancel: 'キャンセル',
                rankAndAverage: '上位/下位/平均',
                styleRule: '書式ルール',
                isNotBottom: '上位',
                isBottom: '下位',
                greaterThanAverage: '平均より上',
                lessThanAverage: '平均より下',
                medianValue: '中央値',
                fillType: '塗りつぶしの種類',
                pureColor: '単色',
                gradient: 'グラデーション',
                colorSet: 'カラーセット',
                positive: '正の値',
                native: '負の値',
                workSheet: 'このワークシート',
                selectedRange: '現在の選択範囲',
                managerRuleSelect: '{0} の書式ルールを表示',
                onlyShowDataBar: '棒のみ表示',
            },
            preview: {
                describe: {
                    beginsWith: '{0} で始まる',
                    endsWith: '{0} で終わる',
                    containsText: '{0} を含む',
                    notContainsText: '{0} を含まない',
                    equal: '{0} と等しい',
                    notEqual: '{0} と等しくない',
                    containsBlanks: '空白を含む',
                    notContainsBlanks: '空白を含まない',
                    containsErrors: 'エラーを含む',
                    notContainsErrors: 'エラーを含まない',
                    greaterThan: '{0} より大きい',
                    greaterThanOrEqual: '{0} 以上',
                    lessThan: '{0} より小さい',
                    lessThanOrEqual: '{0} 以下',
                    notBetween: '{0} と {1} の間以外',
                    between: '{0} と {1} の間',
                    yesterday: '昨日',
                    tomorrow: '明日',
                    last7Days: '過去 7 日間',
                    thisMonth: '今月',
                    lastMonth: '先月',
                    nextMonth: '来月',
                    thisWeek: '今週',
                    lastWeek: '先週',
                    nextWeek: '来週',
                    today: '今日',
                    topN: '上位 {0}',
                    bottomN: '下位 {0}',
                    topNPercent: '上位 {0}%',
                    bottomNPercent: '下位 {0}%',
                },
            },
            operator: {
                beginsWith: 'で始まる',
                endsWith: 'で終わる',
                containsText: 'を含む',
                notContainsText: 'を含まない',
                equal: 'と等しい',
                notEqual: 'と等しくない',
                containsBlanks: '空白を含む',
                notContainsBlanks: '空白を含まない',
                containsErrors: 'エラーを含む',
                notContainsErrors: 'エラーを含まない',
                greaterThan: 'より大きい',
                greaterThanOrEqual: '以上',
                lessThan: 'より小さい',
                lessThanOrEqual: '以下',
                notBetween: 'の間以外',
                between: 'の間',
                yesterday: '昨日',
                tomorrow: '明日',
                last7Days: '過去 7 日間',
                thisMonth: '今月',
                lastMonth: '先月',
                nextMonth: '来月',
                thisWeek: '今週',
                lastWeek: '先週',
                nextWeek: '来週',
                today: '今日',
            },
            ruleType: {
                highlightCell: 'セルの強調表示ルール',
                dataBar: 'データバー',
                colorScale: 'カラースケール',
                formula: '数式を使用して、書式設定するセルを決定',
                iconSet: 'アイコンセット',
                duplicateValues: '重複する値',
                uniqueValues: '一意の値',
            },
            subRuleType: {
                uniqueValues: '一意の値',
                duplicateValues: '重複する値',
                rank: 'ランク',
                text: '指定の値を含むテキスト',
                timePeriod: '日付',
                number: '数値',
                average: '平均',
            },
            valueType: {
                num: '数値',
                min: '最小値',
                max: '最大値',
                percent: 'パーセント',
                percentile: 'パーセンタイル',
                formula: '数式',
                none: 'なし',
            },
            errorMessage: {
                notBlank: '条件を入力してください。',
                formulaError: '数式が正しくありません。',
                rangeError: '範囲が正しくありません。',
            },
        },
    },
};

export default locale;
