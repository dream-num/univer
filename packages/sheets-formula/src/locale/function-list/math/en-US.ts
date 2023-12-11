/**
 * Copyright 2023 DreamNum Inc.
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
    SUM: {
        description: 'You can add individual values, cell references or ranges or a mix of all three.',
        abstract: 'Adds its arguments',
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'The first number you want to add. The number can be like 4, a cell reference like B6, or a cell range like B2:B8.',
            },
            number2: {
                name: 'number2',
                detail: 'This is the second number you want to add. You can specify up to 255 numbers in this way.',
            },
        },
    },
    SUMIF: {
        description: 'Sum the values in a range that meet criteria that you specify.',
        abstract: 'Adds the cells specified by a given criteria',
        functionParameter: {
            range: {
                name: 'range',
                detail: 'The range of cells that you want evaluated by criteria.',
            },
            criteria: {
                name: 'criteria',
                detail: 'The criteria in the form of a number, expression, a cell reference, text, or a function that defines which cells will be added. Wildcard characters can be included - a question mark (?) to match any single character, an asterisk (*) to match any sequence of characters. If you want to find an actual question mark or asterisk, type a tilde (~) preceding the character.',
            },
            sum_range: {
                name: 'sum_range',
                detail: 'The actual cells to add, if you want to add cells other than those specified in the range argument. If the sum_range argument is omitted, Excel adds the cells that are specified in the range argument (the same cells to which the criteria is applied).',
            },
        },
    },
};
