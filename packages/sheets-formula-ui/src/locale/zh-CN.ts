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

import array from './function-list/array/zh-CN';
import compatibility from './function-list/compatibility/zh-CN';
import cube from './function-list/cube/zh-CN';
import database from './function-list/database/zh-CN';
import date from './function-list/date/zh-CN';
import engineering from './function-list/engineering/zh-CN';
import financial from './function-list/financial/zh-CN';
import information from './function-list/information/zh-CN';
import logical from './function-list/logical/zh-CN';
import lookup from './function-list/lookup/zh-CN';
import math from './function-list/math/zh-CN';
import statistical from './function-list/statistical/zh-CN';
import text from './function-list/text/zh-CN';
import univer from './function-list/univer/zh-CN';
import web from './function-list/web/zh-CN';

export default {
    formula: {
        insert: {
            tooltip: '函数',
            sum: '求和',
            average: '平均值',
            count: '计数',
            max: '最大值',
            min: '最小值',
            more: '更多函数...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
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
            pasteFormula: '仅粘贴公式',
        },
    },
};
