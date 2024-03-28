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
    AVEDEV: {
        description: '返回数据点与它们的平均值的绝对偏差平均值',
        abstract: '返回数据点与它们的平均值的绝对偏差平均值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/avedev-%E5%87%BD%E6%95%B0-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AVERAGE: {
        description: '返回参数的平均值（算术平均值）。',
        abstract: '返回其参数的平均值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/average-%E5%87%BD%E6%95%B0-047bac88-d466-426c-a32b-8f33eb960cf6',
            },
        ],
        functionParameter: {
            number1: {
                name: '数值 1',
                detail: '要计算平均值的第一个数字、单元格引用或单元格区域。',
            },
            number2: {
                name: '数值 2',
                detail: '要计算平均值的其他数字、单元格引用或单元格区域，最多可包含 255 个。',
            },
        },
    },
    AVERAGEA: {
        description: '返回其参数的平均值，包括数字、文本和逻辑值',
        abstract: '返回其参数的平均值，包括数字、文本和逻辑值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/averagea-%E5%87%BD%E6%95%B0-f5f84098-d453-4f4c-bbba-3d2c66356091',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AVERAGEIF: {
        description: '返回区域中满足给定条件的所有单元格的平均值（算术平均值）',
        abstract: '返回区域中满足给定条件的所有单元格的平均值（算术平均值）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/averageif-%E5%87%BD%E6%95%B0-faec8e2e-0dec-4308-af69-f5576d8ac642',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AVERAGEIFS: {
        description: '返回满足多个条件的所有单元格的平均值（算术平均值）',
        abstract: '返回满足多个条件的所有单元格的平均值（算术平均值）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/averageifs-%E5%87%BD%E6%95%B0-48910c45-1fc0-4389-a028-f7c5c3001690',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BETA_DIST: {
        description: '返回 beta 累积分布函数',
        abstract: '返回 beta 累积分布函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/beta-dist-%E5%87%BD%E6%95%B0-11188c9c-780a-42c7-ba43-9ecb5a878d31',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BETA_INV: {
        description: '返回指定 beta 分布的累积分布函数的反函数',
        abstract: '返回指定 beta 分布的累积分布函数的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/beta-inv-%E5%87%BD%E6%95%B0-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BINOM_DIST: {
        description: '返回一元二项式分布的概率',
        abstract: '返回一元二项式分布的概率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/binom-dist-%E5%87%BD%E6%95%B0-c5ae37b6-f39c-4be2-94c2-509a1480770c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BINOM_DIST_RANGE: {
        description: '使用二项式分布返回试验结果的概率',
        abstract: '使用二项式分布返回试验结果的概率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/binom-dist-range-%E5%87%BD%E6%95%B0-17331329-74c7-4053-bb4c-6653a7421595',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BINOM_INV: {
        description: '返回使累积二项式分布小于或等于临界值的最小值',
        abstract: '返回使累积二项式分布小于或等于临界值的最小值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/binom-inv-%E5%87%BD%E6%95%B0-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHISQ_DIST: {
        description: '返回累积 beta 概率密度函数',
        abstract: '返回累积 beta 概率密度函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-dist-%E5%87%BD%E6%95%B0-8486b05e-5c05-4942-a9ea-f6b341518732',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHISQ_DIST_RT: {
        description: '返回 χ2 分布的单尾概率',
        abstract: '返回 χ2 分布的单尾概率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-dist-rt-%E5%87%BD%E6%95%B0-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHISQ_INV: {
        description: '返回累积 beta 概率密度函数',
        abstract: '返回累积 beta 概率密度函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-inv-%E5%87%BD%E6%95%B0-400db556-62b3-472d-80b3-254723e7092f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHISQ_INV_RT: {
        description: '返回 χ2 分布的单尾概率的反函数',
        abstract: '返回 χ2 分布的单尾概率的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-inv-rt-%E5%87%BD%E6%95%B0-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHISQ_TEST: {
        description: '返回独立性检验值',
        abstract: '返回独立性检验值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-test-%E5%87%BD%E6%95%B0-2e8a7861-b14a-4985-aa93-fb88de3f260f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONFIDENCE_NORM: {
        description: '返回总体平均值的置信区间',
        abstract: '返回总体平均值的置信区间',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/confidence-norm-%E5%87%BD%E6%95%B0-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONFIDENCE_T: {
        description: '返回总体平均值的置信区间（使用学生 t-分布）',
        abstract: '返回总体平均值的置信区间（使用学生 t-分布）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/confidence-t-%E5%87%BD%E6%95%B0-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CORREL: {
        description: '返回两个数据集之间的相关系数',
        abstract: '返回两个数据集之间的相关系数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/correl-%E5%87%BD%E6%95%B0-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUNT: {
        description: '计算包含数字的单元格个数以及参数列表中数字的个数。',
        abstract: '计算参数列表中数字的个数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/count-%E5%87%BD%E6%95%B0-a59cd7fc-b623-4d93-87a4-d23bf411294c',
            },
        ],
        functionParameter: {
            value1: {
                name: '值 1',
                detail: '要计算其中数字的个数的第一项、单元格引用或区域。',
            },
            value2: {
                name: '值 2',
                detail: '要计算其中数字的个数的其他项、单元格引用或区域，最多可包含 255 个。',
            },
        },
    },
    COUNTA: {
        description: `计算包含任何类型的信息（包括错误值和空文本 ("")）的单元格
        如果不需要对逻辑值、文本或错误值进行计数（换句话说，只希望对包含数字的单元格进行计数），请使用 COUNT 函数。`,
        abstract: '计算参数列表中值的个数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/counta-%E5%87%BD%E6%95%B0-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: {
                name: '数值 1',
                detail: '必需。 表示要计数的值的第一个参数',
            },
            number2: {
                name: '数值 2',
                detail: '可选。 表示要计数的值的其他参数，最多可包含 255 个参数。',
            },
        },
    },
    COUNTBLANK: {
        description: '计算区域内空白单元格的数量',
        abstract: '计算区域内空白单元格的数量',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/countblank-%E5%87%BD%E6%95%B0-6a92d772-675c-4bee-b346-24af6bd3ac22',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUNTIF: {
        description: '计算区域内符合给定条件的单元格的数量',
        abstract: '计算区域内符合给定条件的单元格的数量',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/countif-%E5%87%BD%E6%95%B0-e0de10c6-f885-4e71-abb4-1f464816df34',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUNTIFS: {
        description: '计算区域内符合多个条件的单元格的数量',
        abstract: '计算区域内符合多个条件的单元格的数量',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/countifs-%E5%87%BD%E6%95%B0-dda3dc6e-f74e-4aee-88bc-aa8c2a866842',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COVARIANCE_P: {
        description: '返回协方差（成对偏差乘积的平均值）',
        abstract: '返回协方差（成对偏差乘积的平均值）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/covariance-p-%E5%87%BD%E6%95%B0-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COVARIANCE_S: {
        description: '返回样本协方差，即两个数据集中每对数据点的偏差乘积的平均值',
        abstract: '返回样本协方差，即两个数据集中每对数据点的偏差乘积的平均值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/covariance-s-%E5%87%BD%E6%95%B0-0a539b74-7371-42aa-a18f-1f5320314977',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DEVSQ: {
        description: '返回偏差的平方和',
        abstract: '返回偏差的平方和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/devsq-%E5%87%BD%E6%95%B0-8b739616-8376-4df5-8bd0-cfe0a6caf444',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXPON_DIST: {
        description: '返回指数分布',
        abstract: '返回指数分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/expon-dist-%E5%87%BD%E6%95%B0-4c12ae24-e563-4155-bf3e-8b78b6ae140e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    F_DIST: {
        description: '返回 F 概率分布',
        abstract: '返回 F 概率分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/f-dist-%E5%87%BD%E6%95%B0-a887efdc-7c8e-46cb-a74a-f884cd29b25d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    F_DIST_RT: {
        description: '返回 F 概率分布',
        abstract: '返回 F 概率分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/f-dist-rt-%E5%87%BD%E6%95%B0-d74cbb00-6017-4ac9-b7d7-6049badc0520',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    F_INV: {
        description: '返回 F 概率分布的反函数',
        abstract: '返回 F 概率分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/f-inv-%E5%87%BD%E6%95%B0-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    F_INV_RT: {
        description: '返回 F 概率分布的反函数',
        abstract: '返回 F 概率分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/f-inv-rt-%E5%87%BD%E6%95%B0-d371aa8f-b0b1-40ef-9cc2-496f0693ac00',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    F_TEST: {
        description: '返回 F 检验的结果',
        abstract: '返回 F 检验的结果',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/f-test-%E5%87%BD%E6%95%B0-100a59e7-4108-46f8-8443-78ffacb6c0a7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FISHER: {
        description: '返回 Fisher 变换值',
        abstract: '返回 Fisher 变换值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/fisher-%E5%87%BD%E6%95%B0-d656523c-5076-4f95-b87b-7741bf236c69',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FISHERINV: {
        description: '返回 Fisher 变换的反函数',
        abstract: '返回 Fisher 变换的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/fisherinv-%E5%87%BD%E6%95%B0-62504b39-415a-4284-a285-19c8e82f86bb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST: {
        description: '返回线性趋势值',
        abstract: '返回线性趋势值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/forecast-%E5%92%8C-forecast-linear-%E5%87%BD%E6%95%B0-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS: {
        description: '通过使用指数平滑 (ETS) 算法的 AAA 版本，返回基于现有（历史）值的未来值',
        abstract: '通过使用指数平滑 (ETS) 算法的 AAA 版本，返回基于现有（历史）值的未来值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/%E9%A2%84%E6%B5%8B%E5%87%BD%E6%95%B0-%E5%8F%82%E8%80%83-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: '返回指定目标日期预测值的置信区间',
        abstract: '返回指定目标日期预测值的置信区间',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/%E9%A2%84%E6%B5%8B%E5%87%BD%E6%95%B0-%E5%8F%82%E8%80%83-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.CONFINT',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: '返回 Excel 针对指定时间系列检测到的重复模式的长度',
        abstract: '返回 Excel 针对指定时间系列检测到的重复模式的长度',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/%E9%A2%84%E6%B5%8B%E5%87%BD%E6%95%B0-%E5%8F%82%E8%80%83-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.SEASONALITY',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_STAT: {
        description: '返回作为时间序列预测的结果的统计值。',
        abstract: '返回作为时间序列预测的结果的统计值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/%E9%A2%84%E6%B5%8B%E5%87%BD%E6%95%B0-%E5%8F%82%E8%80%83-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.STAT',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_LINEAR: {
        description: '返回基于现有值的未来值',
        abstract: '返回基于现有值的未来值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/%E9%A2%84%E6%B5%8B%E5%87%BD%E6%95%B0-%E5%8F%82%E8%80%83-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.LINEAR',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FREQUENCY: {
        description: '以垂直数组的形式返回频率分布',
        abstract: '以垂直数组的形式返回频率分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/frequency-%E5%87%BD%E6%95%B0-44e3be2b-eca0-42cd-a3f7-fd9ea898fdb9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMA: {
        description: '返回 γ 函数值',
        abstract: '返回 γ 函数值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/gamma-%E5%87%BD%E6%95%B0-ce1702b1-cf55-471d-8307-f83be0fc5297',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMA_DIST: {
        description: '返回 γ 分布',
        abstract: '返回 γ 分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/gamma-dist-%E5%87%BD%E6%95%B0-9b6f1538-d11c-4d5f-8966-21f6a2201def',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMA_INV: {
        description: '返回 γ 累积分布函数的反函数',
        abstract: '返回 γ 累积分布函数的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/gamma-inv-%E5%87%BD%E6%95%B0-74991443-c2b0-4be5-aaab-1aa4d71fbb18',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMALN: {
        description: '返回 γ 函数的自然对数，Γ(x)',
        abstract: '返回 γ 函数的自然对数，Γ(x)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/gammaln-%E5%87%BD%E6%95%B0-b838c48b-c65f-484f-9e1d-141c55470eb9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMALN_PRECISE: {
        description: '返回 γ 函数的自然对数，Γ(x)',
        abstract: '返回 γ 函数的自然对数，Γ(x)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/gammaln-precise-%E5%87%BD%E6%95%B0-5cdfe601-4e1e-4189-9d74-241ef1caa599',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAUSS: {
        description: '返回小于标准正态累积分布 0.5 的值',
        abstract: '返回小于标准正态累积分布 0.5 的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/gauss-%E5%87%BD%E6%95%B0-069f1b4e-7dee-4d6a-a71f-4b69044a6b33',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GEOMEAN: {
        description: '返回几何平均值',
        abstract: '返回几何平均值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/geomean-%E5%87%BD%E6%95%B0-db1ac48d-25a5-40a0-ab83-0b38980e40d5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GROWTH: {
        description: '返回指数趋势值',
        abstract: '返回指数趋势值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/growth-%E5%87%BD%E6%95%B0-541a91dc-3d5e-437d-b156-21324e68b80d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HARMEAN: {
        description: '返回调和平均值',
        abstract: '返回调和平均值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/harmean-%E5%87%BD%E6%95%B0-5efd9184-fab5-42f9-b1d3-57883a1d3bc6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HYPGEOM_DIST: {
        description: '返回超几何分布',
        abstract: '返回超几何分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hypgeom-dist-%E5%87%BD%E6%95%B0-6dbd547f-1d12-4b1f-8ae5-b0d9e3d22fbf',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INTERCEPT: {
        description: '返回线性回归线的截距',
        abstract: '返回线性回归线的截距',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/intercept-%E5%87%BD%E6%95%B0-2a9b74e2-9d47-4772-b663-3bca70bf63ef',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    KURT: {
        description: '返回数据集的峰值',
        abstract: '返回数据集的峰值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/kurt-%E5%87%BD%E6%95%B0-bc3a265c-5da4-4dcb-b7fd-c237789095ab',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LARGE: {
        description: '返回数据集中第 k 个最大值',
        abstract: '返回数据集中第 k 个最大值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/large-%E5%87%BD%E6%95%B0-3af0af19-1190-42bb-bb8b-01672ec00a64',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LINEST: {
        description: '返回线性趋势的参数',
        abstract: '返回线性趋势的参数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/linest-%E5%87%BD%E6%95%B0-84d7d0d9-6e50-4101-977a-fa7abf772b6d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGEST: {
        description: '返回指数趋势的参数',
        abstract: '返回指数趋势的参数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/logest-%E5%87%BD%E6%95%B0-f27462d8-3657-4030-866b-a272c1d18b4b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGNORM_DIST: {
        description: '返回对数累积分布函数',
        abstract: '返回对数累积分布函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lognorm-dist-%E5%87%BD%E6%95%B0-eb60d00b-48a9-4217-be2b-6074aee6b070',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGNORM_INV: {
        description: '返回对数累积分布的反函数',
        abstract: '返回对数累积分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lognorm-inv-%E5%87%BD%E6%95%B0-fe79751a-f1f2-4af8-a0a1-e151b2d4f600',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MAX: {
        description: '返回一组值中的最大值。',
        abstract: '返回参数列表中的最大值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/max-%E5%87%BD%E6%95%B0-e0012414-9ac8-4b34-9a47-73e662c08098',
            },
        ],
        functionParameter: {
            number1: {
                name: '数值 1',
                detail: '要计算最大值的第一个数字、单元格引用或单元格区域。',
            },
            number2: {
                name: '数值 2',
                detail: '要计算最大值的其他数字、单元格引用或单元格区域，最多可包含 255 个。',
            },
        },
    },
    MAXA: {
        description: '返回参数列表中的最大值，包括数字、文本和逻辑值',
        abstract: '返回参数列表中的最大值，包括数字、文本和逻辑值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/maxa-%E5%87%BD%E6%95%B0-814bda1e-3840-4bff-9365-2f59ac2ee62d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MAXIFS: {
        description: '返回一组给定条件或标准指定的单元格之间的最大值',
        abstract: '返回一组给定条件或标准指定的单元格之间的最大值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/maxifs-%E5%87%BD%E6%95%B0-dfd611e6-da2c-488a-919b-9b6376b28883',
            },
        ],
        functionParameter: {
            maxRange: { name: '最大值范围', detail: '确定最大值的实际单元格区域。' },
            criteriaRange1: { name: '条件范围 1', detail: '条件1 一组用于条件计算的单元格。' },
            criteria1: { name: '条件 1', detail: '条件 1 用于确定哪些单元格是最大值的条件，格式为数字、表达式或文本。' },
            criteriaRange2: { name: '条件范围 2', detail: '附加区域及其关联条件。 最多可以输入 127 个区域/条件对。' },
            criteria2: { name: '条件 2', detail: '附加区域及其关联条件。 最多可以输入 127 个区域/条件对。' },
        },
    },
    MEDIAN: {
        description: '返回给定数值集合的中值',
        abstract: '返回给定数值集合的中值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/median-%E5%87%BD%E6%95%B0-d0916313-4753-414c-8537-ce85bdd967d2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MIN: {
        description: '返回一组值中的最小值。',
        abstract: '返回参数列表中的最小值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/min-%E5%87%BD%E6%95%B0-61635d12-920f-4ce2-a70f-96f202dcc152',
            },
        ],
        functionParameter: {
            number1: {
                name: '数值 1',
                detail: '要计算最小值的第一个数字、单元格引用或单元格区域。',
            },
            number2: {
                name: '数值 2',
                detail: '要计算最小值的其他数字、单元格引用或单元格区域，最多可包含 255 个。',
            },
        },
    },
    MINA: {
        description: '返回参数列表中的最小值，包括数字、文本和逻辑值',
        abstract: '返回参数列表中的最小值，包括数字、文本和逻辑值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/mina-%E5%87%BD%E6%95%B0-245a6f46-7ca5-4dc7-ab49-805341bc31d3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MINIFS: {
        description: '返回一组给定条件或标准指定的单元格之间的最小值。',
        abstract: '返回一组给定条件或标准指定的单元格之间的最小值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/minifs-%E5%87%BD%E6%95%B0-6ca1ddaa-079b-4e74-80cc-72eef32e6599',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MODE_MULT: {
        description: '返回一组数据或数据区域中出现频率最高或重复出现的数值的垂直数组',
        abstract: '返回一组数据或数据区域中出现频率最高或重复出现的数值的垂直数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/mode-mult-%E5%87%BD%E6%95%B0-50fd9464-b2ba-4191-b57a-39446689ae8c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MODE_SNGL: {
        description: '返回在数据集内出现次数最多的值',
        abstract: '返回在数据集内出现次数最多的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/mode-sngl-%E5%87%BD%E6%95%B0-f1267c16-66c6-4386-959f-8fba5f8bb7f8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NEGBINOM_DIST: {
        description: '返回负二项式分布',
        abstract: '返回负二项式分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/negbinom-dist-%E5%87%BD%E6%95%B0-c8239f89-c2d0-45bd-b6af-172e570f8599',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORM_DIST: {
        description: '返回正态累积分布',
        abstract: '返回正态累积分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/norm-dist-%E5%87%BD%E6%95%B0-edb1cc14-a21c-4e53-839d-8082074c9f8d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORM_INV: {
        description: '返回正态累积分布的反函数',
        abstract: '返回正态累积分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/norm-inv-%E5%87%BD%E6%95%B0-54b30935-fee7-493c-bedb-2278a9db7e13',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORM_S_DIST: {
        description: '返回标准正态累积分布',
        abstract: '返回标准正态累积分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/norm-s-dist-%E5%87%BD%E6%95%B0-1e787282-3832-4520-a9ae-bd2a8d99ba88',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORM_S_INV: {
        description: '返回标准正态累积分布函数的反函数',
        abstract: '返回标准正态累积分布函数的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/norm-s-inv-%E5%87%BD%E6%95%B0-d6d556b4-ab7f-49cd-b526-5a20918452b1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PEARSON: {
        description: '返回 Pearson 乘积矩相关系数',
        abstract: '返回 Pearson 乘积矩相关系数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/pearson-%E5%87%BD%E6%95%B0-0c3e30fc-e5af-49c4-808a-3ef66e034c18',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTILE_EXC: {
        description: '返回某个区域中的数值的第 k 个百分点值，此处的 k 的范围为 0 到 1（不含 0 和 1）',
        abstract: '返回某个区域中的数值的第 k 个百分点值，此处的 k 的范围为 0 到 1（不含 0 和 1）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/percentile-exc-%E5%87%BD%E6%95%B0-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTILE_INC: {
        description: '返回区域中数值的第 k 个百分点的值',
        abstract: '返回区域中数值的第 k 个百分点的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/percentile-inc-%E5%87%BD%E6%95%B0-680f9539-45eb-410b-9a5e-c1355e5fe2ed',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTRANK_EXC: {
        description: '将某个数值在数据集中的排位作为数据集的百分点值返回，此处的百分点值的范围为 0 到 1（不含 0 和 1）',
        abstract: '将某个数值在数据集中的排位作为数据集的百分点值返回，此处的百分点值的范围为 0 到 1（不含 0 和 1）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/percentrank-exc-%E5%87%BD%E6%95%B0-d8afee96-b7e2-4a2f-8c01-8fcdedaa6314',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTRANK_INC: {
        description: '返回数据集中值的百分比排位',
        abstract: '返回数据集中值的百分比排位',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/percentrank-inc-%E5%87%BD%E6%95%B0-149592c9-00c0-49ba-86c1-c1f45b80463a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERMUT: {
        description: '返回给定数目对象的排列数',
        abstract: '返回给定数目对象的排列数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/permut-%E5%87%BD%E6%95%B0-3bd1cb9a-2880-41ab-a197-f246a7a602d3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERMUTATIONA: {
        description: '返回可从总计对象中选择的给定数目对象（含重复）的排列数',
        abstract: '返回可从总计对象中选择的给定数目对象（含重复）的排列数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/permutationa-%E5%87%BD%E6%95%B0-6c7d7fdc-d657-44e6-aa19-2857b25cae4e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PHI: {
        description: '返回标准正态分布的密度函数值',
        abstract: '返回标准正态分布的密度函数值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/phi-%E5%87%BD%E6%95%B0-23e49bc6-a8e8-402d-98d3-9ded87f6295c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    POISSON_DIST: {
        description: '返回泊松分布',
        abstract: '返回泊松分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/poisson-dist-%E5%87%BD%E6%95%B0-8fe148ff-39a2-46cb-abf3-7772695d9636',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PROB: {
        description: '返回区域中的数值落在指定区间内的概率',
        abstract: '返回区域中的数值落在指定区间内的概率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/prob-%E5%87%BD%E6%95%B0-9ac30561-c81c-4259-8253-34f0a238fc49',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    QUARTILE_EXC: {
        description: '基于百分点值返回数据集的四分位，此处的百分点值的范围为 0 到 1（不含 0 和 1）',
        abstract: '基于百分点值返回数据集的四分位，此处的百分点值的范围为 0 到 1（不含 0 和 1）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/quartile-exc-%E5%87%BD%E6%95%B0-5a355b7a-840b-4a01-b0f1-f538c2864cad',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    QUARTILE_INC: {
        description: '返回一组数据的四分位点',
        abstract: '返回一组数据的四分位点',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/quartile-inc-%E5%87%BD%E6%95%B0-1bbacc80-5075-42f1-aed6-47d735c4819d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RANK_AVG: {
        description: '返回一列数字的数字排位',
        abstract: '返回一列数字的数字排位',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rank-avg-%E5%87%BD%E6%95%B0-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RANK_EQ: {
        description: '返回一列数字的数字排位',
        abstract: '返回一列数字的数字排位',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rank-eq-%E5%87%BD%E6%95%B0-284858ce-8ef6-450e-b662-26245be04a40',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RSQ: {
        description: '返回 Pearson 乘积矩相关系数的平方',
        abstract: '返回 Pearson 乘积矩相关系数的平方',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rsq-%E5%87%BD%E6%95%B0-d7161715-250d-4a01-b80d-a8364f2be08f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SKEW: {
        description: '返回分布的不对称度',
        abstract: '返回分布的不对称度',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/skew-%E5%87%BD%E6%95%B0-bdf49d86-b1ef-4804-a046-28eaea69c9fa',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SKEW_P: {
        description: '返回一个分布的不对称度：用来体现某一分布相对其平均值的不对称程度',
        abstract: '返回一个分布的不对称度：用来体现某一分布相对其平均值的不对称程度',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/skew-p-%E5%87%BD%E6%95%B0-76530a5c-99b9-48a1-8392-26632d542fcb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SLOPE: {
        description: '返回线性回归线的斜率',
        abstract: '返回线性回归线的斜率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/slope-%E5%87%BD%E6%95%B0-11fb8f97-3117-4813-98aa-61d7e01276b9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SMALL: {
        description: '返回数据集中的第 k 个最小值',
        abstract: '返回数据集中的第 k 个最小值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/small-%E5%87%BD%E6%95%B0-17da8222-7c82-42b2-961b-14c45384df07',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    STANDARDIZE: {
        description: '返回正态化数值',
        abstract: '返回正态化数值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/standardize-%E5%87%BD%E6%95%B0-81d66554-2d54-40ec-ba83-6437108ee775',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    STDEV_P: {
        description: '计算基于以参数形式给出的整个样本总体的标准偏差（忽略逻辑值和文本）。',
        abstract: '基于整个样本总体计算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/stdev-p-%E5%87%BD%E6%95%B0-6e917c05-31a0-496f-ade7-4f4e7462f285',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '对应于总体的第一个数值参数。' },
            number2: { name: '数值 2', detail: '对应于总体的 2 到 254 个数值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    STDEV_S: {
        description: '基于样本估算标准偏差（忽略样本中的逻辑值和文本）。',
        abstract: '基于样本估算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/stdev-s-%E5%87%BD%E6%95%B0-7d69cf97-0c1f-4acf-be27-f3e83904cc23',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '对应于总体样本的第一个数值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
            number2: { name: '数值 2', detail: '对应于总体样本的 2 到 254 个数值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    STDEVA: {
        description: '基于样本（包括数字、文本和逻辑值）估算标准偏差。',
        abstract: '基于样本（包括数字、文本和逻辑值）估算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/stdeva-%E5%87%BD%E6%95%B0-5ff38888-7ea5-48de-9a6d-11ed73b29e9d',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '对应于总体样本的第一个值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
            value2: { name: '值 2', detail: '对应于总体样本的 2 到 254 个值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    STDEVPA: {
        description: '根据作为参数（包括文字和逻辑值）给定的整个总体计算标准偏差。',
        abstract: '基于样本总体（包括数字、文本和逻辑值）计算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/stdevpa-%E5%87%BD%E6%95%B0-5578d4d6-455a-4308-9991-d405afe2c28c',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '对应于总体的第一个值参数。' },
            value2: { name: '值 2', detail: '对应于总体的 2 到 254 个值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    STEYX: {
        description: '返回通过线性回归法预测每个 x 的 y 值时所产生的标准误差',
        abstract: '返回通过线性回归法预测每个 x 的 y 值时所产生的标准误差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/steyx-%E5%87%BD%E6%95%B0-6ce74b2c-449d-4a6e-b9ac-f9cef5ba48ab',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    T_DIST: {
        description: '返回学生 t-分布的百分点（概率）',
        abstract: '返回学生 t-分布的百分点（概率）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/t-dist-%E5%87%BD%E6%95%B0-4329459f-ae91-48c2-bba8-1ead1c6c21b2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    T_DIST_2T: {
        description: '返回学生 t-分布的百分点（概率）',
        abstract: '返回学生 t-分布的百分点（概率）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/t-dist-2t-%E5%87%BD%E6%95%B0-198e9340-e360-4230-bd21-f52f22ff5c28',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    T_DIST_RT: {
        description: '返回学生 t-分布',
        abstract: '返回学生 t-分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/t-dist-rt-%E5%87%BD%E6%95%B0-20a30020-86f9-4b35-af1f-7ef6ae683eda',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    T_INV: {
        description: '返回作为概率和自由度函数的学生 t 分布的 t 值',
        abstract: '返回作为概率和自由度函数的学生 t 分布的 t 值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/t-inv-%E5%87%BD%E6%95%B0-2908272b-4e61-4942-9df9-a25fec9b0e2e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    T_INV_2T: {
        description: '返回学生 t-分布的反函数',
        abstract: '返回学生 t-分布的反函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/t-inv-2t-%E5%87%BD%E6%95%B0-ce72ea19-ec6c-4be7-bed2-b9baf2264f17',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    T_TEST: {
        description: '返回与学生 t-检验相关的概率',
        abstract: '返回与学生 t-检验相关的概率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/t-test-%E5%87%BD%E6%95%B0-d4e08ec3-c545-485f-962e-276f7cbed055',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TREND: {
        description: '返回线性趋势值',
        abstract: '返回线性趋势值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/trend-%E5%87%BD%E6%95%B0-e2f135f0-8827-4096-9873-9a7cf7b51ef1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TRIMMEAN: {
        description: '返回数据集的内部平均值',
        abstract: '返回数据集的内部平均值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/trimmean-%E5%87%BD%E6%95%B0-d90c9878-a119-4746-88fa-63d988f511d3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VAR_P: {
        description: '计算基于整个样本总体的方差（忽略样本总体中的逻辑值和文本）。',
        abstract: '计算基于样本总体的方差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/var-p-%E5%87%BD%E6%95%B0-73d1285c-108c-4843-ba5d-a51f90656f3a',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '对应于总体的第一个数值参数。' },
            number2: { name: '数值 2', detail: '对应于总体的 2 到 254 个数值参数。' },
        },
    },
    VAR_S: {
        description: '估算基于样本的方差（忽略样本中的逻辑值和文本）。',
        abstract: '基于样本估算方差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/var-s-%E5%87%BD%E6%95%B0-913633de-136b-449d-813e-65a00b2b990b',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '对应于总体样本的第一个数值参数。' },
            number2: { name: '数值 2', detail: '对应于总体样本的 2 到 254 个数值参数。' },
        },
    },
    VARA: {
        description: '基于样本（包括数字、文本和逻辑值）估算方差',
        abstract: '基于样本（包括数字、文本和逻辑值）估算方差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/vara-%E5%87%BD%E6%95%B0-3de77469-fa3a-47b4-85fd-81758a1e1d07',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '对应于总体样本的第一个值参数。' },
            value2: { name: '值 2', detail: '对应于总体样本的 2 到 254 个值参数' },
        },
    },
    VARPA: {
        description: '基于样本总体（包括数字、文本和逻辑值）计算标准偏差',
        abstract: '基于样本总体（包括数字、文本和逻辑值）计算标准偏差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/varpa-%E5%87%BD%E6%95%B0-59a62635-4e89-4fad-88ac-ce4dc0513b96',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '对应于总体的第一个值参数。' },
            value2: { name: '值 2', detail: '对应于总体的 2 到 254 个值参数' },
        },
    },
    WEIBULL_DIST: {
        description: '返回 Weibull 分布',
        abstract: '返回 Weibull 分布',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/weibull-dist-%E5%87%BD%E6%95%B0-4e783c39-9325-49be-bbc9-a83ef82b45db',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    Z_TEST: {
        description: '返回 z 检验的单尾概率值',
        abstract: '返回 z 检验的单尾概率值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/z-test-%E5%87%BD%E6%95%B0-d633d5a3-2031-4614-a016-92180ad82bee',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
