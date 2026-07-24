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
    DAVERAGE: {
        description: '对列表或数据库中满足指定条件的记录字段（列）中的数值求平均值。',
        abstract: '对列表或数据库中满足指定条件的记录字段（列）中的数值求平均值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '是构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '指示函数中使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '是包含指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DCOUNT: {
        description: '返回列表或数据库中满足指定条件的记录字段（列）中包含数字的单元格的个数。',
        abstract: '返回列表或数据库中满足指定条件的记录字段（列）中包含数字的单元格的个数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此参数包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DCOUNTA: {
        description: '返回列表或数据库中满足指定条件的记录字段（列）中的非空单元格的个数。',
        abstract: '返回列表或数据库中满足指定条件的记录字段（列）中的非空单元格的个数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '选。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DGET: {
        description: '从列表或数据库的列中提取符合指定条件的单个值。',
        abstract: '从列表或数据库的列中提取符合指定条件的单个值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DMAX: {
        description: '返回列表或数据库中满足指定条件的记录字段（列）中的最大数字。',
        abstract: '返回列表或数据库中满足指定条件的记录字段（列）中的最大数字。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DMIN: {
        description: '返回列表或数据库中满足指定条件的记录字段（列）中的最小数字。',
        abstract: '返回列表或数据库中满足指定条件的记录字段（列）中的最小数字。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DPRODUCT: {
        description: '返回列表或数据库中满足指定条件的记录字段（列）中的数值的乘积。',
        abstract: '返回列表或数据库中满足指定条件的记录字段（列）中的数值的乘积。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DSTDEV: {
        description: '返回利用列表或数据库中满足指定条件的记录字段（列）中的数字作为一个样本估算出的总体标准偏差。',
        abstract: '返回利用列表或数据库中满足指定条件的记录字段（列）中的数字作为一个样本估算出的总体标准偏差。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DSTDEVP: {
        description: '返回利用列表或数据库中满足指定条件的记录字段（列）中的数字作为样本总体计算出的总体标准偏差。',
        abstract: '返回利用列表或数据库中满足指定条件的记录字段（列）中的数字作为样本总体计算出的总体标准偏差。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DSUM: {
        description: '在列表或数据库中，DSUM 提供字段 (列) 与指定条件匹配的记录中的数字之和。',
        abstract: '在列表或数据库中，DSUM 提供字段 (列) 与指定条件匹配的记录中的数字之和。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 这是构成列表或数据库的单元格区域。 数据库是相关数据的列表，其中相关信息行是 记录 ，数据列是 字段 。 列表的第一行包含其中每一列的标签。' },
            field: { name: '字段', detail: '必填。 这将指定函数中使用的列。 指定用双引号括起来的列标签，例如“Age”或“Yield”。 或者，可以指定一个不带引号的数字 (，) 表示列在列表中的位置：例如， 1 表示第一列， 2 表示第二列，等等。' },
            criteria: { name: '条件', detail: '必填。 这是包含指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DVAR: {
        description: '返回利用列表或数据库中满足指定条件的记录字段（列）中的数字作为一个样本估算出的总体方差。',
        abstract: '返回利用列表或数据库中满足指定条件的记录字段（列）中的数字作为一个样本估算出的总体方差。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
    DVARP: {
        description: '通过使用列表或数据库中满足指定条件的记录字段（列）中的数字计算样本总体的样本总体方差。',
        abstract: '通过使用列表或数据库中满足指定条件的记录字段（列）中的数字计算样本总体的样本总体方差。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '必填。 构成列表或数据库的单元格区域。 数据库是包含一组相关数据的列表，其中包含相关信息的行为记录，而包含数据的列为字段。 列表的第一行包含每一列的标签。' },
            field: { name: '字段', detail: '必填。 指定函数所使用的列。 输入两端带双引号的列标签，如 "使用年数" 或 "产量"；或是代表列表中列位置的数字（不带引号）：1 表示第一列，2 表示第二列，依此类推。' },
            criteria: { name: '条件', detail: '必填。 包含所指定条件的单元格区域。 可以为参数 criteria 指定任意区域，只要此区域包含至少一个列标签，并且列标签下至少有一个在其中为列指定条件的单元格。' },
        },
    },
};

export default locale;
