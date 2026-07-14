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
    ARRAY_CONSTRAIN: {
        description: 'Membatasi hasil array ke ukuran yang ditentukan.',
        abstract: 'Membatasi hasil array ke ukuran yang ditentukan.',
        links: [{ title: 'Petunjuk', url: 'https://support.google.com/docs/answer/3267036?hl=id' }],
        functionParameter: {
            inputRange: { name: 'rentang_input', detail: 'Rentang yang akan dibatasi.' },
            numRows: { name: 'jumlah_baris', detail: 'Jumlah baris yang harus dimuat dalam hasil.' },
            numCols: { name: 'jumlah_kolom', detail: 'Jumlah kolom yang harus dimuat dalam hasil.' },
        },
    },
    FLATTEN: {
        description: 'Meratakan semua nilai dari satu atau beberapa rentang menjadi satu kolom.',
        abstract: 'Meratakan semua nilai dari satu atau beberapa rentang menjadi satu kolom.',
        links: [{ title: 'Petunjuk', url: 'https://support.google.com/docs/answer/10307761?hl=id' }],
        functionParameter: {
            range1: { name: 'rentang1', detail: 'Rentang pertama yang akan diratakan.' },
            range2: { name: 'rentang2', detail: '[opsional, dapat diulang] Rentang tambahan yang akan diratakan.' },
        },
    },
};

export default locale;
