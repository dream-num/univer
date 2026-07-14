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
    BESSELI: {
        description: 'Trả về hàm Bessel sửa đổi In(x)',
        abstract: 'Trả về hàm Bessel sửa đổi In(x)',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Giá trị để đánh giá hàm.' },
            n: { name: 'N', detail: 'Bậc của hàm Bessel. Nếu n không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    BESSELJ: {
        description: 'Trả về hàm Bessel Jn(x)',
        abstract: 'Trả về hàm Bessel Jn(x)',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Giá trị để đánh giá hàm.' },
            n: { name: 'N', detail: 'Bậc của hàm Bessel. Nếu n không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    BESSELK: {
        description: 'Trả về hàm Bessel sửa đổi Kn(x)',
        abstract: 'Trả về hàm Bessel sửa đổi Kn(x)',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Giá trị để đánh giá hàm.' },
            n: { name: 'N', detail: 'Bậc của hàm Bessel. Nếu n không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    BESSELY: {
        description: 'Trả về hàm Bessel Yn(x)',
        abstract: 'Trả về hàm Bessel Yn(x)',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Giá trị để đánh giá hàm.' },
            n: { name: 'N', detail: 'Bậc của hàm Bessel. Nếu n không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    BIN2DEC: {
        description: 'Chuyển đổi số nhị phân thành số thập phân',
        abstract: 'Chuyển đổi số nhị phân thành số thập phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số nhị phân', detail: 'Số nhị phân mà bạn muốn chuyển đổi.' },
        },
    },
    BIN2HEX: {
        description: 'Chuyển đổi số nhị phân thành số thập lục phân',
        abstract: 'Chuyển đổi số nhị phân thành số thập lục phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số nhị phân', detail: 'Số nhị phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    BIN2OCT: {
        description: 'Chuyển đổi số nhị phân sang bát phân.',
        abstract: 'Chuyển đổi số nhị phân sang bát phân.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số nhị phân', detail: 'Bắt buộc. Số nhị phân mà bạn muốn chuyển đổi. Số không được chứa quá 10 ký tự (10 bit). Bit quan trọng nhất của số là bit dấu. 9 bit còn lại là các bit độ lớn. Các số âm được thể hiện bằng cách sử dụng ký hiệu hai thành phần.' },
            places: { name: 'Số ký tự', detail: 'chọn. Số ký tự sử dụng. Nếu bỏ qua khoảng trắng, BIN2OCT dùng số ký tự tối thiểu cần thiết. Khoảng trắng có tác dụng đệm cho giá trị trả về có số 0 (không) đằng trước.' },
        },
    },
    BITAND: {
        description: "Trả về phép 'và' theo bit của hai số",
        abstract: "Trả về phép 'và' theo bit của hai số",
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Giá trị 1', detail: 'Phải là dạng thập phân và lớn hơn hoặc bằng 0.' },
            number2: { name: 'Giá trị 2', detail: 'Phải là dạng thập phân và lớn hơn hoặc bằng 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Trả về giá trị tính toán của số nhận được bằng cách dịch chuyển sang trái shift_amount bit',
        abstract: 'Trả về giá trị tính toán của số nhận được bằng cách dịch chuyển sang trái shift_amount bit',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'giá trị số', detail: 'phải là số nguyên lớn hơn hoặc bằng 0.' },
            shiftAmount: { name: 'Số tiền ca', detail: 'phải là số nguyên.' },
        },
    },
    BITOR: {
        description: "Trả về phép 'hoặc' theo bit của hai số",
        abstract: "Trả về phép 'hoặc' theo bit của hai số",
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Giá trị 1', detail: 'Phải là dạng thập phân và lớn hơn hoặc bằng 0.' },
            number2: { name: 'Giá trị 2', detail: 'Phải là dạng thập phân và lớn hơn hoặc bằng 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Trả về giá trị tính toán của số nhận được bằng cách dịch chuyển sang phải shift_amount bit',
        abstract: 'Trả về giá trị tính toán của số nhận được bằng cách dịch chuyển sang phải shift_amount bit',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'giá trị số', detail: 'phải là số nguyên lớn hơn hoặc bằng 0.' },
            shiftAmount: { name: 'Số tiền ca', detail: 'phải là số nguyên.' },
        },
    },
    BITXOR: {
        description: "Trả về phép 'xor' theo bit của hai số",
        abstract: "Trả về phép 'xor' theo bit của hai số",
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Giá trị 1', detail: 'Phải là dạng thập phân và lớn hơn hoặc bằng 0.' },
            number2: { name: 'Giá trị 2', detail: 'Phải là dạng thập phân và lớn hơn hoặc bằng 0.' },
        },
    },
    COMPLEX: {
        description: 'Chuyển đổi hệ số thực và hệ số ảo thành số phức',
        abstract: 'Chuyển đổi hệ số thực và hệ số ảo thành số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'hệ số thực', detail: 'Hệ số thực của số phức.' },
            iNum: { name: 'hệ số ảo', detail: 'Hệ số ảo của số phức.' },
            suffix: { name: 'hậu tố', detail: 'Hậu tố cho thành phần ảo của số phức. Nếu bị bỏ qua, hậu tố được giả định là "i".' },
        },
    },
    CONVERT: {
        description: 'Chuyển đổi số từ hệ đo lường này sang hệ đo lường khác',
        abstract: 'Chuyển đổi số từ hệ đo lường này sang hệ đo lường khác',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'giá trị số', detail: 'Giá trị cần chuyển đổi.' },
            fromUnit: { name: 'Đơn vị trước khi chuyển đổi', detail: 'là đơn vị của giá trị số.' },
            toUnit: { name: 'Đơn vị chuyển đổi', detail: 'là đơn vị của kết quả.' },
        },
    },
    DEC2BIN: {
        description: 'Chuyển đổi số thập phân thành số nhị phân',
        abstract: 'Chuyển đổi số thập phân thành số nhị phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số thập phân', detail: 'Số nguyên thập phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    DEC2HEX: {
        description: 'Chuyển đổi số thập phân thành số thập lục phân',
        abstract: 'Chuyển đổi số thập phân thành số thập lục phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số thập phân', detail: 'Số nguyên thập phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    DEC2OCT: {
        description: 'Chuyển đổi số thập phân thành số bát phân',
        abstract: 'Chuyển đổi số thập phân thành số bát phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số thập phân', detail: 'Số nguyên thập phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    DELTA: {
        description: 'Kiểm tra hai giá trị có bằng nhau không',
        abstract: 'Kiểm tra hai giá trị có bằng nhau không',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'giá trị số 1', detail: 'Số thứ nhất.' },
            number2: { name: 'giá trị số 2', detail: 'Số thứ hai. Nếu bị bỏ qua, number2 được cho là bằng không.' },
        },
    },
    ERF: {
        description: 'Trả về hàm lỗi',
        abstract: 'Trả về hàm lỗi',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'Giơi hạn dươi', detail: 'Giới hạn dưới để lấy tích phân hàm ERF.' },
            upperLimit: { name: 'giới hạn trên', detail: 'Giới hạn trên để lấy tích phân hàm ERF. Nếu bị bỏ qua, hàm ERF lấy tích phân giữa số không và lower_limit.' },
        },
    },
    ERF_PRECISE: {
        description: 'Trả về hàm lỗi',
        abstract: 'Trả về hàm lỗi',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'Giơi hạn dươi', detail: 'Giới hạn dưới để lấy tích phân hàm ERF.PRECISE.' },
        },
    },
    ERFC: {
        description: 'Trả về hàm lỗi bổ sung',
        abstract: 'Trả về hàm lỗi bổ sung',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'Giơi hạn dươi', detail: 'Giới hạn dưới để lấy tích phân hàm ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Trả về hàm ERF bổ sung từ x đến vô cực',
        abstract: 'Trả về hàm ERF bổ sung từ x đến vô cực',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'Giơi hạn dươi', detail: 'Giới hạn dưới để lấy tích phân hàm ERFC.PRECISE.' },
        },
    },
    GESTEP: {
        description: 'Kiểm tra số có lớn hơn ngưỡng không',
        abstract: 'Kiểm tra số có lớn hơn ngưỡng không',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị để kiểm tra bước.' },
            step: { name: 'ngưỡng', detail: 'Giá trị ngưỡng. Nếu bạn bỏ qua giá trị của bước, hàm GESTEP sẽ dùng số 0.' },
        },
    },
    HEX2BIN: {
        description: 'Chuyển đổi số thập lục phân thành số nhị phân',
        abstract: 'Chuyển đổi số thập lục phân thành số nhị phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'số thập lục phân', detail: 'Số thập lục phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    HEX2DEC: {
        description: 'Chuyển đổi số thập lục phân thành số thập phân',
        abstract: 'Chuyển đổi số thập lục phân thành số thập phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'số thập lục phân', detail: 'Số thập lục phân mà bạn muốn chuyển đổi.' },
        },
    },
    HEX2OCT: {
        description: 'Chuyển đổi số thập lục phân thành số bát phân',
        abstract: 'Chuyển đổi số thập lục phân thành số bát phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'số thập lục phân', detail: 'Số thập lục phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    IMABS: {
        description: 'Trả về giá trị tuyệt đối (môđun) của số phức',
        abstract: 'Trả về giá trị tuyệt đối (môđun) của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm giá trị tuyệt đối của nó.' },
        },
    },
    IMAGINARY: {
        description: 'Trả về hệ số ảo của một số phức trong định dạng văn bản x + yi hoặc x + yj.',
        abstract: 'Trả về hệ số ảo của một số phức trong định dạng văn bản x + yi hoặc x + yj.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Yêu cầu. Số phức mà bạn muốn tìm hệ số ảo của nó.' },
        },
    },
    IMARGUMENT: {
        description: 'Trả về tham số theta, tức là góc được biểu diễn bằng radian',
        abstract: 'Trả về tham số theta, tức là góc được biểu diễn bằng radian',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm đối số theta.' },
        },
    },
    IMCONJUGATE: {
        description: 'Trả về số phức liên hợp của số phức',
        abstract: 'Trả về số phức liên hợp của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm số liên hợp của nó.' },
        },
    },
    IMCOS: {
        description: 'Trả về cosine của số phức',
        abstract: 'Trả về cosine của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm cosin của nó.' },
        },
    },
    IMCOSH: {
        description: 'Trả về hyperbolic cosine của số phức',
        abstract: 'Trả về hyperbolic cosine của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy cosin hyperbolic.' },
        },
    },
    IMCOT: {
        description: 'Trả về cotangent của số phức',
        abstract: 'Trả về cotangent của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy cotangent.' },
        },
    },
    IMCOTH: {
        description: 'Hàm IMCOTH trả về cotang hyperbol của một số phức đã cho. Ví dụ: một số phức đã cho "x+yi" trả về "coth(x+yi)".',
        abstract: 'Hàm IMCOTH trả về cotang hyperbol của một số phức đã cho. Ví dụ: một số phức đã cho "x+yi" trả về "coth(x+yi)".',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.google.com/docs/answer/9366256?hl=vi',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'IMCOTH(4)' },
        },
    },
    IMCSC: {
        description: 'Trả về cosecant của số phức',
        abstract: 'Trả về cosecant của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy cosecant.' },
        },
    },
    IMCSCH: {
        description: 'Trả về hyperbolic cosecant của số phức',
        abstract: 'Trả về hyperbolic cosecant của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy hyperbolic cosecant.' },
        },
    },
    IMDIV: {
        description: 'Trả về thương của hai số phức',
        abstract: 'Trả về thương của hai số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'tử số phức', detail: 'Số bị chia hoặc tử số phức.' },
            inumber2: { name: 'mẫu số phức', detail: 'Ước số hoặc mẫu số phức.' },
        },
    },
    IMEXP: {
        description: 'Trả về exponent của số phức',
        abstract: 'Trả về exponent của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm hàm mũ của nó.' },
        },
    },
    IMLN: {
        description: 'Trả về logarithm tự nhiên của số phức',
        abstract: 'Trả về logarithm tự nhiên của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm lô-ga-rit tự nhiên của nó.' },
        },
    },
    IMLOG: {
        description: 'Hàm IMLOG trả về lôgarit của một số phức với cơ số xác định.',
        abstract: 'Hàm IMLOG trả về lôgarit của một số phức với cơ số xác định.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.google.com/docs/answer/9366486?hl=vi',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Giá trị nhập vào của hàm lôgarit. Số này có thể được viết dưới dạng số tự nhiên, ví dụ: 1, được hiểu là số thực. Số này có thể được viết dưới dạng văn bản trích dẫn để chỉ định cả hệ số thực và hệ số phức.' },
            base: { name: 'cơ số', detail: 'Cơ số cần sử dụng khi tính lôgarit. Phải là một số thực dương.' },
        },
    },
    IMLOG10: {
        description: 'Trả về logarithm cơ số 10 của số phức',
        abstract: 'Trả về logarithm cơ số 10 của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm lô-ga-rit thập phân của nó.' },
        },
    },
    IMLOG2: {
        description: 'Trả về logarithm cơ số 2 của số phức',
        abstract: 'Trả về logarithm cơ số 2 của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm lô-ga-rit cơ số 2 của nó.' },
        },
    },
    IMPOWER: {
        description: 'Trả về lũy thừa của một số phức với số nguyên',
        abstract: 'Trả về lũy thừa của một số phức với số nguyên',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Một số phức mà bạn muốn nâng lên theo một lũy thừa.' },
            number: { name: 'số', detail: 'Lũy thừa mà bạn muốn nâng số phức lên theo đó.' },
        },
    },
    IMPRODUCT: {
        description: 'Trả về tích của nhiều số phức',
        abstract: 'Trả về tích của nhiều số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'số phức 1', detail: '1 tới 255 số phức cần nhân với nhau.' },
            inumber2: { name: 'số phức 2', detail: '1 tới 255 số phức cần nhân với nhau.' },
        },
    },
    IMREAL: {
        description: 'Trả về phần thực của số phức',
        abstract: 'Trả về phần thực của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm hệ số thực của nó.' },
        },
    },
    IMSEC: {
        description: 'Trả về giá trị sec của số phức',
        abstract: 'Trả về giá trị sec của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy sec.' },
        },
    },
    IMSECH: {
        description: 'Trả về giá trị sech của số phức',
        abstract: 'Trả về giá trị sech của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy sech.' },
        },
    },
    IMSIN: {
        description: 'Trả về sin của số phức',
        abstract: 'Trả về sin của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy sin.' },
        },
    },
    IMSINH: {
        description: 'Trả về giá trị sinh của số phức',
        abstract: 'Trả về giá trị sinh của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy sinh.' },
        },
    },
    IMSQRT: {
        description: 'Trả về căn bậc hai của số phức',
        abstract: 'Trả về căn bậc hai của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm căn bậc hai của nó.' },
        },
    },
    IMSUB: {
        description: 'Trả về hiệu của hai số phức',
        abstract: 'Trả về hiệu của hai số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'số phức 1', detail: 'số phức 1.' },
            inumber2: { name: 'số phức 2', detail: 'số phức 2.' },
        },
    },
    IMSUM: {
        description: 'Trả về tổng của nhiều số phức',
        abstract: 'Trả về tổng của nhiều số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'số phức 1', detail: '1 tới 255 số phức cần cộng với nhau.' },
            inumber2: { name: 'số phức 2', detail: '1 tới 255 số phức cần cộng với nhau.' },
        },
    },
    IMTAN: {
        description: 'Trả về tan của số phức',
        abstract: 'Trả về tan của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy tan.' },
        },
    },
    IMTANH: {
        description: 'Hàm IMTANH trả về tang hyperbol của một số phức đã cho. Ví dụ: một số phức đã cho "x+yi" trả về "tanh(x+yi)".',
        abstract: 'Hàm IMTANH trả về tang hyperbol của một số phức đã cho. Ví dụ: một số phức đã cho "x+yi" trả về "tanh(x+yi)".',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.google.com/docs/answer/9366655?hl=vi',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm tang hyperbol. Đây có thể là kết quả của hàm COMPLEX, một số thực được hiểu là số phức có các phần ảo bằng 0, hoặc một chuỗi ở định dạng “x+yi”, trong đó x và y là số.' },
        },
    },
    OCT2BIN: {
        description: 'Chuyển đổi số bát phân thành số nhị phân',
        abstract: 'Chuyển đổi số bát phân thành số nhị phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số bát phân', detail: 'Số bát phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    OCT2DEC: {
        description: 'Chuyển đổi số bát phân thành số thập phân',
        abstract: 'Chuyển đổi số bát phân thành số thập phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số bát phân', detail: 'Số bát phân mà bạn muốn chuyển đổi.' },
        },
    },
    OCT2HEX: {
        description: 'Chuyển đổi số bát phân thành số mười lăm phân',
        abstract: 'Chuyển đổi số bát phân thành số mười lăm phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'Số bát phân', detail: 'Số bát phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
};

export default locale;
