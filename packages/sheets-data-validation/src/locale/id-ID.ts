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
    'sheets-data-validation': {
        operators: {
            between: 'antara',
            greaterThan: 'lebih besar dari',
            greaterThanOrEqual: 'lebih besar dari atau sama dengan',
            lessThan: 'kurang dari',
            lessThanOrEqual: 'kurang dari atau sama dengan',
            equal: 'sama dengan',
            notEqual: 'tidak sama dengan',
            notBetween: 'tidak antara',
            legal: 'tipe yang sah',
        },
        ruleName: {
            between: 'Di antara {FORMULA1} dan {FORMULA2}',
            greaterThan: 'Lebih besar dari {FORMULA1}',
            greaterThanOrEqual: 'Lebih besar dari atau sama dengan {FORMULA1}',
            lessThan: 'Kurang dari {FORMULA1}',
            lessThanOrEqual: 'Kurang dari atau sama dengan {FORMULA1}',
            equal: 'Sama dengan {FORMULA1}',
            notEqual: 'Tidak sama dengan {FORMULA1}',
            notBetween: 'Tidak di antara {FORMULA1} dan {FORMULA2}',
            legal: 'Tipe {TYPE} yang sah',
        },
        errorMsg: {
            between: 'Nilai harus di antara {FORMULA1} dan {FORMULA2}',
            greaterThan: 'Nilai harus lebih besar dari {FORMULA1}',
            greaterThanOrEqual: 'Nilai harus lebih besar dari atau sama dengan {FORMULA1}',
            lessThan: 'Nilai harus kurang dari {FORMULA1}',
            lessThanOrEqual: 'Nilai harus kurang dari atau sama dengan {FORMULA1}',
            equal: 'Nilai harus sama dengan {FORMULA1}',
            notEqual: 'Nilai harus tidak sama dengan {FORMULA1}',
            notBetween: 'Nilai harus tidak di antara {FORMULA1} dan {FORMULA2}',
            legal: 'Nilai harus tipe {TYPE} yang sah',
        },
        date: {
            operators: {
                between: 'antara',
                greaterThan: 'setelah',
                greaterThanOrEqual: 'pada atau setelah',
                lessThan: 'sebelum',
                lessThanOrEqual: 'pada atau sebelum',
                equal: 'sama dengan',
                notEqual: 'tidak sama dengan',
                notBetween: 'tidak antara',
                legal: 'tanggal yang sah',
            },
            ruleName: {
                between: 'antara {FORMULA1} dan {FORMULA2}',
                greaterThan: 'setelah {FORMULA1}',
                greaterThanOrEqual: 'pada atau setelah {FORMULA1}',
                lessThan: 'sebelum {FORMULA1}',
                lessThanOrEqual: 'pada atau sebelum {FORMULA1}',
                equal: 'adalah {FORMULA1}',
                notEqual: 'bukan {FORMULA1}',
                notBetween: 'tidak antara {FORMULA1} dan {FORMULA2}',
                legal: 'tanggal yang sah',
            },
            errorMsg: {
                between: 'Nilai harus tanggal yang sah dan di antara {FORMULA1} dan {FORMULA2}',
                greaterThan: 'Nilai harus tanggal yang sah dan setelah {FORMULA1}',
                greaterThanOrEqual: 'Nilai harus tanggal yang sah dan pada atau setelah {FORMULA1}',
                lessThan: 'Nilai harus tanggal yang sah dan sebelum {FORMULA1}',
                lessThanOrEqual: 'Nilai harus tanggal yang sah dan pada atau sebelum {FORMULA1}',
                equal: 'Nilai harus tanggal yang sah dan {FORMULA1}',
                notEqual: 'Nilai harus tanggal yang sah dan bukan {FORMULA1}',
                notBetween: 'Nilai harus tanggal yang sah dan tidak antara {FORMULA1} dan {FORMULA2}',
                legal: 'Nilai harus tanggal yang sah',
            },
            title: 'Tanggal',
        },
        textLength: {
            errorMsg: {
                between: 'Panjang teks harus di antara {FORMULA1} dan {FORMULA2}',
                greaterThan: 'Panjang teks harus lebih besar dari {FORMULA1}',
                greaterThanOrEqual: 'Panjang teks harus lebih besar dari atau sama dengan {FORMULA1}',
                lessThan: 'Panjang teks harus kurang dari {FORMULA1}',
                lessThanOrEqual: 'Panjang teks harus kurang dari atau sama dengan {FORMULA1}',
                equal: 'Panjang teks harus {FORMULA1}',
                notEqual: 'Panjang teks harus tidak sama dengan {FORMULA1}',
                notBetween: 'Panjang teks harus tidak di antara {FORMULA1} dan {FORMULA2}',
            },
            title: 'Panjang teks',
        },
        custom: {
            ruleName: 'Rumus kustom adalah {FORMULA1}',
            title: 'Rumus kustom',
            validFail: 'Harap masukkan rumus yang valid',
            error: 'Konten sel ini melanggar aturan validasinya',
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
        any: {
            title: 'Nilai apa saja',
            error: 'Konten sel ini melanggar aturan validasi',
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
    },
};

export default locale;
