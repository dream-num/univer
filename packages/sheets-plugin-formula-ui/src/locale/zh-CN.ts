import mathZhCN from './function-list/math/zh-CN';

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
            AVERAGE: {
                description: '返回参数的平均值（算术平均值）。',
                abstract: '返回参数平均值。',
                functionParameter: {
                    number1: {
                        name: '数值1',
                        detail: '要计算平均值的第一个数字、单元格引用或单元格区域。',
                    },
                    number2: {
                        name: '数值2',
                        detail: '要计算平均值的其他数字、单元格引用或单元格区域，最多可包含 255 个。',
                    },
                },
            },
            ...mathZhCN,
        },

        formulaMore: {
            helpExample: '示例',
            helpAbstract: '简介',

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

            searchFunctionPlaceholder: '搜索函数',
        },

        moreFunctions: {
            confirm: '确定',
            prev: '上一步',
            next: '下一步',
        },
    },
};
