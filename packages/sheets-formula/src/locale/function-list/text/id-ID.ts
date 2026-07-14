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
    ASC: {
        description: 'Untuk bahasa Perangkat karakter bit ganda (DBCS, Double-byte character set), fungsi tersebut mengubah karakter lebar penuh (bit ganda) menjadi lebar setengah (bit tunggal).',
        abstract: 'Untuk bahasa Perangkat karakter bit ganda (DBCS, Double-byte character set), fungsi tersebut mengubah karakter lebar penuh (bit ganda) menjadi lebar setengah (bit tunggal).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks atau referensi ke suatu sel yang berisi teks yang ingin Anda ubah. Jika teks tidak berisi huruf lebar penuh, teks tidak diubah.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Fungsi ARRAYTOTEXT mengembalikan array nilai teks dari rentang tertentu. Ini melewati nilai teks tidak berubah, dan mengonversi nilai non-teks menjadi teks.',
        abstract: 'Fungsi ARRAYTOTEXT mengembalikan array nilai teks dari rentang tertentu. Ini melewati nilai teks tidak berubah, dan mengonversi nilai non-teks menjadi teks.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array untuk dikembalikan sebagai teks. Diperlukan.' },
            format: { name: 'format', detail: 'Format data yang dikembalikan. Opsional. Ini bisa menjadi salah satu dari dua nilai: 0 Default. Format ringkas yang mudah dibaca. Teks yang dikembalikan akan sama seperti teks yang disajikan dalam sel yang memiliki pemformatan umum yang diterapkan. 1 Format ketat yang menyertakan karakter escape dan pemisah baris. Menghasilkan string yang dapat diurai ketika dimasukkan ke bilah rumus. Enkapsulasi mengembalikan string dalam tanda petik kecuali untuk Boolean, Angka, dan Kesalahan.' },
        },
    },
    BAHTTEXT: {
        description: 'Mengonversi angka menjadi teks bahasa Thailand dan menambahkan akhiran "Baht."',
        abstract: 'Mengonversi angka menjadi teks bahasa Thailand dan menambahkan akhiran "Baht."',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang ingin Anda konversi menjadi teks, atau referensi ke sel berisi angka atau rumus yang mengevaluasi ke sebuah angka.' },
        },
    },
    CHAR: {
        description: 'Mengembalikan karakter yang ditentukan oleh nomor kode.',
        abstract: 'Mengembalikan karakter yang ditentukan oleh nomor kode.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Angka antara 1 dan 255 yang menentukan karakter yang Anda inginkan. Karakter berasal dari kumpulan karakter yang digunakan komputer Anda.' },
        },
    },
    CLEAN: {
        description: 'Menghapus semua karakter tak dapat dicetak dari teks. Gunakan CLEAN pada teks yang diimpor dari aplikasi lain yang berisi karakter yang mungkin tidak tercetak pada sistem operasi Anda. Misalnya, Anda dapat menggunakan CLEAN untuk menghapus suatu kode komputer tingkat rendah yang sering berada di awal dan akhir file data dan tidak dapat dicetak.',
        abstract: 'Menghapus semua karakter tak dapat dicetak dari teks. Gunakan CLEAN pada teks yang diimpor dari aplikasi lain yang berisi karakter yang mungkin tidak tercetak pada sistem operasi Anda. Misalnya, Anda dapat menggunakan CLEAN untuk menghapus suatu kode komputer tingkat rendah yang sering berada di awal dan akhir file data dan tidak dapat dicetak.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Informasi lembar kerja yang karakter tak dapat dicetaknya ingin Anda hapus .' },
        },
    },
    CODE: {
        description: 'Mengembalikan kode numerik untuk karakter pertama dalam string teks.',
        abstract: 'Mengembalikan kode numerik untuk karakter pertama dalam string teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks yang karakter pertamanya ingin Anda ketahui kodenya.' },
        },
    },
    CONCAT: {
        description: 'Fungsi CONCAT menggabungkan teks dari beberapa rentang dan/atau string, tetapi tidak menyediakan argumen pemisah atau IgnoreEmpty.',
        abstract: 'Fungsi CONCAT menggabungkan teks dari beberapa rentang dan/atau string, tetapi tidak menyediakan argumen pemisah atau IgnoreEmpty.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Item teks yang akan digabungkan. String, atau larik string, seperti rentang sel.' },
            text2: { name: 'text2', detail: 'Item teks tambahan yang akan digabungkan. Bisa ada maksimum 253 argumen teks untuk item teks. Masing-masing dapat berupa string atau larik string, seperti rentang sel.' },
        },
    },
    CONCATENATE: {
        description: 'Gunakan CONCATENATE , salah satu dari fungsi teks , untuk menggabungkan dua atau beberapa string teks menjadi satu string.',
        abstract: 'Gunakan CONCATENATE , salah satu dari fungsi teks , untuk menggabungkan dua atau beberapa string teks menjadi satu string.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Item pertama yang akan digabungkan. Item dapat berupa nilai teks, angka, atau referensi sel.' },
            text2: { name: 'text2', detail: 'Item teks tambahan yang akan digabungkan. Anda dapat memiliki hingga 255 item dengan total hingga 8.192 karakter.' },
        },
    },
    DBCS: {
        description: 'Fungsi yang diuraikan dalam topik Bantuan ini mengonversi huruf kecil (bit tunggal) di dalam sebuah string karakter menjadi huruf besar (bit ganda). Nama fungsi (dan karakter yang dikonversikan) bergantung pada pengaturan bahasa Anda.',
        abstract: 'Fungsi yang diuraikan dalam topik Bantuan ini mengonversi huruf kecil (bit tunggal) di dalam sebuah string karakter menjadi huruf besar (bit ganda). Nama fungsi (dan karakter yang dikonversikan) bergantung pada pengaturan bahasa Anda.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks atau referensi ke sel yang berisi teks yang ingin Anda ubah. Jika teks tidak berisi huruf Latin atau katakana kecil, maka teks tidak berubah.' },
        },
    },
    DOLLAR: {
        description: 'Fungsi DOLLAR , salah satu fungsi TEXT , mengonversi angka menjadi teks menggunakan format mata uang, dengan desimal yang dibulatkan ke jumlah tempat yang Anda tentukan. DOLLAR menggunakan $#,##0.00_); ($#,##0.00) format angka, meskipun simbol mata uang yang diterapkan bergantung pada pengaturan bahasa lokal Anda.',
        abstract: 'Fungsi DOLLAR , salah satu fungsi TEXT , mengonversi angka menjadi teks menggunakan format mata uang, dengan desimal yang dibulatkan ke jumlah tempat yang Anda tentukan. DOLLAR menggunakan $#,##0.00_); ($#,##0.00) format angka, meskipun simbol mata uang yang diterapkan bergantung pada pengaturan bahasa lokal Anda.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka, atau referensi ke sel berisi angka atau rumus yang mengevaluasi ke sebuah angka.' },
            decimals: { name: 'decimals', detail: 'Opsional. Jumlah digit di sebelah kanan koma desimal. Jika ini negatif, angka dibulatkan ke sebelah kiri koma desimal. Jika Anda menghilangkan desimal, diasumsikan menjadi 2.' },
        },
    },
    EXACT: {
        description: 'Membandingkan dua string teks dan akan mengembalikan TRUE jika kedua string itu sama persis, jika tidak akan mengembalikan FALSE. EXACT peka huruf besar kecil tapi mengabaikan perbedaan pemformatan. Gunakan EXACT untuk menguji teks yang dimasukkan ke dalam dokumen.',
        abstract: 'Membandingkan dua string teks dan akan mengembalikan TRUE jika kedua string itu sama persis, jika tidak akan mengembalikan FALSE. EXACT peka huruf besar kecil tapi mengabaikan perbedaan pemformatan. Gunakan EXACT untuk menguji teks yang dimasukkan ke dalam dokumen.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Diperlukan. String teks pertama.' },
            text2: { name: 'text2', detail: 'Diperlukan. String teks kedua.' },
        },
    },
    FIND: {
        description: 'Menemukan satu nilai teks di dalam nilai teks lain dengan membedakan huruf besar dan kecil.',
        abstract: 'Menemukan satu nilai teks di dalam nilai teks lain dengan membedakan huruf besar dan kecil.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Teks yang ingin Anda temukan.' },
            withinText: { name: 'within_text', detail: 'Teks yang berisi teks yang ingin Anda temukan.' },
            startNum: { name: 'start_num', detail: 'Menentukan karakter untuk memulai pencarian. Jika start_num dihilangkan, nilainya dianggap 1.' },
        },
    },
    FINDB: {
        description: 'Menemukan satu nilai teks di dalam nilai teks lain dengan membedakan huruf besar dan kecil.',
        abstract: 'Menemukan satu nilai teks di dalam nilai teks lain dengan membedakan huruf besar dan kecil.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Teks yang ingin Anda temukan.' },
            withinText: { name: 'within_text', detail: 'Teks yang berisi teks yang ingin Anda temukan.' },
            startNum: { name: 'start_num', detail: 'Menentukan karakter untuk memulai pencarian. Jika start_num dihilangkan, nilainya dianggap 1.' },
        },
    },
    FIXED: {
        description: 'Membulatkan angka ke jumlah desimal yang ditentukan, memformat angka dalam format desimal dengan menggunakan titik dan koma, dan mengembalikan hasil sebagai teks.',
        abstract: 'Membulatkan angka ke jumlah desimal yang ditentukan, memformat angka dalam format desimal dengan menggunakan titik dan koma, dan mengembalikan hasil sebagai teks.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang ingin Anda bulatkan dan konversikan menjadi teks.' },
            decimals: { name: 'decimals', detail: 'Opsional. Jumlah digit di sebelah kanan koma desimal.' },
            noCommas: { name: 'no_commas', detail: 'Opsional. Nilai logika yang, jika TRUE, mencegah agar FIXED tidak memasukkan koma ke dalam teks yang dikembalikan.' },
        },
    },
    LEFT: {
        description: 'Mengembalikan karakter paling kiri dari nilai teks.',
        abstract: 'Mengembalikan karakter paling kiri dari nilai teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'String teks yang berisi karakter yang ingin Anda ekstrak.' },
            numChars: { name: 'num_chars', detail: 'Menentukan jumlah karakter yang ingin diekstrak LEFT.' },
        },
    },
    LEFTB: {
        description: 'Mengembalikan karakter paling kiri dari nilai teks.',
        abstract: 'Mengembalikan karakter paling kiri dari nilai teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'String teks yang berisi karakter yang ingin Anda ekstrak.' },
            numBytes: { name: 'num_bytes', detail: 'Menentukan jumlah karakter yang ingin diekstrak LEFTB berdasarkan byte.' },
        },
    },
    LEN: {
        description: 'Mengembalikan jumlah karakter dalam string teks.',
        abstract: 'Mengembalikan jumlah karakter dalam string teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks yang panjangnya ingin Anda temukan. Spasi dihitung sebagai karakter.' },
        },
    },
    LENB: {
        description: 'Mengembalikan jumlah byte yang digunakan untuk merepresentasikan karakter dalam string teks.',
        abstract: 'Mengembalikan jumlah byte yang digunakan untuk merepresentasikan karakter dalam string teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks yang panjangnya ingin Anda temukan. Spasi dihitung sebagai karakter.' },
        },
    },
    LOWER: {
        description: 'Mengonversi teks menjadi huruf kecil.',
        abstract: 'Mengonversi teks menjadi huruf kecil.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks yang ingin Anda konversi menjadi huruf kecil.' },
        },
    },
    MID: {
        description: 'Mengembalikan sejumlah karakter tertentu dari string teks mulai dari posisi yang ditentukan.',
        abstract: 'Mengembalikan sejumlah karakter tertentu dari string teks mulai dari posisi yang ditentukan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'String teks yang berisi karakter yang ingin Anda ekstrak.' },
            startNum: { name: 'start_num', detail: 'Posisi karakter pertama dalam teks yang ingin Anda ekstrak.' },
            numChars: { name: 'num_chars', detail: 'Menentukan jumlah karakter yang ingin diekstrak MID.' },
        },
    },
    MIDB: {
        description: 'Mengembalikan sejumlah karakter tertentu dari string teks mulai dari posisi yang ditentukan.',
        abstract: 'Mengembalikan sejumlah karakter tertentu dari string teks mulai dari posisi yang ditentukan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'String teks yang berisi karakter yang ingin Anda ekstrak.' },
            startNum: { name: 'start_num', detail: 'Posisi karakter pertama dalam teks yang ingin Anda ekstrak.' },
            numBytes: { name: 'num_bytes', detail: 'Menentukan jumlah karakter yang ingin diekstrak MIDB berdasarkan byte.' },
        },
    },
    NUMBERSTRING: {
        description: 'Mengonversi angka menjadi string bahasa Mandarin.',
        abstract: 'Mengonversi angka menjadi string bahasa Mandarin.',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Nilai yang dikonversi menjadi string bahasa Mandarin.' },
            type: { name: 'type', detail: 'Jenis hasil yang dikembalikan. \n1. Huruf kecil bahasa Mandarin \n2. Huruf besar bahasa Mandarin \n3. Karakter Mandarin untuk membaca dan menulis' },
        },
    },
    NUMBERVALUE: {
        description: 'Mengonversi teks menjadi angka secara lokal independen.',
        abstract: 'Mengonversi teks menjadi angka secara lokal independen.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks yang akan dikonversi menjadi angka.' },
            decimalSeparator: { name: 'decimal_separator', detail: 'Opsional. Karakter yang digunakan untuk memisahkan bilangan bulat dan bagian pecahan dari hasil.' },
            groupSeparator: { name: 'group_separator', detail: 'Opsional. Karakter yang digunakan untuk memisahkan pengelompokan angka, seperti ribuan dari ratusan dan jutaan dari ribuan.' },
        },
    },
    PHONETIC: {
        description: 'Mengekstrak karakter fonetik (furigana) dari string teks.',
        abstract: 'Mengekstrak karakter fonetik (furigana) dari string teks.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Referensi', detail: 'Diperlukan. String teks atau referensi ke sel tunggal atau rangkaian sel yang berisi string teks furigana.' },
        },
    },
    PROPER: {
        description: 'Menjadikan huruf besar untuk huruf pertama dalam string teks dan huruf-huruf lain dalam teks yang mengikuti karakter selain huruf. Mengonversi semua huruf lain menjadi huruf kecil.',
        abstract: 'Menjadikan huruf besar untuk huruf pertama dalam string teks dan huruf-huruf lain dalam teks yang mengikuti karakter selain huruf. Mengonversi semua huruf lain menjadi huruf kecil.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks yang berada di dalam tanda kutip, rumus yang mengembalikan teks, atau referensi ke sel yang berisi teks yang sebagiannya ingin Anda jadikan huruf besar.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Mengekstrak substring pertama yang cocok berdasarkan ekspresi reguler.',
        abstract: 'Mengekstrak substring pertama yang cocok berdasarkan ekspresi reguler.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098244?hl=id',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks masukan.' },
            regularExpression: { name: 'regular_expression', detail: 'Bagian pertama teks yang cocok dengan ekspresi ini akan dikembalikan.' },
        },
    },
    REGEXMATCH: {
        description: 'Menentukan apakah suatu teks cocok dengan ekspresi reguler.',
        abstract: 'Menentukan apakah suatu teks cocok dengan ekspresi reguler.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098292?hl=id',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks yang akan diuji terhadap ekspresi reguler.' },
            regularExpression: { name: 'regular_expression', detail: 'Ekspresi reguler untuk menguji teks.' },
        },
    },
    REGEXREPLACE: {
        description: 'Mengganti bagian dari string teks dengan string teks lain menggunakan ekspresi reguler.',
        abstract: 'Mengganti bagian dari string teks dengan string teks lain menggunakan ekspresi reguler.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098245?hl=id',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks yang sebagian isinya akan diganti.' },
            regularExpression: { name: 'regular_expression', detail: 'Ekspresi reguler. Semua bagian teks yang cocok akan diganti.' },
            replacement: { name: 'replacement', detail: 'Teks yang akan disisipkan ke dalam teks asli.' },
        },
    },
    REPLACE: {
        description: 'Mengganti karakter dalam teks.',
        abstract: 'Mengganti karakter dalam teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Teks yang beberapa karakternya ingin Anda ganti.' },
            startNum: { name: 'start_num', detail: 'Posisi karakter dalam old_text yang ingin Anda ganti dengan new_text.' },
            numChars: { name: 'num_chars', detail: 'Jumlah karakter dalam old_text yang ingin diganti REPLACE dengan new_text.' },
            newText: { name: 'new_text', detail: 'Teks yang akan menggantikan karakter dalam old_text.' },
        },
    },
    REPLACEB: {
        description: 'Mengganti karakter dalam teks.',
        abstract: 'Mengganti karakter dalam teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Teks yang beberapa karakternya ingin Anda ganti.' },
            startNum: { name: 'start_num', detail: 'Posisi karakter dalam old_text yang ingin Anda ganti dengan new_text.' },
            numBytes: { name: 'num_bytes', detail: 'Jumlah byte dalam old_text yang ingin diganti REPLACEB dengan new_text.' },
            newText: { name: 'new_text', detail: 'Teks yang akan menggantikan karakter dalam old_text.' },
        },
    },
    REPT: {
        description: 'Mengulang teks sebanyak jumlah tertentu. Gunakan REPT untuk mengisi sel dengan jumlah item string teks.',
        abstract: 'Mengulang teks sebanyak jumlah tertentu. Gunakan REPT untuk mengisi sel dengan jumlah item string teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks yang ingin Anda ulang.' },
            numberTimes: { name: 'number_times', detail: 'Diperlukan. Angka positif yang menentukan berapa kali teks diulang.' },
        },
    },
    RIGHT: {
        description: 'Mengembalikan karakter paling kanan dari nilai teks.',
        abstract: 'Mengembalikan karakter paling kanan dari nilai teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'String teks yang berisi karakter yang ingin Anda ekstrak.' },
            numChars: { name: 'num_chars', detail: 'Menentukan jumlah karakter yang ingin diekstrak RIGHT.' },
        },
    },
    RIGHTB: {
        description: 'Mengembalikan karakter paling kanan dari nilai teks.',
        abstract: 'Mengembalikan karakter paling kanan dari nilai teks.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'String teks yang berisi karakter yang ingin Anda ekstrak.' },
            numBytes: { name: 'num_bytes', detail: 'Menentukan jumlah karakter yang ingin diekstrak RIGHTB berdasarkan byte.' },
        },
    },
    SEARCH: {
        description: 'Menemukan satu nilai teks di dalam nilai teks lain tanpa membedakan huruf besar dan kecil.',
        abstract: 'Menemukan satu nilai teks di dalam nilai teks lain tanpa membedakan huruf besar dan kecil.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Teks yang ingin Anda temukan.' },
            withinText: { name: 'within_text', detail: 'Teks yang berisi teks yang ingin Anda temukan.' },
            startNum: { name: 'start_num', detail: 'Menentukan karakter untuk memulai pencarian. Jika start_num dihilangkan, nilainya dianggap 1.' },
        },
    },
    SEARCHB: {
        description: 'Menemukan satu nilai teks di dalam nilai teks lain tanpa membedakan huruf besar dan kecil.',
        abstract: 'Menemukan satu nilai teks di dalam nilai teks lain tanpa membedakan huruf besar dan kecil.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Teks yang ingin Anda temukan.' },
            withinText: { name: 'within_text', detail: 'Teks yang berisi teks yang ingin Anda temukan.' },
            startNum: { name: 'start_num', detail: 'Menentukan karakter untuk memulai pencarian. Jika start_num dihilangkan, nilainya dianggap 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Mengganti old_text dengan new_text di string teks. Gunakan SUBSTITUTE saat Anda ingin mengganti teks tertentu dalam string teks; gunakan REPLACE saat Anda ingin mengganti teks apa pun yang muncul di lokasi tertentu dalam string teks.',
        abstract: 'Mengganti old_text dengan new_text di string teks. Gunakan SUBSTITUTE saat Anda ingin mengganti teks tertentu dalam string teks; gunakan REPLACE saat Anda ingin mengganti teks apa pun yang muncul di lokasi tertentu dalam string teks.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks atau referensi sel berisi teks yang ingin Anda ganti karakternya.' },
            oldText: { name: 'old_text', detail: 'Diperlukan. Teks yang ingin Anda ganti.' },
            newText: { name: 'new_text', detail: 'Diperlukan. Teks yang ingin Anda gunakan untuk mengganti old_text.' },
            instanceNum: { name: 'instance_num', detail: 'Opsional. Menentukan kemunculan old_text yang ingin Anda ganti dengan new_text. Jika Anda menentukan instance_num, hanya old_text itu yang diganti. Jika tidak, setiap kemunculan old_text dalam text diganti ke new_text.' },
        },
    },
    T: {
        description: 'Mengembalikan teks yang dirujuk oleh nilai.',
        abstract: 'Mengembalikan teks yang dirujuk oleh nilai.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Diperlukan. Nilai yang ingin Anda uji.' },
        },
    },
    TEXT: {
        description: 'Fungsi TEXT memungkinkan Anda untuk mengubah cara angka muncul dengan menerapkan pemformatan ke dalamnya dengan kode format . Hal ini bermanfaat ketika Anda ingin menampilkan angka dalam format yang lebih mudah dibaca, atau ketika ingin menggabungkan angka dengan teks atau simbol.',
        abstract: 'Fungsi TEXT memungkinkan Anda untuk mengubah cara angka muncul dengan menerapkan pemformatan ke dalamnya dengan kode format . Hal ini bermanfaat ketika Anda ingin menampilkan angka dalam format yang lebih mudah dibaca, atau ketika ingin menggabungkan angka dengan teks atau simbol.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Nilai angka yang ingin Anda konversi menjadi teks.' },
            formatText: { name: 'format_text', detail: 'String teks yang menentukan pemformatan yang ingin diterapkan pada nilai yang diberikan.' },
        },
    },
    TEXTAFTER: {
        description: 'Mengembalikan teks yang muncul setelah karakter atau string tertentu. Fungsi ini merupakan kebalikan dari fungsi TEXTBEFORE .',
        abstract: 'Mengembalikan teks yang muncul setelah karakter atau string tertentu. Fungsi ini merupakan kebalikan dari fungsi TEXTBEFORE .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks tempat Anda melakukan pencarian. Karakter wildcard tidak diperbolehkan.' },
            delimiter: { name: 'delimiter', detail: 'Teks yang menandai titik setelah teks yang ingin Anda ekstrak.' },
            instanceNum: { name: 'instance_num', detail: 'Kemunculan pemisah setelahnya teks akan diekstrak.' },
            matchMode: { name: 'match_mode', detail: 'Menentukan apakah pencarian teks peka huruf besar/kecil. Default-nya peka huruf besar/kecil.' },
            matchEnd: { name: 'match_end', detail: 'Memperlakukan akhir teks sebagai pemisah. Secara default, teks harus cocok persis.' },
            ifNotFound: { name: 'if_not_found', detail: 'Nilai yang dikembalikan jika tidak ditemukan kecocokan. Secara default, #N/A dikembalikan.' },
        },
    },
    TEXTBEFORE: {
        description: 'Mengembalikan teks yang muncul sebelum karakter atau string tertentu. Fungsi ini merupakan kebalikan dari fungsi TEXTAFTER .',
        abstract: 'Mengembalikan teks yang muncul sebelum karakter atau string tertentu. Fungsi ini merupakan kebalikan dari fungsi TEXTAFTER .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks tempat Anda melakukan pencarian. Karakter wildcard tidak diperbolehkan.' },
            delimiter: { name: 'delimiter', detail: 'Teks yang menandai titik sebelum teks yang ingin Anda ekstrak.' },
            instanceNum: { name: 'instance_num', detail: 'Kemunculan pemisah sebelumnya teks akan diekstrak.' },
            matchMode: { name: 'match_mode', detail: 'Menentukan apakah pencarian teks peka huruf besar/kecil. Default-nya peka huruf besar/kecil.' },
            matchEnd: { name: 'match_end', detail: 'Memperlakukan awal teks sebagai pemisah. Secara default, teks harus cocok persis.' },
            ifNotFound: { name: 'if_not_found', detail: 'Nilai yang dikembalikan jika tidak ditemukan kecocokan. Secara default, #N/A dikembalikan.' },
        },
    },
    TEXTJOIN: {
        description: 'Fungsi TEXTJOIN menggabungkan teks dari beberapa rentang dan/atau string, serta menyertakan pemisah yang Anda tentukan antara tiap nilai teks yang akan digabungkan. Jika pemisah adalah string teks kosong, fungsi ini akan secara efektif menggabungkan rentang.',
        abstract: 'Fungsi TEXTJOIN menggabungkan teks dari beberapa rentang dan/atau string, serta menyertakan pemisah yang Anda tentukan antara tiap nilai teks yang akan digabungkan. Jika pemisah adalah string teks kosong, fungsi ini akan secara efektif menggabungkan rentang.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'String teks, salah satu kosong, atau satu atau beberapa karakter diapit oleh tanda kutip ganda, atau referensi ke sebuah string teks yang valid. Jika angka dimasukkan, maka akan dianggap sebagai teks.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Jika TRUE, sel kosong diabaikan.' },
            text1: { name: 'text1', detail: 'Item teks yang digabungkan. String teks, atau larik string, seperti rentang sel.' },
            text2: { name: 'text2', detail: 'Item teks tambahan untuk digabungkan. Bisa ada maksimum 252 argumen teks untuk item teks, termasuk text1 . Setiap argumen dapat berupa string teks, atau larik string, seperti rentang sel.' },
        },
    },
    TEXTSPLIT: {
        description: 'Fungsi TEXTSPLIT berfungsi sama seperti Wizard Teks-ke-Kolom , tetapi dalam bentuk rumus. Fungsi ini memungkinkan Anda memisahkan menurut kolom atau ke bawah menurut baris. Ini adalah kebalikan dari fungsi TEXTJOIN .',
        abstract: 'Fungsi TEXTSPLIT berfungsi sama seperti Wizard Teks-ke-Kolom , tetapi dalam bentuk rumus. Fungsi ini memungkinkan Anda memisahkan menurut kolom atau ke bawah menurut baris. Ini adalah kebalikan dari fungsi TEXTJOIN .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks yang ingin Anda pisahkan. Diperlukan.' },
            colDelimiter: { name: 'col_delimiter', detail: 'Teks yang menandai titik tempat untuk menumpahkan teks di seluruh kolom.' },
            rowDelimiter: { name: 'row_delimiter', detail: 'Teks yang menandai titik tempat untuk menumpahkan teks ke bawah baris. Opsional.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Tentukan TRUE untuk mengabaikan pemisah berurutan. Default ke FALSE, yang membuat sel kosong. Opsional.' },
            matchMode: { name: 'match_mode', detail: 'Tentukan 1 untuk melakukan kecocokan yang tidak peka huruf besar kecil. Default ke 0, yang melakukan kecocokan peka huruf besar kecil. Opsional.' },
            padWith: { name: 'pad_with', detail: 'Nilai untuk mengalihkan hasil. Defaultnya adalah #N/A.' },
        },
    },
    TRIM: {
        description: 'Menghapus semua spasi dari teks kecuali spasi tunggal di antara kata. Gunakan TRIM pada teks yang Anda terima dari aplikasi lain yang mungkin memiliki penspasian tak tentu.',
        abstract: 'Menghapus semua spasi dari teks kecuali spasi tunggal di antara kata. Gunakan TRIM pada teks yang Anda terima dari aplikasi lain yang mungkin memiliki penspasian tak tentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Teks yang ingin Anda hapus spasinya. Teks harus dimuat dalam tanda petik.' },
        },
    },
    UNICHAR: {
        description: 'Mengembalikan karakter Unicode yang dirujuk oleh nilai numerik yang diberikan.',
        abstract: 'Mengembalikan karakter Unicode yang dirujuk oleh nilai numerik yang diberikan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka adalah angka Unicode yang menyatakan karakter tersebut.' },
        },
    },
    UNICODE: {
        description: 'Mengembalikan angka (titik kode) yang terkait dengan karakter pertama dari teks.',
        abstract: 'Mengembalikan angka (titik kode) yang terkait dengan karakter pertama dari teks.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks adalah karakter yang Anda inginkan nilai Unicode-nya.' },
        },
    },
    UPPER: {
        description: 'Mengonversi teks menjadi huruf besar.',
        abstract: 'Mengonversi teks menjadi huruf besar.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks yang ingin Anda konversi ke huruf besar. Teks dapat berupa referensi atau string teks.' },
        },
    },
    VALUE: {
        description: 'Mengonversi string teks yang menyatakan angka menjadi angka.',
        abstract: 'Mengonversi string teks yang menyatakan angka menjadi angka.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Diperlukan. Teks dalam tanda kutip atau referensi ke sel yang berisi teks yang akan dikonversi.' },
        },
    },
    VALUETOTEXT: {
        description: 'Fungsi VALUETOTEXT mengembalikan teks dari nilai tertentu. Ini melewati nilai teks tidak berubah, dan mengonversi nilai non-teks menjadi teks.',
        abstract: 'Fungsi VALUETOTEXT mengembalikan teks dari nilai tertentu. Ini melewati nilai teks tidak berubah, dan mengonversi nilai non-teks menjadi teks.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Nilai untuk dikembalikan sebagai teks. Diperlukan.' },
            format: { name: 'format', detail: 'Format data yang dikembalikan. Opsional. Ini bisa menjadi salah satu dari dua nilai: 0 Default. Format ringkas yang mudah dibaca. Teks yang dikembalikan akan sama seperti teks yang disajikan dalam sel yang memiliki pemformatan umum yang diterapkan. 1 Format ketat yang menyertakan karakter escape dan pemisah baris. Menghasilkan string yang dapat diurai ketika dimasukkan ke bilah rumus. Enkapsulasi mengembalikan string dalam tanda petik kecuali untuk Boolean, Angka, dan Kesalahan.' },
        },
    },
    CALL: {
        description: 'Memanggil prosedur dalam pustaka link dinamis atau sumber daya kode. Terdapat dua bentuk sintaks fungsi ini. Gunakan sintaks 1 hanya dengan sumber daya kode yang terdaftar sebelumnya, yang menggunakan argumen dari fungsi REGISTER. Gunakan sintaks 2a atau 2b pada daftar secara bersamaan dan memanggil sumber daya kode.',
        abstract: 'Memanggil prosedur dalam pustaka link dinamis atau sumber daya kode. Terdapat dua bentuk sintaks fungsi ini. Gunakan sintaks 1 hanya dengan sumber daya kode yang terdaftar sebelumnya, yang menggunakan argumen dari fungsi REGISTER. Gunakan sintaks 2a atau 2b pada daftar secara bersamaan dan memanggil sumber daya kode.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Diperlukan. Teks kutipan yang menentukan nama pustaka link dinamis (DLL) yang berisi prosedur di Microsoft Excel untuk Windows.' },
            procedure: { name: 'Prosedur', detail: 'Diperlukan. Teks yang menentukan nama fungsi dalam DLL di Microsoft Excel untuk Windows. Anda juga dapat menggunakan nilai ordinal fungsi dari pernyataan EXPORTS dalam file definisi modul (.DEF). Nilai ordinal harus dalam bentuk teks.' },
            typeText: { name: 'Type_text', detail: 'Diperlukan. Teks yang menyatakan tipe data dari nilai yang dikembalikan dan tipe data dari semua argumen pada DLL atau sumber daya kode. Huruf pertama type_text menyatakan nilai yang dikembalikan. Kode yang Anda gunakan untuk type_text diuraikan secara detail dalam Penggunaan fungsi CALL dan REGISTER . Untuk DLL atau sumber daya kode (XLL) yang berdiri sendiri, Anda dapat menghapus argumen ini.' },
            argument1: { name: 'Argumen1,...', detail: 'Opsional. Argumen yang akan dikirim ke prosedur.' },
        },
    },
    EUROCONVERT: {
        description: 'Mengonversi angka ke euro, mengonversi angka dari euro ke mata uang anggota euro, atau mengonversi angka dari satu mata uang anggota euro ke mata uang lain dengan menggunakan euro sebagai perantara (triangulasi). Mata uang yang tersedia untuk dikonversi adalah mata uang negara-negara anggota Uni Eropa (UE) yang telah mengadopsi euro. Fungsi ini menggunakan nilai konversi tetap yang dibuat oleh UE.',
        abstract: 'Mengonversi angka ke euro, mengonversi angka dari euro ke mata uang anggota euro, atau mengonversi angka dari satu mata uang anggota euro ke mata uang lain dengan menggunakan euro sebagai perantara (triangulasi). Mata uang yang tersedia untuk dikonversi adalah mata uang negara-negara anggota Uni Eropa (UE) yang telah mengadopsi euro. Fungsi ini menggunakan nilai konversi tetap yang dibuat oleh UE.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Angka', detail: 'Diperlukan. Nilai mata uang yang ingin Anda konversi, atau referensi ke sebuah sel yang berisi nilai tersebut.' },
            source: { name: 'Sumber', detail: 'Diperlukan. String tiga huruf, atau referensi ke sel yang berisi string tersebut, yang terkait kode ISO untuk mata uang sumber. Kode mata uang berikut tersedia dalam fungsi EUROCONVERT:' },
            target: { name: 'Target', detail: 'Diperlukan. String tiga huruf, atau referensi sel, yang terkait dengan kode ISO mata uang hasil konversi angka. Lihat tabel Sumber sebelumnya untuk melihat kode ISO.' },
            fullPrecision: { name: 'Full_precision', detail: 'Diperlukan. Sebuah nilai logika (TRUE atau FALSE), atau ekspresi yang mengevaluasi sebuah nilai sebagai TRUE atau FALSE, yang menentukan cara menampilkan hasilnya.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'Diperlukan. Sebuah bilangan bulat sama dengan atau lebih dari 3 yang menentukan jumlah digit signifikan yang akan digunakan untuk nilai euro langsung ketika mengonversi antara dua mata uang anggota euro. Jika Anda menghilangkan argumen ini, Excel tidak membulatkan nilai euro perantara tersebut. Jika Anda memasukkan argumen ini ketika mengonversi dari suatu mata uang anggota euro ke euro, Excel menghitung nilai euro perantara yang kemudian dapat dikonversi ke mata uang anggota euro.' },
        },
    },
    REGISTER_ID: {
        description: 'Mengembalikan ID pendaftaran dari pustaka link dinamis (DLL, Dynamic Link Library) yang ditentukan atau sumber daya kode yang telah didaftarkan sebelumnya. Jika DLL atau sumber daya kode belum didaftarkan, fungsi ini mendaftarkan DLL atau sumber daya kode lalu mengembalikan ID pendaftaran.',
        abstract: 'Mengembalikan ID pendaftaran dari pustaka link dinamis (DLL, Dynamic Link Library) yang ditentukan atau sumber daya kode yang telah didaftarkan sebelumnya. Jika DLL atau sumber daya kode belum didaftarkan, fungsi ini mendaftarkan DLL atau sumber daya kode lalu mengembalikan ID pendaftaran.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Diperlukan. Teks yang menyatakan nama DLL yang memuat fungsi dalam Microsoft Excel untuk Windows.' },
            procedure: { name: 'Prosedur', detail: 'Diperlukan. Teks yang menentukan nama fungsi dalam DLL di Microsoft Excel untuk Windows. Anda juga dapat menggunakan nilai ordinal fungsi dari pernyataan EXPORTS dalam file definisi modul (.DEF). Nilai ordinal atau nomor ID sumber daya tidak boleh dalam bentuk teks.' },
            typeText: { name: 'Type_text', detail: 'Opsional. Teks yang menyatakan tipe data nilai yang dikembalikan dan tipe data semua argumen ke DLL. Huruf pertama type_text menyatakan nilai yang dikembalikan. Jika fungsi atau sumber daya kode sudah didaftarkan, Anda dapat menghilangkan argumen ini.' },
        },
    },
};

export default locale;
