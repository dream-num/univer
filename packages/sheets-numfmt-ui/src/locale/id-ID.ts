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
    'sheets-numfmt-ui': {
        title: 'Format angka',
        numfmtType: 'Jenis format',
        cancel: 'Batal',
        confirm: 'Konfirmasi',
        general: 'Umum',
        accounting: 'Akuntansi',
        text: 'Teks',
        number: 'Angka',
        percent: 'Persentase',
        scientific: 'Ilmiah',
        currency: 'Mata Uang',
        date: 'Tanggal',
        time: 'Waktu',
        thousandthPercentile: 'Pemisah ribuan',
        preview: 'Pratinjau',
        dateTime: 'Tanggal dan waktu',
        decimalLength: 'Tempat desimal',
        currencyType: 'Simbol Mata Uang',
        moreFmt: 'Format',
        financialValue: 'Nilai keuangan',
        roundingCurrency: 'Pembulatan mata uang',
        timeDuration: 'Durasi Waktu',
        currencyDes: 'Format mata uang digunakan untuk mewakili nilai mata uang umum. Format akuntansi menyelaraskan kolom nilai dengan titik desimal',
        accountingDes: 'Format angka akuntansi menyelaraskan kolom nilai dengan simbol mata uang dan titik desimal',
        dateType: 'Jenis Tanggal',
        dateDes: 'Format tanggal menampilkan nilai seri tanggal dan waktu sebagai nilai tanggal.',
        negType: 'Jenis angka negatif',
        generalDes: 'Format reguler tidak berisi format angka tertentu.',
        thousandthPercentileDes: 'Format persentil digunakan untuk representasi angka biasa. Format moneter dan akuntansi menyediakan format khusus untuk perhitungan nilai moneter.',
        addDecimal: 'Tambah tempat desimal',
        subtractDecimal: 'Kurangi tempat desimal',
        customFormat: 'Format Kustom',
        customFormatDes: 'Hasilkan format angka kustom berdasarkan format yang ada.',
        info: {
            error: 'Kesalahan',
            forceStringInfo: 'Angka disimpan sebagai teks',
        },
    },
};

export default locale;
