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
            title: '條件格式',
            menu: {
                manageConditionalFormatting: '管理條件格式',
                createConditionalFormatting: '新建條件格式',
                clearRangeRules: '清除所選區域的規則',
                clearWorkSheetRules: '清除整個工作表的規則',

            },
            form: {
                lessThan: '該值必須小於 {0}',
                lessThanOrEqual: '該值必須小於等於 {0}',
                greaterThan: '該值必大於 {0}',
                greaterThanOrEqual: '該值必大於等於 {0}',
                rangeSelector: '選擇範圍或輸入值',
            },
            iconSet: {
                direction: '方向',
                shape: '形狀',
                mark: '標記',
                rank: '等級',
                rule: '規則',
                icon: '圖示',
                type: '類型',
                value: '值',
                reverseIconOrder: '反轉圖示次序',
                and: '且',
                when: '當值',
                onlyShowIcon: '僅顯示圖示',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: '新增規則',
                clear: '清空所有規則',
                range: '應用範圍',
                styleType: '樣式類型',
                submit: '確認',
                cancel: '取消',
                rankAndAverage: '最前/最後/平均',
                styleRule: '樣式規則',
                isNotBottom: '最前面',
                isBottom: '最後',
                greaterThanAverage: '大於平均值',
                lessThanAverage: '小於平均值',
                medianValue: '中間值',
                fillType: '填滿方式',
                pureColor: '純色',
                gradient: '漸層',
                colorSet: '顏色設定',
                positive: '正值',
                native: '負值',
                workSheet: '整張工作表',
                selectedRange: '所選儲存格',
                managerRuleSelect: '管理 {0} 的規則',
                onlyShowDataBar: '僅顯示資料條',
            },
            preview: {
                describe: {
                    beginsWith: '開頭為{0}',
                    endsWith: '結尾為{0}',
                    containsText: '文字包含{0}',
                    notContainsText: '文字不包含{0}',
                    equal: '等於{0}',
                    notEqual: '不等於{0}',
                    containsBlanks: '為空',
                    notContainsBlanks: '不為空',
                    containsErrors: '錯誤',
                    notContainsErrors: '非錯誤',
                    greaterThan: '大於{0}',
                    greaterThanOrEqual: '大於等於{0}',
                    lessThan: '小於{0}',
                    lessThanOrEqual: '小於等於{0}',
                    notBetween: '不介於{0}和{1}之間',
                    between: '介於{0}和{1}之間',
                    yesterday: '昨日',
                    tomorrow: '明日',
                    last7Days: '最近7天',
                    thisMonth: '本月',
                    lastMonth: '上個月',
                    nextMonth: '下個月',
                    thisWeek: '本週',
                    lastWeek: '上週',
                    nextWeek: '下週',
                    today: '今日',
                    topN: '前{0}項',
                    bottomN: '後{0}項',
                    topNPercent: '前{0}%',
                    bottomNPercent: '後{0}%',
                },
            },
            operator: {
                beginsWith: '開頭為',
                endsWith: '結尾為',
                containsText: '文字包含',
                notContainsText: '文字不包含',
                equal: '等於',
                notEqual: '不等於',
                containsBlanks: '為空',
                notContainsBlanks: '不為空',
                containsErrors: '錯誤',
                notContainsErrors: '非錯誤',
                greaterThan: '大於',
                greaterThanOrEqual: '大於等於',
                lessThan: '小於',
                lessThanOrEqual: '小於等於',
                notBetween: '不介於',
                between: '介於',
                yesterday: '昨日',
                tomorrow: '明日',
                last7Days: '最近 7 天',
                thisMonth: '本月',
                lastMonth: '上個月',
                nextMonth: '下個月',
                thisWeek: '本週',
                lastWeek: '上週',
                nextWeek: '下週',
                today: '今日',
            },
            ruleType: {
                highlightCell: '突出顯示單元格',
                dataBar: '資料條',
                colorScale: '色階',
                formula: '自訂公式',
                iconSet: '圖標集',
                duplicateValues: '重複值',
                uniqueValues: '唯一值',

            },
            subRuleType: {
                uniqueValues: '唯一值',
                duplicateValues: '重複值',
                rank: '最前最後',
                text: '文字',
                timePeriod: '時間日期',
                number: '數值',
                average: '平均值',
            },
            valueType: {
                num: '數值',
                min: '最小值',
                max: '最大值',
                percent: '百分比',
                percentile: '百分點',
                formula: '公式',
                none: '無',
            },
            errorMessage: {
                notBlank: '條件不能為空',
                rangeError: '選區錯誤',
                formulaError: '公式錯誤',
            },
        },
    },
};

export default locale;
