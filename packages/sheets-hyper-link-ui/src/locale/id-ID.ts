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
    'sheets-hyper-link-ui': {
        form: {
            editTitle: 'Edit Tautan',
            addTitle: 'Sisipkan Tautan',
            label: 'Label',
            type: 'Tipe',
            link: 'Tautan',
            linkPlaceholder: 'Masukkan tautan',
            range: 'Rentang',
            worksheet: 'Lembar Kerja',
            definedName: 'Nama yang Ditentukan',
            ok: 'Konfirmasi',
            cancel: 'Batal',
            labelPlaceholder: 'Masukkan label',
            inputError: 'Silakan masukkan',
            selectError: 'Silakan pilih',
            linkError: 'Silakan masukkan tautan yang valid',
        },
        menu: {
            add: 'Sisipkan Tautan',
        },
        permission: {
            hyperLinkErr: 'Anda tidak memiliki izin untuk menyisipkan tautan.',
        },
        message: {
            noSheet: 'Lembar target telah dihapus',
            refError: 'Rentang Tidak Valid',
            hiddenSheet: 'Tidak dapat membuka tautan karena lembar yang ditautkan tersembunyi',
            coped: 'Tautan disalin ke clipboard',
        },
        popup: {
            copy: 'Salin Tautan',
            edit: 'Edit Tautan',
            cancel: 'Batalkan Tautan',
        },
    },
};

export default locale;
