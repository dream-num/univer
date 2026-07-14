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
    ABS: {
        description: 'Mengembalikan nilai absolut dari suatu angka. Nilai mutlak suatu angka adalah angka tanpa tanda.',
        abstract: 'Mengembalikan nilai absolut dari suatu angka. Nilai mutlak suatu angka adalah angka tanpa tanda.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan riil yang Anda inginkan nilai mutlaknya.' },
        },
    },
    ACOS: {
        description: 'Mengembalikan arka kosinus, atau kosinus inversi, dari suatu angka. Arka kosinus adalah sudut yang kosinusnya adalah angka . Sudut yang dikembalikan diberikan dalam satuan radian dalam rentang 0 (nol) hingga pi.',
        abstract: 'Mengembalikan arka kosinus, atau kosinus inversi, dari suatu angka. Arka kosinus adalah sudut yang kosinusnya adalah angka . Sudut yang dikembalikan diberikan dalam satuan radian dalam rentang 0 (nol) hingga pi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Kosinus sudut yang Anda inginkan dan harus bernilai mulai -1 sampai 1.' },
        },
    },
    ACOSH: {
        description: 'Mengembalikan nilai inversi kosinus hiperbolik dari bilangan. Bilangan harus lebih besar dari atau sama dengan 1. Nilai inversi kosinus hiperbolik adalah nilai dengan kosinus hiperbolik berupa bilangan , sehingga ACOSH(COSH(bilangan)) sama dengan bilangan .',
        abstract: 'Mengembalikan nilai inversi kosinus hiperbolik dari bilangan. Bilangan harus lebih besar dari atau sama dengan 1. Nilai inversi kosinus hiperbolik adalah nilai dengan kosinus hiperbolik berupa bilangan , sehingga ACOSH(COSH(bilangan)) sama dengan bilangan .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan riil sama dengan atau lebih dari 1.' },
        },
    },
    ACOT: {
        description: 'Mengembalikan nilai utama arka kotangen, atau balikan kotangen dari suatu angka.',
        abstract: 'Mengembalikan nilai utama arka kotangen, atau balikan kotangen dari suatu angka.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka adalah kotangen dari sudut yang Anda inginkan. Nilai ini harus berupa bilangan riil.' },
        },
    },
    ACOTH: {
        description: 'Mengembalikan kotangen hiperbolik balikan dari suatu angka.',
        abstract: 'Mengembalikan kotangen hiperbolik balikan dari suatu angka.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Nilai absolut angka harus lebih besar dari 1.' },
        },
    },
    AGGREGATE: {
        description: 'Mengembalikan agregat dalam daftar atau database. Fungsi AGGREGATE dapat menerapkan fungsi-fungsi agregat lain ke daftar atau database dengan opsi untuk mengabaikan baris tersembunyi dan nilai kesalahan.',
        abstract: 'Mengembalikan agregat dalam daftar atau database. Fungsi AGGREGATE dapat menerapkan fungsi-fungsi agregat lain ke daftar atau database dengan opsi untuk mengabaikan baris tersembunyi dan nilai kesalahan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Diperlukan. Angka 1 sampai 19 yang menentukan fungsi yang akan digunakan.' },
            options: { name: 'options', detail: 'Diperlukan. Nilai numerik yang menetapkan nilai yang akan diabaikan dalam rentang evaluasi bagi fungsi tersebut. Catatan Fungsi tidak akan mengabaikan baris tersembunyi, subtotal bertumpuk, atau agregat bertumpuk jika argumen array menyertakan penghitungan, misalnya: =AGGREGATE(14,3,A1:A100*(A1:A100>0),1)' },
            ref1: { name: 'ref1', detail: 'Diperlukan. Argumen numerik pertama untuk fungsi-fungsi yang mengambil beberapa argumen numerik yang Anda inginkan nilai agregatnya.' },
            ref2: { name: 'ref2', detail: 'Opsional. Argumen numerik 2 sampai 253 yang Anda inginkan nilai agregatnya. Untuk fungsi-fungsi yang mengambil array, ref1 adalah array, rumus array, atau referensi ke rentang sel yang Anda inginkan nilai agregatnya. Ref2 adalah argumen kedua yang diperlukan bagi fungsi-fungsi tertentu. Fungsi-fungsi berikut memerlukan argumen ref2:' },
        },
    },
    ARABIC: {
        description: 'Mengonversi angka Romawi ke angka Arab.',
        abstract: 'Mengonversi angka Romawi ke angka Arab.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. String yang dimasukkan dalam tanda kutip, string kosong (""), atau referensi ke sel berisi teks.' },
        },
    },
    ASIN: {
        description: 'Mengembalikan arka sinus, atau nilai inversi sinus, dari bilangan. Arka sinus adalah sudut yang sinusnya adalah angka . Sudut yang dikembalikan diberikan dalam satuan radian dalam rentang -pi/2 sampai pi/2.',
        abstract: 'Mengembalikan arka sinus, atau nilai inversi sinus, dari bilangan. Arka sinus adalah sudut yang sinusnya adalah angka . Sudut yang dikembalikan diberikan dalam satuan radian dalam rentang -pi/2 sampai pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Sinus sudut yang Anda inginkan dan harus bernilai mulai -1 sampai 1.' },
        },
    },
    ASINH: {
        description: 'Mengembalikan nilai inversi sinus hiperbolik bilangan. Nilai inversi sinus hiperbolik adalah nilai yang sinus hiperboliknya berupa angka , sehingga ASINH(SINH(angka)) sama dengan angka .',
        abstract: 'Mengembalikan nilai inversi sinus hiperbolik bilangan. Nilai inversi sinus hiperbolik adalah nilai yang sinus hiperboliknya berupa angka , sehingga ASINH(SINH(angka)) sama dengan angka .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Setiap bilangan riil.' },
        },
    },
    ATAN: {
        description: 'Mengembalikan arka tangen, atau inversi tangen dari sebuah bilangan. Arka tangen adalah sudut yang tangennya adalah angka . Sudut yang dikembalikan diberikan dalam radian dalam rentang -pi/2 sampai pi/2.',
        abstract: 'Mengembalikan arka tangen, atau inversi tangen dari sebuah bilangan. Arka tangen adalah sudut yang tangennya adalah angka . Sudut yang dikembalikan diberikan dalam radian dalam rentang -pi/2 sampai pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Tangen dari sudut yang Anda inginkan.' },
        },
    },
    ATAN2: {
        description: 'Mengembalikan arka tangen, atau inversi tangen, dari koordinat x dan y yang ditentukan. Arka tangen adalah sudut dari sumbu-x ke garis yang berisi asal (0,0) dan titik dengan koordinat (angka_x, angka_y). Sudut diberikan dalam radian antara -pi dan pi, tidak termasuk -pi.',
        abstract: 'Mengembalikan arka tangen, atau inversi tangen, dari koordinat x dan y yang ditentukan. Arka tangen adalah sudut dari sumbu-x ke garis yang berisi asal (0,0) dan titik dengan koordinat (angka_x, angka_y). Sudut diberikan dalam radian antara -pi dan pi, tidak termasuk -pi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: 'Diperlukan. Koordinat x titik tersebut.' },
            yNum: { name: 'y_num', detail: 'Diperlukan. Koordinat y titik tersebut.' },
        },
    },
    ATANH: {
        description: 'Mengembalikan inversi tangen hiperbolik dari bilangan. Angka harus bernilai antara -1 dan 1 (tidak termasuk -1 dan 1). Inversi tangen hiperbolik adalah nilai yang tangen hiperboliknya berupa angka , sehingga ATANH(TANH(angka)) sama dengan angka .',
        abstract: 'Mengembalikan inversi tangen hiperbolik dari bilangan. Angka harus bernilai antara -1 dan 1 (tidak termasuk -1 dan 1). Inversi tangen hiperbolik adalah nilai yang tangen hiperboliknya berupa angka , sehingga ATANH(TANH(angka)) sama dengan angka .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan riil berapa pun antara 1 dan -1.' },
        },
    },
    BASE: {
        description: 'Mengonversi angka menjadi representasi teks beserta bilangan pokoknya (basis).',
        abstract: 'Mengonversi angka menjadi representasi teks beserta bilangan pokoknya (basis).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan yang ingin Anda konversi. Harus berupa bilangan bulat yang lebih besar dari atau sama dengan 0 dan kurang dari 2^53.' },
            radix: { name: 'radix', detail: 'Diperlukan. Bilangan pokok basis yang merupakan hasil konversi bilangan. Harus berupa bilangan bulat yang lebih besar dari atau sama dengan 2 dan kurang dari atau sama dengan 36.' },
            minLength: { name: 'min_length', detail: 'Opsional. Panjang minimum string yang dikembalikan. Harus berupa bilangan bulat yang lebih besar dari atau sama dengan 0.' },
        },
    },
    CEILING: {
        description: 'Mengembalikan angka yang dibulatkan ke atas, menjauh dari nol, ke kelipatan signifikansi terdekat. Misalnya, jika Anda ingin menghindari penggunaan sen dalam harga Anda dan produk Anda dihargai $4,42, gunakan rumus =CEILING(4.42,0.05) untuk membulatkan harga ke atas ke nikel terdekat.',
        abstract: 'Mengembalikan angka yang dibulatkan ke atas, menjauh dari nol, ke kelipatan signifikansi terdekat. Misalnya, jika Anda ingin menghindari penggunaan sen dalam harga Anda dan produk Anda dihargai $4,42, gunakan rumus =CEILING(4.42,0.05) untuk membulatkan harga ke atas ke nikel terdekat.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai yang ingin Anda bulatkan.' },
            significance: { name: 'significance', detail: 'Diperlukan. Kelipatan yang menjadi tujuan pembulatan.' },
        },
    },
    CEILING_MATH: {
        description: 'LANGIT-LANGIT. Fungsi MATH membulatkan angka ke atas ke bilangan bulat terdekat atau, secara opsional, ke kelipatan signifikansi terdekat.',
        abstract: 'LANGIT-LANGIT. Fungsi MATH membulatkan angka ke atas ke bilangan bulat terdekat atau, secara opsional, ke kelipatan signifikansi terdekat.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. (harus antara -2,229E-308.dan 9.99E+307.)' },
            significance: { name: 'significance', detail: 'Opsional. Ini adalah jumlah digit signifikan setelah koma desimal di mana angka akan dibulatkan.' },
            mode: { name: 'mode', detail: 'Opsional. Ini mengontrol apakah angka negatif dibulatkan ke arah atau menjauh dari nol.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Mengembalikan angka yang dibulatkan ke atas ke bilangan bulat terdekat atau ke kelipatan signifikansi terdekat. Tanpa memperhatikan lambang angkanya, bilangan itu dibulatkan ke atas. Akan tetapi, jika angka signifikansinya nol, maka hasilnya nol.',
        abstract: 'Mengembalikan angka yang dibulatkan ke atas ke bilangan bulat terdekat atau ke kelipatan signifikansi terdekat. Tanpa memperhatikan lambang angkanya, bilangan itu dibulatkan ke atas. Akan tetapi, jika angka signifikansinya nol, maka hasilnya nol.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai yang akan dibulatkan.' },
            significance: { name: 'significance', detail: 'Opsional. Kelipatan yang menjadi tujuan pembulatan number. Jika signifikansi dikosongkan, maka nilai default adalah 1.' },
        },
    },
    COMBIN: {
        description: 'Mengembalikan jumlah kombinasi untuk jumlah item tertentu. Gunakan COMBIN untuk menentukan total jumlah grup yang memungkinkan untuk jumlah item tertentu.',
        abstract: 'Mengembalikan jumlah kombinasi untuk jumlah item tertentu. Gunakan COMBIN untuk menentukan total jumlah grup yang memungkinkan untuk jumlah item tertentu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Jumlah item.' },
            numberChosen: { name: 'number_chosen', detail: 'Diperlukan. Jumlah item dalam setiap kombinasi.' },
        },
    },
    COMBINA: {
        description: 'Mengembalikan jumlah kombinasi (dengan perulangan) untuk sejumlah item tertentu.',
        abstract: 'Mengembalikan jumlah kombinasi (dengan perulangan) untuk sejumlah item tertentu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Harus lebih besar atau sama dengan 0, dan lebih besar atau sama dengan Number_chosen. Nilai yang bukan bilangan bulat dipotong.' },
            numberChosen: { name: 'number_chosen', detail: 'Diperlukan. Harus lebih besar dari atau sama dengan 0. Nilai yang bukan bilangan bulat dipotong.' },
        },
    },
    COS: {
        description: 'Mengembalikan kosinus dari sudut tertentu.',
        abstract: 'Mengembalikan kosinus dari sudut tertentu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Sudut dalam radian yang Anda inginkan kosinusnya.' },
        },
    },
    COSH: {
        description: 'Mengembalikan kosinus hiperbolik dari suatu angka.',
        abstract: 'Mengembalikan kosinus hiperbolik dari suatu angka.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Setiap bilangan riil yang ingin Anda temukan kosinus hiperboliknya.' },
        },
    },
    COT: {
        description: 'Mengembalikan kotangen sebuah sudut yang ditentukan dalam radian.',
        abstract: 'Mengembalikan kotangen sebuah sudut yang ditentukan dalam radian.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Sudut dalam radian yang Anda inginkan untuk kotangen.' },
        },
    },
    COTH: {
        description: 'Mengembalikan kotangen hiperbolik dari sudut hiperbolik.',
        abstract: 'Mengembalikan kotangen hiperbolik dari sudut hiperbolik.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan.' },
        },
    },
    CSC: {
        description: 'Mengembalikan kosekan sebuah sudut yang ditentukan dalam radian.',
        abstract: 'Mengembalikan kosekan sebuah sudut yang ditentukan dalam radian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan.' },
        },
    },
    CSCH: {
        description: 'Mengembalikan kosekan hiperbolik sebuah sudut yang ditentukan dalam radian.',
        abstract: 'Mengembalikan kosekan hiperbolik sebuah sudut yang ditentukan dalam radian.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan.' },
        },
    },
    DECIMAL: {
        description: 'Mengonversi representasi teks dari sebuah basis tertentu ke dalam bilangan desimal.',
        abstract: 'Mengonversi representasi teks dari sebuah basis tertentu ke dalam bilangan desimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan.' },
            radix: { name: 'radix', detail: 'Diperlukan. Bilangan pokok harus berupa bilangan bulat.' },
        },
    },
    DEGREES: {
        description: 'Mengonversi radian ke dalam derajat.',
        abstract: 'Mengonversi radian ke dalam derajat.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Diperlukan. Sudut dalam radian yang ingin Anda konversi.' },
        },
    },
    EVEN: {
        description: 'Mengembalikan angka yang dibulatkan ke atas ke bilangan bulat genap terdekat. Anda dapat menggunakan fungsi ini untuk memproses item yang disusun dua-dua. Misalnya, peti kemas dari kayu menampung satu atau dua baris item. Peti tersebut penuh ketika jumlah item, yang dibulatkan ke kelipatan dua terdekat, sesuai dengan kapasitas peti.',
        abstract: 'Mengembalikan angka yang dibulatkan ke atas ke bilangan bulat genap terdekat. Anda dapat menggunakan fungsi ini untuk memproses item yang disusun dua-dua. Misalnya, peti kemas dari kayu menampung satu atau dua baris item. Peti tersebut penuh ketika jumlah item, yang dibulatkan ke kelipatan dua terdekat, sesuai dengan kapasitas peti.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai yang akan dibulatkan.' },
        },
    },
    EXP: {
        description: 'Mengembalikan e yang dinaikkan ke pangkat angka. Konstanta e sama dengan 2,71828182845904, bilangan dasar logaritma natural.',
        abstract: 'Mengembalikan e yang dinaikkan ke pangkat angka. Konstanta e sama dengan 2,71828182845904, bilangan dasar logaritma natural.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Pangkat yang diterapkan ke bilangan dasar e.' },
        },
    },
    FACT: {
        description: 'Mengembalikan faktorial dari suatu angka. Faktorial suatu angka sama dengan 1*2*3*...* angka.',
        abstract: 'Mengembalikan faktorial dari suatu angka. Faktorial suatu angka sama dengan 1*2*3*...* angka.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka nonnegatif yang Anda inginkan faktorialnya. Jika angka bukan bilangan bulat, maka dipotong.' },
        },
    },
    FACTDOUBLE: {
        description: 'Mengembalikan faktorial ganda dari suatu angka.',
        abstract: 'Mengembalikan faktorial ganda dari suatu angka.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai untuk mengembalikan faktorial ganda. Jika angka bukan bilangan bulat, maka dipotong.' },
        },
    },
    FLOOR: {
        description: 'Fungsi FLOOR di Excel membulatkan angka tertentu ke kelipatan signifikansi yang ditentukan terdekat. Angka negatif dibulatkan ke bawah (negatif lebih lanjut) ke kelipatan terdekat di bawah nol.',
        abstract: 'Fungsi FLOOR di Excel membulatkan angka tertentu ke kelipatan signifikansi yang ditentukan terdekat. Angka negatif dibulatkan ke bawah (negatif lebih lanjut) ke kelipatan terdekat di bawah nol.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai numerik yang ingin Anda bulatkan.' },
            significance: { name: 'significance', detail: 'Diperlukan. Kelipatan yang menjadi tujuan pembulatan.' },
        },
    },
    FLOOR_MATH: {
        description: 'Membulatkan angka ke bawah, sampai ke bilangan bulat terdekat atau ke kelipatan signifikansi terdekat.',
        abstract: 'Membulatkan angka ke bawah, sampai ke bilangan bulat terdekat atau ke kelipatan signifikansi terdekat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang akan dibulatkan ke bawah.' },
            significance: { name: 'significance', detail: 'Opsional. Kelipatan yang menjadi tujuan pembulatan.' },
            mode: { name: 'mode', detail: 'Opsional. Arah (mendekati atau menjauhi 0) untuk membulatkan bilangan negatif.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Mengembalikan angka yang dibulatkan ke bawah ke bilangan bulat terdekat atau ke kelipatan signifikansi terdekat. Tanpa memperhatikan tanda angka, angka dibulatkan ke bawah. Akan tetapi, jika angka signifikansi adalah nol, maka nol dikembalikan.',
        abstract: 'Mengembalikan angka yang dibulatkan ke bawah ke bilangan bulat terdekat atau ke kelipatan signifikansi terdekat. Tanpa memperhatikan tanda angka, angka dibulatkan ke bawah. Akan tetapi, jika angka signifikansi adalah nol, maka nol dikembalikan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai yang akan dibulatkan.' },
            significance: { name: 'significance', detail: 'Opsional. Kelipatan yang menjadi tujuan pembulatan number. Jika signifikansi dikosongkan, maka nilai default adalah 1.' },
        },
    },
    GCD: {
        description: 'Mengembalikan faktor persekutuan terbesar dari dua atau lebih bilangan bulat. Faktor persekutuan terbesar adalah bilangan bulat terbesar yang dapat membagi habis number1 and number2.',
        abstract: 'Mengembalikan faktor persekutuan terbesar dari dua atau lebih bilangan bulat. Faktor persekutuan terbesar adalah bilangan bulat terbesar yang dapat membagi habis number1 and number2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. nilai 1 hingga 255. Jika nilai bukan bilangan bulat, akan terpotong.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. nilai 1 hingga 255. Jika nilai bukan bilangan bulat, akan terpotong.' },
        },
    },
    INT: {
        description: 'Membulatkan angka ke bawah ke bilangan bulat terdekat.',
        abstract: 'Membulatkan angka ke bawah ke bilangan bulat terdekat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan riil yang ingin Anda bulatkan ke bawah ke bilangan bulat.' },
        },
    },
    ISO_CEILING: {
        description: 'Mengembalikan angka yang dibulatkan ke atas ke bilangan bulat terdekat atau ke kelipatan signifikansi terdekat. Tanpa memperhatikan lambang angkanya, bilangan itu dibulatkan ke atas. Akan tetapi, jika angka signifikansinya nol, maka hasilnya nol.',
        abstract: 'Mengembalikan angka yang dibulatkan ke atas ke bilangan bulat terdekat atau ke kelipatan signifikansi terdekat. Tanpa memperhatikan lambang angkanya, bilangan itu dibulatkan ke atas. Akan tetapi, jika angka signifikansinya nol, maka hasilnya nol.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai yang akan dibulatkan.' },
            significance: { name: 'significance', detail: 'Opsional. Kelipatan yang menjadi tujuan pembulatan number. Jika signifikansi dikosongkan, maka nilai default adalah 1.' },
        },
    },
    LCM: {
        description: 'Mengembalikan kelipatan persekutuan terkecil (KPK) bilangan bulat. KPK adalah bilangan bulat paling kecil yang merupakan kelipatan dari semua argumen bilangan bulat number1, number2, dan seterusnya. Gunakan LCM untuk menambahkan pecahan dengan penyebut yang berbeda.',
        abstract: 'Mengembalikan kelipatan persekutuan terkecil (KPK) bilangan bulat. KPK adalah bilangan bulat paling kecil yang merupakan kelipatan dari semua argumen bilangan bulat number1, number2, dan seterusnya. Gunakan LCM untuk menambahkan pecahan dengan penyebut yang berbeda.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Nilai 1 sampai 255 yang ingin Anda cari KPK-nya. Jika nilai bukan bilangan bulat, maka bilangan tersebut dipotong.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Nilai 1 sampai 255 yang ingin Anda cari KPK-nya. Jika nilai bukan bilangan bulat, maka bilangan tersebut dipotong.' },
        },
    },
    LN: {
        description: 'Mengembalikan logaritma natural dari sebuah bilangan. Logaritma natural didasarkan pada konstanta e (2,71828182845904).',
        abstract: 'Mengembalikan logaritma natural dari sebuah bilangan. Logaritma natural didasarkan pada konstanta e (2,71828182845904).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan riil positif yang ingin Anda dapatkan logaritma naturalnya.' },
        },
    },
    LOG: {
        description: 'Mengembalikan logaritma dari bilangan dengan basis tertentu.',
        abstract: 'Mengembalikan logaritma dari bilangan dengan basis tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan riil positif yang ingin Anda dapatkan logaritmanya.' },
            base: { name: 'base', detail: 'Opsional. Basis dari logaritma. Jika basis dikosongkan, maka diasumsikan sebagai 10.' },
        },
    },
    LOG10: {
        description: 'Mengembalikan bilangan logaritma berbasis 10.',
        abstract: 'Mengembalikan bilangan logaritma berbasis 10.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan riil positif yang ingin Anda dapatkan logaritma berbasis 10.' },
        },
    },
    MDETERM: {
        description: 'Mengembalikan determinan matriks sebuah array.',
        abstract: 'Mengembalikan determinan matriks sebuah array.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Sebuah array numerik dengan jumlah baris dan kolom yang sama.' },
        },
    },
    MINVERSE: {
        description: 'Fungsi MINVERSE mengembalikan matriks inversi untuk matriks yang disimpan dalam array.',
        abstract: 'Fungsi MINVERSE mengembalikan matriks inversi untuk matriks yang disimpan dalam array.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Sebuah array numerik dengan jumlah baris dan kolom yang sama.' },
        },
    },
    MMULT: {
        description: 'Fungsi MMULT mengembalikan produk matriks dari dua array. Hasilnya adalah sebuah array dengan jumlah baris yang sama dengan array1 dan jumlah kolom yang sama dengan array2.',
        abstract: 'Fungsi MMULT mengembalikan produk matriks dari dua array. Hasilnya adalah sebuah array dengan jumlah baris yang sama dengan array1 dan jumlah kolom yang sama dengan array2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Array yang ingin Anda kalikan.' },
            array2: { name: 'array2', detail: 'Array yang ingin Anda kalikan.' },
        },
    },
    MOD: {
        description: 'Mengembalikan sisa setelah angka dibagi oleh divisor. Hasilnya memiliki lambang yang sama dengan divisor.',
        abstract: 'Mengembalikan sisa setelah angka dibagi oleh divisor. Hasilnya memiliki lambang yang sama dengan divisor.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang ingin Anda cari sisanya.' },
            divisor: { name: 'divisor', detail: 'Diperlukan. Angka untuk membagi angka.' },
        },
    },
    MROUND: {
        description: 'MROUND mengembalikan angka yang dibulatkan ke kelipatan yang diinginkan.',
        abstract: 'MROUND mengembalikan angka yang dibulatkan ke kelipatan yang diinginkan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai yang akan dibulatkan.' },
            multiple: { name: 'multiple', detail: 'Diperlukan. Kelipatan yang dituju saat membulatkan angka.' },
        },
    },
    MULTINOMIAL: {
        description: 'Mengembalikan rasio faktorial jumlah nilai terhadap hasil kali faktorial.',
        abstract: 'Mengembalikan rasio faktorial jumlah nilai terhadap hasil kali faktorial.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Nilai dari 1 sampai 255 yang Anda ingin cari multinomialnya.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Nilai dari 1 sampai 255 yang Anda ingin cari multinomialnya.' },
        },
    },
    MUNIT: {
        description: 'Fungsi MUNIT mengembalikan matriks unit untuk dimensi yang ditentukan.',
        abstract: 'Fungsi MUNIT mengembalikan matriks unit untuk dimensi yang ditentukan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: 'Bilangan bulat yang menentukan dimensi matriks unit yang ingin dikembalikan. Mengembalikan array dan dimensinya harus lebih besar dari nol.' },
        },
    },
    ODD: {
        description: 'Mengembalikan angka yang dibulatkan ke atas ke bilangan bulat ganjil terdekat.',
        abstract: 'Mengembalikan angka yang dibulatkan ke atas ke bilangan bulat ganjil terdekat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Nilai yang akan dibulatkan.' },
        },
    },
    PI: {
        description: 'Mengembalikan angka 3,14159265358979, konstanta matematika pi, akurat sampai 15 digit.',
        abstract: 'Mengembalikan angka 3,14159265358979, konstanta matematika pi, akurat sampai 15 digit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Mengembalikan sebuah angka yang dipangkatkan.',
        abstract: 'Mengembalikan sebuah angka yang dipangkatkan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Bilangan basis. Bisa berupa bilangan riil berapa pun.' },
            power: { name: 'power', detail: 'Diperlukan. Eksponen untuk menaikkan bilangan basis.' },
        },
    },
    PRODUCT: {
        description: 'Fungsi PRODUCT mengalikan semua angka yang diberikan sebagai argumen dan mengembalikan hasil kali. Misalnya, jika sel A1 dan A2 berisi angka, Anda dapat menggunakan rumus =PRODUCT(A1, A2) untuk mengalikan kedua angka tersebut bersama-sama. Anda juga dapat melakukan operasi yang sama dengan menggunakan operator matematika perkalian ( * ); misalnya, =A1 * A2 .',
        abstract: 'Fungsi PRODUCT mengalikan semua angka yang diberikan sebagai argumen dan mengembalikan hasil kali. Misalnya, jika sel A1 dan A2 berisi angka, Anda dapat menggunakan rumus =PRODUCT(A1, A2) untuk mengalikan kedua angka tersebut bersama-sama. Anda juga dapat melakukan operasi yang sama dengan menggunakan operator matematika perkalian ( * ); misalnya, =A1 * A2 .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Angka atau rentang pertama yang ingin Anda kalikan.' },
            number2: { name: 'number2', detail: 'Opsional. Angka atau rentang tambahan yang ingin Anda kalikan, maksimum sampai 255 argumen.' },
        },
    },
    QUOTIENT: {
        description: 'Mengembalikan bilangan bulat dari sebuah pembagian. Gunakan fungsi saat Anda ingin menghapus sisa dari sebuah pembagian.',
        abstract: 'Mengembalikan bilangan bulat dari sebuah pembagian. Gunakan fungsi saat Anda ingin menghapus sisa dari sebuah pembagian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: 'Diperlukan. Dividen.' },
            denominator: { name: 'denominator', detail: 'Diperlukan. Pembagi.' },
        },
    },
    RADIANS: {
        description: 'Mengonversi derajat menjadi radian.',
        abstract: 'Mengonversi derajat menjadi radian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Diperlukan. Sudut dalam derajat yang ingin Anda konversi.' },
        },
    },
    RAND: {
        description: 'RAND mengembalikan bilangan riil acak yang terdistribusi secara merata yang lebih besar atau sama dengan 0 dan kurang dari 1. Bilangan riil acak akan dikembalikan setiap kali lembar kerja dihitung.',
        abstract: 'RAND mengembalikan bilangan riil acak yang terdistribusi secara merata yang lebih besar atau sama dengan 0 dan kurang dari 1. Bilangan riil acak akan dikembalikan setiap kali lembar kerja dihitung.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Dalam contoh berikut, kami membuat larik dengan tinggi 5 baris dan lebar 3 kolom. Contoh pertama mengembalikan rangkaian nilai antara 0 dan 1, yang adalah perilaku default RANDARRAY. Contoh berikutnya mengembalikan rangkaian nilai desimal acak antara 1 dan 100. Terakhir, contoh ketiga mengembalikan rangkaian bilangan bulat acak antara 1 dan 100.',
        abstract: 'Dalam contoh berikut, kami membuat larik dengan tinggi 5 baris dan lebar 3 kolom. Contoh pertama mengembalikan rangkaian nilai antara 0 dan 1, yang adalah perilaku default RANDARRAY. Contoh berikutnya mengembalikan rangkaian nilai desimal acak antara 1 dan 100. Terakhir, contoh ketiga mengembalikan rangkaian bilangan bulat acak antara 1 dan 100.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Jumlah baris yang akan dihasilkan' },
            columns: { name: 'columns', detail: 'Jumlah kolom yang akan dihasilkan' },
            min: { name: 'min', detail: 'Angka minimum yang dikembalikan' },
            max: { name: 'max', detail: 'Angka maksimum yang dikembalikan' },
            wholeNumber: { name: 'whole_number', detail: 'Mengembalikan bilangan bulat atau nilai desimal TRUE untuk bilangan bulat FALSE untuk angka desimal' },
        },
    },
    RANDBETWEEN: {
        description: 'Mengembalikan angka bilangan bulat acak di antara angka-angka yang Anda tentukan. Bilangan bulat acak baru akan dikembalikan setiap kali lembar kerja dihitung.',
        abstract: 'Mengembalikan angka bilangan bulat acak di antara angka-angka yang Anda tentukan. Bilangan bulat acak baru akan dikembalikan setiap kali lembar kerja dihitung.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'Diperlukan. RANDBETWEEN akan mengembalikan bilangan bulat terkecil.' },
            top: { name: 'top', detail: 'Diperlukan. RANDBETWEEN akan mengembalikan bilangan bulat terbesar.' },
        },
    },
    ROMAN: {
        description: 'Mengonversi angka Arab ke Romawi, sebagai teks.',
        abstract: 'Mengonversi angka Arab ke Romawi, sebagai teks.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka Arab yang ingin Anda konversikan.' },
            form: { name: 'form', detail: 'Opsional. Angka yang menentukan tipe angka Romawi yang Anda inginkan. Gaya angka Romawi beragam dari Klasik sampai Sederhana, menjadi lebih singkat seiring nilai dari formulir meningkat. Lihat contoh berikut ROMAN(499,0) di bawah.' },
        },
    },
    ROUND: {
        description: 'Fungsi ROUND membulatkan angka ke jumlah digit yang ditentukan. Sebagai contoh, jika sel A1 berisi 23,7825, dan Anda ingin membulatkan nilai itu ke dua tempat desimal, Anda bisa menggunakan rumus berikut:',
        abstract: 'Fungsi ROUND membulatkan angka ke jumlah digit yang ditentukan. Sebagai contoh, jika sel A1 berisi 23,7825, dan Anda ingin membulatkan nilai itu ke dua tempat desimal, Anda bisa menggunakan rumus berikut:',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang ingin Anda bulatkan.' },
            numDigits: { name: 'num_digits', detail: 'Diperlukan. Jumlah digit pembulatan yang Anda ingin terapkan pada angka.' },
        },
    },
    ROUNDBANK: {
        description: 'Membulatkan angka dengan metode pembulatan bankir.',
        abstract: 'Membulatkan angka dengan metode pembulatan bankir.',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Angka yang ingin Anda bulatkan dengan pembulatan bankir.' },
            numDigits: { name: 'num_digits', detail: 'Jumlah digit tujuan pembulatan dengan metode pembulatan bankir.' },
        },
    },
    ROUNDDOWN: {
        description: 'Membulatkan angka ke bawah, mendekati nol.',
        abstract: 'Membulatkan angka ke bawah, mendekati nol.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Setiap bilangan riil yang ingin Anda bulatkan ke bawah.' },
            numDigits: { name: 'num_digits', detail: 'Diperlukan. Jumlah digit pembulatan yang ingin Anda terapkan pada angka.' },
        },
    },
    ROUNDUP: {
        description: 'Membulatkan angka ke atas, menjauhi 0 (nol).',
        abstract: 'Membulatkan angka ke atas, menjauhi 0 (nol).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Setiap bilangan riil yang ingin Anda bulatkan ke atas.' },
            numDigits: { name: 'num_digits', detail: 'Diperlukan. Jumlah digit pembulatan yang ingin Anda terapkan pada angka.' },
        },
    },
    SEC: {
        description: 'Mengembalikan nilai sekan dari suatu sudut.',
        abstract: 'Mengembalikan nilai sekan dari suatu sudut.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Sudut dalam radian yang ingin dicari nilai sekannya.' },
        },
    },
    SECH: {
        description: 'Mengembalikan nilai sekan hiperbolik dari suatu sudut.',
        abstract: 'Mengembalikan nilai sekan hiperbolik dari suatu sudut.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Sudut dalam radian yang ingin dicari nilai sekan hiperboliknya.' },
        },
    },
    SERIESSUM: {
        description: 'Banyak fungsi dapat diperkirakan oleh pengembangan deret pangkat.',
        abstract: 'Banyak fungsi dapat diperkirakan oleh pengembangan deret pangkat.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai input deret pangkat.' },
            n: { name: 'n', detail: 'Diperlukan. Pangkat awal yang ingin Anda terapkan untuk menaikkan x.' },
            m: { name: 'm', detail: 'Diperlukan. Langkah untuk meningkatkan n untuk setiap item dalam deret.' },
            coefficients: { name: 'coefficients', detail: 'Diperlukan. Sekumpulan koefisien di mana setiap pangkat dari x yang berurutan dilipatkan. Jumlah nilai dalam koefisien menentukan jumlah item di deret pangkat. Sebagai contoh, jika ada tiga nilai di koefisien, maka ada tiga item di deret pangkat.' },
        },
    },
    SEQUENCE: {
        description: 'Dalam contoh berikut, kami membuat larik dengan tinggi 4 baris dan lebar 5 kolom menggunakan =SEQUENCE(4,5) .',
        abstract: 'Dalam contoh berikut, kami membuat larik dengan tinggi 4 baris dan lebar 5 kolom menggunakan =SEQUENCE(4,5) .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Jumlah baris yang ingin dihasilkan' },
            columns: { name: 'columns', detail: 'Jumlah kolom yang ingin dihasilkan' },
            start: { name: 'start', detail: 'Angka pertama dalam urutan' },
            step: { name: 'step', detail: 'Jumlah yang perlu ditambahkan pada setiap nilai berikutnya dalam larik' },
        },
    },
    SIGN: {
        description: 'Mengembalikan lambang angka. Mengembalikan 1 jika angkanya positif, nol (0) jika angkanya adalah 0, dan -1 jika angkanya negatif.',
        abstract: 'Mengembalikan lambang angka. Mengembalikan 1 jika angkanya positif, nol (0) jika angkanya adalah 0, dan -1 jika angkanya negatif.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Setiap bilangan riil.' },
        },
    },
    SIN: {
        description: 'Mengembalikan sinus sudut tertentu.',
        abstract: 'Mengembalikan sinus sudut tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Sudut dalam radian yang ingin Anda dapatkan sinusnya.' },
        },
    },
    SINH: {
        description: 'Mengembalikan sinus hiperbolik sebuah angka.',
        abstract: 'Mengembalikan sinus hiperbolik sebuah angka.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Setiap bilangan riil.' },
        },
    },
    SQRT: {
        description: 'Mengembalikan akar kuadrat positif.',
        abstract: 'Mengembalikan akar kuadrat positif.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang ingin Anda dapatkan akar kuadratnya.' },
        },
    },
    SQRTPI: {
        description: 'Mengembalikan akar kuadrat dari (angka * pi).',
        abstract: 'Mengembalikan akar kuadrat dari (angka * pi).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang dikalikan dengan pi.' },
        },
    },
    SUBTOTAL: {
        description: 'Menghasilkan subtotal dalam daftar atau database. Umumnya lebih muda membuat daftar dengan subtotal dengan menggunakan perintah Subtotal di grup Kerangka di tab Data di aplikasi desktop Excel. Setelah daftar subtotal dibuat, Anda bisa mengubahnya dengan mengedit fungsi SUBTOTAL.',
        abstract: 'Menghasilkan subtotal dalam daftar atau database. Umumnya lebih muda membuat daftar dengan subtotal dengan menggunakan perintah Subtotal di grup Kerangka di tab Data di aplikasi desktop Excel. Setelah daftar subtotal dibuat, Anda bisa mengubahnya dengan mengedit fungsi SUBTOTAL.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Diperlukan. Angka 1-11 atau 101-111 yang menentukan fungsi yang akan digunakan untuk subtotal. 1-11 menyertakan baris yang disembunyikan secara manual, sementara 101-111, sel yang difilter selalu dikecualikan.' },
            ref1: { name: 'ref1', detail: 'Diperlukan. Rentang atau referensi yang pertama kali dinamai yang ingin Anda dapatkan subtotalnya..' },
            ref2: { name: 'ref2', detail: 'Opsional. Rentang atau referensi yang dinamai 2 sampai 254 yang ingin Anda dapatkan subtotalnya.' },
        },
    },
    SUM: {
        description: 'Fungsi SUM menambahkan nilai. Anda dapat menambahkan nilai individual, referensi sel atau rentang, atau campuran ketiganya.',
        abstract: 'Fungsi SUM menambahkan nilai. Anda dapat menambahkan nilai individual, referensi sel atau rentang, atau campuran ketiganya.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Number 1', detail: 'Angka pertama yang ingin Anda tambahkan. Angkanya bisa seperti 4, referensi sel seperti B6, atau rentang sel seperti B2:B8.' },
            number2: { name: 'Number 2', detail: 'Inilah angka kedua yang ingin Anda tambahkan. Anda dapat menentukan hingga 255 angka dengan cara ini.' },
        },
    },
    SUMIF: {
        description: 'Anda menggunakan fungsi SUMIF untuk menjumlahkan nilai dalam rentang yang memenuhi kriteria yang Anda tentukan. Sebagai contoh, di dalam kolom yang berisi angka, Anda hanya ingin menjumlahkan nilai-nilai yang lebih besar dari 5. Anda dapat menggunakan rumus berikut: =SUMIF(B2:B25,">5")',
        abstract: 'Anda menggunakan fungsi SUMIF untuk menjumlahkan nilai dalam rentang yang memenuhi kriteria yang Anda tentukan. Sebagai contoh, di dalam kolom yang berisi angka, Anda hanya ingin menjumlahkan nilai-nilai yang lebih besar dari 5. Anda dapat menggunakan rumus berikut: =SUMIF(B2:B25,">5")',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Diperlukan. Rentang sel yang akan Anda evaluasi menurut kriteria. Sel di setiap rentang harus merupakan angka atau nama, array, atau referensi yang berisi angka. Sel kosong atau nilai teks diabaikan. Rentang yang dipilih dapat berisi tanggal dalam format Excel standar (contoh di bawah).' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Kriteria dalam bentuk angka, ekspresi, referensi sel, teks, atau fungsi yang menentukan sel mana yang akan ditambahkan. Karakter wildcard dapat disertakan - tanda tanya (?) untuk mencocokkan karakter tunggal apa pun, tanda bintang (*) untuk mencocokkan urutan karakter apa pun. Jika Anda ingin menemukan tanda tanya atau tanda bintang aktual, ketikkan tilde ( ~ ) sebelum karakter. Misalnya, kriteria dapat dinyatakan sebagai 32, ">32", B5, "3?", "apple*", "*~?", atau TODAY(). Penting Kriteria teks atau kriteria apa pun yang mencakup simbol logika atau matematika harus disertakan dalam tanda kutip ganda ( " ). Jika kriteria adalah numerik, tanda kutip ganda tidak diperlukan.' },
            sumRange: { name: 'sum_range', detail: 'Opsional. Sel aktual untuk ditambahkan, jika Anda ingin menambahkan sel selain sel yang ditentukan dalam argumen rentang . Jika argumen sum_range dihilangkan, Excel menambahkan sel yang ditentukan dalam argumen rentang (sel yang sama dengan tempat kriteria diterapkan). Sum_range harus memiliki ukuran dan bentuk yang sama dengan rentang . Jika tidak, kinerja mungkin menderita, dan rumus akan menjumlahkan rentang sel yang dimulai dengan sel pertama di sum_range tetapi memiliki dimensi yang sama seperti rentang . Misalnya: rentang sum_range Sel yang dijumlahkan aktual A1:A5 B1:B5 B1:B5 A1:A5 B1:K5 B1:B5' },
        },
    },
    SUMIFS: {
        description: 'Fungsi SUMIFS, salah satu dari fungsi matematika dan trigonometri , menambahkan semua argumennya yang memenuhi beberapa kriteria. Sebagai contoh, gunakan SUMIFS untuk menjumlahkan jumlah pengecer di negara yang (1) berada dalam satu kode pos dan (2) yang labanya melebihi nilai dolar tertentu.',
        abstract: 'Fungsi SUMIFS, salah satu dari fungsi matematika dan trigonometri , menambahkan semua argumennya yang memenuhi beberapa kriteria. Sebagai contoh, gunakan SUMIFS untuk menjumlahkan jumlah pengecer di negara yang (1) berada dalam satu kode pos dan (2) yang labanya melebihi nilai dolar tertentu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: 'Rentang sel untuk dijumlahkan.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Rentang yang diuji menggunakan Criteria1 . Criteria_range1 dan Criteria1 menyiapkan pasangan pencarian di mana rentang dicari untuk kriteria tertentu. Setelah item dalam rentang ditemukan, nilai terkaitnya dalam Sum_range ditambahkan.' },
            criteria1: { name: 'criteria1', detail: 'Kriteria yang menentukan sel mana di Criteria_range1 yang akan ditambahkan. Misalnya, kriteria dapat dimasukkan sebagai 32 , ">32" , B4 , "apel" , atau "32" .' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Rentang tambahan dan kriteria yang terkait. Anda bisa memasukkan hingga 127 pasang rentang/kriteria.' },
            criteria2: { name: 'criteria2', detail: 'Rentang tambahan dan kriteria yang terkait. Anda bisa memasukkan hingga 127 pasang rentang/kriteria.' },
        },
    },
    SUMPRODUCT: {
        description: 'Fungsi SUMPRODUCT mengembalikan jumlah produk rentang atau array terkait. Operasi default adalah perkalian, tetapi penambahan, pengurangan, dan pembagian juga dimungkinkan.',
        abstract: 'Fungsi SUMPRODUCT mengembalikan jumlah produk rentang atau array terkait. Operasi default adalah perkalian, tetapi penambahan, pengurangan, dan pembagian juga dimungkinkan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Argumen array pertama yang komponen-komponennya ingin Anda kalikan lalu tambahkan.' },
            array2: { name: 'array', detail: 'Argumen array 2 sampai 255 yang komponen-komponennya ingin Anda kalikan lalu tambahkan.' },
        },
    },
    SUMSQ: {
        description: 'Mengembalikan jumlah kuadrat dari argumen.',
        abstract: 'Mengembalikan jumlah kuadrat dari argumen.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan. Angka berikutnya bersifat opsional. Bisa ada sebanyak 255 argumen yang Anda inginkan jumlah kuadratnya.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan. Angka berikutnya bersifat opsional. Bisa ada sebanyak 255 argumen yang Anda inginkan jumlah kuadratnya.' },
        },
    },
    SUMX2MY2: {
        description: 'Fungsi Excel ini mengembalikan jumlah selisih kuadrat dari nilai terkait dalam dua array.',
        abstract: 'Fungsi Excel ini mengembalikan jumlah selisih kuadrat dari nilai terkait dalam dua array.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Diperlukan. Array atau rentang nilai pertama.' },
            arrayY: { name: 'array_y', detail: 'Diperlukan. Array atau rentang nilai kedua.' },
        },
    },
    SUMX2PY2: {
        description: 'Mengembalikan jumlah dari jumlah kuadrat dari nilai yang terkait dalam dua array. Jumlah dari jumlah kuadrat adalah istilah yang umum dalam banyak perhitungan statistik.',
        abstract: 'Mengembalikan jumlah dari jumlah kuadrat dari nilai yang terkait dalam dua array. Jumlah dari jumlah kuadrat adalah istilah yang umum dalam banyak perhitungan statistik.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Diperlukan. Array atau rentang nilai pertama.' },
            arrayY: { name: 'array_y', detail: 'Diperlukan. Array atau rentang nilai kedua.' },
        },
    },
    SUMXMY2: {
        description: 'Fungsi SUMXMY2 mengembalikan jumlah kuadrat selisih nilai terkait dalam dua array.',
        abstract: 'Fungsi SUMXMY2 mengembalikan jumlah kuadrat selisih nilai terkait dalam dua array.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Array atau rentang nilai pertama. Diperlukan.' },
            arrayY: { name: 'array_y', detail: 'Array atau rentang nilai kedua. Diperlukan.' },
        },
    },
    TAN: {
        description: 'Mengembalikan tangen dari sudut yang diberikan.',
        abstract: 'Mengembalikan tangen dari sudut yang diberikan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Sudut dalam radian yang ingin Anda dapatkan tangennya.' },
        },
    },
    TANH: {
        description: 'Mengembalikan tangen hiperbolik dari sebuah angka.',
        abstract: 'Mengembalikan tangen hiperbolik dari sebuah angka.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Setiap bilangan riil.' },
        },
    },
    TRUNC: {
        description: 'Fungsi TRUNC memotong angka menjadi bilangan bulat dengan menghapus bagian pecahan dari angka.',
        abstract: 'Fungsi TRUNC memotong angka menjadi bilangan bulat dengan menghapus bagian pecahan dari angka.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang ingin Anda potong.' },
            numDigits: { name: 'num_digits', detail: 'Opsional. Angka yang menentukan presisi dari pemotongan. Nilai default untuk num_digits adalah 0 (nol).' },
        },
    },
};

export default locale;
