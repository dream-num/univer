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
    BESSELI: {
        description: 'Trả về hàm Bessel sửa đổi In(x)',
        abstract: 'Trả về hàm Bessel sửa đổi In(x)',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/besseli-%E5%87%BD%E6%95%B0-8d33855c-9a8d-444b-98e0-852267b1c0df',
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
                url: 'https://support.microsoft.com/vi-vn/office/besselj-%E5%87%BD%E6%95%B0-839cb181-48de-408b-9d80-bd02982d94f7',
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
                url: 'https://support.microsoft.com/vi-vn/office/besselk-%E5%87%BD%E6%95%B0-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
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
                url: 'https://support.microsoft.com/vi-vn/office/bessely-%E5%87%BD%E6%95%B0-f3a356b3-da89-42c3-8974-2da54d6353a2',
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
                url: 'https://support.microsoft.com/vi-vn/office/bin2dec-%E5%87%BD%E6%95%B0-63905b57-b3a0-453d-99f4-647bb519cd6c',
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
                url: 'https://support.microsoft.com/vi-vn/office/bin2hex-%E5%87%BD%E6%95%B0-0375e507-f5e5-4077-9af8-28d84f9f41cc',
            },
        ],
        functionParameter: {
            number: { name: 'Số nhị phân', detail: 'Số nhị phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    BIN2OCT: {
        description: 'Chuyển đổi số nhị phân thành số bát phân',
        abstract: 'Chuyển đổi số nhị phân thành số bát phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/bin2oct-%E5%87%BD%E6%95%B0-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
            },
        ],
        functionParameter: {
            number: { name: 'Số nhị phân', detail: 'Số nhị phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
    BITAND: {
        description: "Trả về phép 'và' theo bit của hai số",
        abstract: "Trả về phép 'và' theo bit của hai số",
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/bitand-%E5%87%BD%E6%95%B0-8a2be3d7-91c3-4b48-9517-64548008563a',
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
                url: 'https://support.microsoft.com/vi-vn/office/bitlshift-%E5%87%BD%E6%95%B0-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
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
                url: 'https://support.microsoft.com/vi-vn/office/bitor-%E5%87%BD%E6%95%B0-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
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
                url: 'https://support.microsoft.com/vi-vn/office/bitrshift-%E5%87%BD%E6%95%B0-274d6996-f42c-4743-abdb-4ff95351222c',
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
                url: 'https://support.microsoft.com/vi-vn/office/bitxor-%E5%87%BD%E6%95%B0-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
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
                url: 'https://support.microsoft.com/vi-vn/office/complex-%E5%87%BD%E6%95%B0-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
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
                url: 'https://support.microsoft.com/vi-vn/office/convert-%E5%87%BD%E6%95%B0-d785bef1-808e-4aac-bdcd-666c810f9af2',
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
                url: 'https://support.microsoft.com/vi-vn/office/dec2bin-%E5%87%BD%E6%95%B0-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
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
                url: 'https://support.microsoft.com/vi-vn/office/dec2hex-%E5%87%BD%E6%95%B0-6344ee8b-b6b5-4c6a-a672-f64666704619',
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
                url: 'https://support.microsoft.com/vi-vn/office/dec2oct-%E5%87%BD%E6%95%B0-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
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
                url: 'https://support.microsoft.com/vi-vn/office/delta-%E5%87%BD%E6%95%B0-2f763672-c959-4e07-ac33-fe03220ba432',
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
                url: 'https://support.microsoft.com/vi-vn/office/erf-%E5%87%BD%E6%95%B0-c53c7e7b-5482-4b6c-883e-56df3c9af349',
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
                url: 'https://support.microsoft.com/vi-vn/office/erf-precise-%E5%87%BD%E6%95%B0-9a349593-705c-4278-9a98-e4122831a8e0',
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
                url: 'https://support.microsoft.com/vi-vn/office/erfc-%E5%87%BD%E6%95%B0-736e0318-70ba-4e8b-8d08-461fe68b71b3',
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
                url: 'https://support.microsoft.com/vi-vn/office/erfc-precise-%E5%87%BD%E6%95%B0-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
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
                url: 'https://support.microsoft.com/vi-vn/office/gestep-%E5%87%BD%E6%95%B0-f37e7d2a-41da-4129-be95-640883fca9df',
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
                url: 'https://support.microsoft.com/vi-vn/office/hex2bin-%E5%87%BD%E6%95%B0-a13aafaa-5737-4920-8424-643e581828c1',
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
                url: 'https://support.microsoft.com/vi-vn/office/hex2dec-%E5%87%BD%E6%95%B0-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
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
                url: 'https://support.microsoft.com/vi-vn/office/hex2oct-%E5%87%BD%E6%95%B0-54d52808-5d19-4bd0-8a63-1096a5d11912',
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
                url: 'https://support.microsoft.com/vi-vn/office/imabs-%E5%87%BD%E6%95%B0-b31e73c6-d90c-4062-90bc-8eb351d765a1',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm giá trị tuyệt đối của nó.' },
        },
    },
    IMAGINARY: {
        description: 'Trả về hệ số ảo của số phức',
        abstract: 'Trả về hệ số ảo của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/imaginary-%E5%87%BD%E6%95%B0-dd5952fd-473d-44d9-95a1-9a17b23e428a',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm hệ số ảo của nó.' },
        },
    },
    IMARGUMENT: {
        description: 'Trả về tham số theta, tức là góc được biểu diễn bằng radian',
        abstract: 'Trả về tham số theta, tức là góc được biểu diễn bằng radian',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/imargument-%E5%87%BD%E6%95%B0-eed37ec1-23b3-4f59-b9f3-d340358a034a',
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
                url: 'https://support.microsoft.com/vi-vn/office/imconjugate-%E5%87%BD%E6%95%B0-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
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
                url: 'https://support.microsoft.com/vi-vn/office/imcos-%E5%87%BD%E6%95%B0-dad75277-f592-4a6b-ad6c-be93a808a53c',
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
                url: 'https://support.microsoft.com/vi-vn/office/imcosh-%E5%87%BD%E6%95%B0-053e4ddb-4122-458b-be9a-457c405e90ff',
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
                url: 'https://support.microsoft.com/vi-vn/office/imcot-%E5%87%BD%E6%95%B0-dc6a3607-d26a-4d06-8b41-8931da36442c',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy cotangent.' },
        },
    },
    IMCOTH: {
        description: 'Trả về hyperbolic cotangent của số phức',
        abstract: 'Trả về hyperbolic cotangent của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.google.com/docs/answer/9366256?hl=vi&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy hyperbolic cotangent.' },
        },
    },
    IMCSC: {
        description: 'Trả về cosecant của số phức',
        abstract: 'Trả về cosecant của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/imcsc-%E5%87%BD%E6%95%B0-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
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
                url: 'https://support.microsoft.com/vi-vn/office/imcsch-%E5%87%BD%E6%95%B0-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
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
                url: 'https://support.microsoft.com/vi-vn/office/imdiv-%E5%87%BD%E6%95%B0-a505aff7-af8a-4451-8142-77ec3d74d83f',
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
                url: 'https://support.microsoft.com/vi-vn/office/imexp-%E5%87%BD%E6%95%B0-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
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
                url: 'https://support.microsoft.com/vi-vn/office/imln-%E5%87%BD%E6%95%B0-32b98bcf-8b81-437c-a636-6fb3aad509d8',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn tìm lô-ga-rit tự nhiên của nó.' },
        },
    },
    IMLOG: {
        description: 'Trả về logarithm của một số phức với cơ số xác định.',
        abstract: 'Trả về logarithm của một số phức với cơ số xác định.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.google.com/docs/answer/9366486?hl=vi&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Một số phức có logarit theo một cơ số cụ thể cần được tính.' },
            base: { name: 'cơ số', detail: 'Cơ số cần sử dụng khi tính lôgarit.' },
        },
    },
    IMLOG10: {
        description: 'Trả về logarithm cơ số 10 của số phức',
        abstract: 'Trả về logarithm cơ số 10 của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/imlog10-%E5%87%BD%E6%95%B0-58200fca-e2a2-4271-8a98-ccd4360213a5',
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
                url: 'https://support.microsoft.com/vi-vn/office/imlog2-%E5%87%BD%E6%95%B0-152e13b4-bc79-486c-a243-e6a676878c51',
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
                url: 'https://support.microsoft.com/vi-vn/office/impower-%E5%87%BD%E6%95%B0-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
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
                url: 'https://support.microsoft.com/vi-vn/office/improduct-%E5%87%BD%E6%95%B0-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
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
                url: 'https://support.microsoft.com/vi-vn/office/imreal-%E5%87%BD%E6%95%B0-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
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
                url: 'https://support.microsoft.com/vi-vn/office/imsec-%E5%87%BD%E6%95%B0-6df11132-4411-4df4-a3dc-1f17372459e0',
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
                url: 'https://support.microsoft.com/vi-vn/office/imsech-%E5%87%BD%E6%95%B0-f250304f-788b-4505-954e-eb01fa50903b',
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
                url: 'https://support.microsoft.com/vi-vn/office/imsin-%E5%87%BD%E6%95%B0-1ab02a39-a721-48de-82ef-f52bf37859f6',
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
                url: 'https://support.microsoft.com/vi-vn/office/imsinh-%E5%87%BD%E6%95%B0-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
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
                url: 'https://support.microsoft.com/vi-vn/office/imsqrt-%E5%87%BD%E6%95%B0-e1753f80-ba11-4664-a10e-e17368396b70',
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
                url: 'https://support.microsoft.com/vi-vn/office/imsub-%E5%87%BD%E6%95%B0-2e404b4d-4935-4e85-9f52-cb08b9a45054',
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
                url: 'https://support.microsoft.com/vi-vn/office/imsum-%E5%87%BD%E6%95%B0-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
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
                url: 'https://support.microsoft.com/vi-vn/office/imtan-%E5%87%BD%E6%95%B0-8478f45d-610a-43cf-8544-9fc0b553a132',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy tan.' },
        },
    },
    IMTANH: {
        description: 'Trả về tanh của số phức',
        abstract: 'Trả về tanh của số phức',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.google.com/docs/answer/9366655?hl=vi&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'số phức', detail: 'Số phức mà bạn muốn lấy tanh.' },
        },
    },
    OCT2BIN: {
        description: 'Chuyển đổi số bát phân thành số nhị phân',
        abstract: 'Chuyển đổi số bát phân thành số nhị phân',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/oct2bin-%E5%87%BD%E6%95%B0-55383471-3c56-4d27-9522-1a8ec646c589',
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
                url: 'https://support.microsoft.com/vi-vn/office/oct2dec-%E5%87%BD%E6%95%B0-87606014-cb98-44b2-8dbb-e48f8ced1554',
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
                url: 'https://support.microsoft.com/vi-vn/office/oct2hex-%E5%87%BD%E6%95%B0-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number: { name: 'Số bát phân', detail: 'Số bát phân mà bạn muốn chuyển đổi.' },
            places: { name: 'Số ký tự', detail: 'Số ký tự sử dụng.' },
        },
    },
};
