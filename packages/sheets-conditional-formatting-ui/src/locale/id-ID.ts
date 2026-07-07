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
    'sheets-conditional-formatting-ui': {
        title: 'Format Bersyarat',
        menu: {
            manageConditionalFormatting: 'Kelola Format Bersyarat',
            createConditionalFormatting: 'Buat Format Bersyarat',
            clearRangeRules: 'Hapus Aturan untuk Rentang yang Dipilih',
            clearWorkSheetRules: 'Hapus Aturan untuk Seluruh Lembar',

        },
        form: {
            lessThan: 'Nilai harus kurang dari {0}',
            lessThanOrEqual: 'Nilai harus kurang dari atau sama dengan {0}',
            greaterThan: 'Nilai harus lebih besar dari {0}',
            greaterThanOrEqual: 'Nilai harus lebih besar dari atau sama dengan {0}',
            rangeSelector: 'Pilih Rentang atau Masukkan Nilai',
        },
        iconSet: {
            direction: 'Arah',
            shape: 'Bentuk',
            mark: 'Tanda',
            rank: 'Peringkat',
            rule: 'Aturan',
            icon: 'Ikon',
            type: 'Jenis',
            value: 'Nilai',
            reverseIconOrder: 'Balikkan Urutan Ikon',
            and: 'Dan',
            when: 'Ketika',
            onlyShowIcon: 'Tampilkan Ikon Saja',
            noCellIcon: 'Tanpa Ikon Sel',
        },
        symbol: {
            greaterThan: '>',
            greaterThanOrEqual: '>=',
            lessThan: '<',
            lessThanOrEqual: '<=',
        },
        panel: {
            createRule: 'Buat Aturan',
            clear: 'Hapus Semua Aturan',
            range: 'Terapkan Rentang',
            styleType: 'Jenis Gaya',
            submit: 'Kirim',
            cancel: 'Batal',
            rankAndAverage: 'Atas/Bawah/Rata-rata',
            styleRule: 'Aturan Gaya',
            isNotBottom: 'Atas',
            isBottom: 'Bawah',
            greaterThanAverage: 'Lebih Besar dari Rata-rata',
            lessThanAverage: 'Lebih Kecil dari Rata-rata',
            medianValue: 'Nilai Median',
            fillType: 'Jenis Isian',
            pureColor: 'Warna Solid',
            gradient: 'Gradien',
            colorSet: 'Set Warna',
            positive: 'Positif',
            native: 'Negatif',
            workSheet: 'Seluruh Lembar',
            selectedRange: 'Rentang yang Dipilih',
            managerRuleSelect: 'Kelola {0} Aturan',
            onlyShowDataBar: 'Tampilkan Bilah Data Saja',
        },
        preview: {
            describe: {
                beginsWith: 'Dimulai dengan {0}',
                endsWith: 'Diakhiri dengan {0}',
                containsText: 'Teks mengandung {0}',
                notContainsText: 'Teks tidak mengandung {0}',
                equal: 'Sama dengan {0}',
                notEqual: 'Tidak sama dengan {0}',
                containsBlanks: 'Mengandung Kosong',
                notContainsBlanks: 'Tidak mengandung Kosong',
                containsErrors: 'Mengandung Kesalahan',
                notContainsErrors: 'Tidak mengandung Kesalahan',
                greaterThan: 'Lebih besar dari {0}',
                greaterThanOrEqual: 'Lebih besar dari atau sama dengan {0}',
                lessThan: 'Lebih kecil dari {0}',
                lessThanOrEqual: 'Lebih kecil dari atau sama dengan {0}',
                notBetween: 'Tidak antara {0} dan {1}',
                between: 'Antara {0} dan {1}',
                yesterday: 'Kemarin',
                tomorrow: 'Besok',
                last7Days: '7 Hari Terakhir',
                thisMonth: 'Bulan Ini',
                lastMonth: 'Bulan Lalu',
                nextMonth: 'Bulan Depan',
                thisWeek: 'Minggu Ini',
                lastWeek: 'Minggu Lalu',
                nextWeek: 'Minggu Depan',
                today: 'Hari Ini',
                topN: 'Atas {0}',
                bottomN: 'Bawah {0}',
                topNPercent: 'Atas {0}%',
                bottomNPercent: 'Bawah {0}%',
            },
        },
        operator: {
            beginsWith: 'Dimulai dengan',
            endsWith: 'Diakhiri dengan',
            containsText: 'Teks mengandung',
            notContainsText: 'Teks tidak mengandung',
            equal: 'Sama dengan',
            notEqual: 'Tidak sama dengan',
            containsBlanks: 'Mengandung Kosong',
            notContainsBlanks: 'Tidak mengandung Kosong',
            containsErrors: 'Mengandung Kesalahan',
            notContainsErrors: 'Tidak mengandung Kesalahan',
            greaterThan: 'Lebih besar dari',
            greaterThanOrEqual: 'Lebih besar dari atau sama dengan',
            lessThan: 'Lebih kecil dari',
            lessThanOrEqual: 'Lebih kecil dari atau sama dengan',
            notBetween: 'Tidak antara',
            between: 'Antara',
            yesterday: 'Kemarin',
            tomorrow: 'Besok',
            last7Days: '7 Hari Terakhir',
            thisMonth: 'Bulan Ini',
            lastMonth: 'Bulan Lalu',
            nextMonth: 'Bulan Depan',
            thisWeek: 'Minggu Ini',
            lastWeek: 'Minggu Lalu',
            nextWeek: 'Minggu Depan',
            today: 'Hari Ini',
        },
        ruleType: {
            highlightCell: 'Sorot Sel',
            dataBar: 'Bilah Data',
            colorScale: 'Skala Warna',
            formula: 'Rumus Kustom',
            iconSet: 'Set Ikon',
            duplicateValues: 'Nilai Duplikat',
            uniqueValues: 'Nilai Unik',
        },
        subRuleType: {
            uniqueValues: 'Nilai Unik',
            duplicateValues: 'Nilai Duplikat',
            rank: 'Peringkat',
            text: 'Teks',
            timePeriod: 'Periode Waktu',
            number: 'Angka',
            average: 'Rata-rata',
        },
        valueType: {
            num: 'Angka',
            min: 'Minimum',
            max: 'Maksimum',
            percent: 'Persentase',
            percentile: 'Persentil',
            formula: 'Rumus',
            none: 'Tidak ada',
        },
        errorMessage: {
            notBlank: 'Kondisi tidak boleh kosong',
            formulaError: 'Rumus salah',
            rangeError: 'Pilihan buruk',
        },
        permission: {
            dialog: {
                setStyleErr: 'Rentang ini dilindungi, dan Anda tidak memiliki izin untuk mengatur gaya. Untuk mengatur gaya, silakan hubungi pembuatnya.',
            },
        },
    },
};

export default locale;
