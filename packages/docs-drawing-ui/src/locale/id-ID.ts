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
    'docs-drawing-ui': {
        title: 'Gambar',
        upload: {
            float: 'Sisipkan Gambar',
        },
        shape: {
            insert: {
                title: 'Sisipkan Bentuk',
                rectangle: 'Sisipkan Persegi Panjang',
                ellipse: 'Sisipkan Elips',
            },
        },
        panel: {
            title: 'Edit Gambar',
        },
        'image-popup': {
            replace: 'Ganti',
            delete: 'Hapus',
            edit: 'Edit',
            crop: 'Pangkas',
            reset: 'Atur Ulang Ukuran',
        },
        'image-text-wrap': {
            title: 'Pembungkus Teks',
            wrappingStyle: 'Gaya Pembungkus',
            square: 'Kotak',
            topAndBottom: 'Atas dan Bawah',
            inline: 'Sejajar dengan teks',
            behindText: 'Di belakang teks',
            inFrontText: 'Di depan teks',
            wrapText: 'Bungkus teks',
            bothSide: 'Kedua sisi',
            leftOnly: 'Kiri saja',
            rightOnly: 'Kanan saja',
            distanceFromText: 'Jarak dari teks',
            top: 'Atas(px)',
            left: 'Kiri(px)',
            bottom: 'Bawah(px)',
            right: 'Kanan(px)',
        },
        'image-position': {
            title: 'Posisi',
            horizontal: 'Horizontal',
            vertical: 'Vertikal',
            absolutePosition: 'Posisi Absolut(px)',
            relativePosition: 'Posisi Relatif',
            toTheRightOf: 'di sebelah kanan',
            relativeTo: 'relatif terhadap',
            bellow: 'di bawah',
            options: 'Opsi',
            moveObjectWithText: 'Pindahkan objek dengan teks',
            column: 'Kolom',
            margin: 'Margin',
            page: 'Halaman',
            line: 'Baris',
            paragraph: 'Paragraf',
        },
        'update-status': {
            exceedMaxSize: 'Ukuran gambar melebihi batas, batasnya adalah {0}M',
            invalidImageType: 'Jenis gambar tidak valid',
            exceedMaxCount: 'Hanya {0} gambar yang dapat diunggah dalam satu waktu',
            invalidImage: 'Gambar tidak valid',
        },
        shortcut: {
            'drawing-view': 'Tampilan Gambar',
            'drawing-move-down': 'Pindahkan Gambar ke Bawah',
            'drawing-move-up': 'Pindahkan Gambar ke Atas',
            'drawing-move-left': 'Pindahkan Gambar ke Kiri',
            'drawing-move-right': 'Pindahkan Gambar ke Kanan',
            'drawing-delete': 'Hapus Gambar',
        },
    },
};

export default locale;
