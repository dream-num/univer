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
    DAVERAGE: {
        description: 'Menghitung rata-rata nilai dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang ditentukan.',
        abstract: 'Menghitung rata-rata nilai dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'adalah rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'menunjukkan kolom mana yang digunakan dalam fungsi. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'adalah rentang sel yang berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DCOUNT: {
        description: 'Menghitung sel-sel yang berisi angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan syarat yang ditentukan.',
        abstract: 'Menghitung sel-sel yang berisi angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan syarat yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama argumen meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DCOUNTA: {
        description: 'Menghitung sel-sel yang tidak kosong dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        abstract: 'Menghitung sel-sel yang tidak kosong dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Opsional. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DGET: {
        description: 'Mengekstrak nilai tunggal dari kolom suatu daftar atau database yang cocok dengan syarat yang Anda tentukan.',
        abstract: 'Mengekstrak nilai tunggal dari kolom suatu daftar atau database yang cocok dengan syarat yang Anda tentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DMAX: {
        description: 'Mengembalikan angka terbesar dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan syarat yang ditentukan.',
        abstract: 'Mengembalikan angka terbesar dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan syarat yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DMIN: {
        description: 'Mengembalikan angka terkecil dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan dengan kondisi yang Anda tentukan.',
        abstract: 'Mengembalikan angka terkecil dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan dengan kondisi yang Anda tentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DPRODUCT: {
        description: 'Mengalikan nilai dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        abstract: 'Mengalikan nilai dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DSTDEV: {
        description: 'Memperkirakan simpangan baku populasi berdasarkan sampel dengan menggunakan angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        abstract: 'Memperkirakan simpangan baku populasi berdasarkan sampel dengan menggunakan angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DSTDEVP: {
        description: 'Menghitung simpangan baku populasi berdasarkan populasi keseluruhan dengan menggunakan angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        abstract: 'Menghitung simpangan baku populasi berdasarkan populasi keseluruhan dengan menggunakan angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DSUM: {
        description: 'Dalam daftar atau database, DSUM menyediakan jumlah angka dalam bidang (kolom) rekaman yang cocok dengan kondisi tertentu.',
        abstract: 'Dalam daftar atau database, DSUM menyediakan jumlah angka dalam bidang (kolom) rekaman yang cocok dengan kondisi tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Ini adalah rentang sel yang membentuk daftar atau database. Database adalah daftar data terkait di mana baris informasi terkait adalah rekaman , dan kolom data adalah bidang . Baris pertama daftar berisi label untuk setiap kolom di dalamnya.' },
            field: { name: 'field', detail: 'Diperlukan. Ini menentukan kolom mana yang digunakan dalam fungsi. Tentukan label kolom yang diapit antara tanda kutip ganda, seperti "Usia" atau "Hasil," misalnya. Alternatifnya, Anda dapat menentukan angka (tanpa tanda kutip) yang mewakili posisi kolom dalam daftar: misalnya 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Ini adalah rentang sel yang berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DVAR: {
        description: 'Memperkirakan varians populasi berdasarkan sampel dengan menggunakan angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        abstract: 'Memperkirakan varians populasi berdasarkan sampel dengan menggunakan angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
    DVARP: {
        description: 'Menghitung varians populasi berdasarkan populasi keseluruhan dengan menggunakan angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        abstract: 'Menghitung varians populasi berdasarkan populasi keseluruhan dengan menggunakan angka dalam bidang (kolom) rekaman dalam daftar atau database yang cocok dengan kondisi yang Anda tentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Diperlukan. Rentang sel yang membentuk daftar atau database. Database adalah daftar dari data yang terkait di mana baris-baris informasi terkait adalah rekaman, dan kolom-kolom data adalah bidang. Baris pertama daftar tersebut berisi label untuk masing-masing kolom.' },
            field: { name: 'field', detail: 'Diperlukan. Mengindikasikan kolom yang digunakan dalam fungsi tersebut. Masukkan label kolom yang dimasukkan di antara dua tanda kutip ganda, seperti "Umur" atau "Hasil," atau angka (tanpa tanda kutip) yang menyatakan posisi kolom di dalam daftar: 1 untuk kolom pertama, 2 untuk kolom kedua, dan seterusnya.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Rentang sel berisi kondisi yang Anda tentukan. Anda dapat menggunakan rentang untuk argumen kriteria, selama meliputi setidaknya satu label kolom dan setidaknya satu sel di bawah label kolom di mana Anda menentukan kondisi untuk kolom tersebut.' },
        },
    },
};

export default locale;
