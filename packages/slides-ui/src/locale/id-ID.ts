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
    'slides-ui': {
        append: 'Tambah Slide',

        text: {
            insert: {
                title: 'Sisipkan Teks',
            },
        },

        shape: {
            insert: {
                title: 'Sisipkan Bentuk',
                rectangle: 'Sisipkan Persegi Panjang',
                ellipse: 'Sisipkan Elips',
            },
        },

        image: {
            insert: {
                title: 'Sisipkan Gambar',
                float: 'Sisipkan Gambar Mengambang',
            },
        },

        popup: {
            edit: 'Edit',
            delete: 'Hapus',
        },

        sidebar: {
            text: 'Edit Teks',
            shape: 'Edit Bentuk',
            image: 'Edit Gambar',
        },

        'image-panel': {
            arrange: {
                title: 'Atur',
                forward: 'Bawa ke Depan',
                backward: 'Kirim ke Belakang',
                front: 'Bawa ke Paling Depan',
                back: 'Kirim ke Paling Belakang',
            },
            transform: {
                title: 'Transformasi',
                width: 'Lebar (px)',
                height: 'Tinggi (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: 'Putar (°)',
            },
        },
        panel: {
            fill: {
                title: 'Warna Isi',
            },
        },
    },
};

export default locale;
