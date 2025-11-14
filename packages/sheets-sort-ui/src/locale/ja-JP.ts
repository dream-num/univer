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

import type enUS from './en-US';

const locale: typeof enUS = {
    'sheets-sort': {
        general: {
            sort: '並べ替え',
            'sort-asc': '昇順',
            'sort-desc': '降順',
            'sort-custom': 'カスタム順序',
            'sort-asc-ext': '昇順（拡張）',
            'sort-desc-ext': '降順（拡張）',
            'sort-asc-cur': '昇順',
            'sort-desc-cur': '降順',
        },
        error: {
            'merge-size': '選択範囲に異なるサイズの結合セルが含まれているため、並べ替えができません。',
            empty: '選択範囲にデータがないため、並べ替えができません。',
            single: '選択範囲に1行しか含まれていないため、並べ替えができません。',
            'formula-array': '選択範囲に配列数式が含まれているため、並べ替えができません。',
        },
        dialog: {
            'sort-reminder': '並べ替えの確認',
            'sort-reminder-desc': '範囲を拡張して並べ替えますか、それとも範囲を維持して並べ替えますか？',
            'sort-reminder-ext': '範囲を拡張して並べ替え',
            'sort-reminder-no': '範囲を維持して並べ替え',
            'first-row-check': '先頭行を並べ替えの対象に含めない',
            'add-condition': '条件を追加',
            cancel: 'キャンセル',
            confirm: '確認',
        },
    },
};

export default locale;
