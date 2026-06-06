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
    'sheets-data-validation-ui': {
        title: 'Validasi data',
        operators: {
            legal: 'tipe yang sah',
        },
        validFail: {
            value: 'Harap masukkan nilai',
            common: 'Harap masukkan nilai atau rumus',
            number: 'Harap masukkan angka atau rumus',
            formula: 'Harap masukkan rumus',
            integer: 'Harap masukkan bilangan bulat atau rumus',
            date: 'Harap masukkan tanggal atau rumus',
            list: 'Harap masukkan opsi',
            listInvalid: 'Sumber daftar harus berupa daftar yang dipisahkan atau referensi ke satu baris atau kolom',
            checkboxEqual: 'Masukkan nilai yang berbeda untuk konten sel yang dicentang dan tidak dicentang',
            formulaError: 'Rentang referensi berisi data yang tidak terlihat, harap sesuaikan rentangnya',
            listIntersects: 'Rentang yang dipilih tidak boleh berpotongan dengan cakupan aturan',
            primitive: 'Rumus tidak diizinkan untuk nilai kustom yang dicentang dan tidak dicentang',
        },
        panel: {
            title: 'Manajemen validasi data',
            addTitle: 'Buat validasi data baru',
            removeAll: 'Hapus Semua',
            add: 'Tambah Aturan',
            range: 'Rentang',
            type: 'Jenis',
            options: 'Opsi lanjutan',
            operator: 'Operator',
            removeRule: 'Hapus',
            done: 'Selesai',
            formulaPlaceholder: 'Harap masukkan nilai atau rumus',
            valuePlaceholder: 'Harap masukkan nilai',
            formulaAnd: 'dan',
            invalid: 'Tidak valid',
            showWarning: 'Tampilkan peringatan',
            rejectInput: 'Tolak input',
            messageInfo: 'Pesan bantuan',
            showInfo: 'Tampilkan teks bantuan untuk sel yang dipilih',
            rangeError: 'Rentang tidak sah',
            allowBlank: 'Izinkan nilai kosong',
        },
        any: {
            title: 'Nilai apa saja',
            error: 'Konten sel ini melanggar aturan validasi',
        },
        date: {
            title: 'Tanggal',
        },
        list: {
            title: 'Dropdown',
            name: 'Nilai mengandung satu dari rentang',
            error: 'Input harus berada dalam rentang yang ditentukan',
            emptyError: 'Harap masukkan nilai',
            add: 'Tambah',
            dropdown: 'Pilih',
            options: 'Opsi',
            customOptions: 'Kustom',
            refOptions: 'Dari rentang',
            formulaError: 'Sumber daftar harus berupa daftar data yang dipisahkan, atau referensi ke satu baris atau kolom',
            edit: 'Edit',
        },
        listMultiple: {
            title: 'Dropdown-Multiple',
            dropdown: 'Pilih banyak',
        },
        textLength: {
            title: 'Panjang teks',
        },
        decimal: {
            title: 'Angka',
        },
        whole: {
            title: 'Bilangan bulat',
        },
        checkbox: {
            title: 'Kotak centang',
            error: 'Konten sel ini melanggar aturan validasinya',
            tips: 'Gunakan nilai kustom dalam sel',
            checked: 'Nilai terpilih',
            unchecked: 'Nilai tidak terpilih',
        },
        custom: {
            title: 'Rumus kustom',
            error: 'Konten sel ini melanggar aturan validasinya',
            validFail: 'Harap masukkan rumus yang valid',
        },
        alert: {
            title: 'Kesalahan',
            ok: 'OK',
        },
        error: {
            title: 'Tidak valid:',
        },
        renderMode: {
            arrow: 'Panah',
            chip: 'Chip',
            text: 'Teks biasa',
            label: 'Gaya tampilan',
        },
        showTime: {
            label: 'Tampilkan TimePicker',
        },
        permission: {
            dialog: {
                setStyleErr: 'Rentang ini dilindungi, dan Anda tidak memiliki izin untuk mengatur gaya. Untuk mengatur gaya, silakan hubungi pembuatnya.',
            },
        },
    },
};

export default locale;
