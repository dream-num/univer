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
    BETADIST: {
        description: 'Mengembalikan fungsi kerapatan probabilitas beta kumulatif. Distribusi beta umumnya digunakan untuk mengkaji variasi dalam persentase sesuatu lintas sampel, seperti pecahan hari yang dihabiskan orang untuk menonton televisi.',
        abstract: 'Mengembalikan fungsi kerapatan probabilitas beta kumulatif. Distribusi beta umumnya digunakan untuk mengkaji variasi dalam persentase sesuatu lintas sampel, seperti pecahan hari yang dihabiskan orang untuk menonton televisi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai antara A dan B untuk mengevaluasi fungsi.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter distribusi.' },
            A: { name: 'A', detail: 'Batas bawah pada interval x.' },
            B: { name: 'B', detail: 'Opsional. Batas atas pada interval x.' },
        },
    },
    BETAINV: {
        description: 'Mengembalikan inversi fungsi kerapatan probabilitas beta kumulatif untuk distribusi beta yang ditentukan. Yakni, jika probabilitas = BETADIST(x,...), maka BETAINV(probabilitas,...) = x. Distribusi beta dapat digunakan dalam perencanaan proyek untuk membuat model waktu penyelesaian yang mungkin dengan waktu penyelesaian yang diharapkan dan variabilitas.',
        abstract: 'Mengembalikan inversi fungsi kerapatan probabilitas beta kumulatif untuk distribusi beta yang ditentukan. Yakni, jika probabilitas = BETADIST(x,...), maka BETAINV(probabilitas,...) = x. Distribusi beta dapat digunakan dalam perencanaan proyek untuk membuat model waktu penyelesaian yang mungkin dengan waktu penyelesaian yang diharapkan dan variabilitas.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas yang dikaitkan dengan distribusi beta.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter terhadap distribusi.' },
            A: { name: 'A', detail: 'Batas bawah pada interval x.' },
            B: { name: 'B', detail: 'Opsional. Batas atas pada interval x.' },
        },
    },
    BINOMDIST: {
        description: 'Mengembalikan probabilitas distribusi binomial individual. Gunakan BINOMDIST dalam soal dengan angka uji atau percobaan tetap, ketika hasil percobaan hanya berhasil atau gagal, ketika percobaan bersifat independen, dan ketika probabilitas keberhasilan adalah konstan selama eksperimen tersebut. Misalnya, BINOMDIST dapat menghitung probabilitas bahwa dua dari tiga bayi yang lahir berikutnya adalah laki-laki.',
        abstract: 'Mengembalikan probabilitas distribusi binomial individual. Gunakan BINOMDIST dalam soal dengan angka uji atau percobaan tetap, ketika hasil percobaan hanya berhasil atau gagal, ketika percobaan bersifat independen, dan ketika probabilitas keberhasilan adalah konstan selama eksperimen tersebut. Misalnya, BINOMDIST dapat menghitung probabilitas bahwa dua dari tiga bayi yang lahir berikutnya adalah laki-laki.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Diperlukan. Jumlah keberhasilan dalam percobaan.' },
            trials: { name: 'trials', detail: 'Diperlukan. Jumlah percobaan independen.' },
            probabilityS: { name: 'probability_s', detail: 'Diperlukan. Probabilitas keberhasilan pada setiap percobaan.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika cumulative adalah TRUE, maka BINOMDIST mengembalikan fungsi distribusi kumulatif, yakni probabilitas bahwa paling banyak terdapat number_s keberhasilan; jika FALSE, mengembalikan fungsi massa probabilitas, yakni probabilitas bahwa terdapat number_s keberhasilan.' },
        },
    },
    CHIDIST: {
        description: 'Mengembalikan probabilitas arah kanan distribusi khi-kuadrat. Distribusi χ2 dikaitkan dengan uji χ2. Gunakan uji χ2 untuk membandingkan nilai yang diamati dan yang diharapkan. Misalnya, eksperimen genetik mungkin membuat hipotesis bahwa generasi tumbuhan berikutnya akan menunjukkan kumpulan warna tertentu. Dengan membandingkan hasil yang diamati dengan hasil yang diharapkan, Anda dapat memutuskan apakah hipotesis awal Anda valid.',
        abstract: 'Mengembalikan probabilitas arah kanan distribusi khi-kuadrat. Distribusi χ2 dikaitkan dengan uji χ2. Gunakan uji χ2 untuk membandingkan nilai yang diamati dan yang diharapkan. Misalnya, eksperimen genetik mungkin membuat hipotesis bahwa generasi tumbuhan berikutnya akan menunjukkan kumpulan warna tertentu. Dengan membandingkan hasil yang diamati dengan hasil yang diharapkan, Anda dapat memutuskan apakah hipotesis awal Anda valid.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin digunakan untuk mengevaluasi distribusi.' },
            degFreedom: { name: 'deg_freedom', detail: 'Diperlukan. Angka derajat kebebasan.' },
        },
    },
    CHIINV: {
        description: 'Mengembalikan inversi probabilitas arah kanan distribusi khi-kuadrat. Jika probabilitas = CHIDIST(x,...), maka CHIINV(probabilitas,...) = x. Gunakan fungsi ini untuk membandingkan hasil yang diamati dengan hasil yang diharapkan untuk memutuskan apakah hipotesis awal Anda valid.',
        abstract: 'Mengembalikan inversi probabilitas arah kanan distribusi khi-kuadrat. Jika probabilitas = CHIDIST(x,...), maka CHIINV(probabilitas,...) = x. Gunakan fungsi ini untuk membandingkan hasil yang diamati dengan hasil yang diharapkan untuk memutuskan apakah hipotesis awal Anda valid.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas yang dikaitkan dengan distribusi khi-kuadrat.' },
            degFreedom: { name: 'deg_freedom', detail: 'Diperlukan. Angka derajat kebebasan.' },
        },
    },
    CHITEST: {
        description: 'Mengembalikan uji untuk independensi. CHITEST mengembalikan nilai dari distribusi khi kuadrat (χ2) untuk statistik dan derajat kebebasan yang tepat. Anda dapat menggunakan uji χ2 untuk menentukan apakah hasil yang dihipotesis diverifikasi oleh eksperimen.',
        abstract: 'Mengembalikan uji untuk independensi. CHITEST mengembalikan nilai dari distribusi khi kuadrat (χ2) untuk statistik dan derajat kebebasan yang tepat. Anda dapat menggunakan uji χ2 untuk menentukan apakah hasil yang dihipotesis diverifikasi oleh eksperimen.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Diperlukan. Rentang data yang berisi observasi untuk menguji nilai-nilai yang diharapkan.' },
            expectedRange: { name: 'expected_range', detail: 'Diperlukan. Rentang data yang berisi rasio produk dari total baris dan total kolom dengan total keseluruhan.' },
        },
    },
    CONFIDENCE: {
        description: 'Mengembalikan interval kepercayaan untuk rata-rata populasi, menggunakan distribusi normal.',
        abstract: 'Mengembalikan interval kepercayaan untuk rata-rata populasi, menggunakan distribusi normal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Diperlukan. Tingkat signifikansi yang digunakan untuk menghitung tingkat kepercayaan. Tingkat kepercayaan sama dengan 100*(1 - alpha)%, atau dengan kata lain, alpha dari 0,05 menunjukkan tingkat kepercayaan 95 persen.' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku populasi untuk rentang data tersebut dan diasumsikan telah diketahui.' },
            size: { name: 'size', detail: 'Diperlukan. Ukuran sampel.' },
        },
    },
    COVAR: {
        description: 'Mengembalikan kovarians, rata-rata produk simpangan untuk setiap pasangan titik data dalam dua rangkaian data.',
        abstract: 'Mengembalikan kovarians, rata-rata produk simpangan untuk setiap pasangan titik data dalam dua rangkaian data.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Rentang sel pertama bilangan bulat.' },
            array2: { name: 'array2', detail: 'Diperlukan. Rentang sel kedua bilangan bulat.' },
        },
    },
    CRITBINOM: {
        description: 'Mengembalikan nilai terkecil di mana distribusi binomial kumulatifnya lebih besar dari atau sama dengan nilai kriteria. Gunakan fungsi ini untuk aplikasi jaminan kualitas. Misalnya, gunakan CRITBINOM untuk menentukan angka terbesar dari komponen-komponen rusak yang diperbolehkan untuk dilepas dari jalur perakitan yang dijalankan tanpa menolak keseluruhan rangkaian.',
        abstract: 'Mengembalikan nilai terkecil di mana distribusi binomial kumulatifnya lebih besar dari atau sama dengan nilai kriteria. Gunakan fungsi ini untuk aplikasi jaminan kualitas. Misalnya, gunakan CRITBINOM untuk menentukan angka terbesar dari komponen-komponen rusak yang diperbolehkan untuk dilepas dari jalur perakitan yang dijalankan tanpa menolak keseluruhan rangkaian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Diperlukan. Jumlah percobaan Bernoulli.' },
            probabilityS: { name: 'probability_s', detail: 'Diperlukan. Probabilitas keberhasilan pada setiap percobaan.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Nilai kriteria.' },
        },
    },
    EXPONDIST: {
        description: 'Mengembalikan distribusi eksponensial. Gunakan EXPONDIST untuk membuat model waktu antara peristiwa, seperti berapa lama waktu yang diperlukan anjungan tunai mandiri (ATM) untuk mengeluarkan uang tunai. Misalnya, Anda dapat menggunakan EXPONDIST untuk menetapkan probabilitas bahwa proses itu memerlukan paling lama 1 menit.',
        abstract: 'Mengembalikan distribusi eksponensial. Gunakan EXPONDIST untuk membuat model waktu antara peristiwa, seperti berapa lama waktu yang diperlukan anjungan tunai mandiri (ATM) untuk mengeluarkan uang tunai. Misalnya, Anda dapat menggunakan EXPONDIST untuk menetapkan probabilitas bahwa proses itu memerlukan paling lama 1 menit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai fungsi.' },
            lambda: { name: 'lambda', detail: 'Diperlukan. Nilai parameter.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menunjukkan formulir fungsi eksponensial mana yang akan diberikan. Jika cumulative adalah TRUE, EXPONDIST akan mengembalikan fungsi distribusi kumulatif; jika FALSE, mengembalikan fungsi kerapatan probabilitas.' },
        },
    },
    FDIST: {
        description: 'Mengembalikan distribusi probabilitas F (arah kanan) (derajat keragaman) untuk dua unit data. Anda dapat menggunakan fungsi ini untuk menentukan apakah dua unit data memiliki derajat keragaman berbeda. Misalnya, Anda bisa memeriksa nilai ujian laki-laki dan perempuan yang masuk sekolah menengah dan menentukan apakah keragaman pada nilai perempuan berbeda dari yang ditemukan pada laki-laki.',
        abstract: 'Mengembalikan distribusi probabilitas F (arah kanan) (derajat keragaman) untuk dua unit data. Anda dapat menggunakan fungsi ini untuk menentukan apakah dua unit data memiliki derajat keragaman berbeda. Misalnya, Anda bisa memeriksa nilai ujian laki-laki dan perempuan yang masuk sekolah menengah dan menentukan apakah keragaman pada nilai perempuan berbeda dari yang ditemukan pada laki-laki.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Diperlukan. Derajat kebebasan pembilang' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Diperlukan. Derajat kebebasan penyebut.' },
        },
    },
    FINV: {
        description: 'Mengembalikan inversi distribusi probabilitas F (arah kanan). Jika p = F.FDIST(x,...), maka F.FINV(p,...) = x.',
        abstract: 'Mengembalikan inversi distribusi probabilitas F (arah kanan). Jika p = F.FDIST(x,...), maka F.FINV(p,...) = x.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas yang dikaitkan dengan distribusi kumulatif F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Diperlukan. Derajat kebebasan pembilang' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Diperlukan. Derajat kebebasan penyebut.' },
        },
    },
    FTEST: {
        description: 'Mengembalikan hasil uji-F. Uji-F mengembalikan probabilitas dua sisi bahwa varians di array1 dan array2 tidak berbeda secara signifikan. Gunakan fungsi ini untuk menentukan apakah kedua sampel memiliki varians yang berbeda. Misalnya, dengan adanya nilai ujian dari sekolah negeri dan swasta, Anda dapat menguji apakah sekolah-sekolah tersebut memiliki tingkat nilai ujian yang berbeda.',
        abstract: 'Mengembalikan hasil uji-F. Uji-F mengembalikan probabilitas dua sisi bahwa varians di array1 dan array2 tidak berbeda secara signifikan. Gunakan fungsi ini untuk menentukan apakah kedua sampel memiliki varians yang berbeda. Misalnya, dengan adanya nilai ujian dari sekolah negeri dan swasta, Anda dapat menguji apakah sekolah-sekolah tersebut memiliki tingkat nilai ujian yang berbeda.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Array atau rentang data pertama.' },
            array2: { name: 'array2', detail: 'Diperlukan. Array atau rentang data kedua.' },
        },
    },
    GAMMADIST: {
        description: 'Mengembalikan distribusi gamma. Anda dapat menggunakan fungsi ini untuk mempelajari variabel yang mungkin memiliki distribusi condong. Distribusi gamma biasa digunakan dalam analisis antrian.',
        abstract: 'Mengembalikan distribusi gamma. Anda dapat menggunakan fungsi ini untuk mempelajari variabel yang mungkin memiliki distribusi condong. Distribusi gamma biasa digunakan dalam analisis antrian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin digunakan untuk mengevaluasi distribusi.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter untuk distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter terhadap distribusi. Jika beta = 1, GAMMADIST mengembalikan distribusi gamma standar.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika kumulatif TRUE, GAMMADIST mengembalikan fungsi distribusi kumulatif; jika FALSE, fungsi mengembalikan fungsi kerapatan probabilitas.' },
        },
    },
    GAMMAINV: {
        description: 'Mengembalikan inversi dari distribusi kumulatif gamma. Jika p = GAMMADIST(x,...), maka GAMMAINV(p,...) = x. Anda dapat menggunakan fungsi ini untuk mempelajari variabel yang distribusinya mungkin condong.',
        abstract: 'Mengembalikan inversi dari distribusi kumulatif gamma. Jika p = GAMMADIST(x,...), maka GAMMAINV(p,...) = x. Anda dapat menggunakan fungsi ini untuk mempelajari variabel yang distribusinya mungkin condong.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas terkait dengan distribusi gamma.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter untuk distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter terhadap distribusi. Jika beta = 1, GAMMAINV mengembalikan distribusi gamma standar.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Mengembalikan distribusi hipergeometrik. HYPGEOMDIST mengembalikan probabilitas sejumlah sampel keberhasilan tertentu, ukuran sampel tertentu, keberhasilan populasi, dan ukuran populasi. Gunakan HYPGEOMDIST untuk masalah-masalah dengan populasi terbatas, di mana setiap observasi bisa berhasil atau gagal, dan di mana setiap subkumpulan dari ukuran tertentu dipilih dengan kemungkinan yang sama.',
        abstract: 'Mengembalikan distribusi hipergeometrik. HYPGEOMDIST mengembalikan probabilitas sejumlah sampel keberhasilan tertentu, ukuran sampel tertentu, keberhasilan populasi, dan ukuran populasi. Gunakan HYPGEOMDIST untuk masalah-masalah dengan populasi terbatas, di mana setiap observasi bisa berhasil atau gagal, dan di mana setiap subkumpulan dari ukuran tertentu dipilih dengan kemungkinan yang sama.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Diperlukan. Jumlah keberhasilan di dalam sampel.' },
            numberSample: { name: 'number_sample', detail: 'Diperlukan. Ukuran sampel.' },
            populationS: { name: 'population_s', detail: 'Diperlukan. Jumlah keberhasilan di dalam populasi.' },
            numberPop: { name: 'number_pop', detail: 'Diperlukan. Ukuran populasi.' },
        },
    },
    LOGINV: {
        description: 'Mengembalikan inversi dari fungsi distribusi kumulatif lognormal x, di mana ln(x) normalnya didistribusikan dengan parameter mean dan standard_dev. Jika p = LOGNORMDIST(x,...) maka LOGINV(p,...) = x.',
        abstract: 'Mengembalikan inversi dari fungsi distribusi kumulatif lognormal x, di mana ln(x) normalnya didistribusikan dengan parameter mean dan standard_dev. Jika p = LOGNORMDIST(x,...) maka LOGINV(p,...) = x.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Sebuah probabilitas yang dikaitkan dengan distribusi lognormal.' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata dari ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku dari ln(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Mengembalikan distribusi kumulatif lognormal x, di mana ln(x) normalnya didistribusikan dengan parameter mean dan standard_dev. Gunakan fungsi ini untuk menganalisis data yang telah ditransformasi secara logaritmik.',
        abstract: 'Mengembalikan distribusi kumulatif lognormal x, di mana ln(x) normalnya didistribusikan dengan parameter mean dan standard_dev. Gunakan fungsi ini untuk menganalisis data yang telah ditransformasi secara logaritmik.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata dari ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku dari ln(x).' },
        },
    },
    MODE: {
        description: 'Katakanlah Anda ingin mengetahui jumlah spesies burung yang paling umum terlihat dalam sampel jumlah burung di lahan basah kritis selama periode waktu 30 tahun, atau Anda ingin mencari tahu jumlah panggilan telepon yang paling sering terjadi di pusat dukungan telepon selama jam sibuk. Untuk menghitung mode sekelompok angka, gunakan fungsi MODE .',
        abstract: 'Katakanlah Anda ingin mengetahui jumlah spesies burung yang paling umum terlihat dalam sampel jumlah burung di lahan basah kritis selama periode waktu 30 tahun, atau Anda ingin mencari tahu jumlah panggilan telepon yang paling sering terjadi di pusat dukungan telepon selama jam sibuk. Untuk menghitung mode sekelompok angka, gunakan fungsi MODE .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang ingin Anda hitung modusnya.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 255 yang ingin Anda hitung modusnya. Anda juga bisa menggunakan array tunggal atau array referensi ketimbang argumen yang dipisahkan oleh koma.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Mengembalikan distribusi binomial negatif. NEGBINOMDIST mengembalikan probabilitas bahwa akan ada kegagalan number_f sebelum keberhasilan number_s-th, ketika konstanta probabilitas keberhasilan adalah probability_s. Fungsi ini mirip dengan distribusi binomial, hanya saja jumlah keberhasilannya tetap, dan jumlah percobaannya bervariasi. Seperti binomial, percobaan diasumsikan bebas.',
        abstract: 'Mengembalikan distribusi binomial negatif. NEGBINOMDIST mengembalikan probabilitas bahwa akan ada kegagalan number_f sebelum keberhasilan number_s-th, ketika konstanta probabilitas keberhasilan adalah probability_s. Fungsi ini mirip dengan distribusi binomial, hanya saja jumlah keberhasilannya tetap, dan jumlah percobaannya bervariasi. Seperti binomial, percobaan diasumsikan bebas.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Diperlukan. Jumlah kegagalan.' },
            numberS: { name: 'number_s', detail: 'Diperlukan. Jumlah ambang batas keberhasilan.' },
            probabilityS: { name: 'probability_s', detail: 'Diperlukan. Probabilitas keberhasilan.' },
        },
    },
    NORMDIST: {
        description: 'Fungsi NORMDIST mengembalikan distribusi normal untuk rata-rata dan simpangan baku yang ditentukan. Fungsi ini memiliki berbagai aplikasi dalam statistik, termasuk pengujian hipotesis.',
        abstract: 'Fungsi NORMDIST mengembalikan distribusi normal untuk rata-rata dan simpangan baku yang ditentukan. Fungsi ini memiliki berbagai aplikasi dalam statistik, termasuk pengujian hipotesis.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang Anda inginkan distribusinya' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata aritmetika distribusi' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku distribusi' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika kumulatif TRUE, maka NORMDIST mengembalikan fungsi distribusi kumulatif; jika kumulatif FALSE, maka mengembalikan fungsi massa probabilitas.' },
        },
    },
    NORMINV: {
        description: 'Mengembalikan inversi distribusi kumulatif normal untuk rata-rata dan simpangan baku tertentu.',
        abstract: 'Mengembalikan inversi distribusi kumulatif normal untuk rata-rata dan simpangan baku tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Sebuah probabilitas yang dikaitkan dengan distribusi normal.' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata aritmetika distribusi.' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku distribusi.' },
        },
    },
    NORMSDIST: {
        description: 'Mengembalikan fungsi distribusi kumulatif normal standar. Distribusi memiliki rata-rata 0 (nol) dan simpangan baku satu. Gunakan fungsi ini di tempat tabel area kurva normal standar.',
        abstract: 'Mengembalikan fungsi distribusi kumulatif normal standar. Distribusi memiliki rata-rata 0 (nol) dan simpangan baku satu. Gunakan fungsi ini di tempat tabel area kurva normal standar.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Diperlukan. Nilai yang Anda inginkan distribusinya.' },
        },
    },
    NORMSINV: {
        description: 'Mengembalikan inversi dari distribusi kumulatif normal standar. Distribusi memiliki rata-rata nol dan simpangan baku dari satu.',
        abstract: 'Mengembalikan inversi dari distribusi kumulatif normal standar. Distribusi memiliki rata-rata nol dan simpangan baku dari satu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Sebuah probabilitas yang dikaitkan dengan distribusi normal.' },
        },
    },
    PERCENTILE: {
        description: 'Mengembalikan persentil nilai ke-k dalam satu rentang. Anda bisa menggunakan fungsi ini untuk menghitung ambang penerimaan. Misalnya, Anda dapat memutuskan untuk memeriksa para kandidat yang mencapai skor di atas persentil ke-90.',
        abstract: 'Mengembalikan persentil nilai ke-k dalam satu rentang. Anda bisa menggunakan fungsi ini untuk menghitung ambang penerimaan. Misalnya, Anda dapat memutuskan untuk memeriksa para kandidat yang mencapai skor di atas persentil ke-90.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang data yang menentukan posisi relatif.' },
            k: { name: 'k', detail: 'Diperlukan. Nilai persentil dalam rentang 0..1, inklusif.' },
        },
    },
    PERCENTRANK: {
        description: 'Fungsi PERCENTRANK mengembalikan peringkat nilai dalam kumpulan data sebagai persentase dari kumpulan data -- pada dasarnya, posisi relatif dari sebuah nilai di dalam seluruh kumpulan data. Misalnya, Anda dapat menggunakan PERCENTRANK untuk menentukan posisi skor uji individu di antara bidang semua skor untuk ujian yang sama.',
        abstract: 'Fungsi PERCENTRANK mengembalikan peringkat nilai dalam kumpulan data sebagai persentase dari kumpulan data -- pada dasarnya, posisi relatif dari sebuah nilai di dalam seluruh kumpulan data. Misalnya, Anda dapat menggunakan PERCENTRANK untuk menentukan posisi skor uji individu di antara bidang semua skor untuk ujian yang sama.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Rentang data (atau array yang ditentukan sebelumnya) dari nilai numerik di mana peringkat persen ditentukan.' },
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin Anda ketahui peringkatnya dalam array.' },
            significance: { name: 'significance', detail: 'Opsional. Nilai yang menentukan jumlah digit signifikan untuk nilai persentase yang dikembalikan. Jika tidak disertakan, PERCENTRANK menggunakan tiga angka (0.xxx).' },
        },
    },
    POISSON: {
        description: 'Mengembalikan distribusi Poisson. Aplikasi umum distribusi Poisson adalah meramalkan sejumlah peristiwa selama waktu tertentu, seperti jumlah mobil yang datang di sebuah gerbang tol dalam 1 menit.',
        abstract: 'Mengembalikan distribusi Poisson. Aplikasi umum distribusi Poisson adalah meramalkan sejumlah peristiwa selama waktu tertentu, seperti jumlah mobil yang datang di sebuah gerbang tol dalam 1 menit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Jumlah peristiwa.' },
            mean: { name: 'mean', detail: 'Diperlukan. Nilai numerik yang diinginkan.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan bentuk distribusi probabilitas yang dikembalikan. Jika kumulatif TRUE, maka POISSON mengembalikan probabilitas kumulatif Poisson bahwa sejumlah kejadian acak akan terjadi antara nol dan x inklusif; jika FALSE, maka mengembalikan fungsi massa probabilitas Poisson bahwa peristiwa yang terjadi akan tepat sejumlah x.' },
        },
    },
    QUARTILE: {
        description: 'Mengembalikan kuartil dari sekelompok data. Kuartil sering digunakan dalam data penjualan dan survei untuk membagi populasi ke dalam berbagai kelompok. Misalnya, Anda dapat menggunakan QUARTILE untuk menemukan 25 persen pendapatan teratas dalam sebuah populasi.',
        abstract: 'Mengembalikan kuartil dari sekelompok data. Kuartil sering digunakan dalam data penjualan dan survei untuk membagi populasi ke dalam berbagai kelompok. Misalnya, Anda dapat menggunakan QUARTILE untuk menemukan 25 persen pendapatan teratas dalam sebuah populasi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang sel nilai numerik yang ingin Anda cari nilai kuartilnya.' },
            quart: { name: 'quart', detail: 'Diperlukan. Menunjukkan nilai mana yang harus dikembalikan.' },
        },
    },
    RANK: {
        description: 'Mengembalikan peringkat sebuah angka dalam satu daftar angka. Peringkat sebuah angka adalah besarnya angka tersebut yang relatif terhadap nilai lain di daftar. (Jika Anda mengurutkan daftar, peringkat sebuah angka adalah posisinya.)',
        abstract: 'Mengembalikan peringkat sebuah angka dalam satu daftar angka. Peringkat sebuah angka adalah besarnya angka tersebut yang relatif terhadap nilai lain di daftar. (Jika Anda mengurutkan daftar, peringkat sebuah angka adalah posisinya.)',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang peringkatnya ingin Anda temukan.' },
            ref: { name: 'ref', detail: 'Diperlukan. Referensi ke daftar angka. Nilai nonnumerik di ref diabaikan.' },
            order: { name: 'order', detail: 'Opsional. Angka yang menentukan cara menetapkan peringkat. Jika urutan adalah 0 (nol) atau dihilangkan, Microsoft Excel menetapkan peringkat angka seolah-olah ref adalah daftar yang diurutkan dalam urutan turun. Jika urutan adalah nilai bukan nol, Microsoft Excel menetapkan peringkat seolah-olah ref adalah daftar yang diurutkan dalam urutan naik.' },
        },
    },
    STDEV: {
        description: 'Memperkirakan simpangan baku berdasarkan satu sampel. Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        abstract: 'Memperkirakan simpangan baku berdasarkan satu sampel. Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang berkaitan dengan sampel populasi.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 255 berkaitan dengan satu sampel populasi. Anda juga bisa menggunakan array tunggal atau array referensi ketimbang argumen yang dipisahkan oleh koma.' },
        },
    },
    STDEVP: {
        description: 'Menghitung simpangan baku berdasarkan seluruh populasi yang diberikan sebagai argumen. Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        abstract: 'Menghitung simpangan baku berdasarkan seluruh populasi yang diberikan sebagai argumen. Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang bersesuaian dengan populasi.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 255 terkait dengan satu populasi. Anda juga bisa menggunakan array tunggal atau array referensi ketimbang argumen yang dipisahkan oleh koma.' },
        },
    },
    TDIST: {
        description: 'Mengembalikan Titik Persentase (probabilitas) untuk distribusi-t Student di mana nilai numerik (x) adalah nilai terhitung dari t, yang digunakan untuk menghitung Titik Persentase. Distribusi-t digunakan dalam pengujian hipotesis kumpulan data sampel kecil. Gunakan fungsi ini di tabel nilai kritis untuk distribusi-t.',
        abstract: 'Mengembalikan Titik Persentase (probabilitas) untuk distribusi-t Student di mana nilai numerik (x) adalah nilai terhitung dari t, yang digunakan untuk menghitung Titik Persentase. Distribusi-t digunakan dalam pengujian hipotesis kumpulan data sampel kecil. Gunakan fungsi ini di tabel nilai kritis untuk distribusi-t.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai numerik yang ingin digunakan untuk mengevaluasi distribusi.' },
            degFreedom: { name: 'degFreedom', detail: 'Diperlukan. Bilangan bulat yang menunjukkan angka derajat kebebasan.' },
            tails: { name: 'tails', detail: 'Diperlukan. Menentukan angka arah distribusi yang dikembalikan. Jika Tails = 1, TDIST mengembalikan distribusi satu arah. Jika Tails = 2, TDIST mengembalikan distribusi dua arah.' },
        },
    },
    TINV: {
        description: 'Mengembalikan inversi dua arah dari distribusi-t Student.',
        abstract: 'Mengembalikan inversi dua arah dari distribusi-t Student.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas terkait dengan distribusi-t Student dua arah.' },
            degFreedom: { name: 'degFreedom', detail: 'Diperlukan. Jumlah derajat kebebasan yang digunakan untuk mencirikan distribusi.' },
        },
    },
    TTEST: {
        description: 'Mengembalikan probabilitas terkait Uji-t Student. Gunakan TTEST untuk menentukan apakah dua sampel berasal dari dua populasi sama yang mendasari yang nilai rata-ratanya sama.',
        abstract: 'Mengembalikan probabilitas terkait Uji-t Student. Gunakan TTEST untuk menentukan apakah dua sampel berasal dari dua populasi sama yang mendasari yang nilai rata-ratanya sama.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Kumpulan data pertama.' },
            array2: { name: 'array2', detail: 'Diperlukan. Kumpulan data kedua.' },
            tails: { name: 'tails', detail: 'Diperlukan. Menentukan jumlah arah distribusi. Jika arah = 1, TTEST menggunakan distribusi satu arah. Jika arah = 2, TTEST menggunakan distribusi dua arah.' },
            type: { name: 'type', detail: 'Diperlukan. Tipe Uji-t yang dilakukan.' },
        },
    },
    VAR: {
        description: 'Memperkirakan varians berdasarkan sampel.',
        abstract: 'Memperkirakan varians berdasarkan sampel.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang mewakili sampel populasi.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka ke-2 hingga ke-255 yang mewakili sampel populasi.' },
        },
    },
    VARP: {
        description: 'Menghitung varians berdasarkan populasi keseluruhan.',
        abstract: 'Menghitung varians berdasarkan populasi keseluruhan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang bersesuaian dengan populasi.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 255 terkait dengan satu populasi.' },
        },
    },
    WEIBULL: {
        description: 'Mengembalikan distribusi Weilbull. Gunakan distribusi ini dalam analisis keandalan, misalnya menghitung waktu rata-rata perangkat hingga gagal.',
        abstract: 'Mengembalikan distribusi Weilbull. Gunakan distribusi ini dalam analisis keandalan, misalnya menghitung waktu rata-rata perangkat hingga gagal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter untuk distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter untuk distribusi.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Menentukan format fungsi.' },
        },
    },
    ZTEST: {
        description: 'Mengembalikan nilai probabilitas satu-arah uji-z. Untuk hipotesis rata-rata populasi yang diberikan, μ0, ZTEST mengembalikan probabilitas bahwa rata-rata sampel akan lebih besar dari rata-rata pengamatan dalam kumpulan data (array) tersebut— yaitu, rata-rata sampel yang diamati.',
        abstract: 'Mengembalikan nilai probabilitas satu-arah uji-z. Untuk hipotesis rata-rata populasi yang diberikan, μ0, ZTEST mengembalikan probabilitas bahwa rata-rata sampel akan lebih besar dari rata-rata pengamatan dalam kumpulan data (array) tersebut— yaitu, rata-rata sampel yang diamati.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang data yang akan digunakan untuk menguji x.' },
            x: { name: 'x', detail: 'Diperlukan. Nilai untuk menguji.' },
            sigma: { name: 'sigma', detail: 'Opsional. Simpangan baku populasi (yang diketahui). Jika dihilangkan, maka simpangan baku sampel yang digunakan.' },
        },
    },
};

export default locale;
