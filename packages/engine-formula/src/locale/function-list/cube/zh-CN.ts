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
    CUBEKPIMEMBER: {
        description: '返回重要性能指示器 (KPI) 属性，并在单元格中显示 KPI 名称。 KPI 是一种用于监控单位绩效的可计量度量值，如每月总利润或季度员工调整。',
        abstract: '返回重要性能指示器 (KPI) 属性，并在单元格中显示 KPI 名称。 KPI 是一种用于监控单位绩效的可计量度量值，如每月总利润或季度员工调整。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: '连接', detail: '必填。 一个表示多维数据集的连接名称的文本字符串。' },
            kpiName: { name: 'Kpi_name', detail: '必填。 一个表示多维数据集的 KPI 名称的文本字符串。' },
            kpiProperty: { name: 'Kpi_property', detail: '必填。 返回的 KPI 组件，可以是以下值之一：' },
            caption: { name: '标题', detail: '选。 是显示在单元格中的可选文本字符串，而不是 kpi_name 和 kpi_property。' },
        },
    },
    CUBEMEMBER: {
        description: '返回多维数据集中的成员或元组。 用于验证多维数据集内是否存在成员或元组。',
        abstract: '返回多维数据集中的成员或元组。 用于验证多维数据集内是否存在成员或元组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: '连接', detail: '必填。 一个表示多维数据集的连接名称的文本字符串。' },
            memberExpression: { name: 'Member_expression', detail: '必填。 多维表达式 (MDX) 的文本字符串，用来计算出多维数据集中的唯一成员。 此外，也可以将 member_expression 指定为单元格区域或数组常量的元组。' },
            caption: { name: '标题', detail: '选。 显示在多维数据集的单元格（而不是标题）中的文本字符串（如果定义了一个文本字符串）。 当返回元组时，所用的标题为元组中最后一个成员的文本字符串。' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'CUBEMEMBERPROPERTY 函数（Excel 中的 多维数据集函数 之一）从多维数据集返回成员属性的值。 用于验证多维数据集内是否存在某个成员名并返回此成员的指定属性。',
        abstract: 'CUBEMEMBERPROPERTY 函数（Excel 中的 多维数据集函数 之一）从多维数据集返回成员属性的值。 用于验证多维数据集内是否存在某个成员名并返回此成员的指定属性。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: '连接', detail: '必填。 一个表示多维数据集的连接名称的文本字符串。' },
            memberExpression: { name: 'Member_expression', detail: '必填。 一个文本字符串，表示多维数据集中的一个成员的多维表达式 (MDX)。' },
            property: { name: '财产', detail: '必填。 一个文本字符串，表示返回的属性的名称或对包含该属性的名称的单元格的引用。' },
        },
    },
    CUBERANKEDMEMBER: {
        description: '返回集合中的第 n 个或排在一定名次的成员。 用来返回集合中的一个或多个元素，如业绩最好的销售人员或前 10 名的学生。',
        abstract: '返回集合中的第 n 个或排在一定名次的成员。 用来返回集合中的一个或多个元素，如业绩最好的销售人员或前 10 名的学生。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: '连接', detail: '必填。 一个表示多维数据集的连接名称的文本字符串。' },
            setExpression: { name: 'Set_expression', detail: '必填。 集表达式的文本字符串，例如 "{[Item1].children}"。 Set_expression 也可以是 CUBESET 函数，或者是对包含 CUBESET 函数的单元格的引用。' },
            rank: { name: '排名', detail: '必填。 用于指定要返回的最高值的整型值。 如果排名值为 1，它将返回最高值；如果排名值为 2，它将返回第二高的值，依此类推。 要返回最高的前 5 个值，请使用 5 次 CUBERANKEDMEMBER ，每一次指定从 1 到 5 的不同排名。' },
            caption: { name: '标题', detail: '选。 显示在多维数据集的单元格（而不是标题）中的文本字符串（如果定义了一个文本字符串）。' },
        },
    },
    CUBESET: {
        description: '定义成员或元组的计算集。方法是向服务器上的多维数据集发送一个集合表达式，此表达式创建集合，并随后将该集合返回到 Microsoft Excel。',
        abstract: '定义成员或元组的计算集。方法是向服务器上的多维数据集发送一个集合表达式，此表达式创建集合，并随后将该集合返回到 Microsoft Excel。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: '连接', detail: '必填。 一个表示多维数据集的连接名称的文本字符串。' },
            setExpression: { name: 'Set_expression', detail: '必填。 产生一组成员或元组的集合表达式的文本字符串。 Set_expression 也可以是对 Excel 区域的单元格引用，该区域包含一个或多个成员、元组或包含在集合中的集合。' },
            caption: { name: '标题', detail: '选。 显示在多维数据集的单元格（而不是标题）中的文本字符串（如果定义了一个文本字符串）。' },
            sortOrder: { name: 'Sort_order', detail: '选。 要执行的排序类型（如果有），可以为下列类型之一：' },
            sortBy: { name: 'Sort_by', detail: '选。 排序所依据的值的文本字符串。 例如，要获得销售量最高的城市，则 set_expression 为一组城市，sort_by 为销售量。 或者，要获得人口最多的城市，则 set_expression 为一组城市，sort_by 为人口量。 如果 sort_order 需要 sort_by，而 sort_by 被忽略，则 CUBESET 函数返回 #VALUE! 错误消息。' },
        },
    },
    CUBESETCOUNT: {
        description: '返回集合中的项目数。',
        abstract: '返回集合中的项目数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: '设置', detail: '必填。 Microsoft Office Excel 表达式的文本字符串，该表达式计算出由 CUBESET 函数定义的集合。 Set 也可以是 CUBESET 函数，或者是对包含 CUBESET 函数的单元格的引用。' },
        },
    },
    CUBEVALUE: {
        description: '从多维数据集中返回汇总值。',
        abstract: '从多维数据集中返回汇总值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: '连接', detail: '必填。 一个表示多维数据集的连接名称的文本字符串。' },
            memberExpression: { name: 'Member_expression', detail: '选。 多维表达式 (MDX) 的文本字符串，用来计算出多维数据集内的成员或元组。 另外，member_expression 可以是由 CUBESET 函数定义的集合。 使用 member_expression 作为切片器来定义要返回其汇总值的多维数据集部分。 如果 member_expression 中未指定度量值，则使用该多维数据集的默认度量值。' },
        },
    },
};

export default locale;
