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
    ADDRESS: {
        description:
            '根据指定行号和列号获得工作表中的某个单元格的地址。 例如，ADDRESS(2,3) 返回 $C$2。 再例如，ADDRESS(77,300) 返回 $KN$77。 可以使用其他函数（如 ROW 和 COLUMN 函数）为 ADDRESS 函数提供行号和列号参数。',
        abstract: '以文本形式将引用值返回到工作表的单个单元格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/address-%E5%87%BD%E6%95%B0-d0c26c0d-3991-446b-8de4-ab46431d4f89',
            },
        ],
        functionParameter: {
            row_num: { name: '行号', detail: '一个数值，指定要在单元格引用中使用的行号。' },
            column_num: { name: '列号', detail: '一个数值，指定要在单元格引用中使用的列号。' },
            abs_num: { name: '引用类型', detail: '一个数值，指定要返回的引用类型。' },
            a1: {
                name: '引用样式',
                detail: '一个逻辑值，指定 A1 或 R1C1 引用样式。 在 A1 样式中，列和行将分别按字母和数字顺序添加标签。 在 R1C1 引用样式中，列和行均按数字顺序添加标签。 如果参数 A1 为 TRUE 或被省略，则 ADDRESS 函数返回 A1 样式引用；如果为 FALSE，则 ADDRESS 函数返回 R1C1 样式引用。',
            },
            sheet_text: {
                name: '工作表名称',
                detail: '一个文本值，指定要用作外部引用的工作表的名称。 例如，公式=ADDRESS (1，1,,,"Sheet2") 返回 Sheet2！$A$1。 如果 sheet_text 参数，则不使用工作表名称，函数返回的地址引用当前工作表上的单元格。',
            },
        },
    },
    AREAS: {
        description: '返回引用中涉及的区域个数',
        abstract: '返回引用中涉及的区域个数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/areas-%E5%87%BD%E6%95%B0-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSE: {
        description: '从值的列表中选择值。',
        abstract: '从值的列表中选择值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/choose-%E5%87%BD%E6%95%B0-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            indexNum: { name: '索引', detail: '用于指定所选定的数值参数。 index_num 必须是介于 1 到 254 之间的数字，或是包含 1 到 254 之间的数字的公式或单元格引用。\n如果 index_num 为 1，则 CHOOSE 返回 value1；如果为 2，则 CHOOSE 返回 value2，以此类推。\n如果 index_num 小于 1 或大于列表中最后一个值的索引号，则 CHOOSE 返回 #VALUE! 错误值。\n如果 index_num 为小数，则在使用前将被截尾取整。' },
            value1: { name: '值 1', detail: 'CHOOSE 将根据 index_num 从中选择一个数值或一项要执行的操作。 参数可以是数字、单元格引用、定义的名称、公式、函数或文本。' },
            value2: { name: '值 2', detail: '1 到 254 个值参数。' },
        },
    },
    CHOOSECOLS: {
        description: '返回数组中的指定列',
        abstract: '返回数组中的指定列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/choosecols-%E5%87%BD%E6%95%B0-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '包含要在新数组中返回的列的数组。' },
            colNum1: { name: '列号1', detail: '要返回的第一列。' },
            colNum2: { name: '列号2', detail: '要返回的其他列。' },
        },
    },
    CHOOSEROWS: {
        description: '返回数组中的指定行',
        abstract: '返回数组中的指定行',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chooserows-%E5%87%BD%E6%95%B0-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '包含要在新数组中返回的行的数组。' },
            rowNum1: { name: '行号1', detail: '要返回的第一行号。' },
            rowNum2: { name: '行号2', detail: '要返回的其他行号。' },
        },
    },
    COLUMN: {
        description: '返回给定单元格引用的列号。',
        abstract: '返回引用的列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/column-%E5%87%BD%E6%95%B0-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '要返回其列号的单元格或单元格范围。' },
        },
    },
    COLUMNS: {
        description: '返回数组或引用的列数。',
        abstract: '返回引用中包含的列数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/columns-%E5%87%BD%E6%95%B0-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '要计算列数的数组、数组公式或是对单元格区域的引用。' },
        },
    },
    DROP: {
        description: '从数组的开头或末尾排除指定数量的行或列',
        abstract: '从数组的开头或末尾排除指定数量的行或列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/drop-%E5%87%BD%E6%95%B0-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXPAND: {
        description: '将数组展开或填充到指定的行和列维度',
        abstract: '将数组展开或填充到指定的行和列维度',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/expand-%E5%87%BD%E6%95%B0-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FILTER: {
        description: 'FILTER 函数可以基于定义的条件筛选一系列数据。',
        abstract: 'FILTER 函数可以基于定义的条件筛选一系列数据。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/filter-%E5%87%BD%E6%95%B0-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORMULATEXT: {
        description: '将给定引用的公式返回为文本',
        abstract: '将给定引用的公式返回为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/formulatext-%E5%87%BD%E6%95%B0-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GETPIVOTDATA: {
        description: '返回存储在数据透视表中的数据',
        abstract: '返回存储在数据透视表中的数据',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/getpivotdata-%E5%87%BD%E6%95%B0-8c083b99-a922-4ca0-af5e-3af55960761f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HLOOKUP: {
        description: '在表格的首行或数值数组中搜索值，然后返回表格或数组中指定行的所在列中的值。',
        abstract: '查找数组的首行，并返回指定单元格的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hlookup-%E5%87%BD%E6%95%B0-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '要查找的值。 要查找的值必须位于 table_array 参数中指定的单元格区域的第一行中。',
            },
            tableArray: {
                name: '范围',
                detail: 'VLOOKUP 在其中搜索 lookup_value 和返回值的单元格区域。在其中查找数据的信息表。 使用对区域或区域名称的引用。',
            },
            rowIndexNum: {
                name: '行号',
                detail: '行号table_array匹配值将返回的行号（row_index_num为 1，则返回 table_array 中的第一行值，row_index_num 2 返回 table_array 中的第二行值）。',
            },
            rangeLookup: {
                name: '查询类型',
                detail: '指定希望查找精确匹配值还是近似匹配值：默认近似匹配 - 1/TRUE, 完全匹配 - 0/FALSE',
            },
        },
    },
    HSTACK: {
        description: '水平和顺序追加数组以返回较大的数组',
        abstract: '水平和顺序追加数组以返回较大的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hstack-%E5%87%BD%E6%95%B0-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HYPERLINK: {
        description: '创建快捷方式或跳转，以打开存储在网络服务器、Intranet 或 Internet 上的文档',
        abstract: '创建快捷方式或跳转，以打开存储在网络服务器、Intranet 或 Internet 上的文档',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hyperlink-%E5%87%BD%E6%95%B0-333c7ce6-c5ae-4164-9c47-7de9b76f577f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMAGE: {
        description: '从给定源返回图像',
        abstract: '从给定源返回图像',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/image-%E5%87%BD%E6%95%B0-7e112975-5e52-4f2a-b9da-1d913d51f5d5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INDEX: {
        description: '返回指定的行与列交叉处的单元格引用。 如果引用由不连续的选定区域组成，可以选择某一选定区域。',
        abstract: '使用索引从引用或数组中选择值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/index-%E5%87%BD%E6%95%B0-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '对一个或多个单元格区域的引用。\n如果为引用输入一个不连续的区域，必须将其用括号括起来。\n如果引用中的每个区域均只包含一行（或一列），则 row_num（或 column_num）为可选参数。 例如，对于单行的引用，可以使用函数 INDEX(reference,,column_num)。\n如果数组有多行和多列，但只使用 row_num 或 column_num，函数 INDEX 返回数组中的整行或整列，且返回值也为数组。' },
            rowNum: { name: '行号', detail: '引用中某行的行号，函数从该行返回一个引用。' },
            columnNum: { name: '列号', detail: '引用中某列的列标，函数从该列返回一个引用。' },
            areaNum: { name: '区域编号', detail: '选择要返回 row_num 和 column_num 的交叉点的引用区域。 选择或输入的第一个区域的编号为 1，第二个的编号为 2，依此类推。 如果省略 area_num，则 INDEX 使用区域 1。  此处列出的区域必须全部位于一张工作表。  如果指定的区域不位于同一个工作表，将导致 #VALUE!。 错误。  如果需要使用的范围彼此位于不同工作表，建议使用函数 INDEX 的数组形式，并使用其他函数来计算构成数组的范围。  例如，可以使用 CHOOSE 函数计算将使用的范围。' },
        },
    },
    INDIRECT: {
        description: '返回由文本字符串指定的引用。 此函数立即对引用进行计算，并显示其内容。',
        abstract: '返回由文本值指定的引用',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/indirect-%E5%87%BD%E6%95%B0-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            refText: { name: '引用文本', detail: '对包含 A1 样式引用、R1C1 样式引用、定义为引用的名称或作为文本字符串引用的单元格的引用的引用。 如果ref_text不是有效的单元格引用，INDIRECT 将返回 #REF！ 。\n如果ref_text引用的单元格区域超出了行限制 1,048,576 或列限制 16,384 (XFD) ，INDIRECT 将返回 #REF！ 错误。' },
            a1: { name: '引用类型', detail: '一个逻辑值，用于指定包含在单元格 ref_text 中的引用的类型。\n如果 a1 为 TRUE 或省略，ref_text 被解释为 A1-样式的引用。\n如果 a1 为 FALSE，则将 ref_text 解释为 R1C1 样式的引用。' },
        },
    },
    LOOKUP: {
        description: '当您需要查询一行或一列并查找另一行或列中的相同位置的值时使用',
        abstract: '在向量或数组中查找值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lookup-%E5%87%BD%E6%95%B0-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '在第一个向量中搜索的值。可以是数字、文本、逻辑值、名称或对值的引用。',
            },
            lookupVectorOrArray: { name: '查询范围或数组', detail: '只包含一行或一列的区域。' },
            resultVector: {
                name: '结果范围',
                detail: ' 只包含一行或一列的区域。参数必须与 lookup_vector 参数大小相同。 其大小必须相同。',
            },
        },
    },
    MATCH: {
        description: '使用 MATCH 函数在 范围 单元格中搜索特定的项，然后返回该项在此区域中的相对位置。 例如，如果 A1:A3 区域中包含值 5、25 和 38，那么公式 =MATCH(25,A1:A3,0) 返回数字 2，因为 25 是该区域中的第二项。',
        abstract: '在引用或数组中查找值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/match-%E5%87%BD%E6%95%B0-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            lookupValue: { name: '查找值', detail: '要在 lookup_array 中匹配的值。 例如，如果要在电话簿中查找某人的电话号码，则应该将姓名作为查找值，但实际上需要的是电话号码。lookup_value 参数可以为值（数字、文本或逻辑值）或对数字、文本或逻辑值的单元格引用。' },
            lookupArray: { name: '搜索区域', detail: '要搜索的单元格区域。' },
            matchType: { name: '匹配类型', detail: '数字 -1、0 或 1。 match_type 参数指定 Excel 如何将 lookup_value 与 lookup_array 中的值匹配。 此参数的默认值为 1。' },
        },
    },
    OFFSET: {
        description: '从给定引用中返回引用偏移量',
        abstract: '从给定引用中返回引用偏移量',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/offset-%E5%87%BD%E6%95%B0-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '要基于偏移量的引用。 引用必须引用单元格或相邻单元格区域;否则，OFFSET 返回#VALUE！ 错误值。' },
            rows: { name: '行数', detail: '需要左上角单元格引用的向上或向下行数。 使用 5 作为 rows 参数，可指定引用中的左上角单元格为引用下方的 5 行。 Rows 可为正数（这意味着在起始引用的下方）或负数（这意味着在起始引用的上方）。' },
            cols: { name: '列数', detail: '需要结果的左上角单元格引用的从左到右的列数。 使用 5 作为 cols 参数，可指定引用中的左上角单元格为引用右方的 5 列。 Cols 可为正数（这意味着在起始引用的右侧）或负数（这意味着在起始引用的左侧）。' },
            height: { name: '行高', detail: '需要返回的引用的行高。 Height 必须为正数。' },
            width: { name: '列宽', detail: '需要返回的引用的列宽。 Width 必须为正数。' },
        },
    },
    ROW: {
        description: '返回给定单元格引用的行号。',
        abstract: '返回引用的行号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/row-%E5%87%BD%E6%95%B0-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '需要得到其行号的单元格或单元格区域。' },
        },
    },
    ROWS: {
        description: '返回数组或引用的行数。',
        abstract: '返回引用中的行数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rows-%E5%87%BD%E6%95%B0-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '需要得到其行数的数组、数组公式或对单元格区域的引用。' },
        },
    },
    RTD: {
        description: '从支持 COM 自动化的程序中检索实时数据',
        abstract: '从支持 COM 自动化的程序中检索实时数据',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rtd-%E5%87%BD%E6%95%B0-e0cc001a-56f0-470a-9b19-9455dc0eb593',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORT: {
        description: '对区域或数组的内容进行排序',
        abstract: '对区域或数组的内容进行排序',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/sort-%E5%87%BD%E6%95%B0-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORTBY: {
        description: '根据相应区域或数组中的值对区域或数组的内容进行排序',
        abstract: '根据相应区域或数组中的值对区域或数组的内容进行排序',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/sortby-%E5%87%BD%E6%95%B0-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TAKE: {
        description: '从数组的开头或末尾返回指定数量的连续行或列',
        abstract: '从数组的开头或末尾返回指定数量的连续行或列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/take-%E5%87%BD%E6%95%B0-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TOCOL: {
        description: '返回单个列中的数组',
        abstract: '返回单个列中的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tocol-%E5%87%BD%E6%95%B0-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TOROW: {
        description: '返回单个行中的数组',
        abstract: '返回单个行中的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/torow-%E5%87%BD%E6%95%B0-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TRANSPOSE: {
        description: '返回数组的转置',
        abstract: '返回数组的转置',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/transpose-%E5%87%BD%E6%95%B0-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UNIQUE: {
        description: '返回列表或区域的唯一值列表',
        abstract: '返回列表或区域的唯一值列表',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/unique-%E5%87%BD%E6%95%B0-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VLOOKUP: {
        description:
            '需要在表格或区域中按行查找内容时，请使用 VLOOKUP。 例如，按部件号查找汽车部件的价格，或根据员工 ID 查找员工姓名。',
        abstract: '在数组第一列中查找，然后在行之间移动以返回单元格的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/vlookup-%E5%87%BD%E6%95%B0-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '要查找的值。 要查找的值必须位于 table_array 参数中指定的单元格区域的第一列中。',
            },
            tableArray: {
                name: '范围',
                detail: 'VLOOKUP 在其中搜索 lookup_value 和返回值的单元格区域。 可以使用命名区域或表，并且可以在参数中使用名称，而不是单元格引用。 ',
            },
            colIndexNum: {
                name: '行号',
                detail: '其中包含返回值的单元格的编号（table_array 最左侧单元格为 1 开始编号）。',
            },
            rangeLookup: {
                name: '查询类型',
                detail: '一个逻辑值，该值指定希望 VLOOKUP 查找近似匹配还是精确匹配：近似匹配 - 1/TRUE, 完全匹配 - 0/FALSE',
            },
        },
    },
    VSTACK: {
        description: '按顺序垂直追加数组以返回更大的数组',
        abstract: '按顺序垂直追加数组以返回更大的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/vstack-%E5%87%BD%E6%95%B0-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WRAPCOLS: {
        description: '在指定数量的元素之后按列包装提供的行或值列',
        abstract: '在指定数量的元素之后按列包装提供的行或值列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/wrapcols-%E5%87%BD%E6%95%B0-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WRAPROWS: {
        description: '在指定数量的元素之后按行包装提供的行或值列',
        abstract: '在指定数量的元素之后按行包装提供的行或值列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/wraprows-%E5%87%BD%E6%95%B0-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XLOOKUP: {
        description:
            '函数搜索区域或数组，然后返回与它找到的第一个匹配项对应的项。 如果不存在匹配项，则 XLOOKUP 可以返回最接近的 (近似) 匹配项',
        abstract: '搜索区域或数组，并返回与之找到的第一个匹配项对应的项。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/xlookup-%E5%87%BD%E6%95%B0-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '要搜索的值，如果省略，XLOOKUP 将返回在 lookup_array 中找到的空白单元格。',
            },
            lookupArray: { name: '搜索区域', detail: '要搜索的数组或区域' },
            returnArray: { name: '返回区域', detail: '要返回的数组或区域' },
            ifNotFound: {
                name: '[默认显示值]',
                detail: '如果未找到有效的匹配项，则返回你提供的 [if_not_found] 文本，否则返回#N/A ',
            },
            matchMode: {
                name: '[匹配类型]',
                detail: '指定匹配类型： 0 - 完全匹配。 如果未找到，则返回 #N/A。默认选项。-1 - 完全匹配。 如果没有找到，则返回下一个较小的项。1 - 完全匹配。 如果没有找到，则返回下一个较大的项。 2 - 通配符匹配，其中 *, ? 和 ~ 有特殊含义。',
            },
            searchMode: {
                name: '[搜索模式]',
                detail: '指定要使用的搜索模式：1 从第一项开始执行搜索，默认选项。-1 从最后一项开始执行反向搜索。2 执行依赖于 lookup_array 按升序排序的二进制搜索, -2执行依赖于 lookup_array 按降序排序的二进制搜索',
            },
        },
    },
    XMATCH: {
        description: '在数组或单元格区域中搜索指定项，然后返回项的相对位置。',
        abstract: '返回项目在数组或单元格区域中的相对位置。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/xmatch-%E5%87%BD%E6%95%B0-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            lookupValue: { name: '查找值', detail: '查找值' },
            lookupArray: { name: '搜索区域', detail: '要搜索的数组或区域' },
            matchMode: { name: '匹配类型', detail: '指定匹配类型：\n0 - 完全匹配（默认值）\n-1 - 完全匹配或下一个最小项\n1 - 完全匹配或下一个最大项\n2 - 通配符匹配，其中 *, ? 和 ~ 有特殊含义。' },
            searchMode: { name: '搜索类型', detail: '指定搜索类型：\n1 - 搜索从第一到最后一个（默认值）\n-1 - 搜索从最后到第一个（反向搜索）。\n2 - 执行依赖于 lookup_array 按升序排序的二进制搜索。 如果未排序，将返回无效结果。\n2 - 执行依赖于 lookup_array 按降序排序的二进制搜索。 如果未排序，将返回无效结果。' },
        },
    },
};
