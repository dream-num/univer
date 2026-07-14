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
    ASC: {
        description: 'Chuyển các chữ cái hoặc ký tự Kana toàn chiều rộng (byte kép) trong một chuỗi thành ký tự nửa chiều rộng (byte đơn)',
        abstract: 'Chuyển các chữ cái hoặc ký tự Kana toàn chiều rộng (byte kép) trong một chuỗi thành ký tự nửa chiều rộng (byte đơn)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/asc-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/arraytotext-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bahttext-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/char-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/clean-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/code-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/concat-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/concatenate-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dbcs-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dollar-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/exact-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/this-article-has-been-retired',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/this-article-has-been-retired',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/fixed-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/left-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/left-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/len-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/len-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/lower-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mid-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mid-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/numbervalue-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Tham khảo', detail: 'Yêu cầu. Chuỗi văn bản hoặc tham chiếu tới một ô đơn lẻ hoặc một phạm vi ô có chứa chuỗi văn bản furigana.' },
        },
    },
    PROPER: {
        description: 'Chuyển đổi chữ cái đầu tiên của mỗi từ trong chuỗi văn bản thành chữ hoa và tất cả các chữ cái khác thành chữ thường',
        abstract: 'Chuyển đổi chữ cái đầu tiên của mỗi từ trong chuỗi văn bản thành chữ hoa và tất cả các chữ cái khác thành chữ thường',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/proper-function',
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
                url: 'https://support.google.com/docs/answer/3098244?hl=vi',
            },
        ],
        functionParameter: {
            text: { name: 'văn bản', detail: 'Lưu ý: Ví dụ trên sẽ trả về 2 cột dữ liệu, “trích xuất” ở cột đầu tiên và “giá trị” ở cột thứ hai.' },
            regularExpression: { name: 'biểu thức chính quy', detail: 'Phần đầu tiên văn_bản khớp với biểu thức này sẽ được trả về.' },
        },
    },
    REGEXMATCH: {
        description: 'Xem một đoạn văn bản có khớp với một biểu thức chính quy hay không.',
        abstract: 'Xem một đoạn văn bản có khớp với một biểu thức chính quy hay không.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3098292?hl=vi',
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
                url: 'https://support.google.com/docs/answer/3098245?hl=vi',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/replace-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/replace-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rept-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/right-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/right-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/search-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'chuỗi tìm kiếm', detail: 'Chuỗi cần tìm trong "Văn bản cần tìm kiếm".' },
            withinText: { name: 'văn bản để tìm kiếm', detail: 'Lần xuất hiện đầu tiên của văn bản để tìm kiếm "chuỗi tìm kiếm".' },
            startNum: { name: 'vị trí bắt đầu', detail: 'Vị trí ký tự để bắt đầu tìm kiếm trong "văn bản cần tìm kiếm". Nếu bỏ qua, giá trị là 1 được giả định.' },
        },
    },
    SUBSTITUTE: {
        description: 'Thay thế một hoặc tất cả các lần xuất hiện của một chuỗi văn bản trong một chuỗi văn bản khác',
        abstract: 'Thay thế một hoặc tất cả các lần xuất hiện của một chuỗi văn bản trong một chuỗi văn bản khác',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/substitute-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/t-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/text-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/textafter-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/textbefore-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/textjoin-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/textsplit-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/trim-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/unichar-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/unicode-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/upper-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/value-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'giá trị', detail: 'Giá trị cần trả về dưới dạng văn bản.' },
            format: { name: 'Định dạng của dữ', detail: 'Định dạng của dữ liệu trả về. Nó có thể là một trong hai giá trị: \n0 Mặc định. Định dạng ngắn gọn dễ đọc.\n1 Định dạng nghiêm ngặt bao gồm ký tự thoát và dấu tách hàng. Tạo một chuỗi có thể được phân tích khi nhập vào thanh công thức. Đóng gói các chuỗi trả về trong dấu ngoặc kép, ngoại trừ Booleans, Numbers và Errors.' },
        },
    },
    CALL: {
        description: 'Gọi một thủ tục trong một thư viện liên kết động hoặc nguồn mã. Có hai mẫu cú pháp của hàm này. Chỉ dùng cú pháp 1 với tài nguyên mã đã đăng ký trước đây dùng đối số từ hàm REGISTER. Dùng cú pháp 2a hoặc 2b để đăng ký và gọi tài nguyên mã đồng thời.',
        abstract: 'Gọi một thủ tục trong một thư viện liên kết động hoặc nguồn mã. Có hai mẫu cú pháp của hàm này. Chỉ dùng cú pháp 1 với tài nguyên mã đã đăng ký trước đây dùng đối số từ hàm REGISTER. Dùng cú pháp 2a hoặc 2b để đăng ký và gọi tài nguyên mã đồng thời.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Yêu cầu. Văn bản được trích dẫn xác định tên thư viện nối kết động (DLL) chứa thủ tục trong Microsoft Excel cho Windows.' },
            procedure: { name: 'Thủ tục', detail: 'Yêu cầu. Văn bản chỉ rõ tên hàm trong DLL trong Microsoft Excel cho Windows. Bạn cũng có thể dùng giá trị số thứ tự của hàm từ báo cáo EXPORTS trong tệp định nghĩa mô-đun (.DEF). Giá trị số thứ tự không được ở dạng văn bản.' },
            typeText: { name: 'Type_text', detail: 'Yêu cầu. Văn bản xác định kiểu dữ liệu của giá trị trả về và kiểu dữ liệu của tất cả các đối số cho DLL hoặc tài nguyên mã. Chữ đầu tiên trong kiểu văn bản xác định giá trị trả về. Mã bạn dùng cho kiểu văn bản được mô tả chi tiết trong Dùng hàm CALL và REGISTER . Đối với các DLL hay tài nguyên mã (XLL) riêng lẻ, bạn có thể bỏ qua đối số này.' },
            argument1: { name: 'Đối số 1,...', detail: 'Tùy chọn. Các đối số sẽ được chuyển đến thủ tục.' },
        },
    },
    EUROCONVERT: {
        description: 'Quy đổi một số sang euro, quy đổi một số từ euro sang đồng tiền của nước thành viên liên minh châu Âu hoặc quy đổi một số từ đồng tiền của nước thành viên liên minh châu Âu sang nước khác bằng cách dùng euro làm đồng tiền trung gian (phép đạc tam giác). Các đồng tiền có thể quy đổi là đồng tiền của các nước thành viên Liên minh châu Âu (EU) đã đưa vào sử dụng đồng euro. Hàm này dùng các tỉ giá quy đổi ấn định do EU đặt ra.',
        abstract: 'Quy đổi một số sang euro, quy đổi một số từ euro sang đồng tiền của nước thành viên liên minh châu Âu hoặc quy đổi một số từ đồng tiền của nước thành viên liên minh châu Âu sang nước khác bằng cách dùng euro làm đồng tiền trung gian (phép đạc tam giác). Các đồng tiền có thể quy đổi là đồng tiền của các nước thành viên Liên minh châu Âu (EU) đã đưa vào sử dụng đồng euro. Hàm này dùng các tỉ giá quy đổi ấn định do EU đặt ra.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Number', detail: 'Bắt buộc. Giá trị tiền tệ mà bạn muốn quy đổi hoặc tham chiếu đến ô chứa giá trị.' },
            source: { name: 'Nguồn', detail: 'Yêu cầu. Chuỗi ba chữ cái hoặc tham chiếu đến ô chứa chuỗi đó, tương ứng với mã ISO cho đồng tiền nguồn. Các mã tiền tệ sau đây sẵn dùng trong hàm EUROCONVERT:' },
            target: { name: 'Mục tiêu', detail: 'Yêu cầu. Chuỗi ba chữ cái hoặc tham chiếu ô, tương ứng với mã ISO của đồng tiền mà bạn muốn quy đổi đối số number sang đồng tiền đó. Hãy xem bảng Source ở trước để biết mã ISO.' },
            fullPrecision: { name: 'Full_precision', detail: 'Yêu cầu. Giá trị lô-gic (TRUE hoặc FALSE) hoặc biểu thức trả về giá trị TRUE hoặc FALSE, xác định cách hiển thị kết quả.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'Yêu cầu. Số nguyên bằng hoặc lớn hơn 3 xác định số chữ số có nghĩa được dùng cho giá trị euro trung gian khi quy đổi giữa hai đồng tiền của nước thành viên liên minh châu Âu. Nếu bạn bỏ qua đối số này, Excel không làm tròn giá trị euro trung gian. Nếu bạn đưa đối số này vào khi quy đổi từ đồng tiền của nước thành viên châu Âu sang đồng euro, Excel sẽ tính toán giá trị euro trung gian có thể được quy đổi sang đồng tiền của nước thành viên liên minh châu Âu sau đó.' },
        },
    },
    REGISTER_ID: {
        description: 'Trả về ID đăng ký của thư viện nối kết động chỉ định (DLL) hoặc nguồn mã đã được đăng ký trước đó. Nếu DLL hoặc nguồn mã chưa được đăng ký, thì hàm này đăng ký DLL hoặc nguồn mã rồi trả về ID đăng ký.',
        abstract: 'Trả về ID đăng ký của thư viện nối kết động chỉ định (DLL) hoặc nguồn mã đã được đăng ký trước đó. Nếu DLL hoặc nguồn mã chưa được đăng ký, thì hàm này đăng ký DLL hoặc nguồn mã rồi trả về ID đăng ký.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Yêu cầu. Văn bản chỉ rõ tên của DLL có chứa hàm trong Microsoft Excel cho Windows.' },
            procedure: { name: 'Thủ tục', detail: 'Yêu cầu. Văn bản chỉ rõ tên hàm trong DLL trong Microsoft Excel cho Windows. Bạn cũng có thể dùng giá trị thứ tự của hàm từ câu lệnh EXPORT trong tệp định nghĩa mô-đun (.DEF). Giá trị thứ tự hoặc số ID nguồn không được có dạng văn bản.' },
            typeText: { name: 'Type_text', detail: 'Tùy chọn. Văn bản chỉ định kiểu dữ liệu của giá trị trả về và kiểu dữ liệu của tất cả các đối số cho DLL. Chữ thứ nhất của đối số nhập_văn bản chỉ rõ giá trị trả về. Nếu hàm hoặc nguồn mã đã được đăng ký, thì bạn có thể bỏ qua đối số này.' },
        },
    },
};

export default locale;
