/**
 * Copyright 2023-present DreamNum Inc.
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

export default {
    ASC: {
        description: 'Chuyển các chữ cái hoặc ký tự Kana toàn chiều rộng (byte kép) trong một chuỗi thành ký tự nửa chiều rộng (byte đơn)',
        abstract: 'Chuyển các chữ cái hoặc ký tự Kana toàn chiều rộng (byte kép) trong một chuỗi thành ký tự nửa chiều rộng (byte đơn)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/asc-%E5%87%BD%E6%95%B0-0b6abf1c-c663-4004-a964-ebc00b723266',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Hàm ARRAYTOTEXT trả về một mảng các giá trị văn bản trong bất kỳ phạm vi nào được chỉ định.',
        abstract: 'Hàm ARRAYTOTEXT trả về một mảng các giá trị văn bản trong bất kỳ phạm vi nào được chỉ định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/arraytotext-%E5%87%BD%E6%95%B0-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BAHTTEXT: {
        description: 'Chuyển đổi số thành văn bản bằng định dạng tiền tệ Thái Baht',
        abstract: 'Chuyển đổi số thành văn bản bằng định dạng tiền tệ Thái Baht',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/bahttext-%E5%87%BD%E6%95%B0-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHAR: {
        description: 'Trả về ký tự được xác định bởi mã số',
        abstract: 'Trả về ký tự được xác định bởi mã số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/char-%E5%87%BD%E6%95%B0-bbd249c8-b36e-4a91-8017-1c133f9b837a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CLEAN: {
        description: 'Loại bỏ tất cả các ký tự không thể in được khỏi văn bản',
        abstract: 'Loại bỏ tất cả các ký tự không thể in được khỏi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/clean-%E5%87%BD%E6%95%B0-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CODE: {
        description: 'Trả về mã số của ký tự đầu tiên trong chuỗi văn bản',
        abstract: 'Trả về mã số của ký tự đầu tiên trong chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/code-%E5%87%BD%E6%95%B0-c32b692b-2ed0-4a04-bdd9-75640144b928',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONCAT: {
        description: 'Kết hợp văn bản từ nhiều vùng và/hoặc chuỗi lại với nhau, nhưng không cung cấp tham số phân tách hoặc IgnoreEmpty.',
        abstract: 'Kết hợp văn bản từ nhiều vùng và/hoặc chuỗi lại với nhau, nhưng không cung cấp tham số phân tách hoặc IgnoreEmpty',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/concat-%E5%87%BD%E6%95%B0-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2',
            },
        ],
        functionParameter: {
            text1: { name: '文本 1', detail: 'Mục văn bản đầu tiên để kết hợp. Có thể là một chuỗi hoặc một mảng chuỗi, chẳng hạn như một vùng ô.' },
            text2: { name: '文本 2', detail: 'Các mục văn bản khác để kết hợp. Có thể lên đến 253 tham số văn bản. Mỗi tham số có thể là một chuỗi hoặc một mảng chuỗi, chẳng hạn như một vùng ô.' },
        },
    },
    CONCATENATE: {
        description: 'Kết hợp nhiều mục văn bản thành một mục văn bản',
        abstract: 'Kết hợp nhiều mục văn bản thành một mục văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/concatenate-%E5%87%BD%E6%95%B0-8f8ae884-2ca8-4f7a-b093-75d702bea31d',
            },
        ],
        functionParameter: {
            text1: { name: '文本 1', detail: 'Mục đầu tiên để kết hợp. Có thể là một giá trị văn bản, một số hoặc một tham chiếu ô.' },
            text2: { name: '文本 2', detail: 'Các mục văn bản khác để kết hợp. Có thể có tối đa 255 mục, tổng cộng hỗ trợ tối đa 8,192 ký tự.' },
        },
    },
    DBCS: {
        description: 'Chuyển các chữ cái hoặc ký tự Kana nửa chiều rộng (byte đơn) trong một chuỗi thành ký tự toàn chiều rộng (byte kép)',
        abstract: 'Chuyển các chữ cái hoặc ký tự Kana nửa chiều rộng (byte đơn) trong một chuỗi thành ký tự toàn chiều rộng (byte kép)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/dbcs-%E5%87%BD%E6%95%B0-a4025e73-63d2-4958-9423-21a24794c9e5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DOLLAR: {
        description: 'Chuyển đổi số thành văn bản bằng định dạng tiền tệ Nhân dân tệ (RMB)',
        abstract: 'Chuyển đổi số thành văn bản bằng định dạng tiền tệ Nhân dân tệ (RMB)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/dollar-%E5%87%BD%E6%95%B0-a6cd05d9-9740-4ad3-a469-8109d18ff611',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXACT: {
        description: 'Kiểm tra xem hai giá trị văn bản có giống nhau hay không',
        abstract: 'Kiểm tra xem hai giá trị văn bản có giống nhau hay không',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/exact-%E5%87%BD%E6%95%B0-f24a4864-e914-4e50-8bdb-7e82048c5c44',
            },
        ],
        functionParameter: {
            text1: { name: '文本 1', detail: 'Chuỗi văn bản đầu tiên' },
            text2: { name: '文本 2', detail: 'Chuỗi văn bản thứ hai' },
        },
    },
    FIND: {
        description: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (phân biệt chữ hoa, chữ thường)',
        abstract: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (phân biệt chữ hoa, chữ thường)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/find-%E5%87%BD%E6%95%B0-dbcdf877-a93f-4d9e-a60d-b360804a3a5a',
            },
        ],
        functionParameter: {
            find_text: { name: 'find_text', detail: 'Văn bản bạn muốn tìm.' },
            within_text: { name: 'within_text', detail: 'Văn bản mà bạn muốn tìm trong đó.' },
            start_num: { name: 'start_num', detail: 'Số ký tự mà bạn muốn bắt đầu tìm kiếm.' },
        },
    },
    FIXED: {
        description: 'Làm tròn một số thành một số thập phân đã chỉ định và trả về kết quả dưới dạng văn bản với hoặc không có dấu phân tách thập phân',
        abstract: 'Làm tròn một số thành một số thập phân đã chỉ định và trả về kết quả dưới dạng văn bản với hoặc không có dấu phân tách thập phân',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/fixed-%E5%87%BD%E6%95%B0-621c3e2a-50ea-4b85-aab2-b11a7ff73369',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Số mà bạn muốn làm tròn và chuyển đổi thành văn bản.' },
            decimals: { name: 'decimals', detail: 'Số lượng chữ số ở bên phải của dấu thập phân.' },
            no_commas: { name: 'no_commas', detail: 'Giá trị logic chỉ định liệu trả về văn bản có bao gồm dấu phẩy hay không.' },
        },
    },
    LEFT: {
        description: 'Trả về một số ký tự cụ thể từ đầu của chuỗi văn bản',
        abstract: 'Trả về một số ký tự cụ thể từ đầu của chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/left-leftb-%E5%87%BD%E6%95%B0-f64f8495-4e12-49ab-803c-91e37d7e70c2',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản có chứa các ký tự bạn muốn trích xuất.' },
            num_chars: { name: 'num_chars', detail: 'Số lượng ký tự mà bạn muốn trích xuất.' },
        },
    },
    LEN: {
        description: 'Trả về số lượng ký tự trong một chuỗi văn bản',
        abstract: 'Trả về số lượng ký tự trong một chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/len-lenb-%E5%87%BD%E6%95%B0-e7dc30ca-f8b2-4a7c-8f5b-6e82a0d017ef',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản mà bạn muốn tìm số lượng ký tự.' },
        },
    },
    LOWER: {
        description: 'Chuyển đổi tất cả các chữ cái trong văn bản thành chữ thường',
        abstract: 'Chuyển đổi tất cả các chữ cái trong văn bản thành chữ thường',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/lower-%E5%87%BD%E6%95%B0-0b22ff44-f335-402b-b171-8f62a7a6d159',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Văn bản mà bạn muốn chuyển đổi thành chữ thường.' },
        },
    },
    MID: {
        description: 'Trả về một số ký tự cụ thể từ một chuỗi văn bản bắt đầu tại vị trí mà bạn chỉ định',
        abstract: 'Trả về một số ký tự cụ thể từ một chuỗi văn bản bắt đầu tại vị trí mà bạn chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mid-midb-%E5%87%BD%E6%95%B0-52757e16-38f2-4729-872c-657e3a4a7a73',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản có chứa các ký tự mà bạn muốn trích xuất.' },
            start_num: { name: 'start_num', detail: 'Vị trí của ký tự đầu tiên bạn muốn trích xuất từ ​​chuỗi văn bản.' },
            num_chars: { name: 'num_chars', detail: 'Số lượng ký tự bạn muốn trích xuất từ ​​chuỗi văn bản.' },
        },
    },
    PHONETIC: {
        description: 'Trả về chuỗi Furigana từ chuỗi văn bản',
        abstract: 'Trả về chuỗi Furigana từ chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/phonetic-%E5%87%BD%E6%95%B0-d510701f-2a90-4610-9a82-87c874aad6c6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PROPER: {
        description: 'Chuyển đổi chữ cái đầu tiên của mỗi từ trong chuỗi văn bản thành chữ hoa và tất cả các chữ cái khác thành chữ thường',
        abstract: 'Chuyển đổi chữ cái đầu tiên của mỗi từ trong chuỗi văn bản thành chữ hoa và tất cả các chữ cái khác thành chữ thường',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/proper-%E5%87%BD%E6%95%B0-f79f1eeb-bd40-43d3-8273-10362ab89da1',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản mà bạn muốn chuyển đổi chữ cái đầu tiên của mỗi từ thành chữ hoa và tất cả các chữ cái khác thành chữ thường.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Trích xuất văn bản phù hợp với biểu thức chính quy (REGEX)',
        abstract: 'Trích xuất văn bản phù hợp với biểu thức chính quy (REGEX)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/regexextract-%E5%87%BD%E6%95%B0-917b74b6-0d5c-4c7b-883e-24b39a7a20e2',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Văn bản mà bạn muốn tìm kiếm biểu thức chính quy (REGEX).' },
            regex: { name: 'regex', detail: 'Biểu thức chính quy (REGEX) bạn muốn khớp.' },
        },
    },
    REGEXMATCH: {
        description: 'Trả về giá trị đúng hoặc sai để chỉ ra xem văn bản có khớp với một biểu thức chính quy (REGEX) hay không',
        abstract: 'Trả về giá trị đúng hoặc sai để chỉ ra xem văn bản có khớp với một biểu thức chính quy (REGEX) hay không',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/regexmatch-%E5%87%BD%E6%95%B0-69e4f84a-0f8c-4ff0-92a4-41e6d3ad960d',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Văn bản mà bạn muốn tìm kiếm biểu thức chính quy (REGEX).' },
            regex: { name: 'regex', detail: 'Biểu thức chính quy (REGEX) bạn muốn khớp.' },
        },
    },
    REGEXREPLACE: {
        description: 'Thay thế một phần văn bản khớp với biểu thức chính quy (REGEX)',
        abstract: 'Thay thế một phần văn bản khớp với biểu thức chính quy (REGEX)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/regexreplace-%E5%87%BD%E6%95%B0-e6108146-9ba1-4b3d-a5f2-f3b9a8618f8d',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Văn bản mà bạn muốn thay thế biểu thức chính quy (REGEX).' },
            regex: { name: 'regex', detail: 'Biểu thức chính quy (REGEX) bạn muốn thay thế.' },
            replacement: { name: 'replacement', detail: 'Văn bản thay thế.' },
        },
    },
    REPLACE: {
        description: 'Thay thế một phần của chuỗi văn bản bằng một chuỗi văn bản khác',
        abstract: 'Thay thế một phần của chuỗi văn bản bằng một chuỗi văn bản khác',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/replace-replaceb-%E5%87%BD%E6%95%B0-86e5e09d-1401-41a8-890b-8e692f1f46e5',
            },
        ],
        functionParameter: {
            old_text: { name: 'old_text', detail: 'Văn bản bạn muốn thay thế một phần của nó.' },
            start_num: { name: 'start_num', detail: 'Vị trí của ký tự đầu tiên bạn muốn thay thế trong văn bản.' },
            num_chars: { name: 'num_chars', detail: 'Số lượng ký tự bạn muốn thay thế.' },
            new_text: { name: 'new_text', detail: 'Văn bản thay thế.' },
        },
    },
    REPT: {
        description: 'Lặp lại một chuỗi văn bản một số lần đã chỉ định',
        abstract: 'Lặp lại một chuỗi văn bản một số lần đã chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rept-%E5%87%BD%E6%95%B0-e109c0d0-487e-4f88-91eb-8a41d0d6a179',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản bạn muốn lặp lại.' },
            number_times: { name: 'number_times', detail: 'Số lần bạn muốn lặp lại văn bản.' },
        },
    },
    RIGHT: {
        description: 'Trả về một số ký tự cụ thể từ cuối của chuỗi văn bản',
        abstract: 'Trả về một số ký tự cụ thể từ cuối của chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/right-rightb-%E5%87%BD%E6%95%B0-8b679d3f-2c2d-46b7-9071-45c8836a1dbd',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản có chứa các ký tự bạn muốn trích xuất.' },
            num_chars: { name: 'num_chars', detail: 'Số lượng ký tự mà bạn muốn trích xuất.' },
        },
    },
    SEARCH: {
        description: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (không phân biệt chữ hoa, chữ thường)',
        abstract: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (không phân biệt chữ hoa, chữ thường)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/search-searchb-%E5%87%BD%E6%95%B0-dfb12d6f-c60d-4a40-b090-7d2617b49e11',
            },
        ],
        functionParameter: {
            find_text: { name: 'find_text', detail: 'Văn bản bạn muốn tìm.' },
            within_text: { name: 'within_text', detail: 'Văn bản mà bạn muốn tìm trong đó.' },
            start_num: { name: 'start_num', detail: 'Số ký tự mà bạn muốn bắt đầu tìm kiếm.' },
        },
    },
    SPLIT: {
        description: 'Chia một chuỗi văn bản thành một bảng con',
        abstract: 'Chia một chuỗi văn bản thành một bảng con',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/split-%E5%87%BD%E6%95%B0-4357fb3e-7256-49ca-8711-94dbbcbe87c9',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản mà bạn muốn chia thành các phần tử bảng con.' },
            delimiter: { name: 'delimiter', detail: 'Ký tự hoặc chuỗi ký tự mà bạn muốn sử dụng làm dấu phân cách.' },
            split_by_each: { name: 'split_by_each', detail: 'Giá trị logic để chỉ định liệu chia chuỗi bằng từng ký tự trong dấu phân cách.' },
            remove_empty_text: { name: 'remove_empty_text', detail: 'Giá trị logic để chỉ định liệu xóa các chuỗi trống khỏi các kết quả phân chia.' },
        },
    },
    SUBSTITUTE: {
        description: 'Thay thế một hoặc tất cả các lần xuất hiện của một chuỗi văn bản trong một chuỗi văn bản khác',
        abstract: 'Thay thế một hoặc tất cả các lần xuất hiện của một chuỗi văn bản trong một chuỗi văn bản khác',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/substitute-%E5%87%BD%E6%95%B0-6434944f-6f07-4437-8818-68a6a1a08747',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản ban đầu.' },
            old_text: { name: 'old_text', detail: 'Văn bản bạn muốn thay thế.' },
            new_text: { name: 'new_text', detail: 'Văn bản thay thế.' },
            instance_num: { name: 'instance_num', detail: 'Số lần xuất hiện của old_text mà bạn muốn thay thế.' },
        },
    },
    TEXTJOIN: {
        description: 'Kết hợp nhiều chuỗi văn bản thành một chuỗi, với dấu phân cách giữa các phần tử',
        abstract: 'Kết hợp nhiều chuỗi văn bản thành một chuỗi, với dấu phân cách giữa các phần tử',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/textjoin-%E5%87%BD%E6%95%B0-c50e06da-9c72-4cae-a5a3-1e6d42bd43e1',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'Dấu phân cách để sử dụng giữa các văn bản.' },
            ignore_empty: { name: 'ignore_empty', detail: 'Giá trị logic để chỉ định liệu bỏ qua các ô trống.' },
            text1: { name: 'text1', detail: 'Chuỗi văn bản đầu tiên để kết hợp.' },
            text2: { name: 'text2', detail: 'Chuỗi văn bản tiếp theo để kết hợp.' },
        },
    },
    TRIM: {
        description: 'Loại bỏ tất cả các khoảng trắng khỏi chuỗi văn bản ngoại trừ các khoảng trắng đơn giữa các từ',
        abstract: 'Loại bỏ tất cả các khoảng trắng khỏi chuỗi văn bản ngoại trừ các khoảng trắng đơn giữa các từ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/trim-%E5%87%BD%E6%95%B0-410388fa-c5df-49c6-b16c-9e5630b479d0',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản mà bạn muốn loại bỏ các khoảng trắng.' },
        },
    },
    UNICHAR: {
        description: 'Trả về ký tự Unicode tương ứng với một số đã chỉ định',
        abstract: 'Trả về ký tự Unicode tương ứng với một số đã chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/unichar-%E5%87%BD%E6%95%B0-e7ffb741-824c-4e7c-bec7-59ac8ae8e43f',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Số Unicode đại diện cho ký tự.' },
        },
    },
    UNICODE: {
        description: 'Trả về số Unicode tương ứng với ký tự đầu tiên của văn bản',
        abstract: 'Trả về số Unicode tương ứng với ký tự đầu tiên của văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/unicode-%E5%87%BD%E6%95%B0-4f8d3512-f0e5-4222-8586-f467c93b3d9a',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản đại diện cho ký tự Unicode.' },
        },
    },
    UPPER: {
        description: 'Chuyển đổi tất cả các chữ cái trong văn bản thành chữ hoa',
        abstract: 'Chuyển đổi tất cả các chữ cái trong văn bản thành chữ hoa',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/upper-%E5%87%BD%E6%95%B0-8a57ae40-4fa5-4754-a65b-9b6745c4a5f0',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Văn bản mà bạn muốn chuyển đổi thành chữ hoa.' },
        },
    },
    VALUE: {
        description: 'Chuyển đổi chuỗi văn bản thành số',
        abstract: 'Chuyển đổi chuỗi văn bản thành số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/value-%E5%87%BD%E6%95%B0-d49bc6c1-c29b-44db-927b-11e7c34dd6ea',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản mà bạn muốn chuyển đổi thành số.' },
        },
    },
};
