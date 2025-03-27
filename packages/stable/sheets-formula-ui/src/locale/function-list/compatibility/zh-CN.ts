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
            x: { name: '值', detail: '用来计算其函数的值，介于下限值和上限值之间。' },
            alpha: { name: 'alpha', detail: '分布的第一个参数。' },
            beta: { name: 'beta', detail: '分布的第二个参数。' },
            A: { name: '下限', detail: '函数的下限，默认值为 0。' },
            B: { name: '上限', detail: '函数的上限，默认值为 1。' },
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
            probability: { name: '概率', detail: '与 beta 分布相关的概率。' },
            alpha: { name: 'alpha', detail: '分布的第一个参数。' },
            beta: { name: 'beta', detail: '分布的第二个参数。' },
            A: { name: '下限', detail: '函数的下限，默认值为 0。' },
            B: { name: '上限', detail: '函数的上限，默认值为 1。' },
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
            numberS: { name: '成功次数', detail: '试验的成功次数。' },
            trials: { name: '试验次数', detail: '独立试验次数。' },
            probabilityS: { name: '成功概率', detail: '每次试验成功的概率。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。如果为 TRUE，则 BINOMDIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
        },
    },
    CHIDIST: {
        description: '返回 χ2 分布的右尾概率。',
        abstract: '返回 χ2 分布的右尾概率。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chidist-%E5%87%BD%E6%95%B0-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用来计算分布的数值。' },
            degFreedom: { name: '自由度', detail: '自由度数。' },
        },
    },
    CHIINV: {
        description: '返回 χ2 分布的右尾概率的反函数。',
        abstract: '返回 χ2 分布的右尾概率的反函数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chiinv-%E5%87%BD%E6%95%B0-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '与 χ2 分布相关联的概率。' },
            degFreedom: { name: '自由度', detail: '自由度数。' },
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
            actualRange: { name: '观察范围', detail: '包含观察值的数据区域，用于检验预期值。' },
            expectedRange: { name: '预期范围', detail: '包含行列汇总的乘积与总计值之比率的数据区域。' },
        },
    },
    CONFIDENCE: {
        description: '使用正态分布返回总体平均值的置信区间。',
        abstract: '使用正态分布返回总体平均值的置信区间。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/confidence-%E5%87%BD%E6%95%B0-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '用来计算置信水平的显著性水平。 置信水平等于 100*(1 - alpha)%，亦即，如果 alpha 为 0.05，则置信水平为 95%。' },
            standardDev: { name: '总体标准偏差', detail: '数据区域的总体标准偏差，假定为已知。' },
            size: { name: '样本大小', detail: '样本大小。' },
        },
    },
    COVAR: {
        description: '返回总体协方差，即两个数据集中每对数据点的偏差乘积的平均值。',
        abstract: '返回总体协方差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/covar-%E5%87%BD%E6%95%B0-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            array1: { name: '数组1', detail: '第一个单元格值区域。' },
            array2: { name: '数组2', detail: '第二个单元格值区域。' },
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
            trials: { name: '试验次数', detail: '伯努利试验的次数。' },
            probabilityS: { name: '成功概率', detail: '每次试验成功的概率。' },
            alpha: { name: '目标概率', detail: '临界值。' },
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
            x: { name: '值', detail: '用来计算分布的数值。' },
            lambda: { name: 'lambda', detail: '参数值。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。 如果为 TRUE，则 EXPONDIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
        },
    },
    FDIST: {
        description: '返回 F 概率分布（右尾）',
        abstract: '返回 F 概率分布（右尾）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/fdist-%E5%87%BD%E6%95%B0-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用来计算函数的值。' },
            degFreedom1: { name: '分子自由度', detail: '分子自由度。' },
            degFreedom2: { name: '分母自由度', detail: '分母自由度。' },
        },
    },
    FINV: {
        description: '返回 F 概率分布（右尾）的反函数',
        abstract: '返回 F 概率分布（右尾）的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/finv-%E5%87%BD%E6%95%B0-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: 'F 累积分布的概率值。' },
            degFreedom1: { name: '分子自由度', detail: '分子自由度。' },
            degFreedom2: { name: '分母自由度', detail: '分母自由度。' },
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
            array1: { name: '数组1', detail: '第一个数据数组或数据范围。' },
            array2: { name: '数组2', detail: '第二个数据数组或数据范围。' },
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
            x: { name: 'x', detail: '需要计算其分布的数值。' },
            alpha: { name: 'alpha', detail: '分布的第一个参数。' },
            beta: { name: 'beta', detail: '分布的第二个参数。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。如果为TRUE，则 GAMMADIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
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
            probability: { name: '概率', detail: '与伽玛分布相关的概率。' },
            alpha: { name: 'alpha', detail: '分布的第一个参数。' },
            beta: { name: 'beta', detail: '分布的第二个参数。' },
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
            sampleS: { name: '样本成功次数', detail: '样本中成功的次数。' },
            numberSample: { name: '样本大小', detail: '样本大小。' },
            populationS: { name: '总体成功次数', detail: '总体中成功的次数。' },
            numberPop: { name: '总体大小', detail: '总体大小。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。如果为TRUE，则 HYPGEOMDIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
        },
    },
    LOGINV: {
        description: '返回对数正态累积分布的反函数',
        abstract: '返回对数正态累积分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/loginv-%E5%87%BD%E6%95%B0-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '对应于对数正态分布的概率。' },
            mean: { name: '平均值', detail: '分布的算术平均值。' },
            standardDev: { name: '标准偏差', detail: '分布的标准偏差。' },
        },
    },
    LOGNORMDIST: {
        description: '返回对数正态累积分布',
        abstract: '返回对数正态累积分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lognormdist-%E5%87%BD%E6%95%B0-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要计算其分布的数值。' },
            mean: { name: '平均值', detail: '分布的算术平均值。' },
            standardDev: { name: '标准偏差', detail: '分布的标准偏差。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。 如果为 TRUE，则 LOGNORMDIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
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
            number1: { name: '数值 1', detail: '要计算众数的第一个数字、单元格引用或单元格区域。' },
            number2: { name: '数值 2', detail: '要计算众数的其他数字、单元格引用或单元格区域，最多可包含 255 个。' },
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
            numberF: { name: '失败次数', detail: '失败的次数。' },
            numberS: { name: '成功次数', detail: '成功次数的阈值。' },
            probabilityS: { name: '成功概率', detail: '成功的概率。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。 如果为 TRUE，则 NEGBINOMDIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
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
            x: { name: 'x', detail: '需要计算其分布的数值。' },
            mean: { name: '平均值', detail: '分布的算术平均值。' },
            standardDev: { name: '标准偏差', detail: '分布的标准偏差。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。 如果为 TRUE，则 NORMDIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
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
            probability: { name: '概率', detail: '对应于正态分布的概率。' },
            mean: { name: '平均值', detail: '分布的算术平均值。' },
            standardDev: { name: '标准偏差', detail: '分布的标准偏差。' },
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
            z: { name: 'z', detail: '需要计算其分布的数值。' },
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
            probability: { name: '概率', detail: '对应于正态分布的概率。' },
        },
    },
    PERCENTILE: {
        description: '返回数据集中第 k 个百分点的值 (包含 0 和 1)',
        abstract: '返回数据集中第 k 个百分点的值 (包含 0 和 1)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/percentile-%E5%87%BD%E6%95%B0-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '定义相对位置的数组或数据区域。' },
            k: { name: 'k', detail: '0 到 1 之间的百分点值 (包含 0 和 1)。' },
        },
    },
    PERCENTRANK: {
        description: '返回数据集中值的百分比排位 (包含 0 和 1)',
        abstract: '返回数据集中值的百分比排位 (包含 0 和 1)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/percentrank-%E5%87%BD%E6%95%B0-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '定义相对位置的数组或数据区域。' },
            x: { name: 'x', detail: '需要得到其排位的值。' },
            significance: { name: '有效位数', detail: '用于标识返回的百分比值的有效位数的值。 如果省略，则 PERCENTRANK 使用 3 位小数 (0.xxx)。' },
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
            x: { name: 'x', detail: '需要计算其分布的数值。' },
            mean: { name: '平均值', detail: '分布的算术平均值。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。 如果为 TRUE，则 POISSON 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
        },
    },
    QUARTILE: {
        description: '返回数据集的四分位数 (包含 0 和 1)',
        abstract: '返回数据集的四分位数 (包含 0 和 1)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/quartile-%E5%87%BD%E6%95%B0-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '要求得四分位数值的数组或数据区域。' },
            quart: { name: '四分位值', detail: '要返回的四分位数值。' },
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
            number: { name: '数值', detail: '要找到其排位的数字。' },
            ref: { name: '数字列表', detail: '对数字列表的引用。Ref 中的非数字值会被忽略。' },
            order: { name: '排位方式', detail: '一个指定数字排位方式的数字。0 或省略为降序，非 0 为升序。' },
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
        description: '返回学生的 t 概率分布',
        abstract: '返回学生的 t 概率分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tdist-%E5%87%BD%E6%95%B0-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要计算分布的数值。' },
            degFreedom: { name: '自由度', detail: '一个表示自由度数的整数。' },
            tails: { name: '尾部特性', detail: '指定返回的分布函数是单尾分布还是双尾分布。 如果 Tails = 1，则 TDIST 返回单尾分布。 如果Tails = 2，则 TDIST 返回双尾分布。' },
        },
    },
    TINV: {
        description: '返回学生的 t 概率分布的反函数 (双尾)',
        abstract: '返回学生的 t 概率分布的反函数 (双尾)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tinv-%E5%87%BD%E6%95%B0-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '与学生的 t 分布相关的概率。' },
            degFreedom: { name: '自由度', detail: '一个表示自由度数的整数。' },
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
            array1: { name: '数组1', detail: '第一个数据数组或数据范围。' },
            array2: { name: '数组2', detail: '第二个数据数组或数据范围。' },
            tails: { name: '尾部特性', detail: '指定分布尾数。 如果 tails = 1，则 TTEST 使用单尾分布。 如果 tails = 2，则 TTEST 使用双尾分布。' },
            type: { name: '检验类型', detail: '要执行的 t 检验的类型。' },
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
            x: { name: 'x', detail: '需要计算其分布的数值。' },
            alpha: { name: 'alpha', detail: '分布的第一个参数。' },
            beta: { name: 'beta', detail: '分布的第二个参数。' },
            cumulative: { name: '累积', detail: '决定函数形式的逻辑值。如果为TRUE，则 WEIBULL 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
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
            array: { name: '数组', detail: '用来检验 x 的数组或数据区域。' },
            x: { name: 'x', detail: '要测试的值。' },
            sigma: { name: '标准偏差', detail: '总体（已知）标准偏差。 如果省略，则使用样本标准偏差。' },
        },
    },
};
