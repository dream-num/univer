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
    design: {
        Accessibility: {
            closeBadge: 'Tutup lencana',
            imageGallery: 'Galeri gambar',
            image: 'Gambar {0} dari {1}',
            zoomIn: 'Perbesar',
            zoomOut: 'Perkecil',
            resetZoom: 'Atur ulang zoom',
            increment: 'Tambah',
            decrement: 'Kurangi',
        },
        Confirm: {
            cancel: 'Batal',
            confirm: 'OK',
        },
        CascaderList: {
            empty: 'Tidak ada',
        },
        Calendar: {
            year: '',
            weekDays: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
            months: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'Mei',
                'Jun',
                'Jul',
                'Agu',
                'Sep',
                'Okt',
                'Nov',
                'Des',
            ],
            ariaLabels: {
                previousMonth: 'Bulan sebelumnya',
                nextMonth: 'Bulan berikutnya',
                selectYear: 'Pilih tahun',
                selectMonth: 'Pilih bulan',
            },
        },
        Select: {
            empty: 'Tidak ada',
        },
        ColorPicker: {
            more: 'Warna Lainnya',
            cancel: 'Batal',
            confirm: 'OK',
        },
        GradientColorPicker: {
            linear: 'Linear',
            radial: 'Radial',
            angular: 'Angular',
            diamond: 'Berlian',
            offset: 'Offset',
            angle: 'Sudut',
            flip: 'Balik',
            delete: 'Hapus',
            transparency: 'Transparansi',
        },
    },
};

export default locale;
