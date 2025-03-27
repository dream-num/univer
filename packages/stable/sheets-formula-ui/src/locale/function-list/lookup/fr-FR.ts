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
        description: `Obtain the address of a cell in a worksheet, given specified row and column numbers. For example, ADDRESS(2,3) returns $C$2. As another example, ADDRESS(77,300) returns $KN$77. You can use other functions, such as the ROW and COLUMN functions, to provide the row and column number arguments for the ADDRESS function.

        `,
        abstract: 'Returns a reference as text to a single cell in a worksheet',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/address-function-d0c26c0d-3991-446b-8de4-ab46431d4f89',
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
                url: 'https://support.microsoft.com/fr-fr/office/areas-function-8392ba32-7a41-43b3-96b0-3695d2ec6152',
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
                url: 'https://support.microsoft.com/fr-fr/office/choose-function-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
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
                url: 'https://support.microsoft.com/fr-fr/office/choosecols-function-bf117976-2722-4466-9b9a-1c01ed9aebff',
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
                url: 'https://support.microsoft.com/fr-fr/office/chooserows-function-51ace882-9bab-4a44-9625-7274ef7507a3',
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
                url: 'https://support.microsoft.com/fr-fr/office/column-function-44e8c754-711c-4df3-9da4-47a55042554b',
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
                url: 'https://support.microsoft.com/fr-fr/office/columns-function-4e8e7b4e-e603-43e8-b177-956088fa48ca',
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
                url: 'https://support.microsoft.com/fr-fr/office/drop-function-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
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
                url: 'https://support.microsoft.com/fr-fr/office/expand-function-7433fba5-4ad1-41da-a904-d5d95808bc38',
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
        description: 'Filters a range of data based on criteria you define',
        abstract: 'Filters a range of data based on criteria you define',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/filter-function-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
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
                url: 'https://support.microsoft.com/fr-fr/office/formulatext-function-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GETPIVOTDATA: {
        description: 'Returns data stored in a PivotTable report',
        abstract: 'Returns data stored in a PivotTable report',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/getpivotdata-function-8c083b99-a922-4ca0-af5e-3af55960761f',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    HLOOKUP: {
        description: 'Looks in the top row of an array and returns the value of the indicated cell',
        abstract: 'Looks in the top row of an array and returns the value of the indicated cell',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/hlookup-function-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: 'The value to be found in the first row of the table. Lookup_value can be a value, a reference, or a text string.',
            },
            tableArray: {
                name: 'table_array',
                detail: 'A table of information in which data is looked up. Use a reference to a range or a range name.',
            },
            rowIndexNum: {
                name: 'row_index_num',
                detail: 'The row number in table_array from which the matching value will be returned. A row_index_num of 1 returns the first row value in table_array, a row_index_num of 2 returns the second row value in table_array, and so on. ',
            },
            rangeLookup: {
                name: 'range_lookup',
                detail: 'A logical value that specifies whether you want HLOOKUP to find an exact match or an approximate match.',
            },
        },
    },
    HSTACK: {
        description: 'Appends arrays horizontally and&nbsp;in sequence to return a larger array',
        abstract: 'Appends arrays horizontally and&nbsp;in sequence to return a larger array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/hstack-function-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'The arrays to append.' },
            array2: { name: 'array', detail: 'The arrays to append.' },
        },
    },
    HYPERLINK: {
        description: 'Creates a shortcut or jump that opens a document stored on a network server, an intranet, or the Internet',
        abstract: 'Creates a shortcut or jump that opens a document stored on a network server, an intranet, or the Internet',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/hyperlink-function-333c7ce6-c5ae-4164-9c47-7de9b76f577f',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    IMAGE: {
        description: 'Returns an image from a given source',
        abstract: 'Returns an image from a given source',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/image-function-7e112975-5e52-4f2a-b9da-1d913d51f5d5',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    INDEX: {
        description: 'Returns the reference of the cell at the intersection of a particular row and column. If the reference is made up of non-adjacent selections, you can pick the selection to look in.',
        abstract: 'Uses an index to choose a value from a reference or array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/index-function-a5dcf0dd-996d-40a4-a822-b56b061328bd',
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
                url: 'https://support.microsoft.com/fr-fr/office/indirect-function-474b3a3a-8a26-4f44-b491-92b6306fa261',
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
                url: 'https://support.microsoft.com/fr-fr/office/lookup-function-446d94af-663b-451d-8251-369d5e3864cb',
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
                url: 'https://support.microsoft.com/fr-fr/office/match-function-e8dffd45-c762-47d6-bf89-533f4a37673a',
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
                url: 'https://support.microsoft.com/fr-fr/office/offset-function-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
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
                url: 'https://support.microsoft.com/fr-fr/office/row-function-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
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
                url: 'https://support.microsoft.com/fr-fr/office/rows-function-b592593e-3fc2-47f2-bec1-bda493811597',
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
                url: 'https://support.microsoft.com/fr-fr/office/rtd-function-e0cc001a-56f0-470a-9b19-9455dc0eb593',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    SORT: {
        description: 'Sorts the contents of a range or array',
        abstract: 'Sorts the contents of a range or array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/sort-function-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
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
                url: 'https://support.microsoft.com/fr-fr/office/sortby-function-cd2d7a62-1b93-435c-b561-d6a35134f28f',
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
                url: 'https://support.microsoft.com/fr-fr/office/take-function-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
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
                url: 'https://support.microsoft.com/fr-fr/office/tocol-function-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
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
                url: 'https://support.microsoft.com/fr-fr/office/torow-function-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
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
                url: 'https://support.microsoft.com/fr-fr/office/transpose-function-ed039415-ed8a-4a81-93e9-4b6dfac76027',
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
                url: 'https://support.microsoft.com/fr-fr/office/unique-function-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
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
                url: 'https://support.microsoft.com/fr-fr/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
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
        description: 'Appends&nbsp;arrays vertically and in sequence to return a larger array',
        abstract: 'Appends&nbsp;arrays vertically and in sequence to return a larger array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/vstack-function-a4b86897-be0f-48fc-adca-fcc10d795a9c',
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
                url: 'https://support.microsoft.com/fr-fr/office/wrapcols-function-d038b05a-57b7-4ee0-be94-ded0792511e2',
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
                url: 'https://support.microsoft.com/fr-fr/office/wraprows-function-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'The vector or reference to wrap.' },
            wrapCount: { name: 'wrap_count', detail: 'The maximum number of values for each row.' },
            padWith: { name: 'pad_with', detail: 'The value with which to pad. The default is #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Searches a range or an array, and returns&nbsp;an item&nbsp;corresponding&nbsp;to the&nbsp;first match it finds. If a match doesn\'t exist,&nbsp;then XLOOKUP can return the&nbsp;closest (approximate) match.&nbsp;',
        abstract: 'Searches a range or an array, and returns&nbsp;an item&nbsp;corresponding&nbsp;to the&nbsp;first match it finds. If a match doesn\'t exist,&nbsp;then XLOOKUP can return the&nbsp;closest (approximate) match.&nbsp;',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
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
        abstract: 'Returns the&nbsp;relative&nbsp;position of an item in an array or range of cells.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/xmatch-function-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
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
