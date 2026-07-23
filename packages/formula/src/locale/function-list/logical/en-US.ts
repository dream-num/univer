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
    AND: {
        description: 'Returns TRUE if all of its arguments are TRUE',
        abstract: 'Returns TRUE if all of its arguments are TRUE',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'The first condition that you want to test that can evaluate to either TRUE or FALSE.' },
            logical2: { name: 'logical2', detail: 'Additional conditions that you want to test that can evaluate to either TRUE or FALSE, up to a maximum of 255 conditions.' },
        },
    },
    BYCOL: {
        description: 'Applies a LAMBDA to each column and returns an array of the results',
        abstract: 'Applies a LAMBDA to each column and returns an array of the results',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'An array to be separated by column.' },
            lambda: { name: 'lambda', detail: 'A LAMBDA that takes a column as a single parameter and calculates one result. The LAMBDA takes a single parameter: A column from array.' },
        },
    },
    BYROW: {
        description: 'Applies a LAMBDA to each row and returns an array of the results',
        abstract: 'Applies a LAMBDA to each row and returns an array of the results',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'An array to be separated by row.' },
            lambda: { name: 'lambda', detail: 'A LAMBDA that takes a row as a single parameter and calculates one result. The LAMBDA takes a single parameter: A row from array.' },
        },
    },
    FALSE: {
        description: 'Returns the logical value FALSE.',
        abstract: 'Returns the logical value FALSE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/false-function',
            },
        ],
        functionParameter: {},
    },
    IF: {
        description: 'Specifies a logical test to perform',
        abstract: 'Specifies a logical test to perform',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: 'The condition you want to test.' },
            valueIfTrue: {
                name: 'value_if_true',
                detail: 'The value that you want returned if the result of logical_test is TRUE.',
            },
            valueIfFalse: {
                name: 'value_if_false',
                detail: 'The value that you want returned if the result of logical_test is FALSE.',
            },
        },
    },
    IFERROR: {
        description: 'Returns a value you specify if a formula evaluates to an error; otherwise, returns the result of the formula',
        abstract: 'Returns a value you specify if a formula evaluates to an error; otherwise, returns the result of the formula',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'The argument that is checked for an error.' },
            valueIfError: { name: 'value_if_error', detail: 'The value to return if the formula evaluates to an error. The following error types are evaluated: #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME?, or #NULL!.' },
        },
    },
    IFNA: {
        description: 'Returns the value you specify if the expression resolves to #N/A, otherwise returns the result of the expression',
        abstract: 'Returns the value you specify if the expression resolves to #N/A, otherwise returns the result of the expression',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'The argument that is checked for the #N/A error value.' },
            valueIfNa: { name: 'value_if_na', detail: 'The value to return if the formula evaluates to the #N/A error value.' },
        },
    },
    IFS: {
        description: 'Checks whether one or more conditions are met and returns a value that corresponds to the first TRUE condition.',
        abstract: 'Checks whether one or more conditions are met and returns a value that corresponds to the first TRUE condition.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'Condition that evaluates to TRUE or FALSE.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'Result to be returned if logical_test1 evaluates to TRUE. Can be empty.' },
            logicalTest2: { name: 'logical_test2', detail: 'Condition that evaluates to TRUE or FALSE.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'Result to be returned if logical_testN evaluates to TRUE. Each value_if_trueN corresponds with a condition logical_testN. Can be empty.' },
        },
    },
    LAMBDA: {
        description: 'Use a LAMBDA function to create custom, reusable functions and call them by a friendly name. The new function is available throughout the workbook and called like native Excel functions.',
        abstract: 'Create custom, reusable functions and call them by a friendly name',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: {
                name: 'parameter',
                detail: 'A value that you want to pass to the function, such as a cell reference, string or number. You can enter up to 253 parameters. This argument is optional.',
            },
            calculation: {
                name: 'calculation',
                detail: 'The formula you want to execute and return as the result of the function. It must be the last argument and it must return a result. This argument is required.',
            },
        },
    },
    LET: {
        description: 'Assigns names to calculation results',
        abstract: 'Assigns names to calculation results',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: 'The first name to assign. Must start with a letter. Cannot be the output of a formula or conflict with range syntax.' },
            nameValue1: { name: 'name_value1', detail: 'The value that is assigned to name1.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'One of the following:\n1.A calculation that uses all names within the LET function. This must be the last argument in the LET function.\n2.A second name to assign to a second name_value. If a name is specified, name_value2 and calculation_or_name3 become required.' },
            nameValue2: { name: 'name_value2', detail: 'The value that is assigned to calculation_or_name2.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'One of the following:\n1.A calculation that uses all names within the LET function. The last argument in the LET function must be a calculation.\n2.A third name to assign to a third name_value. If a name is specified, name_value3 and calculation_or_name4 become required.' },
        },
    },
    MAKEARRAY: {
        description: 'Returns a calculated array of a specified row and column size, by applying a LAMBDA',
        abstract: 'Returns a calculated array of a specified row and column size, by applying a LAMBDA',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'The number of rows in the array. Must be greater than zero.' },
            number2: { name: 'cols', detail: 'The number of columns in the array. Must be greater than zero.' },
            value3: {
                name: 'lambda',
                detail: 'A LAMBDA that is called to create the array. The LAMBDA takes two parameters: row (The row index of the array), col (The column index of the array).',
            },
        },
    },
    MAP: {
        description: 'Returns an array formed by mapping each value in the array(s) to a new value by applying a LAMBDA to create a new value.',
        abstract: 'Returns an array formed by mapping each value in the array(s) to a new value by applying a LAMBDA to create a new value.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'An array1 to be mapped.' },
            array2: { name: 'array2', detail: 'An array2 to be mapped.' },
            lambda: { name: 'lambda', detail: 'A LAMBDA which must be the last argument and which must have either a parameter for each array passed.' },
        },
    },
    NOT: {
        description: 'Reverses the logic of its argument.',
        abstract: 'Reverses the logic of its argument.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: 'The condition that you want to reverse the logic for, which can evaluate to either TRUE or FALSE.' },
        },
    },
    OR: {
        description: 'Returns TRUE if any of its arguments evaluate to TRUE, and returns FALSE if all of its arguments evaluate to FALSE.',
        abstract: 'Returns TRUE if any argument is TRUE',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'The first condition that you want to test that can evaluate to either TRUE or FALSE.' },
            logical2: { name: 'logical2', detail: 'Additional conditions that you want to test that can evaluate to either TRUE or FALSE, up to a maximum of 255 conditions.' },
        },
    },
    REDUCE: {
        description: 'Reduces an array to an accumulated value by applying a LAMBDA to each value and returning the total value in the accumulator.',
        abstract: 'Reduces an array to an accumulated value by applying a LAMBDA to each value and returning the total value in the accumulator.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Sets the starting value for the accumulator.' },
            array: { name: 'array', detail: 'An array to be reduced.' },
            lambda: { name: 'lambda', detail: 'A LAMBDA that is called to reduce the array. The LAMBDA takes three parameters: 1.The value totaled up and returned as the final result. 2.The current value from the array. 3.The calculation applied to each element in the array.' },
        },
    },
    SCAN: {
        description: 'Scans an array by applying a LAMBDA to each value and returns an array that has each intermediate value.',
        abstract: 'Scans an array by applying a LAMBDA to each value and returns an array that has each intermediate value.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Sets the starting value for the accumulator.' },
            array: { name: 'array', detail: 'An array to be scanned.' },
            lambda: { name: 'lambda', detail: 'A LAMBDA that is called to scanned the array. The LAMBDA takes three parameters: 1.The value totaled up and returned as the final result. 2.The current value from the array. 3.The calculation applied to each element in the array.' },
        },
    },
    SWITCH: {
        description: 'Evaluates an expression against a list of values and returns the result corresponding to the first matching value. If there is no match, an optional default value may be returned.',
        abstract: 'Evaluates an expression against a list of values and returns the result corresponding to the first matching value. If there is no match, an optional default value may be returned.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: 'Expression is the value (such as a number, date or some text) that will be compared against value1…value126.' },
            value1: { name: 'value1', detail: 'ValueN is a value that will be compared against expression.' },
            result1: { name: 'result1', detail: 'ResultN is the value to be returned when the corresponding valueN argument matches expression. ResultN and must be supplied for each corresponding valueN argument.' },
            defaultOrValue2: { name: 'default_or_value2', detail: 'Default is the value to return in case no matches are found in the valueN expressions. The Default argument is identified by having no corresponding resultN expression (see examples). Default must be the final argument in the function.' },
            result2: { name: 'result2', detail: 'ResultN is the value to be returned when the corresponding valueN argument matches expression. ResultN and must be supplied for each corresponding valueN argument.' },
        },
    },
    TRUE: {
        description: 'Returns the logical value TRUE.',
        abstract: 'Returns the logical value TRUE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/true-function',
            },
        ],
        functionParameter: {},
    },
    XOR: {
        description: 'Returns TRUE if an odd number of its arguments evaluate to TRUE, and FALSE if an even number of its arguments evaluate to TRUE.',
        abstract: 'Returns TRUE if an odd number of arguments are TRUE',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'The first condition that you want to test that can evaluate to either TRUE or FALSE.' },
            logical2: { name: 'logical2', detail: 'Additional conditions that you want to test that can evaluate to either TRUE or FALSE, up to a maximum of 255 conditions.' },
        },
    },
};

export default locale;
