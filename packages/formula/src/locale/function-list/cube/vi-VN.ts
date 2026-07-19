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
    CUBEKPIMEMBER: {
        description: 'Trả về thuộc tính chỉ số hiệu suất then chốt (KPI) và hiển thị tên KPI trong ô. KPI là một số đo có thể định lượng được, chẳng hạn như lãi gộp hàng tháng hoặc số lượng nhân viên luân chuyển, dùng để theo dõi hoạt động của một tổ chức.',
        abstract: 'Trả về thuộc tính chỉ số hiệu suất then chốt (KPI) và hiển thị tên KPI trong ô. KPI là một số đo có thể định lượng được, chẳng hạn như lãi gộp hàng tháng hoặc số lượng nhân viên luân chuyển, dùng để theo dõi hoạt động của một tổ chức.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Kết nối', detail: 'Yêu cầu. Chuỗi văn bản tên của kết nối tới khối.' },
            kpiName: { name: 'Kpi_name', detail: 'Yêu cầu. Chuỗi văn bản của tên KPI trong khối.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Yêu cầu. Cấu phần KPI được trả về và có thể là một trong các dạng sau:' },
            caption: { name: 'Chú thích', detail: 'Tùy chọn. Một chuỗi văn bản thay thế được hiển thị trong ô thay cho kpi_name và kpi_property.' },
        },
    },
    CUBEMEMBER: {
        description: 'Trả về một phần tử hoặc một bộ từ khối. Dùng để xác thực rằng phần tử hoặc bộ tồn tại trong khối.',
        abstract: 'Trả về một phần tử hoặc một bộ từ khối. Dùng để xác thực rằng phần tử hoặc bộ tồn tại trong khối.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Kết nối', detail: 'Yêu cầu. Chuỗi văn bản tên của kết nối tới khối.' },
            memberExpression: { name: 'Member_expression', detail: 'Yêu cầu. Một chuỗi văn bản biểu thức đa chiều (DMX) định trị một phần tử duy nhất trong khối. Theo cách khác, member_expression có thể là một bộ, được xác định như là một phạm vi ô hoặc một hằng số mảng.' },
            caption: { name: 'Chú thích', detail: 'Tùy chọn. Một chuỗi văn bản được hiển thị trong ô thay cho chú thích từ ô, nếu như có một chú thích được xác định từ khối. Khi một bộ được trả về, chú thích được dùng là chú thích cho phần tử cuối cùng trong bộ.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Hàm CUBEMEMBERPROPERTY , một trong các hàm Cube trong Excel, trả về giá trị của một thuộc tính phần tử từ một khối. Dùng để xác thực một tên phần tử tồn tại trong cube và trả về thuộc tính được chỉ định cho phần tử này.',
        abstract: 'Hàm CUBEMEMBERPROPERTY , một trong các hàm Cube trong Excel, trả về giá trị của một thuộc tính phần tử từ một khối. Dùng để xác thực một tên phần tử tồn tại trong cube và trả về thuộc tính được chỉ định cho phần tử này.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Kết nối', detail: 'Yêu cầu. Chuỗi văn bản tên của kết nối tới khối.' },
            memberExpression: { name: 'Member_expression', detail: 'Yêu cầu. Chuỗi văn bản biểu thức đa chiều (MDX) của một phần tử trong một khối.' },
            property: { name: 'Tài sản', detail: 'Yêu cầu. Chuỗi văn bản tên của thuộc tính được trả về hoặc tham chiếu tới một ô có chứa tên của thuộc tính.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Trả về phần tử thứ n hoặc được xếp hạng trong một tập hợp. Dùng để trả về một hoặc các thành phần trong một tập hợp, chẳng hạn như nhân viên kinh doanh đứng đầu hoặc 10 học sinh đứng đầu.',
        abstract: 'Trả về phần tử thứ n hoặc được xếp hạng trong một tập hợp. Dùng để trả về một hoặc các thành phần trong một tập hợp, chẳng hạn như nhân viên kinh doanh đứng đầu hoặc 10 học sinh đứng đầu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Kết nối', detail: 'Yêu cầu. Chuỗi văn bản tên của kết nối tới khối.' },
            setExpression: { name: 'Set_expression', detail: 'Yêu cầu. Một chuỗi văn bản của một biểu thức tập hợp, chẳng hạn như "{[Item1].children}". member_expression cũng có thể là hàm CUBESET, hoặc tham chiếu tới một ô có chứa hàm CUBESET.' },
            rank: { name: 'Xếp hạng', detail: 'Yêu cầu. Một giá trị số nguyên chỉ rõ giá trị trên cùng cần trả về. Nếu thứ hạng là giá trị 1, nó trả về giá trị cao nhất, nếu thứ hạng là giá trị 2, nó trả về giá trị cao thứ hai, v.v. Để trả về 5 giá trị hàng đầu, hãy dùng hàm CUBERANKEDMEMBER năm lần, xác định một thứ hạng khác nhau, từ 1 đến 5, mỗi lần.' },
            caption: { name: 'Chú thích', detail: 'Tùy chọn. Một chuỗi văn bản được hiển thị trong ô thay cho chú thích từ ô, nếu như có một chú thích được xác định từ khối.' },
        },
    },
    CUBESET: {
        description: 'Xác định một tập hợp phần tử được tính hoặc bộ bằng cách gửi một biểu thức tập hợp tới khối trên máy chủ, tạo tập hợp rồi trả tập hợp đó về Microsoft Excel.',
        abstract: 'Xác định một tập hợp phần tử được tính hoặc bộ bằng cách gửi một biểu thức tập hợp tới khối trên máy chủ, tạo tập hợp rồi trả tập hợp đó về Microsoft Excel.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Kết nối', detail: 'Yêu cầu. Chuỗi văn bản tên của kết nối tới khối.' },
            setExpression: { name: 'Set_expression', detail: 'Yêu cầu. Một chuỗi văn bản set_expression trả về kết quả là một tập hợp các phần tử hoặc các bộ. Set_expression cũng có thể là một tham chiếu ô tới một phạm vi Excel có chứa một hoặc nhiều phần tử, bộ hoặc tập hợp được bao gồm trong tập hợp đó.' },
            caption: { name: 'Chú thích', detail: 'Tùy chọn. Một chuỗi văn bản được hiển thị trong ô thay cho chú thích từ ô, nếu như có một chú thích được xác định.' },
            sortOrder: { name: 'Sort_order', detail: 'Tùy chọn. Kiểu sắp xếp, nếu có, cần thực hiện và có thể là một trong các kiểu sau đây:' },
            sortBy: { name: 'Sort_by', detail: 'Tùy chọn. Một chuỗi văn bản gồm các giá trị cần sắp xếp theo đó. Ví dụ, để có được thành phố có doanh thu lớn nhất, set_expression phải là một tập hợp các thành phố và sort_by là số đo về doanh thu. Hoặc để có được thành phố đông dân nhất, set_expression phải là một tập hợp các thành phố và sort_by là số dân. Nếu sort_order yêu cầu phải có sort_by, và sort_by được bỏ qua, thì CUBESET trả về thông báo lỗi #VALUE! .' },
        },
    },
    CUBESETCOUNT: {
        description: 'Trả về số mục trong một tập hợp.',
        abstract: 'Trả về số mục trong một tập hợp.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Thiết lập', detail: 'Yêu cầu. Một chuỗi văn bản của biểu thức Microsoft Excel mà biểu thức này định trị một giá trị được xác định bởi hàm CUBESET. Tập hợp cũng có thể là hàm CUBESET, hoặc tham chiếu tới một ô có chứa hàm CUBESET.' },
        },
    },
    CUBEVALUE: {
        description: 'Trả về một giá trị tổng hợp từ khối.',
        abstract: 'Trả về một giá trị tổng hợp từ khối.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Kết nối', detail: 'Yêu cầu. Chuỗi văn bản tên của kết nối tới khối.' },
            memberExpression: { name: 'Member_expression', detail: 'Tùy chọn. Một chuỗi văn bản biểu thức đa chiều (DMX) định trị một phần tử hoặc một bộ trong khối. Hoặc theo cách khác, biểu thức phần tử có thể là một tập hợp được xác định với hàm CUBESET. Hãy dùng biểu thức phần tử như một slicer để xác định phần của khối mà giá trị tổng hợp cho nó được trả về. Nếu không có số đo nào được xác định trong biểu thức phần tử, thì sẽ dùng số đo mặc định của khối đó.' },
        },
    },
};

export default locale;
