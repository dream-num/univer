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
        description: '限制特定大小的陣列結果',
        abstract: '限制特定大小的陣列結果',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3267036?hl=zh-Hant&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: '陣列', detail: '限制的範圍。' },
            numRows: { name: '列數', detail: '結果所包含的列數。' },
            numCols: { name: '欄數', detail: '結果所包含的欄數。' },
        },
    },
    FLATTEN: {
        description: '將一或多個範圍中的所有值合併至單一欄',
        abstract: '將一或多個範圍中的所有值合併至單一欄',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/10307761?hl=zh-Hant&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: '範圍1', detail: '第一個要合併的範圍。' },
            range2: { name: '範圍2', detail: '其他要合併的範圍。' },
        },
    },
};
