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
    ASC: {
        description: 'Chuyển các chữ cái hoặc ký tự Kana toàn chiều rộng (byte kép) trong một chuỗi thành ký tự nửa chiều rộng (byte đơn)',
        abstract: 'Chuyển các chữ cái hoặc ký tự Kana toàn chiều rộng (byte kép) trong một chuỗi thành ký tự nửa chiều rộng (byte đơn)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/asc-%E5%87%BD%E6%95%B0-0b6abf1c-c663-4004-a964-ebc00b723266',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản hoặc tham chiếu tới một ô có chứa văn bản mà bạn muốn thay đổi. Nếu văn bản không chứa chữ nào có độ rộng toàn phần, thì văn bản không thay đổi.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Hàm ARRAYTOTEXT trả về một mảng các giá trị văn bản trong bất kỳ phạm vi nào được chỉ định.',
        abstract: 'Hàm ARRAYTOTEXT trả về một mảng các giá trị văn bản trong bất kỳ phạm vi nào được chỉ định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/arraytotext-%E5%87%BD%E6%95%B0-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng cần trả về dưới dạng văn bản.' },
            format: { name: 'Định dạng của dữ', detail: 'Định dạng của dữ liệu trả về. Nó có thể là một trong hai giá trị: \n0 Mặc định. Định dạng ngắn gọn dễ đọc.\n1 Định dạng nghiêm ngặt bao gồm ký tự thoát và dấu tách hàng. Tạo một chuỗi có thể được phân tích khi nhập vào thanh công thức. Đóng gói các chuỗi trả về trong dấu ngoặc kép, ngoại trừ Booleans, Numbers và Errors.' },
        },
    },
    BAHTTEXT: {
        description: 'Chuyển đổi số thành văn bản bằng định dạng tiền tệ Thái Baht',
        abstract: 'Chuyển đổi số thành văn bản bằng định dạng tiền tệ Thái Baht',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/bahttext-%E5%87%BD%E6%95%B0-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Là số mà bạn muốn chuyển sang văn bản hoặc tham chiếu đến ô có chứa số, hay công thức định trị thành số.' },
        },
    },
    CHAR: {
        description: 'Trả về ký tự được xác định bởi mã số',
        abstract: 'Trả về ký tự được xác định bởi mã số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/char-%E5%87%BD%E6%95%B0-bbd249c8-b36e-4a91-8017-1c133f9b837a',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số từ 1 đến 255 xác định bạn muốn ký tự nào. Ký tự này nằm trong bộ ký tự mà máy tính của bạn dùng.' },
        },
    },
    CLEAN: {
        description: 'Loại bỏ tất cả các ký tự không thể in được khỏi văn bản',
        abstract: 'Loại bỏ tất cả các ký tự không thể in được khỏi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/clean-%E5%87%BD%E6%95%B0-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Bất kỳ thông tin trang tính nào bạn muốn loại bỏ ký tự không in được khỏi đó.' },
        },
    },
    CODE: {
        description: 'Trả về mã số của ký tự đầu tiên trong chuỗi văn bản',
        abstract: 'Trả về mã số của ký tự đầu tiên trong chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/code-%E5%87%BD%E6%95%B0-c32b692b-2ed0-4a04-bdd9-75640144b928',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản mà bạn muốn mã của ký tự đầu tiên cho văn bản đó.' },
        },
    },
    CONCAT: {
        description: 'Kết hợp văn bản từ nhiều vùng và/hoặc chuỗi lại với nhau, nhưng không cung cấp tham số phân tách hoặc IgnoreEmpty.',
        abstract: 'Kết hợp văn bản từ nhiều vùng và/hoặc chuỗi lại với nhau, nhưng không cung cấp tham số phân tách hoặc IgnoreEmpty',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/concat-%E5%87%BD%E6%95%B0-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2',
            },
        ],
        functionParameter: {
            text1: { name: 'bản văn 1', detail: 'Mục văn bản đầu tiên để kết hợp. Có thể là một chuỗi hoặc một mảng chuỗi, chẳng hạn như một vùng ô.' },
            text2: { name: 'bản văn 2', detail: 'Các mục văn bản khác để kết hợp. Có thể lên đến 253 tham số văn bản. Mỗi tham số có thể là một chuỗi hoặc một mảng chuỗi, chẳng hạn như một vùng ô.' },
        },
    },
    CONCATENATE: {
        description: 'Kết hợp nhiều mục văn bản thành một mục văn bản',
        abstract: 'Kết hợp nhiều mục văn bản thành một mục văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/concatenate-%E5%87%BD%E6%95%B0-8f8ae884-2ca8-4f7a-b093-75d702bea31d',
            },
        ],
        functionParameter: {
            text1: { name: 'bản văn 1', detail: 'Mục đầu tiên để kết hợp. Có thể là một giá trị văn bản, một số hoặc một tham chiếu ô.' },
            text2: { name: 'bản văn 2', detail: 'Các mục văn bản khác để kết hợp. Có thể có tối đa 255 mục, tổng cộng hỗ trợ tối đa 8,192 ký tự.' },
        },
    },
    DBCS: {
        description: 'Chuyển các chữ cái hoặc ký tự Kana nửa chiều rộng (byte đơn) trong một chuỗi thành ký tự toàn chiều rộng (byte kép)',
        abstract: 'Chuyển các chữ cái hoặc ký tự Kana nửa chiều rộng (byte đơn) trong một chuỗi thành ký tự toàn chiều rộng (byte kép)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/dbcs-%E5%87%BD%E6%95%B0-a4025e73-63d2-4958-9423-21a24794c9e5',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản hoặc tham chiếu tới một ô có chứa văn bản mà bạn muốn thay đổi. Nếu văn bản không chứa chữ Tiếng Anh có độ rộng bán phần hay katakana nào, thì văn bản không đổi.' },
        },
    },
    DOLLAR: {
        description: 'Chuyển đổi một số thành văn bản bằng cách dùng định dạng tiền tệ',
        abstract: 'Chuyển đổi một số thành văn bản bằng cách dùng định dạng tiền tệ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/dollar-%E5%87%BD%E6%95%B0-a6cd05d9-9740-4ad3-a469-8109d18ff611',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số, tham chiếu đến ô chứa số hoặc công thức sẽ trả về số.' },
            decimals: { name: 'số chữ thập phân', detail: 'Số chữ số nằm bên phải dấu thập phân. Nếu đây là số âm, thì số được làm tròn sang bên trái dấu thập phân. Nếu bạn bỏ qua đối số decimals, nó được giả định là bằng 2.' },
        },
    },
    EXACT: {
        description: 'Kiểm tra xem hai giá trị văn bản có giống nhau hay không',
        abstract: 'Kiểm tra xem hai giá trị văn bản có giống nhau hay không',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/exact-%E5%87%BD%E6%95%B0-f24a4864-e914-4e50-8bdb-7e82048c5c44',
            },
        ],
        functionParameter: {
            text1: { name: 'bản văn 1', detail: 'Chuỗi văn bản đầu tiên.' },
            text2: { name: 'bản văn 2', detail: 'Chuỗi văn bản thứ hai.' },
        },
    },
    FIND: {
        description: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (phân biệt chữ hoa chữ thường)',
        abstract: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (phân biệt chữ hoa chữ thường)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/find-findb-%E5%87%BD%E6%95%B0-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            findText: { name: 'chuỗi tìm kiếm', detail: 'Chuỗi cần tìm trong "Văn bản cần tìm kiếm".' },
            withinText: { name: 'văn bản để tìm kiếm', detail: 'Lần xuất hiện đầu tiên của văn bản để tìm kiếm "chuỗi tìm kiếm".' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Vị trí ký tự để bắt đầu tìm kiếm trong "văn bản cần tìm kiếm". Nếu bỏ qua, giá trị là 1 được giả định.' },
        },
    },
    FINDB: {
        description: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (phân biệt chữ hoa chữ thường)',
        abstract: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (phân biệt chữ hoa chữ thường)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/find-findb-%E5%87%BD%E6%95%B0-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            findText: { name: 'chuỗi tìm kiếm', detail: 'Chuỗi cần tìm trong "Văn bản cần tìm kiếm".' },
            withinText: { name: 'văn bản để tìm kiếm', detail: 'Lần xuất hiện đầu tiên của văn bản để tìm kiếm "chuỗi tìm kiếm".' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Vị trí ký tự để bắt đầu tìm kiếm trong "văn bản cần tìm kiếm". Nếu bỏ qua, giá trị là 1 được giả định.' },
        },
    },
    FIXED: {
        description: 'Làm tròn một số thành một số thập phân đã chỉ định và trả về kết quả dưới dạng văn bản với hoặc không có dấu phân tách thập phân',
        abstract: 'Làm tròn một số thành một số thập phân đã chỉ định và trả về kết quả dưới dạng văn bản với hoặc không có dấu phân tách thập phân',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/fixed-%E5%87%BD%E6%95%B0-621c3e2a-50ea-4b85-aab2-b11a7ff73369',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số bạn muốn làm tròn và chuyển đổi thành văn bản.' },
            decimals: { name: 'số chữ thập phân', detail: 'Số chữ số nằm bên phải dấu thập phân. Nếu đây là số âm, thì số được làm tròn sang bên trái dấu thập phân. Nếu bạn bỏ qua đối số decimals, nó được giả định là bằng 2.' },
            noCommas: { name: 'tắt dấu phân cách', detail: 'Giá trị logic, nếu ĐÚNG, sẽ ngăn FIXED đưa dấu phẩy vào văn bản trả về.' },
        },
    },
    LEFT: {
        description: 'Trả về ký tự ngoài cùng bên trái trong giá trị văn bản',
        abstract: 'Trả về ký tự ngoài cùng bên trái trong giá trị văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/left-leftb-%E5%87%BD%E6%95%B0-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Chuỗi văn bản chứa các ký tự bạn muốn trích xuất.' },
            numChars: { name: 'số ký tự', detail: 'Chỉ định số ký tự bạn muốn LEFT trích xuất.' },
        },
    },
    LEFTB: {
        description: 'Trả về ký tự ngoài cùng bên trái trong giá trị văn bản',
        abstract: 'Trả về ký tự ngoài cùng bên trái trong giá trị văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/left-leftb-%E5%87%BD%E6%95%B0-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Chuỗi văn bản chứa các ký tự bạn muốn trích xuất.' },
            numBytes: { name: 'số Byte', detail: 'Chỉ rõ số ký tự mà bạn muốn hàm LEFTB trích xuất, dựa trên byte.' },
        },
    },
    LEN: {
        description: 'Trả về số lượng ký tự trong một chuỗi văn bản',
        abstract: 'Trả về số lượng ký tự trong một chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/len-lenb-%E5%87%BD%E6%95%B0-e7dc30ca-f8b2-4a7c-8f5b-6e82a0d017ef',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản mà bạn muốn tìm độ dài của nó. Khoảng trống được đếm là ký tự.' },
        },
    },
    LENB: {
        description: 'trả về số byte dùng để biểu thị các ký tự trong một chuỗi văn bản.',
        abstract: 'trả về số byte dùng để biểu thị các ký tự trong một chuỗi văn bản.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/len-lenb-%E5%87%BD%E6%95%B0-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản mà bạn muốn tìm độ dài của nó. Khoảng trống được đếm là ký tự.' },
        },
    },
    LOWER: {
        description: 'Chuyển đổi tất cả các chữ cái trong văn bản thành chữ thường',
        abstract: 'Chuyển đổi tất cả các chữ cái trong văn bản thành chữ thường',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/lower-%E5%87%BD%E6%95%B0-3f21df02-a80c-44b2-afaf-81358f9fdeb4',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản mà bạn muốn chuyển đổi thành chữ thường.' },
        },
    },
    MID: {
        description: 'Trả về một số ký tự cụ thể bắt đầu tại một vị trí được chỉ định trong chuỗi văn bản',
        abstract: 'Trả về một số ký tự cụ thể bắt đầu tại một vị trí được chỉ định trong chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mid-midb-%E5%87%BD%E6%95%B0-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Chuỗi văn bản chứa các ký tự bạn muốn trích xuất.' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Ví trí của ký tự thứ nhất mà bạn muốn trích xuất trong văn bản.' },
            numChars: { name: 'số ký tự', detail: 'Chỉ định số ký tự bạn muốn MID trích xuất.' },
        },
    },
    MIDB: {
        description: 'Trả về một số ký tự cụ thể bắt đầu tại một vị trí được chỉ định trong chuỗi văn bản',
        abstract: 'Trả về một số ký tự cụ thể bắt đầu tại một vị trí được chỉ định trong chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mid-midb-%E5%87%BD%E6%95%B0-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Chuỗi văn bản chứa các ký tự bạn muốn trích xuất.' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Ví trí của ký tự thứ nhất mà bạn muốn trích xuất trong văn bản.' },
            numBytes: { name: 'số Byte', detail: 'Chỉ rõ số ký tự mà bạn muốn hàm MIDB trích xuất, dựa trên byte.' },
        },
    },
    NUMBERSTRING: {
        description: 'Chuyển đổi số sang chuỗi tiếng Trung',
        abstract: 'Chuyển đổi số sang chuỗi tiếng Trung',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị được chuyển đổi thành chuỗi tiếng Trung.' },
            type: { name: 'kiểu', detail: 'Kiểu kết quả trả về.\n1. chữ thường Trung Quốc \n2. Viết hoa chữ Hán \n3. Đọc và viết chữ Hán' },
        },
    },
    NUMBERVALUE: {
        description: 'Chuyển văn bản sang số, theo cách độc lập vị trí.',
        abstract: 'Chuyển văn bản sang số, theo cách độc lập vị trí.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/numbervalue-%E5%87%BD%E6%95%B0-1b05c8cf-2bfa-4437-af70-596c7ea7d879',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản chuyển sang số.' },
            decimalSeparator: { name: 'dấu phân cách thập phân', detail: 'Ký tự dùng để tách số nguyên và phần phân số của kết quả.' },
            groupSeparator: { name: 'dấu phân cách nhóm', detail: 'Ký tự dùng để tách các nhóm số.' },
        },
    },
    PHONETIC: {
        description: 'Trả về chuỗi Furigana từ chuỗi văn bản',
        abstract: 'Trả về chuỗi Furigana từ chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/phonetic-%E5%87%BD%E6%95%B0-d510701f-2a90-4610-9a82-87c874aad6c6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PROPER: {
        description: 'Chuyển đổi chữ cái đầu tiên của mỗi từ trong chuỗi văn bản thành chữ hoa và tất cả các chữ cái khác thành chữ thường',
        abstract: 'Chuyển đổi chữ cái đầu tiên của mỗi từ trong chuỗi văn bản thành chữ hoa và tất cả các chữ cái khác thành chữ thường',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/proper-%E5%87%BD%E6%95%B0-f79f1eeb-bd40-43d3-8273-10362ab89da1',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản được đặt trong dấu ngoặc kép, công thức trả về văn bản hoặc tham chiếu đến ô chứa văn bản mà bạn muốn viết hoa một phần.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Trích xuất chuỗi con khớp đầu tiên theo một biểu thức chính quy.',
        abstract: 'Trích xuất chuỗi con khớp đầu tiên theo một biểu thức chính quy.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3098244?sjid=5628197291201472796-AP&hl=vi',
            },
        ],
        functionParameter: {
            text: { name: 'văn bản', detail: 'Văn bản nhập vào.' },
            regularExpression: { name: 'biểu thức chính quy', detail: 'Phần đầu tiên văn_bản khớp với biểu thức này sẽ được trả về.' },
        },
    },
    REGEXMATCH: {
        description: 'Xem một đoạn văn bản có khớp với một biểu thức chính quy hay không.',
        abstract: 'Xem một đoạn văn bản có khớp với một biểu thức chính quy hay không.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3098292?sjid=5628197291201472796-AP&hl=vi',
            },
        ],
        functionParameter: {
            text: { name: 'văn bản', detail: 'Văn bản cần thử nghiệm theo biểu thức chính quy.' },
            regularExpression: { name: 'biểu thức chính quy', detail: 'Biểu thức chính quy dùng để thử nghiệm văn bản.' },
        },
    },
    REGEXREPLACE: {
        description: 'Thay thế một phần của một chuỗi văn bản bằng một chuỗi văn bản khác bằng cách sử dụng các biểu thức chính quy.',
        abstract: 'Thay thế một phần của một chuỗi văn bản bằng một chuỗi văn bản khác bằng cách sử dụng các biểu thức chính quy.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3098245?sjid=5628197291201472796-AP&hl=vi',
            },
        ],
        functionParameter: {
            text: { name: 'văn bản', detail: 'Văn bản, một phần của văn bản này sẽ được thay thế.' },
            regularExpression: { name: 'biểu thức chính quy', detail: 'Biểu thức chính quy. Tất cả trường hợp phù hợp trong văn_bản sẽ được thay thế.' },
            replacement: { name: 'thay thế', detail: 'Văn bản sẽ được chèn vào văn bản gốc.' },
        },
    },
    REPLACE: {
        description: 'Thay thế ký tự trong văn bản',
        abstract: 'Thay thế ký tự trong văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/replace-replaceb-%E5%87%BD%E6%95%B0-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            oldText: { name: 'văn bản cũ', detail: 'Văn bản mà bạn muốn thay thế một vài ký tự trong đó.' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Vị trí của ký tự đầu tiên trong văn bản cần thay thế.' },
            numChars: { name: 'số ký tự', detail: 'Chỉ định số ký tự bạn muốn REPLACE thay thế.' },
            newText: { name: 'văn bản thay thế', detail: 'Văn bản sẽ thay thế các ký tự trong văn bản cũ.' },
        },
    },
    REPLACEB: {
        description: 'Thay thế ký tự trong văn bản',
        abstract: 'Thay thế ký tự trong văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/replace-replaceb-%E5%87%BD%E6%95%B0-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            oldText: { name: 'văn bản cũ', detail: 'Văn bản mà bạn muốn thay thế một vài ký tự trong đó.' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Vị trí của ký tự đầu tiên trong văn bản cần thay thế.' },
            numBytes: { name: 'số Byte', detail: 'Chỉ định, tính bằng byte, số lượng ký tự được thay thế bằng REPLACEB.' },
            newText: { name: 'văn bản thay thế', detail: 'Văn bản sẽ thay thế các ký tự trong văn bản cũ.' },
        },
    },
    REPT: {
        description: 'Lặp lại một chuỗi văn bản một số lần đã chỉ định',
        abstract: 'Lặp lại một chuỗi văn bản một số lần đã chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rept-%E5%87%BD%E6%95%B0-e109c0d0-487e-4f88-91eb-8a41d0d6a179',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Chuỗi văn bản bạn muốn lặp lại.' },
            numberTimes: { name: 'lần lặp lại', detail: 'Số lần bạn muốn lặp lại văn bản.' },
        },
    },
    RIGHT: {
        description: 'Trả về một số ký tự cụ thể từ cuối của chuỗi văn bản',
        abstract: 'Trả về một số ký tự cụ thể từ cuối của chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/right-rightb-%E5%87%BD%E6%95%B0-8b679d3f-2c2d-46b7-9071-45c8836a1dbd',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Chuỗi văn bản chứa các ký tự bạn muốn trích xuất.' },
            numChars: { name: 'số ký tự', detail: 'Chỉ định số ký tự bạn muốn RIGHT trích xuất.' },
        },
    },
    RIGHTB: {
        description: 'Trả về một số ký tự cụ thể từ cuối của chuỗi văn bản',
        abstract: 'Trả về một số ký tự cụ thể từ cuối của chuỗi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/right-rightb-%E5%87%BD%E6%95%B0-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Chuỗi văn bản chứa các ký tự bạn muốn trích xuất.' },
            numBytes: { name: 'số Byte', detail: 'Chỉ rõ số ký tự mà bạn muốn hàm RIGHTB trích xuất, dựa trên byte.' },
        },
    },
    SEARCH: {
        description: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (không phân biệt chữ hoa chữ thường)',
        abstract: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (không phân biệt chữ hoa chữ thường)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/search-searchb-%E5%87%BD%E6%95%B0-dfb12d6f-c60d-4a40-b090-7d2617b49e11',
            },
        ],
        functionParameter: {
            findText: { name: 'chuỗi tìm kiếm', detail: 'Chuỗi cần tìm trong "Văn bản cần tìm kiếm".' },
            withinText: { name: 'văn bản để tìm kiếm', detail: 'Lần xuất hiện đầu tiên của văn bản để tìm kiếm "chuỗi tìm kiếm".' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Vị trí ký tự để bắt đầu tìm kiếm trong "văn bản cần tìm kiếm". Nếu bỏ qua, giá trị là 1 được giả định.' },
        },
    },
    SEARCHB: {
        description: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (không phân biệt chữ hoa chữ thường)',
        abstract: 'Trả về vị trí của một chuỗi văn bản trong một chuỗi văn bản khác (không phân biệt chữ hoa chữ thường)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/search-searchb-%E5%87%BD%E6%95%B0-dfb12d6f-c60d-4a40-b090-7d2617b49e11',
            },
        ],
        functionParameter: {
            findText: { name: 'chuỗi tìm kiếm', detail: 'Chuỗi cần tìm trong "Văn bản cần tìm kiếm".' },
            withinText: { name: 'văn bản để tìm kiếm', detail: 'Lần xuất hiện đầu tiên của văn bản để tìm kiếm "chuỗi tìm kiếm".' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Vị trí ký tự để bắt đầu tìm kiếm trong "văn bản cần tìm kiếm". Nếu bỏ qua, giá trị là 1 được giả định.' },
        },
    },
    SPLIT: {
        description: 'Chia một chuỗi văn bản thành một bảng con',
        abstract: 'Chia một chuỗi văn bản thành một bảng con',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/split-%E5%87%BD%E6%95%B0-4357fb3e-7256-49ca-8711-94dbbcbe87c9',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chuỗi văn bản mà bạn muốn chia thành các phần tử bảng con.' },
            delimiter: { name: 'delimiter', detail: 'Ký tự hoặc chuỗi ký tự mà bạn muốn sử dụng làm dấu phân cách.' },
            split_by_each: { name: 'split_by_each', detail: 'Giá trị logic để chỉ định liệu chia chuỗi bằng từng ký tự trong dấu phân cách.' },
            remove_empty_text: { name: 'remove_empty_text', detail: 'Giá trị logic để chỉ định liệu xóa các chuỗi trống khỏi các kết quả phân chia.' },
        },
    },
    SUBSTITUTE: {
        description: 'Thay thế một hoặc tất cả các lần xuất hiện của một chuỗi văn bản trong một chuỗi văn bản khác',
        abstract: 'Thay thế một hoặc tất cả các lần xuất hiện của một chuỗi văn bản trong một chuỗi văn bản khác',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/substitute-%E5%87%BD%E6%95%B0-6434944f-6f07-4437-8818-68a6a1a08747',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản hoặc tham chiếu đến ô chứa văn bản mà bạn muốn thay thế bằng ký tự.' },
            oldText: { name: 'tìm kiếm văn bản', detail: 'Văn bản bạn muốn thay thế.' },
            newText: { name: 'văn bản thay thế', detail: 'Văn bản bạn muốn thay thế old_text.' },
            instanceNum: { name: 'chỉ định đối tượng thay thế', detail: 'Chỉ định trường hợp nào của old_text bạn muốn thay thế bằng new_text. Nếu bạn chỉ định instance_num, chỉ trường hợp đó của old_text được thay thế. Nếu không, mọi trường hợp của old_text trong text sẽ được thay đổi thành new_text.' },
        },
    },
    T: {
        description: 'Chuyển đổi tham số thành văn bản',
        abstract: 'Chuyển đổi tham số thành văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/t-%E5%87%BD%E6%95%B0-fb83aeec-45e7-4924-af95-53e073541228',
            },
        ],
        functionParameter: {
            value: { name: 'giá trị', detail: 'Giá trị mà bạn muốn kiểm tra.' },
        },
    },
    TEXT: {
        description: 'Định dạng và chuyển đổi số thành văn bản',
        abstract: 'Định dạng và chuyển đổi số thành văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/text-%E5%87%BD%E6%95%B0-20d5ac4d-7b94-49fd-bb38-93d29371225c',
            },
        ],
        functionParameter: {
            value: { name: 'giá trị', detail: 'Giá trị số mà bạn muốn được chuyển đổi thành văn bản.' },
            formatText: { name: 'định dạng văn bản', detail: 'Một chuỗi văn bản xác định định dạng mà bạn muốn được áp dụng cho giá trị được cung cấp.' },
        },
    },
    TEXTAFTER: {
        description: 'Trả về văn bản xuất hiện sau ký tự hoặc chuỗi đã cho.',
        abstract: 'Trả về văn bản xuất hiện sau ký tự hoặc chuỗi đã cho.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/textafter-%E5%87%BD%E6%95%B0-c8db2546-5b51-416a-9690-c7e6722e90b4',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản bạn đang tìm kiếm bên trong. Ký tự đại diện không được phép.' },
            delimiter: { name: 'dấu tách', detail: 'Văn bản đánh dấu điểm sau đó bạn muốn trích xuất.' },
            instanceNum: { name: 'số phiên bản', detail: 'Phiên bản của dấu tách sau đó bạn muốn trích xuất văn bản.' },
            matchMode: { name: 'mẫu khớp', detail: 'Xác định xem tìm kiếm văn bản có phân biệt chữ hoa chữ thường hay không. Mặc định là phân biệt chữ hoa, chữ thường.' },
            matchEnd: { name: 'trận đấu ở cuối', detail: 'Coi phần cuối văn bản là dấu tách. Theo mặc định, văn bản là kết quả khớp chính xác.' },
            ifNotFound: { name: 'giá trị chưa khớp', detail: 'Giá trị được trả về nếu không tìm thấy kết quả khớp. Theo mặc định, #N/A được trả về.' },
        },
    },
    TEXTBEFORE: {
        description: 'Trả về văn bản xuất hiện trước một ký tự hoặc chuỗi đã cho.',
        abstract: 'Trả về văn bản xuất hiện trước một ký tự hoặc chuỗi đã cho.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/textbefore-%E5%87%BD%E6%95%B0-d099c28a-dba8-448e-ac6c-f086d0fa1b29',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản bạn đang tìm kiếm bên trong. Ký tự đại diện không được phép.' },
            delimiter: { name: 'dấu tách', detail: 'Văn bản đánh dấu điểm sau đó bạn muốn trích xuất.' },
            instanceNum: { name: 'số phiên bản', detail: 'Phiên bản của dấu tách sau đó bạn muốn trích xuất văn bản.' },
            matchMode: { name: 'mẫu khớp', detail: 'Xác định xem tìm kiếm văn bản có phân biệt chữ hoa chữ thường hay không. Mặc định là phân biệt chữ hoa, chữ thường.' },
            matchEnd: { name: 'trận đấu ở cuối', detail: 'Coi phần cuối văn bản là dấu tách. Theo mặc định, văn bản là kết quả khớp chính xác.' },
            ifNotFound: { name: 'giá trị chưa khớp', detail: 'Giá trị được trả về nếu không tìm thấy kết quả khớp. Theo mặc định, #N/A được trả về.' },
        },
    },
    TEXTJOIN: {
        description: 'Kết hợp nhiều chuỗi văn bản thành một chuỗi, với dấu phân cách giữa các phần tử',
        abstract: 'Kết hợp nhiều chuỗi văn bản thành một chuỗi, với dấu phân cách giữa các phần tử',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/textjoin-%E5%87%BD%E6%95%B0-357b449a-ec91-49d0-80c3-0e8fc845691c',
            },
        ],
        functionParameter: {
            delimiter: { name: 'dấu tách', detail: 'Một chuỗi văn bản, trống hoặc có một hay nhiều ký tự nằm giữa các dấu ngoặc kép hay một tham chiếu tới một chuỗi văn bản hợp lệ.' },
            ignoreEmpty: { name: 'bỏ qua các ô trống', detail: 'Nếu TRUE, hãy bỏ qua các ô trống.' },
            text1: { name: 'bản văn 1', detail: 'Mục văn bản cần kết hợp. Một chuỗi văn bản hoặc xâu chuỗi, chẳng hạn như một phạm vi ô.' },
            text2: { name: 'bản văn 2', detail: 'Các mục văn bản bổ sung cần kết hợp. Có thể có tối đa 252 tham đối văn bản cho các mục văn bản, bao gồm text1. Mỗi tham đối có thể là một chuỗi văn bản hoặc xâu chuỗi, chẳng hạn như phạm vi ô.' },
        },
    },
    TEXTSPLIT: {
        description: 'Tách chuỗi văn bản bằng cách dùng dấu tách cột và hàng.',
        abstract: 'Tách chuỗi văn bản bằng cách dùng dấu tách cột và hàng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/textsplit-%E5%87%BD%E6%95%B0-b1ca414e-4c21-4ca0-b1b7-bdecace8a6e7',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản bạn muốn tách.' },
            colDelimiter: { name: 'dấu phân cách cột', detail: 'Ký tự hoặc chuỗi dùng để phân chia cột.' },
            rowDelimiter: { name: 'dấu phân cách dòng', detail: 'Ký tự hoặc chuỗi dùng để phân chia các hàng.' },
            ignoreEmpty: { name: 'bỏ qua các ô trống', detail: 'Có bỏ qua các ô trống hay không. Mặc định là FALSE.' },
            matchMode: { name: 'mẫu khớp', detail: 'Xác định xem tìm kiếm văn bản có phân biệt chữ hoa chữ thường hay không. Mặc định là phân biệt chữ hoa, chữ thường.' },
            padWith: { name: 'điền giá trị', detail: 'Giá trị được sử dụng cho phần đệm. Theo mặc định, #N/A được sử dụng.' },
        },
    },
    TRIM: {
        description: 'Loại bỏ tất cả khoảng trống ra khỏi văn bản, chỉ để lại một khoảng trống giữa các từ.',
        abstract: 'Xóa khoảng trắng khỏi văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/trim-%E5%87%BD%E6%95%B0-410388fa-c5df-49c6-b16c-9e5630b479f9',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản bạn muốn loại bỏ các khoảng trống.' },
        },
    },
    UNICHAR: {
        description: 'Trả về ký tự Unicode tương ứng với một số đã chỉ định',
        abstract: 'Trả về ký tự Unicode tương ứng với một số đã chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/unichar-%E5%87%BD%E6%95%B0-e7ffb741-824c-4e7c-bec7-59ac8ae8e43f',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số là số Unicode biểu diễn ký tự.' },
        },
    },
    UNICODE: {
        description: 'Trả về số Unicode tương ứng với ký tự đầu tiên của văn bản',
        abstract: 'Trả về số Unicode tương ứng với ký tự đầu tiên của văn bản',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/unicode-%E5%87%BD%E6%95%B0-4f8d3512-f0e5-4222-8586-f467c93b3d9a',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản là ký tự mà bạn muốn có giá trị Unicode.' },
        },
    },
    UPPER: {
        description: 'Chuyển đổi tất cả các chữ cái trong văn bản thành chữ hoa',
        abstract: 'Chuyển đổi tất cả các chữ cái trong văn bản thành chữ hoa',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/upper-%E5%87%BD%E6%95%B0-c11f29b3-d1a3-4537-8df6-04d0049963d6',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản bạn muốn chuyển đổi thành chữ hoa.' },
        },
    },
    VALUE: {
        description: 'Chuyển đổi chuỗi văn bản thành số',
        abstract: 'Chuyển đổi chuỗi văn bản thành số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/value-%E5%87%BD%E6%95%B0-d49bc6c1-c29b-44db-927b-11e7c34dd6ea',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Văn bản được đặt trong dấu ngoặc kép hoặc tham chiếu đến ô chứa văn bản bạn muốn chuyển đổi.' },
        },
    },
    VALUETOTEXT: {
        description: 'Trả về văn bản từ bất kỳ giá trị nào được chỉ định.',
        abstract: 'Trả về văn bản từ bất kỳ giá trị nào được chỉ định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/valuetotext-%E5%87%BD%E6%95%B0-5fff61a2-301a-4ab2-9ffa-0a5242a08fea',
            },
        ],
        functionParameter: {
            value: { name: 'giá trị', detail: 'Giá trị cần trả về dưới dạng văn bản.' },
            format: { name: 'Định dạng của dữ', detail: 'Định dạng của dữ liệu trả về. Nó có thể là một trong hai giá trị: \n0 Mặc định. Định dạng ngắn gọn dễ đọc.\n1 Định dạng nghiêm ngặt bao gồm ký tự thoát và dấu tách hàng. Tạo một chuỗi có thể được phân tích khi nhập vào thanh công thức. Đóng gói các chuỗi trả về trong dấu ngoặc kép, ngoại trừ Booleans, Numbers và Errors.' },
        },
    },
};
