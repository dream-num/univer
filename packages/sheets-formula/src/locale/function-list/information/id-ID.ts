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
    CELL: {
        description: 'Fungsi CELL mengembalikan informasi tentang pemformatan, lokasi, atau konten sel. Misalnya, jika ingin melakukan verifikasi bahwa sebuah sel berisi nilai numerik dan bukan teks sebelum Anda melakukan kalkulasi, gunakan rumus berikut:',
        abstract: 'Fungsi CELL mengembalikan informasi tentang pemformatan, lokasi, atau konten sel. Misalnya, jika ingin melakukan verifikasi bahwa sebuah sel berisi nilai numerik dan bukan teks sebelum Anda melakukan kalkulasi, gunakan rumus berikut:',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'info_type', detail: 'Nilai teks yang menentukan tipe informasi sel apa yang ingin Anda hasilkan. Daftar berikut menampilkan kemungkinan nilai argumen Info_type dan hasil-hasil terkait.' },
            reference: { name: 'reference', detail: 'Sel yang Anda inginkan informasinya. Jika dihilangkan, informasi yang ditentukan dalam argumen info_type dikembalikan untuk sel yang dipilih pada saat penghitungan. Jika argumen referensi adalah rentang sel, fungsi CELL mengembalikan informasi untuk sel aktif dalam rentang yang dipilih. Penting: Meskipun referensi teknis bersifat opsional, termasuk referensi dalam rumus Anda didorong, kecuali Anda memahami efek ketidakhadirannya pada hasil rumus Anda dan menginginkan efek tersebut di tempatnya. Menghilangkan argumen referensi tidak menghasilkan informasi tentang sel tertentu dengan andal, karena alasan berikut: Dalam mode penghitungan otomatis, ketika sel diubah oleh pengguna, penghitungan mungkin dipicu sebelum atau setelah pemilihan berlangsung, tergantung pada platform yang Anda gunakan untuk Excel. Misalnya, Excel untuk Windows saat ini memicu penghitungan sebelum perubahan pilihan, tetapi Excel untuk web memicunya sesudahnya. Ketika Co-Authoring dengan pengguna lain yang melakukan pengeditan, fungsi ini akan melaporkan sel aktif Anda daripada editor. Perhitungan ulang apa pun, misalnya menekan F9, akan menyebabkan fungsi mengembalikan hasil baru meskipun tidak ada pengeditan sel yang terjadi.' },
        },
    },
    ERROR_TYPE: {
        description: 'Mengembalikan angka yang terkait ke salah satu nilai kesalahan dalam Microsoft Excel atau akan mengembalikan kesalahan #N/A jika tidak ada kesalahan. Anda dapat menggunakan ERROR.TYPE dalam fungsi IF untuk menguji nilai kesalahan dan mengembalikan string teks, seperti pesan, bukan nilai kesalahan.',
        abstract: 'Mengembalikan angka yang terkait ke salah satu nilai kesalahan dalam Microsoft Excel atau akan mengembalikan kesalahan #N/A jika tidak ada kesalahan. Anda dapat menggunakan ERROR.TYPE dalam fungsi IF untuk menguji nilai kesalahan dan mengembalikan string teks, seperti pesan, bukan nilai kesalahan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'error_val', detail: 'Diperlukan. Nilai kesalahan yang angka pengidentifikasinya ingin Anda temukan. Meskipun error_val dapat menjadi nilai kesalahan aktual, biasanya nilai kesalahan itu akan menjadi referensi ke sel berisi rumus yang ingin Anda uji.' },
        },
    },
    INFO: {
        description: 'Mengembalikan informasi tentang lingkungan operasi saat ini.',
        abstract: 'Mengembalikan informasi tentang lingkungan operasi saat ini.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Type_text', detail: 'Diperlukan. Teks yang menentukan tipe informasi apa yang Anda inginkan dikembalikan.' },
        },
    },
    ISBETWEEN: {
        description: 'Memeriksa apakah angka yang diberikan berada di antara dua angka lain, secara inklusif atau eksklusif.',
        abstract: 'Memeriksa apakah angka yang diberikan berada di antara dua angka lain, secara inklusif atau eksklusif.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10538337?hl=id',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: 'Nilai yang diuji apakah berada di antara `lower_value` dan `upper_value`.' },
            lowerValue: { name: 'lower_value', detail: 'Batas bawah rentang nilai yang dapat memuat `value_to_compare`.' },
            upperValue: { name: 'upper_value', detail: 'Batas atas rentang nilai yang dapat memuat `value_to_compare`.' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: 'Menentukan apakah rentang nilai mencakup `lower_value`. Secara default bernilai TRUE.' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: 'Menentukan apakah rentang nilai mencakup `upper_value`. Secara default bernilai TRUE.' },
        },
    },
    ISBLANK: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISDATE: {
        description: 'Fungsi ISDATE mengembalikan apakah suatu nilai adalah tanggal.',
        abstract: 'Fungsi ISDATE mengembalikan apakah suatu nilai adalah tanggal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9061381?hl=id',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Nilai yang akan diverifikasi sebagai tanggal.' },
        },
    },
    ISEMAIL: {
        description: 'Fungsi ISEMAIL memeriksa apakah suatu nilai merupakan alamat email yang valid. Fungsi ini memeriksa apakah nilai mengikuti format alamat email yang umum diterima, tetapi tidak memverifikasi keberadaannya.',
        abstract: 'Fungsi ISEMAIL memeriksa apakah suatu nilai merupakan alamat email yang valid. Fungsi ini memeriksa apakah nilai mengikuti format alamat email yang umum diterima, tetapi tidak memverifikasi keberadaannya.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256503?hl=id',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Nilai yang akan diverifikasi sebagai alamat email.' },
        },
    },
    ISERR: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISERROR: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISEVEN: {
        description: 'Mengembalikan TRUE jika bilangannya genap, atau FALSE jika bilangannya ganjil.',
        abstract: 'Mengembalikan TRUE jika bilangannya genap, atau FALSE jika bilangannya ganjil.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai untuk menguji. Jika bilangannya bukan bilangan bulat, maka bilangan tersebut dipotong.' },
        },
    },
    ISFORMULA: {
        description: 'Memeriksa apakah ada referensi ke sel yang berisi rumus, dan mengembalikan TRUE atau FALSE.',
        abstract: 'Memeriksa apakah ada referensi ke sel yang berisi rumus, dan mengembalikan TRUE atau FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Diperlukan. Reference adalah referensi ke sel yang ingin Anda uji. Referensi dapat berupa referensi sel, rumus, atau nama yang merujuk pada suatu sel.' },
        },
    },
    ISLOGICAL: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISNA: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISNONTEXT: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISNUMBER: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISODD: {
        description: 'Mengembalikan TRUE jika bilangannya ganjil, atau FALSE jika bilangannya genap.',
        abstract: 'Mengembalikan TRUE jika bilangannya ganjil, atau FALSE jika bilangannya genap.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai untuk menguji. Jika bilangan bukan bilangan bulat, maka bilangan tersebut dipotong.' },
        },
    },
    ISOMITTED: {
        description: 'Memeriksa apakah nilai dalam LAMBDA hilang dan mengembalikan TRUE atau FALSE.',
        abstract: 'Memeriksa apakah nilai dalam LAMBDA hilang dan mengembalikan TRUE atau FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Argumen', detail: 'Nilai yang ingin Anda uji, seperti parameter LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISTEXT: {
        description: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        abstract: 'Masing-masing fungsi ini, secara kolektif disebut fungsi IS , memeriksa nilai tertentu dan mengembalikan TRUE atau FALSE bergantung pada hasilnya. Misalnya, fungsi ISBLANK mengembalikan nilai logika TRUE jika argumen nilainya merupakan referensi ke sel kosong; jika tidak maka fungsi ini mengembalikan FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji. Argumen nilai dapat berupa kesalahan, nilai logika, teks, angka, atau nilai referensi kosong (sel kosong), atau nama yang merujuk ke salah satu dari ini.' },
        },
    },
    ISURL: {
        description: 'Memeriksa apakah suatu nilai adalah URL yang valid.',
        abstract: 'Memeriksa apakah suatu nilai adalah URL yang valid.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256501?hl=id',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Nilai yang akan diverifikasi sebagai URL.' },
        },
    },
    N: {
        description: 'Mengembalikan nilai yang dikonversikan menjadi angka.',
        abstract: 'Mengembalikan nilai yang dikonversikan menjadi angka.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda konversikan. N mengonversikan nilai yang terdapat dalam tabel berikut ini.' },
        },
    },
    NA: {
        description: 'Mengembalikan nilai kesalahan #N/A. #N/A adalah nilai kesalahan yang berarti "tidak ada nilai yang tersedia." Gunakan NA untuk menandai sel kosong. Dengan memasukkan #N/A di sel tempat Anda kehilangan informasi, Anda bisa menghindari masalah tanpa sengaja menyertakan sel kosong dalam perhitungan Anda. (Saat rumus merujuk ke sel yang berisi #N/A, rumus mengembalikan nilai kesalahan #N/A.)',
        abstract: 'Mengembalikan nilai kesalahan #N/A. #N/A adalah nilai kesalahan yang berarti "tidak ada nilai yang tersedia." Gunakan NA untuk menandai sel kosong. Dengan memasukkan #N/A di sel tempat Anda kehilangan informasi, Anda bisa menghindari masalah tanpa sengaja menyertakan sel kosong dalam perhitungan Anda. (Saat rumus merujuk ke sel yang berisi #N/A, rumus mengembalikan nilai kesalahan #N/A.)',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'Fungsi SHEET mengembalikan nomor lembar lembar atau referensi lain yang ditentukan.',
        abstract: 'Fungsi SHEET mengembalikan nomor lembar lembar atau referensi lain yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argumen opsional. Gunakan ini untuk menentukan nama lembar atau referensi yang ingin Anda dapatkan nomor lembarnya. Jika tidak, fungsi akan mengembalikan jumlah lembar yang berisi fungsi SHEET.' },
        },
    },
    SHEETS: {
        description: 'Mengembalikan jumlah lembar dalam sebuah referensi.',
        abstract: 'Mengembalikan jumlah lembar dalam sebuah referensi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Mengembalikan tipe nilai. Gunakan TYPE saat perilaku fungsi lain bergantung pada tipe nilai di sel tertentu.',
        abstract: 'Mengembalikan tipe nilai. Gunakan TYPE saat perilaku fungsi lain bergantung pada tipe nilai di sel tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Bisa berupa nilai Microsoft Excel apa pun, seperti angka, teks, nilai logika, dan lain-lain.' },
        },
    },
};

export default locale;
