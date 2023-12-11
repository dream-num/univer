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
    AVERAGE: {
        description: 'Returns the average (arithmetic mean) of the arguments.',
        abstract: 'Returns the average of its arguments',
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'The first number, cell reference, or range for which you want the average.',
            },
            number2: {
                name: 'number2',
                detail: 'Additional numbers, cell references or ranges for which you want the average, up to a maximum of 255.',
            },
        },
    },
    COUNT: {
        description:
            'Counts the number of cells that contain numbers, and counts numbers within the list of arguments.',
        abstract: 'Counts how many numbers are in the list of arguments',
        functionParameter: {
            value1: {
                name: 'value1',
                detail: 'The first item, cell reference, or range within which you want to count numbers.',
            },
            value2: {
                name: 'value2',
                detail: 'Up to 255 additional items, cell references, or ranges within which you want to count numbers.',
            },
        },
    },
    MAX: {
        description: 'Returns the largest value in a set of values.',
        abstract: 'Returns the maximum value in a list of arguments',
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'The first number, cell reference, or range to calculate the maximum value from.',
            },
            number2: {
                name: 'number2',
                detail: 'Additional numbers, cell references or ranges to calculate the maximum value from, up to a maximum of 255.',
            },
        },
    },
    MIN: {
        description: 'Returns the smallest number in a set of values.',
        abstract: 'Returns the minimum value in a list of arguments',
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'The first number, cell reference, or range to calculate the minimum value from.',
            },
            number2: {
                name: 'number2',
                detail: 'Additional numbers, cell references or ranges to calculate the minimum value from, up to a maximum of 255.',
            },
        },
    },
};
