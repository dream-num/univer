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
    ADDRESS: {
        description: 'Trả về địa chỉ của một ô trong một trang tính dựa trên số hàng và cột đã chỉ định. Ví dụ: ADDRESS(2,3) trả về $C$2. Ví dụ khác: ADDRESS(77,300) trả về $KN$77. Bạn có thể sử dụng các hàm khác như ROW và COLUMN để cung cấp các tham số hàng và cột cho hàm ADDRESS.',
        abstract: 'Trả về tham chiếu đến một ô trong trang tính dưới dạng văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/address-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/areas-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/choose-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/choosecols-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chooserows-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/column-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/columns-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/drop-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/expand-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/filter-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'tham khảo', detail: 'Tham chiếu đến một ô hoặc phạm vi ô.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Hàm GETPIVOTDATA trả về dữ liệu hiển thị từ PivotTable.',
        abstract: 'Hàm GETPIVOTDATA trả về dữ liệu hiển thị từ PivotTable.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: 'Tên của trường PivotTable có chứa dữ liệu mà bạn muốn truy xuất. Thông tin này cần nằm trong dấu ngoặc kép. Ví dụ: =GETPIVOTDATA("Doanh số", A3). Ở đây, "Doanh số" là trường Giá trị mà chúng tôi muốn truy xuất. Vì không có trường nào khác được xác định, hàm GETPIVOTDATA trả về tổng doanh thu.' },
            pivotTable: { name: 'pivotTable', detail: 'Tham chiếu tới bất kỳ ô, phạm vi ô hoặc phạm vi ô đã đặt tên trong PivotTable. Thông tin này dùng để xác định PivotTable nào có chứa dữ liệu mà bạn muốn truy xuất. Ví dụ: =GETPIVOTDATA("Doanh số", A3). Ở đây, A3 là một tham chiếu bên trong PivotTable và cho công thức biết cần dùng PivotTable nào.' },
            field1: { name: 'field1', detail: '1 tới 126 tên trường và tên mục mô tả dữ liệu mà bạn muốn truy xuất. Các cặp có thể theo bất kỳ trật tự nào. Tên trường và tên mục không phải là ngày tháng và số cần được đặt trong dấu ngoặc kép. Ví dụ: =GETPIVOTDATA("Doanh số", A3, "Tháng", "Tháng Ba"). Ở đây, "Tháng" là trường và "Tháng Ba" là mục. Để chỉ định nhiều mục cho một trường, hãy đặt chúng trong dấu ngoặc nhọn (ví dụ: {"Mar", "Tháng 4"}). Đối với PivotTable OLAP , các mục có thể chứa tên nguồn của kích thước cũng như tên nguồn của mục. Một cặp trường và mục cho một OLAP PivotTable có thể giống như thế này: "[Sản phẩm]","[Sản phẩm].[Tất cả Sản phẩm].[Thực phẩm].[Đồ Nướng]"' },
            item1: { name: 'item1', detail: '1 tới 126 tên trường và tên mục mô tả dữ liệu mà bạn muốn truy xuất. Các cặp có thể theo bất kỳ trật tự nào. Tên trường và tên mục không phải là ngày tháng và số cần được đặt trong dấu ngoặc kép. Ví dụ: =GETPIVOTDATA("Doanh số", A3, "Tháng", "Tháng Ba"). Ở đây, "Tháng" là trường và "Tháng Ba" là mục. Để chỉ định nhiều mục cho một trường, hãy đặt chúng trong dấu ngoặc nhọn (ví dụ: {"Mar", "Tháng 4"}). Đối với PivotTable OLAP , các mục có thể chứa tên nguồn của kích thước cũng như tên nguồn của mục. Một cặp trường và mục cho một OLAP PivotTable có thể giống như thế này: "[Sản phẩm]","[Sản phẩm].[Tất cả Sản phẩm].[Thực phẩm].[Đồ Nướng]"' },
        },
    },
    HLOOKUP: {
        description: 'Tìm kiếm một giá trị trong hàng trên cùng của một bảng hoặc một mảng giá trị, rồi trả về một giá trị trong cùng một cột từ một hàng mà bạn chỉ định trong bảng hoặc mảng. Dùng hàm HLOOKUP khi các giá trị so sánh của bạn nằm ở một hàng nằm ngang ở trên cùng một bảng dữ liệu và bạn muốn tìm xuôi xuống một số hàng đã xác định. Dùng VLOOKUP khi các giá trị so sánh của bạn nằm trong một cột ở bên trái của dữ liệu mà bạn muốn tìm.',
        abstract: 'Tìm kiếm một giá trị trong hàng trên cùng của một bảng hoặc một mảng giá trị, rồi trả về một giá trị trong cùng một cột từ một hàng mà bạn chỉ định trong bảng hoặc mảng. Dùng hàm HLOOKUP khi các giá trị so sánh của bạn nằm ở một hàng nằm ngang ở trên cùng một bảng dữ liệu và bạn muốn tìm xuôi xuống một số hàng đã xác định. Dùng VLOOKUP khi các giá trị so sánh của bạn nằm trong một cột ở bên trái của dữ liệu mà bạn muốn tìm.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'tìm giá trị', detail: 'Yêu cầu. Giá trị cần tìm trong hàng thứ nhất của bảng. Lookup_value có thể là một giá trị, tham chiếu hoặc chuỗi văn bản.' },
            tableArray: { name: 'phạm vi', detail: 'Yêu cầu. Một bảng thông tin để tìm kiếm dữ liệu trong đó. Hãy dùng tham chiếu tới một phạm vi hoặc một tên phạm vi. Các giá trị trong hàng thứ nhất của table_array có thể là văn bản, số hoặc giá trị lô-gic. Nếu range_lookup là TRUE, các giá trị trong hàng thứ nhất của table_array phải được đặt theo thứ tự tăng dần: ...-2, -1, 0, 1, 2,... , A-Z, FALSE, TRUE; nếu không, hàm HLOOKUP có thể đưa ra giá trị không đúng. Nếu range_lookup là FALSE, thì không cần phải sắp xếp table_array. Văn bản chữ hoa và chữ thường tương đương nhau. Sắp xếp các giá trị theo thứ tự tăng dần, từ trái sang phải. Để biết thêm thông tin, vui lòng xem mục Sắp xếp dữ liệu trong dải ô hoặc bảng .' },
            rowIndexNum: { name: 'số dòng', detail: 'Yêu cầu. Số hàng trong ô table_array giá trị khớp sẽ được trả về từ đó. Một row_index_num của 1 trả về giá trị hàng thứ nhất trong table_array, một row_index_num/2 trả về giá trị hàng thứ hai trong table_array, v.v. Nếu row_index_num nhỏ hơn 1, hàm HLOOKUP trả về giá #VALUE! giá trị lỗi; nếu row_index_num lớn hơn số hàng trên table_array, hàm HLOOKUP trả về giá #REF! .' },
            rangeLookup: { name: 'loại truy vấn', detail: 'Tùy chọn. Một giá trị lô-gic cho biết bạn có muốn HLOOKUP tìm thấy một kết quả khớp chính xác hay kết quả khớp tương đối. Nếu đối số này là TRUE hoặc được bỏ qua, thì hàm sẽ trả về kết quả khớp tương đối. Nói cách khác, nếu không tìm thấy một kết quả khớp chính xác thì hàm sẽ trả về giá trị lớn nhất kế tiếp nhỏ hơn lookup_value. Nếu đối số này là FALSE, hàm HLOOKUP sẽ tìm một kết quả khớp chính xác. Nếu không tìm thấy kết quả khớp chính xác, hàm sẽ trả về giá trị lỗi #N/A.' },
        },
    },
    HSTACK: {
        description: 'Nối các mảng theo chiều ngang và theo trình tự để trả về một mảng lớn hơn.',
        abstract: 'Nối các mảng theo chiều ngang và theo trình tự để trả về một mảng lớn hơn.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng', detail: 'Mảng để nối thêm.' },
            array2: { name: 'mảng', detail: 'Mảng để nối thêm.' },
        },
    },
    HYPERLINK: {
        description: 'Tạo một đường siêu liên kết bên trong ô.',
        abstract: 'Tạo một đường siêu liên kết bên trong ô.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3093313?hl=vi',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'URL đầy đủ về vị trí liên kết được đóng trong dấu ngoặc kép hoặc tham chiếu đến ô có chứa URL này. Chỉ cho phép một số loại đường liên kết nhất định. Cho phép http:// , https:// , mailto: , aim: , ftp:// , gopher:// , telnet:// và news:// ; các loại khác rõ ràng không được phép. Nếu xác định một giao thức khác, link_label sẽ hiển thị trong ô, nhưng sẽ không biến thành siêu liên kết. Nếu không xác định giao thức, thì giao thức mặc định sẽ là http:// và được thêm vào đầu url .' },
            linkLabel: { name: 'nhãn_đường_liên_kết', detail: '[ KHÔNG BẮT BUỘC – url theo mặc định ] – Văn bản cần hiển thị trong ô như là một đường liên kết, được đóng trong dấu ngoặc kép hoặc tham chiếu đến ô có chứa nhãn này. Nếu nhãn_đường_liên_kết là tham chiếu đến một ô rỗng, url sẽ hiển thị dưới dạng đường liên kết nếu hợp lệ, ngược lại là văn bản thuần túy. Nếu link_label là chuỗi rỗng tuyệt đối (""), ô sẽ trông như trống, nhưng vẫn có thể truy cập vào đường liên kết bằng cách nhấp hoặc di chuyển vào ô.' },
        },
    },
    IMAGE: {
        description: 'Hàm IMAGE chèn hình ảnh vào các ô từ vị trí nguồn cùng với văn bản thay thế. Sau đó, bạn có thể di chuyển và thay đổi kích thước ô, sắp xếp và lọc cũng như làm việc với hình ảnh trong bảng Excel. Sử dụng hàm này để cải thiện trực quan các danh sách dữ liệu như hàng tồn kho, trò chơi, nhân viên và các khái niệm toán học.',
        abstract: 'Hàm IMAGE chèn hình ảnh vào các ô từ vị trí nguồn cùng với văn bản thay thế. Sau đó, bạn có thể di chuyển và thay đổi kích thước ô, sắp xếp và lọc cũng như làm việc với hình ảnh trong bảng Excel. Sử dụng hàm này để cải thiện trực quan các danh sách dữ liệu như hàng tồn kho, trò chơi, nhân viên và các khái niệm toán học.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'nguồn', detail: 'Đường dẫn URL sử dụng giao thức "https" của tệp hình ảnh. Bắt buộc.' },
            altText: { name: 'văn bản thay thế', detail: 'Văn bản thay thế mô tả hình ảnh cho khả năng truy nhập.' },
            sizing: { name: 'định cỡ', detail: 'Chỉ định kích thước hình ảnh.' },
            height: { name: 'chiều cao', detail: 'Chiều cao tùy chỉnh của hình ảnh tính bằng pixel.' },
            width: { name: 'độ rộng', detail: 'Chiều rộng tùy chỉnh của hình ảnh tính bằng pixel.' },
        },
    },
    INDEX: {
        description: 'Trả về tham chiếu của ô nằm ở giao cắt của một hàng và cột cụ thể. Nếu tham chiếu được tạo thành từ các vùng chọn không liền kề, bạn có thể chọn vùng chọn để tìm trong đó.',
        abstract: 'Chọn một giá trị từ một tham chiếu hoặc mảng bằng chỉ mục',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/index-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/indirect-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/lookup-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/match-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/offset-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/row-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Một mảng, công thức mảng hay tham chiếu đến phạm vi ô mà bạn muốn lấy số hàng.' },
        },
    },
    RTD: {
        description: 'Truy xuất dữ liệu thời gian thực từ một chương trình có hỗ trợ tự động hóa COM.',
        abstract: 'Truy xuất dữ liệu thời gian thực từ một chương trình có hỗ trợ tự động hóa COM.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'Yêu cầu. Tên progID của bổ trợ tự động hóa COM đã đăng ký đã được cài đặt trên máy tính cục bộ. Tên đặt trong dấu ngoặc kép.' },
            server: { name: 'server', detail: 'Yêu cầu. Tên của máy chủ nơi cần chạy bổ trợ. Nếu không có máy chủ và chương trình hiện đang chạy cục bộ, hãy để trống đối số này. Nếu không thì hãy đặt tên máy chủ trong dấu ngoặc kép (""). Khi đang dùng RTD trong Visual Basic for Applications (VBA), cần phải có cho máy chủ dấu ngoặc kép hoặc thuộc tính NullString của VBA, ngay cả khi máy chủ đang chạy cục bộ.' },
            topic1: { name: 'topic1', detail: 'Topic1 là bắt buộc, các chủ đề tiếp theo là tùy chọn. Các tham số từ 1 đến 253 cùng đại diện cho phần dữ liệu thời gian thực duy nhất.' },
            topic2: { name: 'topic2', detail: 'Topic1 là bắt buộc, các chủ đề tiếp theo là tùy chọn. Các tham số từ 1 đến 253 cùng đại diện cho phần dữ liệu thời gian thực duy nhất.' },
        },
    },
    SORT: {
        description: 'Sắp xếp nội dung của một phạm vi hoặc mảng',
        abstract: 'Sắp xếp nội dung của một phạm vi hoặc mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sort-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sortby-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/take-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/tocol-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/torow-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/transpose-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/unique-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/vlookup-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/vstack-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/wrapcols-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/wraprows-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/xlookup-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/xmatch-function',
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

export default locale;
