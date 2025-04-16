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
    DAVERAGE: {
        description: '返回所选数据库条目的平均值',
        abstract: '返回所选数据库条目的平均值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/daverage-%E5%87%BD%E6%95%B0-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DCOUNT: {
        description: '计算数据库中包含数字的单元格的数量',
        abstract: '计算数据库中包含数字的单元格的数量',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dcount-%E5%87%BD%E6%95%B0-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DCOUNTA: {
        description: '计算数据库中非空单元格的数量',
        abstract: '计算数据库中非空单元格的数量',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dcounta-%E5%87%BD%E6%95%B0-00232a6d-5a66-4a01-a25b-c1653fda1244',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DGET: {
        description: '从数据库提取符合指定条件的单个记录',
        abstract: '从数据库提取符合指定条件的单个记录',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dget-%E5%87%BD%E6%95%B0-455568bf-4eef-45f7-90f0-ec250d00892e',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DMAX: {
        description: '返回所选数据库条目的最大值',
        abstract: '返回所选数据库条目的最大值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dmax-%E5%87%BD%E6%95%B0-f4e8209d-8958-4c3d-a1ee-6351665d41c2',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DMIN: {
        description: '返回所选数据库条目的最小值',
        abstract: '返回所选数据库条目的最小值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dmin-%E5%87%BD%E6%95%B0-4ae6f1d9-1f26-40f1-a783-6dc3680192a3',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DPRODUCT: {
        description: '将数据库中符合条件的记录的特定字段中的值相乘',
        abstract: '将数据库中符合条件的记录的特定字段中的值相乘',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dproduct-%E5%87%BD%E6%95%B0-4f96b13e-d49c-47a7-b769-22f6d017cb31',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DSTDEV: {
        description: '基于所选数据库条目的样本估算标准偏差',
        abstract: '基于所选数据库条目的样本估算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dstdev-%E5%87%BD%E6%95%B0-026b8c73-616d-4b5e-b072-241871c4ab96',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DSTDEVP: {
        description: '基于所选数据库条目的样本总体计算标准偏差',
        abstract: '基于所选数据库条目的样本总体计算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dstdevp-%E5%87%BD%E6%95%B0-04b78995-da03-4813-bbd9-d74fd0f5d94b',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DSUM: {
        description: '对数据库中符合条件的记录的字段列中的数字求和',
        abstract: '对数据库中符合条件的记录的字段列中的数字求和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dsum-%E5%87%BD%E6%95%B0-53181285-0c4b-4f5a-aaa3-529a322be41b',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DVAR: {
        description: '基于所选数据库条目的样本估算方差',
        abstract: '基于所选数据库条目的样本估算方差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dvar-%E5%87%BD%E6%95%B0-d6747ca9-99c7-48bb-996e-9d7af00f3ed1',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
    DVARP: {
        description: '基于所选数据库条目的样本总体计算方差',
        abstract: '基于所选数据库条目的样本总体计算方差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dvarp-%E5%87%BD%E6%95%B0-eb0ba387-9cb7-45c8-81e9-0394912502fc',
            },
        ],
        functionParameter: {
            database: { name: '数据库', detail: '构成列表或数据库的单元格区域。' },
            field: { name: '字段', detail: '指定函数所使用的列。' },
            criteria: { name: '条件', detail: '包含指定条件的单元格区域。' },
        },
    },
};
