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
    AND: {
        description: 'Returns TRUE if all of its arguments are TRUE',
        abstract: 'Returns TRUE if all of its arguments are TRUE',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/and-%E5%87%BD%E6%95%B0-5f19b2e8-e1df-4408-897a-ce285a19e9d9',
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
                url: 'https://support.microsoft.com/vi-vn/office/bycol-%E5%87%BD%E6%95%B0-58463999-7de5-49ce-8f38-b7f7a2192bfb',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng được phân tách bởi cột.' },
            lambda: { name: 'lambda', detail: 'Hàm LAMBDA nhận một cột làm tham số đơn và tính toán một kết quả. LAMBDA có một tham số duy nhất: Một cột từ mảng.' },
        },
    },
    BYROW: {
        description: 'Áp dụng LAMBDA cho mỗi hàng và trả về một mảng kết quả',
        abstract: 'Áp dụng LAMBDA cho mỗi hàng và trả về một mảng kết quả',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/byrow-%E5%87%BD%E6%95%B0-2e04c677-78c8-4e6b-8c10-a4602f2602bb',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng được phân tách theo hàng.' },
            lambda: { name: 'lambda', detail: 'Hàm LAMBDA nhận một hàng làm tham số duy nhất và tính toán một kết quả. LAMBDA có một tham số duy nhất: Một hàng từ mảng.' },
        },
    },
    FALSE: {
        description: 'Trả về giá trị logic FALSE',
        abstract: 'Trả về giá trị logic FALSE',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/false-%E5%87%BD%E6%95%B0-2d58dfa5-9c03-4259-bf8f-f0ae14346904',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: 'Xác định kiểm tra logic để thực hiện',
        abstract: 'Xác định kiểm tra logic để thực hiện',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/if-%E5%87%BD%E6%95%B0-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2',
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
                url: 'https://support.microsoft.com/vi-vn/office/iferror-%E5%87%BD%E6%95%B0-c526fd07-caeb-47b8-8bb6-63f3e417f611',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Tham số để kiểm tra lỗi.' },
            valueIfError: { name: 'Trả về giá trị khi có lỗi', detail: 'Giá trị trả về khi kết quả tính toán của công thức là lỗi. Đánh giá các loại lỗi sau: #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME? hoặc #NULL!.' },
        },
    },
    IFNA: {
        description: 'Nếu biểu thức này giải mã là #N/A, trả về giá trị được chỉ định; nếu không, trả về kết quả của biểu thức đó',
        abstract: 'Nếu biểu thức này giải mã là #N/A, trả về giá trị được chỉ định; nếu không, trả về kết quả của biểu thức đó',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/ifna-%E5%87%BD%E6%95%B0-6626c961-a569-42fc-a49d-79b4951fd461',
            },
        ],
        functionParameter: {
            value: { name: 'Giá trị', detail: 'Đối số được kiểm tra cho giá trị lỗi #N/A.' },
            valueIfNa: { name: 'Nếu đó là giá trị của #N/A', detail: 'Giá trị cần trả về nếu công thức cho kết quả là giá trị lỗi #N/A.' },
        },
    },
    IFS: {
        description: 'Kiểm tra nếu một hoặc nhiều điều kiện được đáp ứng và trả về giá trị tương ứng với điều kiện TRUE đầu tiên.',
        abstract: 'Kiểm tra nếu một hoặc nhiều điều kiện được đáp ứng và trả về giá trị tương ứng với điều kiện TRUE đầu tiên.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/ifs-%E5%87%BD%E6%95%B0-36329a26-37b2-467c-972b-4a39bd951d45',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logic 1', detail: 'Điều kiện đầu tiên được đánh giá, có thể là giá trị Boolean, giá trị số, mảng hoặc tham chiếu đến một trong các giá trị này.' },
            valueIfTrue1: { name: 'Giá trị 1', detail: 'Giá trị được trả về khi "Điều kiện 1" là "TRUE".' },
            logicalTest2: { name: 'logic 2', detail: 'Các điều kiện khác được đánh giá trước điều kiện trước đó là FALSE.' },
            valueIfTrue2: { name: 'Giá trị 2', detail: 'Giá trị bổ sung được trả về nếu điều kiện tương ứng là "TRUE".' },
        },
    },
    LAMBDA: {
        description: 'Sử dụng chức năng LAMBDA để tạo hàm tùy chỉnh có thể tái sử dụng và gọi chúng bằng tên dễ nhớ. Các hàm mới có sẵn trên toàn bộ workbook và gọi giống như hàm gốc của Excel.',
        abstract: 'Tạo các hàm tùy chỉnh, có thể tái sử dụng và gọi chúng bằng tên thân thiện',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/lambda-%E5%87%BD%E6%95%B0-bd212d27-1cd1-4321-a34a-ccbf254b8b67',
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
                url: 'https://support.microsoft.com/vi-vn/office/let-%E5%87%BD%E6%95%B0-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            name1: { name: 'tên 1', detail: 'Tên đầu tiên cần phải gán. Phải bắt đầu bằng một chữ cái. Không thể là kết quả của công thức hoặc xung đột với cú pháp dải ô.' },
            nameValue1: { name: 'giá trị 1', detail: 'Giá trị gán cho name1.' },
            calculationOrName2: { name: 'tính toán hoặc tên 2', detail: 'Một trong những điều sau:\n1.Phép tính sử dụng tất cả các tên trong hàm LET. Đây phải là đối số cuối cùng trong hàm LET.\n2.Tên thứ hai cần gán cho name_value thứ hai. Nếu tên đã được xác định, name_value2 và calculation_or_name3 sẽ trở thành bắt buộc.' },
            nameValue2: { name: 'giá trị 2', detail: 'Giá trị gán cho calculation_or_name2.' },
            calculationOrName3: { name: 'tính toán hoặc tên 3', detail: 'Một trong những điều sau:\n1.Phép tính sử dụng tất cả các tên trong hàm LET. Đối số cuối cùng trong hàm LET phải là một phép tính.\n2.Tên thứ ba cần gán cho name_value thứ ba. Nếu tên đã được xác định, name_value3 và calculation_or_name4 sẽ trở thành bắt buộc.' },
        },
    },
    MAKEARRAY: {
        description: 'Trả về một mảng có kích thước hàng và cột chỉ định bằng cách áp dụng LAMBDA',
        abstract: 'Trả về một mảng có kích thước hàng và cột chỉ định bằng cách áp dụng LAMBDA',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/makearray-%E5%87%BD%E6%95%B0-b80da5ad-b338-4149-a523-5b221da09097',
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
        description: 'Trả về một mảng được hình thành bằng cách ánh xạ mỗi giá trị trong (các) mảng với một giá trị mới bằng cách áp dụng lambda để tạo một giá trị mới.',
        abstract: 'Trả về một mảng được hình thành bằng cách ánh xạ mỗi giá trị trong (các) mảng với một giá trị mới bằng cách áp dụng lambda để tạo một giá trị mới.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/map-%E5%87%BD%E6%95%B0-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng1', detail: 'Một mảng1 cần ánh xạ.' },
            array2: { name: 'mảng2', detail: 'Một mảng2 cần ánh xạ.' },
            lambda: { name: 'lambda', detail: 'Một LAMBDA phải là đối số cuối cùng và phải có tham số cho mỗi mảng được truyền.' },
        },
    },
    NOT: {
        description: 'Lấy giá trị logic ngược lại của tham số',
        abstract: 'Lấy giá trị logic ngược lại của tham số',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/not-%E5%87%BD%E6%95%B0-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
            },
        ],
        functionParameter: {
            logical: { name: 'biểu thức logic', detail: 'Điều kiện mà bạn muốn đảo ngược logic có thể đánh giá là TRUE hoặc FALSE.' },
        },
    },
    OR: {
        description: 'Nếu bất kỳ tham số nào của hàm OR tính là TRUE, trả về TRUE; nếu tất cả tham số tính là FALSE, trả về FALSE.',
        abstract: 'Nếu bất kỳ tham số nào là TRUE, trả về TRUE',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/or-%E5%87%BD%E6%95%B0-7d17ad14-8700-4281-b308-00b131e22af0',
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
                url: 'https://support.microsoft.com/vi-vn/office/reduce-%E5%87%BD%E6%95%B0-42e39910-b345-45f3-84b8-0642b568b7cb',
            },
        ],
        functionParameter: {
            initialValue: { name: 'giá trị bắt đầu cho', detail: 'Đặt giá trị bắt đầu cho bộ tích lũy.' },
            array: { name: 'mảng', detail: 'Một mảng cần giảm.' },
            lambda: { name: 'lambda', detail: 'Một LAMBDA được gọi là giảm mảng. LAMBDA có ba thông số: 1.Giá trị được tính tổng và trả về là kết quả cuối cùng. 2.Giá trị hiện tại từ mảng. 3.Phép tính được áp dụng cho từng thành phần trong mảng.' },
        },
    },
    SCAN: {
        description: 'Quét mảng bằng cách áp dụng LAMBDA cho mỗi giá trị và trả về một mảng chứa các giá trị trung gian',
        abstract: 'Quét mảng bằng cách áp dụng LAMBDA cho mỗi giá trị và trả về một mảng chứa các giá trị trung gian',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/scan-%E5%87%BD%E6%95%B0-d58dfd11-9969-4439-b2dc-e7062724de29',
            },
        ],
        functionParameter: {
            initialValue: { name: 'giá trị bắt đầu cho', detail: 'Đặt giá trị bắt đầu cho bộ tích lũy.' },
            array: { name: 'mảng', detail: 'Một mảng cần quét.' },
            lambda: { name: 'lambda', detail: 'Một LAMBDA được gọi là quét mảng. LAMBDA có ba thông số: 1.Giá trị được tính tổng và trả về là kết quả cuối cùng. 2.Giá trị hiện tại từ mảng. 3.Phép tính được áp dụng cho từng thành phần trong mảng.' },
        },
    },
    SWITCH: {
        description: 'Đánh giá một biểu thức dựa trên danh sách các giá trị và trả về kết quả tương ứng với giá trị đầu tiên khớp. Nếu không khớp, có thể trả về giá trị mặc định tùy chọn.',
        abstract: 'Đánh giá một biểu thức dựa trên danh sách các giá trị và trả về kết quả tương ứng với giá trị đầu tiên khớp. Nếu không khớp, có thể trả về giá trị mặc định tùy chọn.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/switch-%E5%87%BD%E6%95%B0-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
            },
        ],
        functionParameter: {
            expression: { name: 'Sự biểu lộ', detail: 'Biểu thức là một giá trị (chẳng hạn như số, ngày hoặc một số văn bản) được so sánh với value1…value126.' },
            value1: { name: 'Giá trị 1', detail: 'Giá trị N là giá trị được so sánh với biểu thức.' },
            result1: { name: 'Kết quả 1', detail: 'Kết quả N là giá trị được trả về khi tham số giá trị N tương ứng khớp với biểu thức. Một kết quả N phải được cung cấp cho mỗi đối số N có giá trị tương ứng.' },
            defaultOrValue2: { name: 'Mặc định hoặc giá trị 2', detail: 'Giá trị mặc định là giá trị được trả về nếu không tìm thấy kết quả khớp nào trong biểu thức giá trị N. Các tham số mặc định được xác định bằng cách không có biểu thức N kết quả tương ứng (xem ví dụ). Mặc định phải là tham số cuối cùng trong hàm.' },
            result2: { name: 'Kết quả 2', detail: 'Kết quả N là giá trị được trả về khi tham số giá trị N tương ứng khớp với biểu thức. Một kết quả N phải được cung cấp cho mỗi đối số N có giá trị tương ứng.' },
        },
    },
    TRUE: {
        description: 'Trả về giá trị logic TRUE',
        abstract: 'Trả về giá trị logic TRUE',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/true-%E5%87%BD%E6%95%B0-7652c6e3-8987-48d0-97cd-ef223246b3fb',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: 'Trả về giá trị logic XOR của tất cả các tham số',
        abstract: 'Trả về giá trị logic XOR của tất cả các tham số',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/xor-%E5%87%BD%E6%95%B0-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            logical1: { name: 'Biểu thức logic 1', detail: 'Điều kiện đầu tiên muốn kiểm tra và có thể là TRUE hoặc FALSE.' },
            logical2: { name: 'Biểu thức logic 2', detail: 'Các điều kiện khác muốn kiểm tra và có thể là TRUE hoặc FALSE (tối đa 255 điều kiện).' },
        },
    },
};
