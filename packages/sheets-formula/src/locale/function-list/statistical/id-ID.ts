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
    AVEDEV: {
        description: 'Mengembalikan rata-rata simpangan mutlak titik data dari nilai rata-ratanya. AVEDEV adalah ukuran variabilitas dalam sekumpulan data.',
        abstract: 'Mengembalikan rata-rata simpangan mutlak titik data dari nilai rata-ratanya. AVEDEV adalah ukuran variabilitas dalam sekumpulan data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Argumen 1 sampai 255 yang ingin Anda dapatkan rata-rata simpangan mutlaknya. Anda juga dapat menggunakan array tunggal atau referensi ke array daripada argumen-argumen yang dipisahkan oleh koma.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Argumen 1 sampai 255 yang ingin Anda dapatkan rata-rata simpangan mutlaknya. Anda juga dapat menggunakan array tunggal atau referensi ke array daripada argumen-argumen yang dipisahkan oleh koma.' },
        },
    },
    AVERAGE: {
        description: 'Mengembalikan rata-rata (rata-rata aritmetika) argumen. Misalnya, jika rentang A1:A20 berisi angka, rumus =AVERAGE(A1:A20) mengembalikan rata-rata angka tersebut.',
        abstract: 'Mengembalikan rata-rata (rata-rata aritmetika) argumen. Misalnya, jika rentang A1:A20 berisi angka, rumus =AVERAGE(A1:A20) mengembalikan rata-rata angka tersebut.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Angka pertama, referensi sel, atau rentang yang anda inginkan rata-ratanya.' },
            number2: { name: 'number2', detail: 'Opsional. Angka tambahan, referensi sel, atau rentang yang Anda inginkan rata-ratanya, hingga maksimum 255.' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'Fungsi AVERAGE.WEIGHTED menghitung rata-rata tertimbang dari sekumpulan nilai menggunakan nilai dan bobotnya masing-masing.',
        abstract: 'Fungsi AVERAGE.WEIGHTED menghitung rata-rata tertimbang dari sekumpulan nilai menggunakan nilai dan bobotnya masing-masing.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=id',
            },
        ],
        functionParameter: {
            values: { name: 'nilai', detail: 'Nilai yang akan dihitung rata-ratanya. Dapat berupa rentang sel atau nilai itu sendiri.' },
            weights: { name: 'bobot', detail: 'Daftar bobot terkait yang akan diterapkan. Bobot boleh nol tetapi tidak boleh negatif, dan setidaknya satu bobot harus positif. Rentang bobot harus memiliki jumlah baris dan kolom yang sama dengan rentang nilai.' },
            additionalValues: { name: 'nilai_tambahan', detail: 'Nilai tambahan opsional yang akan dihitung rata-ratanya.' },
            additionalWeights: { name: 'bobot_tambahan', detail: 'Bobot tambahan opsional. Setiap nilai_tambahan harus diikuti tepat satu bobot_tambahan.' },
        },
    },
    AVERAGEA: {
        description: 'Menghitung rata-rata (rata-rata aritmatika) dari nilai-nilai di daftar argumen.',
        abstract: 'Menghitung rata-rata (rata-rata aritmatika) dari nilai-nilai di daftar argumen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 diperlukan, nilai berikutnya opsional. Sel 1 hingga 255, rentang sel, atau nilai yang ingin Anda ketahui rata-ratanya.' },
            value2: { name: 'value2', detail: 'Value1 diperlukan, nilai berikutnya opsional. Sel 1 hingga 255, rentang sel, atau nilai yang ingin Anda ketahui rata-ratanya.' },
        },
    },
    AVERAGEIF: {
        description: 'Mengembalikan nilai rata-rata (nilai rata-rata aritmatika) dari semua sel dalam range yang memenuhi kriteria.',
        abstract: 'Mengembalikan nilai rata-rata (nilai rata-rata aritmatika) dari semua sel dalam range yang memenuhi kriteria.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Diperlukan. Satu atau beberapa sel yang akan dihitung rata-ratanya, termasuk angka atau nama, array, atau referensi yang berisi angka.' },
            criteria: { name: 'criteria', detail: 'Diperlukan. Kriteria dalam bentuk angka, ekspresi, referensi sel, atau teks menentukan sel mana yang akan dihitung rata-ratanya. Misalnya, kriteria dapat dinyatakan sebagai 32, "32", ">32", "apel", atau B4.' },
            averageRange: { name: 'average_range', detail: 'Opsional. Kumpulan sel sesungguhnya yang akan dihitung rata-ratanya. Jika dikosongkan, maka range digunakan.' },
        },
    },
    AVERAGEIFS: {
        description: 'Mengembalikan rata-rata (rata-rata aritmatika) untuk semua sel yang memenuhi beberapa kriteria.',
        abstract: 'Mengembalikan rata-rata (rata-rata aritmatika) untuk semua sel yang memenuhi beberapa kriteria.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'average_range', detail: 'Diperlukan. Satu atau beberapa sel yang akan dihitung rata-ratanya, termasuk angka atau nama, array, atau referensi yang berisi angka.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Criteria_range1 diperlukan, criteria_range berikutnya opsional. 1 hingga 127 rentang yang digunakan untuk mengevaluasi kriteria terkait.' },
            criteria1: { name: 'criteria1', detail: 'Criteria1 diperlukan, kriteria berikutnya bersifat opsional. 1 hingga 127 kriteria dalam bentuk angka, ekspresi, referensi sel, atau teks yang menentukan sel yang akan dihitung rata-ratanya. Misalnya, kriteria dapat dinyatakan sebagai 32, "32", ">32", "apel", atau B4.' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Criteria_range1 diperlukan, criteria_range berikutnya opsional. 1 hingga 127 rentang yang digunakan untuk mengevaluasi kriteria terkait.' },
            criteria2: { name: 'criteria2', detail: 'Criteria1 diperlukan, kriteria berikutnya bersifat opsional. 1 hingga 127 kriteria dalam bentuk angka, ekspresi, referensi sel, atau teks yang menentukan sel yang akan dihitung rata-ratanya. Misalnya, kriteria dapat dinyatakan sebagai 32, "32", ">32", "apel", atau B4.' },
        },
    },
    BETA_DIST: {
        description: 'Distribusi beta umumnya digunakan untuk mengkaji variasi dalam persentase sesuatu lintas sampel, seperti pecahan hari yang dihabiskan orang untuk menonton televisi.',
        abstract: 'Distribusi beta umumnya digunakan untuk mengkaji variasi dalam persentase sesuatu lintas sampel, seperti pecahan hari yang dihabiskan orang untuk menonton televisi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai antara A dan B untuk mengevaluasi fungsi' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter distribusi.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika secara kumulatif adalah TRUE, BETA.DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, mengembalikan fungsi kepadatan probabilitas.' },
            A: { name: 'A', detail: 'Batas bawah pada interval x.' },
            B: { name: 'B', detail: 'Opsional. Batas atas pada interval x.' },
        },
    },
    BETA_INV: {
        description: 'Jika probabilitas = BETA.DIST(x,...TRUE), maka BETA.INV(probability,...) = x. Distribusi beta dapat digunakan dalam perencanaan proyek untuk membuat model waktu penyelesaian yang mungkin dengan waktu penyelesaian yang diharapkan dan variabilitas.',
        abstract: 'Jika probabilitas = BETA.DIST(x,...TRUE), maka BETA.INV(probability,...) = x. Distribusi beta dapat digunakan dalam perencanaan proyek untuk membuat model waktu penyelesaian yang mungkin dengan waktu penyelesaian yang diharapkan dan variabilitas.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/beta-inv-function',
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
    BINOM_DIST: {
        description: 'Mengembalikan probabilitas distribusi binomial individual. Gunakan BINOM.DIST dalam soal dengan angka uji atau percobaan tetap, ketika hasil percobaan hanya berhasil atau gagal, ketika percobaan bersifat independen, dan ketika probabilitas keberhasilan adalah konstan selama eksperimen tersebut. Misalnya, BINOM.DIST dapat menghitung probabilitas bahwa dua dari tiga bayi yang lahir berikutnya adalah laki-laki.',
        abstract: 'Mengembalikan probabilitas distribusi binomial individual. Gunakan BINOM.DIST dalam soal dengan angka uji atau percobaan tetap, ketika hasil percobaan hanya berhasil atau gagal, ketika percobaan bersifat independen, dan ketika probabilitas keberhasilan adalah konstan selama eksperimen tersebut. Misalnya, BINOM.DIST dapat menghitung probabilitas bahwa dua dari tiga bayi yang lahir berikutnya adalah laki-laki.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Diperlukan. Jumlah keberhasilan dalam percobaan.' },
            trials: { name: 'trials', detail: 'Diperlukan. Jumlah percobaan independen.' },
            probabilityS: { name: 'probability_s', detail: 'Diperlukan. Probabilitas keberhasilan pada setiap percobaan.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika cumulative adalah TRUE, maka BINOM.DIST mengembalikan fungsi distribusi kumulatif, yakni probabilitas bahwa terdapat sebagian besar keberhasilan number_s; jika FALSE, mengembalikan fungsi massa probabilitas, yakni probabilitas bahwa terdapat number_s keberhasilan.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Mengembalikan probabilitas hasil percobaan menggunakan distribusi binomial.',
        abstract: 'Mengembalikan probabilitas hasil percobaan menggunakan distribusi binomial.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Diperlukan. Jumlah percobaan independen. Harus lebih besar dari atau sama dengan 0.' },
            probabilityS: { name: 'probability_s', detail: 'Diperlukan. Probabilitas keberhasilan di setiap percobaan. Harus lebih besar dari atau sama dengan 0 dan kurang dari atau sama dengan 1.' },
            numberS: { name: 'number_s', detail: 'Diperlukan. Jumlah keberhasilan dalam percobaan. Harus lebih besar dari atau sama dengan 0 dan kurang dari atau sama dengan Percobaan.' },
            numberS2: { name: 'number_s2', detail: 'Opsional. Jika ada, mengembalikan probabilitas jumlah percobaan yang berhasil dalam rentang antara Number_s dan number_s2. Harus lebih besar dari atau sama dengan Number_s dan kurang dari atau sama dengan Trials.' },
        },
    },
    BINOM_INV: {
        description: 'Mengembalikan nilai terkecil di mana distribusi binomial kumulatifnya lebih besar dari atau sama dengan nilai kriteria.',
        abstract: 'Mengembalikan nilai terkecil di mana distribusi binomial kumulatifnya lebih besar dari atau sama dengan nilai kriteria.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Diperlukan. Jumlah percobaan Bernoulli.' },
            probabilityS: { name: 'probability_s', detail: 'Diperlukan. Probabilitas keberhasilan pada setiap percobaan.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Nilai kriteria.' },
        },
    },
    CHISQ_DIST: {
        description: 'Mengembalikan distribusi khi-kuadrat.',
        abstract: 'Mengembalikan distribusi khi-kuadrat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin digunakan untuk mengevaluasi distribusi.' },
            degFreedom: { name: 'deg_freedom', detail: 'Diperlukan. Angka derajat kebebasan.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika secara kumulatif adalah TRUE, CHISQ.DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, mengembalikan fungsi kerapatan probabilitas.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Distribusi χ2 dikaitkan dengan uji χ2. Gunakan uji χ2 untuk membandingkan nilai yang diamati dan yang diharapkan. Misalnya, eksperimen genetik mungkin membuat hipotesis bahwa generasi tumbuhan berikutnya akan menunjukkan kumpulan warna tertentu. Dengan membandingkan hasil yang diamati dengan hasil yang diharapkan, Anda dapat memutuskan apakah hipotesis awal Anda valid.',
        abstract: 'Distribusi χ2 dikaitkan dengan uji χ2. Gunakan uji χ2 untuk membandingkan nilai yang diamati dan yang diharapkan. Misalnya, eksperimen genetik mungkin membuat hipotesis bahwa generasi tumbuhan berikutnya akan menunjukkan kumpulan warna tertentu. Dengan membandingkan hasil yang diamati dengan hasil yang diharapkan, Anda dapat memutuskan apakah hipotesis awal Anda valid.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin digunakan untuk mengevaluasi distribusi.' },
            degFreedom: { name: 'deg_freedom', detail: 'Diperlukan. Angka derajat kebebasan.' },
        },
    },
    CHISQ_INV: {
        description: 'Distribusi khi-kuadrat umumnya digunakan untuk mengkaji variasi dalam persentase sesuatu lintas sampel, seperti pecahan hari yang dihabiskan orang untuk menonton televisi.',
        abstract: 'Distribusi khi-kuadrat umumnya digunakan untuk mengkaji variasi dalam persentase sesuatu lintas sampel, seperti pecahan hari yang dihabiskan orang untuk menonton televisi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas yang dikaitkan dengan distribusi khi-kuadrat.' },
            degFreedom: { name: 'deg_freedom', detail: 'Diperlukan. Angka derajat kebebasan.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Jika probabilitas = CHISQ.DIST.RT(x,...), maka CHISQ.INV.RT(probabilitas,...) = x. Gunakan fungsi ini untuk membandingkan hasil yang diamati dengan hasil yang diharapkan untuk memutuskan apakah hipotesis awal Anda valid.',
        abstract: 'Jika probabilitas = CHISQ.DIST.RT(x,...), maka CHISQ.INV.RT(probabilitas,...) = x. Gunakan fungsi ini untuk membandingkan hasil yang diamati dengan hasil yang diharapkan untuk memutuskan apakah hipotesis awal Anda valid.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas yang dikaitkan dengan distribusi khi-kuadrat.' },
            degFreedom: { name: 'deg_freedom', detail: 'Diperlukan. Angka derajat kebebasan.' },
        },
    },
    CHISQ_TEST: {
        description: 'Mengembalikan uji untuk independensi. CHISQ.TEST mengembalikan nilai dari distribusi khi kuadrat (χ2) untuk statistik dan derajat kebebasan yang tepat. Anda dapat menggunakan uji χ2 untuk menentukan apakah hasil yang dihipotesis diverifikasi oleh eksperimen.',
        abstract: 'Mengembalikan uji untuk independensi. CHISQ.TEST mengembalikan nilai dari distribusi khi kuadrat (χ2) untuk statistik dan derajat kebebasan yang tepat. Anda dapat menggunakan uji χ2 untuk menentukan apakah hasil yang dihipotesis diverifikasi oleh eksperimen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Diperlukan. Rentang data yang berisi observasi untuk menguji nilai-nilai yang diharapkan.' },
            expectedRange: { name: 'expected_range', detail: 'Diperlukan. Rentang data yang berisi rasio produk dari total baris dan total kolom dengan total keseluruhan.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Interval kepercayaan adalah suatu rentang nilai. Rata-rata sampel Anda, x, berada di tengah rentang ini dan rentangnya x ± CONFIDENCE.NORM. Misalnya, jika x adalah rata-rata sampel waktu pengiriman untuk produk yang dipesan melalui email, x ± CONFIDENCE. NORM adalah rentang sarana populasi. Untuk rata-rata populasi, μ0, dalam rentang ini, probabilitas memperoleh rata-rata sampel yang lebih jauh dari μ0 daripada x adalah lebih besar dari alpha; untuk rata-rata populasi, μ0, bukan dalam rentang ini, probabilitas memperoleh rata-rata sampel yang lebih jauh dari μ0 daripada x adalah kurang dari alpha. Dengan kata lain, asumsikan bahwa kita menggunakan x, standard_dev, dan size untuk membuat uji dua arah pada alpha tingkat signifikansi hipotesis bahwa rata-rata populasi adalah μ0. Maka kita tidak akan menolak hipotesis jika μ0 berada dalam interval kepercayaan tersebut dan akan menolak hipotesis itu jika μ0 tidak dalam interval kepercayaan tersebut. Interval kepercayaan membuat kita tidak dapat menyimpulkan bahwa terdapat probabilitas 1 – alpha bahwa paket berikutnya akan memerlukan waktu pengiriman yang berada dalam interval kepercayaan.',
        abstract: 'Interval kepercayaan adalah suatu rentang nilai. Rata-rata sampel Anda, x, berada di tengah rentang ini dan rentangnya x ± CONFIDENCE.NORM. Misalnya, jika x adalah rata-rata sampel waktu pengiriman untuk produk yang dipesan melalui email, x ± CONFIDENCE. NORM adalah rentang sarana populasi. Untuk rata-rata populasi, μ0, dalam rentang ini, probabilitas memperoleh rata-rata sampel yang lebih jauh dari μ0 daripada x adalah lebih besar dari alpha; untuk rata-rata populasi, μ0, bukan dalam rentang ini, probabilitas memperoleh rata-rata sampel yang lebih jauh dari μ0 daripada x adalah kurang dari alpha. Dengan kata lain, asumsikan bahwa kita menggunakan x, standard_dev, dan size untuk membuat uji dua arah pada alpha tingkat signifikansi hipotesis bahwa rata-rata populasi adalah μ0. Maka kita tidak akan menolak hipotesis jika μ0 berada dalam interval kepercayaan tersebut dan akan menolak hipotesis itu jika μ0 tidak dalam interval kepercayaan tersebut. Interval kepercayaan membuat kita tidak dapat menyimpulkan bahwa terdapat probabilitas 1 – alpha bahwa paket berikutnya akan memerlukan waktu pengiriman yang berada dalam interval kepercayaan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Diperlukan. Tingkat signifikansi yang digunakan untuk menghitung tingkat kepercayaan. Tingkat kepercayaan sama dengan 100*(1 - alpha)%, atau dengan kata lain, alpha dari 0,05 menunjukkan tingkat kepercayaan 95 persen.' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku populasi untuk rentang data tersebut dan diasumsikan telah diketahui.' },
            size: { name: 'size', detail: 'Diperlukan. Ukuran sampel.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Mengembalikan interval kepercayaan untuk rata-rata populasi, menggunakan distribusi t Student.',
        abstract: 'Mengembalikan interval kepercayaan untuk rata-rata populasi, menggunakan distribusi t Student.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Diperlukan. Tingkat signifikansi yang digunakan untuk menghitung tingkat kepercayaan. Tingkat kepercayaan sama dengan 100*(1 - alpha)%, atau dengan kata lain, alpha dari 0,05 menunjukkan tingkat kepercayaan 95 persen.' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku populasi untuk rentang data tersebut dan diasumsikan telah diketahui.' },
            size: { name: 'size', detail: 'Diperlukan. Ukuran sampel.' },
        },
    },
    CORREL: {
        description: 'Fungsi CORREL mengembalikan koefisien korlasi dari dua rentang sel. Gunakan koefisien korelasi untuk menetapkan hubungan antara dua properti. Misalnya, Anda bisa memeriksa hubungan antara suhu rata-rata suatu lokasi dan penggunaan AC.',
        abstract: 'Fungsi CORREL mengembalikan koefisien korlasi dari dua rentang sel. Gunakan koefisien korelasi untuk menetapkan hubungan antara dua properti. Misalnya, Anda bisa memeriksa hubungan antara suhu rata-rata suatu lokasi dan penggunaan AC.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Rentang nilai sel.' },
            array2: { name: 'array2', detail: 'Diperlukan. Rentang nilai sel kedua.' },
        },
    },
    COUNT: {
        description: 'Fungsi COUNT menghitung jumlah sel yang berisi angka, dan menghitung angka dalam daftar argumen. Gunakan fungsi COUNT untuk mendapatkan jumlah entri di bidang angka yang ada dalam rentang atau larik angka. Misalnya, Anda bisa memasukkan rumus berikut untuk menghitung angka dalam rentang A1:A20: =COUNT(A1:A20) . Dalam contoh ini, jika ada lima sel dalam rentang berisikan angka, hasilnya adalah 5 .',
        abstract: 'Fungsi COUNT menghitung jumlah sel yang berisi angka, dan menghitung angka dalam daftar argumen. Gunakan fungsi COUNT untuk mendapatkan jumlah entri di bidang angka yang ada dalam rentang atau larik angka. Misalnya, Anda bisa memasukkan rumus berikut untuk menghitung angka dalam rentang A1:A20: =COUNT(A1:A20) . Dalam contoh ini, jika ada lima sel dalam rentang berisikan angka, hasilnya adalah 5 .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value 1', detail: 'Diperlukan. Item pertama, referensi sel, atau rentang yang ingin Anda hitung angkanya.' },
            value2: { name: 'value 2', detail: 'Opsional. Hingga 255 item tambahan, referensi sel, atau rentang yang ingin Anda hitung angkanya.' },
        },
    },
    COUNTA: {
        description: 'Fungsi COUNTA menghitung jumlah sel yang tidak kosong dalam rentang.',
        abstract: 'Fungsi COUNTA menghitung jumlah sel yang tidak kosong dalam rentang.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 diperlukan, nilai berikutnya opsional. Sel 1 hingga 255, rentang sel, atau nilai yang ingin Anda ketahui rata-ratanya.' },
            value2: { name: 'value2', detail: 'Value1 diperlukan, nilai berikutnya opsional. Sel 1 hingga 255, rentang sel, atau nilai yang ingin Anda ketahui rata-ratanya.' },
        },
    },
    COUNTBLANK: {
        description: 'Gunakan fungsi COUNTBLANK , salah satu fungsi Statistik , untuk menghitung jumlah sel kosong dalam rentang sel.',
        abstract: 'Gunakan fungsi COUNTBLANK , salah satu fungsi Statistik , untuk menghitung jumlah sel kosong dalam rentang sel.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Diperlukan. Rentang yang ingin Anda hitung sel kosongnya.' },
        },
    },
    COUNTIF: {
        description: 'Gunakan COUNTIF, salah satu fungsi statistik , untuk menghitung jumlah sel yang memenuhi kriteria; misalnya, untuk menghitung berapa kali kota tertentu muncul dalam daftar pelanggan.',
        abstract: 'Gunakan COUNTIF, salah satu fungsi statistik , untuk menghitung jumlah sel yang memenuhi kriteria; misalnya, untuk menghitung berapa kali kota tertentu muncul dalam daftar pelanggan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Kelompok sel yang ingin Anda hitung. Rentang bisa berisi angka, array, rentang bernama, atau referensi yang berisi angka. Nilai kosong dan nilai teks diabaikan. Pelajari cara memilih rentang di lembar kerja .' },
            criteria: { name: 'criteria', detail: 'Angka, ekspresi, referensi sel, atau string teks yang menentukan sel yang akan dihitung. Misalnya, Anda dapat menggunakan angka seperti 32, perbandingan seperti ">32", sel seperti B4, atau kata seperti "apel". COUNTIF hanya menggunakan kriteria tunggal. Gunakan COUNTIFS jika Anda ingin menggunakan beberapa kriteria.' },
        },
    },
    COUNTIFS: {
        description: 'Fungsi COUNTIFS menerapkan kriteria untuk sel di beberapa rentang dan menghitung berapa kali semua kriteria terpenuhi.',
        abstract: 'Fungsi COUNTIFS menerapkan kriteria untuk sel di beberapa rentang dan menghitung berapa kali semua kriteria terpenuhi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'criteria_range1', detail: 'Diperlukan. Rentang pertama untuk mengevaluasi kriteria yang terkait.' },
            criteria1: { name: 'criteria1', detail: 'Diperlukan. Kriteria dalam bentuk angka, ekspresi, referensi sel, atau teks yang menentukan sel mana yang akan dihitung. Misalnya, kriteria dapat dinyatakan sebagai 32, ">32", B4, "apel", atau "32".' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Opsional. Rentang tambahan dan kriteria yang terkait. Hingga 127 pasangan rentang/kriteria yang diperbolehkan.' },
            criteria2: { name: 'criteria2', detail: 'Opsional. Rentang tambahan dan kriteria yang terkait. Hingga 127 pasangan rentang/kriteria yang diperbolehkan.' },
        },
    },
    COVARIANCE_P: {
        description: 'Mengembalikan kovarians populasi, rata-rata produk deviasi untuk masing-masing pasangan titik data dalam dua set data. Gunakan kovarians untuk menentukan hubungan antara dua set data. Misalnya, Anda dapat memeriksa apakah pendapatan yang lebih besar menyertai tingkat pendidikan yang lebih tinggi.',
        abstract: 'Mengembalikan kovarians populasi, rata-rata produk deviasi untuk masing-masing pasangan titik data dalam dua set data. Gunakan kovarians untuk menentukan hubungan antara dua set data. Misalnya, Anda dapat memeriksa apakah pendapatan yang lebih besar menyertai tingkat pendidikan yang lebih tinggi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Rentang sel pertama bilangan bulat.' },
            array2: { name: 'array2', detail: 'Diperlukan. Rentang sel kedua bilangan bulat.' },
        },
    },
    COVARIANCE_S: {
        description: 'Mengembalikan kovarians sampel, rata-rata hasil kali simpangan untuk setiap pasangan titik data dalam dua set data.',
        abstract: 'Mengembalikan kovarians sampel, rata-rata hasil kali simpangan untuk setiap pasangan titik data dalam dua set data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Rentang sel pertama bilangan bulat.' },
            array2: { name: 'array2', detail: 'Diperlukan. Rentang sel kedua bilangan bulat.' },
        },
    },
    DEVSQ: {
        description: 'Mengembalikan jumlah kuadrat simpangan titik data dari nilai tengah sampelnya.',
        abstract: 'Mengembalikan jumlah kuadrat simpangan titik data dari nilai tengah sampelnya.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Argumen 1 sampai 255 tempat Anda ingin menghitung jumlah simpangan kuadrat. Anda juga dapat menggunakan array tunggal atau referensi ke array daripada argumen-argumen yang dipisahkan oleh koma.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Argumen 1 sampai 255 tempat Anda ingin menghitung jumlah simpangan kuadrat. Anda juga dapat menggunakan array tunggal atau referensi ke array daripada argumen-argumen yang dipisahkan oleh koma.' },
        },
    },
    EXPON_DIST: {
        description: 'Mengembalikan distribusi eksponensial. Gunakan EXPON.DIST untuk membuat model waktu antara peristiwa, seperti berapa lama waktu yang diperlukan anjungan tunai mandiri (ATM) untuk mengeluarkan uang tunai. Misalnya, Anda dapat menggunakan EXPON.DIST untuk menetapkan probabilitas bahwa proses itu memerlukan paling lama 1 menit.',
        abstract: 'Mengembalikan distribusi eksponensial. Gunakan EXPON.DIST untuk membuat model waktu antara peristiwa, seperti berapa lama waktu yang diperlukan anjungan tunai mandiri (ATM) untuk mengeluarkan uang tunai. Misalnya, Anda dapat menggunakan EXPON.DIST untuk menetapkan probabilitas bahwa proses itu memerlukan paling lama 1 menit.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai fungsi.' },
            lambda: { name: 'lambda', detail: 'Diperlukan. Nilai parameter.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menunjukkan formulir fungsi eksponensial mana yang akan diberikan. Jika secara kumulatif adalah TRUE, EXPON.DIST akan mengembalikan fungsi distribusi kumulatif; jika FALSE, mengembalikan fungsi kerapatan probabilitas.' },
        },
    },
    F_DIST: {
        description: 'Mengembalikan distribusi probabilitas F. Anda dapat menggunakan fungsi ini untuk menentukan apakah dua unit data memiliki derajat keragaman berbeda. Misalnya, Anda dapat memeriksa nilai ujian pria dan wanita yang memasuki sekolah menengah, dan menentukan apakah varianabilitas pada wanita berbeda dari yang ditemukan pada laki-laki.',
        abstract: 'Mengembalikan distribusi probabilitas F. Anda dapat menggunakan fungsi ini untuk menentukan apakah dua unit data memiliki derajat keragaman berbeda. Misalnya, Anda dapat memeriksa nilai ujian pria dan wanita yang memasuki sekolah menengah, dan menentukan apakah varianabilitas pada wanita berbeda dari yang ditemukan pada laki-laki.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Diperlukan. Derajat kebebasan pembilang' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Diperlukan. Derajat kebebasan penyebut.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika cumulative adalah TRUE, F.DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, mengembalikan fungsi kerapatan probabilitas.' },
        },
    },
    F_DIST_RT: {
        description: 'Mengembalikan distribusi probabilitas F (arah kanan) (derajat keragaman) untuk dua unit data. Anda dapat menggunakan fungsi ini untuk menentukan apakah dua unit data memiliki derajat keragaman berbeda. Misalnya, Anda bisa memeriksa nilai ujian laki-laki dan perempuan yang masuk sekolah menengah dan menentukan apakah keragaman pada nilai perempuan berbeda dari yang ditemukan pada laki-laki.',
        abstract: 'Mengembalikan distribusi probabilitas F (arah kanan) (derajat keragaman) untuk dua unit data. Anda dapat menggunakan fungsi ini untuk menentukan apakah dua unit data memiliki derajat keragaman berbeda. Misalnya, Anda bisa memeriksa nilai ujian laki-laki dan perempuan yang masuk sekolah menengah dan menentukan apakah keragaman pada nilai perempuan berbeda dari yang ditemukan pada laki-laki.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Diperlukan. Derajat kebebasan pembilang' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Diperlukan. Derajat kebebasan penyebut.' },
        },
    },
    F_INV: {
        description: 'Mengembalikan inversi distribusi probabilitas F. Jika p = F.DIST(x,...), maka F.INV(p,...) = x. Distribusi F dapat digunakan dalam uji F yang membandingkan derajat keragaman dalam dua unit data. Misalnya, Anda dapat menganalisis distribusi pendapatan di Amerika Serikat dan Kanada untuk menentukan apakah dua negara tersebut memiliki derajat keragaman pendapatan yang mirip.',
        abstract: 'Mengembalikan inversi distribusi probabilitas F. Jika p = F.DIST(x,...), maka F.INV(p,...) = x. Distribusi F dapat digunakan dalam uji F yang membandingkan derajat keragaman dalam dua unit data. Misalnya, Anda dapat menganalisis distribusi pendapatan di Amerika Serikat dan Kanada untuk menentukan apakah dua negara tersebut memiliki derajat keragaman pendapatan yang mirip.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas yang dikaitkan dengan distribusi kumulatif F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Diperlukan. Derajat kebebasan pembilang' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Diperlukan. Derajat kebebasan penyebut.' },
        },
    },
    F_INV_RT: {
        description: 'Mengembalikan inversi distribusi probabilitas F (arah kanan). Jika p = F.DIST.RT(x,...), maka F.INV.RT(p,...) = x. Distribusi F dapat digunakan dalam uji F yang membandingkan derajat keragaman dalam dua unit data. Misalnya, Anda dapat menganalisis distribusi pendapatan di Amerika Serikat dan Kanada untuk menentukan apakah dua negara tersebut memiliki derajat keragaman pendapatan yang mirip.',
        abstract: 'Mengembalikan inversi distribusi probabilitas F (arah kanan). Jika p = F.DIST.RT(x,...), maka F.INV.RT(p,...) = x. Distribusi F dapat digunakan dalam uji F yang membandingkan derajat keragaman dalam dua unit data. Misalnya, Anda dapat menganalisis distribusi pendapatan di Amerika Serikat dan Kanada untuk menentukan apakah dua negara tersebut memiliki derajat keragaman pendapatan yang mirip.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas yang dikaitkan dengan distribusi kumulatif F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Diperlukan. Derajat kebebasan pembilang' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Diperlukan. Derajat kebebasan penyebut.' },
        },
    },
    F_TEST: {
        description: 'Gunakan fungsi ini untuk menentukan apakah kedua sampel memiliki varians yang berbeda. Misalnya, dengan adanya nilai ujian dari sekolah negeri dan swasta, Anda dapat menguji apakah sekolah-sekolah tersebut memiliki tingkat nilai ujian yang berbeda.',
        abstract: 'Gunakan fungsi ini untuk menentukan apakah kedua sampel memiliki varians yang berbeda. Misalnya, dengan adanya nilai ujian dari sekolah negeri dan swasta, Anda dapat menguji apakah sekolah-sekolah tersebut memiliki tingkat nilai ujian yang berbeda.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Array atau rentang data pertama.' },
            array2: { name: 'array2', detail: 'Diperlukan. Array atau rentang data kedua.' },
        },
    },
    FISHER: {
        description: 'Mengembalikan transformasi Fisher pada x. Transformasi ini mengembalikan fungsi yang didistribusikan secara normal dan tidak condong. Gunakan fungsi ini untuk melakukan pengujian hipotesis pada koefisien korelasi.',
        abstract: 'Mengembalikan transformasi Fisher pada x. Transformasi ini mengembalikan fungsi yang didistribusikan secara normal dan tidak condong. Gunakan fungsi ini untuk melakukan pengujian hipotesis pada koefisien korelasi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai numerik yang Anda inginkan untuk transformasi.' },
        },
    },
    FISHERINV: {
        description: 'Mengembalikan inversi dari transformasi Fisher. Gunakan transformasi ini saat menganalisis korelasi antara rentang atau array data. Jika y = FISHER(x), maka FISHERINV(y) = x.',
        abstract: 'Mengembalikan inversi dari transformasi Fisher. Gunakan transformasi ini saat menganalisis korelasi antara rentang atau array data. Jika y = FISHER(x), maka FISHERINV(y) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'Diperlukan. Nilai yang ingin Anda gunakan untuk melakukan inversi dari transformasi tersebut.' },
        },
    },
    FORECAST: {
        description: 'Hitung, atau prediksi, nilai masa mendatang dengan menggunakan nilai yang sudah ada. Nilai masa depan adalah nilai y untuk nilai x tertentu. Nilai yang sudah ada adalah nilai x dan nilai y yang diketahui, dan nilai masa depan diprediksi dengan menggunakan regresi linear. Anda dapat menggunakan fungsi ini untuk memprediksi tren penjualan, persediaan, atau tren konsumen di masa mendatang.',
        abstract: 'Hitung, atau prediksi, nilai masa mendatang dengan menggunakan nilai yang sudah ada. Nilai masa depan adalah nilai y untuk nilai x tertentu. Nilai yang sudah ada adalah nilai x dan nilai y yang diketahui, dan nilai masa depan diprediksi dengan menggunakan regresi linear. Anda dapat menggunakan fungsi ini untuk memprediksi tren penjualan, persediaan, atau tren konsumen di masa mendatang.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'ya Poin data yang ingin Anda prediksikan nilainya.' },
            knownYs: { name: 'known_y\'s', detail: 'ya Array atau rentang data terikat.' },
            knownXs: { name: 'known_x\'s', detail: 'ya Array atau rentang data bebas.' },
        },
    },
    FORECAST_ETS: {
        description: 'Anda selalu dapat bertanya kepada pakar dalam Komunitas Teknologi Excel atau mendapatkan dukungan di Komunitas .',
        abstract: 'Anda selalu dapat bertanya kepada pakar dalam Komunitas Teknologi Excel atau mendapatkan dukungan di Komunitas .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Tanggal target', detail: 'Titik data yang nilainya ingin diprediksi.' },
            values: { name: 'Nilai', detail: 'Nilai historis yang digunakan untuk prakiraan.' },
            timeline: { name: 'Garis waktu', detail: 'Rentang atau array independen berisi tanggal atau waktu numerik dengan langkah konstan.' },
            seasonality: { name: 'Musiman', detail: 'Opsional. Panjang musim; 1 untuk deteksi otomatis dan 0 untuk tanpa musim.' },
            dataCompletion: { name: 'Penyelesaian data', detail: 'Opsional. Gunakan 1 untuk interpolasi titik yang hilang atau 0 untuk menganggapnya nol.' },
            aggregation: { name: 'Agregasi', detail: 'Opsional. Nilai 1 sampai 7 menentukan cara mengagregasi cap waktu duplikat.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Anda selalu dapat bertanya kepada pakar dalam Komunitas Teknologi Excel atau mendapatkan dukungan di Komunitas .',
        abstract: 'Anda selalu dapat bertanya kepada pakar dalam Komunitas Teknologi Excel atau mendapatkan dukungan di Komunitas .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Tanggal target', detail: 'Titik data yang nilainya ingin diprediksi.' },
            values: { name: 'Nilai', detail: 'Nilai historis yang digunakan untuk prakiraan.' },
            timeline: { name: 'Garis waktu', detail: 'Rentang atau array independen berisi tanggal atau waktu numerik dengan langkah konstan.' },
            confidenceLevel: { name: 'Tingkat keyakinan', detail: 'Opsional. Angka antara 0 dan 1; default-nya 0,95.' },
            seasonality: { name: 'Musiman', detail: 'Opsional. Panjang musim; 1 untuk deteksi otomatis dan 0 untuk tanpa musim.' },
            dataCompletion: { name: 'Penyelesaian data', detail: 'Opsional. Gunakan 1 untuk interpolasi titik yang hilang atau 0 untuk menganggapnya nol.' },
            aggregation: { name: 'Agregasi', detail: 'Opsional. Nilai 1 sampai 7 menentukan cara mengagregasi cap waktu duplikat.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Anda selalu dapat bertanya kepada pakar dalam Komunitas Teknologi Excel atau mendapatkan dukungan di Komunitas .',
        abstract: 'Anda selalu dapat bertanya kepada pakar dalam Komunitas Teknologi Excel atau mendapatkan dukungan di Komunitas .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Nilai', detail: 'Nilai historis yang digunakan untuk prakiraan.' },
            timeline: { name: 'Garis waktu', detail: 'Rentang atau array independen berisi tanggal atau waktu numerik dengan langkah konstan.' },
            dataCompletion: { name: 'Penyelesaian data', detail: 'Opsional. Gunakan 1 untuk interpolasi titik yang hilang atau 0 untuk menganggapnya nol.' },
            aggregation: { name: 'Agregasi', detail: 'Opsional. Nilai 1 sampai 7 menentukan cara mengagregasi cap waktu duplikat.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Anda selalu dapat bertanya kepada pakar dalam Komunitas Teknologi Excel atau mendapatkan dukungan di Komunitas .',
        abstract: 'Anda selalu dapat bertanya kepada pakar dalam Komunitas Teknologi Excel atau mendapatkan dukungan di Komunitas .',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Nilai', detail: 'Nilai historis yang digunakan untuk prakiraan.' },
            timeline: { name: 'Garis waktu', detail: 'Rentang atau array independen berisi tanggal atau waktu numerik dengan langkah konstan.' },
            statisticType: { name: 'Jenis statistik', detail: 'Nilai 1 sampai 8 menentukan statistik prakiraan yang dikembalikan.' },
            seasonality: { name: 'Musiman', detail: 'Opsional. Panjang musim; 1 untuk deteksi otomatis dan 0 untuk tanpa musim.' },
            dataCompletion: { name: 'Penyelesaian data', detail: 'Opsional. Gunakan 1 untuk interpolasi titik yang hilang atau 0 untuk menganggapnya nol.' },
            aggregation: { name: 'Agregasi', detail: 'Opsional. Nilai 1 sampai 7 menentukan cara mengagregasi cap waktu duplikat.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Hitung, atau prediksi, nilai masa mendatang dengan menggunakan nilai yang sudah ada. Nilai masa depan adalah nilai y untuk nilai x tertentu. Nilai yang sudah ada adalah nilai x dan nilai y yang diketahui, dan nilai masa depan diprediksi dengan menggunakan regresi linear. Anda dapat menggunakan fungsi ini untuk memprediksi tren penjualan, persediaan, atau tren konsumen di masa mendatang.',
        abstract: 'Hitung, atau prediksi, nilai masa mendatang dengan menggunakan nilai yang sudah ada. Nilai masa depan adalah nilai y untuk nilai x tertentu. Nilai yang sudah ada adalah nilai x dan nilai y yang diketahui, dan nilai masa depan diprediksi dengan menggunakan regresi linear. Anda dapat menggunakan fungsi ini untuk memprediksi tren penjualan, persediaan, atau tren konsumen di masa mendatang.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'ya Poin data yang ingin Anda prediksikan nilainya.' },
            knownYs: { name: 'known_y\'s', detail: 'ya Array atau rentang data terikat.' },
            knownXs: { name: 'known_x\'s', detail: 'ya Array atau rentang data bebas.' },
        },
    },
    FREQUENCY: {
        description: 'Fungsi FREQUENCY menghitung frekuensi kemunculan nilai dalam rentang nilai, lalu mengembalikan array vertikal angka. Misalnya, gunakan FREQUENCY untuk menghitung jumlah skor ujian dalam rentang skor. Karena FREQUENCY mengembalikan array, maka harus dimasukkan sebagai rumus array.',
        abstract: 'Fungsi FREQUENCY menghitung frekuensi kemunculan nilai dalam rentang nilai, lalu mengembalikan array vertikal angka. Misalnya, gunakan FREQUENCY untuk menghitung jumlah skor ujian dalam rentang skor. Karena FREQUENCY mengembalikan array, maka harus dimasukkan sebagai rumus array.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'data_array', detail: 'Diperlukan. Array atau referensi ke sekumpulan nilai yang ingin dihitung frekuensinya. Jika data_array tidak berisi nilai, FREQUENCY mengembalikan array nol.' },
            binsArray: { name: 'bins_array', detail: 'Diperlukan. Array atau referensi ke interval untuk mengelompokkan nilai dalam data_array. Jika bins_array tidak berisi nilai, FREQUENCY mengembalikan jumlah elemen dalam data_array.' },
        },
    },
    GAMMA: {
        description: 'Mengembalikan nilai fungsi gamma.',
        abstract: 'Mengembalikan nilai fungsi gamma.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Mengembalikan angka.' },
        },
    },
    GAMMA_DIST: {
        description: 'Mengembalikan distribusi gamma. Anda dapat menggunakan fungsi ini untuk mempelajari variabel yang mungkin memiliki distribusi condong. Distribusi gamma biasa digunakan dalam analisis antrian.',
        abstract: 'Mengembalikan distribusi gamma. Anda dapat menggunakan fungsi ini untuk mempelajari variabel yang mungkin memiliki distribusi condong. Distribusi gamma biasa digunakan dalam analisis antrian.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin digunakan untuk mengevaluasi distribusi.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter untuk distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter terhadap distribusi. Jika beta = 1, GAMMA.DIST mengembalikan distribusi gamma standar.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika kumulatif TRUE, GAMMA.DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, fungsi mengembalikan fungsi kerapatan probabilitas.' },
        },
    },
    GAMMA_INV: {
        description: 'Mengembalikan inversi dari distribusi kumulatif gamma. Jika p = GAMMA.DIST(x,...), maka GAMMA.INV(p,...) = x. Anda dapat menggunakan fungsi ini untuk mempelajari variabel yang distribusinya mungkin condong.',
        abstract: 'Mengembalikan inversi dari distribusi kumulatif gamma. Jika p = GAMMA.DIST(x,...), maka GAMMA.INV(p,...) = x. Anda dapat menggunakan fungsi ini untuk mempelajari variabel yang distribusinya mungkin condong.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas terkait dengan distribusi gamma.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter untuk distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter terhadap distribusi. Jika beta = 1, GAMMA.INV mengembalikan distribusi gamma standar.' },
        },
    },
    GAMMALN: {
        description: 'Mengembalikan logaritma natural fungsi gamma, Γ(x).',
        abstract: 'Mengembalikan logaritma natural fungsi gamma, Γ(x).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin digunakan untuk menghitung GAMMALN.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Mengembalikan logaritma natural fungsi gamma, Γ(x).',
        abstract: 'Mengembalikan logaritma natural fungsi gamma, Γ(x).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin digunakan untuk menghitung GAMMALN.PRECISE.' },
        },
    },
    GAUSS: {
        description: 'Menghitung probabilitas bahwa anggota populasi normal standar akan masuk di antara rata-rata dan z simpangan baku dari rata-rata.',
        abstract: 'Menghitung probabilitas bahwa anggota populasi normal standar akan masuk di antara rata-rata dan z simpangan baku dari rata-rata.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Diperlukan. Mengembalikan angka.' },
        },
    },
    GEOMEAN: {
        description: 'Mengembalikan rata-rata geometrik sebuah array atau rentang data positif. Misalnya, Anda dapat menggunakan GEOMEAN untuk menghitung rata-rata angka pertumbuhan dari campuran bunga dengan angka variabel.',
        abstract: 'Mengembalikan rata-rata geometrik sebuah array atau rentang data positif. Misalnya, Anda dapat menggunakan GEOMEAN untuk menghitung rata-rata angka pertumbuhan dari campuran bunga dengan angka variabel.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. 1 sampai 255 argumen sebagai tujuan menghitung rata-rata. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. 1 sampai 255 argumen sebagai tujuan menghitung rata-rata. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
        },
    },
    GROWTH: {
        description: 'Menghitung prediksi pertumbuhan eksponensial menggunakan data yang ada. GROWTH mengembalikan nilai-y untuk serangkaian nilai-x baru yang Anda tentukan menggunakan nilai-x dan nilai-y yang ada. Anda juga dapat menggunakan fungsi lembar kerja GROWTH untuk menyesuaikan kurva eksponensial dengan nilai-x dan nilai-y yang ada.',
        abstract: 'Menghitung prediksi pertumbuhan eksponensial menggunakan data yang ada. GROWTH mengembalikan nilai-y untuk serangkaian nilai-x baru yang Anda tentukan menggunakan nilai-x dan nilai-y yang ada. Anda juga dapat menggunakan fungsi lembar kerja GROWTH untuk menyesuaikan kurva eksponensial dengan nilai-x dan nilai-y yang ada.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Diperlukan. Set nilai-y sudah Anda ketahui dalam hubungan y = b*m^x. Jika array known_y\'s berada dalam kolom tunggal, maka setiap kolom known_x\'s diinterpretasikan sebagai variabel terpisah. Jika array known_y\'s berada dalam baris tunggal, maka setiap baris known_x\'s diinterpretasikan sebagai variabel terpisah. Jika salah satu angka dalam known_y adalah 0 atau negatif, GROWTH mengembalikan #NUM! nilai kesalahan.' },
            knownXs: { name: 'known_x\'s', detail: 'Opsional. Set nilai-x opsional mungkin sudah Anda ketahui di hubungan y = b*m^x. Array known_x\'s dapat mencakup satu atau lebih kumpulan variabel. Jika hanya satu variabel yang digunakan, known_y\'s dan known_x\'s bisa berupa rentang dalam bentuk apa pun, selama memiliki dimensi yang sama. Jika lebih dari satu variabel yang digunakan, known_y\'s harus berupa vektor (yaitu, rentang dengan tinggi satu baris atau lebar satu kolom). Jika known_x\'s dihilangkan, maka diasumsikan sebagai array {1,2,3,...} yang berukuran sama dengan known_y\'s.' },
            newXs: { name: 'new_x\'s', detail: 'Opsional. Adalah nilai-x baru yang akan diisi dengan nilai-y terkait yang dikembalikan GROWTH. New_x\'s harus mencakup satu kolom (atau baris) untuk setiap variabel independen, seperti halnya known_x\'s. Jadi, jika known_y\'s berada di satu kolom, known_x\'s dan new_x\'s harus memiliki jumlah kolom yang sama. Jika known_y\'s berada di satu baris, known_x\'s dan new_x\'s harus memiliki jumlah baris yang sama. Jika new_x\'s dihilangkan, maka dianggap sama dengan known_x\'s. Jika known_x\'s dan new_x\'s dihilangkan, maka dianggap array {1,2,3,...} yang berukuran sama dengan known_y\'s.' },
            constb: { name: 'const', detail: 'Opsional. Nilai logika yang menentukan perlunya mendorong konstanta b agar sama dengan 1. Jika const TRUE atau dihilangkan, b dihitung secara normal. Jika const FALSE, b disetel sama dengan 1 dan nilai-m disesuaikan sehingga y = m^x.' },
        },
    },
    HARMEAN: {
        description: 'Mengembalikan rata-rata harmonik kumpulan data. Rata-rata harmonik adalah resiprokal dari rata-rata aritmatika resiprokal.',
        abstract: 'Mengembalikan rata-rata harmonik kumpulan data. Rata-rata harmonik adalah resiprokal dari rata-rata aritmatika resiprokal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. 1 sampai 255 argumen sebagai tujuan menghitung rata-rata. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. 1 sampai 255 argumen sebagai tujuan menghitung rata-rata. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Mengembalikan distribusi hipergeometrik. HYPGEOM.DIST mengembalikan probabilitas sejumlah sampel keberhasilan tertentu, ukuran sampel tertentu, keberhasilan populasi, dan ukuran populasi. Gunakan HYPGEOM.DIST untuk masalah-masalah dengan populasi terbatas, di mana setiap observasi bisa berhasil atau gagal, dan di mana setiap subkumpulan dari ukuran tertentu dipilih dengan kemungkinan yang sama.',
        abstract: 'Mengembalikan distribusi hipergeometrik. HYPGEOM.DIST mengembalikan probabilitas sejumlah sampel keberhasilan tertentu, ukuran sampel tertentu, keberhasilan populasi, dan ukuran populasi. Gunakan HYPGEOM.DIST untuk masalah-masalah dengan populasi terbatas, di mana setiap observasi bisa berhasil atau gagal, dan di mana setiap subkumpulan dari ukuran tertentu dipilih dengan kemungkinan yang sama.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Diperlukan. Jumlah keberhasilan di dalam sampel.' },
            numberSample: { name: 'number_sample', detail: 'Diperlukan. Ukuran sampel.' },
            populationS: { name: 'population_s', detail: 'Diperlukan. Jumlah keberhasilan di dalam populasi.' },
            numberPop: { name: 'number_pop', detail: 'Diperlukan. Ukuran populasi.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika kumulatif TRUE, maka HYPGEOM.DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, maka HYPGEOM.DIST mengembalikan fungsi massa probabilitas.' },
        },
    },
    INTERCEPT: {
        description: 'Menghitung titik tempat sebuah garis akan mengiris sumbu y dengan menggunakan nilai x dan nilai y. Titik potong didasarkan pada garis regresi paling pas yang diplot melalui nilai x dan nilai y yang diketahui. Gunakan fungsi INTERCEPT ketika Anda ingin menentukan nilai variabel tidak bebas saat variabel bebasnya 0 (nol). Misalnya, Anda dapat menggunakan fungsi INTERCEPT untuk memprakirakan resistansi listrik logam pada suhu 0°C ketika titik-titik data Anda diambil pada suhu ruangan dan lebih tinggi lagi.',
        abstract: 'Menghitung titik tempat sebuah garis akan mengiris sumbu y dengan menggunakan nilai x dan nilai y. Titik potong didasarkan pada garis regresi paling pas yang diplot melalui nilai x dan nilai y yang diketahui. Gunakan fungsi INTERCEPT ketika Anda ingin menentukan nilai variabel tidak bebas saat variabel bebasnya 0 (nol). Misalnya, Anda dapat menggunakan fungsi INTERCEPT untuk memprakirakan resistansi listrik logam pada suhu 0°C ketika titik-titik data Anda diambil pada suhu ruangan dan lebih tinggi lagi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Diperlukan. Unit observasi atau data tidak bebas.' },
            knownXs: { name: 'known_x\'s', detail: 'Diperlukan. Unit observasi atau data bebas.' },
        },
    },
    KURT: {
        description: 'Mengembalikan kurtosis dari satu unit data. Kurtosis mencirikan keruncingan atau kedataran relatif sebuah distribusi dibandingkan dengan distribusi normal. Kurtosis positif menandakan distribusi yang relatif runcing. Kurtosis negatif menandakan distribusi yang relatif datar.',
        abstract: 'Mengembalikan kurtosis dari satu unit data. Kurtosis mencirikan keruncingan atau kedataran relatif sebuah distribusi dibandingkan dengan distribusi normal. Kurtosis positif menandakan distribusi yang relatif runcing. Kurtosis negatif menandakan distribusi yang relatif datar.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Argumen 1 sampai 255 yang ingin Anda pakai untuk menghitung kurtosis. Anda juga dapat menggunakan array tunggal atau referensi ke sebuah array dan bukannya beberapa argumen yang dipisahkan oleh koma.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Argumen 1 sampai 255 yang ingin Anda pakai untuk menghitung kurtosis. Anda juga dapat menggunakan array tunggal atau referensi ke sebuah array dan bukannya beberapa argumen yang dipisahkan oleh koma.' },
        },
    },
    LARGE: {
        description: 'Mengembalikan nilai ke-k paling besar dalam sekumpulan data. Anda dapat menggunakan fungsi ini untuk memilih nilai berdasarkan posisi relatifnya. Misalnya, Anda dapat menggunakan LARGE untuk mengembalikan skor yang paling tinggi, kedua atau ketiga.',
        abstract: 'Mengembalikan nilai ke-k paling besar dalam sekumpulan data. Anda dapat menggunakan fungsi ini untuk memilih nilai berdasarkan posisi relatifnya. Misalnya, Anda dapat menggunakan LARGE untuk mengembalikan skor yang paling tinggi, kedua atau ketiga.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang data yang ingin Anda tentukan nilai terbesar ke-k-nya.' },
            k: { name: 'k', detail: 'Diperlukan. Posisi (dari yang paling besar) dalam array atau rentang sel data untuk dikembalikan.' },
        },
    },
    LINEST: {
        description: 'Fungsi LINEST menghitung statistik untuk sebuah garis dengan menggunakan metode "kuadrat terkecil" untuk menghitung garis lurus yang paling cocok dengan data Anda, dan kemudian mengembalikan array yang menguraikan garis tersebut. Anda juga dapat mengombinasikan LINEST dengan fungsi-fungsi lainnya untuk menghitung statistik untuk tipe model lain yang linear dalam parameter yang tidak diketahui, termasuk polinomial, logaritmik, eksponensial, dan serangkaian pangkat. Karena fungsi ini mengembalikan sebuah array nilai, maka harus dimasukkan sebagai rumus array. Petunjuk mengikuti contoh-contoh dalam artikel ini.',
        abstract: 'Fungsi LINEST menghitung statistik untuk sebuah garis dengan menggunakan metode "kuadrat terkecil" untuk menghitung garis lurus yang paling cocok dengan data Anda, dan kemudian mengembalikan array yang menguraikan garis tersebut. Anda juga dapat mengombinasikan LINEST dengan fungsi-fungsi lainnya untuk menghitung statistik untuk tipe model lain yang linear dalam parameter yang tidak diketahui, termasuk polinomial, logaritmik, eksponensial, dan serangkaian pangkat. Karena fungsi ini mengembalikan sebuah array nilai, maka harus dimasukkan sebagai rumus array. Petunjuk mengikuti contoh-contoh dalam artikel ini.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Diperlukan. Serangkaian nilai y yang sudah Anda ketahui dalam hubungan y = mx + b. Jika rentang known_y berada dalam satu kolom, setiap kolom known_x diinterpretasikan sebagai variabel terpisah. Jika rentang known_y dimuat dalam satu baris, setiap baris known_x diinterpretasikan sebagai variabel terpisah.' },
            knownXs: { name: 'known_x\'s', detail: 'Opsional. Serangkaian nilai x yang mungkin sudah Anda ketahui dalam hubungan y = mx + b. Rentang known_x dapat menyertakan satu atau beberapa kumpulan variabel. Jika hanya satu variabel yang digunakan, known_y dan known_x dapat berupa rentang bentuk apa pun, selama mereka memiliki dimensi yang sama. Jika lebih dari satu variabel digunakan, known_y harus vektor (yaitu, rentang dengan tinggi satu baris atau lebar satu kolom). Jika known_x dihilangkan , maka diasumsikan sebagai array {1,2,3,...} yang berukuran sama dengan known_y .' },
            constb: { name: 'const', detail: 'Opsional. Nilai logika yang menentukan perlunya mendorong konstanta b agar sama dengan 0. Jika const TRUE atau dihilangkan, b dihitung secara normal. Jika const FALSE, b diatur sama dengan 0 dan nilai m disesuaikan agar pas dengan y = mx.' },
            stats: { name: 'stats', detail: 'Opsional. Nilai logika yang menentukan apakah akan mengembalikan regresi statistik tambahan. Jika stats TRUE, LINEST mengembalikan statistik regresi tambahan; sebagai hasilnya, array yang dikembalikan adalah {mn,mn-1,...,m1,b; sen,sen-1,...,se1,seb; r 2,sey ; F,df; ssreg,ssresid} . Jika stats FALSE atau dihilangkan, LINEST hanya mengembalikan koefisien m dan konstanta b. Regresi statistik tambahannya adalah sebagai berikut.' },
        },
    },
    LOGEST: {
        description: 'Persamaan untuk kurva adalah:',
        abstract: 'Persamaan untuk kurva adalah:',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Diperlukan. Set nilai-y sudah Anda ketahui dalam hubungan y = b*m^x. Jika array known_y\'s berada dalam kolom tunggal, maka setiap kolom known_x\'s diinterpretasikan sebagai variabel terpisah. Jika array known_y\'s berada dalam baris tunggal, maka setiap baris known_x\'s diinterpretasikan sebagai variabel terpisah.' },
            knownXs: { name: 'known_x\'s', detail: 'Opsional. Set nilai-x opsional mungkin sudah Anda ketahui di hubungan y = b*m^x. Array known_x\'s dapat mencakup satu atau lebih kumpulan variabel. Jika hanya satu variabel yang digunakan, maka known_y\'s dan known_x\'s dapat berupa rentang berbentuk apa saja, selama memiliki dimensi yang sama. Jika lebih dari satu variabel yang digunakan, maka known_y\'s harus berupa rentang sel dengan tinggi satu baris atau lebar satu kolom (yang juga disebut vektor). Jika known_x\'s dikosongkan, maka diasumsikan sebagai array {1,2,3,...} yang memiliki ukuran sama dengan known_y\'s.' },
            constb: { name: 'const', detail: 'Opsional. Nilai logika yang menentukan perlunya mendorong konstanta b agar sama dengan 1. Jika const TRUE atau dihilangkan, b dihitung secara normal. Jika const FALSE, maka b diatur agar sama dengan 1, dan nilai m disesuaikan agar pas dengan y = m^x.' },
            stats: { name: 'stats', detail: 'Opsional. Nilai logika yang menentukan apakah akan mengembalikan regresi statistik tambahan. Jika stats TRUE, maka LOGEST mengembalikan statistik regresi tambahan, jadi array yang dikembalikan adalah {mn,mn-1,...,m1,b;sen,sen-1,...,se1,seb;r 2,sey; F,df;ssreg,ssresid}. Jika stats FALSE atau dikosongkan, maka LOGEST hanya mengembalikan koefisien m dan konstanta b.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Gunakan fungsi ini untuk menganalisis data yang telah ditransformasi secara logaritmik.',
        abstract: 'Gunakan fungsi ini untuk menganalisis data yang telah ditransformasi secara logaritmik.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata dari ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku dari ln(x).' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika kumulatif TRUE, maka LOGNORM.DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, maka LOGNORM.DIST mengembalikan fungsi probabilitas densitas.' },
        },
    },
    LOGNORM_INV: {
        description: 'Mengembalikan inversi dari fungsi distribusi kumulatif lognormal x, di mana ln(x) normalnya didistribusikan dengan parameter Mean dan Standard_dev. Jika p = LOGNORM.DIST(x,...) maka LOGNORM.INV(p,...) = x.',
        abstract: 'Mengembalikan inversi dari fungsi distribusi kumulatif lognormal x, di mana ln(x) normalnya didistribusikan dengan parameter Mean dan Standard_dev. Jika p = LOGNORM.DIST(x,...) maka LOGNORM.INV(p,...) = x.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Sebuah probabilitas yang dikaitkan dengan distribusi lognormal.' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata dari ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku dari ln(x).' },
        },
    },
    MARGINOFERROR: {
        description: 'Fungsi ini menghitung margin galat dari rentang nilai dan tingkat keyakinan.',
        abstract: 'Fungsi ini menghitung margin galat dari rentang nilai dan tingkat keyakinan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=id',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Rentang nilai yang digunakan untuk menghitung margin galat.' },
            confidence: { name: 'confidence', detail: 'Tingkat keyakinan yang diinginkan antara 0 dan 1.' },
        },
    },
    MAX: {
        description: 'Mengembalikan nilai terbesar dalam sekumpulan nilai.',
        abstract: 'Mengembalikan nilai terbesar dalam sekumpulan nilai.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Bilangan 1 sampai 255 yang ingin Anda cari nilai maksimumnya.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Bilangan 1 sampai 255 yang ingin Anda cari nilai maksimumnya.' },
        },
    },
    MAXA: {
        description: 'Mengembalikan nilai terbesar dalam daftar argumen.',
        abstract: 'Mengembalikan nilai terbesar dalam daftar argumen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Diperlukan. Angka 1 sampai 255 yang ingin Anda cari nilai terbesarnya.' },
            value2: { name: 'value2', detail: 'Opsional. Jumlah argumen 2 sampai 255 yang ingin Anda cari nilai terbesarnya.' },
        },
    },
    MAXIFS: {
        description: 'Fungsi MAXIFS mengembalikan nilai maksimal di antara sel yang ditentukan oleh kumpulan persyaratan atau kriteria tertentu.',
        abstract: 'Fungsi MAXIFS mengembalikan nilai maksimal di antara sel yang ditentukan oleh kumpulan persyaratan atau kriteria tertentu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'sum_range', detail: 'Rentang sel aktual tempat nilai maksimum akan ditentukan.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Adalah kumpulan sel yang akan dievaluasi dengan kriteria.' },
            criteria1: { name: 'criteria1', detail: 'Adalah kriteria dalam bentuk angka, ekspresi, atau teks yang menentukan sel mana yang akan dievaluasi sebagai kondisi maksimum. Kumpulan kriteria yang sama dapat digunakan dengan fungsi MINIFS , SUMIFS , dan AVERAGEIFS .' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Rentang tambahan dan kriteria yang terkait. Anda bisa memasukkan hingga 126 pasang rentang/kriteria.' },
            criteria2: { name: 'criteria2', detail: 'Rentang tambahan dan kriteria yang terkait. Anda bisa memasukkan hingga 126 pasang rentang/kriteria.' },
        },
    },
    MEDIAN: {
        description: 'Mengembalikan median dari angka tertentu. Median adalah angka yang berada di tengah serangkaian angka.',
        abstract: 'Mengembalikan median dari angka tertentu. Median adalah angka yang berada di tengah serangkaian angka.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Angka dari 1 sampai 255 yang Anda inginkan mediannya.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. Angka dari 1 sampai 255 yang Anda inginkan mediannya.' },
        },
    },
    MIN: {
        description: 'Mengembalikan angka terkecil dalam serangkaian nilai.',
        abstract: 'Mengembalikan angka terkecil dalam serangkaian nilai.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 bersifat opsional, angka berikutnya bersifat opsional. Angka 1 sampai 255 yang ingin Anda cari nilai minimumnya.' },
            number2: { name: 'number2', detail: 'Number1 bersifat opsional, angka berikutnya bersifat opsional. Angka 1 sampai 255 yang ingin Anda cari nilai minimumnya.' },
        },
    },
    MINA: {
        description: 'Mengembalikan nilai terkecil dalam daftar argumen.',
        abstract: 'Mengembalikan nilai terkecil dalam daftar argumen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 diperlukan, nilai berikutnya opsional. Angka 1 sampai 255 yang ingin Anda cari nilai minimumnya.' },
            value2: { name: 'value2', detail: 'Value1 diperlukan, nilai berikutnya opsional. Angka 1 sampai 255 yang ingin Anda cari nilai minimumnya.' },
        },
    },
    MINIFS: {
        description: 'Fungsi MINIFS mengembalikan nilai minimal di antara sel yang ditentukan oleh kumpulan persyaratan atau kriteria tertentu.',
        abstract: 'Fungsi MINIFS mengembalikan nilai minimal di antara sel yang ditentukan oleh kumpulan persyaratan atau kriteria tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'min_range', detail: 'Rentang sel aktual tempat nilai minimum akan ditentukan.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Adalah kumpulan sel yang akan dievaluasi dengan kriteria.' },
            criteria1: { name: 'criteria1', detail: 'Adalah kriteria dalam bentuk angka, ekspresi, atau teks yang menentukan sel mana yang akan dievaluasi sebagai kondisi minimum. Kumpulan kriteria yang sama dapat digunakan dengan fungsi MAXIFS , SUMIFS , dan AVERAGEIFS .' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Rentang tambahan dan kriteria yang terkait. Anda bisa memasukkan hingga 126 pasang rentang/kriteria.' },
            criteria2: { name: 'criteria2', detail: 'Rentang tambahan dan kriteria yang terkait. Anda bisa memasukkan hingga 126 pasang rentang/kriteria.' },
        },
    },
    MODE_MULT: {
        description: 'Ini akan mengembalikan lebih dari satu hasil jika ada beberapa modus. Karena fungsi ini mengembalikan array nilai, maka harus dimasukkan sebagai rumus array.',
        abstract: 'Ini akan mengembalikan lebih dari satu hasil jika ada beberapa modus. Karena fungsi ini mengembalikan array nilai, maka harus dimasukkan sebagai rumus array.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang ingin Anda hitung modusnya.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 254 yang ingin Anda hitung modusnya. Anda juga bisa menggunakan array tunggal atau array referensi ketimbang argumen yang dipisahkan oleh koma.' },
        },
    },
    MODE_SNGL: {
        description: 'Mengembalikan nilai yang paling sering berulang, atau repetitif, dalam array atau rentang data.',
        abstract: 'Mengembalikan nilai yang paling sering berulang, atau repetitif, dalam array atau rentang data.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen pertama yang ingin Anda hitung modusnya.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen 2 sampai 254 yang ingin Anda hitung modusnya. Anda juga bisa menggunakan array tunggal atau array referensi ketimbang argumen yang dipisahkan oleh koma.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Mengembalikan distribusi binomial negatif, probabilitasnya adalah akan ada kegagalan Number_f sebelum keberhasilan Number_s-th, dengan probabilitas keberhasilan Probability_s.',
        abstract: 'Mengembalikan distribusi binomial negatif, probabilitasnya adalah akan ada kegagalan Number_f sebelum keberhasilan Number_s-th, dengan probabilitas keberhasilan Probability_s.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Diperlukan. Jumlah kegagalan.' },
            numberS: { name: 'number_s', detail: 'Diperlukan. Jumlah ambang batas keberhasilan.' },
            probabilityS: { name: 'probability_s', detail: 'Diperlukan. Probabilitas keberhasilan.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika kumulatif TRUE, maka NEGBINOM.DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, maka NEGBINOM.DIST mengembalikan fungsi kerapatan probabilitas.' },
        },
    },
    NORM_DIST: {
        description: 'Mengembalikan distribusi normal untuk rata-rata dan simpangan baku tertentu. Penerapan fungsi ini dalam statistik luas sekali, termasuk pengujian hipotesis.',
        abstract: 'Mengembalikan distribusi normal untuk rata-rata dan simpangan baku tertentu. Penerapan fungsi ini dalam statistik luas sekali, termasuk pengujian hipotesis.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang Anda inginkan distribusinya.' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata aritmetika distribusi.' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku distribusi.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika kumulatif TRUE, MAKA NORM. DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, maka mengembalikan fungsi kerapatan probabilitas.' },
        },
    },
    NORM_INV: {
        description: 'Mengembalikan inversi distribusi kumulatif normal untuk rata-rata dan simpangan baku tertentu.',
        abstract: 'Mengembalikan inversi distribusi kumulatif normal untuk rata-rata dan simpangan baku tertentu.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Sebuah probabilitas yang dikaitkan dengan distribusi normal.' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata aritmetika distribusi.' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku distribusi.' },
        },
    },
    NORM_S_DIST: {
        description: 'The NORM. Fungsi S.DIST di Excel mengembalikan distribusi normal standar ( misalnya, memiliki rata-rata nol dan simpangan baku satu ). Anda dapat menggunakan fungsi ini sebagai ganti menggunakan tabel area kurva normal standar.',
        abstract: 'The NORM. Fungsi S.DIST di Excel mengembalikan distribusi normal standar ( misalnya, memiliki rata-rata nol dan simpangan baku satu ). Anda dapat menggunakan fungsi ini sebagai ganti menggunakan tabel area kurva normal standar.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Diperlukan. Ini adalah nilai yang Anda inginkan distribusinya.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Argumen kumulatif bisa berupa TRUE atau FALSE . Nilai logika ini menentukan bentuk fungsi. Jika kumulatif TRUE maka NORM. S.DIST mengembalikan fungsi distribusi kumulatif . Jika FALSE, maka mengembalikan fungsi massa probabilitas .' },
        },
    },
    NORM_S_INV: {
        description: 'Mengembalikan inversi dari distribusi kumulatif normal standar. Distribusi memiliki rata-rata nol dan simpangan baku dari satu.',
        abstract: 'Mengembalikan inversi dari distribusi kumulatif normal standar. Distribusi memiliki rata-rata nol dan simpangan baku dari satu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Sebuah probabilitas yang dikaitkan dengan distribusi normal.' },
        },
    },
    PEARSON: {
        description: 'Mengembalikan koefisien korelasi momen-produk Pearson, r, indeks tak berdimensi -1,0 sampai 1,0 inklusif dan mencerminkan jauhnya hubungan linear antara kedua rangkaian data.',
        abstract: 'Mengembalikan koefisien korelasi momen-produk Pearson, r, indeks tak berdimensi -1,0 sampai 1,0 inklusif dan mencerminkan jauhnya hubungan linear antara kedua rangkaian data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Satu set nilai independen.' },
            array2: { name: 'array2', detail: 'Diperlukan. Satu set nilai dependen' },
        },
    },
    PERCENTILE_EXC: {
        description: 'The PERCENTILE. Fungsi EXC mengembalikan persentil k-th dari nilai dalam rentang, di mana k berada dalam rentang 0..1, tidak termasuk 0..1.',
        abstract: 'The PERCENTILE. Fungsi EXC mengembalikan persentil k-th dari nilai dalam rentang, di mana k berada dalam rentang 0..1, tidak termasuk 0..1.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang data yang menentukan posisi relatif.' },
            k: { name: 'k', detail: 'Diperlukan. Nilai persentil dalam rentang 0 < k < 1.' },
        },
    },
    PERCENTILE_INC: {
        description: 'Mengembalikan persentil k-th dari nilai dalam rentang, di mana k berada dalam rentang 0 sampai 1, inklusif.',
        abstract: 'Mengembalikan persentil k-th dari nilai dalam rentang, di mana k berada dalam rentang 0 sampai 1, inklusif.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang data yang menentukan posisi relatif.' },
            k: { name: 'k', detail: 'Diperlukan. Nilai persentil dalam rentang 0 sampai 1, inklusif.' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Mengembalikan peringkat sebuah nilai dalam sekelompok data sebagai persentase sekelompok data (0..1, tidak termasuk 0 dan 1).',
        abstract: 'Mengembalikan peringkat sebuah nilai dalam sekelompok data sebagai persentase sekelompok data (0..1, tidak termasuk 0 dan 1).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang data dengan nilai numerik yang menjabarkan posisi relatifnya.' },
            x: { name: 'x', detail: 'Diperlukan. Angka yang ingin Anda cari peringkatnya.' },
            significance: { name: 'significance', detail: 'Opsional. Nilai yang menentukan jumlah digit signifikan untuk nilai persentase yang dikembalikan. Jika dihilangkan, maka PERCENTRANK. EXC menggunakan tiga digit (0.xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Mengembalikan peringkat persentase suatu nilai dalam set data (termasuk 0 dan 1).',
        abstract: 'Mengembalikan peringkat persentase suatu nilai dalam set data (termasuk 0 dan 1).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Array atau rentang data yang menentukan kedudukan relatif.' },
            x: { name: 'x', detail: 'Nilai yang peringkatnya ingin diketahui.' },
            significance: { name: 'significance', detail: 'Nilai yang menentukan jumlah digit signifikan untuk nilai persentase yang dikembalikan. Jika dihilangkan, PERCENTRANK.INC menggunakan tiga digit (0.xxx).' },
        },
    },
    PERMUT: {
        description: 'Mengembalikan jumlah permutasi untuk sejumlah objek tertentu yang bisa dipilih dari jumlah objek. Permutasi adalah sekelompok atau sub-kelompok objek atau peristiwa di mana urutan internal penting. Permutasi berbeda dari kombinasi, yang urutan internalnya tidak penting. Gunakan fungsi ini untuk perhitungan probabilitas dengan gaya lotre.',
        abstract: 'Mengembalikan jumlah permutasi untuk sejumlah objek tertentu yang bisa dipilih dari jumlah objek. Permutasi adalah sekelompok atau sub-kelompok objek atau peristiwa di mana urutan internal penting. Permutasi berbeda dari kombinasi, yang urutan internalnya tidak penting. Gunakan fungsi ini untuk perhitungan probabilitas dengan gaya lotre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Sebuah bilangan bulat yang menerangkan jumlah objek.' },
            numberChosen: { name: 'number_chosen', detail: 'Diperlukan. Sebuah bilangan bulat yang menerangkan jumlah objek dalam masing-masing permutasi.' },
        },
    },
    PERMUTATIONA: {
        description: 'Mengembalikan jumlah permutasi untuk sejumlah objek (dengan perulangan) yang bisa dipilih dari objek total.',
        abstract: 'Mengembalikan jumlah permutasi untuk sejumlah objek (dengan perulangan) yang bisa dipilih dari objek total.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Sebuah bilangan bulat yang menerangkan total jumlah objek.' },
            numberChosen: { name: 'number_chosen', detail: 'Diperlukan. Sebuah bilangan bulat yang menerangkan jumlah objek dalam masing-masing permutasi.' },
        },
    },
    PHI: {
        description: 'Mengembalikan nilai fungsi kerapatan untuk distribusi normal standar.',
        abstract: 'Mengembalikan nilai fungsi kerapatan untuk distribusi normal standar.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. X adalah angka kerapatan distribusi normal standar yang Anda inginkan.' },
        },
    },
    POISSON_DIST: {
        description: 'Mengembalikan distribusi Poisson. Aplikasi umum distribusi Poisson adalah meramalkan sejumlah kejadian selama waktu tertentu, seperti jumlah mobil yang datang di sebuah gerbang tol dalam 1 menit.',
        abstract: 'Mengembalikan distribusi Poisson. Aplikasi umum distribusi Poisson adalah meramalkan sejumlah kejadian selama waktu tertentu, seperti jumlah mobil yang datang di sebuah gerbang tol dalam 1 menit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Jumlah peristiwa.' },
            mean: { name: 'mean', detail: 'Diperlukan. Nilai numerik yang diinginkan.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan bentuk distribusi probabilitas yang dikembalikan. Jika kumulatif TRUE, maka POISSON.DIST mengembalikan probabilitas kumulatif Poisson bahwa sejumlah kejadian acak akan terjadi antara nol dan x inklusif; jika FALSE, maka mengembalikan fungsi massa probabilitas Poisson bahwa peristiwa yang terjadi akan tepat sejumlah x.' },
        },
    },
    PROB: {
        description: 'Mengembalikan probabilitas sehingga nilai-nilai dalam rentang berada di antara dua batas. Jika upper_limit tidak diberikan, maka mengembalikan probabilitas sehingga nilai-nilai dalam x_range sama dengan lower_limit.',
        abstract: 'Mengembalikan probabilitas sehingga nilai-nilai dalam rentang berada di antara dua batas. Jika upper_limit tidak diberikan, maka mengembalikan probabilitas sehingga nilai-nilai dalam x_range sama dengan lower_limit.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'x_range', detail: 'Diperlukan. Rentang nilai numerik x yang memiliki kaitan dengan probabilitas.' },
            probRange: { name: 'prob_range', detail: 'Diperlukan. Serangkaian probabilitas yang dikaitkan dengan nilai-nilai dalam x_range.' },
            lowerLimit: { name: 'lower_limit', detail: 'Opsional. Batas bawah pada nilai yang Anda inginkan probabilitasnya.' },
            upperLimit: { name: 'upper_limit', detail: 'Opsional. Batas atas nilai yang Anda inginkan probabilitasnya.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Mengembalikan kuartil rangkaian data, berdasarkan nilai persentil dari 0 sampai 1, tidak termasuk 0 sampai 1.',
        abstract: 'Mengembalikan kuartil rangkaian data, berdasarkan nilai persentil dari 0 sampai 1, tidak termasuk 0 sampai 1.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang sel nilai numerik yang ingin Anda cari nilai kuartilnya.' },
            quart: { name: 'quart', detail: 'Diperlukan. Menunjukkan nilai mana yang harus dikembalikan.' },
        },
    },
    QUARTILE_INC: {
        description: 'Kuartil sering digunakan dalam data penjualan dan survei untuk membagi populasi ke dalam berbagai kelompok. Sebagai contoh, Anda dapat menggunakan QUARTILE.INC untuk menemukan 25 persen dari pendapatan tertinggi dalam satu populasi.',
        abstract: 'Kuartil sering digunakan dalam data penjualan dan survei untuk membagi populasi ke dalam berbagai kelompok. Sebagai contoh, Anda dapat menggunakan QUARTILE.INC untuk menemukan 25 persen dari pendapatan tertinggi dalam satu populasi.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang sel nilai numerik yang ingin Anda cari nilai kuartilnya.' },
            quart: { name: 'quart', detail: 'Diperlukan. Menunjukkan nilai mana yang harus dikembalikan.' },
        },
    },
    RANK_AVG: {
        description: 'Mengembalikan peringkat angka dalam daftar angka: ukurannya relatif terhadap nilai lain dalam daftar. Jika lebih dari satu nilai memiliki peringkat yang sama, peringkat rata-rata akan dikembalikan.',
        abstract: 'Mengembalikan peringkat angka dalam daftar angka: ukurannya relatif terhadap nilai lain dalam daftar. Jika lebih dari satu nilai memiliki peringkat yang sama, peringkat rata-rata akan dikembalikan.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Diperlukan. Angka yang peringkatnya ingin Anda temukan.' },
            ref: { name: 'ref', detail: 'Diperlukan. Sebuah array dari, atau referensi ke, daftar angka. Nilai nonnumerik di Ref diabaikan.' },
            order: { name: 'order', detail: 'Opsional. Angka yang menentukan cara menetapkan peringkat.' },
        },
    },
    RANK_EQ: {
        description: 'Mengembalikan peringkat sebuah angka dalam daftar angka.',
        abstract: 'Mengembalikan peringkat sebuah angka dalam daftar angka.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Angka yang peringkatnya ingin ditemukan.' },
            ref: { name: 'ref', detail: 'Referensi ke daftar angka. Nilai nonnumerik dalam ref diabaikan.' },
            order: { name: 'order', detail: 'Angka yang menentukan cara memberi peringkat pada number. Jika 0 atau dihilangkan, urutannya menurun; nilai selain nol menggunakan urutan menaik.' },
        },
    },
    RSQ: {
        description: 'Mengembalikan kuadrat dari koefisien korelasi momen produk Pearson melalui titik data di known_y\'s dan known_x\'s. Untuk informasi selengkapnya, lihat fungsi PEARSON . Nilai r-kuadrat bisa diinterpretasikan sebagai proporsi dari varians di y yang disebabkan oleh varians di x.',
        abstract: 'Mengembalikan kuadrat dari koefisien korelasi momen produk Pearson melalui titik data di known_y\'s dan known_x\'s. Untuk informasi selengkapnya, lihat fungsi PEARSON . Nilai r-kuadrat bisa diinterpretasikan sebagai proporsi dari varians di y yang disebabkan oleh varians di x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Diperlukan. Array atau rentang sel dari titik data yang bergantung pada angka.' },
            knownXs: { name: 'known_x\'s', detail: 'Diperlukan. Kumpulan titik data independen.' },
        },
    },
    SKEW: {
        description: 'Mengembalikan nilai kecondongan distribusi. Kecondongan mencirikan derajat asimetris dari distribusi di sekitar nilai rata-ratanya. Kecondongan positif menunjukkan distribusi dengan arah asimetris yang meluas menuju nilai yang lebih positif. Kecondongan negatif menunjukkan distribusi dengan arah asimetris yang meluas menuju nilai yang lebih negatif.',
        abstract: 'Mengembalikan nilai kecondongan distribusi. Kecondongan mencirikan derajat asimetris dari distribusi di sekitar nilai rata-ratanya. Kecondongan positif menunjukkan distribusi dengan arah asimetris yang meluas menuju nilai yang lebih positif. Kecondongan negatif menunjukkan distribusi dengan arah asimetris yang meluas menuju nilai yang lebih negatif.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. 1 hingga 255 argumen yang ingin dihitung nilai kecondongannya. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
            number2: { name: 'number2', detail: 'Number1 diperlukan, angka berikutnya bersifat opsional. 1 hingga 255 argumen yang ingin dihitung nilai kecondongannya. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
        },
    },
    SKEW_P: {
        description: 'Mengembalikan kemencengan distribusi berdasarkan populasi.',
        abstract: 'Mengembalikan kemencengan distribusi berdasarkan populasi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Angka, referensi sel, atau rentang pertama yang kemencengannya ingin dihitung.' },
            number2: { name: 'number2', detail: 'Angka, referensi sel, atau rentang tambahan yang kemencengannya ingin dihitung, hingga maksimum 255.' },
        },
    },
    SLOPE: {
        description: 'Mengembalikan kemiringan garis regresi linear melalui titik data dalam known_y\'s dan known_x\'s. Kemiringan adalah jarak vertikal dibagi dengan jarak horizontal di antara dua titik pada garis, yang merupakan tingkat perubahan di sepanjang garis regresi.',
        abstract: 'Mengembalikan kemiringan garis regresi linear melalui titik data dalam known_y\'s dan known_x\'s. Kemiringan adalah jarak vertikal dibagi dengan jarak horizontal di antara dua titik pada garis, yang merupakan tingkat perubahan di sepanjang garis regresi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Diperlukan. Array atau rentang sel dari titik data yang bergantung pada angka.' },
            knownXs: { name: 'known_x\'s', detail: 'Diperlukan. Kumpulan titik data independen.' },
        },
    },
    SMALL: {
        description: 'Mengembalikan nilai k-th yang paling kecil dalam rangkaian data. Gunakan fungsi ini untuk mengembalikan nilai dengan posisi relatif tertentu dalam kumpulan data.',
        abstract: 'Mengembalikan nilai k-th yang paling kecil dalam rangkaian data. Gunakan fungsi ini untuk mengembalikan nilai dengan posisi relatif tertentu dalam kumpulan data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang data angka yang ingin Anda dapatkan nilai k-th yang paling kecil di dalamnya.' },
            k: { name: 'k', detail: 'Diperlukan. Posisi (dari yang paling kecil) di dalam array atau rentang data yang ingin dikembalikan.' },
        },
    },
    STANDARDIZE: {
        description: 'Mengembalikan nilai yang dinormalkan dari suatu distribusi yang dikarakterisasi oleh rata-rata dan simpangan baku.',
        abstract: 'Mengembalikan nilai yang dinormalkan dari suatu distribusi yang dikarakterisasi oleh rata-rata dan simpangan baku.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai yang ingin Anda normalkan.' },
            mean: { name: 'mean', detail: 'Diperlukan. Rata-rata aritmetika distribusi.' },
            standardDev: { name: 'standard_dev', detail: 'Diperlukan. Simpangan baku distribusi.' },
        },
    },
    STDEV_P: {
        description: 'Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        abstract: 'Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang bersesuaian dengan populasi.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 254 yang berkaitan dengan populasi. Anda juga bisa menggunakan array tunggal atau array referensi ketimbang argumen yang dipisahkan oleh koma.' },
        },
    },
    STDEV_S: {
        description: 'Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        abstract: 'Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang berkaitan dengan sampel populasi. Anda juga bisa menggunakan array tunggal atau array referensi ketimbang argumen yang dipisahkan oleh koma.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 254 yang berkaitan dengan sampel populasi. Anda juga bisa menggunakan array tunggal atau array referensi ketimbang argumen yang dipisahkan oleh koma.' },
        },
    },
    STDEVA: {
        description: 'Memperkirakan simpangan baku berdasarkan satu sampel. Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        abstract: 'Memperkirakan simpangan baku berdasarkan satu sampel. Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-rata (nilai tengahnya).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 diperlukan, nilai berikutnya opsional. Nilai 1 sampai 255 berhubungan dengan sampel populasi. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
            value2: { name: 'value2', detail: 'Value1 diperlukan, nilai berikutnya opsional. Nilai 1 sampai 255 berhubungan dengan sampel populasi. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
        },
    },
    STDEVPA: {
        description: 'Menghitung simpangan baku berdasarkan seluruh populasi yang diberikan sebagai argumen, termasuk teks dan nilai logika. Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-ratanya.',
        abstract: 'Menghitung simpangan baku berdasarkan seluruh populasi yang diberikan sebagai argumen, termasuk teks dan nilai logika. Simpangan baku adalah pengukuran seberapa lebar suatu nilai tersebar dari nilai rata-ratanya.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 diperlukan, nilai berikutnya opsional. Nilai 1 sampai 255 berhubungan dengan population. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
            value2: { name: 'value2', detail: 'Value1 diperlukan, nilai berikutnya opsional. Nilai 1 sampai 255 berhubungan dengan population. Anda juga bisa menggunakan array tunggal atau array referensi daripada argumen yang dipisahkan oleh koma.' },
        },
    },
    STEYX: {
        description: 'Mengembalikan galat standar nilai y yang diprediksi untuk setiap x dalam regresi.',
        abstract: 'Mengembalikan galat standar nilai y yang diprediksi untuk setiap x dalam regresi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'Array atau rentang data dependen.' },
            knownXs: { name: "known_x's", detail: 'Array atau rentang data independen.' },
        },
    },
    T_DIST: {
        description: 'Mengembalikan distribusi-t arah kiri Student. Distribusi-t digunakan dalam pengujian hipotesis kumpulan data sampel kecil. Gunakan fungsi ini di tabel nilai kritis untuk distribusi-t.',
        abstract: 'Mengembalikan distribusi-t arah kiri Student. Distribusi-t digunakan dalam pengujian hipotesis kumpulan data sampel kecil. Gunakan fungsi ini di tabel nilai kritis untuk distribusi-t.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai numerik yang ingin digunakan untuk mengevaluasi distribusi' },
            degFreedom: { name: 'degFreedom', detail: 'Diperlukan. Bilangan bulat yang menunjukkan angka derajat kebebasan.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Nilai logika yang menentukan formulir fungsi. Jika kumulatif adalah TRUE, T.DIST mengembalikan fungsi distribusi kumulatif; jika FALSE, mengembalikan fungsi kepadatan probabilitas.' },
        },
    },
    T_DIST_2T: {
        description: 'Distribusi-t Student digunakan dalam pengujian hipotesis kumpulan data sampel kecil. Gunakan fungsi ini di tabel nilai kritis untuk distribusi-t.',
        abstract: 'Distribusi-t Student digunakan dalam pengujian hipotesis kumpulan data sampel kecil. Gunakan fungsi ini di tabel nilai kritis untuk distribusi-t.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai numerik yang ingin digunakan untuk mengevaluasi distribusi.' },
            degFreedom: { name: 'degFreedom', detail: 'Diperlukan. Bilangan bulat yang menunjukkan angka derajat kebebasan.' },
        },
    },
    T_DIST_RT: {
        description: 'Distribusi-t digunakan dalam pengujian hipotesis kumpulan data sampel kecil. Gunakan fungsi ini di tabel nilai kritis untuk distribusi-t.',
        abstract: 'Distribusi-t digunakan dalam pengujian hipotesis kumpulan data sampel kecil. Gunakan fungsi ini di tabel nilai kritis untuk distribusi-t.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai numerik yang ingin digunakan untuk mengevaluasi distribusi.' },
            degFreedom: { name: 'degFreedom', detail: 'Diperlukan. Bilangan bulat yang menunjukkan angka derajat kebebasan.' },
        },
    },
    T_INV: {
        description: 'Mengembalikan inversi arah kiri dari distribusi-t Student.',
        abstract: 'Mengembalikan inversi arah kiri dari distribusi-t Student.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas terkait dengan distribusi-t Student.' },
            degFreedom: { name: 'degFreedom', detail: 'Diperlukan. Jumlah derajat kebebasan yang digunakan untuk mencirikan distribusi.' },
        },
    },
    T_INV_2T: {
        description: 'Mengembalikan inversi dua arah dari distribusi-t Student.',
        abstract: 'Mengembalikan inversi dua arah dari distribusi-t Student.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Diperlukan. Probabilitas terkait dengan distribusi-t Student.' },
            degFreedom: { name: 'degFreedom', detail: 'Diperlukan. Jumlah derajat kebebasan yang digunakan untuk mencirikan distribusi.' },
        },
    },
    T_TEST: {
        description: 'Mengembalikan probabilitas terkait Uji-t Siswa. Gunakan T.TEST untuk menentukan apakah dua sampel berasal dari dua populasi yang mendasari yang sama di mana nilai tengahnya sama.',
        abstract: 'Mengembalikan probabilitas terkait Uji-t Siswa. Gunakan T.TEST untuk menentukan apakah dua sampel berasal dari dua populasi yang mendasari yang sama di mana nilai tengahnya sama.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Diperlukan. Kumpulan data pertama.' },
            array2: { name: 'array2', detail: 'Diperlukan. Kumpulan data kedua.' },
            tails: { name: 'tails', detail: 'Diperlukan. Menentukan jumlah ekor distribusi. Jika ekor = 1, T.TEST menggunakan distribusi satu ekor. Jika ekor = 2, T.TEST menggunakan distribusi dua ekor.' },
            type: { name: 'type', detail: 'Diperlukan. Tipe Uji-t yang dilakukan.' },
        },
    },
    TREND: {
        description: 'Fungsi TREND mengembalikan nilai di sepanjang tren linear. Ini pas dengan garis lurus (menggunakan metode kuadrat paling sedikit) ke array known_y dan known_x. TREND mengembalikan nilai y di sepanjang baris tersebut untuk array new_x yang Anda tentukan.',
        abstract: 'Fungsi TREND mengembalikan nilai di sepanjang tren linear. Ini pas dengan garis lurus (menggunakan metode kuadrat paling sedikit) ke array known_y dan known_x. TREND mengembalikan nilai y di sepanjang baris tersebut untuk array new_x yang Anda tentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Kumpulan nilai y yang sudah Anda ketahui dalam hubungan y = mx + b Jika array known_y\'s berada dalam kolom tunggal, maka setiap kolom known_x\'s diinterpretasikan sebagai variabel terpisah. Jika array known_y\'s berada dalam baris tunggal, maka setiap baris known_x\'s diinterpretasikan sebagai variabel terpisah.' },
            knownXs: { name: 'known_x\'s', detail: 'Sekumpulan nilai x opsional yang mungkin sudah Anda ketahui dalam hubungan y = mx + b Array known_x\'s dapat mencakup satu atau lebih kumpulan variabel. Jika hanya satu variabel yang digunakan, known_y\'s dan known_x\'s bisa berupa rentang dalam bentuk apa pun, selama memiliki dimensi yang sama. Jika lebih dari satu variabel yang digunakan, known_y\'s harus berupa vektor (yaitu, rentang dengan tinggi satu baris atau lebar satu kolom). Jika known_x\'s dihilangkan, maka diasumsikan sebagai array {1,2,3,...} yang berukuran sama dengan known_y\'s.' },
            newXs: { name: 'new_x\'s', detail: 'Nilai-x baru yang ingin Anda gunakan untuk mengembalikan nilai-y yang terkait New_x\'s harus mencakup satu kolom (atau baris) untuk setiap variabel independen, seperti halnya known_x\'s. Jadi, jika known_y\'s berada di satu kolom, known_x\'s dan new_x\'s harus memiliki jumlah kolom yang sama. Jika known_y\'s berada di satu baris, known_x\'s dan new_x\'s harus memiliki jumlah baris yang sama. Jika Anda menghilangkan new_x\'s, akan diasumsikan sama dengan known_x\'s. Jika Anda menghilangkan kedua known_x\'s dan new_x\'s, akan dianggap sebagai array {1,2,3,...} yang berukuran sama dengan known_y\'s.' },
            constb: { name: 'const', detail: 'Nilai logika yang menentukan apakah memaksa konstanta b sama dengan 0 Jika const TRUE atau dihilangkan, b dihitung secara normal. Jika const FALSE, b diatur sama dengan 0 (nol) dan nilai-m disesuaikan sehingga y = mx.' },
        },
    },
    TRIMMEAN: {
        description: 'Mengembalikan rata-rata dari bagian dalam dari rangkaian data. TRIMMEAN menghitung rata-rata yang diambil dengan mengecualikan persentase titik data dari arah atas dan bawah suatu rangkaian data. Anda bisa menggunakan fungsi ini saat Anda ingin mengecualikan data terluar dari analisis Anda.',
        abstract: 'Mengembalikan rata-rata dari bagian dalam dari rangkaian data. TRIMMEAN menghitung rata-rata yang diambil dengan mengecualikan persentase titik data dari arah atas dan bawah suatu rangkaian data. Anda bisa menggunakan fungsi ini saat Anda ingin mengecualikan data terluar dari analisis Anda.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Diperlukan. Array atau rentang nilai yang akan dipangkas dan dihitung rata-ratanya.' },
            percent: { name: 'percent', detail: 'Diperlukan. Jumlah pecahan titik data yang akan dikecualikan dari perhitungan. Sebagai contoh, jika persen = 0,2, 4 titik dipangkas dari rangkaian data 20 titik (20 x 0,2): 2 dari atas dan 2 dari bawah rangkaian data tersebut.' },
        },
    },
    VAR_P: {
        description: 'Menghitung varians berdasarkan seluruh populasi (mengabaikan nilai logika dan teks dalam populasi).',
        abstract: 'Menghitung varians berdasarkan seluruh populasi (mengabaikan nilai logika dan teks dalam populasi).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang bersesuaian dengan populasi.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 254 terkait dengan satu populasi.' },
        },
    },
    VAR_S: {
        description: 'Memperkirakan varians berdasarkan satu sampel (mengabaikan nilai logika dan teks dalam sampel).',
        abstract: 'Memperkirakan varians berdasarkan satu sampel (mengabaikan nilai logika dan teks dalam sampel).',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Diperlukan. Argumen angka pertama yang berkaitan dengan sampel populasi.' },
            number2: { name: 'number2', detail: 'Opsional. Argumen angka 2 sampai 254 yang berkaitan dengan sampel populasi.' },
        },
    },
    VARA: {
        description: 'Memperkirakan varians berdasarkan satu sampel.',
        abstract: 'Memperkirakan varians berdasarkan satu sampel.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 diperlukan, nilai berikutnya opsional. Argumen nilai 1 sampai 255 terkait dengan satu sampel populasi.' },
            value2: { name: 'value2', detail: 'Value1 diperlukan, nilai berikutnya opsional. Argumen nilai 1 sampai 255 terkait dengan satu sampel populasi.' },
        },
    },
    VARPA: {
        description: 'Menghitung varians berdasarkan populasi keseluruhan.',
        abstract: 'Menghitung varians berdasarkan populasi keseluruhan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 diperlukan, nilai berikutnya opsional. Nilai argumen 1 sampai 255 terkait dengan satu sampel populasi.' },
            value2: { name: 'value2', detail: 'Value1 diperlukan, nilai berikutnya opsional. Nilai argumen 1 sampai 255 terkait dengan satu sampel populasi.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Mengembalikan distribusi Weilbull. Gunakan distribusi ini dalam analisis keandalan, misalnya menghitung waktu rata-rata perangkat hingga gagal.',
        abstract: 'Mengembalikan distribusi Weilbull. Gunakan distribusi ini dalam analisis keandalan, misalnya menghitung waktu rata-rata perangkat hingga gagal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Diperlukan. Nilai untuk mengevaluasi fungsi.' },
            alpha: { name: 'alpha', detail: 'Diperlukan. Parameter untuk distribusi.' },
            beta: { name: 'beta', detail: 'Diperlukan. Parameter untuk distribusi.' },
            cumulative: { name: 'cumulative', detail: 'Diperlukan. Menentukan format fungsi.' },
        },
    },
    Z_TEST: {
        description: 'Untuk melihat bagaimana Z.TEST dapat digunakan dalam rumus untuk menghitung nilai probabilitas dua-arah, lihat bagian Keterangan di bawah.',
        abstract: 'Untuk melihat bagaimana Z.TEST dapat digunakan dalam rumus untuk menghitung nilai probabilitas dua-arah, lihat bagian Keterangan di bawah.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/id-id/excel/functions/z-test-function',
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
