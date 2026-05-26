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
    'thread-comment-ui': {
        panel: {
            title: 'Manajemen Komentar',
            empty: 'Belum ada komentar',
            filterEmpty: 'Tidak ada hasil yang cocok',
            reset: 'Atur Ulang Filter',
            addComment: 'Tambah Komentar',
            solved: 'Terselesaikan',
        },
        editor: {
            placeholder: 'Balas atau tambahkan orang lain dengan @',
            reply: 'Komentar',
            cancel: 'Batal',
            save: 'Simpan',
        },
        item: {
            edit: 'Edit',
            delete: 'Hapus Komentar Ini',
        },
        filter: {
            sheet: {
                all: 'Semua lembar',
                current: 'Lembar saat ini',
            },
            status: {
                all: 'Semua komentar',
                resolved: 'Terselesaikan',
                unsolved: 'Belum terselesaikan',
                concernMe: 'Yang menyangkut saya',
            },
        },
    },
};

export default locale;
