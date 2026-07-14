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
    DATE: {
        description: 'Fungsi DATE mengembalikan nomor seri berurutan yang mewakili tanggal tertentu.',
        abstract: 'Fungsi DATE mengembalikan nomor seri berurutan yang mewakili tanggal tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: 'year', detail: 'Nilai argumen tahun dapat berisi satu hingga empat digit. Excel menafsirkannya sesuai sistem tanggal komputer; secara default Univer menggunakan sistem tanggal 1900.' },
            month: { name: 'month', detail: 'Bilangan bulat positif atau negatif yang mewakili bulan dalam tahun dari 1 hingga 12, Januari hingga Desember.' },
            day: { name: 'day', detail: 'Bilangan bulat positif atau negatif yang mewakili hari dalam bulan dari 1 hingga 31.' },
        },
    },
    DATEDIF: {
        description: 'Menghitung jumlah hari, bulan, atau tahun di antara dua tanggal.',
        abstract: 'Menghitung jumlah hari, bulan, atau tahun di antara dua tanggal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Tanggal yang menunjukkan tanggal pertama, atau tanggal mulai periode tertentu. Tanggal mungkin dimasukkan sebagai string teks di dalam tanda kutip (misalnya, "2001/1/30"), sebagai nomor seri (misalnya, 36921, yang menyatakan 30 Januari 2001, jika Anda menggunakan sistem tanggal 1900), atau seperti hasil dari rumus atau fungsi lain (misalnya, DATEVALUE("2001/1/30")).' },
            endDate: { name: 'end_date', detail: 'Tanggal yang menunjukkan tanggal terakhir, atau tanggal berakhirnya periode.' },
            unit: { name: 'Satuan', detail: 'Tipe informasi yang ingin Anda kembalikan, di mana: Unit****Mengembalikan " Y "Jumlah tahun yang lengkap dalam periode." M "Jumlah bulan lengkap dalam periode." D "Jumlah hari dalam periode." MD "Perbedaan antara hari dalam start_date dan end_date. Bulan dan tahun dari tanggal diabaikan. Penting: Kami tidak menyarankan menggunakan argumen "MD", karena ada batasan yang diketahui dengan argumen tersebut. Lihat bagian masalah yang diketahui di bawah ini." YM "Perbedaan antara bulan dalam start_date dan end_date. Hari dan tahun dari tanggal diabaikan" YD "Perbedaan antara hari-hari start_date dan end_date. Tahun dari tanggal diabaikan.' },
        },
    },
    DATEVALUE: {
        description: 'Fungsi DATEVALUE mengonversi tanggal yang disimpan sebagai teks ke nomor seri yang dikenali Excel sebagai tanggal. Misalnya, rumus =DATEVALUE("1/1/2008") mengembalikan 39448, nomor seri tanggal 1/1/2008. Akan tetapi, ingatlah bahwa pengaturan tanggal sistem komputer Anda mungkin menyebabkan hasil fungsi DATEVALUE berbeda dari contoh ini.',
        abstract: 'Fungsi DATEVALUE mengonversi tanggal yang disimpan sebagai teks ke nomor seri yang dikenali Excel sebagai tanggal. Misalnya, rumus =DATEVALUE("1/1/2008") mengembalikan 39448, nomor seri tanggal 1/1/2008. Akan tetapi, ingatlah bahwa pengaturan tanggal sistem komputer Anda mungkin menyebabkan hasil fungsi DATEVALUE berbeda dari contoh ini.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: 'date_text', detail: 'Diperlukan. Teks yang menyatakan tanggal dalam format tanggal Excel, atau referensi ke sel berisi teks yang menyatakan tanggal dalam format tanggal Excel. Misalnya, "1/30/2008" atau "30-Jan-2008" adalah string teks dalam tanda kutip yang menyatakan tanggal. Menggunakan sistem tanggal default di Microsoft Excel untuk Windows, argumen date_text harus menunjukkan tanggal antara 1 Januari 1900 dan 31 Desember 9999. Fungsi DATEVALUE mengembalikan nilai kesalahan #VALUE!. jika nilai argumen date_text berada di luar rentang ini. Jika bagian tahun dari argumen date_text dihilangkan, fungsi DATEVALUE menggunakan tahun saat ini dari jam bawaan komputer Anda. Informasi waktu dalam argumen date_text diabaikan.' },
        },
    },
    DAY: {
        description: 'Mengembalikan tanggal, yang dinyatakan dengan nomor seri. Hari diberikan sebagai bilangan bulat dengan rentang dari 1 sampai 31.',
        abstract: 'Mengembalikan tanggal, yang dinyatakan dengan nomor seri. Hari diberikan sebagai bilangan bulat dengan rentang dari 1 sampai 31.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Diperlukan. Tanggal yang Anda coba temukan. Tanggal harus dimasukkan menggunakan fungsi DATE, atau sebagai hasil dari rumus atau fungsi lain. Misalnya, gunakan DATE(2008,5,23) untuk tanggal 23 Mei 2008. Masalah dapat terjadi jika tanggal dimasukkan sebagai teks .' },
        },
    },
    DAYS: {
        description: 'Mengembalikan jumlah hari antara dua tanggal.',
        abstract: 'Mengembalikan jumlah hari antara dua tanggal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Diperlukan. Start_date dan End_date adalah dua tanggal yang ingin Anda ketahui jumlah hari di antara keduanya.' },
            startDate: { name: 'start_date', detail: 'Diperlukan. Start_date dan End_date adalah dua tanggal yang ingin Anda ketahui jumlah hari di antara keduanya.' },
        },
    },
    DAYS360: {
        description: 'Fungsi DAYS360 mengembalikan jumlah hari antara dua tanggal berdasarkan tahun dengan 360 hari per tahun (dua belas bulan dengan 30 hari per bulan), yang digunakan dalam beberapa perhitungan akuntansi. Gunakan fungsi ini untuk membantu menghitung pembayaran jika sistem akuntansi Anda berdasarkan pada dua belas bulan dengan 30 hari per bulan.',
        abstract: 'Fungsi DAYS360 mengembalikan jumlah hari antara dua tanggal berdasarkan tahun dengan 360 hari per tahun (dua belas bulan dengan 30 hari per bulan), yang digunakan dalam beberapa perhitungan akuntansi. Gunakan fungsi ini untuk membantu menghitung pembayaran jika sistem akuntansi Anda berdasarkan pada dua belas bulan dengan 30 hari per bulan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Dua tanggal yang ingin diketahui jumlah hari di antaranya.' },
            endDate: { name: 'end_date', detail: 'Dua tanggal yang ingin diketahui jumlah hari di antaranya.' },
            method: { name: 'method', detail: 'Nilai logika yang menentukan apakah menggunakan metode AS atau Eropa dalam perhitungan.' },
        },
    },
    EDATE: {
        description: 'Mengembalikan nomor seri yang mewakili tanggal sejumlah bulan tertentu sebelum atau sesudah tanggal yang ditentukan (start_date). Gunakan EDATE untuk menghitung tanggal jatuh tempo yang berada pada hari yang sama dalam bulan dengan tanggal penerbitan.',
        abstract: 'Mengembalikan nomor seri tanggal sejumlah bulan tertentu sebelum atau sesudah tanggal mulai.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Tanggal yang mewakili tanggal mulai. Tanggal sebaiknya dimasukkan dengan fungsi DATE atau sebagai hasil rumus atau fungsi lain.' },
            months: { name: 'months', detail: 'Jumlah bulan sebelum atau sesudah start_date. Nilai positif menghasilkan tanggal mendatang; nilai negatif menghasilkan tanggal lampau.' },
        },
    },
    EOMONTH: {
        description: 'Mengembalikan nomor seri untuk hari terakhir bulan yang merupakan nomor indikasi dari bulan sebelum atau setelah start_date. Gunakan EOMONTH untuk menghitung tanggal jatuh tempo yang jatuh pada hari terakhir bulan tersebut.',
        abstract: 'Mengembalikan nomor seri untuk hari terakhir bulan yang merupakan nomor indikasi dari bulan sebelum atau setelah start_date. Gunakan EOMONTH untuk menghitung tanggal jatuh tempo yang jatuh pada hari terakhir bulan tersebut.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Diperlukan. Tanggal yang mewakili tanggal mulai. Tanggal harus dimasukkan menggunakan fungsi DATE, atau sebagai hasil dari rumus atau fungsi lain. Misalnya, gunakan DATE(2008,5,23) untuk tanggal 23 Mei 2008. Masalah dapat terjadi jika tanggal dimasukkan sebagai teks .' },
            months: { name: 'months', detail: 'Diperlukan. Jumlah bulan sebelum atau setelah start_date. Nilai positif untuk bulan menghasilkan tanggal masa mendatang; nilai negatif menghasilkan tanggal lampau. Catatan Jika bulan bukan bilangan bulat, maka dipotong.' },
        },
    },
    EPOCHTODATE: {
        description: 'Mengonversi cap waktu epoch Unix dalam detik, milidetik, atau mikrodetik menjadi tanggal dan waktu dalam Waktu Universal Terkoordinasi (UTC).',
        abstract: 'Mengonversi cap waktu epoch Unix dalam detik, milidetik, atau mikrodetik menjadi tanggal dan waktu dalam Waktu Universal Terkoordinasi (UTC).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/13193461?hl=id',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'Cap waktu epoch Unix dalam detik, milidetik, atau mikrodetik.' },
            unit: { name: 'unit', detail: '[OPSIONAL — 1 secara default]: satuan waktu yang digunakan untuk menyatakan cap waktu.' },
        },
    },
    HOUR: {
        description: 'Mengembalikan jam dari satu nilai waktu. Jam diberikan sebagai bilangan bulat, mulai dari 0 (12:00 A.M.) hingga 23 (11:00 P.M.).',
        abstract: 'Mengembalikan jam dari satu nilai waktu. Jam diberikan sebagai bilangan bulat, mulai dari 0 (12:00 A.M.) hingga 23 (11:00 P.M.).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Diperlukan. Waktu yang berisi jam yang ingin Anda temukan. Waktu bisa dimasukkan sebagai string teks dengan tanda kutip (contoh, "6:45 PM"), sebagai angka desimal (contoh, 0,78125, yang menyatakan 6:45 PM), atau sebagai hasil dari rumus atau fungsi lain (contoh, TIMEVALUE("6:45 PM")).' },
        },
    },
    ISOWEEKNUM: {
        description: 'Mengembalikan jumlah angka minggu ISO dalam tahun untuk tanggal yang ditentukan.',
        abstract: 'Mengembalikan jumlah angka minggu ISO dalam tahun untuk tanggal yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: 'Diperlukan. Date adalah kode tanggal-waktu yang digunakan oleh Excel untuk perhitungan tanggal dan waktu.' },
        },
    },
    MINUTE: {
        description: 'Mengembalikan menit dari nilai waktu. Menit ditentukan sebagai bilangan bulat, rentangnya antara 0 sampai 59.',
        abstract: 'Mengembalikan menit dari nilai waktu. Menit ditentukan sebagai bilangan bulat, rentangnya antara 0 sampai 59.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Diperlukan. Waktu yang memuat menit yang ingin Anda temukan. Waktu bisa dimasukkan sebagai string teks dengan tanda kutip (contoh, "6:45 PM"), sebagai angka desimal (contoh, 0,78125, yang menyatakan 6:45 PM), atau sebagai hasil dari rumus atau fungsi lain (contoh, TIMEVALUE("6:45 PM")).' },
        },
    },
    MONTH: {
        description: 'Mengembalikan bulan dari sebuah tanggal yang dinyatakan oleh nomor seri. Bulan ditentukan sebagai bilangan bulat, rentangnya antara 1 (Januari) sampai 12 (Desember).',
        abstract: 'Mengembalikan bulan dari sebuah tanggal yang dinyatakan oleh nomor seri. Bulan ditentukan sebagai bilangan bulat, rentangnya antara 1 (Januari) sampai 12 (Desember).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Diperlukan. Tanggal yang ingin Anda cari bulannya. Tanggal harus dimasukkan menggunakan fungsi DATE, atau sebagai hasil dari rumus atau fungsi lain. Misalnya, gunakan DATE(2008,5,23) untuk tanggal 23 Mei 2008. Masalah dapat terjadi jika tanggal dimasukkan sebagai teks .' },
        },
    },
    NETWORKDAYS: {
        description: 'Mengembalikan jumlah semua hari kerja di antara start_date dan end_date. Hari kerja tidak termasuk akhir pekan dan tanggal-tanggal yang ditentukan sebagai hari libur. Gunakan NETWORKDAYS untuk menghitung tunjangan karyawan yang dibayar berdasarkan jumlah hari kerja selama masa tertentu.',
        abstract: 'Mengembalikan jumlah semua hari kerja di antara start_date dan end_date. Hari kerja tidak termasuk akhir pekan dan tanggal-tanggal yang ditentukan sebagai hari libur. Gunakan NETWORKDAYS untuk menghitung tunjangan karyawan yang dibayar berdasarkan jumlah hari kerja selama masa tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Diperlukan. Tanggal yang menunjukkan tanggal mulai.' },
            endDate: { name: 'end_date', detail: 'Diperlukan. Tanggal yang menunjukkan tanggal akhir.' },
            holidays: { name: 'holidays', detail: 'Opsional. Rentang opsional yang terdiri dari satu atau lebih tanggal untuk dikecualikan dari kalender kerja, seperti hari libur nasional dan jatah cuti. Daftarnya bisa berupa rentang sel yang berisi tanggal atau konstanta array nomor seri yang menunjukkan tanggal.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Mengembalikan jumlah semua hari kerja di antara dua tanggal dengan menggunakan parameter untuk menunjukkan yang mana dan berapa hari yang merupakan akhir pekan. Hari-hari akhir pekan dan hari yang ditentukan sebagai hari libur tidak dianggap hari kerja.',
        abstract: 'Mengembalikan jumlah semua hari kerja di antara dua tanggal dengan menggunakan parameter untuk menunjukkan yang mana dan berapa hari yang merupakan akhir pekan. Hari-hari akhir pekan dan hari yang ditentukan sebagai hari libur tidak dianggap hari kerja.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Tanggal yang mewakili tanggal mulai.' },
            endDate: { name: 'end_date', detail: 'Tanggal yang mewakili tanggal akhir.' },
            weekend: { name: 'weekend', detail: 'Angka atau teks yang menentukan kapan akhir pekan terjadi.' },
            holidays: { name: 'holidays', detail: 'Rentang opsional satu atau beberapa tanggal yang dikecualikan dari kalender kerja, seperti hari libur nasional, daerah, atau bergerak.' },
        },
    },
    NOW: {
        description: 'Mengembalikan nomor seri tanggal dan waktu saat ini. Jika sebelum fungsi dimasukkan format selnya Umum , Excel mengubah sel format sehingga cocok dengan format tanggal dan waktu pengaturan regional Anda. Anda dapat mengubah format tanggal dan waktu dalam grup Angka di tab Beranda di Pita.',
        abstract: 'Mengembalikan nomor seri tanggal dan waktu saat ini. Jika sebelum fungsi dimasukkan format selnya Umum , Excel mengubah sel format sehingga cocok dengan format tanggal dan waktu pengaturan regional Anda. Anda dapat mengubah format tanggal dan waktu dalam grup Angka di tab Beranda di Pita.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Mengembalikan detik dari satu nilai waktu. Detik diberikan sebagai bilangan bulat dalam rentang 0 (nol) sampai 59.',
        abstract: 'Mengembalikan detik dari satu nilai waktu. Detik diberikan sebagai bilangan bulat dalam rentang 0 (nol) sampai 59.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Diperlukan. Waktu yang memuat detik yang ingin Anda temukan. Waktu bisa dimasukkan sebagai string teks dengan tanda kutip (contoh, "6:45 PM"), sebagai angka desimal (contoh, 0,78125, yang menyatakan 6:45 PM), atau sebagai hasil dari rumus atau fungsi lain (contoh, TIMEVALUE("6:45 PM")).' },
        },
    },
    TIME: {
        description: 'Mengembalikan angka desimal untuk waktu tertentu. Jika format sel adalah Umum sebelum fungsi dimasukkan, hasil diformat sebagai tanggal.',
        abstract: 'Mengembalikan angka desimal untuk waktu tertentu. Jika format sel adalah Umum sebelum fungsi dimasukkan, hasil diformat sebagai tanggal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: 'Diperlukan. Angka dari 0 (nol) sampai 32767 yang menyatakan jam. Nilai apa pun yang lebih besar dari 23 akan dibagi dengan 24 dan sisanya akan dianggap sebagai nilai jam. Sebagai contoh, TIME(27,0,0) = TIME(3,0,0) = 0,125 atau 3:00 AM.' },
            minute: { name: 'minute', detail: 'Diperlukan. Angka dari 0 sampai 32767 yang menyatakan menit. Nilai apa pun yang lebih besar dari 59 akan dikonversi menjadi jam dan menit. Sebagai contoh, TIME(0,750,0) = TIME(12,30,0) = 0,520833 atau 12:30 PM.' },
            second: { name: 'second', detail: 'Diperlukan. Angka dari 0 sampai 32767 yang menyatakan detik. Nilai apa pun yang lebih besar dari 59 akan dikonversi menjadi jam, menit, dan detik. Sebagai contoh, TIME(0,0,2000) = TIME(0,33,22) = 0,023148 atau 12:33:20 AM' },
        },
    },
    TIMEVALUE: {
        description: 'Mengembalikan angka desimal dari waktu yang dinyatakan oleh string teks. Angka desimal adalah nilai dimulai dari 0 (nol) sampai 0,99988426, menyatakan waktu dari jam 0:00:00 (12:00:00 AM) sampai jam 23:59:59 (11:59:59 P.M.).',
        abstract: 'Mengembalikan angka desimal dari waktu yang dinyatakan oleh string teks. Angka desimal adalah nilai dimulai dari 0 (nol) sampai 0,99988426, menyatakan waktu dari jam 0:00:00 (12:00:00 AM) sampai jam 23:59:59 (11:59:59 P.M.).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'Diperlukan. String teks yang menyatakan waktu dalam salah satu format waktu Microsoft Excel; sebagai contoh, string teks "6:45 PM" dan "18:45" di dalam tanda kutip ganda yang menyatakan waktu.' },
        },
    },
    TO_DATE: {
        description: 'Mengonversi angka yang diberikan menjadi tanggal.',
        abstract: 'Mengonversi angka yang diberikan menjadi tanggal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3094239?hl=id',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argumen atau referensi sel yang akan dikonversi menjadi tanggal. Jika berupa angka, nilai ditafsirkan sebagai jumlah hari sejak 30 Desember 1899; nilai negatif adalah hari sebelumnya dan pecahan menunjukkan waktu setelah tengah malam. Nilai nonnumerik dikembalikan tanpa perubahan.' },
        },
    },
    TODAY: {
        description: 'Fungsi TODAY mengembalikan nomor seri tanggal saat ini. Nomor seri adalah kode tanggal-waktu yang digunakan oleh Excel untuk perhitungan tanggal dan waktu. Jika format sel adalah Umum sebelum fungsi dimasukkan, Excel mengganti format sel ke Tanggal . Jika Anda ingin melihat nomor serinya, Anda harus mengganti format sel ke Umum atau Angka .',
        abstract: 'Fungsi TODAY mengembalikan nomor seri tanggal saat ini. Nomor seri adalah kode tanggal-waktu yang digunakan oleh Excel untuk perhitungan tanggal dan waktu. Jika format sel adalah Umum sebelum fungsi dimasukkan, Excel mengganti format sel ke Tanggal . Jika Anda ingin melihat nomor serinya, Anda harus mengganti format sel ke Umum atau Angka .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Mengembalikan hari yang tekait dengan sebuah tanggal. Hari diberikan sebagai bilangan bulat, yang berkisar dari 1 (Minggu) sampai 7 (Sabtu), secara default.',
        abstract: 'Mengembalikan hari yang tekait dengan sebuah tanggal. Hari diberikan sebagai bilangan bulat, yang berkisar dari 1 (Minggu) sampai 7 (Sabtu), secara default.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Diperlukan. Nomor berurutan yang menunjukkan tanggal dari hari yang akan dicari. Tanggal harus dimasukkan dengan menggunakan fungsi DATE, atau sebagai hasil dari rumus atau fungsi lain. Contoh, gunakan DATE(2008,5,23) untuk tanggal 23 Mei 2008. Masalah bisa muncul jika tanggal dimasukkan sebagai teks.' },
            returnType: { name: 'return_type', detail: 'Opsional. Angka yang menentukan tipe nilai yang dikembalikan.' },
        },
    },
    WEEKNUM: {
        description: 'Mengembalikan nomor minggu tanggal tertentu. Misalnya, minggu yang berisi tanggal 1 Januari adalah minggu pertama dalam setahun, dan diberi nomor minggu 1.',
        abstract: 'Mengembalikan nomor minggu tanggal tertentu. Misalnya, minggu yang berisi tanggal 1 Januari adalah minggu pertama dalam setahun, dan diberi nomor minggu 1.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Diperlukan. Tanggal dalam minggu. Tanggal harus dimasukkan dengan menggunakan fungsi DATE, atau sebagai hasil dari rumus atau fungsi lain. Contoh, gunakan DATE(2008,5,23) untuk tanggal 23 Mei 2008. Masalah bisa muncul jika tanggal dimasukkan sebagai teks.' },
            returnType: { name: 'return_type', detail: 'Opsional. Angka yang menentukan pada hari apa minggu dimulai. Nilai default adalah 1.' },
        },
    },
    WORKDAY: {
        description: 'Mengembalikan angka yang menyatakan tanggal yang merupakan indikasi jumlah hari kerja sebelum atau sesudah sebuah tanggal (tanggal mulai). Hari kerja tidak termasuk akhir pekan dan tanggal yang ditetapkan sebagai hari libur. Gunakan WORKDAY untuk mengecualikan akhir pekan atau hari libur ketika menghitung tanggal jatuh tempo faktur, perkiraan tanggal pengiriman, atau jumlah hari pekerjaan yang telah dilakukan.',
        abstract: 'Mengembalikan angka yang menyatakan tanggal yang merupakan indikasi jumlah hari kerja sebelum atau sesudah sebuah tanggal (tanggal mulai). Hari kerja tidak termasuk akhir pekan dan tanggal yang ditetapkan sebagai hari libur. Gunakan WORKDAY untuk mengecualikan akhir pekan atau hari libur ketika menghitung tanggal jatuh tempo faktur, perkiraan tanggal pengiriman, atau jumlah hari pekerjaan yang telah dilakukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Diperlukan. Tanggal yang menunjukkan tanggal mulai.' },
            days: { name: 'days', detail: 'Diperlukan. Jumlah hari nonakhir pekan dan nonhari libur sebelum atau setelah start_date. Nilai positif untuk hari mengembalikan tanggal mendatang, nilai negatif mengembalikan tanggal lampau.' },
            holidays: { name: 'holidays', detail: 'Opsional. Daftar opsional yang terdiri dari satu atau lebih tanggal untuk dikecualikan dari kalender kerja, seperti hari libur nasional dan jatah cuti. Daftarnya bisa berupa rentang sel yang berisi tanggal atau konstanta array nomor seri yang menunjukkan tanggal.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Fungsi ini mengembalikan nomor seri tanggal sebelum atau sesudah jumlah hari kerja tertentu dengan parameter akhir pekan kustom. Parameter Weekend opsional dapat menunjukkan hari mana dan berapa hari yang merupakan akhir pekan. Perhatikan bahwa Hari akhir pekan dan hari apa pun yang ditentukan sebagai hari libur tidak dianggap sebagai hari kerja.',
        abstract: 'Fungsi ini mengembalikan nomor seri tanggal sebelum atau sesudah jumlah hari kerja tertentu dengan parameter akhir pekan kustom. Parameter Weekend opsional dapat menunjukkan hari mana dan berapa hari yang merupakan akhir pekan. Perhatikan bahwa Hari akhir pekan dan hari apa pun yang ditentukan sebagai hari libur tidak dianggap sebagai hari kerja.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Diperlukan. Tanggal mulai, dipotong menjadi bilangan bulat.' },
            days: { name: 'days', detail: 'Diperlukan. Jumlah hari kerja sebelum atau setelah start_date. Nilai positif menghasilkan tanggal yang akan datang; nilai negatif menghasilkan tanggal sebelumnya; nilai nol menghasilkan start_date yang sudah ditentukan . Day-offset dipotok menjadi bilangan bulat.' },
            weekend: { name: 'weekend', detail: 'Opsional. Jika digunakan, ini menunjukkan hari dalam seminggu yang merupakan hari akhir pekan dan tidak dianggap hari kerja. Argumen akhir pekan adalah angka akhir pekan atau string yang menentukan kapan akhir pekan terjadi. Nilai jumlah akhir pekan menunjukkan hari akhir pekan seperti yang diperlihatkan di bawah ini.' },
            holidays: { name: 'holidays', detail: 'Ini adalah argumen opsional di akhir sintaks. Ini menentukan sekumpulan opsional dari satu atau beberapa tanggal yang akan dikecualikan dari kalender hari kerja. Hari libur harus berupa rentang sel yang berisi tanggal -- atau konstanta array dari nilai seri yang mewakili tanggal tersebut. Urutan tanggal atau nilai seri dalam hari libur dapat berubah-ubah.' },
        },
    },
    YEAR: {
        description: 'Mengembalikan tahun yang terkait dengan satu tanggal. Tahun dikembalikan sebagai bilangan bulat dalam rentang 1900-9999.',
        abstract: 'Mengembalikan tahun yang terkait dengan satu tanggal. Tahun dikembalikan sebagai bilangan bulat dalam rentang 1900-9999.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Diperlukan. Tanggal dari tahun yang akan dicari. Tanggal harus dimasukkan dengan menggunakan fungsi DATE, atau sebagai hasil dari rumus atau fungsi lain. Misalnya, gunakan DATE(2025,5,23) untuk hari ke-23 Mei 2025. Masalah bisa muncul jika tanggal dimasukkan sebagai teks.' },
        },
    },
    YEARFRAC: {
        description: 'YEARFRAC menghitung pecahan tahun yang dinyatakan oleh jumlah hari penuh antara dua tanggal (the start_date dan end_date ). Sebagai contoh, Anda dapat menggunakan YEARFRAC untuk mengidentifikasi proporsi tunjangan atau kewajiban pembayaran setahun dalam jangka waktu tertentu.',
        abstract: 'YEARFRAC menghitung pecahan tahun yang dinyatakan oleh jumlah hari penuh antara dua tanggal (the start_date dan end_date ). Sebagai contoh, Anda dapat menggunakan YEARFRAC untuk mengidentifikasi proporsi tunjangan atau kewajiban pembayaran setahun dalam jangka waktu tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Tanggal yang mewakili tanggal mulai.' },
            endDate: { name: 'end_date', detail: 'Tanggal yang mewakili tanggal akhir.' },
            basis: { name: 'basis', detail: 'Jenis basis penghitungan hari yang akan digunakan.' },
        },
    },
};

export default locale;
