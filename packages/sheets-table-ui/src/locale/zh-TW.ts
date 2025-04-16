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
        selectRange: '選擇表格範圍',
        rename: '重命名表格',
        updateRange: '更新表格範圍',
        tableRangeWithMergeError: '表格範圍不能與合併儲存格重疊',
        tableRangeWithOtherTableError: '表格範圍不能與其他表格重疊',
        tableRangeSingleRowError: '表格範圍不能是單獨的一行',
        updateError: '不能將表格範圍設置到和原先不重合且不在同一行的範圍',
        tableStyle: '表格樣式',
        defaultStyle: '預設樣式',
        customStyle: '自定義樣式',
        customTooMore: '自定義主題數量超出最大限制，請刪除一些無用的主題後再次添加',
        setTheme: '設置表格主題',
        removeTable: '刪除表格',
        cancel: '取消',
        confirm: '確認',
        header: '頁首',
        footer: '頁尾',
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
            main: '表格刪除',
            row: '刪除表格行',
            col: '刪除表格列',
        },

        condition: {
            string: '文字',
            number: '數字',
            date: '日期',

            empty: '（空白）',

        },
        string: {
            compare: {
                equal: '等於',
                notEqual: '不等於',
                contains: '包含',
                notContains: '不包含',
                startsWith: '開始於',
                endsWith: '結束於',
            },
        },
        number: {
            compare: {
                equal: '等於',
                notEqual: '不等於',
                greaterThan: '大於',
                greaterThanOrEqual: '大於等於',
                lessThan: '小於',
                lessThanOrEqual: '小於等於',
                between: '介於',
                notBetween: '不介於',
                above: '大於',
                below: '小於',
                topN: '前{0}個',
            },
        },
        date: {
            compare: {
                equal: '等於',
                notEqual: '不等於',
                after: '晚於',
                afterOrEqual: '晚於等於',
                before: '早於',
                beforeOrEqual: '早於等於',
                between: '介於',
                notBetween: '不介於',
                today: '今天',
                yesterday: '昨天',
                tomorrow: '明天',
                thisWeek: '本週',
                lastWeek: '上週',
                nextWeek: '下週',
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
