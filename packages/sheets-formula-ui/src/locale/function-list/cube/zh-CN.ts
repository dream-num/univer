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

export default {
    CUBEKPIMEMBER: {
        description:
            '返回重要性能指示器 (KPI) 属性，并在单元格中显示 KPI 名称。 KPI 是一种用于监控单位绩效的可计量度量值，如每月总利润或季度员工调整。',
        abstract:
            '返回重要性能指示器 (KPI) 属性，并在单元格中显示 KPI 名称。 KPI 是一种用于监控单位绩效的可计量度量值，如每月总利润或季度员工调整。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cubekpimember-%E5%87%BD%E6%95%B0-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEMEMBER: {
        description: '返回多维数据集中的成员或元组。 用于验证多维数据集内是否存在成员或元组。',
        abstract: '返回多维数据集中的成员或元组。 用于验证多维数据集内是否存在成员或元组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cubemember-%E5%87%BD%E6%95%B0-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: '返回多维数据集中成员属性的值。 用于验证多维数据集内是否存在某个成员名并返回此成员的指定属性。',
        abstract: '返回多维数据集中成员属性的值。 用于验证多维数据集内是否存在某个成员名并返回此成员的指定属性。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cubememberproperty-%E5%87%BD%E6%95%B0-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBERANKEDMEMBER: {
        description:
            '返回集合中的第 n 个或排在一定名次的成员。 用来返回集合中的一个或多个元素，如业绩最好的销售人员或前 10 名的学生。',
        abstract:
            '返回集合中的第 n 个或排在一定名次的成员。 用来返回集合中的一个或多个元素，如业绩最好的销售人员或前 10 名的学生。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cuberankedmember-%E5%87%BD%E6%95%B0-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBESET: {
        description:
            '定义成员或元组的计算集。方法是向服务器上的多维数据集发送一个集合表达式，此表达式创建集合，并随后将该集合返回到 Microsoft Excel。',
        abstract:
            '定义成员或元组的计算集。方法是向服务器上的多维数据集发送一个集合表达式，此表达式创建集合，并随后将该集合返回到 Microsoft Excel。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cubeset-%E5%87%BD%E6%95%B0-5b2146bd-62d6-4d04-9d8f-670e993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBESETCOUNT: {
        description: '返回集合中的项目数。',
        abstract: '返回集合中的项目数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cubesetcount-%E5%87%BD%E6%95%B0-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEVALUE: {
        description: '从多维数据集中返回汇总值。',
        abstract: '从多维数据集中返回汇总值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cubevalue-%E5%87%BD%E6%95%B0-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
