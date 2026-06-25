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
    'find-replace': {
        toolbar: 'Cari & Ganti',
        shortcut: {
            'open-find-dialog': 'Buka Dialog Cari',
            'open-replace-dialog': 'Buka Dialog Ganti',
            'close-dialog': 'Tutup Dialog Cari & Ganti',
            'go-to-next-match': 'Ke Hasil Berikutnya',
            'go-to-previous-match': 'Ke Hasil Sebelumnya',
            'focus-selection': 'Fokus Pilihan',
            panel: 'Cari & Ganti',
        },
        dialog: {
            title: 'Cari',
            find: 'Cari',
            replace: 'Ganti',
            'replace-all': 'Ganti Semua',
            'case-sensitive': 'Sensitif Huruf',
            'find-placeholder': 'Cari di Lembar ini',
            'advanced-finding': 'Pencarian & Penggantian Lanjutan',
            'replace-placeholder': 'Masukkan String Pengganti',
            'match-the-whole-cell': 'Cocokkan Seluruh Sel',
            'find-direction': {
                title: 'Arah Cari',
                row: 'Cari per Baris',
                column: 'Cari per Kolom',
            },
            'find-scope': {
                title: 'Rentang Cari',
                'current-sheet': 'Lembar Saat Ini',
                workbook: 'Buku Kerja',
            },
            'find-by': {
                title: 'Cari Berdasarkan',
                value: 'Cari berdasarkan Nilai',
                formula: 'Cari Rumus',
            },
            'no-match': 'Pencarian selesai tetapi tidak ditemukan kecocokan.',
            'no-result': 'Tidak Ada Hasil',
        },
        replace: {
            'all-success': 'Berhasil mengganti {0} kecocokan',
            'partial-success': 'Berhasil mengganti {0} kecocokan, gagal mengganti {1}',
            'all-failure': 'Penggantian gagal',
            confirm: {
                title: 'Apakah Anda yakin ingin mengganti semua kecocokan?',
            },
        },
        button: {
            confirm: 'OK',
            cancel: 'Batal',
        },
    },
};

export default locale;
