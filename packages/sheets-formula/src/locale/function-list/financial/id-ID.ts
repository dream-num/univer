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
    ACCRINT: {
        description: 'Mengembalikan bunga akrual untuk sekuritas yang membayar bunga secara berkala.',
        abstract: 'Mengembalikan bunga akrual untuk sekuritas yang membayar bunga secara berkala.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Diperlukan. Tanggal penerbitan sekuritas.' },
            firstInterest: { name: 'first_interest', detail: 'Diperlukan. Tanggal bunga pertama sekurangan.' },
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga kupon tahunan sekuritas.' },
            par: { name: 'par', detail: 'Diperlukan. Nilai nominal sekuritas. Jika Anda menghapus par, ACCRINT menggunakan $1.000.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
            calcMethod: { name: 'calc_method', detail: 'Opsional. Nilai logika yang menentukan cara menghitung total bunga akrual ketika tanggal penyelesaian lebih lambat dari tanggal first_interest. Nilai TRUE (1) mengembalikan total bunga akrual dari penerbitan ke penyelesaian. Nilai FALSE (0) mengembalikan bunga akrual dari first_interest ke penyelesaian. Jika Anda tidak memasukkan argumen, maka argumen akan menjadi TRUE secara default.' },
        },
    },
    ACCRINTM: {
        description: 'Mengembalikan bunga akrual untuk sekuritas yang membayar bunga pada saat jatuh tempo.',
        abstract: 'Mengembalikan bunga akrual untuk sekuritas yang membayar bunga pada saat jatuh tempo.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Diperlukan. Tanggal penerbitan sekuritas.' },
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga kupon tahunan sekuritas.' },
            par: { name: 'par', detail: 'Diperlukan. Nilai nominal sekuritas. Jika Anda menghapus par, ACCRINTM menggunakan $1.000.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    AMORDEGRC: {
        description: 'Mengembalikan depresiasi untuk setiap periode akuntansi. Fungsi ini diberikan untuk sistem akuntansi Prancis. Jika aset dibeli dalam pertengahan masa akuntansi, depresiasi prorata diperhitungkan. Fungsi tersebut mirip dengan AMORLINC, kecuali bahwa koefisien depresiasi diterapkan dalam perhitungan yang bergantung pada umur aset tersebut.',
        abstract: 'Mengembalikan depresiasi untuk setiap periode akuntansi. Fungsi ini diberikan untuk sistem akuntansi Prancis. Jika aset dibeli dalam pertengahan masa akuntansi, depresiasi prorata diperhitungkan. Fungsi tersebut mirip dengan AMORLINC, kecuali bahwa koefisien depresiasi diterapkan dalam perhitungan yang bergantung pada umur aset tersebut.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Diperlukan. Biaya aset.' },
            datePurchased: { name: 'date_purchased', detail: 'Diperlukan. Tanggal pembelian aset.' },
            firstPeriod: { name: 'first_period', detail: 'Diperlukan. Tanggal berakhirnya periode pertama.' },
            salvage: { name: 'salvage', detail: 'Diperlukan. Nilai sisa di akhir umur pakai aset.' },
            period: { name: 'period', detail: 'Diperlukan. Periode.' },
            rate: { name: 'rate', detail: 'Diperlukan. Tingkat depresiasi.' },
            basis: { name: 'basis', detail: 'Opsional. Basis tahun yang digunakan.' },
        },
    },
    AMORLINC: {
        description: 'Mengembalikan depresiasi untuk setiap periode akuntansi. Fungsi ini diberikan untuk sistem akuntansi Prancis. Jika aset dibeli dalam pertengahan periode akuntansi, depresiasi prorata diperhitungkan.',
        abstract: 'Mengembalikan depresiasi untuk setiap periode akuntansi. Fungsi ini diberikan untuk sistem akuntansi Prancis. Jika aset dibeli dalam pertengahan periode akuntansi, depresiasi prorata diperhitungkan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Diperlukan. Biaya aset.' },
            datePurchased: { name: 'date_purchased', detail: 'Diperlukan. Tanggal pembelian aset.' },
            firstPeriod: { name: 'first_period', detail: 'Diperlukan. Tanggal berakhirnya periode pertama.' },
            salvage: { name: 'salvage', detail: 'Diperlukan. Nilai sisa di akhir umur pakai aset.' },
            period: { name: 'period', detail: 'Diperlukan. Periode.' },
            rate: { name: 'rate', detail: 'Diperlukan. Tingkat depresiasi.' },
            basis: { name: 'basis', detail: 'Opsional. Basis tahun yang digunakan.' },
        },
    },
    COUPDAYBS: {
        description: 'Fungsi COUPDAYBS mengembalikan jumlah hari dari awal periode kupon sampai tanggal penyelesaian.',
        abstract: 'Fungsi COUPDAYBS mengembalikan jumlah hari dari awal periode kupon sampai tanggal penyelesaian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    COUPDAYS: {
        description: 'Mengembalikan jumlah hari dalam periode kupon yang berisi tanggal penyelesaian.',
        abstract: 'Mengembalikan jumlah hari dalam periode kupon yang berisi tanggal penyelesaian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    COUPDAYSNC: {
        description: 'Mengembalikan jumlah hari sejak tanggal penyelesaian sampai tanggal kupon berikutnya.',
        abstract: 'Mengembalikan jumlah hari sejak tanggal penyelesaian sampai tanggal kupon berikutnya.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    COUPNCD: {
        description: 'Mengembalikan angka yang menyatakan tanggal kupon berikutnya setelah tanggal penyelesaian.',
        abstract: 'Mengembalikan angka yang menyatakan tanggal kupon berikutnya setelah tanggal penyelesaian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    COUPNUM: {
        description: 'Mengembalikan jumlah kupon yang harus dibayar antara tanggal penyelesaian dan tanggal jatuh tempo, yang dibulatkan ke atas ke kupon utuh terdekat.',
        abstract: 'Mengembalikan jumlah kupon yang harus dibayar antara tanggal penyelesaian dan tanggal jatuh tempo, yang dibulatkan ke atas ke kupon utuh terdekat.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    COUPPCD: {
        description: 'Mengembalikan angka yang menyatakan tanggal kupon sebelumnya sebelum tanggal pelunasan.',
        abstract: 'Mengembalikan angka yang menyatakan tanggal kupon sebelumnya sebelum tanggal pelunasan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    CUMIPMT: {
        description: 'Mengembalikan bunga kumulatif yang dibayarkan pada pinjaman antara start_period dan end_period.',
        abstract: 'Mengembalikan bunga kumulatif yang dibayarkan pada pinjaman antara start_period dan end_period.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga.' },
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran.' },
            pv: { name: 'pv', detail: 'Diperlukan. Nilai saat ini.' },
            startPeriod: { name: 'start_period', detail: 'Diperlukan. Periode pertama dalam perhitungan. Periode pembayaran dinomori mulai dari 1.' },
            endPeriod: { name: 'end_period', detail: 'Diperlukan. Periode terakhir dalam perhitungan.' },
            type: { name: 'type', detail: 'Diperlukan. Waktu pembayaran.' },
        },
    },
    CUMPRINC: {
        description: 'Mengembalikan pokok kumulatif yang dibayarkan pada pinjaman antara start_period dan end_period.',
        abstract: 'Mengembalikan pokok kumulatif yang dibayarkan pada pinjaman antara start_period dan end_period.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga.' },
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran.' },
            pv: { name: 'pv', detail: 'Diperlukan. Nilai saat ini.' },
            startPeriod: { name: 'start_period', detail: 'Diperlukan. Periode pertama dalam perhitungan. Periode pembayaran dinomori mulai dari 1.' },
            endPeriod: { name: 'end_period', detail: 'Diperlukan. Periode terakhir dalam perhitungan.' },
            type: { name: 'type', detail: 'Diperlukan. Waktu pembayaran.' },
        },
    },
    DB: {
        description: 'Mengembalikan depresiasi aset untuk periode yang ditentukan dengan menggunakan metode neraca menurun-tetap.',
        abstract: 'Mengembalikan depresiasi aset untuk periode yang ditentukan dengan menggunakan metode neraca menurun-tetap.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Diperlukan. Biaya awal aset.' },
            salvage: { name: 'salvage', detail: 'Diperlukan. Nilai di akhir depresiasi (kadang-kadang disebut nilai sisa aset).' },
            life: { name: 'life', detail: 'Diperlukan. Jumlah periode selama aset disusutkan (kadang-kadang disebut umur manfaat aset).' },
            period: { name: 'period', detail: 'Diperlukan. Periode saat Anda ingin menghitung depresiasi. Periode harus menggunakan unit yang sama seperti umur pakai.' },
            month: { name: 'month', detail: 'Opsional. Jumlah bulan dalam tahun pertama. Jika bulan dihilangkan, diasumsikan sebagai 12.' },
        },
    },
    DDB: {
        description: 'Mengembalikan depresiasi aset untuk periode yang ditentukan dengan menggunakan metode neraca menurun-ganda atau metode lain yang Anda tentukan.',
        abstract: 'Mengembalikan depresiasi aset untuk periode yang ditentukan dengan menggunakan metode neraca menurun-ganda atau metode lain yang Anda tentukan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Diperlukan. Biaya awal aset.' },
            salvage: { name: 'salvage', detail: 'Diperlukan. Nilai di akhir depresiasi (kadang-kadang disebut nilai sisa aset). Nilai ini dapat berupa 0.' },
            life: { name: 'life', detail: 'Diperlukan. Jumlah periode selama aset disusutkan (kadang-kadang disebut umur manfaat aset).' },
            period: { name: 'period', detail: 'Diperlukan. Periode saat Anda ingin menghitung depresiasi. Periode harus menggunakan unit yang sama seperti umur pakai.' },
            factor: { name: 'factor', detail: 'Opsional. Kecepatan penurunan saldo. Jika faktor diabaikan, maka diasumsikan sebagai 2 (metode saldo menurun-ganda).' },
        },
    },
    DISC: {
        description: 'Mengembalikan tingkat diskon sekuritas.',
        abstract: 'Mengembalikan tingkat diskon sekuritas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            pr: { name: 'pr', detail: 'Diperlukan. Harga sekuritas per nilai nominal $100.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Nilai penebusan sekuritas per nilai nominal $100.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    DOLLARDE: {
        description: 'Mengonversi harga dolar yang dinyatakan sebagai bagian bilangan bulat dan bagian pecahan, seperti 1,02, ke dalam harga dolar yang dinyatakan dalam bilangan desimal. Angka dolar pecahan kadang-kadang digunakan untuk harga sekuritas.',
        abstract: 'Mengonversi harga dolar yang dinyatakan sebagai bagian bilangan bulat dan bagian pecahan, seperti 1,02, ke dalam harga dolar yang dinyatakan dalam bilangan desimal. Angka dolar pecahan kadang-kadang digunakan untuk harga sekuritas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'fractional_dollar', detail: 'Diperlukan. Angka yang dinyatakan sebagai bagian bilangan bulat dan bagian pecahan, yang dipisahkan oleh simbol desimal.' },
            fraction: { name: 'fraction', detail: 'Diperlukan. Bilangan bulat yang akan digunakan dalam denominator pecahan.' },
        },
    },
    DOLLARFR: {
        description: 'Gunakan DOLLARFR untuk mengonversi bilangan desimal ke angka dolar pecahan, seperti harga saham.',
        abstract: 'Gunakan DOLLARFR untuk mengonversi bilangan desimal ke angka dolar pecahan, seperti harga saham.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'decimal_dollar', detail: 'Diperlukan. Bilangan desimal.' },
            fraction: { name: 'fraction', detail: 'Diperlukan. Bilangan bulat yang akan digunakan dalam denominator pecahan.' },
        },
    },
    DURATION: {
        description: 'Fungsi DURATION , salah satu fungsi Financial, mengembalikan durasi Macauley untuk nilai par yang diasumsikan sebesar $100. Durasi didefinisikan sebagai rata-rata tertimbang dari nilai arus kas saat ini, dan digunakan sebagai ukuran respons harga obligasi terhadap perubahan hasil.',
        abstract: 'Fungsi DURATION , salah satu fungsi Financial, mengembalikan durasi Macauley untuk nilai par yang diasumsikan sebesar $100. Durasi didefinisikan sebagai rata-rata tertimbang dari nilai arus kas saat ini, dan digunakan sebagai ukuran respons harga obligasi terhadap perubahan hasil.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            coupon: { name: 'coupon', detail: 'Diperlukan. Suku bunga kupon tahunan sekuritas.' },
            yld: { name: 'yld', detail: 'Diperlukan. Laba tahunan sekuritas.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    EFFECT: {
        description: 'Mengembalikan suku bunga tahunan efektif, dengan suku bunga nominal tahunan dan jumlah periode bunga majemuk per tahun.',
        abstract: 'Mengembalikan suku bunga tahunan efektif, dengan suku bunga nominal tahunan dan jumlah periode bunga majemuk per tahun.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'Diperlukan. Suku bunga nominal.' },
            npery: { name: 'npery', detail: 'Diperlukan. Jumlah periode bunga majemuk per tahun.' },
        },
    },
    FV: {
        description: 'FV , salah satu fungsi keuangan , menghitung nilai investasi di masa depan berdasarkan suku bunga tetap. Anda bisa menggunakan FV dengan pembayaran berkala, tetap atau pembayaran sekaligus.',
        abstract: 'FV , salah satu fungsi keuangan , menghitung nilai investasi di masa depan berdasarkan suku bunga tetap. Anda bisa menggunakan FV dengan pembayaran berkala, tetap atau pembayaran sekaligus.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga tiap periode.' },
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran dalam satu anuitas.' },
            pmt: { name: 'pmt', detail: 'Diperlukan. Pembayaran dilakukan tiap periode dan tidak dapat diganti selama anuitas belum berakhir. Umumnya, pmt mencakup biaya pokok dan bunga tetapi tidak ada biaya lain atau pajak. Jika pmt dihilangkan, Anda harus menyertakan argumen pv.' },
            pv: { name: 'pv', detail: 'Opsional. Nilai saat ini, atau jumlah total harga sekarang dari serangkaian pembayaran di masa mendatang. Jika pv dihilangkan, maka dianggap 0 (nol), dan Anda harus menyertakan argumen pmt.' },
            type: { name: 'type', detail: 'Opsional. Angka 0 atau 1 dan menunjukkan bahwa pembayaran telah jatuh tempo. Jika tipe dihilangkan, maka dianggap sebagai 0.' },
        },
    },
    FVSCHEDULE: {
        description: 'Mengembalikan nilai masa mendatang biaya pokok awal setelah menerapkan serangkaian campuran suku bunga. Gunakan FVSCHEDULE untuk menghitung nilai masa depan sebuah investasi dengan variabel atau suku bunga yang dapat disesuaikan.',
        abstract: 'Mengembalikan nilai masa mendatang biaya pokok awal setelah menerapkan serangkaian campuran suku bunga. Gunakan FVSCHEDULE untuk menghitung nilai masa depan sebuah investasi dengan variabel atau suku bunga yang dapat disesuaikan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'Diperlukan. Nilai saat ini.' },
            schedule: { name: 'schedule', detail: 'Diperlukan. Array suku bunga yang diterapkan.' },
        },
    },
    INTRATE: {
        description: 'Mengembalikan suku bunga sekuritas investasi penuh.',
        abstract: 'Mengembalikan suku bunga sekuritas investasi penuh.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            investment: { name: 'investment', detail: 'Diperlukan. Jumlah yang diinvestasikan dalam sekuritas.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Jumlah yang diterima pada saat jatuh tempo.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    IPMT: {
        description: 'Mengembalikan pembayaran bunga untuk periode tertentu untuk investasi berdasarkan pembayaran berkala dan konstan serta suku bunga konstan.',
        abstract: 'Mengembalikan pembayaran bunga untuk periode tertentu untuk investasi berdasarkan pembayaran berkala dan konstan serta suku bunga konstan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga tiap periode.' },
            per: { name: 'per', detail: 'Diperlukan. Periode yang ingin Anda cari bunganya dan harus berada dalam rentang 1 sampai nper.' },
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran dalam satu anuitas.' },
            pv: { name: 'pv', detail: 'Diperlukan. Nilai saat ini, atau jumlah total harga sekarang dari serangkaian pembayaran di masa mendatang.' },
            fv: { name: 'fv', detail: 'Opsional. Nilai masa mendatang, atau keseimbangan kas yang ingin Anda capai setelah pembayaran terakhir dilakukan. Jika fv dikosongkan, maka diasumsikan sebagai 0 (misalnya, nilai masa depan sebuah pinjaman adalah 0).' },
            type: { name: 'type', detail: 'Opsional. Angka 0 atau 1 dan menunjukkan bahwa pembayaran telah jatuh tempo. Jika tipe dihilangkan, maka dianggap sebagai 0.' },
        },
    },
    IRR: {
        description: 'Mengembalikan tingkat pengembalian internal untuk serangkaian arus kas yang dinyatakan oleh angka dalam nilai. Arus kas ini tidak harus genap, karena akan genap dengan sendirinya untuk satu anuitas. Walau demikian, arus kas harus terjadi pada interval rutin, seperti bulanan atau tahunan. Laba atas investasi internal adalah suku bunga yang diterima untuk investasi yang terdiri dari pembayaran (nilai negatif) dan pendapatan (nilai positif) yang terjadi dalam periode rutin.',
        abstract: 'Mengembalikan tingkat pengembalian internal untuk serangkaian arus kas yang dinyatakan oleh angka dalam nilai. Arus kas ini tidak harus genap, karena akan genap dengan sendirinya untuk satu anuitas. Walau demikian, arus kas harus terjadi pada interval rutin, seperti bulanan atau tahunan. Laba atas investasi internal adalah suku bunga yang diterima untuk investasi yang terdiri dari pembayaran (nilai negatif) dan pendapatan (nilai positif) yang terjadi dalam periode rutin.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Array atau referensi sel yang berisi angka untuk menghitung tingkat pengembalian internal. Harus berisi setidaknya satu nilai positif dan satu negatif; teks, nilai logika, dan sel kosong diabaikan.' },
            guess: { name: 'guess', detail: 'Angka yang Anda perkirakan mendekati hasil IRR.' },
        },
    },
    ISPMT: {
        description: 'Menghitung bunga yang dibayarkan (atau diterima) untuk periode pinjaman (atau investasi) tertentu dengan pembayaran pokok genap.',
        abstract: 'Menghitung bunga yang dibayarkan (atau diterima) untuk periode pinjaman (atau investasi) tertentu dengan pembayaran pokok genap.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga untuk investasi.' },
            per: { name: 'per', detail: 'Diperlukan. Periode yang ingin Anda cari bunganya, dan harus antara 1 dan Nper.' },
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran untuk investasi.' },
            pv: { name: 'pv', detail: 'Diperlukan. Nilai investasi saat ini. Untuk pinjaman, Pv adalah jumlah pinjaman.' },
        },
    },
    MDURATION: {
        description: 'Mengembalikan durasi Macauley yang dimodifikasi untuk sekuritas dengan nilai par yang diasumsikan sebesar $100.',
        abstract: 'Mengembalikan durasi Macauley yang dimodifikasi untuk sekuritas dengan nilai par yang diasumsikan sebesar $100.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            coupon: { name: 'coupon', detail: 'Diperlukan. Suku bunga kupon tahunan sekuritas.' },
            yld: { name: 'yld', detail: 'Diperlukan. Laba tahunan sekuritas.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    MIRR: {
        description: 'Mengembalikan laba atas investasi internal yang dimodifikasi untuk serangkaian arus kas periodik. MIRR mempertimbangkan baik biaya investasi maupun bunga yang diterima dari penginvestasian kembali kas.',
        abstract: 'Mengembalikan laba atas investasi internal yang dimodifikasi untuk serangkaian arus kas periodik. MIRR mempertimbangkan baik biaya investasi maupun bunga yang diterima dari penginvestasian kembali kas.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Diperlukan. Sebuah array atau referensi ke sel-sel yang berisi angka. Angka-angka ini menunjukkan serangkaian pembayaran (nilai negatif) dan pemasukan (nilai positif) yang terjadi dalam periode rutin. Nilai harus berisi setidaknya satu nilai positif dan satu nilai negatif untuk menghitung tingkat pengembalian internal yang dimodifikasi. Jika tidak, MIRR mengembalikan #DIV/0! nilai kesalahan. Jika sebuah argumen array atau referensi mencakup teks, nilai logika, atau sel kosong, maka nilai-nilai itu diabaikan; akan tetapi sel-sel dengan nilai nol dimasukkan.' },
            financeRate: { name: 'finance_rate', detail: 'Diperlukan. Suku bunga yang Anda bayar atas uang yang digunakan dalam arus kas.' },
            reinvestRate: { name: 'reinvest_rate', detail: 'Diperlukan. Suku bunga yang Anda terima dari arus kas karena Anda menginvestasikannya kembali.' },
        },
    },
    NOMINAL: {
        description: 'Mengembalikan suku bunga tahunan nominal, dengan suku bunga efektif dan jumlah periode bunga majemuk per tahun.',
        abstract: 'Mengembalikan suku bunga tahunan nominal, dengan suku bunga efektif dan jumlah periode bunga majemuk per tahun.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'effect_rate', detail: 'Diperlukan. Suku bunga efektif.' },
            npery: { name: 'npery', detail: 'Diperlukan. Jumlah periode bunga majemuk per tahun.' },
        },
    },
    NPER: {
        description: 'Mengembalikan jumlah periode untuk sebuah investasi berdasarkan pembayaran berkala dan terus menerus serta tingkat bunga tetap.',
        abstract: 'Mengembalikan jumlah periode untuk sebuah investasi berdasarkan pembayaran berkala dan terus menerus serta tingkat bunga tetap.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga tiap periode.' },
            pmt: { name: 'pmt', detail: 'Diperlukan. Pembayaran dilakukan tiap periode dan tidak dapat diganti selama anuitas belum berakhir. Umumnya, pmt mencakup biaya pokok dan bunga tetapi tidak ada biaya lain atau pajak.' },
            pv: { name: 'pv', detail: 'Diperlukan. Nilai saat ini, atau jumlah total harga sekarang dari serangkaian pembayaran di masa mendatang.' },
            fv: { name: 'fv', detail: 'Opsional. Nilai masa mendatang, atau keseimbangan kas yang ingin Anda capai setelah pembayaran terakhir dilakukan. Jika fv dikosongkan, maka diasumsikan sebagai 0 (misalnya, nilai masa depan sebuah pinjaman adalah 0).' },
            type: { name: 'type', detail: 'Opsional. Angka 0 atau 1 dan menunjukkan kapan pembayaran jatuh tempo.' },
        },
    },
    NPV: {
        description: 'Menghitung nilai bersih saat ini dari sebuah investasi dengan menggunakan tingkat diskon dan serangkaian pembayaran yang akan datang (nilai negatif) dan pendapatan (nilai positif).',
        abstract: 'Menghitung nilai bersih saat ini dari sebuah investasi dengan menggunakan tingkat diskon dan serangkaian pembayaran yang akan datang (nilai negatif) dan pendapatan (nilai positif).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Tingkat diskon selama satu periode.' },
            value1: { name: 'value1', detail: 'Value1 diperlukan, nilai berikutnya opsional. Argumen 1 hingga 254 yang menunjukkan pembayaran dan pendapatan. Value1, value2, ... harus diberi jarak waktu yang sama dan terjadi pada akhir setiap periode. NPV menggunakan urutan value1, value2, ... untuk menerjemahkan urutan arus kas. Pastikan Anda memasukkan nilai pembayaran dan pendapatan dalam urutan yang tepat. Argumen yang berupa sel kosong, nilai logika, atau teks representasi angka, nilai kesalahan, atau teks yang tidak dapat diterjemahkan menjadi angka diabaikan. Jika argumen berupa array atau referensi, hanya angka dalam array atau referensi itu yang dihitung. Sel kosong, nilai logika, teks, atau nilai kesalahan dalam array atau referensi diabaikan.' },
            value2: { name: 'value2', detail: 'Value1 diperlukan, nilai berikutnya opsional. Argumen 1 hingga 254 yang menunjukkan pembayaran dan pendapatan. Value1, value2, ... harus diberi jarak waktu yang sama dan terjadi pada akhir setiap periode. NPV menggunakan urutan value1, value2, ... untuk menerjemahkan urutan arus kas. Pastikan Anda memasukkan nilai pembayaran dan pendapatan dalam urutan yang tepat. Argumen yang berupa sel kosong, nilai logika, atau teks representasi angka, nilai kesalahan, atau teks yang tidak dapat diterjemahkan menjadi angka diabaikan. Jika argumen berupa array atau referensi, hanya angka dalam array atau referensi itu yang dihitung. Sel kosong, nilai logika, teks, atau nilai kesalahan dalam array atau referensi diabaikan.' },
        },
    },
    ODDFPRICE: {
        description: 'Mengembalikan harga per nilai nominal $100 dari sekuritas dengan periode pertama yang tidak teratur.',
        abstract: 'Mengembalikan harga per nilai nominal $100 dari sekuritas dengan periode pertama yang tidak teratur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Tanggal penyelesaian sekuritas.' },
            maturity: { name: 'maturity', detail: 'Tanggal jatuh tempo sekuritas.' },
            issue: { name: 'issue', detail: 'Tanggal penerbitan sekuritas.' },
            firstCoupon: { name: 'first_coupon', detail: 'Tanggal kupon pertama sekuritas.' },
            rate: { name: 'rate', detail: 'Suku bunga sekuritas.' },
            yld: { name: 'yld', detail: 'Hasil tahunan sekuritas.' },
            redemption: { name: 'redemption', detail: 'Nilai penebusan sekuritas per nilai nominal $100.' },
            frequency: { name: 'frequency', detail: 'Jumlah pembayaran kupon per tahun: 1 untuk tahunan, 2 untuk semesteran, dan 4 untuk triwulanan.' },
            basis: { name: 'basis', detail: 'Jenis basis penghitungan hari yang akan digunakan.' },
        },
    },
    ODDFYIELD: {
        description: 'Mengembalikan hasil sekuritas yang mempunyai periode pertama ganjil (pendek atau panjang).',
        abstract: 'Mengembalikan hasil sekuritas yang mempunyai periode pertama ganjil (pendek atau panjang).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            issue: { name: 'issue', detail: 'Diperlukan. Tanggal penerbitan sekuritas.' },
            firstCoupon: { name: 'first_coupon', detail: 'Diperlukan. Tanggal kupon pertama sekuritas.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga sekuritas.' },
            pr: { name: 'pr', detail: 'Diperlukan. Harga sekuritas.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Nilai penebusan sekuritas per nilai nominal $100.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    ODDLPRICE: {
        description: 'Mengembalikan harga per nilai nominal $100 dari sekuritas yang memiliki periode kupon akhir ganjil (pendek atau panjang).',
        abstract: 'Mengembalikan harga per nilai nominal $100 dari sekuritas yang memiliki periode kupon akhir ganjil (pendek atau panjang).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            lastInterest: { name: 'last_interest', detail: 'Diperlukan. Tanggal kupon akhir sekuritas.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga sekuritas.' },
            yld: { name: 'yld', detail: 'Diperlukan. Laba tahunan sekuritas.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Nilai penebusan sekuritas per nilai nominal $100.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    ODDLYIELD: {
        description: 'Mengembalikan hasil sekuritas yang mempunyai periode akhir ganjil (pendek atau panjang).',
        abstract: 'Mengembalikan hasil sekuritas yang mempunyai periode akhir ganjil (pendek atau panjang).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            lastInterest: { name: 'last_interest', detail: 'Diperlukan. Tanggal kupon akhir sekuritas.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga sekuritas.' },
            pr: { name: 'pr', detail: 'Diperlukan. Harga sekuritas.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Nilai penebusan sekuritas per nilai nominal $100.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    PDURATION: {
        description: 'Mengembalikan jumlah periode yang diperlukan investasi untuk mencapai nilai yang ditentukan.',
        abstract: 'Mengembalikan jumlah periode yang diperlukan investasi untuk mencapai nilai yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Rate adalah suku bunga tiap periode.' },
            pv: { name: 'pv', detail: 'Diperlukan. Pv adalah nilai investasi saat ini.' },
            fv: { name: 'fv', detail: 'Diperlukan. Fv adalah nilai investasi masa depan yang diinginkan.' },
        },
    },
    PMT: {
        description: 'PMT , salah satu Fungsi keuangan . menghitung pembayaran untuk pinjaman berdasarkan pembayaran berkala dan terus menerus serta suku bunga tetap.',
        abstract: 'PMT , salah satu Fungsi keuangan . menghitung pembayaran untuk pinjaman berdasarkan pembayaran berkala dan terus menerus serta suku bunga tetap.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga untuk pinjaman.' },
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran untuk pinjaman.' },
            pv: { name: 'pv', detail: 'Diperlukan. Nilai saat ini, atau jumlah total harga saat ini dari serangkaian pembayaran masa depan; yang juga dikenal sebagai pinjaman pokok.' },
            fv: { name: 'fv', detail: 'Opsional. Nilai masa mendatang, atau keseimbangan kas yang ingin Anda capai setelah pembayaran terakhir dilakukan. Jika fv dikosongkan, maka diasumsikan sebagai 0 (nol), yaitu, nilai pinjaman yang akan datang adalah 0.' },
            type: { name: 'type', detail: 'Opsional. Angka 0 (nol) atau 1 dan menunjukkan bahwa pembayaran telah jatuh tempo.' },
        },
    },
    PPMT: {
        description: 'Mengembalikan pembayaran pinjaman pokok untuk periode tertentu untuk investasi berdasarkan pembayaran berkala dan terus menerus serta suku bunga tetap.',
        abstract: 'Mengembalikan pembayaran pinjaman pokok untuk periode tertentu untuk investasi berdasarkan pembayaran berkala dan terus menerus serta suku bunga tetap.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga tiap periode.' },
            per: { name: 'per', detail: 'Diperlukan. Menentukan periode dan harus berada pada rentang 1 hingga nper.' },
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran dalam satu anuitas.' },
            pv: { name: 'pv', detail: 'Diperlukan. Nilai saat ini — jumlah total harga hari ini dari serangkaian pembayaran yang akan datang.' },
            fv: { name: 'fv', detail: 'Opsional. Nilai masa mendatang, atau keseimbangan kas yang ingin Anda capai setelah pembayaran terakhir dilakukan. Jika fv dikosongkan, maka diasumsikan sebagai 0 (nol), yaitu, nilai pinjaman yang akan datang adalah 0.' },
            type: { name: 'type', detail: 'Opsional. Angka 0 atau 1 dan menunjukkan kapan pembayaran jatuh tempo.' },
        },
    },
    PRICE: {
        description: 'Mengembalikan harga dari setiap nilai nominal $100 sebuah sekuritas yang membayar bunga berkala.',
        abstract: 'Mengembalikan harga dari setiap nilai nominal $100 sebuah sekuritas yang membayar bunga berkala.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga kupon tahunan sekuritas.' },
            yld: { name: 'yld', detail: 'Diperlukan. Laba tahunan sekuritas.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Nilai penebusan sekuritas per nilai nominal $100.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    PRICEDISC: {
        description: 'Mengembalikan harga untuk setiap nilai $100 sebuah sekuritas didiskon.',
        abstract: 'Mengembalikan harga untuk setiap nilai $100 sebuah sekuritas didiskon.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            discount: { name: 'discount', detail: 'Diperlukan. Diskon sekuritas.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Nilai penebusan sekuritas per nilai nominal $100.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    PRICEMAT: {
        description: 'Mengembalikan harga nilai nominal $100 sebuah sekuritas yang membayar bunga saat jatuh tempo.',
        abstract: 'Mengembalikan harga nilai nominal $100 sebuah sekuritas yang membayar bunga saat jatuh tempo.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            issue: { name: 'issue', detail: 'Diperlukan. Tanggal terbit sekuritas, diekspresikan sebagai nomor seri tanggal.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga sekuritas pada tanggal terbit.' },
            yld: { name: 'yld', detail: 'Diperlukan. Laba tahunan sekuritas.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    PV: {
        description: 'PV , salah satu fungsi keuangan , menghitung nilai pinjaman atau investasi saat ini, berdasarkan suku bunga tetap. Anda bisa menggunakan PV dengan pembayaran berkala, tetap (seperti pinjaman hipotek atau lainnya), atau nilai hasil investasi di masa depan.',
        abstract: 'PV , salah satu fungsi keuangan , menghitung nilai pinjaman atau investasi saat ini, berdasarkan suku bunga tetap. Anda bisa menggunakan PV dengan pembayaran berkala, tetap (seperti pinjaman hipotek atau lainnya), atau nilai hasil investasi di masa depan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga tiap periode. Misalnya, jika Anda mengambil kredit mobil dengan bunga tahunan 10 persen dan melakukan pembayaran bulanan, maka suku bunga per bulan Anda adalah 10%/12, atau 0.83%. Anda akan memasukkan 10%/12, atau 0.83%, atau 0.0083, ke dalam rumus sebagai suku bunga.' },
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran dalam satu anuitas. Misalnya, jika Anda mendapatkan kredit mobil selama empat tahun dan membuat pembayaran bulanan, pinjaman Anda memiliki periode 4*12 (atau 48). Anda akan memasukkan 48 ke dalam rumus nper.' },
            pmt: { name: 'pmt', detail: 'Diperlukan. Pembayaran yang dilakukan setiap periode dan tidak bisa berubah sepanjang hidup anuitas. Umumnya, pmt mencakup pokok pinjaman dan bunga tanpa biaya lain dan pajak. Misalnya, pembayaran bulanan kredit mobil sebesar $10.000 selama empat tahun dengan bunga 12 persen adalah $263.33. Anda akan memasukkan -263.33 ke dalam rumus sebagai pmt. Jika pmt dihilangkan, Anda harus menyertakan argumen fv.' },
            fv: { name: 'fv', detail: 'Opsional. Nilai masa mendatang atau saldo kas yang ingin Anda capai setelah pembayaran terakhir dilakukan. Jika fv dikosongkan, maka diasumsikan sebagai 0 (misalnya, nilai masa depan sebuah pinjaman adalah 0). Misalnya, jika Anda ingin menabung $50.000 untuk membayar sebuah proyek khusus dalam waktu 18 tahun, maka $50.000 adalah nilai masa depan. Setelah itu Anda dapat membuat perkiraan konservatif terhadap suku bunga dan menentukan berapa banyak yang harus Anda tabung setiap bulan. Jika pmt dikosongkan, Anda harus memasukkan argumen pmt.' },
            type: { name: 'type', detail: 'Opsional. Angka 0 atau 1 dan menunjukkan kapan pembayaran jatuh tempo.' },
        },
    },
    RATE: {
        description: 'Mengembalikan suku bunga per periode anuitas. RATE dihitung dengan perulangan dan dapat memiliki nol atau lebih solusi. Jika hasil rate tidak berurut ke dalam 0,0000001 setelah 20 perulangan, RATE mengembalikan #NUM! nilai kesalahan.',
        abstract: 'Mengembalikan suku bunga per periode anuitas. RATE dihitung dengan perulangan dan dapat memiliki nol atau lebih solusi. Jika hasil rate tidak berurut ke dalam 0,0000001 setelah 20 perulangan, RATE mengembalikan #NUM! nilai kesalahan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Diperlukan. Total jumlah periode pembayaran dalam satu anuitas.' },
            pmt: { name: 'pmt', detail: 'Diperlukan. Pembayaran yang dilakukan setiap periode dan tidak bisa berubah sepanjang hidup anuitas. Umumnya, pmt mencakup pokok pinjaman dan bunga tanpa biaya lain dan pajak. Jika pmt dikosongkan, Anda harus memasukkan argumen fv.' },
            pv: { name: 'pv', detail: 'Diperlukan. Nilai saat ini — jumlah total harga hari ini dari serangkaian pembayaran yang akan datang.' },
            fv: { name: 'fv', detail: 'Opsional. Nilai masa mendatang, atau keseimbangan kas yang ingin Anda capai setelah pembayaran terakhir dilakukan. Jika fv dikosongkan, maka diasumsikan sebagai 0 (misalnya, nilai masa depan sebuah pinjaman adalah 0). Jika dikosongkan, Anda harus menyertakan argumen pmt.' },
            type: { name: 'type', detail: 'Opsional. Angka 0 atau 1 dan menunjukkan kapan pembayaran jatuh tempo.' },
            guess: { name: 'guess', detail: 'Opsional. Perkiraan Anda mengenai besarnya suku bunga. Jika Anda menghilangkan perkiraan, suka bunga akan dianggap 10 persen. Jika RATE tidak diperoleh, coba nilai lain untuk perkiraan. RATE biasanya diperoleh jika perkiraan di antara 0 dan 1.' },
        },
    },
    RECEIVED: {
        description: 'Mengembalikan jumlah yang diterima saat jatuh tempo untuk sekuritas yang diinvestasikan secara penuh.',
        abstract: 'Mengembalikan jumlah yang diterima saat jatuh tempo untuk sekuritas yang diinvestasikan secara penuh.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            investment: { name: 'investment', detail: 'Diperlukan. Jumlah yang diinvestasikan dalam sekuritas.' },
            discount: { name: 'discount', detail: 'Diperlukan. Diskon sekuritas.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    RRI: {
        description: 'Mengembalikan suku bunga yang sama untuk pertumbuhan investasi.',
        abstract: 'Mengembalikan suku bunga yang sama untuk pertumbuhan investasi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Diperlukan. Nper adalah jumlah periode untuk investasi.' },
            pv: { name: 'pv', detail: 'Diperlukan. Pv adalah nilai investasi saat ini.' },
            fv: { name: 'fv', detail: 'Diperlukan. Fv adalah nilai investasi di masa depan.' },
        },
    },
    SLN: {
        description: 'Mengembalikan nilai depresiasi aset secara lurus untuk satu periode.',
        abstract: 'Mengembalikan nilai depresiasi aset secara lurus untuk satu periode.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Diperlukan. Biaya awal aset.' },
            salvage: { name: 'salvage', detail: 'Diperlukan. Nilai di akhir depresiasi (kadang-kadang disebut nilai sisa aset).' },
            life: { name: 'life', detail: 'Diperlukan. Jumlah periode depresiasi aset (kadang disebut umur berguna dari aset).' },
        },
    },
    SYD: {
        description: 'Mengembalikan jumlah dari depresiasi digit tahun dari aset untuk periode tertentu.',
        abstract: 'Mengembalikan jumlah dari depresiasi digit tahun dari aset untuk periode tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Diperlukan. Biaya awal aset.' },
            salvage: { name: 'salvage', detail: 'Diperlukan. Nilai di akhir depresiasi (kadang-kadang disebut nilai sisa aset).' },
            life: { name: 'life', detail: 'Diperlukan. Jumlah periode depresiasi aset (kadang disebut umur berguna dari aset).' },
            per: { name: 'per', detail: 'Diperlukan. Periode dan harus menggunakan satuan yang sama dengan life.' },
        },
    },
    TBILLEQ: {
        description: 'Mengembalikan hasil yang sepadan dengan obligasi untuk Surat Perbendaharaan Negara.',
        abstract: 'Mengembalikan hasil yang sepadan dengan obligasi untuk Surat Perbendaharaan Negara.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian Surat Perbendaharaan Negara. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat Surat Perbendaharaan Negara diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo Surat Perbendaharaan Negara. Tanggal jatuh tempo adalah tanggal ketika Surat Perbendaharaan Negara telah kedaluwarsa.' },
            discount: { name: 'discount', detail: 'Diperlukan. Tarif diskon Surat Perbendaharaan Negara.' },
        },
    },
    TBILLPRICE: {
        description: 'Mengembalikan harga per nilai nominal $100 untuk Surat Perbendaharaan Negara.',
        abstract: 'Mengembalikan harga per nilai nominal $100 untuk Surat Perbendaharaan Negara.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian Surat Perbendaharaan Negara. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat Surat Perbendaharaan Negara diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo Surat Perbendaharaan Negara. Tanggal jatuh tempo adalah tanggal ketika Surat Perbendaharaan Negara telah kedaluwarsa.' },
            discount: { name: 'discount', detail: 'Diperlukan. Tarif diskon Surat Perbendaharaan Negara.' },
        },
    },
    TBILLYIELD: {
        description: 'Mengembalikan hasil untuk Surat Perbendaharaan Negara.',
        abstract: 'Mengembalikan hasil untuk Surat Perbendaharaan Negara.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian Surat Perbendaharaan Negara. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat Surat Perbendaharaan Negara diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo Surat Perbendaharaan Negara. Tanggal jatuh tempo adalah tanggal ketika Surat Perbendaharaan Negara telah kedaluwarsa.' },
            pr: { name: 'pr', detail: 'Diperlukan. Harga Surat Perbendaharaan Negara per nilai nominal $100.' },
        },
    },
    VDB: {
        description: 'Mengembalikan depresiasi aset untuk periode yang ditentukan, termasuk periode parsial, menggunakan metode saldo menurun-ganda atau metode lain yang Anda tentukan. VDB adalah singkatan dari variable declining balance (saldo menurun variabel).',
        abstract: 'Mengembalikan depresiasi aset untuk periode yang ditentukan, termasuk periode parsial, menggunakan metode saldo menurun-ganda atau metode lain yang Anda tentukan. VDB adalah singkatan dari variable declining balance (saldo menurun variabel).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Diperlukan. Biaya awal aset.' },
            salvage: { name: 'salvage', detail: 'Diperlukan. Nilai di akhir depresiasi (kadang-kadang disebut nilai sisa aset). Nilai ini dapat berupa 0.' },
            life: { name: 'life', detail: 'Diperlukan. Jumlah periode depresiasi aset (kadang disebut umur berguna dari aset).' },
            startPeriod: { name: 'start_period', detail: 'Diperlukan. Periode awal yang akan dihitung depresiasinya. Start_period harus menggunakan satuan yang sama dengan masa pakai.' },
            endPeriod: { name: 'end_period', detail: 'Diperlukan. Periode akhir yang akan dihitung depresiasinya. Periode_akhir harus menggunakan satuan yang sama dengan masa pakai.' },
            factor: { name: 'factor', detail: 'Opsional. Kecepatan penurunan saldo. Jika faktor diabaikan, maka diasumsikan sebagai 2 (metode saldo menurun-ganda). Ubah faktor jika Anda tidak ingin menggunakan metode saldo menurun-ganda. Untuk deskripsi metode saldo menurun-ganda, lihat DDB.' },
            noSwitch: { name: 'no_switch', detail: 'Opsional. Nilai logika yang menetapkan apakah akan beralih ke depresiasi garis-lurus apabila depresiasi lebih besar dari perhitungan saldo menurun. Jika no_switch TRUE, Microsoft Excel tidak akan beralih ke depresiasi garis-lurus bahkan apabila depresiasi lebih besar dari perhitungan saldo menurun. Jika no_switch FALSE atau diabaikan, Excel akan beralih ke depresiasi garis-lurus apabila depresiasi lebih besar dari perhitungan saldo menurun.' },
        },
    },
    XIRR: {
        description: 'Mengembalikan tingkat pengembalian internal untuk aliran kas yang jadwalnya tidak berkala. Untuk menghitung tingkat pengembalian internal serangkaian aliran kas berkala, gunakan fungsi IRR.',
        abstract: 'Mengembalikan tingkat pengembalian internal untuk aliran kas yang jadwalnya tidak berkala. Untuk menghitung tingkat pengembalian internal serangkaian aliran kas berkala, gunakan fungsi IRR.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Diperlukan. Serangkaian aliran kas yang terkait dengan jadwal pembayaran dalam tanggal. Pembayaran pertama opsional dan terkait dengan biaya pembayaran yang terjadi di awal investasi. Jika nilai pertama adalah biaya atau pembayaran, maka nilainya harus negatif. Semua pembayaran berikutnya didiskon berdasarkan 365 hari dalam setahun. Rangkaian nilai harus berisi sedikitnya satu nilai positif dan satu negatif.' },
            dates: { name: 'dates', detail: 'Diperlukan. Jadwal tanggal pembayaran yang terkait dengan pembayaran aliran kas. Urutan tanggal tidak harus sama. Tanggal harus dimasukkan dengan menggunakan fungsi DATE, atau sebagai hasil dari rumus atau fungsi lain. Contoh, gunakan DATE(2008,5,23) untuk tanggal 23 Mei 2008. Masalah bisa muncul jika tanggal dimasukkan sebagai teks. .' },
            guess: { name: 'guess', detail: 'Opsional. Angka yang Anda perkirakan mendekati hasil XIRR.' },
        },
    },
    XNPV: {
        description: 'Mengembalikan nilai bersih saat ini untuk jadwal aliran kas yang tidak selalu berkala. Untuk menghitung nilai bersih saat ini untuk serangkaian aliran kas berkala, gunakan fungsi NPV.',
        abstract: 'Mengembalikan nilai bersih saat ini untuk jadwal aliran kas yang tidak selalu berkala. Untuk menghitung nilai bersih saat ini untuk serangkaian aliran kas berkala, gunakan fungsi NPV.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Diperlukan. Tingkat diskon yang akan diterapkan untuk aliran kas.' },
            values: { name: 'values', detail: 'Diperlukan. Serangkaian aliran kas yang terkait dengan jadwal pembayaran dalam tanggal. Pembayaran pertama opsional dan terkait dengan biaya pembayaran yang terjadi di awal investasi. Jika nilai pertama adalah biaya atau pembayaran, maka nilainya harus negatif. Semua pembayaran berikutnya didiskon berdasarkan 365 hari dalam setahun. Rangkaian nilai harus berisi sedikitnya satu nilai positif dan satu nilai negatif.' },
            dates: { name: 'dates', detail: 'Diperlukan. Jadwal tanggal pembayaran yang terkait dengan pembayaran aliran kas. Tanggal pembayaran pertama menunjukkan awal jadwal pembayaran. Semua tanggal lainnya harus setelah tanggal ini, tetapi tidak harus urut.' },
        },
    },
    YIELD: {
        description: 'Mengembalikan hasil sekuritas yang membayar bunga berkala. Gunakan YIELD untuk menghitung hasil obligasi.',
        abstract: 'Mengembalikan hasil sekuritas yang membayar bunga berkala. Gunakan YIELD untuk menghitung hasil obligasi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga kupon tahunan sekuritas.' },
            pr: { name: 'pr', detail: 'Diperlukan. Harga sekuritas per nilai nominal $100.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Nilai penebusan sekuritas per nilai nominal $100.' },
            frequency: { name: 'frequency', detail: 'Diperlukan. Jumlah kupon pembayaran per tahun. Untuk pembayaran tahunan, frekuensi = 1; untuk semi tahunan, frekuensi = 2; untuk triwulan, frekuensi = 4.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    YIELDDISC: {
        description: 'Mengembalikan hasil tahunan untuk sekuritas yang didiskon.',
        abstract: 'Mengembalikan hasil tahunan untuk sekuritas yang didiskon.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            pr: { name: 'pr', detail: 'Diperlukan. Harga sekuritas per nilai nominal $100.' },
            redemption: { name: 'redemption', detail: 'Diperlukan. Nilai penebusan sekuritas per nilai nominal $100.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
    YIELDMAT: {
        description: 'Mengembalikan hasil tahunan sekuritas yang membayar bunga pada saat jatuh tempo.',
        abstract: 'Mengembalikan hasil tahunan sekuritas yang membayar bunga pada saat jatuh tempo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Diperlukan. Tanggal penyelesaian sekuritas. Tanggal penyelesaian sekuritas adalah tanggal setelah tanggal terbit saat sekuritas diperdagangkan kepada pembeli.' },
            maturity: { name: 'maturity', detail: 'Diperlukan. Tanggal jatuh tempo sekuritas. Tanggal jatuh tempo adalah tanggal ketika sekuritas telah kedaluwarsa.' },
            issue: { name: 'issue', detail: 'Diperlukan. Tanggal terbit sekuritas, diekspresikan sebagai nomor seri tanggal.' },
            rate: { name: 'rate', detail: 'Diperlukan. Suku bunga sekuritas pada tanggal terbit.' },
            pr: { name: 'pr', detail: 'Diperlukan. Harga sekuritas per nilai nominal $100.' },
            basis: { name: 'basis', detail: 'Opsional. Tipe basis perhitungan hari untuk digunakan.' },
        },
    },
};

export default locale;
