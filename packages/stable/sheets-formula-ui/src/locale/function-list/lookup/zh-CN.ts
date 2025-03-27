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
            reference: { name: '引用', detail: '对某个单元格或单元格区域的引用，可包含多个区域。' },
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
        description: '从数组的开头或末尾删除指定数量的行或列',
        abstract: '从数组的开头或末尾删除指定数量的行或列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/drop-%E5%87%BD%E6%95%B0-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '要从中删除行或列的数组。' },
            rows: { name: '行数', detail: '要删除的行数。负数表示从数组末尾开始删除。' },
            columns: { name: '列数', detail: '要删除的列数。负数表示从数组末尾开始删除。' },
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
            array: { name: '数组', detail: '要展开的数组。' },
            rows: { name: '行数', detail: '扩展数组中的行数。 如果缺少，行将不会展开。' },
            columns: { name: '列数', detail: '展开数组中的列数。 如果缺少，列将不会展开。' },
            padWith: { name: '填充值', detail: '要填充的值。 默认值为 #N/A。' },
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
            array: { name: '数组', detail: '要筛选的区域或数组。' },
            include: { name: '布尔值数组', detail: '布尔值数组，其中 TRUE 表示要保留的一行或一列。' },
            ifEmpty: { name: '空值返回', detail: '如果未保留任何项，则返回。' },
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
            reference: { name: '引用', detail: '对单元格或单元格区域的引用。' },
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
            array1: { name: '数组', detail: '要追加的数组。' },
            array2: { name: '数组', detail: '要追加的数组。' },
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
            reference: { name: '引用', detail: '对一个或多个单元格区域的引用。' },
            rowNum: { name: '行号', detail: '引用中某行的行号，函数从该行返回一个引用。' },
            columnNum: { name: '列号', detail: '引用中某列的列标，函数从该列返回一个引用。' },
            areaNum: { name: '区域编号', detail: '选择要返回行号和列号的交叉点的引用区域。' },
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
            refText: { name: '引用文本', detail: '对包含 A1 样式引用、R1C1 样式引用、定义为引用的名称或作为文本字符串引用的单元格的引用的引用。' },
            a1: { name: '引用类型', detail: '一个逻辑值，用于指定包含在单元格引用文本中的引用的类型。' },
        },
    },
    LOOKUP: {
        description: '当需要查询一行或一列并查找另一行或列中的相同位置的值时使用',
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
        description: '使用 MATCH 函数在 范围 单元格中搜索特定的项，然后返回该项在此区域中的相对位置。',
        abstract: '在引用或数组中查找值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/match-%E5%87%BD%E6%95%B0-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            lookupValue: { name: '查找值', detail: '要在 lookup_array 中匹配的值。' },
            lookupArray: { name: '搜索区域', detail: '要搜索的单元格区域。' },
            matchType: { name: '匹配类型', detail: '数字 -1、0 或 1。' },
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
            reference: { name: '引用', detail: '要基于偏移量的引用。' },
            rows: { name: '行数', detail: '需要左上角单元格引用的向上或向下行数。' },
            cols: { name: '列数', detail: '需要结果的左上角单元格引用的从左到右的列数。' },
            height: { name: '行高', detail: '需要返回的引用的行高。行高必须为正数。' },
            width: { name: '列宽', detail: '需要返回的引用的列宽。列宽必须为正数。' },
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
            array: { name: '数组', detail: '要排序的范围或数组。' },
            sortIndex: { name: '排序索引', detail: '表示排序依据(按行或按列)的数字。' },
            sortOrder: { name: '排序顺序', detail: '表示所需排序顺序的数字；1表示顺序(默认)，-1表示降序。' },
            byCol: { name: '排序方向', detail: '表示所需排序方向的逻辑值；FALSE指按行排序(默认)，TRUE指按列排序。' },
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
            array: { name: '数组', detail: '要排序的范围或数组。' },
            byArray1: { name: '排序数组1', detail: '要基于其进行排序的范围或数组。' },
            sortOrder1: { name: '排序顺序1', detail: '表示所需排序顺序的数字；1表示顺序(默认)，-1表示降序。' },
            byArray2: { name: '排序数组2', detail: '要基于其进行排序的范围或数组。' },
            sortOrder2: { name: '排序顺序2', detail: '表示所需排序顺序的数字；1表示顺序(默认)，-1表示降序。' },
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
            array: { name: '数组', detail: '要从中获取行或列的数组。' },
            rows: { name: '行数', detail: '要获取的行数。负数表示从数组末尾开始获取。' },
            columns: { name: '列数', detail: '要获取的列数。负数表示从数组末尾开始获取。' },
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
            array: { name: '数组', detail: '要作为列返回的数组或引用。' },
            ignore: { name: '忽略值', detail: '是否忽略某些类型的值。默认情况下，不会忽略任何值。 指定下列操作之一：\n0 保留所有值（默认）\n1 忽略空白\n2 忽略错误\n3 忽略空白和错误' },
            scanByColumn: { name: '按列扫描数组', detail: '按列扫描数组。 默认情况下，按行扫描数组。 扫描确定值是按行排序还是按列排序。' },
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
            array: { name: '数组', detail: '要作为行返回的数组或引用。' },
            ignore: { name: '忽略值', detail: '是否忽略某些类型的值。默认情况下，不会忽略任何值。 指定下列操作之一：\n0 保留所有值（默认）\n1 忽略空白\n2 忽略错误\n3 忽略空白和错误' },
            scanByColumn: { name: '按列扫描数组', detail: '按列扫描数组。 默认情况下，按行扫描数组。 扫描确定值是按行排序还是按列排序。' },
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
            array: { name: '数组', detail: '工作表中的单元格区域或数组。' },
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
            array: { name: '数组', detail: '从中返回唯一行或列的范围或数组。' },
            byCol: { name: '依据列', detail: '是一个逻辑值：将行彼此比较并返回唯一值 = FALSE，或已省略；将列彼此比较并返回唯一值 = TRUE。' },
            exactlyOnce: { name: '仅一次', detail: '是一个逻辑值：从数组中返回只出现一次的行或列 = TRUE；从数组中返回所有不同的行或列 = FALSE，或已省略。' },
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
                name: '列号',
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
            array1: { name: '数组', detail: '要追加的数组。' },
            array2: { name: '数组', detail: '要追加的数组。' },
        },
    },
    WRAPCOLS: {
        description: '将提供的行或列的值按列换行到指定数量的元素之后以形成新数组。',
        abstract: '将提供的行或列的值按列换行到指定数量的元素之后以形成新数组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/wrapcols-%E5%87%BD%E6%95%B0-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            vector: { name: '矢量', detail: '要换行的矢量或引用。' },
            wrapCount: { name: '换行数量', detail: '每列的值的最大数量。' },
            padWith: { name: '填充值', detail: '要填充的值。 默认值为 #N/A。' },
        },
    },
    WRAPROWS: {
        description: '将提供的行或列的值按行换行到指定数量的元素之后以形成新数组。',
        abstract: '将提供的行或列的值按行换行到指定数量的元素之后以形成新数组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/wraprows-%E5%87%BD%E6%95%B0-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            vector: { name: '矢量', detail: '要换行的矢量或引用。' },
            wrapCount: { name: '换行数量', detail: '每行的值的最大数量。' },
            padWith: { name: '填充值', detail: '要填充的值。 默认值为 #N/A。' },
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
                name: '默认显示值',
                detail: '如果未找到有效的匹配项，则返回你提供的 [if_not_found] 文本，否则返回#N/A ',
            },
            matchMode: {
                name: '匹配类型',
                detail: '指定匹配类型： 0 - 完全匹配。 如果未找到，则返回 #N/A。默认选项。-1 - 完全匹配。 如果没有找到，则返回下一个较小的项。1 - 完全匹配。 如果没有找到，则返回下一个较大的项。 2 - 通配符匹配，其中 *, ? 和 ~ 有特殊含义。',
            },
            searchMode: {
                name: '搜索模式',
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
