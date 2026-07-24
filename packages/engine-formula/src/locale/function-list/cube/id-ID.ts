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
    CUBEKPIMEMBER: {
        description: 'Mengembalikan properti indikator kinerja utama (KPI, Key Performance Indicator) dan menampilkan nama KPI dalam sel. KPI merupakan pengukuran yang dapat dihitung, seperti laba kotor bulanan atau pergantian karyawan per kuartal, yang digunakan untuk memantau kinerja organisasi.',
        abstract: 'Mengembalikan properti indikator kinerja utama (KPI, Key Performance Indicator) dan menampilkan nama KPI dalam sel. KPI merupakan pengukuran yang dapat dihitung, seperti laba kotor bulanan atau pergantian karyawan per kuartal, yang digunakan untuk memantau kinerja organisasi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Koneksi', detail: 'Diperlukan. String teks nama koneksi ke kubus.' },
            kpiName: { name: 'Kpi_name', detail: 'Diperlukan. String teks nama KPI dalam kubus.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Diperlukan. Komponen KPI dikembalikan dan dapat berupa salah satu dari yang berikut:' },
            caption: { name: 'Caption', detail: 'Opsional. String teks alternatif yang ditampilkan dalam sel sebagai ganti kpi_name dan kpi_property.' },
        },
    },
    CUBEMEMBER: {
        description: 'Mengembalikan anggota atau rangkap dari kubus. Gunakan untuk memvalidasi bahwa anggota atau rangkap ada di dalam kubus.',
        abstract: 'Mengembalikan anggota atau rangkap dari kubus. Gunakan untuk memvalidasi bahwa anggota atau rangkap ada di dalam kubus.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Koneksi', detail: 'Diperlukan. String teks nama koneksi ke kubus.' },
            memberExpression: { name: 'Member_expression', detail: 'Diperlukan. Sebuah string teks ekspresi multidimensi (MDX, multidimensional expression) yang mengevaluasi anggota unik dalam kubus. Alternatifnya, member_expression dapat berupa rangkap, yang ditentukan sebagai rentang sel atau konstanta array.' },
            caption: { name: 'Caption', detail: 'Opsional. Sebuah string teks akan ditampilkan dalam sel sebagai ganti keterangan, jika ada, dari kubus. Bila rangkap dikembalikan, keterangan yang digunakan adalah keterangan untuk anggota terakhir dalam rangkap.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Fungsi CUBEMEMBERPROPERTY , salah satu fungsi Kubus di Excel, mengembalikan nilai properti anggota dari kubus. Gunakan untuk memvalidasi bahwa nama anggota ada di dalam kubus dan untuk mengembalikan properti tertentu untuk anggota tersebut.',
        abstract: 'Fungsi CUBEMEMBERPROPERTY , salah satu fungsi Kubus di Excel, mengembalikan nilai properti anggota dari kubus. Gunakan untuk memvalidasi bahwa nama anggota ada di dalam kubus dan untuk mengembalikan properti tertentu untuk anggota tersebut.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Koneksi', detail: 'Diperlukan. String teks nama koneksi ke kubus.' },
            memberExpression: { name: 'Member_expression', detail: 'Diperlukan. Sebuah string teks ekspresi multidimensi (MDX, multidimensional expression) dari anggota dalam kubik.' },
            property: { name: 'Properti', detail: 'Diperlukan. Sebuah string teks berupa nama properti yang dikembalikan atau referensi ke sel yang berisi nama properti.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Mengembalikan nilai ke-n, atau rangking, anggota di dalam suatu kumpuln. Gunakan untuk mengembalikan satu atau beberapa elemen dalam sebuah kumpulan, seperti tenaga penjualan paling berprestasi atau 10 siswa terbaik.',
        abstract: 'Mengembalikan nilai ke-n, atau rangking, anggota di dalam suatu kumpuln. Gunakan untuk mengembalikan satu atau beberapa elemen dalam sebuah kumpulan, seperti tenaga penjualan paling berprestasi atau 10 siswa terbaik.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Koneksi', detail: 'Diperlukan. String teks nama koneksi ke kubus.' },
            setExpression: { name: 'Set_expression', detail: 'Diperlukan. String teks dari sebuah ekspresi set, seperti "{[Item1].children}". Set_expression juga bisa berupa fungsi CUBESET, atau referensi ke sel yang memuat fungsi CUBESET.' },
            rank: { name: 'Peringkat', detail: 'Diperlukan. Bilangan bulat yang menentukan nilai teratas untuk dikembalikan. Jika peringkat berupa nilai 1, maka akan mengembalikan nilai teratas, jika peringkat berupa nilai 2, maka akan mengembalikan nilai teratas kedua, dan seterusnya. Untuk mengembalikan 5 nilai teratas, gunakan CUBERANKEDMEMBER lima kali, yang masing-masing menentukan peringkat yang berbeda, dari 1 sampai 5.' },
            caption: { name: 'Caption', detail: 'Opsional. Sebuah string teks akan ditampilkan dalam sel sebagai ganti keterangan, jika ada, dari kubus.' },
        },
    },
    CUBESET: {
        description: 'Menentukan set terhitung dari anggota atau rangkap dengan mengirim ekspresi set ke kubus pada server, yang membuat set itu, lalu mengembalikan set itu ke Microsoft Excel.',
        abstract: 'Menentukan set terhitung dari anggota atau rangkap dengan mengirim ekspresi set ke kubus pada server, yang membuat set itu, lalu mengembalikan set itu ke Microsoft Excel.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Koneksi', detail: 'Diperlukan. String teks nama koneksi ke kubus.' },
            setExpression: { name: 'Set_expression', detail: 'Diperlukan. String teks dari sebuah ekspresi set yang mengembalikan set anggota atau rangkap. Set_expression juga dapat menjadi referensi sel bagi sebuah rentang Excel yang memuat satu atau beberapa anggota, rangkap, atau beberapa set yang dimasukkan dalam set tersebut.' },
            caption: { name: 'Caption', detail: 'Opsional. Sebuah string teks ditampilkan dalam sel sebagai ganti keterangan, jika ditentukan dari kubus.' },
            sortOrder: { name: 'Sort_order', detail: 'Opsional. Tipe pengurutan, jika ada, untuk dijalankan dapat berupa salah satu dari yang berikut:' },
            sortBy: { name: 'Sort_by', detail: 'Opsional. Sebuah string teks nilai untuk mengurutkan. Misalnya, untuk mendapatkan kota dengan penjualan tertinggi, set_expression berupa serangkaian kota, dan sort_by berupa ukuran penjualan. Misalnya, untuk mendapatkan kota dengan populasi tertinggi, set_expression berupa serangkaian kota, dan sort_by berupa ukuran populasi. Jika sort_order mensyaratkan sort_by, dan sort_by dikosongkan, maka CUBESET mengembalikan pesan kesalahan #VALUE! .' },
        },
    },
    CUBESETCOUNT: {
        description: 'Mengembalikan jumlah item dalam sebuah kumpulan.',
        abstract: 'Mengembalikan jumlah item dalam sebuah kumpulan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Set', detail: 'Diperlukan. Sebuah string teks ekspresi Microsoft Excel yang mengevaluasi sebuah kumpulan yang ditentukan oleh fungsi CUBESET. Set juga bisa berupa fungsi CUBESET, atau referensi ke sel yang memuat fungsi CUBESET.' },
        },
    },
    CUBEVALUE: {
        description: 'Mengembalikan nilai agregat dari kubus.',
        abstract: 'Mengembalikan nilai agregat dari kubus.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Koneksi', detail: 'Diperlukan. String teks nama koneksi ke kubus.' },
            memberExpression: { name: 'Member_expression', detail: 'Opsional. Sebuah string teks ekspresi multidimensi (MDX, multidimensional expression) yang mengevaluasi anggota atau rangkap dalam kubus. Alternatifnya, member_expression dapat berupa sebuah set yang ditentukan dengan fungsi CUBESET. Gunakan member_expression sebagai pemotong untuk menentukan bagian kubus di mana nilai agregat dikembalikan. Jika tidak ada ukuran yang ditentukan dalam member_expression, maka ukuran default untuk kubus tersebut akan digunakan.' },
        },
    },
};

export default locale;
