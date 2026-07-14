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

const locale = {
    ADDRESS: {
        description: 'Obtain the address of a cell in a worksheet, given specified row and column numbers. For example, ADDRESS(2,3) returns $C$2. As another example, ADDRESS(77,300) returns $KN$77. You can use other functions, such as the ROW and COLUMN functions, to provide the row and column number arguments for the ADDRESS function.',
        abstract: 'Returns a reference as text to a single cell in a worksheet',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: {
                name: 'row number',
                detail: 'A numeric value that specifies the row number to use in the cell reference.',
            },
            column_num: {
                name: 'column number',
                detail: 'A numeric value that specifies the column number to use in the cell reference.',
            },
            abs_num: {
                name: 'type of reference',
                detail: 'A numeric value that specifies the type of reference to return.',
            },
            a1: {
                name: 'style of reference',
                detail: 'A logical value that specifies the A1 or R1C1 reference style. In A1 style, columns are labeled alphabetically, and rows are labeled numerically. In R1C1 reference style, both columns and rows are labeled numerically. If the A1 argument is TRUE or omitted, the ADDRESS function returns an A1-style reference; if FALSE, the ADDRESS function returns an R1C1-style reference.',
            },
            sheet_text: {
                name: 'worksheet name',
                detail: 'A text value that specifies the name of the worksheet to be used as the external reference. For example, the formula =ADDRESS(1,1,,,"Sheet2") returns Sheet2!$A$1. If the sheet_text argument is omitted, no sheet name is used, and the address returned by the function refers to a cell on the current sheet.',
            },
        },
    },
    AREAS: {
        description: 'Returns the number of areas in a reference',
        abstract: 'Returns the number of areas in a reference',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'A reference to a cell or range of cells and can refer to multiple areas.' },
        },
    },
    CHOOSE: {
        description: 'Chooses a value from a list of values.',
        abstract: 'Chooses a value from a list of values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: 'Specifies which value argument is selected. Index_num must be a number between 1 and 254, or a formula or reference to a cell containing a number between 1 and 254.\nIf index_num is 1, CHOOSE returns value1; if it is 2, CHOOSE returns value2; and so on.\nIf index_num is less than 1 or greater than the number of the last value in the list, CHOOSE returns the #VALUE! error value.\nIf index_num is a fraction, it is truncated to the lowest integer before being used.' },
            value1: { name: 'value1', detail: 'CHOOSE selects a value or an action to perform based on index_num. The arguments can be numbers, cell references, defined names, formulas, functions, or text.' },
            value2: { name: 'value2', detail: '1 to 254 value arguments.' },
        },
    },
    CHOOSECOLS: {
        description: 'Returns the specified columns from an array',
        abstract: 'Returns the specified columns from an array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array containing the columns to be returned in the new array.' },
            colNum1: { name: 'col_num1', detail: 'The first column to be returned.' },
            colNum2: { name: 'col_num2', detail: 'Additional columns to be returned.' },
        },
    },
    CHOOSEROWS: {
        description: 'Returns the specified rows from an array',
        abstract: 'Returns the specified rows from an array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array containing the rows to be returned in the new array.' },
            rowNum1: { name: 'row_num1', detail: 'The first row number to be returned.' },
            rowNum2: { name: 'row_num2', detail: 'Additional row numbers to be returned.' },
        },
    },
    COLUMN: {
        description: 'Returns the column number of the given cell reference.',
        abstract: 'Returns the column number of a reference',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'The cell or range of cells for which you want to return the column number.' },
        },
    },
    COLUMNS: {
        description: 'Returns the number of columns in an array or reference.',
        abstract: 'Returns the number of columns in a reference',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'An array or array formula, or a reference to a range of cells for which you want the number of columns.' },
        },
    },
    DROP: {
        description: 'Excludes a specified number of rows or columns from the start or end of an array',
        abstract: 'Excludes a specified number of rows or columns from the start or end of an array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array from which to drop rows or columns.' },
            rows: { name: 'rows', detail: 'The number of rows to drop. A negative value drops from the end of the array.' },
            columns: { name: 'columns', detail: 'The number of columns to exclude. A negative value drops from the end of the array.' },
        },
    },
    EXPAND: {
        description: 'Expands or pads an array to specified row and column dimensions',
        abstract: 'Expands or pads an array to specified row and column dimensions',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array to expand.' },
            rows: { name: 'rows', detail: 'The number of rows in the expanded array. If missing, rows will not be expanded.' },
            columns: { name: 'columns', detail: 'The number of columns in the expanded array. If missing, columns will not be expanded.' },
            padWith: { name: 'pad_with', detail: 'The value with which to pad. The default is #N/A.' },
        },
    },
    FILTER: {
        description: 'The FILTER function allows you to filter a range of data based on criteria you define.',
        abstract: 'The FILTER function allows you to filter a range of data based on criteria you define.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The range or array to filter.' },
            include: { name: 'include', detail: 'An array of Boolean values ​​where TRUE indicates that a row or column is to be retained.' },
            ifEmpty: { name: 'if_empty', detail: 'If no items are reserved, return.' },
        },
    },
    FORMULATEXT: {
        description: 'Returns the formula at the given reference as text',
        abstract: 'Returns the formula at the given reference as text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'A reference to a cell or range of cells.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Returns data stored in a PivotTable report',
        abstract: 'Returns data stored in a PivotTable report',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: 'The name of the PivotTable field that contains the data that you want to retrieve. This needs to be in quotes. Example: =GETPIVOTDATA("Sales", A3). Here, "Sales" is the Values field that we want to retrieve. Since no other field is specified, GETPIVOTDATA returns the total sales amount.' },
            pivotTable: { name: 'pivotTable', detail: 'A reference to any cell, range of cells, or named range of cells in a PivotTable. This information is used to determine which PivotTable contains the data that you want to retrieve. Example: =GETPIVOTDATA("Sales", A3). Here, A3 is a reference inside the PivotTable and tells the formula which PivotTable to use.' },
            field1: { name: 'field1', detail: '1 to 126 pairs of field names and item names that describe the data that you want to retrieve. The pairs can be in any order. Field names and names for items other than dates and numbers need to be enclosed in quotation marks. Example: =GETPIVOTDATA("Sales", A3, "Month", "Mar"). Here, "Month" is the field and "Mar" is the item. To specify multiple items for a field, enclose them in curly braces (for example: {"Mar", "Apr"}). For OLAP PivotTables , items can contain the source name of the dimension and also the source name of the item. A field and item pair for an OLAP PivotTable might look like this: "[Product]","[Product].[All Products].[Foods].[Baked Goods]"' },
            item1: { name: 'item1', detail: '1 to 126 pairs of field names and item names that describe the data that you want to retrieve. The pairs can be in any order. Field names and names for items other than dates and numbers need to be enclosed in quotation marks. Example: =GETPIVOTDATA("Sales", A3, "Month", "Mar"). Here, "Month" is the field and "Mar" is the item. To specify multiple items for a field, enclose them in curly braces (for example: {"Mar", "Apr"}). For OLAP PivotTables , items can contain the source name of the dimension and also the source name of the item. A field and item pair for an OLAP PivotTable might look like this: "[Product]","[Product].[All Products].[Foods].[Baked Goods]"' },
        },
    },
    HLOOKUP: {
        description: 'Searches for a value in the top row of a table or an array of values, and then returns a value in the same column from a row you specify in the table or array. Use HLOOKUP when your comparison values are located in a row across the top of a table of data, and you want to look down a specified number of rows. Use VLOOKUP when your comparison values are located in a column to the left of the data you want to find.',
        abstract: 'Searches for a value in the top row of a table or an array of values, and then returns a value in the same column from a row you specify in the table or array. Use HLOOKUP when your comparison values are located in a row across the top of a table of data, and you want to look down a specified number of rows. Use VLOOKUP when your comparison values are located in a column to the left of the data you want to find.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Required. The value to be found in the first row of the table. Lookup_value can be a value, a reference, or a text string.' },
            tableArray: { name: 'table_array', detail: 'Required. A table of information in which data is looked up. Use a reference to a range or a range name. The values in the first row of table_array can be text, numbers, or logical values. If range_lookup is TRUE, the values in the first row of table_array must be placed in ascending order: ...-2, -1, 0, 1, 2,... , A-Z, FALSE, TRUE; otherwise, HLOOKUP may not give the correct value. If range_lookup is FALSE, table_array does not need to be sorted. Uppercase and lowercase text are equivalent. Sort the values in ascending order, left to right. For more information, see Sort data in a range or table .' },
            rowIndexNum: { name: 'row_index_num', detail: 'Required. The row number in table_array from which the matching value will be returned. A row_index_num of 1 returns the first row value in table_array, a row_index_num of 2 returns the second row value in table_array, and so on. If row_index_num is less than 1, HLOOKUP returns the #VALUE! error value; if row_index_num is greater than the number of rows on table_array, HLOOKUP returns the #REF! error value.' },
            rangeLookup: { name: 'range_lookup', detail: 'Optional. A logical value that specifies whether you want HLOOKUP to find an exact match or an approximate match. If TRUE or omitted, an approximate match is returned. In other words, if an exact match is not found, the next largest value that is less than lookup_value is returned. If FALSE, HLOOKUP will find an exact match. If one is not found, the error value #N/A is returned.' },
        },
    },
    HSTACK: {
        description: 'Appends arrays horizontally and in sequence to return a larger array',
        abstract: 'Appends arrays horizontally and in sequence to return a larger array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'The arrays to append.' },
            array2: { name: 'array', detail: 'The arrays to append.' },
        },
    },
    HYPERLINK: {
        description: 'Creates a hyperlink inside a cell.',
        abstract: 'Creates a hyperlink inside a cell.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3093313?hl=en',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'The full URL of the link location enclosed in quotation marks, or a reference to a cell containing such a URL. Only certain link types are allowed. http:// , https:// , mailto: , aim: , ftp:// , gopher:// , telnet:// , and news:// are permitted; others are explicitly forbidden. If another protocol is specified, link_label will be displayed in the cell, but will not be hyperlinked. If no protocol is specified, http:// is assumed, and is prepended to url .' },
            linkLabel: { name: 'link_label', detail: '[ OPTIONAL - url by default ] - The text to display in the cell as the link, enclosed in quotation marks, or a reference to a cell containing such a label. If link_label is a reference to an empty cell, url will be displayed as a link if valid, or as plain text otherwise. If link_label is the empty string literal (""), the cell will appear empty, but the link is still accessible by clicking or moving to the cell.' },
        },
    },
    IMAGE: {
        description: 'Current Channel',
        abstract: 'Current Channel',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: 'The URL path, using an "https" protocol, of the image file.' },
            altText: { name: 'alt_text', detail: 'Alternative text that describes the image for accessibility.' },
            sizing: { name: 'sizing', detail: 'Specifies the image dimensions.' },
            height: { name: 'height', detail: 'The custom height of the image in pixels.' },
            width: { name: 'width', detail: 'The custom width of the image in pixels.' },
        },
    },
    INDEX: {
        description: 'The INDEX function returns a value or the reference to a value from within a table or range.',
        abstract: 'The INDEX function returns a value or the reference to a value from within a table or range.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'A reference to one or more cell ranges.' },
            rowNum: { name: 'row_num', detail: 'The number of the row in reference from which to return a reference.' },
            columnNum: { name: 'column_num', detail: 'The number of the column in reference from which to return a reference.' },
            areaNum: { name: 'area_num', detail: 'Selects a range in reference from which to return the intersection of row_num and column_num.' },
        },
    },
    INDIRECT: {
        description: 'Returns the reference specified by a text string. References are immediately evaluated to display their contents.',
        abstract: 'Returns a reference indicated by a text value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'A reference to a cell that contains an A1-style reference, an R1C1-style reference, a name defined as a reference, or a reference to a cell as a text string. ' },
            a1: { name: 'a1', detail: 'A logical value that specifies what type of reference is contained in the cell ref_text.' },
        },
    },
    LOOKUP: {
        description: 'When you need to look in a single row or column and find a value from the same position in a second row or column',
        abstract: 'Looks up values in a vector or array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: 'A value that LOOKUP searches for in the first vector. Lookup_value can be a number, text, a logical value, or a name or reference that refers to a value.',
            },
            lookupVectorOrArray: {
                name: 'lookup_vectorOrArray',
                detail: 'A range that contains only one row or one column',
            },
            resultVector: {
                name: 'result_vector',
                detail: 'A range that contains only one row or column. The result_vector argument must be the same size as lookup_vector.',
            },
        },
    },
    MATCH: {
        description: 'The MATCH function searches for a specified item in a range of cells, and then returns the relative position of that item in the range.',
        abstract: 'Looks up values in a reference or array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'The value that you want to match in lookup_array.' },
            lookupArray: { name: 'lookup_array', detail: 'The range of cells being searched.' },
            matchType: { name: 'match_type', detail: 'The number -1, 0, or 1.' },
        },
    },
    OFFSET: {
        description: 'Returns a reference offset from a given reference',
        abstract: 'Returns a reference offset from a given reference',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'The reference from which you want to base the offset.' },
            rows: { name: 'rows', detail: 'The number of rows, up or down, that you want the upper-left cell to refer to.' },
            cols: { name: 'columns', detail: 'The number of columns, to the left or right, that you want the upper-left cell of the result to refer to.' },
            height: { name: 'height', detail: 'The height, in number of rows, that you want the returned reference to be. Height must be a positive number.' },
            width: { name: 'width', detail: 'The width, in number of columns, that you want the returned reference to be. Width must be a positive number.' },
        },
    },
    ROW: {
        description: 'Returns the row number of a reference',
        abstract: 'Returns the row number of a reference',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'The cell or range of cells for which you want the row number.' },
        },
    },
    ROWS: {
        description: 'Returns the number of rows in an array or reference.',
        abstract: 'Returns the number of rows in a reference',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'An array, an array formula, or a reference to a range of cells for which you want the number of rows.' },
        },
    },
    RTD: {
        description: 'Retrieves real-time data from a program that supports COM automation',
        abstract: 'Retrieves real-time data from a program that supports COM automation',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'Required. The name of the ProgID of a registered COM automation add-in that has been installed on the local computer. Enclose the name in quotation marks.' },
            server: { name: 'server', detail: 'Required. Name of the server where the add-in should be run. If there is no server, and the program is run locally, leave the argument blank. Otherwise, enter quotation marks ("") around the server name. When using RTD within Visual Basic for Applications (VBA), double quotation marks or the VBA NullString property are required for the server, even if the server is running locally.' },
            topic1: { name: 'topic1', detail: 'Topic1 is required, subsequent topics are optional. 1 to 253 parameters that together represent a unique piece of real-time data.' },
            topic2: { name: 'topic2', detail: 'Topic1 is required, subsequent topics are optional. 1 to 253 parameters that together represent a unique piece of real-time data.' },
        },
    },
    SORT: {
        description: 'Sorts the contents of a range or array',
        abstract: 'Sorts the contents of a range or array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The range or array to be sorted.' },
            sortIndex: { name: 'sort_index', detail: 'A number indicating the sort order (by row or by column).' },
            sortOrder: { name: 'sort_order', detail: 'A number representing the desired sort order; 1 for ascending (default), -1 for descending.' },
            byCol: { name: 'by_col', detail: 'Logical value indicating the desired sort direction; FALSE sorts by rows (default), TRUE sorts by columns.' },
        },
    },
    SORTBY: {
        description: 'Sorts the contents of a range or array based on the values in a corresponding range or array',
        abstract: 'Sorts the contents of a range or array based on the values in a corresponding range or array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The range or array to be sorted.' },
            byArray1: { name: 'by_array1', detail: 'The range or array to sort based on.' },
            sortOrder1: { name: 'sort_order1', detail: 'A number representing the desired sort order; 1 for ascending (default), -1 for descending.' },
            byArray2: { name: 'by_array2', detail: 'The range or array to sort based on.' },
            sortOrder2: { name: 'sort_order2', detail: 'A number representing the desired sort order; 1 for ascending (default), -1 for descending.' },
        },
    },
    TAKE: {
        description: 'Returns a specified number of contiguous rows or columns from the start or end of an array',
        abstract: 'Returns a specified number of contiguous rows or columns from the start or end of an array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array from which to take rows or columns.' },
            rows: { name: 'rows', detail: 'The number of rows to take. A negative value takes from the end of the array.' },
            columns: { name: 'columns', detail: 'The number of columns to take. A negative value takes from the end of the array.' },
        },
    },
    TOCOL: {
        description: 'Returns the array in a single column',
        abstract: 'Returns the array in a single column',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or reference to return as a column.' },
            ignore: { name: 'ignore', detail: 'Whether to ignore certain types of values. By default, no values are ignored. Specify one of the following:\n0 Keep all values (default)\n1 Ignore blanks\n2 Ignore errors\n3 Ignore blanks and errors' },
            scanByColumn: { name: 'scan_by_column', detail: 'Scan the array by column. By default, the array is scanned by row. Scanning determines whether the values are ordered by row or by column.' },
        },
    },
    TOROW: {
        description: 'Returns the array in a single row',
        abstract: 'Returns the array in a single row',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or reference to return as a row.' },
            ignore: { name: 'ignore', detail: 'Whether to ignore certain types of values. By default, no values are ignored. Specify one of the following:\n0 Keep all values (default)\n1 Ignore blanks\n2 Ignore errors\n3 Ignore blanks and errors' },
            scanByColumn: { name: 'scan_by_column', detail: 'Scan the array by column. By default, the array is scanned by row. Scanning determines whether the values are ordered by row or by column.' },
        },
    },
    TRANSPOSE: {
        description: 'Returns the transpose of an array',
        abstract: 'Returns the transpose of an array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A range of cells or an array in a worksheet.' },
        },
    },
    UNIQUE: {
        description: 'Returns a list of unique values in a list or range',
        abstract: 'Returns a list of unique values in a list or range',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The range or array from which unique rows or columns are returned.' },
            byCol: { name: 'by_col', detail: 'Is a logical value: compares rows to each other and returns unique values ​​= FALSE, or is omitted; compares columns to each other and returns unique values ​​= TRUE.' },
            exactlyOnce: { name: 'exactly_once', detail: 'Is a logical value: returns rows or columns from the array that appear only once = TRUE; returns all distinct rows or columns from the array = FALSE, or has been omitted.' },
        },
    },
    VLOOKUP: {
        description: 'Use VLOOKUP when you need to find things in a table or a range by row. For example, look up a price of an automotive part by the part number, or find an employee name based on their employee ID.',
        abstract: 'Looks in the first column of an array and moves across the row to return the value of a cell',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: 'The value you want to look up. The value you want to look up must be in the first column of the range of cells you specify in the table_array argument.',
            },
            tableArray: {
                name: 'table_array',
                detail: 'The range of cells in which the VLOOKUP will search for the lookup_value and the return value. You can use a named range or a table, and you can use names in the argument instead of cell references. ',
            },
            colIndexNum: {
                name: 'col_index_num',
                detail: 'The column number (starting with 1 for the left-most column of table_array) that contains the return value.',
            },
            rangeLookup: {
                name: 'range_lookup',
                detail: 'A logical value that specifies whether you want VLOOKUP to find an approximate or an exact match: Approximate match - 1/TRUE, Exact match - 0/FALSE',
            },
        },
    },
    VSTACK: {
        description: 'Appends arrays vertically and in sequence to return a larger array',
        abstract: 'Appends arrays vertically and in sequence to return a larger array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'The arrays to append.' },
            array2: { name: 'array', detail: 'The arrays to append.' },
        },
    },
    WRAPCOLS: {
        description: 'Wraps the provided row or column of values by columns after a specified number of elements',
        abstract: 'Wraps the provided row or column of values by columns after a specified number of elements',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'The vector or reference to wrap.' },
            wrapCount: { name: 'wrap_count', detail: 'The maximum number of values for each column.' },
            padWith: { name: 'pad_with', detail: 'The value with which to pad. The default is #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Wraps the provided row or column of values by rows after a specified number of elements',
        abstract: 'Wraps the provided row or column of values by rows after a specified number of elements',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'The vector or reference to wrap.' },
            wrapCount: { name: 'wrap_count', detail: 'The maximum number of values for each row.' },
            padWith: { name: 'pad_with', detail: 'The value with which to pad. The default is #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Searches a range or an array, and returns an item corresponding to the first match it finds. If a match doesn\'t exist, then XLOOKUP can return the closest (approximate) match. ',
        abstract: 'Searches a range or an array, and returns an item corresponding to the first match it finds. If a match doesn\'t exist, then XLOOKUP can return the closest (approximate) match. ',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: 'The value to search for, If omitted, XLOOKUP returns blank cells it finds in lookup_array. ',
            },
            lookupArray: { name: 'lookup_array', detail: 'The array or range to search' },
            returnArray: { name: 'return_array', detail: 'The array or range to return' },
            ifNotFound: {
                name: 'if_not_found',
                detail: 'Where a valid match is not found, return the [if_not_found] text you supply. If a valid match is not found, and [if_not_found] is missing, #N/A is returned.',
            },
            matchMode: {
                name: 'match_mode',
                detail: 'Specify the match type: 0 - Exact match. If none found, return #N/A. This is the default. -1 - Exact match. If none found, return the next smaller item. 1 - Exact match. If none found, return the next larger item. 2 - A wildcard match where *, ?, and ~ have special meaning.',
            },
            searchMode: {
                name: 'search_mode',
                detail: 'Specify the search mode to use: 1 - Perform a search starting at the first item. This is the default. -1 - Perform a reverse search starting at the last item. 2 - Perform a binary search that relies on lookup_array being sorted in ascending order. If not sorted, invalid results will be returned. -2 - Perform a binary search that relies on lookup_array being sorted in descending order. If not sorted, invalid results will be returned.',
            },
        },
    },
    XMATCH: {
        description: 'Searches for a specified item in an array or range of cells, and then returns the item\'s relative position.',
        abstract: 'Returns the relative position of an item in an array or range of cells.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'The lookup value' },
            lookupArray: { name: 'lookup_array', detail: 'The array or range to search' },
            matchMode: { name: 'match_mode', detail: 'Specify the match type:\n0 - Exact match (default)\n-1 - Exact match or next smallest item\n1 - Exact match or next largest item\n2 - A wildcard match where *, ?, and ~ have special meaning.' },
            searchMode: { name: 'search_mode', detail: 'Specify the search type:\n1 - Search first-to-last (default)\n-1 - Search last-to-first (reverse search).\n2 - Perform a binary search that relies on lookup_array being sorted in ascending order. If not sorted, invalid results will be returned.\n-2 - Perform a binary search that relies on lookup_array being sorted in descending order. If not sorted, invalid results will be returned.' },
        },
    },
};

export default locale;
