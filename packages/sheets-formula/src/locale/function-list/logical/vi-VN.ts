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
    AND: {
        description: '如果其所有参数均为 TRUE，则返回 TRUE',
        abstract: '如果其所有参数均为 TRUE，则返回 TRUE',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/and-%E5%87%BD%E6%95%B0-5f19b2e8-e1df-4408-897a-ce285a19e9d9',
            },
        ],
        functionParameter: {
            logical1: { name: 'Giá trị logic 1', detail: 'Điều kiện đầu tiên muốn kiểm tra và có thể là TRUE hoặc FALSE.' },
            logical2: { name: 'Giá trị logic 2', detail: 'Các điều kiện khác muốn kiểm tra và có thể là TRUE hoặc FALSE (tối đa 255 điều kiện).' },
        },
    },
    BYCOL: {
        description: 'Áp dụng LAMBDA cho mỗi cột và trả về một mảng kết quả',
        abstract: 'Áp dụng LAMBDA cho mỗi cột và trả về một mảng kết quả',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/bycol-%E5%87%BD%E6%95%B0-58463999-7de5-49ce-8f38-b7f7a2192bfb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    BYROW: {
        description: 'Áp dụng LAMBDA cho mỗi hàng và trả về một mảng kết quả',
        abstract: 'Áp dụng LAMBDA cho mỗi hàng và trả về một mảng kết quả',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/byrow-%E5%87%BD%E6%95%B0-2e04c677-78c8-4e6b-8c10-a4602f2602bb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    FALSE: {
        description: 'Trả về giá trị logic FALSE',
        abstract: 'Trả về giá trị logic FALSE',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/false-%E5%87%BD%E6%95%B0-2d58dfa5-9c03-4259-bf8f-f0ae14346904',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    IF: {
        description: 'Xác định kiểm tra logic để thực hiện',
        abstract: 'Xác định kiểm tra logic để thực hiện',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/if-%E5%87%BD%E6%95%B0-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'Biểu thức logic', detail: 'Điều kiện cần kiểm tra.' },
            valueIfTrue: { name: 'Nếu giá trị là đúng', detail: 'Giá trị bạn muốn trả về nếu kết quả của logical_test là TRUE.' },
            valueIfFalse: { name: 'Nếu giá trị là sai', detail: 'Giá trị bạn muốn trả về nếu kết quả của logical_test là FALSE.' },
        },
    },
    IFERROR: {
        description: 'Nếu kết quả tính toán của công thức là lỗi, trả về giá trị bạn chỉ định; nếu không, trả về kết quả của công thức',
        abstract: 'Nếu kết quả tính toán của công thức là lỗi, trả về giá trị bạn chỉ định; nếu không, trả về kết quả của công thức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/iferror-%E5%87%BD%E6%95%B0-c526fd07-caeb-47b8-8bb6-63f3e417f611',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Tham số để kiểm tra lỗi.' },
            valueIfError: { name: 'Giá trị khi xảy ra lỗi', detail: 'Giá trị trả về khi kết quả tính toán của công thức là lỗi. Đánh giá các loại lỗi sau: #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME? hoặc #NULL!.' },
        },
    },
    IFNA: {
        description: 'Nếu biểu thức này giải mã là #N/A, trả về giá trị được chỉ định; nếu không, trả về kết quả của biểu thức đó',
        abstract: 'Nếu biểu thức này giải mã là #N/A, trả về giá trị được chỉ định; nếu không, trả về kết quả của biểu thức đó',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/ifna-%E5%87%BD%E6%95%B0-6626c961-a569-42fc-a49d-79b4951fd461',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    IFS: {
        description: 'Kiểm tra nếu một hoặc nhiều điều kiện được đáp ứng và trả về giá trị tương ứng với điều kiện TRUE đầu tiên.',
        abstract: 'Kiểm tra nếu một hoặc nhiều điều kiện được đáp ứng và trả về giá trị tương ứng với điều kiện TRUE đầu tiên.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/ifs-%E5%87%BD%E6%95%B0-36329a26-37b2-467c-972b-4a39bd951d45',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    LAMBDA: {
        description: 'Sử dụng chức năng LAMBDA để tạo hàm tùy chỉnh có thể tái sử dụng và gọi chúng bằng tên dễ nhớ. Các hàm mới có sẵn trên toàn bộ workbook và gọi giống như hàm gốc của Excel.',
        abstract: 'Tạo các hàm tùy chỉnh, có thể tái sử dụng và gọi chúng bằng tên thân thiện',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/lambda-%E5%87%BD%E6%95%B0-bd212d27-1cd1-4321-a34a-ccbf254b8b67',
            },
        ],
        functionParameter: {
            parameter: {
                name: 'Tham số',
                detail: 'Giá trị để truyền vào hàm, ví dụ như tham chiếu ô, chuỗi hoặc số. Có thể nhập tối đa 253 tham số. Tham số này là tùy chọn.',
            },
            calculation: {
                name: 'Tính toán',
                detail: 'Công thức để thực hiện và trả về kết quả của hàm. Phải là tham số cuối cùng và phải trả về kết quả. Tham số này là bắt buộc.',
            },
        },
    },
    LET: {
        description: 'Gán tên cho kết quả tính toán',
        abstract: 'Gán tên cho kết quả tính toán',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/let-%E5%87%BD%E6%95%B0-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    MAKEARRAY: {
        description: 'Trả về một mảng có kích thước hàng và cột chỉ định bằng cách áp dụng LAMBDA',
        abstract: 'Trả về một mảng có kích thước hàng và cột chỉ định bằng cách áp dụng LAMBDA',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/makearray-%E5%87%BD%E6%95%B0-b80da5ad-b338-4149-a523-5b221da09097',
            },
        ],
        functionParameter: {
            number1: { name: 'Số hàng', detail: 'Số hàng trong mảng. Phải lớn hơn không' },
            number2: { name: 'Số cột', detail: 'Số cột trong mảng. Phải lớn hơn không' },
            value3: {
                name: 'lambda',
                detail: 'Gọi LAMBDA để tạo mảng. LAMBDA nhận hai tham số: row chỉ mục hàng của mảng, col chỉ mục cột của mảng',
            },
        },
    },
    MAP: {
        description: 'Trả về một mảng bằng cách áp dụng LAMBDA tạo giá trị mới, ánh xạ mảng () thành giá trị mới',
        abstract: 'Trả về một mảng bằng cách áp dụng LAMBDA tạo giá trị mới, ánh xạ mảng () thành giá trị mới',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/map-%E5%87%BD%E6%95%B0-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    NOT: {
        description: 'Lấy giá trị logic ngược lại của tham số',
        abstract: 'Lấy giá trị logic ngược lại của tham số',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/not-%E5%87%BD%E6%95%B0-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    OR: {
        description: 'Nếu bất kỳ tham số nào của hàm OR tính là TRUE, trả về TRUE; nếu tất cả tham số tính là FALSE, trả về FALSE.',
        abstract: 'Nếu bất kỳ tham số nào là TRUE, trả về TRUE',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/or-%E5%87%BD%E6%95%B0-7d17ad14-8700-4281-b308-00b131e22af0',
            },
        ],
        functionParameter: {
            logical1: { name: 'Biểu thức logic 1', detail: 'Điều kiện đầu tiên muốn kiểm tra và có thể là TRUE hoặc FALSE.' },
            logical2: { name: 'Biểu thức logic 2', detail: 'Các điều kiện khác muốn kiểm tra và có thể là TRUE hoặc FALSE (tối đa 255 điều kiện).' },
        },
    },
    REDUCE: {
        description: 'Giảm mảng thành giá trị tích lũy bằng cách áp dụng LAMBDA cho mỗi giá trị và trả về tổng trong bộ tích lũy',
        abstract: 'Giảm mảng thành giá trị tích lũy bằng cách áp dụng LAMBDA cho mỗi giá trị và trả về tổng trong bộ tích lũy',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/reduce-%E5%87%BD%E6%95%B0-42e39910-b345-45f3-84b8-0642b568b7cb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    SCAN: {
        description: 'Quét mảng bằng cách áp dụng LAMBDA cho mỗi giá trị và trả về một mảng chứa các giá trị trung gian',
        abstract: 'Quét mảng bằng cách áp dụng LAMBDA cho mỗi giá trị và trả về một mảng chứa các giá trị trung gian',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/scan-%E5%87%BD%E6%95%B0-d58dfd11-9969-4439-b2dc-e7062724de29',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    SWITCH: {
        description: 'Đánh giá một biểu thức dựa trên danh sách các giá trị và trả về kết quả tương ứng với giá trị đầu tiên khớp. Nếu không khớp, có thể trả về giá trị mặc định tùy chọn.',
        abstract: 'Đánh giá một biểu thức dựa trên danh sách các giá trị và trả về kết quả tương ứng với giá trị đầu tiên khớp. Nếu không khớp, có thể trả về giá trị mặc định tùy chọn.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/switch-%E5%87%BD%E6%95%B0-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    TRUE: {
        description: 'Trả về giá trị logic TRUE',
        abstract: 'Trả về giá trị logic TRUE',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/true-%E5%87%BD%E6%95%B0-7652c6e3-8987-48d0-97cd-ef223246b3fb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    XOR: {
        description: 'Trả về giá trị logic XOR của tất cả các tham số',
        abstract: 'Trả về giá trị logic XOR của tất cả các tham số',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/zh-cn/office/xor-%E5%87%BD%E6%95%B0-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
};
