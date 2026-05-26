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
    'sheets-sort-ui': {
        general: {
            sort: 'Urutkan',
            'sort-asc': 'Menaik',
            'sort-desc': 'Menurun',
            'sort-custom': 'Urutan Kustom',
            'sort-asc-ext': 'Perluas Menaik',
            'sort-desc-ext': 'Perluas Menurun',
            'sort-asc-cur': 'Menaik',
            'sort-desc-cur': 'Menurun',
        },
        error: {
            'merge-size': 'Rentang yang dipilih mengandung sel yang digabungkan dengan ukuran berbeda, yang tidak dapat diurutkan.',
            empty: 'Rentang yang dipilih tidak memiliki konten dan tidak dapat diurutkan.',
            single: 'Rentang yang dipilih hanya memiliki satu baris dan tidak dapat diurutkan.',
            'formula-array': 'Rentang yang dipilih memiliki rumus array dan tidak dapat diurutkan.',
        },
        dialog: {
            'sort-reminder': 'Pengingat Urutan',
            'sort-reminder-desc': 'Perluas pengurutan rentang atau pertahankan pengurutan rentang?',
            'sort-reminder-ext': 'Perluas pengurutan rentang',
            'sort-reminder-no': 'Pertahankan pengurutan rentang',
            'first-row-check': 'Baris pertama tidak ikut dalam pengurutan',
            'add-condition': 'Tambah kondisi',
            cancel: 'Batal',
            confirm: 'Konfirmasi',
        },
        info: {
            tooltip: 'Tooltip',
        },
    },
};

export default locale;
