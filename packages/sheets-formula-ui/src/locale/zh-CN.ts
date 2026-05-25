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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': '快速求和',
        },

        insert: {
            tooltip: '函数',
            common: '常用函数',
        },
        prompt: {
            helpExample: '示例',
            helpAbstract: '简介',
            required: '必需。',
            optional: '可选。',
        },

        error: {
            title: '错误',
            divByZero: '除数为零',
            name: '无效名称',
            value: '值中的错误',
            num: '数值错误',
            na: '值不可用',
            cycle: '循环引用',
            ref: '无效的单元格引用',
            spill: '溢出区域不是空白区域',
            calc: '计算错误',
            error: '错误',
            connect: '正在连接中',
            null: '空值错误',
        },

        functionType: {
            financial: '财务',
            date: '日期与时间',
            math: '数学与三角函数',
            statistical: '统计',
            lookup: '查找与引用',
            database: '数据库',
            text: '文本',
            logical: '逻辑',
            information: '信息',
            engineering: '工程',
            cube: '多维数据集',
            compatibility: '兼容性',
            web: 'Web',
            array: '数组',
            univer: 'Univer',
            user: '用户自定义',
            definedname: '定义名称',
        },

        moreFunctions: {
            confirm: '应用',
            prev: '上一步',
            next: '下一步',
            searchFunctionPlaceholder: '搜索函数',
            allFunctions: '全部函数',
            syntax: '语法',
        },

        operation: {
            copyFormulaOnly: '仅复制公式',
            pasteFormula: '仅粘贴公式',
        },

        rangeSelector: {
            title: '选择一个数据范围',
            addAnotherRange: '添加范围',
            buttonTooltip: '选择数据范围',
            placeHolder: '框选范围或输入',
            confirm: '确认',
            cancel: '取消',
        },
    },
};

export default locale;
