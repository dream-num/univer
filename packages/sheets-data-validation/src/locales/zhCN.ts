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
    dataValidation: {
        title: '数据验证',
        panel: {
            title: '管理数据验证',
            addTitle: '新建数据验证',
            removeAll: '全部删除',
            add: '新建规则',
            range: '应用范围',
            type: '条件类型',
            options: '高级设置',
            operator: '数据',
            removeRule: '删除规则',
            done: '确认',
            formulaPlaceholder: '请输入值或公式',
            formulaAnd: '与',
            invalid: '数据无效时',
            showWarning: '显示警告',
            rejectInput: '拒绝输入',
            messageInfo: '文字提示',
            showInfo: '显示所选单元格的提示文字',
        },
        operators: {
            between: '介于',
            greaterThan: '大于',
            greaterThanOrEqual: '大于或等于',
            lessThan: '小于',
            lessThanOrEqual: '小于或等于',
            equal: '等于',
            notEqual: '不等于',
            notBetween: '未介于',
        },
        ruleName: {
            between: '介于 {FORMULA1} 和 {FORMULA2} 之间',
            greaterThan: '大于 {FORMULA1}',
            greaterThanOrEqual: '大于或等于 {FORMULA1}',
            lessThan: '小于 {FORMULA1}',
            lessThanOrEqual: '小于或等于 {FORMULA1}',
            equal: '等于 {FORMULA1}',
            notEqual: '不等于 {FORMULA1}',
            notBetween: '在 {FORMULA1} 和 {FORMULA2} 范围之外',
        },
        errorMsg: {
            between: '值必须介于 {FORMULA1} 和 {FORMULA2} 之间',
            greaterThan: '值必须大于 {FORMULA1}',
            greaterThanOrEqual: '值必须大于或等于 {FORMULA1}',
            lessThan: '值必须小于 {FORMULA1}',
            lessThanOrEqual: '值必须小于或等于 {FORMULA1}',
            equal: '值必须等于 {FORMULA1}',
            notEqual: '值必须不等于 {FORMULA1}',
            notBetween: '值必须在 {FORMULA1} 和 {FORMULA2} 范围之外',
        },
        date: {
            title: '日期',
            operators: {
                between: '介于',
                greaterThan: '大于',
                greaterThanOrEqual: '大于或等于',
                lessThan: '小于',
                lessThanOrEqual: '小于或等于',
                equal: '等于',
                notEqual: '不等于',
                notBetween: '未介于',
            },
            ruleName: {
                between: '介于 {FORMULA1} 和 {FORMULA2} 之间',
                greaterThan: '晚于 {FORMULA1}',
                greaterThanOrEqual: '晚于或等于 {FORMULA1}',
                lessThan: '早于 {FORMULA1}',
                lessThanOrEqual: '早于或等于 {FORMULA1}',
                equal: '等于 {FORMULA1}',
                notEqual: '不等于 {FORMULA1}',
                notBetween: '在 {FORMULA1} 和 {FORMULA2} 范围之外',
            },
            errorMsg: {
                between: '日期必须介于 {FORMULA1} 和 {FORMULA2} 之间',
                greaterThan: '日期必须晚于 {FORMULA1}',
                greaterThanOrEqual: '日期必须晚于或等于 {FORMULA1}',
                lessThan: '日期必须早于 {FORMULA1}',
                lessThanOrEqual: '早于或等于 {FORMULA1}',
                equal: '日期必须等于 {FORMULA1}',
                notEqual: '日期必须不等于 {FORMULA1}',
                notBetween: '日期必须在 {FORMULA1} 和 {FORMULA2} 范围之外',
            },
        },
        list: {
            title: '下拉菜单',
            name: '值必须是列表中的值',
            error: '输入必须在指定的范围内',
            emptyError: '请输入一个值',
            strPlaceholder: '请输入选项，选项间通过“回车换行”或“英文逗号(,)”隔开',
            refPlaceholder: '引用单元格内容作为选项,如:\'Sheet1\'!A100',
        },
        listMultiple: {
            title: '下拉菜单-多选',
        },
        textLength: {
            title: '文本长度',
        },
        decimal: {
            title: '小数',
        },
        whole: {
            title: '整数',
        },
        checkbox: {
            title: '复选框',
            error: '此单元格的内容违反了验证规则',
        },
        custom: {
            title: '自定义公式',
            error: '此单元格的内容违反了验证规则',
        },
        alert: {
            title: '提示',
            ok: '确定',
        },
        error: {
            title: '无效：',
        },
    },
};
