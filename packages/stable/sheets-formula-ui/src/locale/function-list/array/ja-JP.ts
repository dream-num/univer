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
        description: '配列の結果を指定したサイズに抑えます',
        abstract: '配列の結果を指定したサイズに抑えます',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3267036?hl=ja&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: '配列', detail: '制約対象の範囲です。' },
            numRows: { name: '行の数', detail: '結果に含める行の数です。' },
            numCols: { name: '列の数', detail: '結果に含める列の数です。' },
        },
    },
    FLATTEN: {
        description: '1 つ以上の範囲に含まれるすべての値を、単一の列にフラット化します',
        abstract: '1 つ以上の範囲に含まれるすべての値を、単一の列にフラット化します',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/10307761?hl=ja&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: '範囲1', detail: 'フラット化する最初の範囲です。' },
            range2: { name: '範囲2', detail: 'フラット化する追加の範囲です。' },
        },
    },
};
