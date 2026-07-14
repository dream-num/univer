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
    ADDRESS: {
        description: '根据指定行号和列号获得工作表中的某个单元格的地址。 例如，ADDRESS(2,3) 返回 $C$2。 再例如，ADDRESS(77,300) 返回 $KN$77。 可以使用其他函数（如 ROW 和 COLUMN 函数）为 ADDRESS 函数提供行号和列号参数。',
        abstract: '以文本形式将引用值返回到工作表的单个单元格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/address-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/areas-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/choose-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/choosecols-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/chooserows-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/column-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/columns-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/drop-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/expand-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/filter-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '对单元格或单元格区域的引用。' },
        },
    },
    GETPIVOTDATA: {
        description: 'GETPIVOTDATA 函数返回数据透视表中的可见数据。',
        abstract: 'GETPIVOTDATA 函数返回数据透视表中的可见数据。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: '包含要检索的数据的数据透视表字段的名称。 这需要用引号括起。 示例： =GETPIVOTDATA (“Sales”，A3) 。 此处，“Sales”是要检索的“值”字段。 由于未指定其他字段，因此 GETPIVOTDATA 返回总销售额。' },
            pivotTable: { name: 'pivotTable', detail: '对数据透视表中任何单元格、单元格区域或单元格已命名区域的引用。 此信息用于确定包含要检索数据的数据透视表。 示例： =GETPIVOTDATA (“Sales”，A3) 。 此处，A3 是数据透视表中的引用，它告知公式要使用哪个数据透视表。' },
            field1: { name: 'field1', detail: '描述要检索的数据的 1 到 126 个字段名称对和项目名称对。 这些对可按任何顺序排列。 除日期和数字以外的项的字段名称和名称需要用引号引起来。 示例： =GETPIVOTDATA (“Sales”、A3、“Month”、“Mar”) 。 此处，“Month”是字段，“Mar”是项。 若要为字段指定多个项，请将它们括在大括号 (例如：{“Mar”、“Apr”}) 。 对于 OLAP 数据透视表 ，项可以包含维度的源名称和项的源名称。 OLAP 数据透视表的字段和项目对可能类似于： "[产品]","[产品].[所有产品].[食品].[烤制食品]"' },
            item1: { name: 'item1', detail: '描述要检索的数据的 1 到 126 个字段名称对和项目名称对。 这些对可按任何顺序排列。 除日期和数字以外的项的字段名称和名称需要用引号引起来。 示例： =GETPIVOTDATA (“Sales”、A3、“Month”、“Mar”) 。 此处，“Month”是字段，“Mar”是项。 若要为字段指定多个项，请将它们括在大括号 (例如：{“Mar”、“Apr”}) 。 对于 OLAP 数据透视表 ，项可以包含维度的源名称和项的源名称。 OLAP 数据透视表的字段和项目对可能类似于： "[产品]","[产品].[所有产品].[食品].[烤制食品]"' },
        },
    },
    HLOOKUP: {
        description: '在表格的首行或值数组中搜索值，然后返回表格或数组中指定行的所在列中的值。 当比较值位于数据表格的首行时，如果要向下查看指定的行数，则可使用 HLOOKUP。 当比较值位于所需查找的数据的左边一列时，则可使用 VLOOKUP。',
        abstract: '在表格的首行或值数组中搜索值，然后返回表格或数组中指定行的所在列中的值。 当比较值位于数据表格的首行时，如果要向下查看指定的行数，则可使用 HLOOKUP。 当比较值位于所需查找的数据的左边一列时，则可使用 VLOOKUP。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: '查找值', detail: '必填。 要在表格的第一行中查找的值。 Lookup_value 可以是数值、引用或文本字符串。' },
            tableArray: { name: '范围', detail: '必填。 在其中查找数据的信息表。 使用对区域或区域名称的引用。 Table_array 的第一行的数值可以为文本、数字或逻辑值。 如果 range_lookup 为 TRUE，则 table_array 的第一行的数值必须按升序排列：...-2、-1、0、1、2、...、A-Z、FALSE、TRUE；否则，HLOOKUP 将不能给出正确的数值。 如果 range_lookup 为 FALSE，则 table_array 不必进行排序。 文本不区分大小写。 将数值从左到右按升序排序。 有关详细信息，请参阅 对区域或表中的数据排序 。' },
            rowIndexNum: { name: '行号', detail: '必填。 将从中返回匹配值的table_array中的行号。 row_index_num 1 返回table_array中的第一行值，row_index_num 2 返回table_array中的第二行值，依此以类。 如果row_index_num小于 1，HLOOKUP 将返回 #VALUE！ error 值;如果row_index_num大于table_array上的行数，HLOOKUP 将返回 #REF！ 错误值。' },
            rangeLookup: { name: '查询类型', detail: '选。 一个逻辑值，指定希望 HLOOKUP 查找精确匹配值还是近似匹配值。 如果为 TRUE 或省略，则返回近似匹配值。 换言之，如果找不到精确匹配值，则返回小于 lookup_value 的最大值。 如果为 False，则 HLOOKUP 将查找精确匹配值。 如果找不到精确匹配值，则返回错误值 #N/A。' },
        },
    },
    HSTACK: {
        description: '按顺序水平追加数组，以返回更大的数组。',
        abstract: '按顺序水平追加数组，以返回更大的数组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: '数组', detail: '每个数组参数的行计数最大值。' },
            array2: { name: '数组', detail: '每个数组参数中所有列的组合计数。' },
        },
    },
    HYPERLINK: {
        description: '在单元格内创建一个超链接。',
        abstract: '在单元格内创建一个超链接。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3093313?hl=zh-Hans',
            },
        ],
        functionParameter: {
            url: { name: '网址', detail: '以引号括住的链接位置的完整网址，或对包含这种网址的单元格的引用。' },
            linkLabel: { name: '链接标签', detail: '要在单元格中作为链接显示的文本（用引号括起来的），或者指向包含这种标签的单元格的引用。' },
        },
    },
    IMAGE: {
        description: '从给定源返回图像',
        abstract: '从给定源返回图像',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: '图像源', detail: '图像文件的 URL 路径（使用“https”协议）。' },
            altText: { name: '描述文字', detail: '描述图像以提供辅助功能的可选文字。' },
            sizing: { name: '维度', detail: '指定图像维度。' },
            height: { name: '高度', detail: '图像的自定义高度（以像素为单位）。' },
            width: { name: '宽度', detail: '图像的自定义宽度（以像素为单位）。' },
        },
    },
    INDEX: {
        description: '返回指定的行与列交叉处的单元格引用。 如果引用由不连续的选定区域组成，可以选择某一选定区域。',
        abstract: '使用索引从引用或数组中选择值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/index-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/indirect-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/lookup-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/match-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/offset-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/row-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/rows-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: '程序标识符', detail: '本地安装的 COM 自动化加载项的程序标识符。' },
            server: { name: '服务器', detail: '运行加载项的服务器名称；本地服务器使用空字符串。' },
            topic1: { name: '主题 1', detail: '指定要检索的实时数据的第一个文本。' },
            topic2: { name: '主题 2', detail: '可选。指定实时数据的其他文本。' },
        },
    },
    SORT: {
        description: '对区域或数组的内容进行排序',
        abstract: '对区域或数组的内容进行排序',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sort-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sortby-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/take-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/tocol-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/torow-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/transpose-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/unique-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/vlookup-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/vstack-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/wrapcols-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/wraprows-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/xlookup-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/xmatch-function',
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

export default locale;
