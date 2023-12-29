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
        description: `Obtain the address of a cell in a worksheet, given specified row and column numbers. For example, ADDRESS(2,3) returns $C$2. As another example, ADDRESS(77,300) returns $KN$77. You can use other functions, such as the ROW and COLUMN functions, to provide the row and column number arguments for the ADDRESS function.

        `,
        abstract: `Returns a reference as text to a single cell in a worksheet`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/address-function-d0c26c0d-3991-446b-8de4-ab46431d4f89',
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
        description: `Returns the number of areas in a reference`,
        abstract: `Returns the number of areas in a reference`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/areas-function-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSE: {
        description: `Chooses a value from a list of values`,
        abstract: `Chooses a value from a list of values`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/choose-function-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSECOLS: {
        description: `Returns the specified columns from an array`,
        abstract: `Returns the specified columns from an array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/choosecols-function-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSEROWS: {
        description: `Returns the specified rows from an array`,
        abstract: `Returns the specified rows from an array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/chooserows-function-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COLUMN: {
        description: `Returns the column number of a reference`,
        abstract: `Returns the column number of a reference`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/column-function-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COLUMNS: {
        description: `Returns the number of columns in a reference`,
        abstract: `Returns the number of columns in a reference`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/columns-function-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DROP: {
        description: `Excludes a specified number of rows or columns from the start or end of an array`,
        abstract: `Excludes a specified number of rows or columns from the start or end of an array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/drop-function-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXPAND: {
        description: `Expands or pads an array to specified row and column dimensions`,
        abstract: `Expands or pads an array to specified row and column dimensions`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/expand-function-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FILTER: {
        description: `Filters a range of data based on criteria you define`,
        abstract: `Filters a range of data based on criteria you define`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/filter-function-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORMULATEXT: {
        description: `Returns the formula at the given reference as text`,
        abstract: `Returns the formula at the given reference as text`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/formulatext-function-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GETPIVOTDATA: {
        description: `Returns data stored in a PivotTable report`,
        abstract: `Returns data stored in a PivotTable report`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/getpivotdata-function-8c083b99-a922-4ca0-af5e-3af55960761f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HLOOKUP: {
        description: `Looks in the top row of an array and returns the value of the indicated cell`,
        abstract: `Looks in the top row of an array and returns the value of the indicated cell`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/hlookup-function-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HSTACK: {
        description: `Appends arrays horizontally and&nbsp;in sequence to return a larger array`,
        abstract: `Appends arrays horizontally and&nbsp;in sequence to return a larger array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/hstack-function-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HYPERLINK: {
        description: `Creates a shortcut or jump that opens a document stored on a network server, an intranet, or the Internet`,
        abstract: `Creates a shortcut or jump that opens a document stored on a network server, an intranet, or the Internet`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/hyperlink-function-333c7ce6-c5ae-4164-9c47-7de9b76f577f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMAGE: {
        description: `Returns an image from a given source`,
        abstract: `Returns an image from a given source`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/image-function-7e112975-5e52-4f2a-b9da-1d913d51f5d5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INDEX: {
        description: `Uses an index to choose a value from a reference or array`,
        abstract: `Uses an index to choose a value from a reference or array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/index-function-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INDIRECT: {
        description: `Returns a reference indicated by a text value`,
        abstract: `Returns a reference indicated by a text value`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/indirect-function-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOOKUP: {
        description: `Looks up values in a vector or array`,
        abstract: `Looks up values in a vector or array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/lookup-function-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MATCH: {
        description: `Looks up values in a reference or array`,
        abstract: `Looks up values in a reference or array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/match-function-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    OFFSET: {
        description: `Returns a reference offset from a given reference`,
        abstract: `Returns a reference offset from a given reference`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/offset-function-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ROW: {
        description: `Returns the row number of a reference`,
        abstract: `Returns the row number of a reference`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/row-function-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ROWS: {
        description: `Returns the number of rows in a reference`,
        abstract: `Returns the number of rows in a reference`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/rows-function-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RTD: {
        description: `Retrieves real-time data from a program that supports COM automation`,
        abstract: `Retrieves real-time data from a program that supports COM automation`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/rtd-function-e0cc001a-56f0-470a-9b19-9455dc0eb593',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORT: {
        description: `Sorts the contents of a range or array`,
        abstract: `Sorts the contents of a range or array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/sort-function-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORTBY: {
        description: `Sorts the contents of a range or array based on the values in a corresponding range or array`,
        abstract: `Sorts the contents of a range or array based on the values in a corresponding range or array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/sortby-function-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TAKE: {
        description: `Returns a specified number of contiguous rows or columns from the start or end of an array`,
        abstract: `Returns a specified number of contiguous rows or columns from the start or end of an array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/take-function-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TOCOL: {
        description: `Returns the array in a single column`,
        abstract: `Returns the array in a single column`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/tocol-function-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TOROW: {
        description: `Returns the array in a single row`,
        abstract: `Returns the array in a single row`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/torow-function-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TRANSPOSE: {
        description: `Returns the transpose of an array`,
        abstract: `Returns the transpose of an array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/transpose-function-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UNIQUE: {
        description: `Returns a list of unique values in a list or range`,
        abstract: `Returns a list of unique values in a list or range`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/unique-function-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VLOOKUP: {
        description: `Use VLOOKUP when you need to find things in a table or a range by row. For example, look up a price of an automotive part by the part number, or find an employee name based on their employee ID.`,
        abstract: `Looks in the first column of an array and moves across the row to return the value of a cell`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
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
        description: `Appends&nbsp;arrays vertically and in sequence to return a larger array`,
        abstract: `Appends&nbsp;arrays vertically and in sequence to return a larger array`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/vstack-function-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WRAPCOLS: {
        description: `Wraps the provided row or column of values by columns after a specified number of elements`,
        abstract: `Wraps the provided row or column of values by columns after a specified number of elements`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/wrapcols-function-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WRAPROWS: {
        description: `Wraps the provided row or column of values by rows after a specified number of elements`,
        abstract: `Wraps the provided row or column of values by rows after a specified number of elements`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/wraprows-function-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XLOOKUP: {
        description: `Searches a range or an array, and returns&nbsp;an item&nbsp;corresponding&nbsp;to the&nbsp;first match it finds. If a match doesn't exist,&nbsp;then XLOOKUP can return the&nbsp;closest (approximate) match.&nbsp;`,
        abstract: `Searches a range or an array, and returns&nbsp;an item&nbsp;corresponding&nbsp;to the&nbsp;first match it finds. If a match doesn't exist,&nbsp;then XLOOKUP can return the&nbsp;closest (approximate) match.&nbsp;`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XMATCH: {
        description: `Returns the&nbsp;relative&nbsp;position of an item in an array or range of cells.&nbsp;`,
        abstract: `Returns the&nbsp;relative&nbsp;position of an item in an array or range of cells.&nbsp;`,
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/xmatch-function-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
