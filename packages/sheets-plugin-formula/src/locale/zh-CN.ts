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
            SUMIF: {
                description: '对范围中符合指定条件的值求和。',
                abstract: '对范围中符合指定条件的值求和。',
                functionParameter: {
                    range: {
                        name: '范围',
                        detail: '要根据条件进行检测的范围。',
                    },
                    criterion: {
                        name: '条件',
                        detail: '要应用于范围的模式或测试条件。\n\n如果范围包含的是要检测的文本，则条件必须为字符串。条件可以包含通配符，包括用于匹配单个字符的?或用于匹配零个或连续多个字符的*。要匹配问号星号本身，请在该字符前面加上波浪号(~)前缀（即~?和~*）。字符串条件必须用引号括起来。函数会检查范围中的每个单元格与条件是否相等或匹配（如果使用了通配符）。\n\n如果范围包含的是要检测的数字，则条件可以是字符串也可以是数字。如果给定的条件是一个数字，则检查范围中的每个单元格是否等于条件。另外，条件也可能是包含数字的字符串（也将对其进行相等检测），或者带有以下前缀的数字：=（检查是否相等）、>（检查范围单元格的值是否大于条件值）或<（检查范围单元格的值是否小于条件值）',
                    },
                    sum_range: {
                        name: '求和范围',
                        detail: '要求和的范围（如果与范围不同）。',
                    },
                },
            },
            TAN: {
                description: '返回已知角度的正切值。',
                abstract: '返回已知角度的正切值。',
                functionParameter: {
                    angle: {
                        name: '角度',
                        detail: '要求其正切值的角度，以弧度表示。',
                    },
                },
            },
            // TANH: {
            //     description: '返回给定实数的双曲正切值。',
            //     abstract: '返回给定实数的双曲正切值。',
            //     functionParameter: {
            //         value: {
            //             name: '值',
            //             detail: '要计算其双曲正切值的实数。',
            //         },
            //     },
            // },
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
