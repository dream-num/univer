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
    'docs-hyper-link-ui': {
        edit: {
            confirm: 'Konfirmasi',
            cancel: 'Batal',
            title: 'Tautan',
            address: 'Tautan',
            placeholder: 'Silakan masukkan URL tautan',
            addressError: 'URL tidak valid!',
            label: 'Label',
            labelError: 'Silakan masukkan label tautan',
        },
        info: {
            copy: 'Salin',
            edit: 'Edit',
            cancel: 'Batalkan tautan',
            coped: 'Tautan disalin ke clipboard',
        },
        menu: {
            tooltip: 'Tambah tautan',
        },
    },
};

export default locale;
