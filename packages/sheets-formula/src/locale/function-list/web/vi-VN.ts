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
        description: 'Hàm ENCODEURL trả về một chuỗi được mã hóa URL, thay thế một số ký tự không phải là chữ và số bằng ký hiệu phần trăm (%) và một số thập lục phân.',
        abstract: 'Hàm ENCODEURL trả về một chuỗi được mã hóa URL, thay thế một số ký tự không phải là chữ và số bằng ký hiệu phần trăm (%) và một số thập lục phân.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'văn bản', detail: 'Một chuỗi cần mã hóa URL' },
        },
    },
    FILTERXML: {
        description: 'Hàm FILTERXML trả về dữ liệu cụ thể từ nội dung XML bằng cách sử dụng xpath đã xác định.',
        abstract: 'Hàm FILTERXML trả về dữ liệu cụ thể từ nội dung XML bằng cách sử dụng xpath đã xác định.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Một chuỗi ở định dạng XML hợp lệ.' },
            xpath: { name: 'xpath', detail: 'Một chuỗi ở định dạng XPath chuẩn.' },
        },
    },
    WEBSERVICE: {
        description: 'Hàm WEBSERVICE trả về dữ liệu từ một dịch vụ web trên Internet hoặc Intranet.',
        abstract: 'Hàm WEBSERVICE trả về dữ liệu từ một dịch vụ web trên Internet hoặc Intranet.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'URL của dịch vụ web.' },
        },
    },
};

export default locale;
