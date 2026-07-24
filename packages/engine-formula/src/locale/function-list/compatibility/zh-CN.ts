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
    BETADIST: {
        description: '返回累积 beta 概率密度函数。 Beta 分布通常用于研究样本中一定部分的变化情况，例如，人们一天中看电视的时间比率。',
        abstract: '返回累积 beta 概率密度函数。 Beta 分布通常用于研究样本中一定部分的变化情况，例如，人们一天中看电视的时间比率。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '必需。 用来计算其函数的值，介于值 A 和 B 之间。' },
            alpha: { name: 'alpha', detail: '必填。 分布参数。' },
            beta: { name: 'beta', detail: '必填。 分布参数。' },
            A: { name: '下限', detail: '可选。 x 所属区间的下界。' },
            B: { name: '上限', detail: '可选。 x 所属区间的上界。' },
        },
    },
    BETAINV: {
        description: '返回指定 beta 分布的累积 beta 概率密度函数的反函数。 也就是说，如果 probability = BETADIST(x,...)，则 BETAINV(probability,...) = x。 beta 分布函数可用于项目设计，在已知预期的完成时间和变化参数后，模拟可能的完成时间。',
        abstract: '返回指定 beta 分布的累积 beta 概率密度函数的反函数。 也就是说，如果 probability = BETADIST(x,...)，则 BETAINV(probability,...) = x。 beta 分布函数可用于项目设计，在已知预期的完成时间和变化参数后，模拟可能的完成时间。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '必填。 与 beta 分布相关的概率。' },
            alpha: { name: 'alpha', detail: '必填。 分布参数。' },
            beta: { name: 'beta', detail: '必填。 分布参数。' },
            A: { name: '下限', detail: '可选。 x 所属区间的下界。' },
            B: { name: '上限', detail: '可选。 x 所属区间的上界。' },
        },
    },
    BINOMDIST: {
        description: '返回一元二项式分布的概率。 BINOMDIST 用于处理固定次数的试验或实验问题，前提是任意试验的结果仅为成功或失败两种情况，实验是独立实验，且在整个试验过程中成功的概率固定不变。 例如，BINOMDIST 可以计算三个即将出生的婴儿中两个是男孩的概率。',
        abstract: '返回一元二项式分布的概率。 BINOMDIST 用于处理固定次数的试验或实验问题，前提是任意试验的结果仅为成功或失败两种情况，实验是独立实验，且在整个试验过程中成功的概率固定不变。 例如，BINOMDIST 可以计算三个即将出生的婴儿中两个是男孩的概率。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: '成功次数', detail: '必填。 试验的成功次数。' },
            trials: { name: '试验次数', detail: '必填。 独立试验次数。' },
            probabilityS: { name: '成功概率', detail: '必填。 每次试验成功的概率。' },
            cumulative: { name: '累积', detail: '必填。 决定函数形式的逻辑值。 如果 cumulative 为 TRUE，则 BINOMDIST 返回累积分布函数，即最多存在 number_s 次成功的概率；如果为 FALSE，则返回概率密度函数，即存在 number_s 次成功的概率。' },
        },
    },
    CHIDIST: {
        description: '返回 χ2 分布的右尾概率。 χ2 分布与 χ2 测试相关联。 使用 χ2 测试可比较观察值和预期值。 例如，某项遗传学实验可能假设下一代植物将呈现出某一组颜色。 通过使用该函数比较观察结果和理论值，可以确定初始假设是否有效。',
        abstract: '返回 χ2 分布的右尾概率。 χ2 分布与 χ2 测试相关联。 使用 χ2 测试可比较观察值和预期值。 例如，某项遗传学实验可能假设下一代植物将呈现出某一组颜色。 通过使用该函数比较观察结果和理论值，可以确定初始假设是否有效。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '必需。 用来计算分布的数值。' },
            degFreedom: { name: '自由度', detail: '必填。 自由度数。' },
        },
    },
    CHIINV: {
        description: '返回 χ2 分布的右尾概率的反函数。 如果 probability = CHIDIST(x,...)，则 CHIINV(probability,...) = x。 使用此函数可比较观察结果与理论值，以确定初始假设是否有效。',
        abstract: '返回 χ2 分布的右尾概率的反函数。 如果 probability = CHIDIST(x,...)，则 CHIINV(probability,...) = x。 使用此函数可比较观察结果与理论值，以确定初始假设是否有效。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '必填。 与 χ2 分布相关联的概率。' },
            degFreedom: { name: '自由度', detail: '必填。 自由度数。' },
        },
    },
    CHITEST: {
        description: '返回独立性检验值。 CHITEST 返回卡方 (χ2) 分布的统计值和相应的自由度数。 您可以使用 χ2 检验值确定假设结果是否经过实验验证。',
        abstract: '返回独立性检验值。 CHITEST 返回卡方 (χ2) 分布的统计值和相应的自由度数。 您可以使用 χ2 检验值确定假设结果是否经过实验验证。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: '观察范围', detail: '必填。 包含观察值的数据区域，用于检验预期值。' },
            expectedRange: { name: '预期范围', detail: '必填。 包含行列汇总的乘积与总计值之比率的数据区域。' },
        },
    },
    CONFIDENCE: {
        description: '使用正态分布返回总体平均值的置信区间。',
        abstract: '使用正态分布返回总体平均值的置信区间。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '必填。 用来计算置信水平的显著性水平。 置信水平等于 100*(1 - alpha)%，亦即，如果 alpha 为 0.05，则置信水平为 95%。' },
            standardDev: { name: '总体标准偏差', detail: '必填。 数据区域的总体标准偏差，假定为已知。' },
            size: { name: '样本大小', detail: '必填。 样本大小。' },
        },
    },
    COVAR: {
        description: '返回协方差，即两个数据集中每个数据点对的偏差积的平均值。',
        abstract: '返回协方差，即两个数据集中每个数据点对的偏差积的平均值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: '数组1', detail: '必填。 整数的第一个单元格区域。' },
            array2: { name: '数组2', detail: '必填。 整数的第二个单元格区域。' },
        },
    },
    CRITBINOM: {
        description: '返回一个数值，它是使得累积二项式分布的函数值大于等于临界值的最小整数。 此函数可用于质量检验。 例如，使用 CRITBINOM 来决定装配线上整批产品达到检验合格所允许的最多残次品个数。',
        abstract: '返回一个数值，它是使得累积二项式分布的函数值大于等于临界值的最小整数。 此函数可用于质量检验。 例如，使用 CRITBINOM 来决定装配线上整批产品达到检验合格所允许的最多残次品个数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: '试验次数', detail: '必填。 贝努利试验次数。' },
            probabilityS: { name: '成功概率', detail: '必填。 一次试验中成功的概率。' },
            alpha: { name: '目标概率', detail: '必填。 临界值。' },
        },
    },
    EXPONDIST: {
        description: '返回指数分布。 使用 EXPONDIST 可以建立事件之间的时间间隔模型，如银行自动提款机支付一次现金所花费的时间。 例如，可通过 EXPONDIST 来确定这一过程最长持续一分钟的发生概率。',
        abstract: '返回指数分布。 使用 EXPONDIST 可以建立事件之间的时间间隔模型，如银行自动提款机支付一次现金所花费的时间。 例如，可通过 EXPONDIST 来确定这一过程最长持续一分钟的发生概率。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '必需。 函数值。' },
            lambda: { name: 'lambda', detail: '必填。 参数值。' },
            cumulative: { name: '累积', detail: '必填。 逻辑值，用于指定指数函数的形式。 如果 cumulative 为 TRUE，则 EXPONDIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
        },
    },
    FDIST: {
        description: '返回两个数据集的（右尾）F 概率分布（变化程度）。 使用此函数可以确定两组数据是否存在变化程度上的不同。 例如，分析进入中学的男生、女生的考试分数，来确定女生分数的变化程度是否与男生不同。',
        abstract: '返回两个数据集的（右尾）F 概率分布（变化程度）。 使用此函数可以确定两组数据是否存在变化程度上的不同。 例如，分析进入中学的男生、女生的考试分数，来确定女生分数的变化程度是否与男生不同。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '必需。 用来计算函数的值。' },
            degFreedom1: { name: '分子自由度', detail: '必填。 分子自由度。' },
            degFreedom2: { name: '分母自由度', detail: '必填。 分母自由度。' },
        },
    },
    FINV: {
        description: '返回（右尾）F 概率分布函数的反函数值。 如果 p = FDIST(x,...)，则 FINV(p,...) = x。',
        abstract: '返回（右尾）F 概率分布函数的反函数值。 如果 p = FDIST(x,...)，则 FINV(p,...) = x。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '必填。 F 累积分布的概率值。' },
            degFreedom1: { name: '分子自由度', detail: '必填。 分子自由度。' },
            degFreedom2: { name: '分母自由度', detail: '必填。 分母自由度。' },
        },
    },
    FTEST: {
        description: '返回 F 测试的结果。 F 测试返回 array1 和 array2 中的方差没有明显差异的双尾概率。 使用此函数可确定两个示例是否有不同的方差。 例如，给定公立和私立学校的测验分数，可以检验各学校间测验分数的差别程度。',
        abstract: '返回 F 测试的结果。 F 测试返回 array1 和 array2 中的方差没有明显差异的双尾概率。 使用此函数可确定两个示例是否有不同的方差。 例如，给定公立和私立学校的测验分数，可以检验各学校间测验分数的差别程度。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: '数组1', detail: '必填。 第一个数组或数据区域。' },
            array2: { name: '数组2', detail: '必填。 第二个数组或数据区域。' },
        },
    },
    GAMMADIST: {
        description: '返回伽玛分布函数的函数值。 可以使用此函数来研究呈斜分布的变量。 伽玛分布通常用于排队分析。',
        abstract: '返回伽玛分布函数的函数值。 可以使用此函数来研究呈斜分布的变量。 伽玛分布通常用于排队分析。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必需。 用来计算分布的数值。' },
            alpha: { name: 'alpha', detail: '必填。 分布参数。' },
            beta: { name: 'beta', detail: '必填。 分布参数。 如果 beta = 1，则 GAMMADIST 返回标准伽玛分布。' },
            cumulative: { name: '累积', detail: '必填。 决定函数形式的逻辑值。 如果 cumulative 为 TRUE，则 GAMMADIST 返回累积分布函数；如果为 FALSE，则返回概率密度函数。' },
        },
    },
    GAMMAINV: {
        description: '返回伽玛累积分布函数的反函数值。 如果 p = GAMMADIST(x,...)，则 GAMMAINV(p,...) = x。 使用此函数可以研究有可能呈斜分布的变量。',
        abstract: '返回伽玛累积分布函数的反函数值。 如果 p = GAMMADIST(x,...)，则 GAMMAINV(p,...) = x。 使用此函数可以研究有可能呈斜分布的变量。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '必填。 伽玛分布相关的概率。' },
            alpha: { name: 'alpha', detail: '必填。 分布参数。' },
            beta: { name: 'beta', detail: '必填。 分布参数。 如果 beta = 1，则 GAMMAINV 返回标准伽玛分布。' },
        },
    },
    HYPGEOMDIST: {
        description: '返回超几何分布。 如果已知样本量、总体成功次数和总体大小，则 HYPGEOMDIST 返回样本取得已知成功次数的概率。 HYPGEOMDIST 用于处理以下的有限总体问题，在该有限总体中，每次观察结果或为成功或为失败，并且已知样本量的每个子集的选取是等可能的。',
        abstract: '返回超几何分布。 如果已知样本量、总体成功次数和总体大小，则 HYPGEOMDIST 返回样本取得已知成功次数的概率。 HYPGEOMDIST 用于处理以下的有限总体问题，在该有限总体中，每次观察结果或为成功或为失败，并且已知样本量的每个子集的选取是等可能的。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: '样本成功次数', detail: '必填。 样本中成功的次数。' },
            numberSample: { name: '样本大小', detail: '必填。 样本量。' },
            populationS: { name: '总体成功次数', detail: '必填。 总体中成功的次数。' },
            numberPop: { name: '总体大小', detail: '必填。 总体大小。' },
        },
    },
    LOGINV: {
        description: '返回 x 的对数累积分布函数的反函数值，此处的 ln(x) 是服从参数 mean 和 standard_dev 的正态分布。 如果 p = LOGNORMDIST(x,...)，则 LOGINV(p,...) = x。',
        abstract: '返回 x 的对数累积分布函数的反函数值，此处的 ln(x) 是服从参数 mean 和 standard_dev 的正态分布。 如果 p = LOGNORMDIST(x,...)，则 LOGINV(p,...) = x。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '必填。 与对数分布相关的概率。' },
            mean: { name: '平均值', detail: '必填。 ln(x) 的平均值。' },
            standardDev: { name: '标准偏差', detail: '必填。 ln(x) 的标准偏差。' },
        },
    },
    LOGNORMDIST: {
        description: '返回 x 的对数累积分布函数的函数值，此处的 ln(x) 是服从参数 mean 和 standard_dev 的正态分布。 使用此函数可以分析经过对数变换的数据。',
        abstract: '返回 x 的对数累积分布函数的函数值，此处的 ln(x) 是服从参数 mean 和 standard_dev 的正态分布。 使用此函数可以分析经过对数变换的数据。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必需。 用来计算函数的值。' },
            mean: { name: '平均值', detail: '必填。 ln(x) 的平均值。' },
            standardDev: { name: '标准偏差', detail: '必填。 ln(x) 的标准偏差。' },
        },
    },
    MODE: {
        description: '假设你想要找出 30 年内在关键湿地的鸟类计数样本中发现的最常见的鸟类物种数量，或者想要找出非高峰时段电话支持中心最常发生的电话次数。 若要计算一组数字的模式，请使用 MODE 函数。',
        abstract: '假设你想要找出 30 年内在关键湿地的鸟类计数样本中发现的最常见的鸟类物种数量，或者想要找出非高峰时段电话支持中心最常发生的电话次数。 若要计算一组数字的模式，请使用 MODE 函数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '必填。 要计算其众数的第一个数字参数。' },
            number2: { name: '数值 2', detail: '选。 要计算其众数的 2 到 255 个数字参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    NEGBINOMDIST: {
        description: '返回负二项式分布。 当成功概率为常量 probability_s 时，NEGBINOMDIST 返回在达到 number_s 次成功之前，出现 number_f 次失败的概率。 此函数与二项式分布相似，只是它的成功次数固定，试验次数为变量。 与二项式分布相同的是，二者均假定试验是独立的。',
        abstract: '返回负二项式分布。 当成功概率为常量 probability_s 时，NEGBINOMDIST 返回在达到 number_s 次成功之前，出现 number_f 次失败的概率。 此函数与二项式分布相似，只是它的成功次数固定，试验次数为变量。 与二项式分布相同的是，二者均假定试验是独立的。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: '失败次数', detail: '必填。 失败的次数。' },
            numberS: { name: '成功次数', detail: '必填。 成功次数的阈值。' },
            probabilityS: { name: '成功概率', detail: '必填。 成功的概率。' },
        },
    },
    NORMDIST: {
        description: 'NORMDIST 函数返回指定平均值和标准偏差的正态分布。 此函数在统计（包括假设测试）中具有广泛的应用。',
        abstract: 'NORMDIST 函数返回指定平均值和标准偏差的正态分布。 此函数在统计（包括假设测试）中具有广泛的应用。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必需。 要为其分配的值' },
            mean: { name: '平均值', detail: '必填。 分布的算术平均值' },
            standardDev: { name: '标准偏差', detail: '必填。 分布的标准偏差' },
            cumulative: { name: '累积', detail: '必填。 决定函数形式的逻辑值。 如果 cumulative 为 TRUE，则 NORMDIST 返回累积分布函数;如果 cumulative 为 FALSE，则返回概率质量函数。' },
        },
    },
    NORMINV: {
        description: '返回指定平均值和标准偏差的正态累积分布函数的反函数值。',
        abstract: '返回指定平均值和标准偏差的正态累积分布函数的反函数值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '必填。 对应于正态分布的概率。' },
            mean: { name: '平均值', detail: '必填。 分布的算术平均值。' },
            standardDev: { name: '标准偏差', detail: '必填。 分布的标准偏差。' },
        },
    },
    NORMSDIST: {
        description: '返回标准正态累积分布函数的函数值。 该分布的平均值为 0（零），标准偏差为 1。 可以使用此函数代替标准正态曲线面积表。',
        abstract: '返回标准正态累积分布函数的函数值。 该分布的平均值为 0（零），标准偏差为 1。 可以使用此函数代替标准正态曲线面积表。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '必需。 需要计算其分布的数值。' },
        },
    },
    NORMSINV: {
        description: '返回标准正态累积分布函数的反函数值。 该分布的平均值为 0，标准偏差为 1。',
        abstract: '返回标准正态累积分布函数的反函数值。 该分布的平均值为 0，标准偏差为 1。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '必填。 对应于正态分布的概率。' },
        },
    },
    PERCENTILE: {
        description: '返回区域中数值的第 k 个百分点的值。 可以使用此函数来确定接受的阈值。 例如，可以决定检查得分高于第 90 个百分点的候选人。',
        abstract: '返回区域中数值的第 k 个百分点的值。 可以使用此函数来确定接受的阈值。 例如，可以决定检查得分高于第 90 个百分点的候选人。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '必填。 定义相对位置的数组或数据区域。' },
            k: { name: 'k', detail: '必需。 0 到 1 之间的百分点值，包含 0 和 1。' },
        },
    },
    PERCENTRANK: {
        description: 'PERCENTRANK 函数以数据集的百分比形式返回数据集中某个值的排名，实质上是整个数据集中某个值的相对位置。 例如，可以使用 PERCENTRANK 来确定个人测试分数在同一测试的所有分数字段中的地位。',
        abstract: 'PERCENTRANK 函数以数据集的百分比形式返回数据集中某个值的排名，实质上是整个数据集中某个值的相对位置。 例如，可以使用 PERCENTRANK 来确定个人测试分数在同一测试的所有分数字段中的地位。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '必填。 (或预定义数组的数据范围) 确定百分比秩的数值。' },
            x: { name: 'x', detail: '必需。 想要了解数组中排名的值。' },
            significance: { name: '有效位数', detail: '选。 用于标识返回的百分比值的有效位数的值。 如果省略，则 PERCENTRANK 使用 3 位小数 (0.xxx)。' },
        },
    },
    POISSON: {
        description: '返回泊松分布。 泊松分布的一个常见应用是预测特定时间内的事件数，例如 1 分钟内到达收费停车场的汽车数。',
        abstract: '返回泊松分布。 泊松分布的一个常见应用是预测特定时间内的事件数，例如 1 分钟内到达收费停车场的汽车数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必需。 事件数。' },
            mean: { name: '平均值', detail: '必填。 期望值。' },
            cumulative: { name: '累积', detail: '必填。 一逻辑值，确定所返回的概率分布的形式。 如果 cumulative 为 TRUE，则 POISSON 返回发生的随机事件数在零（含零）和 x（含 x）之间的累积泊松概率；如果为 FALSE，则 POISSON 返回发生的事件数正好是 x 的泊松概率密度函数。' },
        },
    },
    QUARTILE: {
        description: '返回一组数据的四分位点。 四分位点通常用于销售和调查数据，以对总体进行分组。 例如，您可以使用 QUARTILE 查找总体中前 25% 的收入值。',
        abstract: '返回一组数据的四分位点。 四分位点通常用于销售和调查数据，以对总体进行分组。 例如，您可以使用 QUARTILE 查找总体中前 25% 的收入值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '必填。 要求得四分位数值的数组或数字型单元格区域。' },
            quart: { name: '四分位值', detail: '必填。 指定返回哪一个值。' },
        },
    },
    RANK: {
        description: '返回一列数字的数字排位。 数字的排名是其相对于列表中其他值的大小。 (如果要对列表进行排序，则数字的排名将是其位置。)',
        abstract: '返回一列数字的数字排位。 数字的排名是其相对于列表中其他值的大小。 (如果要对列表进行排序，则数字的排名将是其位置。)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '必填。 要找到其排位的数字。' },
            ref: { name: '数字列表', detail: '必填。 对数字列表的引用。 Ref 中的非数字值会被忽略。' },
            order: { name: '排位方式', detail: '选。 一个指定数字排位方式的数字。 如果 order 为 0（零）或省略，Microsoft Excel 对数字的排位是基于 ref 为按照降序排列的列表。 如果 order 不为零，Microsoft Excel 对数字的排位是基于 ref 为按照升序排列的列表。' },
        },
    },
    STDEV: {
        description: '根据样本估计标准偏差。 标准偏差可以测量值在平均值（中值）附近分布的范围大小。',
        abstract: '根据样本估计标准偏差。 标准偏差可以测量值在平均值（中值）附近分布的范围大小。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '必填。 对应于总体样本的第一个数值参数。' },
            number2: { name: '数值 2', detail: '选。 对应于总体样本的 2 到 255 个数值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    STDEVP: {
        description: '根据作为参数给定的整个总体计算标准偏差。 标准偏差可以测量值在平均值（中值）附近分布的范围大小。',
        abstract: '根据作为参数给定的整个总体计算标准偏差。 标准偏差可以测量值在平均值（中值）附近分布的范围大小。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '必填。 对应于总体的第一个数值参数。' },
            number2: { name: '数值 2', detail: '选。 对应于总体的 2 到 255 个数值参数。 也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
        },
    },
    TDIST: {
        description: '返回学生 t 分布的百分点（概率），其中，数字值 (x) 是用来计算百分点的 t 的计算值。 t 分布用于小型样本数据集的假设检验。 可以使用该函数代替 t 分布的临界值表。',
        abstract: '返回学生 t 分布的百分点（概率），其中，数字值 (x) 是用来计算百分点的 t 的计算值。 t 分布用于小型样本数据集的假设检验。 可以使用该函数代替 t 分布的临界值表。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必需。 需要计算分布的数值。' },
            degFreedom: { name: '自由度', detail: '必填。 一个表示自由度数的整数。' },
            tails: { name: '尾部特性', detail: '必填。 指定返回的分布函数是单尾分布还是双尾分布。 如果 Tails = 1，则 TDIST 返回单尾分布。 如果Tails = 2，则 TDIST 返回双尾分布。' },
        },
    },
    TINV: {
        description: '返回学生 t 分布的双尾反函数。',
        abstract: '返回学生 t 分布的双尾反函数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '概率', detail: '必填。 与双尾学生 t 分布相关的概率。' },
            degFreedom: { name: '自由度', detail: '必填。 代表分布的自由度数。' },
        },
    },
    TTEST: {
        description: '返回与学生 t 检验相关的概率。 使用函数 TTEST 确定两个样本是否可能来自两个具有相同平均值的基础总体。',
        abstract: '返回与学生 t 检验相关的概率。 使用函数 TTEST 确定两个样本是否可能来自两个具有相同平均值的基础总体。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: '数组1', detail: '必填。 第一个数据集。' },
            array2: { name: '数组2', detail: '必填。 第二个数据集。' },
            tails: { name: '尾部特性', detail: '必填。 指定分布尾数。 如果 tails = 1，则 TTEST 使用单尾分布。 如果 tails = 2，则 TTEST 使用双尾分布。' },
            type: { name: '检验类型', detail: '必填。 要执行的 t 检验的类型。' },
        },
    },
    VAR: {
        description: '计算基于给定样本的方差。',
        abstract: '计算基于给定样本的方差。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '必填。 对应于总体样本的第一个数值参数。' },
            number2: { name: '数值 2', detail: '选。 对应于总体样本的 2 到 255 个数值参数。' },
        },
    },
    VARP: {
        description: '根据整个总体计算方差。',
        abstract: '根据整个总体计算方差。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '必填。 对应于总体的第一个数值参数。' },
            number2: { name: '数值 2', detail: '选。 对应于总体的 2 到 255 个数值参数。' },
        },
    },
    WEIBULL: {
        description: '返回 Weibull 分布。 可以将该分布用于可靠性分析，例如计算设备出现故障的平均时间。',
        abstract: '返回 Weibull 分布。 可以将该分布用于可靠性分析，例如计算设备出现故障的平均时间。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必需。 用来计算函数的值。' },
            alpha: { name: 'alpha', detail: '必填。 分布参数。' },
            beta: { name: 'beta', detail: '必填。 分布参数。' },
            cumulative: { name: '累积', detail: '必填。 确定函数的形式。' },
        },
    },
    ZTEST: {
        description: '返回 z 检验的单尾概率值。 对于给定的假设总体平均值 μ0，ZTEST 返回样本平均值大于数据集（数组）中观察平均值的概率，即观察样本平均值。',
        abstract: '返回 z 检验的单尾概率值。 对于给定的假设总体平均值 μ0，ZTEST 返回样本平均值大于数据集（数组）中观察平均值的概率，即观察样本平均值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '必填。 用来检验 x 的数组或数据区域。' },
            x: { name: 'x', detail: '必需。 要测试的值。' },
            sigma: { name: '标准偏差', detail: '选。 总体（已知）标准偏差。 如果省略，则使用样本标准偏差。' },
        },
    },
};

export default locale;
