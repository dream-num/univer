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
    dataValidation: {
        title: '数据验证',
        validFail: {
            value: '请输入一个合法值',
            common: '请输入值或公式',
            number: '请输入合法的数字或公式',
            formula: '请输入合法的公式',
            integer: '请输入合法的整数或公式',
            date: '请输入合法的日期或公式',
            list: '请输入至少一个合法选项',
            listInvalid: '列表源必须是分隔列表或对单行或列的引用。',
            checkboxEqual: '为勾选和未勾选的单元格内容输入不同的值。',
            formulaError: '引用范围内包含不可见的数据，请重新调整范围',
            listIntersects: '所选范围不能和规则范围相交',
            primitive: '自定义勾选和未勾选值不允许使用公式。',
        },
        panel: {
            title: '管理数据验证',
            addTitle: '新建数据验证',
            removeAll: '全部删除',
            add: '新建规则',
            range: '应用范围',
            rangeError: '请输入合法的应用范围',
            type: '条件类型',
            options: '高级设置',
            operator: '数据',
            removeRule: '删除规则',
            done: '确认',
            formulaPlaceholder: '请输入值或公式',
            valuePlaceholder: '请输入值',
            formulaAnd: '与',
            invalid: '数据无效时',
            showWarning: '显示警告',
            rejectInput: '拒绝输入',
            messageInfo: '文字提示',
            showInfo: '显示所选单元格的提示文字',
            allowBlank: '忽略空值',
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
            legal: '是合法类型',
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
            legal: '是一个合法的 {TYPE}',
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
            legal: '值必须是一个合法的 {TYPE}',
        },
        any: {
            title: '任意值',
            error: '此单元格的内容违反了验证规则',
        },
        date: {
            title: '日期',
            operators: {
                between: '介于',
                greaterThan: '晚于',
                greaterThanOrEqual: '晚于或等于',
                lessThan: '早于',
                lessThanOrEqual: '早于或等于',
                equal: '等于',
                notEqual: '不等于',
                notBetween: '未介于',
                legal: '是合法日期',
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
                legal: '是一个合法的日期',
            },
            errorMsg: {
                between: '必须为有效日期且介于 {FORMULA1} 和 {FORMULA2} 之间',
                greaterThan: '必须为有效日期且晚于 {FORMULA1}',
                greaterThanOrEqual: '必须为有效日期且晚于或等于 {FORMULA1}',
                lessThan: '必须为有效日期且早于 {FORMULA1}',
                lessThanOrEqual: '必须为有效日期且早于或等于 {FORMULA1}',
                equal: '必须为有效日期且等于 {FORMULA1}',
                notEqual: '必须为有效日期且不等于 {FORMULA1}',
                notBetween: '必须为有效日期且在 {FORMULA1} 和 {FORMULA2} 范围之外',
                legal: '值必须是一个合法的日期',
            },
        },
        list: {
            title: '下拉菜单',
            name: '值必须是列表中的值',
            error: '输入必须在指定的范围内',
            emptyError: '请输入一个值',
            // strPlaceholder: '请输入选项，选项间通过“回车换行”或“英文逗号(,)”隔开',
            // refPlaceholder: '引用单元格内容作为选项,如:\'Sheet1\'!A100',
            add: '添加选项',
            dropdown: '单选',
            options: '选项来源',
            customOptions: '自定义',
            refOptions: '引用数据',
            formulaError: '列表源必须是划定分界后的数据列表,或是对单一行或一列的引用。',
            edit: '编辑',
        },
        listMultiple: {
            title: '下拉菜单-多选',
            dropdown: '多选',
        },
        textLength: {
            title: '文本长度',
            errorMsg: {
                between: '文本长度必须介于 {FORMULA1} 和 {FORMULA2} 之间',
                greaterThan: '文本长度必须大于 {FORMULA1}',
                greaterThanOrEqual: '文本长度必须大于或等于 {FORMULA1}',
                lessThan: '文本长度必须小于 {FORMULA1}',
                lessThanOrEqual: '文本长度必须小于或等于 {FORMULA1}',
                equal: '文本长度必须等于 {FORMULA1}',
                notEqual: '文本长度必须不等于 {FORMULA1}',
                notBetween: '文本长度必须在 {FORMULA1} 和 {FORMULA2} 范围之外',
            },
        },
        decimal: {
            title: '数字',
        },
        whole: {
            title: '整数',
        },
        checkbox: {
            title: '复选框',
            error: '此单元格的内容违反了验证规则',
            tips: '在单元格内使用自定义值',
            checked: '选中值',
            unchecked: '未选中值',
        },
        custom: {
            title: '自定义公式',
            error: '此单元格的内容违反了验证规则',
            validFail: '请输入合法的公式',
            ruleName: '自定义公式 {FORMULA1}',
        },
        alert: {
            title: '提示',
            ok: '确定',
        },
        error: {
            title: '无效：',
        },
        renderMode: {
            arrow: '箭头',
            chip: '条状标签',
            text: '纯文本',
            label: '显示样式',
        },
        showTime: {
            label: '展示时间选择',
        },
    },
};

export default locale;
