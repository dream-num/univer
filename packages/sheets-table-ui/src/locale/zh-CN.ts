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

const locale = {
    'sheets-table': {
        title: '表格',
        selectRange: '选择表格范围',
        rename: '重命名表格',
        updateRange: '更新表格范围',
        tableRangeWithMergeError: '表格范围不能与合并单元格重叠',
        tableRangeWithOtherTableError: '表格范围不能与其他表格重叠',
        tableRangeSingleRowError: '表格范围不能是单独的一行',
        updateError: '不能将表格范围设置到和原先不重合且不在同一行的范围',
        tableStyle: '表格样式',
        defaultStyle: '默认样式',
        customStyle: '自定义样式',
        customTooMore: '自定义主题数量超出最大限制，请删除一些无用的主题后再次添加',
        setTheme: '设置表格主题',
        removeTable: '删除表格',
        cancel: '取消',
        confirm: '确认',
        header: '页眉',
        footer: '页脚',
        firstLine: '第一行',
        secondLine: '第二行',
        columnPrefix: '列',
        tablePrefix: '表格',

        insert: {
            main: '表格插入',
            row: '插入表格行',
            col: '插入表格列',
        },

        remove: {
            main: '表格删除',
            row: '删除表格行',
            col: '删除表格列',
        },

        condition: {
            string: '文本',
            number: '数字',
            date: '日期',

            empty: '（空白）',
        },
        string: {
            compare: {
                equal: '等于',
                notEqual: '不等于',
                contains: '包含',
                notContains: '不包含',
                startsWith: '开始于',
                endsWith: '结束于',
            },
        },
        number: {
            compare: {
                equal: '等于',
                notEqual: '不等于',
                greaterThan: '大于',
                greaterThanOrEqual: '大于等于',
                lessThan: '小于',
                lessThanOrEqual: '小于等于',
                between: '介于',
                notBetween: '不介于',
                above: '大于',
                below: '小于',
                topN: '前{0}个',
            },
        },
        date: {
            compare: {
                equal: '等于',
                notEqual: '不等于',
                after: '晚于',
                afterOrEqual: '晚于等于',
                before: '早于',
                beforeOrEqual: '早于等于',
                between: '介于',
                notBetween: '不介于',
                today: '今天',
                yesterday: '昨天',
                tomorrow: '明天',
                thisWeek: '本周',
                lastWeek: '上周',
                nextWeek: '下周',
                thisMonth: '本月',
                lastMonth: '上月',
                nextMonth: '下月',
                thisQuarter: '本季度',
                lastQuarter: '上季度',
                nextQuarter: '下季度',
                thisYear: '今年',
                nextYear: '明年',
                lastYear: '去年',
                quarter: '按季度',
                month: '按月份',

                q1: '第一季度',
                q2: '第二季度',
                q3: '第三季度',
                q4: '第四季度',

                m1: '一月',
                m2: '二月',
                m3: '三月',
                m4: '四月',
                m5: '五月',
                m6: '六月',
                m7: '七月',
                m8: '八月',
                m9: '九月',
                m10: '十月',
                m11: '十一月',
                m12: '十二月',
            },
        },

    },
};

export default locale;
