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
    DAVERAGE: {
        description: 'Tính trung bình các giá trị trong một trường (cột) bản ghi trong danh sách hay cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Tính trung bình các giá trị trong một trường (cột) bản ghi trong danh sách hay cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'sở dữ liệu là phạm vi ô tạo thành danh sách hoặc cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'cho biết cột nào được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Hoa lợi" hay một số (không có dấu trích dẫn) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'là phạm vi ô có chứa các điều kiện bạn xác định. Bạn có thể dùng bất kỳ phạm vi nào cho đối số criteria, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó, mà trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DCOUNT: {
        description: 'Đếm số ô chứa số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Đếm số ô chứa số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa các điều kiện mà bạn xác định. Bạn có thể dùng bất kỳ phạm vi nào cho đối số criteria, miễn là đối số đó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó, mà trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DCOUNTA: {
        description: 'Đếm các ô không trống trong một trường (cột) của bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với những điều kiện bạn xác định.',
        abstract: 'Đếm các ô không trống trong một trường (cột) của bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với những điều kiện bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Tùy chọn. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DGET: {
        description: 'Trích một giá trị từ cột danh sách hay cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Trích một giá trị từ cột danh sách hay cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DMAX: {
        description: 'Trả về số lớn nhất trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Trả về số lớn nhất trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DMIN: {
        description: 'Trả về số nhỏ nhất trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Trả về số nhỏ nhất trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DPRODUCT: {
        description: 'Nhân các giá trị trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Nhân các giá trị trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DSTDEV: {
        description: 'Ước tính độ lệch chuẩn của một tập hợp dựa trên một mẫu bằng cách dùng các số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Ước tính độ lệch chuẩn của một tập hợp dựa trên một mẫu bằng cách dùng các số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DSTDEVP: {
        description: 'Tính toán độ lệch chuẩn của một tập hợp dựa trên toàn bộ tập hợp đó bằng cách dùng các số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Tính toán độ lệch chuẩn của một tập hợp dựa trên toàn bộ tập hợp đó bằng cách dùng các số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DSUM: {
        description: 'Trong danh sách hoặc cơ sở dữ liệu, DSUM cung cấp tổng số trong các trường (cột) bản ghi khớp với các điều kiện đã xác định của bạn.',
        abstract: 'Trong danh sách hoặc cơ sở dữ liệu, DSUM cung cấp tổng số trong các trường (cột) bản ghi khớp với các điều kiện đã xác định của bạn.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Đây là phạm vi ô tạo thành danh sách hoặc cơ sở dữ liệu. Cơ sở dữ liệu là danh sách các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và cột dữ liệu là các trường . Hàng đầu tiên của danh sách chứa nhãn cho mỗi cột trong đó.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Điều này chỉ rõ cột nào được dùng trong hàm. Xác định nhãn cột nằm giữa dấu ngoặc kép, chẳng hạn như ví dụ như "Tuổi" hoặc "Hoa lợi". Ngoài ra, bạn có thể chỉ định một số (không có dấu ngoặc kép) thể hiện vị trí của cột trong danh sách: ví dụ: 1 cho cột đầu tiên, 2 cho cột thứ hai, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Đây là phạm vi ô có chứa các điều kiện mà bạn chỉ định. Bạn có thể dùng bất kỳ phạm vi nào cho đối số criteria, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó, mà trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DVAR: {
        description: 'Ước tính phương sai của một tập hợp dựa trên một mẫu bằng cách dùng các số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Ước tính phương sai của một tập hợp dựa trên một mẫu bằng cách dùng các số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
    DVARP: {
        description: 'Tính toán phương sai của một tập hợp dựa trên toàn bộ tập hợp đó bằng cách dùng các số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        abstract: 'Tính toán phương sai của một tập hợp dựa trên toàn bộ tập hợp đó bằng cách dùng các số trong một trường (cột) bản ghi trong danh sách hoặc cơ sở dữ liệu khớp với các điều kiện mà bạn xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'cơ sở dữ liệu', detail: 'Yêu cầu. Phạm vi ô tạo thành danh sách hay cơ sở dữ liệu. Cơ sở dữ liệu là một danh sách chứa các dữ liệu liên quan, trong đó các hàng thông tin liên quan là các bản ghi và các cột dữ liệu là các trường. Hàng đầu tiên của danh sách có chứa nhãn cho mỗi cột.' },
            field: { name: 'cánh đồng', detail: 'Yêu cầu. Chỉ rõ cột được dùng trong hàm. Hãy nhập nhãn cột đặt trong dấu ngoặc kép, ví dụ như "Tuổi" hoặc "Lợi tức" hay một số (không có dấu ngoặc kép) thể hiện vị trí cột trong danh sách: 1 cho cột đầu tiên, 2 cho cột thứ 2, v.v.' },
            criteria: { name: 'tiêu chuẩn', detail: 'Yêu cầu. Phạm vi ô có chứa điều kiện mà bạn xác định. Bạn có thể sử dụng bất kỳ phạm vi nào cho đối số tiêu chí, miễn là nó có chứa ít nhất một nhãn cột và ít nhất một ô bên dưới nhãn cột đó trong đó bạn xác định điều kiện cho cột đó.' },
        },
    },
};

export default locale;
