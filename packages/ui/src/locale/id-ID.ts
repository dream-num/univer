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
import emojiLocale from './emoji-locale/id-ID.generated';

const locale: typeof enUS = {
    ui: {
        emojiPicker: {
            search: 'Cari',
            random: 'Emoji acak',
            recents: 'Terbaru',
            emojis: 'Emoji',
            animals: 'Hewan',
            food: 'Makanan',
            activities: 'Aktivitas',
            places: 'Tempat',
            objects: 'Objek',
            symbols: 'Simbol',
            searchResults: 'Hasil pencarian',
            noResults: 'Emoji tidak ditemukan',
            ...emojiLocale,
        },
        toolbar: {
            heading: {
                normal: 'Normal',
                title: 'Judul',
                subTitle: 'Sub Judul',
                1: 'Judul 1',
                2: 'Judul 2',
                3: 'Judul 3',
                4: 'Judul 4',
                5: 'Judul 5',
                6: 'Judul 6',
                tooltip: 'Atur Judul',
            },
        },
        ribbon: {
            start: 'Mulai',
            startDesc: 'Inisiasi lembar kerja dan atur parameter dasar.',
            insert: 'Sisipkan',
            insertDesc: 'Sisipkan baris, kolom, grafik, dan berbagai elemen lainnya.',
            formulas: 'Rumus',
            formulasDesc: 'Gunakan fungsi dan rumus untuk perhitungan data.',
            data: 'Data',
            dataDesc: 'Kelola data, termasuk impor, pengurutan, dan penyaringan.',
            view: 'Tampilan',
            viewDesc: 'Ganti mode tampilan dan sesuaikan efek tampilan.',
            others: 'Lainnya',
            othersDesc: 'Fungsi dan pengaturan lainnya.',
            more: 'Lebih Banyak',
        },
        fontFamily: {
            'not-supported': 'Font tidak ditemukan di sistem, menggunakan font default.',
            arial: 'Arial',
            'times-new-roman': 'Times New Roman',
            tahoma: 'Tahoma',
            verdana: 'Verdana',
            'microsoft-yahei': 'Microsoft YaHei',
            simsun: 'SimSun',
            simhei: 'SimHei',
            kaiti: 'Kaiti',
            fangsong: 'FangSong',
            nsimsun: 'NSimSun',
            stxinwei: 'STXinwei',
            stxingkai: 'STXingkai',
            stliti: 'STLiti',
        },
        'shortcut-panel': {
            title: 'Pintasan',
        },
        shortcut: {
            undo: 'Batalkan',
            redo: 'Ulangi',
            cut: 'Potong',
            copy: 'Salin',
            paste: 'Tempel',
            'shortcut-panel': 'Alihkan Panel Pintasan',
        },
        'common-edit': 'Pintasan Edit Umum',
        'toggle-shortcut-panel': 'Alihkan Panel Pintasan',
        navigation: {
            back: 'Kembali',
            previous: 'Sebelumnya',
            next: 'Berikutnya',
        },
        sidebar: {
            panel: 'Panel samping',
            resize: 'Ubah ukuran panel samping',
            close: 'Tutup panel samping',
        },
        beforeClose: {
            title: 'Beberapa perubahan belum disimpan',
        },
        clipboard: {
            authentication: {
                title: 'Izin Ditolak',
                content: 'Izinkan Univer untuk mengakses clipboard Anda.',
            },
        },
        textEditor: {
            formulaError: 'Masukkan rumus yang valid, seperti =SUM(A1)',
            rangeError: 'Masukkan rentang yang valid, seperti A1:B10',
        },
        rangeSelector: {
            title: 'Pilih rentang data',
            addAnotherRange: 'Tambah rentang',
            buttonTooltip: 'Pilih rentang data',
            placeHolder: 'Pilih rentang atau ketik.',
            confirm: 'Konfirmasi',
            cancel: 'Batal',
        },
        'global-shortcut': 'Pintasan Global',
        'zoom-slider': {
            resetTo: 'Atur ulang ke',
        },
        row: 'Baris',
        column: 'Kolom',
    },
};

export default locale;
