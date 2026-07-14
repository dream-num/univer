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
    ADDRESS: {
        description: 'Anda dapat menggunakan fungsi ADDRESS untuk memperoleh alamat sebuah sel dalam lembar kerja, jika diberikan nomor baris dan kolom yang ditentukan. Misalnya, ADDRESS(2,3) mengembalikan $C$2 . Sebagai contoh lain, ADDRESS(77,300) mengembalikan $KN$77 . Anda dapat menggunakan fungsi-fungsi lain, seperti fungsi ROW dan COLUMN , untuk memberikan argumen kepada nomor baris dan kolom untuk fungsi ADDRESS .',
        abstract: 'Anda dapat menggunakan fungsi ADDRESS untuk memperoleh alamat sebuah sel dalam lembar kerja, jika diberikan nomor baris dan kolom yang ditentukan. Misalnya, ADDRESS(2,3) mengembalikan $C$2 . Sebagai contoh lain, ADDRESS(77,300) mengembalikan $KN$77 . Anda dapat menggunakan fungsi-fungsi lain, seperti fungsi ROW dan COLUMN , untuk memberikan argumen kepada nomor baris dan kolom untuk fungsi ADDRESS .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: { name: 'row number', detail: 'Diperlukan. Nilai numerik yang menentukan nomor baris yang akan digunakan dalam referensi sel.' },
            column_num: { name: 'column number', detail: 'Diperlukan. Nilai numerik yang menentukan nomor kolom yang akan digunakan dalam referensi sel.' },
            abs_num: { name: 'type of reference', detail: 'Opsional. Nilai numerik yang menentukan tipe referensi yang akan dihasilkan.' },
            a1: { name: 'style of reference', detail: 'Opsional. Nilai logika yang menentukan gaya referensi A1 atau R1C1. Dalam gaya A1, kolom diberi label menurut abjad, dan baris diberi label menurut angka. Dalam gaya referensi R1C1, baik kolom maupun baris diberi label menurut angka. Jika argumen A1 adalah TRUE atau dihilangkan, fungsi ADDRESS akan mengembalikan referensi gaya A1; jika FALSE, fungsi ADDRESS akan mengembalikan referensi gaya R1C1. Catatan Untuk mengubah gaya referensi yang digunakan Excel, klik tab File , klik Opsi , lalu klik Rumus . Di bawah Bekerja dengan rumus , pilih atau kosongkan kotak centang gaya referensi R1C1 .' },
            sheet_text: { name: 'worksheet name', detail: 'Opsional. Nilai teks yang menentukan nama lembar kerja untuk digunakan sebagai referensi eksternal. Misalnya, rumus =ADDRESS(1,1,,,"Sheet2") mengembalikan Sheet2!$A$1 . Jika argumen sheet_text dihilangkan, tidak ada nama lembar yang digunakan, dan alamat yang dikembalikan oleh fungsi merujuk ke sel pada lembar saat ini.' },
        },
    },
    AREAS: {
        description: 'Mengembalikan jumlah area dalam sebuah referensi. Area adalah rentang sel berdekatan atau sel tunggal.',
        abstract: 'Mengembalikan jumlah area dalam sebuah referensi. Area adalah rentang sel berdekatan atau sel tunggal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Diperlukan. Referensi ke suatu sel atau rentang sel dan dapat merujuk ke beberapa area. Jika Anda ingin menentukan beberapa referensi sebagai argumen tunggal, maka Anda harus memasukkan seperangkat tanda kurung tambahan sehingga Microsoft Excel tidak akan menginterpretasikan koma sebagai pemisah bidang. Lihat contoh berikut.' },
        },
    },
    CHOOSE: {
        description: 'Menggunakan index_num untuk mengembalikan nilai dari daftar argumen nilai. Gunakan CHOOSE untuk memilih satu dari hingga 254 nilai berdasarkan jumlah indeks. Misalnya, jika nilai1 sampai nilai7 adalah hari-hari dari minggu tersebut, CHOOSE mengembalikan salah satu hari ketika angka antara 1 dan 7 digunakan sebagai index_num.',
        abstract: 'Menggunakan index_num untuk mengembalikan nilai dari daftar argumen nilai. Gunakan CHOOSE untuk memilih satu dari hingga 254 nilai berdasarkan jumlah indeks. Misalnya, jika nilai1 sampai nilai7 adalah hari-hari dari minggu tersebut, CHOOSE mengembalikan salah satu hari ketika angka antara 1 dan 7 digunakan sebagai index_num.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: 'Menentukan argumen nilai yang dipilih. Harus berupa angka antara 1 dan 254, rumus, atau referensi ke sel yang berisi angka tersebut.' },
            value1: { name: 'value1', detail: 'Nilai atau tindakan yang dipilih berdasarkan index_num. Argumen dapat berupa angka, referensi sel, nama yang ditentukan, rumus, fungsi, atau teks.' },
            value2: { name: 'value2', detail: 'Dari 1 hingga 254 argumen nilai.' },
        },
    },
    CHOOSECOLS: {
        description: 'Mengembalikan kolom yang ditentukan dari larik.',
        abstract: 'Mengembalikan kolom yang ditentukan dari larik.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array yang berisi kolom yang akan dikembalikan dalam array baru. Diperlukan.' },
            colNum1: { name: 'col_num1', detail: 'Kolom pertama yang akan dikembalikan. Diperlukan.' },
            colNum2: { name: 'col_num2', detail: 'Kolom tambahan yang akan dikembalikan. Opsional.' },
        },
    },
    CHOOSEROWS: {
        description: 'Mengembalikan baris tertentu dari array.',
        abstract: 'Mengembalikan baris tertentu dari array.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array yang berisi kolom yang akan dikembalikan dalam array baru. Diperlukan.' },
            rowNum1: { name: 'row_num1', detail: 'Nomor baris pertama yang akan dikembalikan. Diperlukan.' },
            rowNum2: { name: 'row_num2', detail: 'Nomor baris tambahan yang akan dikembalikan. Opsional.' },
        },
    },
    COLUMN: {
        description: 'Fungsi COLUMN mengembalikan nomor kolom referensi sel tertentu. Misalnya, rumus =COLUMN(D10) mengembalikan 4, karena kolom D adalah kolom keempat.',
        abstract: 'Fungsi COLUMN mengembalikan nomor kolom referensi sel tertentu. Misalnya, rumus =COLUMN(D10) mengembalikan 4, karena kolom D adalah kolom keempat.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Sel atau rentang sel yang nomor kolomnya ingin Anda kembalikan.' },
        },
    },
    COLUMNS: {
        description: 'Mengembalikan jumlah kolom dalam array atau referensi.',
        abstract: 'Mengembalikan jumlah kolom dalam array atau referensi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Rumus array atau array, atau referensi ke rentang sel yang anda inginkan jumlah kolomnya.' },
        },
    },
    DROP: {
        description: 'Tidak termasuk jumlah baris atau kolom tertentu dari awal atau akhir larik. Anda mungkin merasa fungsi ini berguna untuk menghapus header dan footer dalam laporan Excel untuk mengembalikan data saja.',
        abstract: 'Tidak termasuk jumlah baris atau kolom tertentu dari awal atau akhir larik. Anda mungkin merasa fungsi ini berguna untuk menghapus header dan footer dalam laporan Excel untuk mengembalikan data saja.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array tempat baris atau kolom diletakkan.' },
            rows: { name: 'rows', detail: 'Jumlah baris yang akan dijatuhkan. Nilai negatif turun dari akhir array.' },
            columns: { name: 'columns', detail: 'Jumlah kolom yang akan dikecualikan. Nilai negatif turun dari akhir array.' },
        },
    },
    EXPAND: {
        description: 'Memperluas atau mengayuh array ke dimensi baris dan kolom yang ditentukan.',
        abstract: 'Memperluas atau mengayuh array ke dimensi baris dan kolom yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array untuk diperluas.' },
            rows: { name: 'rows', detail: 'Jumlah baris dalam array yang diperluas. Jika hilang, baris tidak akan diperluas.' },
            columns: { name: 'columns', detail: 'Jumlah kolom dalam array yang diperluas. Jika hilang, kolom tidak akan diperluas.' },
            padWith: { name: 'pad_with', detail: 'Nilai yang akan diisi dengan tombol angka. Defaultnya adalah #N/A.' },
        },
    },
    FILTER: {
        description: 'Dalam contoh berikut, kami menggunakan rumus =FILTER(A5:D20,C5:C20=H2,"") untuk mengembalikan semua rekaman untuk Apple, seperti yang dipilih di sel H2, dan jika tidak ada apel, kembalikan string kosong ("").',
        abstract: 'Dalam contoh berikut, kami menggunakan rumus =FILTER(A5:D20,C5:C20=H2,"") untuk mengembalikan semua rekaman untuk Apple, seperti yang dipilih di sel H2, dan jika tidak ada apel, kembalikan string kosong ("").',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Larik atau rentang yang ingin difilter' },
            include: { name: 'include', detail: 'Larik Boolean dengan tinggi atau lebar yang sama seperti larik' },
            ifEmpty: { name: 'if_empty', detail: 'Nilai yang dikembalikan jika semua nilai dalam larik yang disertakan kosong (filter tidak mengembalikan apa pun)' },
        },
    },
    FORMULATEXT: {
        description: 'Mengembalikan rumus sebagai string.',
        abstract: 'Mengembalikan rumus sebagai string.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Diperlukan. Referensi ke satu sel atau rentang sel.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Cuplikan layar di bawah ini memperlihatkan tata letak PivotTable yang digunakan di bagian berikutnya. Dalam contoh ini, =GETPIVOTDATA("Sales",A3) mengembalikan jumlah total penjualan:',
        abstract: 'Cuplikan layar di bawah ini memperlihatkan tata letak PivotTable yang digunakan di bagian berikutnya. Dalam contoh ini, =GETPIVOTDATA("Sales",A3) mengembalikan jumlah total penjualan:',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: 'Nama bidang PivotTable yang berisi data yang ingin Anda ambil. Ini harus dalam tanda kutip. Contoh: =GETPIVOTDATA("Sales", A3). Di sini, "Penjualan" adalah bidang Nilai yang ingin kami ambil. Karena tidak ada bidang lain yang ditentukan, GETPIVOTDATA mengembalikan jumlah total penjualan.' },
            pivotTable: { name: 'pivotTable', detail: 'Referensi ke sel, rentang sel, atau rentang sel bernama dalam PivotTable. Informasi ini digunakan untuk menentukan PivotTable yang berisi data yang ingin diambil. Contoh: =GETPIVOTDATA("Sales", A3). Di sini, A3 adalah referensi di dalam PivotTable dan memberi tahu rumus yang digunakan PivotTable.' },
            field1: { name: 'field1', detail: '1 hingga 126 pasang nama bidang dan nama item yang menguraikan data yang ingin diambil. Pasangan ini tidak memiliki urutan tertentu. Nama bidang dan nama untuk item selain tanggal dan angka perlu dimasukkan dalam tanda kutip. Contoh: =GETPIVOTDATA("Sales", A3, "Month", "Mar"). Di sini, "Bulan" adalah bidang dan "Mar" adalah item. Untuk menentukan beberapa item untuk bidang, apit item dalam kurung kurawal (misalnya: {"Mar", "Apr"}). Untuk PivotTable OLAP , item bisa berisi nama sumber dimensi dan juga nama sumber item. Pasangan bidang dan item untuk OLAP PivotTable mungkin terlihat seperti ini: "[Produk]","[Produk].[Semua Produk].[Makanan].[Makanan Panggang]"' },
            item1: { name: 'item1', detail: '1 hingga 126 pasang nama bidang dan nama item yang menguraikan data yang ingin diambil. Pasangan ini tidak memiliki urutan tertentu. Nama bidang dan nama untuk item selain tanggal dan angka perlu dimasukkan dalam tanda kutip. Contoh: =GETPIVOTDATA("Sales", A3, "Month", "Mar"). Di sini, "Bulan" adalah bidang dan "Mar" adalah item. Untuk menentukan beberapa item untuk bidang, apit item dalam kurung kurawal (misalnya: {"Mar", "Apr"}). Untuk PivotTable OLAP , item bisa berisi nama sumber dimensi dan juga nama sumber item. Pasangan bidang dan item untuk OLAP PivotTable mungkin terlihat seperti ini: "[Produk]","[Produk].[Semua Produk].[Makanan].[Makanan Panggang]"' },
        },
    },
    HLOOKUP: {
        description: 'Mencari nilai di baris atas tabel atau array nilai, lalu mengembalikan nilai dalam kolom yang sama dari baris yang Anda tentukan dalam tabel atau array. Gunakan HLOOKUP jika nilai perbandingan terletak di sebuah baris di bagian atas tabel data, dan Anda ingin mencari ke beberapa baris tertentu di bawahnya. Gunakan VLOOKUP jika nilai perbandingan terletak di kolom sebelah kiri data yang ingin dicari.',
        abstract: 'Mencari nilai di baris atas tabel atau array nilai, lalu mengembalikan nilai dalam kolom yang sama dari baris yang Anda tentukan dalam tabel atau array. Gunakan HLOOKUP jika nilai perbandingan terletak di sebuah baris di bagian atas tabel data, dan Anda ingin mencari ke beberapa baris tertentu di bawahnya. Gunakan VLOOKUP jika nilai perbandingan terletak di kolom sebelah kiri data yang ingin dicari.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Diperlukan. Nilai yang dicari di baris pertama tabel. Lookup_value bisa berupa nilai, referensi, atau string teks.' },
            tableArray: { name: 'table_array', detail: 'Diperlukan. Tabel informasi tempat data dicari. Gunakan referensi ke sebuah rentang atau nama rentang. Nilai di baris pertama table_array bisa berupa teks, angka, atau nilai logika. Jika range_lookup TRUE, nilai di baris pertama table_array harus diletakkan dalam urutan naik: ...-2, -1, 0, 1, 2,... , A-Z, FALSE, TRUE; jika tidak, HLOOKUP tidak akan memberi nilai yang benar. Jika range_lookup FALSE, table_array tidak perlu diurutkan. Teks huruf besar dan huruf kecil sama. Urutkan nilai dengan urutan naik, kiri ke kanan. Untuk informasi selengkapnya, lihat Mengurutkan data dalam rentang atau tabel .' },
            rowIndexNum: { name: 'row_index_num', detail: 'Diperlukan. Nomor baris dalam table_array dari mana nilai yang cocok akan dikembalikan. Row_index_num 1 mengembalikan nilai baris pertama dalam table_array, row_index_num 2 mengembalikan nilai baris kedua dalam table_array, dan seterusnya. Jika row_index_num lebih kecil dari 1, HLOOKUP mengembalikan #VALUE! nilai kesalahan; jika row_index_num lebih besar dari jumlah baris di table_array, HLOOKUP mengembalikan #REF! nilai kesalahan.' },
            rangeLookup: { name: 'range_lookup', detail: 'Opsional. Nilai logika yang menentukan apakah Anda ingin HLOOKUP mencari kecocokan persis atau kecocokan yang mendekati. Jika TRUE atau dihilangkan, dikembalikan sebuah kecocokan yang mendekati. Dengan kata lain, jika kecocokan persis ditemukan, dihasillkan nilai terbesar berikutnya yang kurang dari lookup_value. Jika FALSE, HLOOKUP akan menemukan kecocokan persis. Jika tidak ditemukan, dikembalikan nilai kesalahan #N/A.' },
        },
    },
    HSTACK: {
        description: 'Menambahkan larik secara horizontal dan berurutan untuk mengembalikan larik yang lebih besar.',
        abstract: 'Menambahkan larik secara horizontal dan berurutan untuk mengembalikan larik yang lebih besar.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Array yang akan ditambahkan.' },
            array2: { name: 'array', detail: 'Array yang akan ditambahkan.' },
        },
    },
    HYPERLINK: {
        description: 'Membuat hyperlink di dalam sel.',
        abstract: 'Membuat hyperlink di dalam sel.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3093313?hl=id',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'URL lengkap lokasi tautan dalam tanda kutip atau referensi ke sel yang memuat URL tersebut. Hanya protokol tertentu yang diizinkan; jika tidak ditentukan, http:// digunakan.' },
            linkLabel: { name: 'link_label', detail: '[OPSIONAL — url secara default] Teks yang ditampilkan dalam sel sebagai tautan, dalam tanda kutip atau referensi ke sel yang memuat label tersebut.' },
        },
    },
    IMAGE: {
        description: 'Fungsi IMAGE menyisipkan gambar ke dalam sel dari lokasi sumber bersama dengan teks alternatif. Anda kemudian bisa memindahkan dan mengubah ukuran sel, mengurutkan dan memfilter, dan bekerja dengan gambar di dalam tabel Excel. Gunakan fungsi ini untuk menyempurnakan daftar data secara visual seperti inventaris, game, karyawan, dan konsep matematika.',
        abstract: 'Fungsi IMAGE menyisipkan gambar ke dalam sel dari lokasi sumber bersama dengan teks alternatif. Anda kemudian bisa memindahkan dan mengubah ukuran sel, mengurutkan dan memfilter, dan bekerja dengan gambar di dalam tabel Excel. Gunakan fungsi ini untuk menyempurnakan daftar data secara visual seperti inventaris, game, karyawan, dan konsep matematika.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: 'Jalur URL file gambar yang menggunakan protokol "https".' },
            altText: { name: 'alt_text', detail: 'Teks alternatif yang menjelaskan gambar untuk aksesibilitas.' },
            sizing: { name: 'sizing', detail: 'Menentukan dimensi gambar.' },
            height: { name: 'height', detail: 'Tinggi gambar kustom dalam piksel.' },
            width: { name: 'width', detail: 'Lebar gambar kustom dalam piksel.' },
        },
    },
    INDEX: {
        description: 'Mengembalikan nilai elemen dalam tabel atau array, yang dipilih oleh indeks angka baris dan kolom.',
        abstract: 'Mengembalikan nilai elemen dalam tabel atau array, yang dipilih oleh indeks angka baris dan kolom.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Referensi ke satu atau beberapa rentang sel.' },
            rowNum: { name: 'row_num', detail: 'Nomor baris dalam referensi yang menjadi sumber pengembalian referensi.' },
            columnNum: { name: 'column_num', detail: 'Nomor kolom dalam referensi yang menjadi sumber pengembalian referensi.' },
            areaNum: { name: 'area_num', detail: 'Memilih rentang dalam referensi untuk mengembalikan perpotongan row_num dan column_num.' },
        },
    },
    INDIRECT: {
        description: 'Mengembalikan referensi yang ditentukan oleh string teks. Referensi langsung dievaluasi untuk menampilkan isinya. Gunakan INDIRECT saat Anda ingin mengubah referensi ke sebuah sel di dalam rumus tanpa mengubah rumusnya.',
        abstract: 'Mengembalikan referensi yang ditentukan oleh string teks. Referensi langsung dievaluasi untuk menampilkan isinya. Gunakan INDIRECT saat Anda ingin mengubah referensi ke sebuah sel di dalam rumus tanpa mengubah rumusnya.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'Diperlukan. Referensi ke sel yang berisi referensi gaya A1, referensi gaya R1C1, nama yang ditentukan sebagai referensi, atau referensi ke sel sebagai string teks. Jika ref_text bukan referensi sel yang valid, MAKA INDIRECT mengembalikan #REF! nilai kesalahan. Jika ref_text merujuk ke buku kerja lain (referensi eksternal), buku kerja lain harus terbuka. Jika buku kerja sumber tidak terbuka, INDIRECT mengembalikan #REF! nilai kesalahan. Catatan Referensi eksternal tidak didukung di Excel Web App. Jika ref_text merujuk ke rentang sel di luar batas baris 1.048.576 atau batas kolom 16.384 (XFD), MAKA INDIRECT mengembalikan #REF! .' },
            a1: { name: 'a1', detail: 'Opsional. Sebuah nilai logika yang menentukan jenis referensi apa yang terdapat di dalam ref_text. Jika a1 TRUE atau dikosongkan, maka ref_text diterjemahkan sebagai referensi gaya A1. Jika a1 FALSE atau dikosongkan, maka ref_text diterjemahkan sebagai referensi gaya R1C1.' },
        },
    },
    LOOKUP: {
        description: 'Formulir vektor LOOKUP mencari sebuah nilai dalam rentang satu baris atau satu kolom (yang disebut vektor) dan mengembalikan nilai dari posisi yang sama dalam rentang satu baris atau satu kolom kedua',
        abstract: 'Formulir vektor LOOKUP mencari sebuah nilai dalam rentang satu baris atau satu kolom (yang disebut vektor) dan mengembalikan nilai dari posisi yang sama dalam rentang satu baris atau satu kolom kedua',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Nilai yang dicari LOOKUP dalam vektor pertama. Dapat berupa angka, teks, nilai logika, nama, atau referensi ke nilai.' },
            lookupVectorOrArray: { name: 'lookup_vectorOrArray', detail: 'Rentang yang hanya berisi satu baris atau satu kolom.' },
            resultVector: { name: 'result_vector', detail: 'Rentang yang hanya berisi satu baris atau kolom dan harus berukuran sama dengan lookup_vector.' },
        },
    },
    MATCH: {
        description: 'Fungsi MATCH mencari item yang ditentukan dalam rentang sel, kemudian mengembalikan posisi relatif item tersebut dalam rentang. Sebagai contoh, jika rentang A1:A3 berisi nilai 5, 25, dan 38, rumus =MATCH(25,A1:A3,0) akan mengembalikan angka 2, karena 25 merupakan item kedua dalam rentang tersebut.',
        abstract: 'Fungsi MATCH mencari item yang ditentukan dalam rentang sel, kemudian mengembalikan posisi relatif item tersebut dalam rentang. Sebagai contoh, jika rentang A1:A3 berisi nilai 5, 25, dan 38, rumus =MATCH(25,A1:A3,0) akan mengembalikan angka 2, karena 25 merupakan item kedua dalam rentang tersebut.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'MATCH menemukan nilai terbesar yang kurang dari atau sama dengan lookup_value . Nilai dalam argumen lookup_array harus diletakkan dalam urutan naik, misalnya: ...-2, -1, 0, 1, 2, ..., A-Z, FALSE, TRUE.' },
            lookupArray: { name: 'lookup_array', detail: 'MATCH menemukan nilai pertama yang sama persis dengan lookup_value . Nilai dalam argumen lookup_array bisa dalam urutan apa pun.' },
            matchType: { name: 'match_type', detail: 'MATCH menemukan nilai terkecil yang lebih besar dari atau sama dengan lookup_value . Nilai dalam argumen lookup_array harus ditempatkan dalam urutan menurun, misalnya: TRUE, FALSE, Z-A, ... 2, 1, 0, -1, -2, ..., dan seterunya.' },
        },
    },
    OFFSET: {
        description: 'Mengembalikan referensi ke rentang yang merupakan jumlah baris dan kolom tertentu dari sel atau rentang sel. Referensi yang dikembalikan dapat berupa sel tunggal atau rentang sel. Anda dapat menentukan jumlah baris dan jumlah kolom yang dikembalikan.',
        abstract: 'Mengembalikan referensi ke rentang yang merupakan jumlah baris dan kolom tertentu dari sel atau rentang sel. Referensi yang dikembalikan dapat berupa sel tunggal atau rentang sel. Anda dapat menentukan jumlah baris dan jumlah kolom yang dikembalikan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Diperlukan. Referensi dari mana Anda ingin mendasarkan offset. Referensi harus merujuk ke sel atau rentang sel yang berdekatan; jika tidak, OFFSET mengembalikan #VALUE! nilai kesalahan.' },
            rows: { name: 'rows', detail: 'Diperlukan. Jumlah baris, ke atas atau ke bawah, yang Anda inginkan untuk dirujuk oleh sel kiri atas. Menggunakan 5 sebagai argumen baris menentukan bahwa sel kiri atas dalam referensi adalah lima baris di bawah referensi. Baris bisa berupa positif (yang berarti di bawah referensi awal) atau negatif (yang berarti di atas referensi awal).' },
            cols: { name: 'columns', detail: 'Diperlukan. Jumlah kolom, ke kiri atau ke kanan, yang Anda inginkan untuk dirujuk oleh sel kiri atas. Menggunakan 5 sebagai argumen cols menentukan bahwa sel kiri atas dalam referensi adalah lima kolom ke kanan referensi. Cols bisa berupa positif (yang berarti ke kanan referensi awal) atau negatif (yang berarti ke kiri referensi awal).' },
            height: { name: 'height', detail: 'Opsional. Tinggi, dalam jumlah baris, yang merupakan hasil yang Anda inginkan. Tinggi harus berupa bilangan positif.' },
            width: { name: 'width', detail: 'Opsional. Lebar, dalam jumlah kolom, yang merupakan hasil yang Anda inginkan. Lebar harus berupa bilangan positif.' },
        },
    },
    ROW: {
        description: 'Mengembalikan jumlah baris referensi.',
        abstract: 'Mengembalikan jumlah baris referensi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Opsional. Sel atau rentang sel yang ingin Anda dapatkan nomor barisnya. Jika referensi dihilangkan, maka akan dianggap sebagai referensi sel di mana fungsi ROW muncul. Jika referensi adalah rentang sel, dan jika ROW dimasukkan sebagai array vertikal, ROW mengembalikan nomor baris referensi sebagai array vertikal. Referensi tidak bisa mengacu ke banyak area.' },
        },
    },
    ROWS: {
        description: 'Mengembalikan jumlah baris dalam referensi atau array.',
        abstract: 'Mengembalikan jumlah baris dalam referensi atau array.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array, rumus array, atau referensi ke rentang sel yang anda inginkan jumlah barisnya.' },
        },
    },
    RTD: {
        description: 'Mengambil data real time dari program yang mendukung otomatisasi COM.',
        abstract: 'Mengambil data real time dari program yang mendukung otomatisasi COM.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'Diperlukan. Nama ProgID add-in otomatisasi COM terdaftar yang telah diinstal di komputer lokal. Masukkan nama dalam tanda kutip.' },
            server: { name: 'server', detail: 'Diperlukan. Nama server di mana add-in harus dijalankan. Jika tidak ada server, dan program dijalankan secara lokal, kosongkan argumen. Jika tidak, masukkan tanda kutip ("") di sekitar nama server. Saat menggunakan RTD dalam Visual Basic for Applications (VBA), tanda kutip ganda atau properti NullString VBA diperlukan untuk server, sekalipun server berjalan secara lokal.' },
            topic1: { name: 'topic1', detail: 'Topik1 diperlukan, topik berikutnya bersifat opsional. 1 sampai 253 parameter yang bersama-sama menyatakan sebuah data real time yang unik.' },
            topic2: { name: 'topic2', detail: 'Topik1 diperlukan, topik berikutnya bersifat opsional. 1 sampai 253 parameter yang bersama-sama menyatakan sebuah data real time yang unik.' },
        },
    },
    SORT: {
        description: 'Dalam contoh ini, kami mengurutkan menurut Kawasan, Staf Penjualan, dan Produk secara individual dengan =SORT(A2:A17), yang disalin dalam sel F2, H2, dan J2.',
        abstract: 'Dalam contoh ini, kami mengurutkan menurut Kawasan, Staf Penjualan, dan Produk secara individual dengan =SORT(A2:A17), yang disalin dalam sel F2, H2, dan J2.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Rentang, atau larik yang akan diurutkan' },
            sortIndex: { name: 'sort_index', detail: 'Angka yang menunjukkan baris atau kolom untuk dasar pengurutan' },
            sortOrder: { name: 'sort_order', detail: 'Angka yang menunjukkan urutan pengurutan yang diinginkan; 1 untuk urutan naik (default), -1 untuk urutan menurun' },
            byCol: { name: 'by_col', detail: 'Nilai logika yang menunjukkan arah pengurutan yang diinginkan; FALSE untuk mengurutkan menurut baris (default), TRUE untuk mengurutkan menurut kolom' },
        },
    },
    SORTBY: {
        description: 'Dalam contoh ini, kami mengurutkan daftar nama orang menurut usia mereka, dalam urutan naik.',
        abstract: 'Dalam contoh ini, kami mengurutkan daftar nama orang menurut usia mereka, dalam urutan naik.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Larik atau rentang yang ingin diurutkan' },
            byArray1: { name: 'by_array1', detail: 'Larik atau rentang yang digunakan untuk mengurutkan' },
            sortOrder1: { name: 'sort_order1', detail: 'Urutan yang ingin digunakan. 1 untuk naik, -1 untuk turun. Defaultnya adalah naik.' },
            byArray2: { name: 'by_array2', detail: 'Larik atau rentang yang digunakan untuk mengurutkan' },
            sortOrder2: { name: 'sort_order2', detail: 'Urutan yang ingin digunakan. 1 untuk naik, -1 untuk turun. Defaultnya adalah naik.' },
        },
    },
    TAKE: {
        description: 'Mengembalikan jumlah baris atau kolom yang berdampingan tertentu dari awal atau akhir array.',
        abstract: 'Mengembalikan jumlah baris atau kolom yang berdampingan tertentu dari awal atau akhir array.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array yang akan diambil baris atau kolomnya.' },
            rows: { name: 'rows', detail: 'Jumlah baris yang akan diambil. Nilai negatif diambil dari akhir array.' },
            columns: { name: 'columns', detail: 'Jumlah kolom yang akan diambil. Nilai negatif diambil dari akhir array.' },
        },
    },
    TOCOL: {
        description: 'Mengembalikan array dalam satu kolom.',
        abstract: 'Mengembalikan array dalam satu kolom.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array atau referensi yang dikembalikan sebagai kolom.' },
            ignore: { name: 'ignore', detail: 'Menentukan apakah jenis nilai tertentu diabaikan. Secara default tidak ada nilai yang diabaikan: 0 mempertahankan semua, 1 mengabaikan kosong, 2 mengabaikan kesalahan, 3 mengabaikan keduanya.' },
            scanByColumn: { name: 'scan_by_column', detail: 'Memindai array berdasarkan kolom. Secara default array dipindai berdasarkan baris; pemindaian menentukan urutan nilai menurut baris atau kolom.' },
        },
    },
    TOROW: {
        description: 'Mengembalikan array dalam satu baris.',
        abstract: 'Mengembalikan array dalam satu baris.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array atau referensi yang dikembalikan sebagai baris.' },
            ignore: { name: 'ignore', detail: 'Menentukan apakah jenis nilai tertentu diabaikan. Secara default tidak ada nilai yang diabaikan: 0 mempertahankan semua, 1 mengabaikan kosong, 2 mengabaikan kesalahan, 3 mengabaikan keduanya.' },
            scanByColumn: { name: 'scan_by_column', detail: 'Memindai array berdasarkan kolom. Secara default array dipindai berdasarkan baris; pemindaian menentukan urutan nilai menurut baris atau kolom.' },
        },
    },
    TRANSPOSE: {
        description: 'Terkadang Anda perlu memindahkan atau memutar sel. Anda dapat melakukannya dengan menyalin, menempelkan, dan menggunakan opsi Transpose . Namun, melakukannya akan membuat duplikat data. Jika tidak menginginkannya, Anda dapat mengetikkan rumus, bukan menggunakan fungsi TRANSPOSE. Misalnya, dalam gambar berikut ini, rumus =TRANSPOSE(A1:B4) terletak di sel A1 hingga B4 dan mengaturnya secara horizontal.',
        abstract: 'Terkadang Anda perlu memindahkan atau memutar sel. Anda dapat melakukannya dengan menyalin, menempelkan, dan menggunakan opsi Transpose . Namun, melakukannya akan membuat duplikat data. Jika tidak menginginkannya, Anda dapat mengetikkan rumus, bukan menggunakan fungsi TRANSPOSE. Misalnya, dalam gambar berikut ini, rumus =TRANSPOSE(A1:B4) terletak di sel A1 hingga B4 dan mengaturnya secara horizontal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Rentang sel atau array dalam lembar kerja.' },
        },
    },
    UNIQUE: {
        description: 'Menghasilkan nama unik dari daftar nama',
        abstract: 'Menghasilkan nama unik dari daftar nama',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Rentang atau array yang akan mengembalikan baris atau kolom unik' },
            byCol: { name: 'by_col', detail: 'Argumen by_col adalah nilai logika yang menunjukkan cara membandingkan. TRUE akan membandingkan kolom satu sama lain dan mengembalikan kolom unik FALSE (atau dihilangkan) akan membandingkan baris satu sama lain dan mengembalikan baris unik' },
            exactlyOnce: { name: 'exactly_once', detail: 'Argumen exactly_once adalah nilai logika yang akan mengembalikan baris atau kolom yang muncul persis sekali dalam rentang atau array. Ini adalah konsep database yang unik. TRUE akan mengembalikan semua baris atau kolom berbeda yang muncul persis sekali dari rentang atau array FALSE (atau dihilangkan) akan mengembalikan semua baris atau kolom yang berbeda dari rentang atau array' },
        },
    },
    VLOOKUP: {
        description: 'Gunakan fungsi VLOOKUP untuk mencari nilai dalam tabel.',
        abstract: 'Gunakan fungsi VLOOKUP untuk mencari nilai dalam tabel.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Nilai yang ingin dicari. Nilai tersebut harus berada di kolom pertama rentang sel yang ditentukan dalam table_array.' },
            tableArray: { name: 'table_array', detail: 'Rentang sel tempat VLOOKUP mencari lookup_value dan nilai yang dikembalikan. Anda dapat menggunakan rentang bernama atau tabel.' },
            colIndexNum: { name: 'col_index_num', detail: 'Nomor kolom, dimulai dari 1 untuk kolom paling kiri table_array, yang berisi nilai yang dikembalikan.' },
            rangeLookup: { name: 'range_lookup', detail: 'Nilai logika yang menentukan apakah VLOOKUP mencari kecocokan perkiraan (1/TRUE) atau tepat (0/FALSE).' },
        },
    },
    VSTACK: {
        description: 'Menambahkan larik secara vertikal dan berurutan untuk mengembalikan larik yang lebih besar.',
        abstract: 'Menambahkan larik secara vertikal dan berurutan untuk mengembalikan larik yang lebih besar.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Array yang akan ditambahkan.' },
            array2: { name: 'array', detail: 'Array yang akan ditambahkan.' },
        },
    },
    WRAPCOLS: {
        description: 'Membungkus baris atau kolom nilai yang disediakan menurut kolom setelah jumlah elemen tertentu untuk membentuk array baru.',
        abstract: 'Membungkus baris atau kolom nilai yang disediakan menurut kolom setelah jumlah elemen tertentu untuk membentuk array baru.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Vektor atau referensi untuk membungkus.' },
            wrapCount: { name: 'wrap_count', detail: 'Jumlah nilai maksimum untuk setiap kolom.' },
            padWith: { name: 'pad_with', detail: 'Nilai yang akan diisi dengan tombol angka. Defaultnya adalah #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Membungkus baris atau kolom nilai yang disediakan menurut baris setelah jumlah elemen tertentu untuk membentuk array baru.',
        abstract: 'Membungkus baris atau kolom nilai yang disediakan menurut baris setelah jumlah elemen tertentu untuk membentuk array baru.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Vektor atau referensi untuk membungkus.' },
            wrapCount: { name: 'wrap_count', detail: 'Jumlah nilai maksimum untuk setiap baris.' },
            padWith: { name: 'pad_with', detail: 'Nilai yang akan diisi dengan tombol angka. Defaultnya adalah #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Gunakan fungsi XLOOKUP untuk menemukan berbagai hal dalam tabel atau rentang menurut baris. Misalnya, cari harga komponen otomotif berdasarkan nomor komponen, atau temukan nama karyawan berdasarkan ID karyawan mereka. Dengan XLOOKUP, Anda bisa mencari dalam satu kolom untuk istilah pencarian dan mengembalikan hasil dari baris yang sama di kolom lain, terlepas dari sisi mana kolom yang dikembalikan berada.',
        abstract: 'Gunakan fungsi XLOOKUP untuk menemukan berbagai hal dalam tabel atau rentang menurut baris. Misalnya, cari harga komponen otomotif berdasarkan nomor komponen, atau temukan nama karyawan berdasarkan ID karyawan mereka. Dengan XLOOKUP, Anda bisa mencari dalam satu kolom untuk istilah pencarian dan mengembalikan hasil dari baris yang sama di kolom lain, terlepas dari sisi mana kolom yang dikembalikan berada.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Nilai yang akan dicari *Jika dihilangkan, XLOOKUP mengembalikan sel kosong yang ditemukan di lookup_array .' },
            lookupArray: { name: 'lookup_array', detail: 'Array atau rentang untuk dicari' },
            returnArray: { name: 'return_array', detail: 'Array atau rentang yang akan dikembalikan' },
            ifNotFound: { name: 'if_not_found', detail: 'Jika kecocokan valid tidak ditemukan, kembalikan teks [if_not_found] yang Anda masukkan. Jika kecocokan valid tidak ditemukan, dan [if_not_found] hilang, #N/A dikembalikan.' },
            matchMode: { name: 'match_mode', detail: 'Tentukan tipe yang cocok: 0 - Persis cocok. Jika tidak ditemukan, kembalikan #N/A. Ini adalah pengaturan default. -1 - Persis cocok. Jika tidak ada yang ditemukan, kembalikan item berikutnya yang lebih kecil. 1 - Persis sama. Jika tidak ditemukan, kembalikan item berikutnya yang lebih besar. 2 - A wildcard match where *, ?, and ~ have special meaning .' },
            searchMode: { name: 'search_mode', detail: 'Tentukan mode pencarian yang akan digunakan: 1 - Melakukan pencarian dimulai dari item pertama. Ini adalah pengaturan default. -1 - Melakukan pencarian terbalik dimulai dari item terakhir. 2 - Melakukan pencarian biner yang bergantung pada lookup_array diurutkan dalam urutan naik . Jika tidak diurutkan, hasil yang tidak valid akan dikembalikan. -2 - Melakukan pencarian biner yang mengandalkan lookup_array diurutkan dalam urutan menurun . Jika tidak diurutkan, hasil yang tidak valid akan dikembalikan.' },
        },
    },
    XMATCH: {
        description: 'Asumsikan kami memiliki daftar produk di sel C3 hingga C7 dan kami ingin menentukan di mana dalam daftar produk dari sel E3 berada. Di sini, kami akan menggunakan XMATCH untuk menentukan posisi item dalam daftar.',
        abstract: 'Asumsikan kami memiliki daftar produk di sel C3 hingga C7 dan kami ingin menentukan di mana dalam daftar produk dari sel E3 berada. Di sini, kami akan menggunakan XMATCH untuk menentukan posisi item dalam daftar.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Nilai pencarian' },
            lookupArray: { name: 'lookup_array', detail: 'Array atau rentang untuk dicari' },
            matchMode: { name: 'match_mode', detail: 'Tentukan tipe yang cocok: 0 - Kecocokan persis (default) -1 - Sama persis atau item terkecil berikutnya 1 - Kecocokan persis atau item terbesar berikutnya 2 - A wildcard match where *, ?, and ~ have special meaning .' },
            searchMode: { name: 'search_mode', detail: 'Tentukan tipe pencarian: 1 - Cari dari awal hingga akhir (default) -1 - Cari last-to-first (reverse search). 2 - Melakukan pencarian biner yang bergantung pada lookup_array diurutkan dalam urutan naik . Jika tidak diurutkan, hasil yang tidak valid akan dikembalikan. -2 - Melakukan pencarian biner yang mengandalkan lookup_array diurutkan dalam urutan menurun . Jika tidak diurutkan, hasil yang tidak valid akan dikembalikan.' },
        },
    },
};

export default locale;
