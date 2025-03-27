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
    ARRAY_CONSTRAIN: {
        description: 'Constrains an array result to a specified size.',
        abstract: 'Constrains an array result to a specified size.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3267036?hl=en&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: 'input_range', detail: 'The range to constrain.' },
            numRows: { name: 'num_rows', detail: 'The number of rows the result should contain.' },
            numCols: { name: 'num_cols', detail: 'The number of columns the result should contain' },
        },
    },
    FLATTEN: {
        description: 'Flattens all the values from one or more ranges into a single column.',
        abstract: 'Flattens all the values from one or more ranges into a single column.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10307761?hl=zh-Hans&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: 'range1', detail: 'The first range to flatten.' },
            range2: { name: 'range2', detail: 'Additional ranges to flatten.' },
        },
    },
};
