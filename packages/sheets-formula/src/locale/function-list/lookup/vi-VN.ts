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
    ADDRESS: {
        description: 'Trả về địa chỉ của một ô trong một trang tính dựa trên số hàng và cột đã chỉ định. Ví dụ: ADDRESS(2,3) trả về $C$2. Ví dụ khác: ADDRESS(77,300) trả về $KN$77. Bạn có thể sử dụng các hàm khác như ROW và COLUMN để cung cấp các tham số hàng và cột cho hàm ADDRESS.',
        abstract: 'Trả về tham chiếu đến một ô trong trang tính dưới dạng văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/address-%E5%87%BD%E6%95%B0-d0c26c0d-3991-446b-8de4-ab46431d4f89',
            },
        ],
        functionParameter: {
            row_num: { name: 'Số hàng', detail: 'Một giá trị số xác định số hàng sẽ sử dụng trong tham chiếu ô.' },
            column_num: { name: 'Số cột', detail: 'Một giá trị số xác định số cột sẽ sử dụng trong tham chiếu ô.' },
            abs_num: { name: 'Loại tham chiếu', detail: 'Một giá trị số xác định loại tham chiếu sẽ trả về.' },
            a1: {
                name: 'Kiểu tham chiếu',
                detail: 'Một giá trị logic xác định kiểu tham chiếu A1 hoặc R1C1. Trong kiểu A1, cột và hàng được đánh dấu bằng chữ cái và số tương ứng. Trong kiểu tham chiếu R1C1, cả cột và hàng đều được đánh số. Nếu tham số A1 là TRUE hoặc bị bỏ qua, hàm ADDRESS trả về tham chiếu kiểu A1; nếu là FALSE, hàm ADDRESS trả về tham chiếu kiểu R1C1.',
            },
            sheet_text: {
                name: 'Tên trang tính',
                detail: "Một giá trị văn bản xác định tên trang tính sẽ được sử dụng làm tham chiếu bên ngoài. Ví dụ: công thức =ADDRESS (1,1,,,'Sheet2') trả về Sheet2！$A$1. Nếu tham số sheet_text bị bỏ qua, tên trang tính sẽ không được sử dụng và hàm trả về tham chiếu địa chỉ đến ô trên trang tính hiện tại.",
            },
        },
    },
    AREAS: {
        description: 'Trả về số lượng vùng trong tham chiếu',
        abstract: 'Trả về số lượng vùng trong tham chiếu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/areas-%E5%87%BD%E6%95%B0-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    CHOOSE: {
        description: 'Chọn giá trị từ danh sách các giá trị.',
        abstract: 'Chọn giá trị từ danh sách các giá trị',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/choose-%E5%87%BD%E6%95%B0-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            indexNum: {
                name: 'Chỉ số',
                detail: 'Dùng để chỉ định giá trị tham số được chọn. index_num phải là một số từ 1 đến 254 hoặc là một công thức hoặc tham chiếu ô chứa một số từ 1 đến 254.\nNếu index_num là 1, hàm CHOOSE trả về value1; nếu là 2, hàm CHOOSE trả về value2, và cứ như vậy.\nNếu index_num nhỏ hơn 1 hoặc lớn hơn chỉ số của giá trị cuối cùng trong danh sách, hàm CHOOSE trả về giá trị lỗi #VALUE!\nNếu index_num là số thập phân, nó sẽ bị cắt bỏ thành số nguyên trước khi sử dụng.',
            },
            value1: {
                name: 'Giá trị 1',
                detail: 'CHOOSE sẽ chọn một giá trị hoặc hành động từ các giá trị này dựa trên index_num. Tham số có thể là số, tham chiếu ô, tên được định nghĩa, công thức, hàm hoặc văn bản.',
            },
            value2: { name: 'Giá trị 2', detail: '1 đến 254 tham số giá trị.' },
        },
    },
    CHOOSECOLS: {
        description: 'Trả về các cột cụ thể trong mảng',
        abstract: 'Trả về các cột cụ thể trong mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/choosecols-%E5%87%BD%E6%95%B0-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    CHOOSEROWS: {
        description: 'Trả về các hàng cụ thể trong mảng',
        abstract: 'Trả về các hàng cụ thể trong mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/chooserows-%E5%87%BD%E6%95%B0-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    COLUMN: {
        description: 'Trả về số cột của tham chiếu ô đã cho.',
        abstract: 'Trả về số cột của tham chiếu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/column-%E5%87%BD%E6%95%B0-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            reference: { name: 'Tham chiếu', detail: 'Ô hoặc phạm vi ô mà bạn muốn trả về số cột.' },
        },
    },
    COLUMNS: {
        description: 'Trả về số cột trong mảng hoặc tham chiếu.',
        abstract: 'Trả về số cột trong tham chiếu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/columns-%E5%87%BD%E6%95%B0-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            array: { name: 'Mảng', detail: 'Mảng, công thức mảng hoặc tham chiếu đến phạm vi ô mà bạn muốn đếm số cột.' },
        },
    },
    DROP: {
        description: 'Loại bỏ một số lượng hàng hoặc cột cụ thể từ đầu hoặc cuối của mảng',
        abstract: 'Loại bỏ một số lượng hàng hoặc cột cụ thể từ đầu hoặc cuối của mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/drop-%E5%87%BD%E6%95%B0-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },
    EXPAND: {
        description: 'Mở rộng mảng hoặc điền vào kích thước hàng và cột chỉ định',
        abstract: 'Mở rộng mảng hoặc điền vào kích thước hàng và cột chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/expand-%E5%87%BD%E6%95%B0-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'đầu tiên' },
            number2: { name: 'number2', detail: 'thứ hai' },
        },
    },

};
