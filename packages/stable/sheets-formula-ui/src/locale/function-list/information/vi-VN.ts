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

export default {
    CELL: {
        description: 'Hàm CELL trả về thông tin về định dạng, vị trí hay nội dung của một ô.',
        abstract: 'Hàm CELL trả về thông tin về định dạng, vị trí hay nội dung của một ô.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cell-%E5%87%BD%E6%95%B0-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
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
                url: 'https://support.microsoft.com/vi-vn/office/error-type-%E5%87%BD%E6%95%B0-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
            },
        ],
        functionParameter: {
            errorVal: { name: 'Giá trị lỗi', detail: 'Giá trị lỗi có số nhận dạng mà bạn muốn tìm.' },
        },
    },
    ISBETWEEN: {
        description: 'Kiểm tra xem một số đã cho có nằm giữa hai số khác',
        abstract: 'Kiểm tra xem một số đã cho có nằm giữa hai số khác',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/10538337?hl=vi&sjid=7730820672019533290-AP',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'giá_trị_muốn_so_sánh', detail: 'Giá trị muốn kiểm tra khi nằm trong khoảng từ `giới_hạn_dưới` đến `giới_hạn_trên`.' },
            lowerValue: { name: 'giới_hạn_dưới', detail: 'Cận dưới của miền giá trị mà `giá_trị_muốn_so_sánh` có thể thuộc miền đó.' },
            upperValue: { name: 'giới_hạn_trên', detail: 'Cận trên của miền giá trị mà `giá_trị_muốn_so_sánh` có thể thuộc miền đó.' },
            lowerValueIsInclusive: { name: 'bao_gồm_cả_giới_hạn_dưới', detail: 'Liệu miền giá trị có bao gồm `giới_hạn_trên` hay không. Theo mặc định, hàm sẽ trả về TRUE.' },
            upperValueIsInclusive: { name: 'bao_gồm_cả_giới_hạn_trên', detail: 'Liệu miền giá trị có bao gồm `giới_hạn_trên` hay không. Theo mặc định, hàm sẽ trả về TRUE.' },
        },
    },
    ISBLANK: {
        description: 'Trả về TRUE nếu giá trị trống',
        abstract: 'Trả về TRUE nếu giá trị trống',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị mà bạn muốn kiểm tra. Đối số giá trị có thể là trống (ô trống), lỗi, giá trị lô-gic, văn bản, số, giá trị tham chiếu hoặc tên tham chiếu tới bất kỳ giá trị nào trong những giá trị này.' },
        },
    },
    ISDATE: {
        description: 'xác định xem một giá trị có phải là ngày không.',
        abstract: 'xác định xem một giá trị có phải là ngày không.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/9061381?hl=vi&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị cần xác minh có phải là một ngày hay không.' },
        },
    },
    ISEMAIL: {
        description: 'Tra xem một giá trị có phải là địa chỉ email hợp lệ hay không bằng.',
        abstract: 'Tra xem một giá trị có phải là địa chỉ email hợp lệ hay không bằng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3256503?hl=vi&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị được xác minh là một địa chỉ email.' },
        },
    },
    ISERR: {
        description: 'Trả về TRUE nếu giá trị là bất kỳ giá trị lỗi nào ngoại trừ #N/A',
        abstract: 'Trả về TRUE nếu giá trị là bất kỳ giá trị lỗi nào ngoại trừ #N/A',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
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
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
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
                url: 'https://support.microsoft.com/vi-vn/office/iseven-%E5%87%BD%E6%95%B0-aa15929a-d77b-4fbb-92f4-2f479af55356',
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
                url: 'https://support.microsoft.com/vi-vn/office/isformula-%E5%87%BD%E6%95%B0-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
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
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
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
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
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
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
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
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
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
                url: 'https://support.microsoft.com/vi-vn/office/isodd-%E5%87%BD%E6%95%B0-1208a56d-4f10-4f44-a5fc-648cafd6c07a',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị cần kiểm tra. Nếu số không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    ISREF: {
        description: 'Trả về TRUE nếu giá trị là tham chiếu',
        abstract: 'Trả về TRUE nếu giá trị là tham chiếu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
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
                url: 'https://support.microsoft.com/vi-vn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
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
                url: 'https://support.google.com/docs/answer/3256501?hl=vi&sjid=7312884847858065932-AP',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Giá trị được xác minh là một URL.' },
        },
    },
    N: {
        description: 'Trả về một giá trị được chuyển đổi thành số.',
        abstract: 'Trả về một giá trị được chuyển đổi thành số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/n-%E5%87%BD%E6%95%B0-a624cad1-3635-4208-b54a-29733d1278c9',
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
                url: 'https://support.microsoft.com/vi-vn/office/na-%E5%87%BD%E6%95%B0-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
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
                url: 'https://support.microsoft.com/vi-vn/office/sheet-%E5%87%BD%E6%95%B0-44718b6f-8b87-47a1-a9d6-b701c06cff24',
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
                url: 'https://support.microsoft.com/vi-vn/office/sheets-%E5%87%BD%E6%95%B0-770515eb-e1e8-45ce-8066-b557e5e4b80b',
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
                url: 'https://support.microsoft.com/vi-vn/office/type-%E5%87%BD%E6%95%B0-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Nó có thể là bất kỳ giá trị nào, chẳng hạn như số, văn bản, giá trị logic, v.v.' },
        },
    },
};
