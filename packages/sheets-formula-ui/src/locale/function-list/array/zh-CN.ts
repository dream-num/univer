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
        description: '以给定值约束数组结果的大小',
        abstract: '以给定值约束数组结果的大小',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3267036?hl=zh-Hans&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: '数组', detail: '要约束的范围。' },
            numRows: { name: '行数', detail: '结果中应包含的行数。' },
            numCols: { name: '列数', detail: '结果中应包含的列数。' },
        },
    },
    FLATTEN: {
        description: '将一个或多个范围中的所有值合并到单列',
        abstract: '将一个或多个范围中的所有值合并到单列',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/10307761?hl=zh-Hans&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: '范围1', detail: '要合并的第一个范围。' },
            range2: { name: '范围2', detail: '要合并的其他范围。' },
        },
    },
};
