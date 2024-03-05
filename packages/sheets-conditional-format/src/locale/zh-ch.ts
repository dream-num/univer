/**
 * Copyright 2023-present DreamNum Inc.
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

export default {
    sheet: {
        cf: {
            title: '条件格式',
            menu: {
                manageConditionalFormat: '管理条件格式',
                createConditionalFormat: '新建条件格式',
                clearRangeRules: '清除所选区域的规则',
                clearWorkSheetRules: '清除整个工作表的规则',

            },
            panel: {
                createRule: '+ 添加新的规则',
                range: '应用范围',
                styleType: '样式类型',
                submit: '确认',
                cancel: '取消',
                rankAndAverage: '最前/最后/平均值',
                styleRule: '样式规则',
                isNotBottom: '最前',
                isBottom: '最后',
                greaterThanAverage: '大于平均值',
                lessThanAverage: '小于平均值',
                medianValue: '中间值',
                fillType: '填充方式',
                pureColor: '纯色',
                gradient: '渐变',
                colorSet: '颜色设置',
                positive: '正值',
                native: '负值',
                workSheet: '整张工作表',
                selectedRange: '所选单元格',
                managerRuleSelect: '管理 {0} 的规则',
            },
            preview: {
                describe: {
                    beginsWith: '开头为{0}',
                    endsWith: '结尾为{0}',
                    containsText: '文本包含{0}',
                    notContainsText: '文本不包含{0}',
                    equal: '等于{0}',
                    notEqual: '不等于{0}',
                    containsBlanks: '包含空白',
                    notContainsBlanks: '不包含空白',
                    containsErrors: '包含错误',
                    notContainsErrors: '不包含错误',
                    greaterThan: '大于{0}',
                    greaterThanOrEqual: '大于等于{0}',
                    lessThan: '小于{0}',
                    lessThanOrEqual: '小于等于{0}',
                    notBetween: '不介于{0}和{1}之间',
                    between: '介于{0}和{1}之间',
                    yesterday: '昨日',
                    tomorrow: '明日',
                    last7Days: '最近7天',
                    thisMonth: '本月',
                    lastMonth: '上个月',
                    nextMonth: '下个月',
                    thisWeek: '本周',
                    lastWeek: '上周',
                    nextWeek: '下周',
                    topN: '前{0}项',
                    bottomN: '后{0}项',
                    topNPercent: '前{0}%',
                    bottomNPercent: '后{0}%',
                },
            },
            operator: {
                beginsWith: '开头为',
                endsWith: '结尾为',
                containsText: '文本包含',
                notContainsText: '文本不包含',
                equal: '等于',
                notEqual: '不等于',
                containsBlanks: '包含空白',
                notContainsBlanks: '不包含空白',
                containsErrors: '包含错误',
                notContainsErrors: '不包含错误',
                greaterThan: '大于',
                greaterThanOrEqual: '大于等于',
                lessThan: '小于',
                lessThanOrEqual: '小于等于',
                notBetween: '不介于',
                between: '介于',
                yesterday: '昨日',
                tomorrow: '明日',
                last7Days: '最近 7 天',
                thisMonth: '本月',
                lastMonth: '上个月',
                nextMonth: '下个月',
                thisWeek: '本周',
                lastWeek: '上周',
                nextWeek: '下周',
            },
            ruleType: {
                highlightCell: '突出显示单元格',
                dataBar: '数据条',
                colorScale: '色阶',
                formula: '自定义公式',
                iconSet: '图标集',
            },
            subRuleType: {
                uniqueValues: '唯一值',
                duplicateValues: '重复值',
                rank: '最前最后',
                text: '文本',
                timePeriod: '时间日期',
                number: '数值',
                average: '平均值',
            },
            valueType: {
                num: '数字',
                min: '最小值',
                max: '最大值',
                percent: '百分比',
                percentile: '百分点',
                formula: '公式',
                none: '无',
            },
        },
    },
};
