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
    'sheets-table-ui': {
        title: 'Tabel',
        selectRange: 'Pilih Rentang Tabel',
        rename: 'Ubah Nama Tabel',
        renamePlaceholder: 'Masukkan nama tabel',
        updateRange: 'Perbarui Rentang Tabel',
        tableRangeWithMergeError: 'Rentang tabel tidak boleh tumpang tindih dengan sel yang digabungkan',
        tableRangeWithOtherTableError: 'Rentang tabel tidak boleh tumpang tindih dengan tabel lain',
        tableRangeSingleRowError: 'Rentang tabel tidak boleh hanya satu baris',
        updateError: 'Tidak dapat mengatur rentang tabel ke area yang tidak tumpang tindih dengan aslinya dan tidak berada di baris yang sama',
        tableStyle: 'Gaya Tabel',
        defaultStyle: 'Gaya Bawaan',
        customStyle: 'Gaya Kustom',
        customTooMore: 'Jumlah tema kustom melebihi batas maksimum, silakan hapus beberapa tema yang tidak diperlukan dan tambahkan lagi',
        setTheme: 'Atur Tema Tabel',
        removeTable: 'Hapus Tabel',
        cancel: 'Batal',
        confirm: 'Konfirmasi',
        header: 'Header',
        footer: 'Footer',
        firstLine: 'Baris Pertama',
        secondLine: 'Baris Kedua',
        columnPrefix: 'Kolom',
        tablePrefix: 'Tabel',
        tableNameError: 'Nama tabel tidak boleh mengandung spasi, tidak boleh diawali dengan angka, dan tidak boleh sama dengan nama tabel yang sudah ada',
        columnMenu: {
            'insert-left': 'Sisipkan 1 kolom tabel di kiri',
            'insert-right': 'Sisipkan 1 kolom tabel di kanan',
            delete: 'Hapus kolom tabel',
        },

        sort: {
            'sort-asc': 'Menaik',
            'sort-desc': 'Menurun',
        },

        insert: {
            main: 'Sisipkan Tabel',
            row: 'Sisipkan Baris Tabel',
            col: 'Sisipkan Kolom Tabel',
        },

        remove: {
            main: 'Hapus Tabel',
            row: 'Hapus Baris Tabel',
            col: 'Hapus Kolom Tabel',
        },
        condition: {
            string: 'Teks',
            number: 'Angka',
            date: 'Tanggal',

            empty: '(Kosong)',
        },
        string: {
            compare: {
                equal: 'Sama dengan',
                notEqual: 'Tidak sama dengan',
                contains: 'Mengandung',
                notContains: 'Tidak mengandung',
                startsWith: 'Dimulai dengan',
                endsWith: 'Diakhiri dengan',
            },
        },
        number: {
            compare: {
                equal: 'Sama dengan',
                notEqual: 'Tidak sama dengan',
                greaterThan: 'Lebih besar dari',
                greaterThanOrEqual: 'Lebih besar dari atau sama dengan',
                lessThan: 'Kurang dari',
                lessThanOrEqual: 'Kurang dari atau sama dengan',
                between: 'Di antara',
                notBetween: 'Tidak di antara',
                above: 'Di atas',
                below: 'Di bawah',
                topN: 'Teratas {0}',
            },
        },
        date: {
            compare: {
                equal: 'Sama dengan',
                notEqual: 'Tidak sama dengan',
                after: 'Setelah',
                afterOrEqual: 'Setelah atau sama dengan',
                before: 'Sebelum',
                beforeOrEqual: 'Sebelum atau sama dengan',
                between: 'Di antara',
                notBetween: 'Tidak di antara',
                today: 'Hari ini',
                yesterday: 'Kemarin',
                tomorrow: 'Besok',
                thisWeek: 'Minggu ini',
                lastWeek: 'Minggu lalu',
                nextWeek: 'Minggu depan',
                thisMonth: 'Bulan ini',
                lastMonth: 'Bulan lalu',
                nextMonth: 'Bulan depan',
                thisQuarter: 'Kuartal ini',
                lastQuarter: 'Kuartal lalu',
                nextQuarter: 'Kuartal depan',
                thisYear: 'Tahun ini',
                nextYear: 'Tahun depan',
                lastYear: 'Tahun lalu',
                quarter: 'Berdasarkan kuartal',
                month: 'Berdasarkan bulan',
                q1: 'Kuartal pertama',
                q2: 'Kuartal kedua',
                q3: 'Kuartal ketiga',
                q4: 'Kuartal keempat',
                m1: 'Januari',
                m2: 'Februari',
                m3: 'Maret',
                m4: 'April',
                m5: 'Mei',
                m6: 'Juni',
                m7: 'Juli',
                m8: 'Agustus',
                m9: 'September',
                m10: 'Oktober',
                m11: 'November',
                m12: 'Desember',
            },
        },
        filter: {
            'by-values': 'Berdasarkan Nilai',
            'by-conditions': 'Berdasarkan Kondisi',
            'clear-filter': 'Hapus Filter',
            cancel: 'Batal',
            confirm: 'Konfirmasi',
            'search-placeholder': 'Gunakan spasi untuk memisahkan kata kunci',
            'select-all': 'Pilih Semua',
        },
    },
};

export default locale;
