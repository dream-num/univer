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
    CELL: {
        description: 'Hàm CELL trả về thông tin về định dạng, vị trí hay nội dung của một ô.',
        abstract: 'Hàm CELL trả về thông tin về định dạng, vị trí hay nội dung của một ô.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'Kiểu thông tin', detail: 'Giá trị văn bản xác định bạn muốn trả về kiểu thông tin ô nào.' },
            reference: { name: 'Trích dẫn', detail: 'Ô mà bạn muốn có thông tin.' },
        },
    },
    ERROR_TYPE: {
        description: 'Trả về số tương ứng với loại lỗi',
        abstract: 'Trả về số tương ứng với loại lỗi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'Giá trị lỗi', detail: 'Giá trị lỗi có số nhận dạng mà bạn muốn tìm.' },
        },
    },
    INFO: {
        description: 'Trả về thông tin về môi trường điều hành hiện thời.',
        abstract: 'Trả về thông tin về môi trường điều hành hiện thời.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Type_text', detail: 'Yêu cầu. Văn bản chỉ rõ kiểu thông tin bạn muốn được trả về.' },
        },
    },
    ISBETWEEN: {
        description: 'Kiểm tra xem một số đã cho có nằm giữa hai số khác (lớn hơn hoặc bằng giới hạn dưới và nhỏ hơn hoặc bằng giới hạn trên; hoặc lớn hơn giới hạn dưới và nhỏ hơn giới hạn trên) hay không.',
        abstract: 'Kiểm tra xem một số đã cho có nằm giữa hai số khác (lớn hơn hoặc bằng giới hạn dưới và nhỏ hơn hoặc bằng giới hạn trên; hoặc lớn hơn giới hạn dưới và nhỏ hơn giới hạn trên) hay không.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/10538337?hl=vi',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'giá_trị_muốn_so_sánh', detail: 'Giá trị muốn kiểm tra khi nằm trong khoảng từ `giới_hạn_dưới` đến `giới_hạn_trên`.' },
            lowerValue: { name: 'giới_hạn_dưới', detail: 'Cận dưới của miền giá trị mà `giá_trị_muốn_so_sánh` có thể thuộc miền đó.' },
            upperValue: { name: 'giới_hạn_trên', detail: 'Cận trên của miền giá trị mà `giá_trị_muốn_so_sánh` có thể thuộc miền đó.' },
            lowerValueIsInclusive: { name: 'bao_gồm_cả_giới_hạn_dưới', detail: 'Liệu miền giá trị có bao gồm `giới_hạn_trên` hay không. Theo mặc định, hàm sẽ trả về TRUE' },
            upperValueIsInclusive: { name: 'bao_gồm_cả_giới_hạn_trên', detail: 'Liệu miền giá trị có bao gồm `giới_hạn_trên` hay không. Theo mặc định, hàm sẽ trả về TRUE' },
        },
    },
    ISBLANK: {
        description: 'Trả về TRUE nếu giá trị trống',
        abstract: 'Trả về TRUE nếu giá trị trống',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISDATE: {
        description: 'Hàm ISDATE xác định xem một giá trị có phải là ngày không.',
        abstract: 'Hàm ISDATE xác định xem một giá trị có phải là ngày không.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/9061381?hl=vi',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị cần xác minh có phải là một ngày hay không.' },
        },
    },
    ISEMAIL: {
        description: 'Để kiểm tra xem một giá trị có phải là địa chỉ email hợp lệ hay không, hãy sử dụng hàm ISEMAIL. Hàm này kiểm tra xem giá trị có tuân theo định dạng thường được chấp nhận cho địa chỉ email hay không nhưng không xác minh sự tồn tại của địa chỉ đó.',
        abstract: 'Để kiểm tra xem một giá trị có phải là địa chỉ email hợp lệ hay không, hãy sử dụng hàm ISEMAIL. Hàm này kiểm tra xem giá trị có tuân theo định dạng thường được chấp nhận cho địa chỉ email hay không nhưng không xác minh sự tồn tại của địa chỉ đó.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3256503?hl=vi',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Hàm ISEMAIL("johndoe@yourname.com")' },
        },
    },
    ISERR: {
        description: 'Trả về TRUE nếu giá trị là bất kỳ giá trị lỗi nào ngoại trừ #N/A',
        abstract: 'Trả về TRUE nếu giá trị là bất kỳ giá trị lỗi nào ngoại trừ #N/A',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISERROR: {
        description: 'Trả về TRUE nếu giá trị là bất kỳ giá trị lỗi nào',
        abstract: 'Trả về TRUE nếu giá trị là bất kỳ giá trị lỗi nào',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISEVEN: {
        description: 'Trả về TRUE nếu số chắn, trả về FALSE nếu số lẻ.',
        abstract: 'Trả về TRUE nếu số chắn, trả về FALSE nếu số lẻ.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị cần kiểm tra. Nếu số không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    ISFORMULA: {
        description: 'Kiểm tra xem liệu có tham chiếu đến ô chứa công thức hay không và trả về kết quả TRUE hoặc FALSE.',
        abstract: 'Kiểm tra xem liệu có tham chiếu đến ô chứa công thức hay không và trả về kết quả TRUE hoặc FALSE.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'tham chiếu', detail: 'Tham chiếu là tham chiếu đến ô mà bạn muốn kiểm tra.' },
        },
    },
    ISLOGICAL: {
        description: 'Trả về TRUE nếu giá trị là giá trị logic',
        abstract: 'Trả về TRUE nếu giá trị là giá trị logic',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISNA: {
        description: 'Trả về TRUE nếu giá trị là giá trị lỗi #N/A',
        abstract: 'Trả về TRUE nếu giá trị là giá trị lỗi #N/A',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISNONTEXT: {
        description: 'Trả về TRUE nếu giá trị không phải là văn bản',
        abstract: 'Trả về TRUE nếu giá trị không phải là văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISNUMBER: {
        description: 'Trả về TRUE nếu giá trị là số',
        abstract: 'Trả về TRUE nếu giá trị là số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISODD: {
        description: 'Trả về TRUE nếu số lẻ, trả về FALSE nếu số chẵn.',
        abstract: 'Trả về TRUE nếu số lẻ, trả về FALSE nếu số chẵn.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị cần kiểm tra. Nếu số không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    ISOMITTED: {
        description: 'Kiểm tra xem giá trị trong LAMBDA bị thiếu hay không và trả về TRUE hoặc FALSE.',
        abstract: 'Kiểm tra xem giá trị trong LAMBDA bị thiếu hay không và trả về TRUE hoặc FALSE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Tranh luận', detail: 'Giá trị bạn muốn kiểm tra, chẳng hạn như tham số LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Trả về TRUE nếu giá trị là tham chiếu',
        abstract: 'Trả về TRUE nếu giá trị là tham chiếu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISTEXT: {
        description: 'Trả về TRUE nếu giá trị là văn bản',
        abstract: 'Trả về TRUE nếu giá trị là văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISURL: {
        description: 'Kiểm tra liệu giá trị có phải là một URL hợp lệ.',
        abstract: 'Kiểm tra liệu giá trị có phải là một URL hợp lệ.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3256501?hl=vi',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'ISURL("www.google.com")' },
        },
    },
    N: {
        description: 'Trả về một giá trị được chuyển đổi thành số.',
        abstract: 'Trả về một giá trị được chuyển đổi thành số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'giá trị', detail: 'Giá trị mà bạn muốn chuyển đổi.' },
        },
    },
    NA: {
        description: 'Trả về giá trị lỗi #N/A.',
        abstract: 'Trả về giá trị lỗi #N/A.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'Trả về số trang của trang tham chiếu.',
        abstract: 'Trả về số trang của trang tham chiếu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'giá trị', detail: 'là tên của một trang hoặc một tham chiếu mà bạn muốn tìm số trang của nó. Nếu đối số value được bỏ qua, hàm SHEET trả về số trang của trang có chứa hàm.' },
        },
    },
    SHEETS: {
        description: 'Trả về số trang tính trong một bảng tính',
        abstract: 'Trả về số trang tính trong một bảng tính',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Trả về một số đại diện cho kiểu dữ liệu của giá trị',
        abstract: 'Trả về một số đại diện cho kiểu dữ liệu của giá trị',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Nó có thể là bất kỳ giá trị nào, chẳng hạn như số, văn bản, giá trị logic, v.v.' },
        },
    },
};

export default locale;
