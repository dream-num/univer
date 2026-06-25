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
    'sheets-filter-ui': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Aktifkan/Nonaktifkan Filter',
            'clear-filter-criteria': 'Hapus Kondisi Filter',
            're-calc-filter-conditions': 'Hitung Ulang Kondisi Filter',
        },
        shortcut: {
            'smart-toggle-filter': 'Aktifkan/Nonaktifkan Filter',
        },
        permission: {
            filterErr: 'Anda tidak memiliki izin untuk menggunakan filter.',
        },
        panel: {
            'clear-filter': 'Hapus Filter',
            cancel: 'Batal',
            confirm: 'Konfirmasi',
            'by-values': 'Berdasarkan Nilai',
            'by-colors': 'Berdasarkan Warna',
            'filter-by-cell-fill-color': 'Filter berdasarkan warna isi sel',
            'filter-by-cell-text-color': 'Filter berdasarkan warna teks sel',
            'filter-by-color-none': 'Kolom hanya berisi satu warna',
            'by-conditions': 'Berdasarkan Kondisi',
            'filter-only': 'Hanya Filter',
            'search-placeholder': 'Gunakan spasi untuk memisahkan kata kunci',
            'select-all': 'Pilih Semua',
            'input-values-placeholder': 'Masukkan Nilai',
            and: 'DAN',
            or: 'ATAU',
            empty: '(kosong)',
            '?': 'Gunakan "?" untuk mewakili satu karakter.',
            '*': 'Gunakan "*" untuk mewakili banyak karakter.',
        },
        conditions: {
            none: 'Tidak ada',
            empty: 'Kosong',
            'not-empty': 'Tidak Kosong',
            'text-contains': 'Teks Mengandung',
            'does-not-contain': 'Teks Tidak Mengandung',
            'starts-with': 'Teks Dimulai Dengan',
            'ends-with': 'Teks Diakhiri Dengan',
            equals: 'Teks Sama Dengan',
            'greater-than': 'Lebih Besar Dari',
            'greater-than-or-equal': 'Lebih Besar Dari Atau Sama Dengan',
            'less-than': 'Lebih Kecil Dari',
            'less-than-or-equal': 'Lebih Kecil Dari Atau Sama Dengan',
            equal: 'Sama Dengan',
            'not-equal': 'Tidak Sama Dengan',
            between: 'Di Antara',
            'not-between': 'Tidak Di Antara',
            custom: 'Kustom',
        },
        date: {
            1: 'Januari',
            2: 'Februari',
            3: 'Maret',
            4: 'April',
            5: 'Mei',
            6: 'Juni',
            7: 'Juli',
            8: 'Agustus',
            9: 'September',
            10: 'Oktober',
            11: 'November',
            12: 'Desember',
        },
        sync: {
            title: 'Filter terlihat oleh semua orang',
            statusTips: {
                on: 'Jika diaktifkan, semua kolaborator akan melihat hasil filter',
                off: 'Jika dinonaktifkan, hanya Anda yang akan melihat hasil filter',
            },
            switchTips: {
                on: '"Filter terlihat oleh semua orang" diaktifkan, semua kolaborator akan melihat hasil filter',
                off: '"Filter terlihat oleh semua orang" dinonaktifkan, hanya Anda yang akan melihat hasil filter',
            },
        },
    },
};

export default locale;
