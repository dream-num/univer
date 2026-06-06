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
    'sheets-data-validation-ui': {
        title: '数据验证',
        operators: {
            legal: '是合法类型',
        },
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
        any: {
            title: '任意值',
            error: '此单元格的内容违反了验证规则',
        },
        date: {
            title: '日期',
        },
        list: {
            title: '下拉菜单',
            name: '值必须是列表中的值',
            error: '输入必须在指定的范围内',
            emptyError: '请输入一个值',
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
        permission: {
            dialog: {
                setStyleErr: '该范围已被保护，目前无设置样式权限。如需设置样式，请联系创建者。',
            },
        },
    },
};

export default locale;
