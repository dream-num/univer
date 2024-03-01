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
    BETADIST: {
        description: '返回 beta 累积分布函数',
        abstract: '返回 beta 累积分布函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/betadist-%E5%87%BD%E6%95%B0-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BETAINV: {
        description: '返回指定 beta 分布的累积分布函数的反函数',
        abstract: '返回指定 beta 分布的累积分布函数的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/betainv-%E5%87%BD%E6%95%B0-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BINOMDIST: {
        description: '返回一元二项式分布的概率',
        abstract: '返回一元二项式分布的概率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/binomdist-%E5%87%BD%E6%95%B0-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHIDIST: {
        description: '返回 χ2 分布的单尾概率',
        abstract: '返回 χ2 分布的单尾概率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chidist-%E5%87%BD%E6%95%B0-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHIINV: {
        description: '返回 χ2 分布的单尾概率的反函数',
        abstract: '返回 χ2 分布的单尾概率的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chiinv-%E5%87%BD%E6%95%B0-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHITEST: {
        description: '返回独立性检验值',
        abstract: '返回独立性检验值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chitest-%E5%87%BD%E6%95%B0-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONFIDENCE: {
        description: '返回总体平均值的置信区间',
        abstract: '返回总体平均值的置信区间',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/confidence-%E5%87%BD%E6%95%B0-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COVAR: {
        description: '返回协方差（成对偏差乘积的平均值）',
        abstract: '返回协方差（成对偏差乘积的平均值）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/covar-%E5%87%BD%E6%95%B0-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CRITBINOM: {
        description: '返回使累积二项式分布小于或等于临界值的最小值',
        abstract: '返回使累积二项式分布小于或等于临界值的最小值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/critbinom-%E5%87%BD%E6%95%B0-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXPONDIST: {
        description: '返回指数分布',
        abstract: '返回指数分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/expondist-%E5%87%BD%E6%95%B0-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FDIST: {
        description: '返回 F 概率分布',
        abstract: '返回 F 概率分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/fdist-%E5%87%BD%E6%95%B0-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FINV: {
        description: '返回 F 概率分布的反函数',
        abstract: '返回 F 概率分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/finv-%E5%87%BD%E6%95%B0-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FTEST: {
        description: '返回 F 检验的结果',
        abstract: '返回 F 检验的结果',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ftest-%E5%87%BD%E6%95%B0-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMADIST: {
        description: '返回 γ 分布',
        abstract: '返回 γ 分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/gammadist-%E5%87%BD%E6%95%B0-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMAINV: {
        description: '返回 γ 累积分布函数的反函数',
        abstract: '返回 γ 累积分布函数的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/gammainv-%E5%87%BD%E6%95%B0-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HYPGEOMDIST: {
        description: '返回超几何分布',
        abstract: '返回超几何分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hypgeomdist-%E5%87%BD%E6%95%B0-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGINV: {
        description: '返回对数累积分布函数的反函数',
        abstract: '返回对数累积分布函数的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/loginv-%E5%87%BD%E6%95%B0-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGNORMDIST: {
        description: '返回对数累积分布函数',
        abstract: '返回对数累积分布函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lognormdist-%E5%87%BD%E6%95%B0-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MODE: {
        description: '返回在数据集内出现次数最多的值',
        abstract: '返回在数据集内出现次数最多的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/mode-%E5%87%BD%E6%95%B0-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NEGBINOMDIST: {
        description: '返回负二项式分布',
        abstract: '返回负二项式分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/negbinomdist-%E5%87%BD%E6%95%B0-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMDIST: {
        description: '返回正态累积分布',
        abstract: '返回正态累积分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/normdist-%E5%87%BD%E6%95%B0-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMINV: {
        description: '返回正态累积分布的反函数',
        abstract: '返回正态累积分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/norminv-%E5%87%BD%E6%95%B0-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMSDIST: {
        description: '返回标准正态累积分布',
        abstract: '返回标准正态累积分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/normsdist-%E5%87%BD%E6%95%B0-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMSINV: {
        description: '返回标准正态累积分布函数的反函数',
        abstract: '返回标准正态累积分布函数的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/normsinv-%E5%87%BD%E6%95%B0-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTILE: {
        description: '返回区域中数值的第 k 个百分点的值',
        abstract: '返回区域中数值的第 k 个百分点的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/percentile-%E5%87%BD%E6%95%B0-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTRANK: {
        description: '返回数据集中值的百分比排位',
        abstract: '返回数据集中值的百分比排位',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/percentrank-%E5%87%BD%E6%95%B0-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    POISSON: {
        description: '返回泊松分布',
        abstract: '返回泊松分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/poisson-%E5%87%BD%E6%95%B0-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    QUARTILE: {
        description: '返回一组数据的四分位点',
        abstract: '返回一组数据的四分位点',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/quartile-%E5%87%BD%E6%95%B0-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RANK: {
        description: '返回一列数字的数字排位',
        abstract: '返回一列数字的数字排位',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rank-%E5%87%BD%E6%95%B0-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    STDEV: {
        description: '根据样本估计标准偏差。 标准偏差可以测量值在平均值（中值）附近分布的范围大小。',
        abstract: '基于样本估算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/stdev-%E5%87%BD%E6%95%B0-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '对应于总体样本的第一个数值参数。' },
            number2: { name: '数值 2', detail: '对应于总体样本的 2 到 255 个数值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    STDEVP: {
        description: '根据作为参数给定的整个总体计算标准偏差。',
        abstract: '基于整个样本总体计算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/stdevp-%E5%87%BD%E6%95%B0-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '对应于总体的第一个数值参数。' },
            number2: { name: '数值 2', detail: '对应于总体的 2 到 255 个数值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    TDIST: {
        description: '返回学生 t-分布',
        abstract: '返回学生 t-分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tdist-%E5%87%BD%E6%95%B0-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TINV: {
        description: '返回学生 t-分布的反函数',
        abstract: '返回学生 t-分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tinv-%E5%87%BD%E6%95%B0-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TTEST: {
        description: '返回与学生 t-检验相关的概率',
        abstract: '返回与学生 t-检验相关的概率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ttest-%E5%87%BD%E6%95%B0-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VAR: {
        description: '计算基于给定样本的方差。',
        abstract: '基于样本估算方差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/var-%E5%87%BD%E6%95%B0-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '对应于总体样本的第一个数值参数。' },
            number2: { name: '数值 2', detail: '应于总体样本的 2 到 255 个数值参数。' },
        },
    },
    VARP: {
        description: '计算基于样本总体的方差。',
        abstract: '计算基于样本总体的方差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/varp-%E5%87%BD%E6%95%B0-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '对应于总体的第一个数值参数。' },
            number2: { name: '数值 2', detail: '对应于总体的 2 到 255 个数值参数。' },
        },
    },
    WEIBULL: {
        description: '返回 Weibull 分布',
        abstract: '返回 Weibull 分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/weibull-%E5%87%BD%E6%95%B0-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ZTEST: {
        description: '返回 z 检验的单尾概率值',
        abstract: '返回 z 检验的单尾概率值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ztest-%E5%87%BD%E6%95%B0-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
