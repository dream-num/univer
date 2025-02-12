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
    CUBEKPIMEMBER: {
        description: 'Trả về các thuộc tính của Chỉ số Hiệu suất Chính (KPI) và hiển thị tên KPI trong ô. KPI là một thước đo có thể đo lường để theo dõi hiệu suất của đơn vị, như tổng lợi nhuận hàng tháng hoặc sự điều chỉnh của nhân viên hàng quý.',
        abstract: 'Trả về các thuộc tính của Chỉ số Hiệu suất Chính (KPI) và hiển thị tên KPI trong ô. KPI là một thước đo có thể đo lường để theo dõi hiệu suất của đơn vị, như tổng lợi nhuận hàng tháng hoặc sự điều chỉnh của nhân viên hàng quý.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cubekpimember-%E5%87%BD%E6%95%B0-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số thứ nhất' },
            number2: { name: 'number2', detail: 'Tham số thứ hai' },
        },
    },
    CUBEMEMBER: {
        description: 'Trả về thành viên hoặc tuple trong tập dữ liệu. Sử dụng để xác minh thành viên hoặc tuple có tồn tại trong tập dữ liệu hay không.',
        abstract: 'Trả về thành viên hoặc tuple trong tập dữ liệu. Sử dụng để xác minh thành viên hoặc tuple có tồn tại trong tập dữ liệu hay không.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cubemember-%E5%87%BD%E6%95%B0-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số thứ nhất' },
            number2: { name: 'number2', detail: 'Tham số thứ hai' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Trả về giá trị thuộc tính của thành viên trong tập dữ liệu. Sử dụng để xác minh thành viên có tồn tại trong tập dữ liệu hay không và trả về thuộc tính cụ thể của thành viên đó.',
        abstract: 'Trả về giá trị thuộc tính của thành viên trong tập dữ liệu. Sử dụng để xác minh thành viên có tồn tại trong tập dữ liệu hay không và trả về thuộc tính cụ thể của thành viên đó.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cubememberproperty-%E5%87%BD%E6%95%B0-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số thứ nhất' },
            number2: { name: 'number2', detail: 'Tham số thứ hai' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Trả về thành viên thứ n hoặc xếp hạng trong một tập hợp. Sử dụng để trả về một hoặc nhiều phần tử trong tập hợp, như nhân viên bán hàng tốt nhất hoặc top 10 sinh viên.',
        abstract: 'Trả về thành viên thứ n hoặc xếp hạng trong một tập hợp. Sử dụng để trả về một hoặc nhiều phần tử trong tập hợp, như nhân viên bán hàng tốt nhất hoặc top 10 sinh viên.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cuberankedmember-%E5%87%BD%E6%95%B0-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số thứ nhất' },
            number2: { name: 'number2', detail: 'Tham số thứ hai' },
        },
    },
    CUBESET: {
        description: 'Định nghĩa một tập hợp các thành viên hoặc tuple được tính toán. Bằng cách gửi một biểu thức tập hợp tới tập dữ liệu trên máy chủ, biểu thức này tạo tập hợp và sau đó trả tập hợp đó về Microsoft Excel.',
        abstract: 'Định nghĩa một tập hợp các thành viên hoặc tuple được tính toán. Bằng cách gửi một biểu thức tập hợp tới tập dữ liệu trên máy chủ, biểu thức này tạo tập hợp và sau đó trả tập hợp đó về Microsoft Excel.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cubeset-%E5%87%BD%E6%95%B0-5b2146bd-62d6-4d04-9d8f-670e993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số thứ nhất' },
            number2: { name: 'number2', detail: 'Tham số thứ hai' },
        },
    },
    CUBESETCOUNT: {
        description: 'Trả về số lượng mục trong tập hợp.',
        abstract: 'Trả về số lượng mục trong tập hợp.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cubesetcount-%E5%87%BD%E6%95%B0-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số thứ nhất' },
            number2: { name: 'number2', detail: 'Tham số thứ hai' },
        },
    },
    CUBEVALUE: {
        description: 'Trả về giá trị tổng hợp từ tập dữ liệu.',
        abstract: 'Trả về giá trị tổng hợp từ tập dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cubevalue-%E5%87%BD%E6%95%B0-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số thứ nhất' },
            number2: { name: 'number2', detail: 'Tham số thứ hai' },
        },
    },
}
;
