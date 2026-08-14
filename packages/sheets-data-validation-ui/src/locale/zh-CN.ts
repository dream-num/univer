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
        ribbon: {
            setCheckbox: '设置复选框',
            clearCheckbox: '清除复选框',
            dropdownPresetTitle: '应用预设：',
            editDropdown: '编辑选项',
            clearDropdown: '清除下拉菜单',
            dateTime: '日期时间',
            presets: {
                yes: '是',
                no: '否',
                notStarted: '未开始',
                inProgress: '进行中',
                completed: '已完成',
                option1: '选项 1',
                option2: '选项 2',
            },
        },
        operators: {
            legal: '是合法类型',
        },
        validFail: {
            formulaError: '引用范围内包含不可见的数据，请重新调整范围',
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
        date: {
            title: '日期',
        },
        list: {
            title: '下拉菜单',
            add: '添加选项',
            options: '选项来源',
            customOptions: '自定义',
            refOptions: '引用数据',
            edit: '编辑',
        },
        checkbox: {
            title: '复选框',
            tips: '在单元格内使用自定义值',
            checked: '选中值',
            unchecked: '未选中值',
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
