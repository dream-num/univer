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
    BESSELI: {
        description: 'Mengembalikan fungsi Bessel yang dimodifikasi, yang setara dengan fungsi Bessel yang dievaluasi untuk argumen imajiner murni.',
        abstract: 'Mengembalikan fungsi Bessel yang dimodifikasi, yang setara dengan fungsi Bessel yang dievaluasi untuk argumen imajiner murni.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            n: { name: 'N', detail: 'Diperlukan. Urutan fungsi Bessel. Jika n bukan bilangan bulat, maka dipotong.' },
        },
    },
    BESSELJ: {
        description: 'Mengembalikan fungsi Bessel.',
        abstract: 'Mengembalikan fungsi Bessel.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            n: { name: 'N', detail: 'Diperlukan. Urutan fungsi Bessel. Jika n bukan bilangan bulat, maka dipotong.' },
        },
    },
    BESSELK: {
        description: 'Mengembalikan fungsi Bessel yang dimodifikasi, yang setara dengan fungsi Bessel yang dievaluasi untuk argumen imajiner murni.',
        abstract: 'Mengembalikan fungsi Bessel yang dimodifikasi, yang setara dengan fungsi Bessel yang dievaluasi untuk argumen imajiner murni.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            n: { name: 'N', detail: 'Diperlukan. Urutan fungsi. Jika n bukan bilangan bulat, maka dipotong.' },
        },
    },
    BESSELY: {
        description: 'Mengembalikan fungsi Bessel, yang disebut juga fungsi Weber atau fungsi Neumann.',
        abstract: 'Mengembalikan fungsi Bessel, yang disebut juga fungsi Weber atau fungsi Neumann.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            n: { name: 'N', detail: 'Diperlukan. Urutan fungsi. Jika n bukan bilangan bulat, maka dipotong.' },
        },
    },
    BIN2DEC: {
        description: 'Mengonversi bilangan biner ke desimal.',
        abstract: 'Mengonversi bilangan biner ke desimal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan biner yang ingin Anda konversi. Number tidak dapat berisi lebih dari 10 karakter (10 bit). Bit angka paling signifikan adalah bit tanda. Sisa 9 bit adalah bit besaran. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
        },
    },
    BIN2HEX: {
        description: 'Mengonversi bilangan biner menjadi heksadesimal.',
        abstract: 'Mengonversi bilangan biner menjadi heksadesimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Bilangan biner yang ingin Anda konversi.' },
            places: { name: 'places', detail: 'Jumlah karakter yang akan digunakan.' },
        },
    },
    BIN2OCT: {
        description: 'Mengonversi bilangan biner ke oktal.',
        abstract: 'Mengonversi bilangan biner ke oktal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan biner yang ingin Anda konversi. Number tidak dapat berisi lebih dari 10 karakter (10 bit). Bit angka paling signifikan adalah bit tanda. Sisa 9 bit adalah bit besaran. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
            places: { name: 'places', detail: 'Opsional. Jumlah karakter yang digunakan. Jika places dihilangkan, BIN2OCT menggunakan jumlah minimum karakter yang diperlukan. Places berguna untuk mengisi nilai hasil dengan jarak antar baris 0 (nol).' },
        },
    },
    BITAND: {
        description: 'Mengembalikan sebuah \'AND\' dari dua angka pada tingkat bit.',
        abstract: 'Mengembalikan sebuah \'AND\' dari dua angka pada tingkat bit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Harus dalam bentuk desimal yang lebih besar dari atau sama dengan 0.' },
            number2: { name: 'number2', detail: 'Diperlukan. Harus dalam bentuk desimal yang lebih besar dari atau sama dengan 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Mengembalikan angka yang digeser ke kiri oleh jumlah bit yang ditentukan.',
        abstract: 'Mengembalikan angka yang digeser ke kiri oleh jumlah bit yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka harus berupa bilangan bulat yang lebih besar atau sama dengan 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Diperlukan. Shift_amount harus berupa bilangan bulat.' },
        },
    },
    BITOR: {
        description: 'Mengembalikan sebuah \'OR\' dari dua angka pada tingkat bit.',
        abstract: 'Mengembalikan sebuah \'OR\' dari dua angka pada tingkat bit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Harus dalam bentuk desimal yang lebih besar dari atau sama dengan 0.' },
            number2: { name: 'number2', detail: 'Diperlukan. Harus dalam bentuk desimal yang lebih besar dari atau sama dengan 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Mengembalikan nilai yang digeser ke kanan sebanyak shift_amount bit.',
        abstract: 'Mengembalikan nilai yang digeser ke kanan sebanyak shift_amount bit.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Angka harus berupa bilangan bulat yang lebih besar dari atau sama dengan 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Shift_amount harus berupa bilangan bulat.' },
        },
    },
    BITXOR: {
        description: 'Mengembalikan sebuah \'XOR\' dari dua angka pada tingkat bit.',
        abstract: 'Mengembalikan sebuah \'XOR\' dari dua angka pada tingkat bit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Harus lebih besar dari atau sama dengan 0.' },
            number2: { name: 'number2', detail: 'Diperlukan. Harus lebih besar dari atau sama dengan 0.' },
        },
    },
    COMPLEX: {
        description: 'Mengonversi koefisien riil dan imajiner ke dalam bilangan kompleks dari bentuk x + yi atau x + yj.',
        abstract: 'Mengonversi koefisien riil dan imajiner ke dalam bilangan kompleks dari bentuk x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: 'Diperlukan. Koefisien riil dari bilangan kompleks tersebut.' },
            iNum: { name: 'i_num', detail: 'Diperlukan. Koefisien imajiner dari bilangan kompleks tersebut.' },
            suffix: { name: 'suffix', detail: 'Opsional. Akhiran komponen imajiner dari bilangan kompleks tersebut. Jika dihilangkan, akhiran diasumsikan sebagai "i".' },
        },
    },
    CONVERT: {
        description: 'Mengonversi angka dari satu sistem pengukuran ke sistem lain. Misalnya, CONVERT dapat menerjemahkan tabel jarak dalam mil ke tabel jarak dalam kilometer.',
        abstract: 'Mengonversi angka dari satu sistem pengukuran ke sistem lain. Misalnya, CONVERT dapat menerjemahkan tabel jarak dalam mil ke tabel jarak dalam kilometer.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Nilai dalam from_unit yang akan dikonversi.' },
            fromUnit: { name: 'from_unit', detail: 'Satuan untuk number.' },
            toUnit: { name: 'to_unit', detail: 'Satuan untuk hasil.' },
        },
    },
    DEC2BIN: {
        description: 'Mengonversi bilangan desimal ke biner.',
        abstract: 'Mengonversi bilangan desimal ke biner.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan bulat desimal yang ingin Anda konversi. Jika bilangannya negatif, nilai tempat valid diabaikan dan DEC2BIN mengembalikan bilangan biner 10 karakter (10 bit) yang bit paling signifikan adalah bit tanda. Sisa 9 bit adalah bit besaran. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
            places: { name: 'places', detail: 'Opsional. Jumlah karakter yang digunakan. Jika places dihilangkan, DEC2BIN menggunakan jumlah minimal karakter yang diperlukan. Places berguna untuk mengisi nilai hasil dengan awalan 0 (nol).' },
        },
    },
    DEC2HEX: {
        description: 'Mengonversi bilangan desimal ke heksadesimal.',
        abstract: 'Mengonversi bilangan desimal ke heksadesimal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan bulat desimal yang ingin Anda konversi. Jika angkanya negatif, tempat diabaikan dan DEC2HEX mengembalikan angka heksadesimal 10 karakter (40 bit) yang bit paling signifikan adalah bit tanda. Sisa 39 bit adalah bit besaran. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
            places: { name: 'places', detail: 'Opsional. Jumlah karakter yang digunakan. Jika tempat dihilangkan, DEC2HEX menggunakan jumlah minimal karakter yang diperlukan. Places berguna untuk mengisi nilai hasil dengan awalan 0 (nol).' },
        },
    },
    DEC2OCT: {
        description: 'Mengonversi bilangan desimal ke oktal.',
        abstract: 'Mengonversi bilangan desimal ke oktal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan bulat desimal yang ingin Anda konversi. Jika bilangannya negatif, tempat diabaikan dan DEC2OCT mengembalikan bilangan oktal 10 karakter (30 bit) yang bit paling signifikan adalah bit tanda. Ke-29 bit sisanya adalah bit yang besar. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
            places: { name: 'places', detail: 'Opsional. Jumlah karakter yang digunakan. Jika tempat dihilangkan, DEC2OCT menggunakan jumlah minimal karakter yang diperlukan. Places berguna untuk mengisi nilai hasil dengan awalan 0 (nol).' },
        },
    },
    DELTA: {
        description: 'Menguji apakah dua nilai adalah sama. Mengembalikan 1 jika number1 = number2; jika tidak, mengembalikan 0. Gunakan fungsi ini untuk memfilter sekumpulan nilai. Misalnya, dengan merangkum beberapa fungsi DELTA, Anda menghitung perhitungan pasangan setara. Fungsi ini juga dikenal sebagai fungsi Kronecker Delta.',
        abstract: 'Menguji apakah dua nilai adalah sama. Mengembalikan 1 jika number1 = number2; jika tidak, mengembalikan 0. Gunakan fungsi ini untuk memfilter sekumpulan nilai. Misalnya, dengan merangkum beberapa fungsi DELTA, Anda menghitung perhitungan pasangan setara. Fungsi ini juga dikenal sebagai fungsi Kronecker Delta.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Angka pertama.' },
            number2: { name: 'number2', detail: 'Opsional. Angka kedua. Jika dihilangkan, angka2 diasumsikan sebagai nol.' },
        },
    },
    ERF: {
        description: 'Mengembalikan fungsi kesalahan yang terintegrasi antara lower_limit dan upper_limit.',
        abstract: 'Mengembalikan fungsi kesalahan yang terintegrasi antara lower_limit dan upper_limit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: 'Diperlukan. Batas bawah untuk mengintegrasikan ERF.' },
            upperLimit: { name: 'upper_limit', detail: 'Opsional. Batas atas untuk mengintegrasikan ERF. Jika dihilangkan, ERF berintegrasi antara nol dan lower_limit.' },
        },
    },
    ERF_PRECISE: {
        description: 'Mengembalikan fungsi kesalahan.',
        abstract: 'Mengembalikan fungsi kesalahan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Batas bawah untuk mengintegrasikan ERF.PRECISE.' },
        },
    },
    ERFC: {
        description: 'Mengembalikan fungsi ERF komplementer yang terintegrasi antara x dan tak terhingga.',
        abstract: 'Mengembalikan fungsi ERF komplementer yang terintegrasi antara x dan tak terhingga.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Batas bawah untuk mengintegrasikan ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Mengembalikan fungsi ERF komplementer yang terintegrasi antara x dan tak terhingga.',
        abstract: 'Mengembalikan fungsi ERF komplementer yang terintegrasi antara x dan tak terhingga.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Batas bawah untuk mengintegrasikan ERFC.PRECISE.' },
        },
    },
    GESTEP: {
        description: 'Mengembalikan 1 jika angka ≥ langkah; mengembalikan 0 (zero) jika sebaliknya. Gunakan fungsi ini untuk memfilter sekumpulan nilai. Misalnya, dengan menjumlahkan beberapa fungsi GESTEP, Anda menghitung jumlah nilai yang melebihi ambang batas.',
        abstract: 'Mengembalikan 1 jika angka ≥ langkah; mengembalikan 0 (zero) jika sebaliknya. Gunakan fungsi ini untuk memfilter sekumpulan nilai. Misalnya, dengan menjumlahkan beberapa fungsi GESTEP, Anda menghitung jumlah nilai yang melebihi ambang batas.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai untuk diuji berdasarkan langkah.' },
            step: { name: 'step', detail: 'Opsional. Nilai ambang batas. Jika sebuah nilai untuk angka dihilangkan, GESTEP menggunakan nol.' },
        },
    },
    HEX2BIN: {
        description: 'Mengonversi angka heksadesimal ke biner.',
        abstract: 'Mengonversi angka heksadesimal ke biner.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka heksadesimal yang ingin dikonversi. Angka tidak boleh berisi lebih dari 10 karakter. Bit angka yang paling signifikan adalah sign bit (bit ke-40 dari kanan). Sisa 9 bit adalah bit besaran. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
            places: { name: 'places', detail: 'Opsional. Jumlah karakter yang digunakan. Jika tempat dihilangkan, HEX2BIN menggunakan jumlah minimum karakter yang diperlukan. Tempat berguna untuk mengisi nilai pengembalian dengan jarak antar baris 0 (nol).' },
        },
    },
    HEX2DEC: {
        description: 'Mengonversi angka heksadesimal ke desimal.',
        abstract: 'Mengonversi angka heksadesimal ke desimal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka heksadesimal yang ingin dikonversi. Angka tidak boleh berisi lebih dari 10 karakter (40 bit). Bit angka yang paling penting adalah bit tanda. Sisa 39 bit adalah bit besaran. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
        },
    },
    HEX2OCT: {
        description: 'Mengonversi angka heksadesimal ke oktal.',
        abstract: 'Mengonversi angka heksadesimal ke oktal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka heksadesimal yang ingin dikonversi. Angka tidak boleh berisi lebih dari 10 karakter. Bit angka yang paling penting adalah bit tanda. Sisa 39 bit adalah bit besaran. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
            places: { name: 'places', detail: 'Opsional. Jumlah karakter yang digunakan. Jika tempat dihilangkan, HEX2OCT menggunakan jumlah minimum karakter yang diperlukan. Tempat berguna untuk mengisi nilai pengembalian dengan jarak antar baris 0 (nol).' },
        },
    },
    IMABS: {
        description: 'Mengembalikan nilai mutlak (modulus) bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan nilai mutlak (modulus) bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan nilai mutlaknya.' },
        },
    },
    IMAGINARY: {
        description: 'Mengembalikan koefisien imajiner bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan koefisien imajiner bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan koefisien imajinernya.' },
        },
    },
    IMARGUMENT: {
        description: 'Mengembalikan argumen (theta), sudut yang dinyatakan dalam radian, seperti:',
        abstract: 'Mengembalikan argumen (theta), sudut yang dinyatakan dalam radian, seperti:',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang Anda inginkan untuk argumen .' },
        },
    },
    IMCONJUGATE: {
        description: 'Mengembalikan konjugasi kompleks bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan konjugasi kompleks bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang Anda inginkan konjugasinya.' },
        },
    },
    IMCOS: {
        description: 'Mengembalikan kosinus bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan kosinus bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang Anda inginkan kosinusnya.' },
        },
    },
    IMCOSH: {
        description: 'Mengembalikan kosinus hiperbolik bilangan kompleks dalam format teks x+yi atau x+yj.',
        abstract: 'Mengembalikan kosinus hiperbolik bilangan kompleks dalam format teks x+yi atau x+yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang Anda inginkan kosinus hiperboliknya.' },
        },
    },
    IMCOT: {
        description: 'Mengembalikan kotangen bilangan kompleks dalam format teks x+yi atau x+yj.',
        abstract: 'Mengembalikan kotangen bilangan kompleks dalam format teks x+yi atau x+yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Bilangan kompleks yang ingin Anda cari kotangennya.' },
        },
    },
    IMCOTH: {
        description: 'Fungsi IMCOTH mengembalikan kotangen hiperbolik dari bilangan kompleks yang diberikan. Misalnya, untuk bilangan kompleks "x+yi", fungsi ini mengembalikan "coth(x+yi)".',
        abstract: 'Fungsi IMCOTH mengembalikan kotangen hiperbolik dari bilangan kompleks yang diberikan. Misalnya, untuk bilangan kompleks "x+yi", fungsi ini mengembalikan "coth(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=id',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Bilangan kompleks yang ingin Anda cari kotangen hiperboliknya. Nilai ini dapat berupa hasil fungsi COMPLEX, bilangan riil yang ditafsirkan sebagai bilangan kompleks dengan bagian imajiner 0, atau teks berformat “x+yi”, dengan x dan y berupa angka.' },
        },
    },
    IMCSC: {
        description: 'Mengembalikan kosekan bilangan kompleks dalam format teks x+yi atau x+yj.',
        abstract: 'Mengembalikan kosekan bilangan kompleks dalam format teks x+yi atau x+yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang Anda inginkan kosekannya.' },
        },
    },
    IMCSCH: {
        description: 'Mengembalikan kosekan hiperbolik dari bilangan kompleks dalam format teks x+yi atau x+yj.',
        abstract: 'Mengembalikan kosekan hiperbolik dari bilangan kompleks dalam format teks x+yi atau x+yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan kosekan hiperboliknya.' },
        },
    },
    IMDIV: {
        description: 'Mengembalikan hasil bagi dua bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan hasil bagi dua bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Diperlukan. Pembilang kompleks atau dividen.' },
            inumber2: { name: 'inumber2', detail: 'Diperlukan. Penyebut kompleks atau pembagi.' },
        },
    },
    IMEXP: {
        description: 'Mengembalikan eksponensial bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan eksponensial bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang Anda inginkan ekponensialnya.' },
        },
    },
    IMLN: {
        description: 'Mengembalikan logaritma natural bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan logaritma natural bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan logaritma naturalnya.' },
        },
    },
    IMLOG: {
        description: 'Fungsi IMLOG mengembalikan logaritma bilangan kompleks untuk basis yang ditentukan.',
        abstract: 'Fungsi IMLOG mengembalikan logaritma bilangan kompleks untuk basis yang ditentukan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=id',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Nilai masukan fungsi logaritma. Angka dapat ditulis sebagai angka biasa, misalnya 1, untuk ditafsirkan sebagai bilangan riil, atau sebagai teks dalam tanda kutip untuk menentukan koefisien riil dan imajiner.' },
            base: { name: 'base', detail: 'Basis yang digunakan untuk menghitung logaritma. Harus berupa bilangan riil positif.' },
        },
    },
    IMLOG10: {
        description: 'Mengembalikan logaritma umum (dasar 10) bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan logaritma umum (dasar 10) bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan logaritma umumnya.' },
        },
    },
    IMLOG2: {
        description: 'Mengembalikan logaritma basis 2 dari sebuah bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan logaritma basis 2 dari sebuah bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan logaritma basis 2-nya.' },
        },
    },
    IMPOWER: {
        description: 'Mengembalikan bilangan kompleks dalam format teks x + yi atau x + yj yang dinaikkan menjadi pangkat.',
        abstract: 'Mengembalikan bilangan kompleks dalam format teks x + yi atau x + yj yang dinaikkan menjadi pangkat.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda jadikan pangkat.' },
            number: { name: 'number', detail: 'Diperlukan. Angka yang ingin Anda pangkatkan ke bilangan kompleks.' },
        },
    },
    IMPRODUCT: {
        description: 'Mengembalikan hasil kali bilangan kompleks dari 1 sampai 255 dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan hasil kali bilangan kompleks dari 1 sampai 255 dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: '1 hingga 255 bilangan kompleks yang akan dikalikan.' },
            inumber2: { name: 'inumber2', detail: 'Bilangan kompleks berikutnya yang akan dikalikan.' },
        },
    },
    IMREAL: {
        description: 'Mengembalikan koefisien riil bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan koefisien riil bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan koefisien riilnya.' },
        },
    },
    IMSEC: {
        description: 'Mengembalikan sekan bilangan kompleks dalam format teks x+yi atau x+yj.',
        abstract: 'Mengembalikan sekan bilangan kompleks dalam format teks x+yi atau x+yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan sekannya.' },
        },
    },
    IMSECH: {
        description: 'Mengembalikan sekan hiperbolik bilangan kompleks dalam format teks x+yi atau x+yj.',
        abstract: 'Mengembalikan sekan hiperbolik bilangan kompleks dalam format teks x+yi atau x+yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan sekan hiperboliknya.' },
        },
    },
    IMSIN: {
        description: 'Mengembalikan sinus dari bilangan kompleks.',
        abstract: 'Mengembalikan sinus dari bilangan kompleks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Bilangan kompleks yang ingin Anda cari sinusnya.' },
        },
    },
    IMSINH: {
        description: 'Mengembalikan sinus hiperbolik dari bilangan kompleks.',
        abstract: 'Mengembalikan sinus hiperbolik dari bilangan kompleks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Bilangan kompleks yang ingin Anda cari sinus hiperboliknya.' },
        },
    },
    IMSQRT: {
        description: 'Mengembalikan akar kuadrat dari bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan akar kuadrat dari bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan akar kuadratnya.' },
        },
    },
    IMSUB: {
        description: 'Mengembalikan selisih dari dua bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan selisih dari dua bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda kurangi dengan inumber2.' },
            inumber2: { name: 'inumber2', detail: 'Diperlukan. Bilangan kompleks untuk mengurangi inumber1.' },
        },
    },
    IMSUM: {
        description: 'Mengembalikan jumlah dari dua bilangan kompleks dalam format teks x + yi atau x + yj.',
        abstract: 'Mengembalikan jumlah dari dua bilangan kompleks dalam format teks x + yi atau x + yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: '1 hingga 255 bilangan kompleks yang akan dijumlahkan.' },
            inumber2: { name: 'inumber2', detail: 'Bilangan kompleks berikutnya yang akan dijumlahkan.' },
        },
    },
    IMTAN: {
        description: 'Mengembalikan tangen bilangan kompleks dalam format teks x+yi atau x+yj.',
        abstract: 'Mengembalikan tangen bilangan kompleks dalam format teks x+yi atau x+yj.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Diperlukan. Bilangan kompleks yang ingin Anda dapatkan tangennya.' },
        },
    },
    IMTANH: {
        description: 'Fungsi IMTANH mengembalikan tangen hiperbolik dari bilangan kompleks yang diberikan. Misalnya, untuk bilangan kompleks "x+yi", fungsi ini mengembalikan "tanh(x+yi)".',
        abstract: 'Fungsi IMTANH mengembalikan tangen hiperbolik dari bilangan kompleks yang diberikan. Misalnya, untuk bilangan kompleks "x+yi", fungsi ini mengembalikan "tanh(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=id',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Bilangan kompleks yang ingin Anda cari tangen hiperboliknya. Nilai ini dapat berupa hasil fungsi COMPLEX, bilangan riil yang ditafsirkan sebagai bilangan kompleks dengan bagian imajiner 0, atau teks berformat “x+yi”, dengan x dan y berupa angka.' },
        },
    },
    OCT2BIN: {
        description: 'Mengonversi angka oktal ke biner.',
        abstract: 'Mengonversi angka oktal ke biner.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka oktal yang ingin Anda konversikan. Angka tidak boleh berisi lebih dari 10 karakter. Bit angka paling signifikan adalah bit tanda. Ke-29 bit sisanya adalah bit yang besar. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
            places: { name: 'places', detail: 'Opsional. Jumlah karakter yang digunakan. Jika places dihilangkan, OCT2BIN menggunakan jumlah minimum karakter yang diperlukan. Places berguna untuk mengisi nilai hasil dengan awalan 0 (nol).' },
        },
    },
    OCT2DEC: {
        description: 'Mengonversi angka oktal ke desimal.',
        abstract: 'Mengonversi angka oktal ke desimal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka oktal yang ingin Anda konversikan. Angka tidak boleh berisi lebih dari 10 karakter oktal (30 bit). Bit angka paling signifikan adalah bit tanda. Ke-29 bit sisanya adalah bit yang besar. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
        },
    },
    OCT2HEX: {
        description: 'Mengonversi angka oktal ke heksadesimal.',
        abstract: 'Mengonversi angka oktal ke heksadesimal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka oktal yang ingin Anda konversikan. Angka tidak boleh berisi lebih dari 10 karakter oktal (30 bit). Bit angka paling signifikan adalah bit tanda. Ke-29 bit sisanya adalah bit yang besar. Angka negatif dinyatakan dengan menggunakan notasi dua pelengkap.' },
            places: { name: 'places', detail: 'Opsional. Jumlah karakter yang digunakan. Jika tempat dikosongkan, OCT2HEX menggunakan jumlah minimum karakter yang diperlukan. Places berguna untuk mengisi nilai hasil dengan awalan 0 (nol).' },
        },
    },
};

export default locale;
