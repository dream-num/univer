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
            row_num: { name: 'số hàng', detail: 'Một giá trị số xác định số hàng sẽ sử dụng trong tham chiếu ô.' },
            column_num: { name: 'số cột', detail: 'Một giá trị số xác định số cột sẽ sử dụng trong tham chiếu ô.' },
            abs_num: { name: 'loại tham chiếu', detail: 'Một giá trị số xác định loại tham chiếu sẽ trả về.' },
            a1: {
                name: 'kiểu tham chiếu',
                detail: 'Một giá trị logic xác định kiểu tham chiếu A1 hoặc R1C1. Trong kiểu A1, cột và hàng được đánh dấu bằng chữ cái và số tương ứng. Trong kiểu tham chiếu R1C1, cả cột và hàng đều được đánh số. Nếu tham số A1 là TRUE hoặc bị bỏ qua, hàm ADDRESS trả về tham chiếu kiểu A1; nếu là FALSE, hàm ADDRESS trả về tham chiếu kiểu R1C1.',
            },
            sheet_text: {
                name: 'tên trang tính',
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
            reference: { name: 'tham chiếu', detail: 'Tham chiếu tới một ô hoặc phạm vi ô và có thể tham chiếu tới nhiều vùng.' },
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
                name: 'chỉ số',
                detail: 'Dùng để chỉ định giá trị tham số được chọn. index_num phải là một số từ 1 đến 254 hoặc là một công thức hoặc tham chiếu ô chứa một số từ 1 đến 254.\nNếu index_num là 1, hàm CHOOSE trả về value1; nếu là 2, hàm CHOOSE trả về value2, và cứ như vậy.\nNếu index_num nhỏ hơn 1 hoặc lớn hơn chỉ số của giá trị cuối cùng trong danh sách, hàm CHOOSE trả về giá trị lỗi #VALUE!\nNếu index_num là số thập phân, nó sẽ bị cắt bỏ thành số nguyên trước khi sử dụng.',
            },
            value1: {
                name: 'giá trị 1',
                detail: 'CHOOSE sẽ chọn một giá trị hoặc hành động từ các giá trị này dựa trên index_num. Tham số có thể là số, tham chiếu ô, tên được định nghĩa, công thức, hàm hoặc văn bản.',
            },
            value2: { name: 'giá trị 2', detail: '1 đến 254 tham số giá trị.' },
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
            array: { name: 'mảng', detail: 'Mảng chứa các cột được trả về trong mảng mới.' },
            colNum1: { name: 'số cột 1', detail: 'Cột đầu tiên sẽ được trả về.' },
            colNum2: { name: 'số cột 2', detail: 'Các cột khác sẽ được trả về.' },
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
            array: { name: 'mảng', detail: 'Mảng chứa các cột được trả về trong mảng mới.' },
            rowNum1: { name: 'số hàng 1', detail: 'Số hàng đầu tiên cần trả về.' },
            rowNum2: { name: 'số hàng 2', detail: 'Số hàng bổ sung cần trả về.' },
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
            reference: { name: 'tham chiếu', detail: 'Ô hoặc phạm vi ô mà bạn muốn trả về số cột.' },
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
            array: { name: 'mảng', detail: 'Mảng, công thức mảng hoặc tham chiếu đến phạm vi ô mà bạn muốn đếm số cột.' },
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
            array: { name: 'mảng', detail: 'Mảng mà từ đó thả hàng hoặc cột.' },
            rows: { name: 'số hàng', detail: 'Số hàng cần thả. Giá trị âm giảm từ cuối mảng.' },
            columns: { name: 'số cột', detail: 'Số cột cần loại trừ. Giá trị âm giảm từ cuối mảng.' },
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
            array: { name: 'mảng', detail: 'Mảng cần bung rộng.' },
            rows: { name: 'số hàng', detail: 'Số hàng trong mảng đã bung rộng. Nếu thiếu, hàng sẽ không được bung rộng.' },
            columns: { name: 'số cột', detail: 'Số cột trong mảng đã bung rộng. Nếu thiếu, cột sẽ không được bung rộng.' },
            padWith: { name: 'giá trị cần đệm', detail: 'Giá trị cần đệm. Mặc định là #N/A.' },
        },
    },
    FILTER: {
        description: 'Hàm FILTER lọc một phạm vi dữ liệu dựa trên các điều kiện đã xác định.',
        abstract: 'Hàm FILTER lọc một phạm vi dữ liệu dựa trên các điều kiện đã xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/filter-%E5%87%BD%E6%95%B0-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc dải ô cần lọc.' },
            include: { name: 'mảng boolean', detail: 'Mảng các giá trị Boolean, trong đó TRUE biểu thị một hàng hoặc cột cần giữ lại.' },
            ifEmpty: { name: 'trả về giá trị null', detail: 'Trả về nếu không có mục nào được giữ lại.' },
        },
    },
    FORMULATEXT: {
        description: 'Trả về công thức ở dạng chuỗi.',
        abstract: 'Trả về công thức ở dạng chuỗi.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/formulatext-%E5%87%BD%E6%95%B0-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            reference: { name: 'tham khảo', detail: 'Tham chiếu đến một ô hoặc phạm vi ô.' },
        },
    },
    HLOOKUP: {
        description: 'Tìm kiếm một giá trị ở hàng đầu tiên của bảng hoặc trong một mảng số và trả về giá trị trong cột của hàng được chỉ định trong bảng hoặc mảng.',
        abstract: 'Tìm hàng đầu tiên của mảng và trả về giá trị của ô đã chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/hlookup-%E5%87%BD%E6%95%B0-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'tìm giá trị',
                detail: 'Giá trị cần tìm. Giá trị được tìm thấy phải nằm ở hàng đầu tiên của phạm vi ô được chỉ định trong tham số table_array.',
            },
            tableArray: {
                name: 'phạm vi',
                detail: 'Phạm vi ô trong đó VLOOKUP tìm kiếm lookup_value và trả về giá trị. Bảng thông tin để tìm dữ liệu. Sử dụng tham chiếu đến một vùng hoặc tên vùng.',
            },
            rowIndexNum: {
                name: 'số dòng',
                detail: 'Giá trị khớp số hàng table_array sẽ trả về số hàng (row_index_num là 1, trả về giá trị hàng đầu tiên trong table_array, row_index_num 2 trả về giá trị hàng thứ hai trong table_array).',
            },
            rangeLookup: {
                name: 'loại truy vấn',
                detail: 'Chỉ định xem bạn muốn tìm kết quả khớp chính xác hay kết quả khớp gần đúng: kết quả khớp gần đúng mặc định - 1/TRUE, kết quả khớp chính xác - 0/FALSE.',
            },
        },
    },
    HSTACK: {
        description: 'Nối mảng theo chiều ngang và tuần tự để trả về mảng lớn hơn',
        abstract: 'Nối mảng theo chiều ngang và tuần tự để trả về mảng lớn hơn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/hstack-%E5%87%BD%E6%95%B0-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng', detail: 'Mảng để nối thêm.' },
            array2: { name: 'mảng', detail: 'Mảng để nối thêm.' },
        },
    },
    INDEX: {
        description: 'Trả về tham chiếu của ô nằm ở giao cắt của một hàng và cột cụ thể. Nếu tham chiếu được tạo thành từ các vùng chọn không liền kề, bạn có thể chọn vùng chọn để tìm trong đó.',
        abstract: 'Chọn một giá trị từ một tham chiếu hoặc mảng bằng chỉ mục',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/index-%E5%87%BD%E6%95%B0-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            reference: { name: 'tham khảo', detail: 'Tham chiếu tới một hoặc nhiều phạm vi ô.' },
            rowNum: { name: 'số dòng', detail: 'Số hàng trong tham chiếu từ đó trả về một tham chiếu.' },
            columnNum: { name: 'số cột', detail: 'Số cột trong tham chiếu từ đó trả về một tham chiếu.' },
            areaNum: { name: 'số khu vực', detail: 'Chọn một phạm vi trong tham chiếu mà từ đó trả về giao điểm của row_num và column_num.' },
        },
    },
    INDIRECT: {
        description: 'Trả về tham chiếu được chỉ rõ bởi một chuỗi văn bản. Các tham chiếu có thể được đánh giá tức thì để hiển thị nội dung của chúng.',
        abstract: 'Trả về tham chiếu được chỉ rõ bởi một chuỗi văn bản.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/indirect-%E5%87%BD%E6%95%B0-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            refText: { name: 'văn bản trích dẫn', detail: 'Tham chiếu tới một ô có chứa kiểu tham chiếu A1, kiểu tham chiếu R1C1, tên đã xác định dưới dạng tham chiếu, hoặc tham chiếu tới ô dưới dạng chuỗi văn bản.' },
            a1: { name: 'loại tham chiếu', detail: 'Một giá trị lô-gic chỉ rõ kiểu tham chiếu nào được chứa trong văn bản tham chiếu ô.' },
        },
    },
    LOOKUP: {
        description: 'Được sử dụng khi bạn cần truy vấn một hàng hoặc cột và tìm giá trị ở cùng vị trí trong hàng hoặc cột khác',
        abstract: 'Tìm một giá trị trong một vectơ hoặc mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/lookup-%E5%87%BD%E6%95%B0-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'tìm giá trị',
                detail: 'Giá trị cần tìm trong vectơ đầu tiên. Có thể là số, văn bản, giá trị logic, tên hoặc tham chiếu đến một giá trị.',
            },
            lookupVectorOrArray: { name: 'phạm vi truy vấn hoặc mảng', detail: 'Một dải ô chỉ chứa một hàng hoặc cột.' },
            resultVector: {
                name: 'phạm vi kết quả',
                detail: 'Một dải ô chỉ chứa một hàng hoặc cột. Đối số phải có cùng kích thước với đối số lookup_vector. Kích thước của chúng phải giống nhau.',
            },
        },
    },
    MATCH: {
        description: 'Hàm MATCH tìm một mục được chỉ định trong phạm vi của ô, sau đó trả về vị trí tương đối của mục đó trong phạm vi này.',
        abstract: 'Tìm một giá trị trong một tham chiếu hoặc mảng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/match-%E5%87%BD%E6%95%B0-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'giá trị tìm kiếm', detail: 'Giá trị mà bạn muốn so khớp trong mảng tìm kiếm.' },
            lookupArray: { name: 'mảng tìm kiếm', detail: 'Phạm vi ô được tìm kiếm.' },
            matchType: { name: 'kiểu khớp', detail: 'Số -1, 0 hoặc 1.' },
        },
    },
    OFFSET: {
        description: 'Trả về offset tham chiếu từ tham chiếu đã cho',
        abstract: 'Trả về offset tham chiếu từ tham chiếu đã cho',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/offset-%E5%87%BD%E6%95%B0-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            reference: { name: 'tham chiếu', detail: 'Vùng tham chiếu mà bạn muốn căn cứ khoảng cách tham chiếu vào đó.' },
            rows: { name: 'số hàng', detail: 'Số hàng, lên hoặc xuống, mà bạn muốn ô ở góc trên bên trái tham chiếu tới.' },
            cols: { name: 'số cột', detail: 'Số cột, về bên trái hoặc phải, mà bạn muốn ô ở góc trên bên trái của kết quả tham chiếu tới.' },
            height: { name: 'chiều cao', detail: 'Chiều cao, tính bằng số hàng, mà bạn muốn có cho tham chiếu trả về. Chiều cao phải là số dương.' },
            width: { name: 'Độ rộng', detail: 'Độ rộng, tính bằng số cột, mà bạn muốn có cho tham chiếu trả về. Độ rộng phải là số dương.' },
        },
    },
    ROW: {
        description: 'Trả về số hàng được tham chiếu bởi ô đã cho.',
        abstract: 'Trả về số hàng của một tham chiếu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/row-%E5%87%BD%E6%95%B0-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            reference: { name: 'tham chiếu', detail: 'Ô hoặc phạm vi ô mà bạn muốn lấy số hàng của chúng.' },
        },
    },
    ROWS: {
        description: 'Trả về số của các hàng trong một tham chiếu hoặc một mảng.',
        abstract: 'Trả về số của các hàng trong một tham chiếu hoặc một mảng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rows-%E5%87%BD%E6%95%B0-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Một mảng, công thức mảng hay tham chiếu đến phạm vi ô mà bạn muốn lấy số hàng.' },
        },
    },
    SORT: {
        description: 'Sắp xếp nội dung của một phạm vi hoặc mảng',
        abstract: 'Sắp xếp nội dung của một phạm vi hoặc mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sort-%E5%87%BD%E6%95%B0-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Dải ô hoặc mảng để sắp xếp.' },
            sortIndex: { name: 'chỉ mục sắp xếp', detail: 'Số cho biết hàng hoặc cột để sắp xếp theo.' },
            sortOrder: { name: 'thứ tự sắp xếp', detail: 'Số cho biết thứ tự sắp xếp mong muốn; 1 cho thứ tự tăng dần (mặc định), -1 cho thứ tự giảm dần.' },
            byCol: { name: 'hướng sắp xếp', detail: 'Giá trị lô-gic cho biết hướng sắp xếp mong muốn; FALSE để sắp xếp theo hàng (mặc định), TRUE để sắp xếp theo cột.' },
        },
    },
    SORTBY: {
        description: 'Sắp xếp nội dung của một phạm vi hoặc mảng dựa trên các giá trị trong phạm vi hoặc mảng tương ứng',
        abstract: 'Sắp xếp nội dung của một phạm vi hoặc mảng dựa trên các giá trị trong phạm vi hoặc mảng tương ứng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sortby-%E5%87%BD%E6%95%B0-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc dải ô cần sắp xếp' },
            byArray1: { name: 'sắp xếp mảng 1', detail: 'Mảng hoặc dải ô cần sắp xếp theo' },
            sortOrder1: { name: 'thứ tự sắp xếp 1', detail: 'Thứ tự dùng để sắp xếp. 1 cho tăng dần, -1 cho giảm dần. Mặc định là tăng dần.' },
            byArray2: { name: 'sắp xếp mảng 2', detail: 'Mảng hoặc dải ô cần sắp xếp theo' },
            sortOrder2: { name: 'thứ tự sắp xếp 2', detail: 'Thứ tự dùng để sắp xếp. 1 cho tăng dần, -1 cho giảm dần. Mặc định là tăng dần.' },
        },
    },
    TAKE: {
        description: 'Trả về một số hàng hoặc cột liền kề đã xác định từ điểm bắt đầu hoặc kết thúc của một mảng.',
        abstract: 'Trả về một số hàng hoặc cột liền kề đã xác định từ điểm bắt đầu hoặc kết thúc của một mảng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/take-%E5%87%BD%E6%95%B0-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng lấy hàng hoặc cột từ đó.' },
            rows: { name: 'số hàng', detail: 'Số hàng cần thực hiện. Giá trị âm lấy từ cuối mảng.' },
            columns: { name: 'số cột', detail: 'Số cột cần thực hiện. Giá trị âm lấy từ cuối mảng.' },
        },
    },
    TOCOL: {
        description: 'Trả về mảng trong một cột đơn.',
        abstract: 'Trả về mảng trong một cột đơn.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/tocol-%E5%87%BD%E6%95%B0-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc tham chiếu muốn trả về dưới dạng cột.' },
            ignore: { name: 'bỏ qua giá trị', detail: 'Có bỏ qua một số kiểu giá trị nhất định hay không. Theo mặc định, không có giá trị nào bị bỏ qua. Xác định một trong những hành động sau:\n0 Giữ tất cả các giá trị (mặc định)\n1 Bỏ qua giá trị trống\n2 Bỏ qua lỗi\n3 Bỏ qua giá trị trống và lỗi' },
            scanByColumn: { name: 'quét mảng theo cột', detail: 'Quét mảng theo cột. Theo mặc định, mảng được quét theo hàng. Quét xác định xem các giá trị được sắp xếp theo hàng hay theo cột.' },
        },
    },
    TOROW: {
        description: 'Trả về mảng trong một hàng đơn.',
        abstract: 'Trả về mảng trong một hàng đơn.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/torow-%E5%87%BD%E6%95%B0-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc tham chiếu muốn trả về dưới dạng một hàng.' },
            ignore: { name: 'bỏ qua giá trị', detail: 'Có bỏ qua một số kiểu giá trị nhất định hay không. Theo mặc định, không có giá trị nào bị bỏ qua. Xác định một trong những hành động sau:\n0 Giữ tất cả các giá trị (mặc định)\n1 Bỏ qua giá trị trống\n2 Bỏ qua lỗi\n3 Bỏ qua giá trị trống và lỗi' },
            scanByColumn: { name: 'quét mảng theo cột', detail: 'Quét mảng theo cột. Theo mặc định, mảng được quét theo hàng. Quét xác định xem các giá trị được sắp xếp theo hàng hay theo cột.' },
        },
    },
    TRANSPOSE: {
        description: 'Trả về chuyển vị của một mảng',
        abstract: 'Trả về chuyển vị của một mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/transpose-%E5%87%BD%E6%95%B0-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Một mảng hay một phạm vi nhiều ô trên trang tính mà bạn muốn hoán đổi.' },
        },
    },
    UNIQUE: {
        description: 'trả về danh sách các giá trị duy nhất trong một danh sách hoặc dải ô. ',
        abstract: 'trả về danh sách các giá trị duy nhất trong một danh sách hoặc dải ô. ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/unique-%E5%87%BD%E6%95%B0-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Dải ô hoặc mảng mà từ đó trả về các hàng hoặc cột duy nhất' },
            byCol: { name: 'theo cột', detail: 'Là giá trị logic: so sánh các hàng với nhau và trả về giá trị duy nhất = FALSE hoặc bị bỏ qua so sánh các cột với nhau và trả về giá trị duy nhất = TRUE.' },
            exactlyOnce: { name: 'chỉ một lần', detail: 'Là một giá trị logic: trả về một hàng hoặc cột chỉ xuất hiện một lần từ một mảng = TRUE; trả về tất cả các hàng hoặc cột riêng biệt từ một mảng = FALSE hoặc bị bỏ qua.' },
        },
    },
    VLOOKUP: {
        description: 'Sử dụng VLOOKUP khi bạn cần tìm thứ gì đó theo hàng trong bảng hoặc dải ô. Ví dụ: tìm giá phụ tùng ô tô theo số bộ phận hoặc tìm tên nhân viên dựa trên ID nhân viên của họ.',
        abstract: 'Tìm trong cột đầu tiên của mảng và di chuyển giữa các hàng để trả về giá trị của ô',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/vlookup-%E5%87%BD%E6%95%B0-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'tìm giá trị',
                detail: 'Giá trị cần tìm. Giá trị được tìm thấy phải nằm ở hàng đầu tiên của phạm vi ô được chỉ định trong tham số table_array.',
            },
            tableArray: {
                name: 'phạm vi',
                detail: 'Phạm vi ô trong đó VLOOKUP tìm kiếm lookup_value và trả về giá trị. Bảng thông tin để tìm dữ liệu. Sử dụng tham chiếu đến một vùng hoặc tên vùng.',
            },
            colIndexNum: {
                name: 'Số cột',
                detail: 'Số ô chứa giá trị trả về (ô ngoài cùng bên trái của table_array được đánh số bắt đầu bằng 1).',
            },
            rangeLookup: {
                name: 'loại truy vấn',
                detail: 'Chỉ định xem bạn muốn tìm kết quả khớp chính xác hay kết quả khớp gần đúng: kết quả khớp gần đúng mặc định - 1/TRUE, kết quả khớp chính xác - 0/FALSE.',
            },
        },
    },
    VSTACK: {
        description: 'Nối các mảng theo chiều dọc để trả về mảng lớn hơn',
        abstract: 'Nối các mảng theo chiều dọc để trả về mảng lớn hơn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/vstack-%E5%87%BD%E6%95%B0-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng', detail: 'Mảng để nối thêm.' },
            array2: { name: 'mảng', detail: 'Mảng để nối thêm.' },
        },
    },
    WRAPCOLS: {
        description: 'Ngắt dòng hoặc cột giá trị được cung cấp theo cột sau một số lượng các thành phần được chỉ định để tạo thành một mảng mới.',
        abstract: 'Ngắt dòng hoặc cột giá trị được cung cấp theo cột sau một số lượng các thành phần được chỉ định để tạo thành một mảng mới.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/wrapcols-%E5%87%BD%E6%95%B0-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            vector: { name: 'véc-tơ', detail: 'Véc-tơ hoặc tham chiếu để ngắt dòng.' },
            wrapCount: { name: 'số lần ngắt dòng', detail: 'Số lượng giá trị tối đa cho mỗi cột.' },
            padWith: { name: 'giá trị cần đệm', detail: 'Giá trị cần đệm. Mặc định là #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Ngắt dòng hoặc cột giá trị được cung cấp theo hàng sau một số lượng các thành phần được chỉ định để tạo thành một mảng mới.',
        abstract: 'Ngắt dòng hoặc cột giá trị được cung cấp theo hàng sau một số lượng các thành phần được chỉ định để tạo thành một mảng mới.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/wraprows-%E5%87%BD%E6%95%B0-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            vector: { name: 'véc-tơ', detail: 'Véc-tơ hoặc tham chiếu để ngắt dòng.' },
            wrapCount: { name: 'số lần ngắt dòng', detail: 'Số lượng giá trị tối đa cho mỗi hàng.' },
            padWith: { name: 'giá trị cần đệm', detail: 'Giá trị cần đệm. Mặc định là #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Hàm tìm kiếm một phạm vi hoặc mảng và trả về mục tương ứng với kết quả khớp đầu tiên mà nó tìm thấy. Nếu không có kết quả khớp nào tồn tại, XLOOKUP có thể trả về kết quả khớp (gần đúng) gần nhất',
        abstract: 'Tìm kiếm một phạm vi hoặc mảng và trả về mục tương ứng với kết quả khớp đầu tiên được tìm thấy.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/xlookup-%E5%87%BD%E6%95%B0-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'tìm giá trị',
                detail: 'Giá trị cần tìm kiếm. Nếu bị bỏ qua, XLOOKUP sẽ trả về các ô trống được tìm thấy trong lookup_array.',
            },
            lookupArray: { name: 'khu vực tìm kiếm', detail: 'Mảng hoặc dải ô cần tìm kiếm.' },
            returnArray: { name: 'khu vực trả lại', detail: 'Mảng hoặc dải ô cần trả về' },
            ifNotFound: {
                name: 'giá trị hiển thị mặc định',
                detail: 'Trả về văn bản [if_not_found] mà bạn đã cung cấp nếu không tìm thấy kết quả khớp hợp lệ, nếu không thì trả về #N/A',
            },
            matchMode: {
                name: 'loại so khớp',
                detail: 'Chỉ định loại đối sánh: 0 - Đối sánh chính xác. Nếu không tìm thấy thì trả về #N/A. Tùy chọn mặc định. -1 - một kết quả khớp chính xác. Nếu không tìm thấy, mục nhỏ hơn tiếp theo sẽ được trả về. 1 - một trận đấu chính xác. Nếu không tìm thấy, mục lớn hơn tiếp theo sẽ được trả về. 2 - Khớp ký tự đại diện, trong đó *, ? và ~ có ý nghĩa đặc biệt.',
            },
            searchMode: {
                name: 'chế độ tìm kiếm',
                detail: 'Chỉ định chế độ tìm kiếm sẽ sử dụng: 1 Thực hiện tìm kiếm bắt đầu từ mục đầu tiên, tùy chọn mặc định. -1 Thực hiện tìm kiếm ngược bắt đầu từ mục cuối cùng. 2 thực hiện tìm kiếm nhị phân phụ thuộc vào lookup_array được sắp xếp theo thứ tự tăng dần, -2 thực hiện tìm kiếm nhị phân phụ thuộc vào lookup_array được sắp xếp theo thứ tự giảm dần.',
            },
        },
    },
    XMATCH: {
        description: 'Tìm kiếm một mục được chỉ định trong một mảng hoặc phạm vi ô và trả về vị trí tương đối của mục đó.',
        abstract: 'Trả về vị trí tương đối của một mục trong một mảng hoặc phạm vi ô.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/xmatch-%E5%87%BD%E6%95%B0-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'tìm giá trị', detail: 'tìm giá trị.' },
            lookupArray: { name: 'khu vực tìm kiếm', detail: 'Mảng hoặc dải ô cần tìm kiếm.' },
            matchMode: { name: 'loại so khớp', detail: 'Chỉ định loại đối sánh:\n0 - đối sánh chính xác (mặc định)\n-1 - đối sánh chính xác hoặc mục nhỏ nhất tiếp theo\n1 - đối sánh chính xác hoặc mục lớn nhất tiếp theo\n2 - đối sánh ký tự đại diện, trong đó *, ? và ~ có ý nghĩa đặc biệt .' },
            searchMode: { name: 'loại tìm kiếm', detail: 'Chỉ định loại tìm kiếm: \n1 - Tìm kiếm từ đầu đến cuối (mặc định) \n-1 - Tìm kiếm từ cuối đến đầu (tìm kiếm ngược). \n2 - Thực hiện tìm kiếm nhị phân dựa trên việc sắp xếp lookup_array theo thứ tự tăng dần. Nếu không được sắp xếp, kết quả không hợp lệ sẽ được trả về. \n2 - Thực hiện tìm kiếm nhị phân dựa trên lookup_array được sắp xếp theo thứ tự giảm dần. Nếu không được sắp xếp, kết quả không hợp lệ sẽ được trả về.' },
        },
    },
};
