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
    'drawing-ui': {
        'image-cropper': {
            error: 'Tidak dapat memangkas objek non-gambar.',
        },
        objectListPanel: {
            title: 'Objek',
            empty: 'Tidak ada objek',
            showAll: 'Tampilkan semua',
            hideAll: 'Sembunyikan semua',
            moveForward: 'Bawa ke depan',
            moveBackward: 'Kirim ke belakang',
            close: 'Tutup',
            show: 'Tampilkan',
            hide: 'Sembunyikan',
            lock: 'Kunci',
            unlock: 'Buka kunci',
            name: 'Nama',
            nameInput: 'Nama objek',
            description: 'Deskripsi',
            descriptionPlaceholder: 'Tambahkan deskripsi',
            details: 'Detail',
            locate: 'Temukan',
            expand: 'Bentangkan',
            collapse: 'Ciutkan',
            dragToReorder: 'Seret untuk mengurutkan',
            search: 'Cari objek',
            filterAll: 'Semua',
            filterHidden: 'Tersembunyi',
            filterLocked: 'Terkunci',
            sectionCanvas: 'Lapisan kanvas',
            sectionFloating: 'Lapisan mengambang',
            typeNames: {
                object: 'Objek',
                shape: 'Bentuk',
                connector: 'Konektor',
                image: 'Gambar',
                chart: 'Bagan',
                table: 'Tabel',
                smartArt: 'SmartArt',
                video: 'Video',
                group: 'Grup',
                unit: 'Unit',
                dom: 'DOM',
                text: 'Teks',
                placeholder: 'Placeholder',
                container: 'Kontainer',
            },
            noSelection: 'Pilih objek untuk mengedit detailnya',
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
                rotate: 'Putar (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Lebar (px)',
                height: 'Tinggi (px)',
                lock: 'Kunci Rasio (%)',
            },
            crop: {
                title: 'Pangkas',
                start: 'Mulai Pangkas',
                mode: 'Bebas',
            },
            group: {
                title: 'Grup',
                group: 'Grupkan',
                unGroup: 'Pisahkan Grup',
            },
            align: {
                title: 'Ratakan',
                default: 'Pilih Jenis Perataan',
                left: 'Rata Kiri',
                center: 'Rata Tengah',
                right: 'Rata Kanan',
                top: 'Rata Atas',
                middle: 'Rata Tengah',
                bottom: 'Rata Bawah',
                horizon: 'Distribusikan Secara Horizontal',
                vertical: 'Distribusikan Secara Vertikal',
            },
            null: 'Tidak Ada Objek yang Dipilih',
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
        'image-popup': {
            replace: 'Ganti',
            delete: 'Hapus',
            edit: 'Edit',
            crop: 'Pangkas',
            reset: 'Atur Ulang Ukuran',
        },
    },
};

export default locale;
