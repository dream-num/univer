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
    ENCODEURL: {
        description: 'Fungsi ENCODEURL mengembalikan string berkode URL, mengganti karakter non-alfanumerik tertentu dengan simbol persentase (%) dan angka heksadesimal.',
        abstract: 'Fungsi ENCODEURL mengembalikan string berkode URL, mengganti karakter non-alfanumerik tertentu dengan simbol persentase (%) dan angka heksadesimal.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'String yang akan dikodekan dengan URL' },
        },
    },
    FILTERXML: {
        description: 'Fungsi FILTERXML mengembalikan data tertentu dari konten XML menggunakan xpath yang ditentukan.',
        abstract: 'Fungsi FILTERXML mengembalikan data tertentu dari konten XML menggunakan xpath yang ditentukan.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'String dalam format XML yang valid.' },
            xpath: { name: 'xpath', detail: 'String dalam format XPath standar.' },
        },
    },
    WEBSERVICE: {
        description: 'Fungsi WEBSERVICE mengembalikan data dari layanan web di Internet atau Intranet.',
        abstract: 'Fungsi WEBSERVICE mengembalikan data dari layanan web di Internet atau Intranet.',
        links: [
            {
                title: 'Petunjuk',
                url: 'https://support.microsoft.com/id-id/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'URL layanan web.' },
        },
    },
};

export default locale;
