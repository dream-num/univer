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
    'sheets-data-validation-ui': {
        title: 'Validasi data',
        ribbon: {
            setCheckbox: 'Atur Kotak Centang',
            clearCheckbox: 'Hapus Kotak Centang',
            dropdownPresetTitle: 'Terapkan preset:',
            editDropdown: 'Edit opsi',
            clearDropdown: 'Hapus Dropdown',
            dateTime: 'Tanggal dan waktu',
            presets: {
                yes: 'Ya',
                no: 'Tidak',
                notStarted: 'Belum Dimulai',
                inProgress: 'Sedang Berlangsung',
                completed: 'Selesai',
                option1: 'Opsi 1',
                option2: 'Opsi 2',
            },
        },
        operators: {
            legal: 'tipe yang sah',
        },
        validFail: {
            formulaError: 'Rentang referensi berisi data yang tidak terlihat, harap sesuaikan rentangnya',
        },
        panel: {
            title: 'Manajemen validasi data',
            addTitle: 'Buat validasi data baru',
            removeAll: 'Hapus Semua',
            add: 'Tambah Aturan',
            range: 'Rentang',
            type: 'Jenis',
            options: 'Opsi lanjutan',
            operator: 'Operator',
            removeRule: 'Hapus',
            done: 'Selesai',
            formulaPlaceholder: 'Harap masukkan nilai atau rumus',
            valuePlaceholder: 'Harap masukkan nilai',
            formulaAnd: 'dan',
            invalid: 'Tidak valid',
            showWarning: 'Tampilkan peringatan',
            rejectInput: 'Tolak input',
            messageInfo: 'Pesan bantuan',
            showInfo: 'Tampilkan teks bantuan untuk sel yang dipilih',
            rangeError: 'Rentang tidak sah',
            allowBlank: 'Izinkan nilai kosong',
        },
        date: {
            title: 'Tanggal',
        },
        list: {
            title: 'Dropdown',
            add: 'Tambah',
            options: 'Opsi',
            customOptions: 'Kustom',
            refOptions: 'Dari rentang',
            edit: 'Edit',
        },
        checkbox: {
            title: 'Kotak centang',
            tips: 'Gunakan nilai kustom dalam sel',
            checked: 'Nilai terpilih',
            unchecked: 'Nilai tidak terpilih',
        },
        alert: {
            title: 'Kesalahan',
            ok: 'OK',
        },
        error: {
            title: 'Tidak valid:',
        },
        renderMode: {
            arrow: 'Panah',
            chip: 'Chip',
            text: 'Teks biasa',
            label: 'Gaya tampilan',
        },
        showTime: {
            label: 'Tampilkan TimePicker',
        },
        permission: {
            dialog: {
                setStyleErr: 'Rentang ini dilindungi, dan Anda tidak memiliki izin untuk mengatur gaya. Untuk mengatur gaya, silakan hubungi pembuatnya.',
            },
        },
    },
};

export default locale;
