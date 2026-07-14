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
    'data-validation': {
        operators: {
            between: 'antara',
            greaterThan: 'lebih besar dari',
            greaterThanOrEqual: 'lebih besar dari atau sama dengan',
            lessThan: 'lebih kecil dari',
            lessThanOrEqual: 'lebih kecil dari atau sama dengan',
            equal: 'sama dengan',
            notEqual: 'tidak sama dengan',
            notBetween: 'tidak antara',
            legal: 'adalah jenis yang valid',
        },
        ruleName: {
            between: 'Di antara {FORMULA1} dan {FORMULA2}',
            greaterThan: 'Lebih besar dari {FORMULA1}',
            greaterThanOrEqual: 'Lebih besar dari atau sama dengan {FORMULA1}',
            lessThan: 'Lebih kecil dari {FORMULA1}',
            lessThanOrEqual: 'Lebih kecil dari atau sama dengan {FORMULA1}',
            equal: 'Sama dengan {FORMULA1}',
            notEqual: 'Tidak sama dengan {FORMULA1}',
            notBetween: 'Tidak di antara {FORMULA1} dan {FORMULA2}',
            legal: 'Adalah {TYPE} yang valid',
        },
        errorMsg: {
            between: 'Nilai harus di antara {FORMULA1} dan {FORMULA2}',
            greaterThan: 'Nilai harus lebih besar dari {FORMULA1}',
            greaterThanOrEqual: 'Nilai harus lebih besar dari atau sama dengan {FORMULA1}',
            lessThan: 'Nilai harus lebih kecil dari {FORMULA1}',
            lessThanOrEqual: 'Nilai harus lebih kecil dari atau sama dengan {FORMULA1}',
            equal: 'Nilai harus sama dengan {FORMULA1}',
            notEqual: 'Nilai harus tidak sama dengan {FORMULA1}',
            notBetween: 'Nilai harus tidak di antara {FORMULA1} dan {FORMULA2}',
            legal: 'Nilai harus merupakan {TYPE} yang valid',
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
                legal: 'adalah tanggal yang valid',
            },
            ruleName: {
                between: 'di antara {FORMULA1} dan {FORMULA2}',
                greaterThan: 'setelah {FORMULA1}',
                greaterThanOrEqual: 'pada atau setelah {FORMULA1}',
                lessThan: 'sebelum {FORMULA1}',
                lessThanOrEqual: 'pada atau sebelum {FORMULA1}',
                equal: 'adalah {FORMULA1}',
                notEqual: 'bukan {FORMULA1}',
                notBetween: 'tidak di antara {FORMULA1} dan {FORMULA2}',
                legal: 'adalah tanggal yang valid',
            },
            errorMsg: {
                between: 'Nilai harus tanggal yang valid dan di antara {FORMULA1} dan {FORMULA2}',
                greaterThan: 'Nilai harus tanggal yang valid dan setelah {FORMULA1}',
                greaterThanOrEqual: 'Nilai harus tanggal yang valid dan pada atau setelah {FORMULA1}',
                lessThan: 'Nilai harus tanggal yang valid dan sebelum {FORMULA1}',
                lessThanOrEqual: 'Nilai harus tanggal yang valid dan pada atau sebelum {FORMULA1}',
                equal: 'Nilai harus tanggal yang valid dan {FORMULA1}',
                notEqual: 'Nilai harus tanggal yang valid dan bukan {FORMULA1}',
                notBetween: 'Nilai harus tanggal yang valid dan tidak di antara {FORMULA1} dan {FORMULA2}',
                legal: 'Nilai harus tanggal yang valid',
            },
            title: 'Tanggal',
        },
        textLength: {
            errorMsg: {
                between: 'Panjang teks harus di antara {FORMULA1} dan {FORMULA2}',
                greaterThan: 'Panjang teks harus lebih besar dari {FORMULA1}',
                greaterThanOrEqual: 'Panjang teks harus lebih besar dari atau sama dengan {FORMULA1}',
                lessThan: 'Panjang teks harus lebih kecil dari {FORMULA1}',
                lessThanOrEqual: 'Panjang teks harus lebih kecil dari atau sama dengan {FORMULA1}',
                equal: 'Panjang teks harus {FORMULA1}',
                notEqual: 'Panjang teks harus bukan {FORMULA1}',
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
            listInvalid: 'Sumber daftar harus berupa daftar yang dibatasi atau referensi ke satu baris atau kolom',
            checkboxEqual: 'Masukkan nilai yang berbeda untuk konten sel yang dicentang dan tidak dicentang.',
            formulaError: 'Rentang referensi berisi data yang tidak terlihat, harap sesuaikan ulang rentangnya',
            listIntersects: 'Rentang yang dipilih tidak boleh berpotongan dengan cakupan aturan',
            primitive: 'Rumus tidak diizinkan untuk nilai centang dan tidak centang kustom.',
        },
        any: {
            title: 'Nilai apa saja',
            error: 'Konten sel ini melanggar aturan validasi',
        },
        list: {
            title: 'Daftar pilihan',
            name: 'Nilai berisi satu dari rentang',
            error: 'Masukan harus berada dalam rentang yang ditentukan',
            emptyError: 'Harap masukkan nilai',
            add: 'Tambah',
            dropdown: 'Pilih',
            options: 'Opsi',
            customOptions: 'Kustom',
            refOptions: 'Dari rentang',
            formulaError: 'Sumber daftar harus berupa daftar data yang dibatasi, atau referensi ke satu baris atau kolom.',
            edit: 'Sunting',
        },
        listMultiple: {
            title: 'Daftar pilihan-Multiple',
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
