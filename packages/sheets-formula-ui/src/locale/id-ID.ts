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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'Jumlah Cepat',
        },

        insert: {
            tooltip: 'Fungsi',
            common: 'Fungsi Umum',
        },
        prompt: {
            helpExample: 'CONTOH',
            helpAbstract: 'TENTANG',
            required: 'Wajib.',
            optional: 'Opsional.',
        },
        error: {
            title: 'Kesalahan',
            divByZero: 'Kesalahan pembagian dengan nol',
            name: 'Kesalahan nama tidak valid',
            value: 'Kesalahan pada nilai',
            num: 'Kesalahan angka',
            na: 'Kesalahan nilai tidak tersedia',
            cycle: 'Kesalahan referensi sirkular',
            ref: 'Kesalahan referensi sel tidak valid',
            spill: 'Rentang tumpahan tidak kosong',
            calc: 'Kesalahan perhitungan',
            error: 'Kesalahan',
            connect: 'Mendapatkan data',
            null: 'Kesalahan Nol',
        },

        functionType: {
            financial: 'Keuangan',
            date: 'Tanggal & Waktu',
            math: 'Matematika & Trigonometri',
            statistical: 'Statistik',
            lookup: 'Pencarian & Referensi',
            database: 'Database',
            text: 'Teks',
            logical: 'Logika',
            information: 'Informasi',
            engineering: 'Teknik',
            cube: 'Kubus',
            compatibility: 'Kompatibilitas',
            web: 'Web',
            array: 'Array',
            univer: 'Univer',
            user: 'Ditetapkan Pengguna',
            definedname: 'Nama Ditetapkan',
        },
        moreFunctions: {
            confirm: 'Konfirmasi',
            prev: 'Sebelumnya',
            next: 'Berikutnya',
            searchFunctionPlaceholder: 'Cari fungsi',
            allFunctions: 'Semua Fungsi',
            syntax: 'SINTAKS',
        },
        operation: {
            copyFormulaOnly: 'Salin Hanya Rumus',
            pasteFormula: 'Tempel Rumus',
        },

        rangeSelector: {
            title: 'Pilih rentang data',
            addAnotherRange: 'Tambah rentang',
            buttonTooltip: 'Pilih rentang data',
            placeHolder: 'Pilih rentang atau ketik.',
            confirm: 'Konfirmasi',
            cancel: 'Batal',
        },
    },
};

export default locale;
