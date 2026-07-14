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
    AND: {
        description: 'Fungsi AND mengembalikan TRUE jika semua argumennya mengevaluasi ke TRUE, dan mengembalikan FALSE jika satu atau beberapa argumen mengevaluasi ke FALSE.',
        abstract: 'Fungsi AND mengembalikan TRUE jika semua argumennya mengevaluasi ke TRUE, dan mengembalikan FALSE jika satu atau beberapa argumen mengevaluasi ke FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Kondisi pertama yang ingin diuji, yang dapat mengevaluasi ke TRUE atau FALSE.' },
            logical2: { name: 'logical2', detail: 'Kondisi tambahan yang ingin diuji, yang dapat mengevaluasi ke TRUE atau FALSE, hingga maksimum 255 kondisi.' },
        },
    },
    BYCOL: {
        description: 'Menerapkan LAMBDA ke setiap kolom dan mengembalikan larik hasil. Misalnya, jika array asli adalah 3 kolom kali 2 baris, array yang dikembalikan adalah 3 kolom kali 1 baris.',
        abstract: 'Menerapkan LAMBDA ke setiap kolom dan mengembalikan larik hasil. Misalnya, jika array asli adalah 3 kolom kali 2 baris, array yang dikembalikan adalah 3 kolom kali 1 baris.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array yang akan dipisahkan berdasarkan kolom.' },
            lambda: { name: 'lambda', detail: 'LAMBDA yang menerima satu kolom sebagai parameter tunggal dan menghitung satu hasil. Parameternya adalah kolom dari array.' },
        },
    },
    BYROW: {
        description: 'Menerapkan LAMBDA ke setiap baris dan mengembalikan larik hasil. Misalnya, jika array asli adalah 3 kolom kali 2 baris, array yang dikembalikan adalah 1 kolom kali 2 baris.',
        abstract: 'Menerapkan LAMBDA ke setiap baris dan mengembalikan larik hasil. Misalnya, jika array asli adalah 3 kolom kali 2 baris, array yang dikembalikan adalah 1 kolom kali 2 baris.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array yang akan dipisahkan berdasarkan baris.' },
            lambda: { name: 'lambda', detail: 'LAMBDA yang menerima satu baris sebagai parameter tunggal dan menghitung satu hasil. Parameternya adalah baris dari array.' },
        },
    },
    FALSE: {
        description: 'Mengembalikan nilai logis FALSE.',
        abstract: 'Mengembalikan nilai logis FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/false-function',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: 'Sebagai contoh, =IF(C2=”Ya”,1,2) artinya JIKA(C2 = Ya, maka berikan 1, jika tidak berikan 2).',
        abstract: 'Sebagai contoh, =IF(C2=”Ya”,1,2) artinya JIKA(C2 = Ya, maka berikan 1, jika tidak berikan 2).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: 'Kondisi yang ingin Anda uji.' },
            valueIfTrue: { name: 'value_if_true', detail: 'Nilai yang ingin Anda kembalikan jika hasil logical_test adalah TRUE.' },
            valueIfFalse: { name: 'value_if_false', detail: 'Nilai yang ingin Anda kembalikan jika hasil dari logical_test adalah FALSE.' },
        },
    },
    IFERROR: {
        description: 'Anda dapat menggunakan fungsi IFERROR untuk menangani kesalahan dalam rumus. IFERROR mengembalikan nilai yang Anda tentukan jika rumus mengevaluasi kesalahan; jika tidak, rumus akan mengembalikan hasil rumus.',
        abstract: 'Anda dapat menggunakan fungsi IFERROR untuk menangani kesalahan dalam rumus. IFERROR mengembalikan nilai yang Anda tentukan jika rumus mengevaluasi kesalahan; jika tidak, rumus akan mengembalikan hasil rumus.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Argumen yang diperiksa apakah ada kesalahan.' },
            valueIfError: { name: 'value_if_error', detail: 'Diperlukan. Nilai yang dikembalikan jika rumus mengevaluasi ke kesalahan. Jenis-jenis kesalahan berikut ini dievaluasi : #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME?, atau #NULL!.' },
        },
    },
    IFNA: {
        description: 'Fungsi IFNA mengembalikan nilai yang Anda tentukan jika rumus mengembalikan nilai kesalahan #N/A; jika tidak, rumus akan mengembalikan hasil rumus.',
        abstract: 'Fungsi IFNA mengembalikan nilai yang Anda tentukan jika rumus mengembalikan nilai kesalahan #N/A; jika tidak, rumus akan mengembalikan hasil rumus.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argumen yang diperiksa ada tidaknya nilai kesalahan #N/A.' },
            valueIfNa: { name: 'value_if_na', detail: 'Nilai yang harus dikembalikan jika rumus mengevaluasi dengan nilai kesalahan #N/A.' },
        },
    },
    IFS: {
        description: 'Fungsi IFS memeriksa apakah satu atau beberapa kondisi terpenuhi dan mengembalikan nilai yang sesuai dengan kondisi TRUE pertama. IFS dapat menggantikan beberapa pernyataan IF yang bertumpuk, dan jauh lebih mudah dibaca dengan beberapa kondisi.',
        abstract: 'Fungsi IFS memeriksa apakah satu atau beberapa kondisi terpenuhi dan mengembalikan nilai yang sesuai dengan kondisi TRUE pertama. IFS dapat menggantikan beberapa pernyataan IF yang bertumpuk, dan jauh lebih mudah dibaca dengan beberapa kondisi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'Kondisi yang mengevaluasi ke TRUE atau FALSE.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'Hasil yang dikembalikan jika logical_test1 mengevaluasi ke TRUE. Dapat kosong.' },
            logicalTest2: { name: 'logical_test2', detail: 'Kondisi yang mengevaluasi ke TRUE atau FALSE.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'Hasil yang dikembalikan jika logical_testN mengevaluasi ke TRUE. Setiap value_if_trueN sesuai dengan kondisi logical_testN dan dapat kosong.' },
        },
    },
    LAMBDA: {
        description: 'Anda dapat membuat fungsi untuk rumus yang umum digunakan, menghilangkan kebutuhan untuk menyalin dan menempelkan rumus ini (yang mungkin rentan terhadap kesalahan), dan secara efektif menambahkan fungsi Anda sendiri ke pustaka fungsi Asli Excel. Selain itu, fungsi LAMBDA tidak memerlukan VBA, makro, atau JavaScript, sehingga non-programmer juga dapat memanfaatkan penggunaannya.',
        abstract: 'Anda dapat membuat fungsi untuk rumus yang umum digunakan, menghilangkan kebutuhan untuk menyalin dan menempelkan rumus ini (yang mungkin rentan terhadap kesalahan), dan secara efektif menambahkan fungsi Anda sendiri ke pustaka fungsi Asli Excel. Selain itu, fungsi LAMBDA tidak memerlukan VBA, makro, atau JavaScript, sehingga non-programmer juga dapat memanfaatkan penggunaannya.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: 'Nilai yang ingin Anda berikan ke fungsi, seperti referensi sel, string, atau angka. Anda dapat memasukkan hingga 253 parameter. Argumen ini bersifat opsional.' },
            calculation: { name: 'calculation', detail: 'Rumus yang ingin Anda jalankan dan kembalikan sebagai hasil dari fungsi. Argumen harus berupa argumen terakhir dan harus mengembalikan hasil. Argumen ini diperlukan.' },
        },
    },
    LET: {
        description: 'Fungsi menetapkan LET nama untuk hasil penghitungan. Ini memungkinkan penyimpanan penghitungan, nilai, atau penentuan nama menengah di dalam rumus. Nama ini hanya berlaku dalam lingkup LET fungsi. Mirip dengan variabel dalam pemrograman, LET dicapai melalui sintaks rumus asli Excel.',
        abstract: 'Fungsi menetapkan LET nama untuk hasil penghitungan. Ini memungkinkan penyimpanan penghitungan, nilai, atau penentuan nama menengah di dalam rumus. Nama ini hanya berlaku dalam lingkup LET fungsi. Mirip dengan variabel dalam pemrograman, LET dicapai melalui sintaks rumus asli Excel.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: 'Nama pertama yang akan ditetapkan. Harus dimulai dengan huruf dan tidak boleh merupakan hasil rumus atau berbenturan dengan sintaks rentang.' },
            nameValue1: { name: 'name_value1', detail: 'Nilai yang ditetapkan ke name1.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'Penghitungan yang menggunakan semua nama dalam LET dan harus menjadi argumen terakhir, atau nama kedua yang ditetapkan ke name_value2.' },
            nameValue2: { name: 'name_value2', detail: 'Nilai yang ditetapkan ke calculation_or_name2.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'Penghitungan yang menggunakan semua nama dalam LET dan harus menjadi argumen terakhir, atau nama ketiga yang ditetapkan ke name_value3.' },
        },
    },
    MAKEARRAY: {
        description: 'Mengembalikan array terhitung dari ukuran baris dan kolom yang ditentukan, dengan menerapkan fungsi LAMBDA .',
        abstract: 'Mengembalikan array terhitung dari ukuran baris dan kolom yang ditentukan, dengan menerapkan fungsi LAMBDA .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'Jumlah baris dalam array. Harus lebih besar dari nol.' },
            number2: { name: 'cols', detail: 'Jumlah kolom dalam array. Harus lebih besar dari nol.' },
            value3: { name: 'lambda', detail: 'LAMBDA yang dipanggil untuk membuat array. Menerima dua parameter: row, indeks baris array, dan col, indeks kolom array.' },
        },
    },
    MAP: {
        description: 'Mengembalikan array yang dibentuk dengan memetakan setiap nilai dalam array ke nilai baru dengan menerapkan LAMBDA untuk membuat nilai baru.',
        abstract: 'Mengembalikan array yang dibentuk dengan memetakan setiap nilai dalam array ke nilai baru dengan menerapkan LAMBDA untuk membuat nilai baru.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Array pertama yang akan dipetakan.' },
            array2: { name: 'array2', detail: 'Array kedua yang akan dipetakan.' },
            lambda: { name: 'lambda', detail: 'LAMBDA yang harus menjadi argumen terakhir dan memiliki parameter untuk setiap array yang diteruskan.' },
        },
    },
    NOT: {
        description: 'Fungsi NOT membalikkan nilai argumennya.',
        abstract: 'Fungsi NOT membalikkan nilai argumennya.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: 'Kondisi yang logikanya ingin dibalik, yang dapat mengevaluasi ke TRUE atau FALSE.' },
        },
    },
    OR: {
        description: 'Fungsi OR mengembalikan TRUE jika semua argumennya mengevaluasi ke TRUE, dan mengembalikan FALSE jika semua argumennya mengevaluasi ke FALSE.',
        abstract: 'Fungsi OR mengembalikan TRUE jika semua argumennya mengevaluasi ke TRUE, dan mengembalikan FALSE jika semua argumennya mengevaluasi ke FALSE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Kondisi pertama yang ingin diuji, yang dapat mengevaluasi ke TRUE atau FALSE.' },
            logical2: { name: 'logical2', detail: 'Kondisi tambahan yang ingin diuji, yang dapat mengevaluasi ke TRUE atau FALSE, hingga maksimum 255 kondisi.' },
        },
    },
    REDUCE: {
        description: 'Mengurangi array ke nilai akumulasi dengan menerapkan LAMBDA ke setiap nilai dan mengembalikan nilai total dalam akumulator.',
        abstract: 'Mengurangi array ke nilai akumulasi dengan menerapkan LAMBDA ke setiap nilai dan mengembalikan nilai total dalam akumulator.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Menetapkan nilai awal untuk akumulator.' },
            array: { name: 'array', detail: 'Array yang akan direduksi.' },
            lambda: { name: 'lambda', detail: 'LAMBDA yang dipanggil untuk mereduksi array. Menerima nilai akumulasi, nilai saat ini dari array, dan penghitungan yang diterapkan ke setiap elemen.' },
        },
    },
    SCAN: {
        description: 'Memindai array dengan menerapkan LAMBDA ke setiap nilai dan mengembalikan array yang memiliki setiap nilai menengah.',
        abstract: 'Memindai array dengan menerapkan LAMBDA ke setiap nilai dan mengembalikan array yang memiliki setiap nilai menengah.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Mengatur nilai awal untuk akumulator.' },
            array: { name: 'array', detail: 'Array yang akan dipindai.' },
            lambda: { name: 'lambda', detail: 'LAMBDA yang disebut untuk mengurangi array. LAMBDA mengambil tiga parameter: Akumulator Nilai dijumlahkan dan dikembalikan sebagai hasil akhir. Nilai Nilai saat ini dari array. Tubuh Penghitungan yang diterapkan ke setiap elemen dalam array.' },
        },
    },
    SWITCH: {
        description: 'Fungsi SWITCH mengevaluasi satu nilai (disebut ekspresi ) terhadap daftar nilai, dan mengembalikan hasil yang terkait dengan nilai cocok pertama. Jika tidak terdapat kecocokan, nilai default opsional mungkin akan dikembalikan.',
        abstract: 'Fungsi SWITCH mengevaluasi satu nilai (disebut ekspresi ) terhadap daftar nilai, dan mengembalikan hasil yang terkait dengan nilai cocok pertama. Jika tidak terdapat kecocokan, nilai default opsional mungkin akan dikembalikan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: 'Nilai, misalnya angka, tanggal, atau teks, yang akan dibandingkan dengan value1 hingga value126.' },
            value1: { name: 'value1', detail: 'Nilai yang akan dibandingkan dengan expression.' },
            result1: { name: 'result1', detail: 'Nilai yang dikembalikan saat argumen valueN yang sesuai cocok dengan expression. Harus disediakan untuk setiap valueN.' },
            defaultOrValue2: { name: 'default_or_value2', detail: 'Nilai yang dikembalikan bila tidak ada kecocokan pada ekspresi valueN. Harus menjadi argumen terakhir fungsi.' },
            result2: { name: 'result2', detail: 'Nilai yang dikembalikan saat argumen valueN yang sesuai cocok dengan expression. Harus disediakan untuk setiap valueN.' },
        },
    },
    TRUE: {
        description: 'Mengembalikan nilai logika TRUE. Anda bisa menggunakan fungsi ini saat Anda ingin mengembalikan nilai TRUE berdasarkan kondisi. Misalnya:',
        abstract: 'Mengembalikan nilai logika TRUE. Anda bisa menggunakan fungsi ini saat Anda ingin mengembalikan nilai TRUE berdasarkan kondisi. Misalnya:',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/true-function',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: 'Fungsi XOR mengembalikan logika Exclusive Or dari semua argumen.',
        abstract: 'Fungsi XOR mengembalikan logika Exclusive Or dari semua argumen.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Kondisi pertama yang ingin diuji, yang dapat mengevaluasi ke TRUE atau FALSE.' },
            logical2: { name: 'logical2', detail: 'Kondisi tambahan yang ingin diuji, yang dapat mengevaluasi ke TRUE atau FALSE, hingga maksimum 255 kondisi.' },
        },
    },
};

export default locale;
