export default {
    formula: {
        formulaLabel: '求和',
        formulaRightLabel: '更多公式',
        ok: '确定',
        cancel: '取消',
        clearValidation: '清除验证',
        formula: {
            sum: '求和',
            average: '平均值',
            count: '计数',
            max: '最大值',
            min: '最小值',
            if: 'if公式生成器',
            more: '更多函数...',
        },
        functionList: {
            SUMIF: {
                d: '对范围中符合指定条件的值求和。',
                p: {
                    range: {
                        name: '范围',
                        detail: '要根据条件进行检测的范围。',
                    },
                    rangeAll: {
                        name: '条件',
                        detail: '要应用于范围的模式或测试条件。\n\n如果范围包含的是要检测的文本，则条件必须为字符串。条件可以包含通配符，包括用于匹配单个字符的?或用于匹配零个或连续多个字符的*。要匹配问号星号本身，请在该字符前面加上波浪号(~)前缀（即~?和~*）。字符串条件必须用引号括起来。函数会检查范围中的每个单元格与条件是否相等或匹配（如果使用了通配符）。\n\n如果范围包含的是要检测的数字，则条件可以是字符串也可以是数字。如果给定的条件是一个数字，则检查范围中的每个单元格是否等于条件。另外，条件也可能是包含数字的字符串（也将对其进行相等检测），或者带有以下前缀的数字：=（检查是否相等）、>（检查范围单元格的值是否大于条件值）或<（检查范围单元格的值是否小于条件值）',
                    },
                    range1: {
                        name: '求和范围',
                        detail: '要求和的范围（如果与范围不同）。',
                    },
                },
            },
            TAN: {
                d: '返回已知角度的正切值。',
                p: {
                    rangeNumber: {
                        name: '角度',
                        detail: '要求其正切值的角度，以弧度表示。',
                    },
                },
            },
            TANH: {
                d: '返回给定实数的双曲正切值。',
                p: {
                    rangeNumber: {
                        name: '值',
                        detail: '要计算其双曲正切值的实数。',
                    },
                },
            },
            CEILING: {
                d: '将数值向上取整为最接近的指定因数的倍数。',
                p: {
                    rangeNumber: {
                        name: '值',
                        detail: '要向上舍入的数值。',
                    },
                    rangeNumber1: {
                        name: '因数',
                        detail: '要将值舍入到此数的整数倍。',
                    },
                },
            },
            ATAN: {
                d: '返回数值的反正切值，以弧度表示。',
                p: {
                    rangeNumber: {
                        name: '值',
                        detail: '要计算其反正切值的数值。',
                    },
                },
            },
            ASINH: {
                d: '返回数值的反双曲正弦值。',
                p: {
                    rangeNumber: {
                        name: '值',
                        detail: '要计算其反双曲正弦值的数值。',
                    },
                },
            },
            ABS: {
                d: '返回数值的绝对值。',
                p: {
                    rangeNumber: {
                        name: 'value',
                        detail: '要返回其绝对值的数。',
                    },
                },
            },
            COUNTBLANK: {
                d: '返回给定范围内的空单元格数。',
                p: {
                    range: {
                        name: '范围',
                        detail: '要统计空白单元格数量的范围。',
                    },
                },
            },
            COSH: {
                d: '返回给定实数的双曲余弦值。',
                p: {
                    rangeNumber: {
                        name: '值',
                        detail: '要计算其双曲余弦值的实数值。',
                    },
                },
            },
            COUNTIF: {
                d: '返回范围内满足某个条件的单元格的数量。',
                p: {
                    range: {
                        name: '范围',
                        detail: '要根据条件进行检测的范围。',
                    },
                    rangeAll: {
                        name: '条件',
                        detail: '要应用于范围的模式或测试条件。\n\n如果范围包含的是要检测的文本，则条件必须为字符串。条件可以包含通配符，包括用于匹配单个字符的?或用于匹配零个或连续多个字符的*。要匹配问号星号本身，请在该字符前面加上波浪号(~)前缀（即~?和~*）。字符串条件必须用引号括起来。函数会检查范围中的每个单元格与条件是否相等或匹配（如果使用了通配符）。\n\n如果范围包含的是要检测的数字，则条件可以是字符串也可以是数字。如果给定的条件是一个数字，则检查范围中的每个单元格是否等于条件。另外，条件也可能是包含数字的字符串（也将对其进行相等检测），或者带有以下前缀的数字：=、>、>=、<或<=，这些条件将分别用于检查范围中的单元格是否等于、大于、大于等于、小于、小于等于条件值。',
                    },
                },
            },
            ERFC: {
                d: '返回数值的互补高斯误差函数。',
                p: {
                    rangeNumber: {
                        name: 'z',
                        detail: '要为其计算互补高斯误差函数的数值。',
                    },
                },
            },
            VLOOKUP: {
                d: '纵向查找。在范围的第一列中自上而下搜索某个键值，并返回所找到的行中指定单元格的值。',
                p: {
                    rangeAll: {
                        name: '搜索键值',
                        detail: '要搜索的值，如 42、"Cats" 或 I24。',
                    },
                    rangeAll1: {
                        name: '范围',
                        detail: '要进行搜索的范围。VLOOKUP 将在该范围的第一列中搜索搜索键值中指定的键值。',
                    },
                    rangeNumber: {
                        name: '索引',
                        detail: '要返回的值的列索引，范围中的第一列编号为 1。\n\n如果索引不是介于 1 和范围中的列数之间，将返回 #VALUE! 。',
                    },
                    rangeAll2: {
                        name: '已排序',
                        detail: '[默认值为 TRUE() ] - 指示要搜索的列（指定范围的第一列）是否已排序。大多数情况下，建议设为 FALSE()。\n\n建议将已排序设为 FALSE。如果设为 FALSE，将返回完全匹配项。如果存在多个匹配值，将返回找到的第一个值对应的单元格的内容，如果找不到匹配值，则返回 #N/A。\n\n如果将已排序设为 TRUE 或省略，将返回（小于或等于搜索键值的）最接近的匹配项。如果搜索的列中所有的值均大于搜索键值，则返回 #N/A。',
                    },
                },
            },
            TIME: {
                d: '将给定的小时、分钟和秒转换为时间。',
                p: {
                    rangeNumber: {
                        name: '小时',
                        detail: '0（零）到 32767 之间的数字，代表小时。\n\n任何大于 23 的值都会除以 24，余数将作为小时值。',
                    },
                    rangeNumber1: {
                        name: '分钟',
                        detail: '0（零）到 32767 之间的数字，代表分钟。\n\n任何大于 59 的值将转换为小时和分钟。',
                    },
                    rangeNumber2: {
                        name: '秒',
                        detail: '0（零）到 32767 之间的数字，代表秒。\n\n任何大于 59 的值将转换为小时、分钟和秒。',
                    },
                },
            },
            EFFECT: {
                d: '根据名义利率及每年的复利计息期数来计算实际年利率。',
                p: {
                    rangeNumber: {
                        name: 'nominal_rate',
                        detail: '每年的名义利率。',
                    },
                    rangeNumber1: {
                        name: 'npery',
                        detail: '每年的复利计算期数。',
                    },
                },
            },
            BIN2DEC: {
                d: '将二进制数转换为十进制数。',
                p: {
                    rangeAll: {
                        name: 'number',
                        detail: '要转换为十进制数的带符号的10位二进制数值（以字符串形式提供）。\n\n带符号的二进制数的最高位是符号位；也就是说，负数是以二的补码形式表示的。\n\n对于此函数，最大的正数输入值为0111111111，最小的负数输入值为1000000000。\n\n如果所提供的带符号的二进制数是有效的二进制数，会自动将其转换为相应的字符串输入。例如，BIN2DEC(100)和BIN2DEC("100")得出的结果相同，均为4。',
                    },
                },
            },
            TRUE: {
                d: '返回逻辑值 TRUE。',
            },
            NE: {
                d: '如果指定的值不相等，则返回“TRUE”；否则返回“FALSE”。相当于“<>”运算符。',
                p: {
                    rangeAll: {
                        name: 'value1',
                        detail: '第一个值。',
                    },
                    rangeAll1: {
                        name: 'value2',
                        detail: '要检查是否与 value1 不相等的值。',
                    },
                },
            },
            SEX_BY_IDCARD: {
                d: '根据中国身份证号计算出性别。支持15位或18位身份证',
                p: {
                    rangeAll: {
                        name: '身份证号',
                        detail: '15位或者18位的身份证号或范围。',
                    },
                },
            },
        },
        formulaMore: {
            valueTitle: '值',
            tipSelectDataRange: '选取数据范围',
            tipDataRangeTile: '数据范围',
            findFunctionTitle: '查找函数',
            tipInputFunctionName: '请输入您要查找的函数名称或函数功能的简要描述',
            whole: '全部',

            Math: '数学',
            Statistical: '统计',
            Lookup: '查找',
            universheet: 'UniverSheet内置',
            dataMining: '数据挖掘',
            Database: '数据源',
            Date: '日期',
            Filter: '过滤器',
            Financial: '财务',
            Engineering: '工程计算',
            Logical: '逻辑',
            Operator: '运算符',
            Text: '文本',
            Parser: '转换工具',
            Array: '数组',
            other: '其它',

            selectFunctionTitle: '选择函数',
            calculationResult: '计算结果',

            tipSuccessText: '成功',
            tipParamErrorText: '参数类型错误',

            helpClose: '关闭',
            helpCollapse: '收起',
            helpExample: '示例',
            helpAbstract: '摘要',

            execfunctionError: '提示", "公式存在错误',
            execfunctionSelfError: '公式不可引用其本身的单元格',
            execfunctionSelfErrorResult: '公式不可引用其本身的单元格，会导致计算结果不准确',

            allowRepeatText: '可重复',
            allowOptionText: '可选',

            selectCategory: '或选择类别',
        },
        ifFormula: {
            tipNotBelongToIf: '该单元格函数不属于if公式！',
            tipSelectCell: '请选择单元格插入函数',

            ifGenCompareValueTitle: '比较值',
            ifGenSelectCellTitle: '点击选择单元格',
            ifGenRangeTitle: '范围',
            ifGenRangeTo: '至',
            ifGenRangeEvaluate: '范围评估',
            ifGenSelectRangeTitle: '点击选择范围',
            ifGenCutWay: '划分方式',
            ifGenCutSame: '划分值相同',
            ifGenCutNpiece: '划分为N份',
            ifGenCutCustom: '自定义输入',
            ifGenCutConfirm: '生成',

            ifGenTipSelectCell: '选择单元格',
            ifGenTipSelectCellPlace: '请选择单元格',

            ifGenTipSelectRange: '选择单范围',
            ifGenTipSelectRangePlace: '请选择范围',

            ifGenTipNotNullValue: '比较值不能为空！',
            ifGenTipLableTitile: '标签',
            ifGenTipRangeNotforNull: '范围不能为空！',
            ifGenTipCutValueNotforNull: '划分值不能为空！',
            ifGenTipNotGenCondition: '没有生成可用的条件！',
        },
    },
};
