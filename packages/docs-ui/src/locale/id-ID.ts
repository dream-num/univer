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
    'docs-ui': {
        toolbar: {
            undo: 'Batalkan',
            redo: 'Ulangi',
            font: 'Font',
            fontSize: 'Ukuran font',
            bold: 'Tebal',
            italic: 'Miring',
            strikethrough: 'Coret',
            subscript: 'Subskrip',
            superscript: 'Superskrip',
            underline: 'Garis bawah',
            textColor: {
                main: 'Warna teks',
            },
            fillColor: {
                main: 'Warna latar teks',
            },
            table: {
                main: 'Tabel',
                insert: 'Sisipkan Tabel',
                colCount: 'Jumlah kolom',
                rowCount: 'Jumlah baris',
            },
            resetColor: 'Atur Ulang',
            order: 'Daftar berurut',
            unorder: 'Daftar tak berurut',
            checklist: 'Daftar tugas',
            documentFlavor: 'Mode Modern',
            alignLeft: 'Rata Kiri',
            alignCenter: 'Rata Tengah',
            alignRight: 'Rata Kanan',
            alignJustify: 'Rata Kanan Kiri',
            horizontalLine: 'Garis horizontal',
            headerFooter: 'Header & Footer',
            pageSetup: 'Pengaturan Halaman',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                leading1: 'Heading 1',
                leading2: 'Heading 2',
                leading3: 'Heading 3',
                leading4: 'Heading 4',
                leading5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
        },
        table: {
            insert: 'Sisipkan',
            insertRowAbove: 'Sisipkan baris di atas',
            insertRowBelow: 'Sisipkan baris di bawah',
            insertColumnLeft: 'Sisipkan kolom di kiri',
            insertColumnRight: 'Sisipkan kolom di kanan',
            delete: 'Hapus tabel',
            deleteRows: 'Hapus baris',
            deleteColumns: 'Hapus kolom',
            deleteTable: 'Hapus tabel',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'Header',
            footer: 'Footer',
            panel: 'Pengaturan Header & Footer',
            firstPageCheckBox: 'Halaman pertama berbeda',
            oddEvenCheckBox: 'Halaman ganjil dan genap berbeda',
            headerTopMargin: 'Margin atas header(px)',
            footerBottomMargin: 'Margin bawah footer(px)',
            closeHeaderFooter: 'Tutup header & footer',
            disableText: 'Pengaturan header & footer dinonaktifkan',
        },
        placeholder: {
            heading1: 'Judul 1',
            heading2: 'Judul 2',
            heading3: 'Judul 3',
            heading4: 'Judul 4',
            heading5: 'Judul 5',
            normalText: 'Ketik teks atau tekan "/" untuk perintah',
            listItem: 'Item',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Seret blok',
            },

            menu: {
                paragraphSetting: 'Pengaturan Paragraf',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Pengaturan Paragraf',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: 'Perataan',
                indentation: 'Indentasi',
                left: 'Kiri',
                right: 'Kanan',
                firstLine: 'Baris Pertama',
                hanging: 'Menggantung',
                spacing: 'Spasi',
                before: 'Sebelum',
                after: 'Sesudah',
                lineSpace: 'Spasi Baris',
                multiSpace: 'Spasi Ganda',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Nilai Tetap(px)',
            },
            sectionSetting: {
                selectedSections: '{0} sections selected',
                columnCount: 'Column count',
                columnGap: 'Column gap',
                columnSeparator: 'Separator',
                none: 'None',
                betweenColumns: 'Between columns',
                sectionStart: 'Section start',
                unspecified: 'Unspecified',
                continuous: 'Continuous',
                nextPage: 'Next page',
                evenPage: 'Even page',
                oddPage: 'Odd page',
            },
        },
        rightClick: {
            copy: 'Salin',
            cut: 'Potong',
            paste: 'Tempel',
            delete: 'Hapus',
            bulletList: 'Daftar poin',
            orderList: 'Daftar berurut',
            checkList: 'Daftar tugas',
            insertBellow: 'Sisipkan di bawah',
        },
        paragraphMenu: {
            alignAndIndent: 'Perataan dan inden',
            align: 'Perataan',
            indent: 'Inden',
            color: 'Warna',
            increase: 'Tambah',
            decrease: 'Kurangi',
            increaseIndent: 'Tambah inden',
            decreaseIndent: 'Kurangi inden',
            defaultTextColor: 'Warna teks default',
            noBackground: 'Tanpa latar belakang',
        },
        'page-settings': {
            'document-setting': 'Pengaturan Dokumen',
            mode: 'Mode',
            'modern-mode': 'Modern',
            'classic-mode': 'Klasik',
            'modern-width': 'Lebar konten',
            'modern-width-narrow': 'Sempit',
            'modern-width-medium': 'Sedang',
            'modern-width-wide': 'Lebar',
            'paper-size': 'Ukuran kertas',
            'page-size': {
                main: 'Ukuran kertas',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Letter',
                legal: 'Legal',
                tabloid: 'Tabloid',
                statement: 'Statement',
                executive: 'Executive',
                folio: 'Folio',
            },
            orientation: 'Orientasi',
            portrait: 'Potret',
            landscape: 'Lanskap',
            'custom-paper-size': 'Ukuran kertas kustom',
            top: 'Atas',
            bottom: 'Bawah',
            left: 'Kiri',
            right: 'Kanan',
            cancel: 'Batal',
            confirm: 'Konfirmasi',
        },
    },
};

export default locale;
