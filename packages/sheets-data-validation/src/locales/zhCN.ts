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
        panel: {
            title: '管理数据验证',
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
            between: 'is between {FORMULA1} and {FORMULA2}',
            greaterThan: 'is greater than {FORMULA1}',
            greaterThanOrEqual: 'is greater than or equal to {FORMULA1}',
            lessThan: 'is less than {FORMULA1}',
            lessThanOrEqual: 'is less than or equal to {FORMULA1}',
            equal: 'is equal to {FORMULA1}',
            notEqual: 'is not equal to {FORMULA1}',
            notBetween: 'is not between {FORMULA1} and {FORMULA2}',
        },
        errorMsg: {
            between: 'Value must be between {FORMULA1} and {FORMULA2}',
            greaterThan: 'Value must be greater than {FORMULA1}',
            greaterThanOrEqual: 'Value must be greater than or equal to {FORMULA1}',
            lessThan: 'Value must be less than {FORMULA1}',
            lessThanOrEqual: 'Value must be less than or equal to {FORMULA1}',
            equal: 'Value must be equal to {FORMULA1}',
            notEqual: 'Value must be not equal to {FORMULA1}',
            notBetween: 'Value must be not between {FORMULA1} and {FORMULA2}',
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
                between: 'is between {FORMULA1} and {FORMULA2}',
                greaterThan: 'is after {FORMULA1}',
                greaterThanOrEqual: 'is on or after {FORMULA1}',
                lessThan: 'is before {FORMULA1}',
                lessThanOrEqual: 'is on or before {FORMULA1}',
                equal: 'is {FORMULA1}',
                notEqual: 'is not {FORMULA1}',
                notBetween: 'is not between {FORMULA1}',
            },
            errorMsg: {
                between: 'Value must be between {FORMULA1} and {FORMULA2}',
                greaterThan: 'Value must be after {FORMULA1}',
                greaterThanOrEqual: 'Value must be on or after {FORMULA1}',
                lessThan: 'Value must be before {FORMULA1}',
                lessThanOrEqual: 'Value must be on or before {FORMULA1}',
                equal: 'Value must be {FORMULA1}',
                notEqual: 'Value must be not {FORMULA1}',
                notBetween: 'Value must be not between {FORMULA1}',
            },

        },
        list: {
            title: '下拉菜单',
            name: '值必须是列表中的值',
            error: 'Input must fall within specified range',
            emptyError: 'Please enter a value',
            strPlaceholder: '请输入选项，选项间通过“回车换行”或“英文逗号(,)”隔开',
            refPlaceholder: '引用单元格内容作为选项,如:\'Sheet1\'!A100',
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
        },
        custom: {
            title: '自定义公式',
            error: 'This cell\'s contents violate its validation rule',
        },
    },
};
