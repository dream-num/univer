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
    DAVERAGE: {
        description: 'Averages the values in a field (column) of records in a list or database that match conditions you specify.',
        abstract: 'Averages the values in a field (column) of records in a list or database that match conditions you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'is the range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'is the range of cells that contains the conditions you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DCOUNT: {
        description: 'Counts the cells that contain numbers in a field (column) of records in a list or database that match conditions that you specify.',
        abstract: 'Counts the cells that contain numbers in a field (column) of records in a list or database that match conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as the argument includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DCOUNTA: {
        description: 'Counts the nonblank cells in a field (column) of records in a list or database that match conditions that you specify.',
        abstract: 'Counts the nonblank cells in a field (column) of records in a list or database that match conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Optional. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DGET: {
        description: 'Extracts a single value from a column of a list or database that matches conditions that you specify.',
        abstract: 'Extracts a single value from a column of a list or database that matches conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DMAX: {
        description: 'Returns the largest number in a field (column) of records in a list or database that matches conditions you that specify.',
        abstract: 'Returns the largest number in a field (column) of records in a list or database that matches conditions you that specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DMIN: {
        description: 'Returns the smallest number in a field (column) of records in a list or database that matches conditions that you specify.',
        abstract: 'Returns the smallest number in a field (column) of records in a list or database that matches conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DPRODUCT: {
        description: 'Multiplies the values in a field (column) of records in a list or database that match conditions that you specify.',
        abstract: 'Multiplies the values in a field (column) of records in a list or database that match conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DSTDEV: {
        description: 'Estimates the standard deviation of a population based on a sample by using the numbers in a field (column) of records in a list or database that match conditions that you specify.',
        abstract: 'Estimates the standard deviation of a population based on a sample by using the numbers in a field (column) of records in a list or database that match conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DSTDEVP: {
        description: 'Calculates the standard deviation of a population based on the entire population by using the numbers in a field (column) of records in a list or database that match conditions that you specify.',
        abstract: 'Calculates the standard deviation of a population based on the entire population by using the numbers in a field (column) of records in a list or database that match conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DSUM: {
        description: 'In a list or database, DSUM provides the sum of the numbers in fields (columns) of records that match your specified conditions.',
        abstract: 'In a list or database, DSUM provides the sum of the numbers in fields (columns) of records that match your specified conditions.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. This is the range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records , and columns of data are fields . The first row of a list contains labels for each column therein.' },
            field: { name: 'field', detail: 'Required. This specifies which column is used in the function. Specify the column label enclosed between double quotation marks, such as "Age" or "Yield," for example. Alternatively, you can specify a number (without quotation marks) that represents the position of the column within the list: e.g., 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. This is the range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DVAR: {
        description: 'Estimates the variance of a population based on a sample by using the numbers in a field (column) of records in a list or database that match conditions that you specify.',
        abstract: 'Estimates the variance of a population based on a sample by using the numbers in a field (column) of records in a list or database that match conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
    DVARP: {
        description: 'Calculates the variance of a population based on the entire population by using the numbers in a field (column) of records in a list or database that match conditions that you specify.',
        abstract: 'Calculates the variance of a population based on the entire population by using the numbers in a field (column) of records in a list or database that match conditions that you specify.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Required. The range of cells that makes up the list or database. A database is a list of related data in which rows of related information are records, and columns of data are fields. The first row of the list contains labels for each column.' },
            field: { name: 'field', detail: 'Required. Indicates which column is used in the function. Enter the column label enclosed between double quotation marks, such as "Age" or "Yield," or a number (without quotation marks) that represents the position of the column within the list: 1 for the first column, 2 for the second column, and so on.' },
            criteria: { name: 'criteria', detail: 'Required. The range of cells that contains the conditions that you specify. You can use any range for the criteria argument, as long as it includes at least one column label and at least one cell below the column label in which you specify a condition for the column.' },
        },
    },
};

export default locale;
