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
    ABS: {
        description: 'Trả về giá trị tuyệt đối của một số. Giá trị tuyệt đối của một số là số đó không có dấu.',
        abstract: 'Trả về giá trị tuyệt đối của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/abs-%E5%87%BD%E6%95%B0-3420200f-5628-4e8c-99da-c99d7c87713c',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số thực mà bạn muốn tìm giá trị tuyệt đối của nó.' },
        },
    },
    ACOS: {
        description: 'Trả về arccosin, hay cosin nghịch đảo, của một số. Arccosin là góc mà cosin của nó là số. Góc được trả về được tính bằng radian trong phạm vi từ 0 (không) đến pi.',
        abstract: 'Trả về cung cosin của một số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/acos-%E5%87%BD%E6%95%B0-cb73173f-d089-4582-afa1-76e5524b5d5b',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Cosin của góc mà bạn muốn và phải từ -1 đến 1.' },
        },
    },
    ACOSH: {
        description: 'Trả về cosin hyperbolic nghịch đảo của một số. Số đó phải lớn hơn hoặc bằng 1. Cosin hyperbolic nghịch đảo là giá trị mà cosin hyperbolic của nó là số, vì vậy ACOSH(COSH(number)) bằng số.',
        abstract: 'Trả về cosin hyperbolic nghịch đảo của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/acosh-%E5%87%BD%E6%95%B0-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Bất kỳ số thực nào lớn hơn hoặc bằng 1.' },
        },
    },
    ACOT: {
        description: 'Trả về giá trị chính của arccotang hoặc nghịch đảo cotang của một số.',
        abstract: 'Trả về cotang nghịch đảo của một số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/acot-%E5%87%BD%E6%95%B0-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số là cotang của góc mà bạn muốn. Số này phải là số thực.' },
        },
    },
    ACOTH: {
        description: 'Trả về nghịch đảo cotang hyperbol của một số.',
        abstract: 'Trả về nghịch đảo cotang hyperbol của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/acoth-%E5%87%BD%E6%95%B0-cc49480f-f684-4171-9fc5-73e4e852300f',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị tuyệt đối của Số phải lớn hơn 1.' },
        },
    },
    ARABIC: {
        description: '将罗马数字转换为阿拉伯数字',
        abstract: '将罗马数字转换为阿拉伯数字',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/arabic-%E5%87%BD%E6%95%B0-9a8da418-c17b-4ef9-a657-9370a30a674f',
            },
        ],
        functionParameter: {
            text: { name: 'bản văn', detail: 'Một chuỗi nằm trong dấu ngoặc kép, một chuỗi trống ("") hoặc một tham chiếu đến ô có chứa văn bản.' },
        },
    },
    ASIN: {
        description: 'Trả về arcsin, hayine nghịch đảo của một số.',
        abstract: 'Trả về arcsin, hayine nghịch đảo của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/asin-%E5%87%BD%E6%95%B0-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Sin của góc mà bạn muốn và phải từ -1 đến 1.' },
        },
    },
    ASINH: {
        description: 'Trả về sin hyperbolic nghịch đảo của một số.',
        abstract: 'Trả về sin hyperbolic nghịch đảo của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/asinh-%E5%87%BD%E6%95%B0-4e00475a-067a-43cf-926a-765b0249717c',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Bất kỳ số thực nào.' },
        },
    },
    ATAN: {
        description: 'Trả về arctang, hay tang nghịch đảo của một số.',
        abstract: 'Trả về arctang, hay tang nghịch đảo của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/atan-%E5%87%BD%E6%95%B0-50746fa8-630a-406b-81d0-4a2aed395543',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Tang của góc mà bạn muốn.' },
        },
    },
    ATAN2: {
        description: 'Trả về arctang, hay tang nghịch đảo của tọa độ x và tọa độ y đã xác định.',
        abstract: 'Trả về arctang, hay tang nghịch đảo của tọa độ x và tọa độ y đã xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/atan2-%E5%87%BD%E6%95%B0-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'Tọa độ x', detail: 'Tọa độ x của điểm.' },
            yNum: { name: 'Tọa độ y', detail: 'Tọa độ y của điểm.' },
        },
    },
    ATANH: {
        description: 'Trả về tang hyperbolic nghịch đảo của một số.',
        abstract: 'Trả về tang hyperbolic nghịch đảo của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/atanh-%E5%87%BD%E6%95%B0-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Bất kỳ số thực nào từ 1 đến -1.' },
        },
    },
    BASE: {
        description: 'Chuyển một số sang dạng trình bày văn bản với cơ số cho trước.',
        abstract: 'Chuyển một số sang dạng trình bày văn bản với cơ số cho trước.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/base-%E5%87%BD%E6%95%B0-2ef61411-aee9-4f29-a811-1c42456c6342',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn chuyển đổi. Phải là số nguyên lớn hơn hoặc bằng 0 và nhỏ hơn 2^53.' },
            radix: { name: 'Cơ số', detail: 'Cơ số mà bạn muốn chuyển số trên thành. Phải là số nguyên lớn hơn hoặc bằng 2 và nhỏ hơn hoặc bằng 36.' },
            minLength: { name: 'chiều dài tối thiểu', detail: 'Độ dài tối thiểu của chuỗi trả về. Phải là số nguyên lớn hơn hoặc bằng 0.' },
        },
    },
    CEILING: {
        description: 'Trả về số được làm tròn lên, xa số không, đến bội số có nghĩa gần nhất.',
        abstract: 'Trả về số được làm tròn lên, xa số không, đến bội số có nghĩa gần nhất.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ceiling-%E5%87%BD%E6%95%B0-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị mà bạn muốn làm tròn.' },
            significance: { name: 'bội số', detail: 'Bội số mà bạn muốn làm tròn đến.' },
        },
    },
    CEILING_MATH: {
        description: 'Làm tròn số lên số nguyên gần nhất hoặc bội số có nghĩa gần nhất.',
        abstract: 'Làm tròn số lên số nguyên gần nhất hoặc bội số có nghĩa gần nhất.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ceiling-math-%E5%87%BD%E6%95%B0-80f95d2f-b499-4eee-9f16-f795a8e306c8',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị mà bạn muốn làm tròn.' },
            significance: { name: 'bội số', detail: 'Bội số mà bạn muốn làm tròn đến.' },
            mode: { name: 'phương thức', detail: 'Đối với số âm, kiểm soát xem Số có được làm tròn tới hoặc khác 0 hay không.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Trả về một số được làm tròn lên tới số nguyên gần nhất hoặc tới bội số có nghĩa gần nhất. Bất chấp dấu của số, số sẽ được làm tròn lên.',
        abstract: 'Trả về một số được làm tròn lên tới số nguyên gần nhất hoặc tới bội số có nghĩa gần nhất.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ceiling-precise-%E5%87%BD%E6%95%B0-f366a774-527a-4c92-ba49-af0a196e66cb',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị mà bạn muốn làm tròn.' },
            significance: { name: 'bội số', detail: 'Bội số mà bạn muốn làm tròn đến.' },
        },
    },
    COMBIN: {
        description: 'Trả về số tổ hợp cho số mục nhất định.',
        abstract: 'Trả về số tổ hợp cho số mục nhất định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/combin-%E5%87%BD%E6%95%B0-12a3f276-0a21-423a-8de6-06990aaf638a',
            },
        ],
        functionParameter: {
            number: { name: 'tổng cộng', detail: 'Số hạng mục.' },
            numberChosen: { name: 'số lượng mẫu', detail: 'Số hạng mục trong mỗi tổ hợp.' },
        },
    },
    COMBINA: {
        description: 'Trả về số lần kết hợp (có kèm những lần lặp lại) đối với số lượng mục cho trước.',
        abstract: 'Trả về số lần kết hợp (có kèm những lần lặp lại) đối với số lượng mục cho trước.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/combina-%E5%87%BD%E6%95%B0-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
            },
        ],
        functionParameter: {
            number: { name: 'tổng cộng', detail: 'Số hạng mục.' },
            numberChosen: { name: 'số lượng mẫu', detail: 'Số hạng mục trong mỗi tổ hợp.' },
        },
    },
    COS: {
        description: 'Trả về cosin của góc đã cho.',
        abstract: 'Trả về cosin của góc đã cho.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cos-%E5%87%BD%E6%95%B0-0fb808a5-95d6-4553-8148-22aebdce5f05',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Góc tính bằng radian mà bạn muốn tính cosin cho nó.' },
        },
    },
    COSH: {
        description: 'Trả về cosin hyperbolic của một số.',
        abstract: 'Trả về cosin hyperbolic của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cosh-%E5%87%BD%E6%95%B0-e460d426-c471-43e8-9540-a57ff3b70555',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Bất kỳ số thực nào mà bạn muốn tìm cosin hyperbolic cho số đó.' },
        },
    },
    COT: {
        description: 'Trả về giá trị cotang của góc được đo bằng radian.',
        abstract: 'Trả về giá trị cotang của góc được đo bằng radian.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cot-%E5%87%BD%E6%95%B0-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Góc được đo bằng radian mà bạn muốn tính cotang.' },
        },
    },
    COTH: {
        description: 'Trả về cotang hyperbolic của một góc hyperbolic.',
        abstract: 'Trả về cotang hyperbolic của một góc hyperbolic.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/coth-%E5%87%BD%E6%95%B0-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Muốn tìm số thực bất kỳ là cotang hyperbol.' },
        },
    },
    CSC: {
        description: 'Trả về cosec của một góc được tính bằng radian.',
        abstract: 'Trả về cosec của một góc được tính bằng radian.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/csc-%E5%87%BD%E6%95%B0-07379361-219a-4398-8675-07ddc4f135c1',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Tôi muốn tìm góc cosecant, được biểu thị bằng radian.' },
        },
    },
    CSCH: {
        description: 'Trả về cosec hyperbolic của một góc được tính bằng radian.',
        abstract: 'Trả về cosec hyperbolic của một góc được tính bằng radian.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/csch-%E5%87%BD%E6%95%B0-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Góc mà bạn muốn tìm giá trị cosec hyperbol, được biểu thị bằng radian.' },
        },
    },
    DECIMAL: {
        description: 'Chuyển đổi dạng biểu thị số bằng văn bản theo một cơ số đã cho thành một số thập phân.',
        abstract: 'Chuyển đổi dạng biểu thị số bằng văn bản theo một cơ số đã cho thành một số thập phân.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/decimal-%E5%87%BD%E6%95%B0-ee554665-6176-46ef-82de-0a283658da2e',
            },
        ],
        functionParameter: {
            text: { name: 'sợi dây', detail: 'Độ dài chuỗi phải nhỏ hơn hoặc bằng 255 ký tự.' },
            radix: { name: 'Cơ số', detail: 'Cơ sở để chuyển đổi số thành. Phải là số nguyên lớn hơn hoặc bằng 2 và nhỏ hơn hoặc bằng 36.' },
        },
    },
    DEGREES: {
        description: 'Chuyển đổi radian sang độ.',
        abstract: 'Chuyển đổi radian sang độ.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/degrees-%E5%87%BD%E6%95%B0-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
            },
        ],
        functionParameter: {
            angle: { name: 'góc', detail: 'Góc tính bằng radian mà bạn muốn chuyển đổi.' },
        },
    },
    EVEN: {
        description: 'Trả về số được làm tròn lên đến số nguyên chẵn gần nhất.',
        abstract: 'Trả về số được làm tròn lên đến số nguyên chẵn gần nhất.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/even-%E5%87%BD%E6%95%B0-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị cần làm tròn.' },
        },
    },
    EXP: {
        description: 'Trả về lũy thừa của số e với một số mũ nào đó.',
        abstract: 'Trả về lũy thừa của số e với một số mũ nào đó.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/exp-%E5%87%BD%E6%95%B0-c578f034-2c45-4c37-bc8c-329660a63abe',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mũ áp dụng cho cơ số e.' },
        },
    },
    FACT: {
        description: 'Trả về giai thừa của một số.',
        abstract: 'Trả về giai thừa của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/fact-%E5%87%BD%E6%95%B0-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số không âm mà bạn muốn tìm giai thừa của nó. Nếu number không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    FACTDOUBLE: {
        description: 'Trả về giai thừa kép của một số.',
        abstract: 'Trả về giai thừa kép của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/factdouble-%E5%87%BD%E6%95%B0-e67697ac-d214-48eb-b7b7-cce2589ecac8',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị để trả về giai thừa kép của nó. Nếu number không phải là số nguyên thì nó bị cắt cụt.' },
        },
    },
    FLOOR: {
        description: 'Làm tròn số theo giá trị tuyệt đối giảm dần',
        abstract: 'Làm tròn số theo giá trị tuyệt đối giảm dần',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/floor-%E5%87%BD%E6%95%B0-14bb497c-24f2-4e04-b327-b0b4de5a8886',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị số mà bạn muốn làm tròn.' },
            significance: { name: 'bội số', detail: 'Bội số mà bạn muốn làm tròn đến.' },
        },
    },
    FLOOR_MATH: {
        description: 'Làm tròn một số xuống số nguyên gần nhất hay tới bội số gần nhất của một số có nghĩa.',
        abstract: 'Làm tròn một số xuống số nguyên gần nhất hay tới bội số gần nhất của một số có nghĩa.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/floor-math-%E5%87%BD%E6%95%B0-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị số mà bạn muốn làm tròn.' },
            significance: { name: 'bội số', detail: 'Bội số mà bạn muốn làm tròn đến.' },
            mode: { name: 'phương thức', detail: 'Đối với số âm, kiểm soát xem Số có được làm tròn tới hoặc khác 0 hay không.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Trả về một số được làm tròn xuống tới số nguyên gần nhất hoặc tới bội số có nghĩa gần nhất. Bất chấp dấu của số, số sẽ được làm tròn xuống.',
        abstract: 'Trả về một số được làm tròn xuống tới số nguyên gần nhất hoặc tới bội số có nghĩa gần nhất.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/floor-precise-%E5%87%BD%E6%95%B0-f769b468-1452-4617-8dc3-02f842a0702e',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị số mà bạn muốn làm tròn.' },
            significance: { name: 'bội số', detail: 'Bội số mà bạn muốn làm tròn đến.' },
        },
    },
    GCD: {
        description: 'Trả về ước số chung lớn nhất của hai hoặc nhiều số nguyên.',
        abstract: 'Trả về ước số chung lớn nhất của hai hoặc nhiều số nguyên.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/gcd-%E5%87%BD%E6%95%B0-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
            },
        ],
        functionParameter: {
            number1: { name: 'số1', detail: 'Giá trị hoặc dải ô đầu tiên được sử dụng để tính toán.' },
            number2: { name: 'số2', detail: 'Các giá trị hoặc phạm vi bổ sung để sử dụng cho việc tính toán.' },
        },
    },
    INT: {
        description: 'Làm tròn số xuống tới số nguyên gần nhất.',
        abstract: 'Làm tròn số xuống tới số nguyên gần nhất.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/int-%E5%87%BD%E6%95%B0-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số thực mà bạn muốn làm tròn xuống một số nguyên.' },
        },
    },
    LCM: {
        description: 'Trả về bội số chung ít nhất của các số nguyên.',
        abstract: 'Trả về bội số chung ít nhất của các số nguyên.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/lcm-%E5%87%BD%E6%95%B0-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: 'số1', detail: 'Giá trị hoặc dải ô đầu tiên được sử dụng để tính toán.' },
            number2: { name: 'số2', detail: 'Các giá trị hoặc phạm vi bổ sung để sử dụng cho việc tính toán.' },
        },
    },
    LN: {
        description: 'Trả về lô-ga-rit tự nhiên của một số.',
        abstract: 'Trả về lô-ga-rit tự nhiên của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ln-%E5%87%BD%E6%95%B0-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số thực dương mà bạn muốn tính lô-ga-rít tự nhiên của nó.' },
        },
    },
    LOG: {
        description: 'Trả về lô-ga-rit của một số tới một cơ số do bạn chỉ định.',
        abstract: 'Trả về lô-ga-rit của một số tới một cơ số do bạn chỉ định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/log-%E5%87%BD%E6%95%B0-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số thực dương mà bạn muốn tính lô-ga-rít của nó.' },
            base: { name: 'Cơ số', detail: 'Cơ số của lô-ga-rit. Nếu cơ số được bỏ qua, thì nó được giả định là 10.' },
        },
    },
    LOG10: {
        description: 'Trả về lô-ga-rit cơ số 10 của một số.',
        abstract: 'Trả về lô-ga-rit cơ số 10 của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/log10-%E5%87%BD%E6%95%B0-c75b881b-49dd-44fb-b6f4-37e3486a0211',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số thực dương mà bạn muốn tính lô-ga-rít cơ số 10 của nó.' },
        },
    },
    MDETERM: {
        description: 'Trả về định thức ma trận của một mảng.',
        abstract: 'Trả về định thức ma trận của một mảng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mdeterm-%E5%87%BD%E6%95%B0-e7bfa857-3834-422b-b871-0ffd03717020',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Một mảng số với số hàng và số cột bằng nhau.' },
        },
    },
    MINVERSE: {
        description: 'Trả về ma trận nghịch đảo của một mảng',
        abstract: 'Trả về ma trận nghịch đảo của một mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/minverse-%E5%87%BD%E6%95%B0-11f55086-adde-4c9f-8eb9-59da2d72efc6',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Một mảng số với số hàng và số cột bằng nhau.' },
        },
    },
    MMULT: {
        description: 'Trả về tích ma trận của hai mảng',
        abstract: 'Trả về tích ma trận của hai mảng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mmult-%E5%87%BD%E6%95%B0-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng1', detail: 'Những mảng mà bạn muốn nhân.' },
            array2: { name: 'mảng2', detail: 'Những mảng mà bạn muốn nhân.' },
        },
    },
    MOD: {
        description: 'Trả về số dư sau khi chia một số cho ước số. Kết quả có cùng dấu với ước số.',
        abstract: 'Trả về số dư sau khi chia một số cho ước số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mod-%E5%87%BD%E6%95%B0-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn tìm số dư.' },
            divisor: { name: 'số chia', detail: 'Số mà bạn muốn chia số cho nó.' },
        },
    },
    MROUND: {
        description: 'trả về một số được làm tròn đến bội số mong muốn.',
        abstract: 'trả về một số được làm tròn đến bội số mong muốn.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mround-%E5%87%BD%E6%95%B0-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị cần làm tròn.' },
            multiple: { name: 'bội số', detail: 'Số mà bạn muốn làm tròn số tới bội số của nó.' },
        },
    },
    MULTINOMIAL: {
        description: 'Trả về đa thức của một tập hợp số',
        abstract: 'Trả về đa thức của một tập hợp số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/multinomial-%E5%87%BD%E6%95%B0-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
            },
        ],
        functionParameter: {
            number1: { name: 'số1', detail: 'Giá trị hoặc dải ô đầu tiên được sử dụng để tính toán.' },
            number2: { name: 'số2', detail: 'Các giá trị hoặc phạm vi bổ sung để sử dụng cho việc tính toán.' },
        },
    },
    MUNIT: {
        description: 'Trả về ma trận đơn vị cho chiều đã xác định.',
        abstract: 'Trả về ma trận đơn vị cho chiều đã xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/munit-%E5%87%BD%E6%95%B0-c9fe916a-dc26-4105-997d-ba22799853a3',
            },
        ],
        functionParameter: {
            dimension: { name: 'kích thước', detail: 'Chiều là một số nguyên định rõ chiều của ma trận đơn vị mà bạn muốn trả về. Hàm trả về một mảng. Chiều phải lớn hơn 0.' },
        },
    },
    ODD: {
        description: 'Trả về số được làm tròn lên tới số nguyên lẻ gần nhất.',
        abstract: 'Trả về số được làm tròn lên tới số nguyên lẻ gần nhất.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/odd-%E5%87%BD%E6%95%B0-deae64eb-e08a-4c88-8b40-6d0b42575c98',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị cần làm tròn.' },
        },
    },
    PI: {
        description: 'Trả về giá trị của pi',
        abstract: 'Trả về giá trị của pi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/pi-%E5%87%BD%E6%95%B0-264199d0-a3ba-46b8-975a-c4a04608989b',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Trả về kết quả của một số được nâng theo một lũy thừa.',
        abstract: 'Trả về kết quả của một số được nâng theo một lũy thừa.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/power-%E5%87%BD%E6%95%B0-d3f2908b-56f4-4c3f-895a-07fb519c362a',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số cơ sở. Nó có thể là bất kỳ số thực nào.' },
            power: { name: 'năng', detail: 'Hàm mũ mà bạn muốn nâng số cơ sở lên theo lũy thừa đó.' },
        },
    },
    PRODUCT: {
        description: 'Nhân tất cả các đối số đã cho với nhau và trả về tích của chúng.',
        abstract: 'Nhân các tham số của nó',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/product-%E5%87%BD%E6%95%B0-8e6b5b24-90ee-4650-aeec-80982a0512ce',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số hoặc phạm vi thứ nhất mà bạn muốn nhân.' },
            number2: { name: 'số 2', detail: 'Các số hoặc phạm vi bổ sung mà bạn muốn nhân, tối đa 255 đối số.' },
        },
    },
    QUOTIENT: {
        description: 'Trả về phần nguyên của một phép chia.',
        abstract: 'Trả về phần nguyên của một phép chia.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/quotient-%E5%87%BD%E6%95%B0-9f7bf099-2a18-4282-8fa4-65290cc99dee',
            },
        ],
        functionParameter: {
            numerator: { name: 'tử số', detail: 'Số bị chia.' },
            denominator: { name: 'mẫu số', detail: 'Số chia.' },
        },
    },
    RADIANS: {
        description: 'Chuyển đổi độ thành radian.',
        abstract: 'Chuyển đổi độ thành radian.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/radians-%E5%87%BD%E6%95%B0-ac409508-3d48-45f5-ac02-1497c92de5bf',
            },
        ],
        functionParameter: {
            angle: { name: 'góc', detail: 'Góc tính bằng độ mà bạn muốn chuyển đổi.' },
        },
    },
    RAND: {
        description: 'Trả về một số ngẫu nhiên trong khoảng từ 0 đến 1',
        abstract: 'Trả về một số ngẫu nhiên trong khoảng từ 0 đến 1',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rand-%E5%87%BD%E6%95%B0-4cbfa695-8869-4788-8d90-021ea9f5be73',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Hàm RANDARRAY trả về một mảng các số ngẫu nhiên trong khoảng từ 0 đến 1. Tuy nhiên, bạn có thể chỉ định số hàng và cột cần điền, giá trị tối thiểu và tối đa cũng như trả về số nguyên hay giá trị thập phân.',
        abstract: 'Hàm RANDARRAY trả về một mảng các số ngẫu nhiên trong khoảng từ 0 đến 1.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/randarray-%E5%87%BD%E6%95%B0-21261e55-3bec-4885-86a6-8b0a47fd4d33',
            },
        ],
        functionParameter: {
            rows: { name: 'hàng', detail: 'Số hàng được trả về' },
            columns: { name: 'cột', detail: 'Số lượng cột được trả về' },
            min: { name: 'giá trị tối thiểu', detail: 'Số lượng tối thiểu bạn muốn được trả lại' },
            max: { name: 'giá trị tối đa', detail: 'Số lượng tối đa bạn muốn được trả về' },
            wholeNumber: { name: 'số nguyên', detail: 'Trả về một số nguyên hoặc một giá trị thập phân' },
        },
    },
    RANDBETWEEN: {
        description: 'Trả về một số nguyên ngẫu nhiên nằm giữa các số do bạn chỉ định.',
        abstract: 'Trả về một số nguyên ngẫu nhiên nằm giữa các số do bạn chỉ định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/randbetween-%E5%87%BD%E6%95%B0-4cc7f0d1-87dc-4eb7-987f-a469ab381685',
            },
        ],
        functionParameter: {
            bottom: { name: 'giá trị tối thiểu', detail: 'Số nguyên nhỏ nhất mà sẽ trả về.' },
            top: { name: 'giá trị tối đa', detail: 'Số nguyên lớn nhất mà sẽ trả về.' },
        },
    },
    ROMAN: {
        description: 'Chuyển đổi số Ả-rập thành số La Mã, dạng văn bản.',
        abstract: 'Chuyển đổi số Ả-rập thành số La Mã, dạng văn bản.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/roman-%E5%87%BD%E6%95%B0-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số Ả-rập mà bạn muốn chuyển đổi.' },
            form: { name: 'hình thức', detail: 'Một số xác định kiểu chữ số La Mã bạn muốn. Kiểu chữ số La Mã bao gồm từ kiểu Cổ điển đến kiểu Giản thể, trở nên ngắn gọn hơn khi giá trị của biểu mẫu tăng lên.' },
        },
    },
    ROUND: {
        description: 'làm tròn một số tới một số chữ số đã xác định.',
        abstract: 'làm tròn một số tới một số chữ số đã xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/round-%E5%87%BD%E6%95%B0-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn làm tròn.' },
            numDigits: { name: 'số chữ số', detail: 'Số chữ số mà bạn muốn làm tròn số tới đó.' },
        },
    },
    ROUNDBANK: {
        description: 'Làm tròn một số theo cách làm tròn của ngân hàng.',
        abstract: 'Làm tròn một số theo cách làm tròn của ngân hàng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn làm tròn theo cách làm tròn của ngân hàng.' },
            numDigits: { name: 'số chữ số', detail: 'Số chữ số mà bạn muốn làm tròn theo cách làm tròn của ngân hàng.' },
        },
    },
    ROUNDDOWN: {
        description: 'Làm tròn số xuống, tiến tới không.',
        abstract: 'Làm tròn số xuống, tiến tới không.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rounddown-%E5%87%BD%E6%95%B0-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn làm tròn.' },
            numDigits: { name: 'số chữ số', detail: 'Số chữ số mà bạn muốn làm tròn số tới đó.' },
        },
    },
    ROUNDUP: {
        description: 'Làm tròn một số lên, ra xa số 0 (không).',
        abstract: 'Làm tròn một số lên, ra xa số 0 (không).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/roundup-%E5%87%BD%E6%95%B0-f8bc9b23-e795-47db-8703-db171d0c42a7',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn làm tròn.' },
            numDigits: { name: 'số chữ số', detail: 'Số chữ số mà bạn muốn làm tròn số tới đó.' },
        },
    },
    SEC: {
        description: 'Trả về sec của một góc.',
        abstract: 'Trả về sec của một góc.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sec-%E5%87%BD%E6%95%B0-ff224717-9c87-4170-9b58-d069ced6d5f7',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Đối số number là góc tính bằng radian mà bạn muốn tìm sec cho nó.' },
        },
    },
    SECH: {
        description: 'Trả về sec hyperbolic của một góc.',
        abstract: 'Trả về sec hyperbolic của một góc.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sech-%E5%87%BD%E6%95%B0-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Đối số number là góc tính bằng radian mà bạn muốn tìm sec hyperbolic cho nó.' },
        },
    },
    SERIESSUM: {
        description: 'Trả về tổng của một chuỗi lũy thừa dựa trên công thức.',
        abstract: 'Trả về tổng của một chuỗi lũy thừa dựa trên công thức.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/seriessum-%E5%87%BD%E6%95%B0-a3ab25b5-1093-4f5b-b084-96c49087f637',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị đầu vào cho chuỗi lũy thừa.' },
            n: { name: 'n', detail: 'Lũy thừa ban đầu bạn muốn tăng x lên.' },
            m: { name: 'm', detail: 'Số bước lũy thừa sẽ tăng cho mỗi toán hạng trong chuỗi.' },
            coefficients: { name: 'hệ số', detail: 'Bộ hệ số mà mỗi lũy thừa liên tiếp của x được nhân với nó.' },
        },
    },
    SEQUENCE: {
        description: 'Hàm SEQUENCE cho phép bạn tạo một danh sách các số liên tiếp trong một mảng, chẳng hạn như 1, 2, 3, 4.',
        abstract: 'Hàm SEQUENCE cho phép bạn tạo một danh sách các số liên tiếp trong một mảng, chẳng hạn như 1, 2, 3, 4.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sequence-%E5%87%BD%E6%95%B0-57467a98-57e0-4817-9f14-2eb78519ca90',
            },
        ],
        functionParameter: {
            rows: { name: 'hàng', detail: 'Số hàng cần trả về.' },
            columns: { name: 'cột', detail: 'Số cột cần trả về.' },
            start: { name: 'bắt đầu', detail: 'Số đầu tiên trong trình tự.' },
            step: { name: 'khoảng cách', detail: 'Số lượng cần tăng cho mỗi giá trị tiếp theo trong mảng.' },
        },
    },
    SIGN: {
        description: 'Xác định dấu của một số.',
        abstract: 'Xác định dấu của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sign-%E5%87%BD%E6%95%B0-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Bất kỳ số thực nào.' },
        },
    },
    SIN: {
        description: 'Trả về sin của một góc đã cho.',
        abstract: 'Trả về sin của một góc đã cho.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sin-%E5%87%BD%E6%95%B0-cf0e3432-8b9e-483c-bc55-a76651c95602',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Góc tính bằng radian mà bạn muốn tìm sin cho góc đó.' },
        },
    },
    SINH: {
        description: 'Trả về sin hyperbolic của một số.',
        abstract: 'Trả về sin hyperbolic của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sinh-%E5%87%BD%E6%95%B0-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Bất kỳ số thực nào.' },
        },
    },
    SQRT: {
        description: 'Trả về căn bậc hai của số dương.',
        abstract: 'Trả về căn bậc hai của số dương.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sqrt-%E5%87%BD%E6%95%B0-654975c2-05c4-4831-9a24-2c65e4040fdf',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn tìm căn bậc hai của nó.' },
        },
    },
    SQRTPI: {
        description: 'Trả về căn bậc hai của (số * pi).',
        abstract: 'Trả về căn bậc hai của (số * pi).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sqrtpi-%E5%87%BD%E6%95%B0-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số để nhân với số pi.' },
        },
    },
    SUBTOTAL: {
        description: 'Trả về tổng phụ trong một danh sách hoặc cơ sở dữ liệu.',
        abstract: 'Trả về tổng phụ trong một danh sách hoặc cơ sở dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/subtotal-%E5%87%BD%E6%95%B0-7b027003-f060-4ade-9040-e478765b9939',
            },
        ],
        functionParameter: {
            functionNum: { name: 'hàm số seri', detail: 'Số 1-11 hay 101-111 chỉ định hàm sử dụng cho tổng phụ. 1-11 bao gồm những hàng ẩn bằng cách thủ công, còn 101-111 loại trừ chúng ra; những ô được lọc ra sẽ luôn được loại trừ.' },
            ref1: { name: 'Trích dẫn 1', detail: 'Phạm vi hoặc tham chiếu được đặt tên đầu tiên mà bạn muốn tính tổng phụ cho nó.' },
            ref2: { name: 'Trích dẫn 2', detail: 'Phạm vi hoặc chuỗi được đặt tên từ 2 đến 254 mà bạn muốn tính tổng phụ cho nó.' },
        },
    },
    SUM: {
        description: 'Thêm các giá trị đơn lẻ, tham chiếu ô, phạm vi hoặc kết hợp cả ba.',
        abstract: 'Tìm tổng các tham số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sum-%E5%87%BD%E6%95%B0-043e1c7d-7726-4e80-8f32-07b23e057f89',
            },
        ],
        functionParameter: {
            number1: {
                name: 'số 1',
                detail: 'Số đầu tiên bạn muốn thêm vào. Số đó có thể là 4, tham chiếu ô như B6, hoặc ô phạm vi như B2:B8.',
            },
            number2: {
                name: 'số 2',
                detail: 'Đây là số thứ hai mà bạn muốn cộng. Bạn có thể chỉ định tối đa 255 số bằng cách này.',
            },
        },
    },
    SUMIF: {
        description: 'để tính tổng các giá trị trong một phạm vi đáp ứng tiêu chí mà bạn xác định. ',
        abstract: 'để tính tổng các giá trị trong một phạm vi đáp ứng tiêu chí mà bạn xác định. ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sumif-%E5%87%BD%E6%95%B0-169b8c99-c05c-4483-a712-1697a653039b',
            },
        ],
        functionParameter: {
            range: {
                name: 'phạm vi',
                detail: 'Phạm vi ô bạn muốn được đánh giá theo tiêu chí.',
            },
            criteria: {
                name: 'tiêu chuẩn',
                detail: 'Tiêu chí ở dạng số, biểu thức, tham chiếu ô, văn bản hoặc hàm xác định sẽ cộng các ô nào. Ký tự đại diện có thể được bao gồm - dấu chấm hỏi (?) để khớp với bất kỳ ký tự đơn nào, dấu sao (*) để khớp với bất kỳ chuỗi ký tự nào. Nếu bạn muốn tìm một dấu chấm hỏi hay dấu sao thực sự, hãy gõ dấu ngã (~) trước ký tự.',
            },
            sumRange: {
                name: 'phạm vi tổng hợp',
                detail: 'Các ô thực tế để cộng nếu bạn muốn cộng các ô không phải là các ô đã xác định trong đối số range. Nếu đối số sum_range bị bỏ qua, Excel cộng các ô được xác định trong đối số range (chính các ô đã được áp dụng tiêu chí).',
            },
        },
    },
    SUMIFS: {
        description: 'cộng tất cả các đối số của nó mà đáp ứng nhiều tiêu chí.',
        abstract: 'cộng tất cả các đối số của nó mà đáp ứng nhiều tiêu chí.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sumifs-%E5%87%BD%E6%95%B0-c9e748f5-7ea7-455d-9406-611cebce642b',
            },
        ],
        functionParameter: {
            sumRange: { name: 'phạm vi tổng hợp', detail: 'Phạm vi ô cần tính tổng.' },
            criteriaRange1: { name: 'Phạm vi điều kiện 1', detail: 'Khu vực được thử nghiệm theo điều kiện 1. Phạm vi Tiêu chí 1 và Tiêu chí 1 đặt các cặp tìm kiếm được sử dụng để tìm kiếm một khu vực theo tiêu chí cụ thể. Khi một mục được tìm thấy trong phạm vi, tổng các giá trị tương ứng trong phạm vi tổng hợp sẽ được tính toán.' },
            criteria1: { name: 'điều kiện 1', detail: 'Xác định điều kiện để tính tổng các ô trong phạm vi điều kiện 1. Ví dụ: bạn có thể nhập tiêu chí là 32, ">32", B4, "táo" hoặc "32".' },
            criteriaRange2: { name: 'Phạm vi điều kiện 2', detail: 'Các trường bổ sung, có thể nhập tối đa 127 trường.' },
            criteria2: { name: 'điều kiện 2', detail: 'Điều kiện liên kết bổ sung, có thể nhập tối đa 127 điều kiện.' },
        },
    },
    SUMPRODUCT: {
        description: 'trả về tổng tích của các dải ô hoặc mảng tương ứng.',
        abstract: 'trả về tổng tích của các dải ô hoặc mảng tương ứng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sumproduct-%E5%87%BD%E6%95%B0-16753e75-9f68-4874-94ac-4d2145a2fd2e',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng', detail: 'Đối số mảng đầu tiên mà bạn muốn nhân các thành phần của nó rồi cộng tổng.' },
            array2: { name: 'mảng', detail: 'Các đối số mảng từ 2 đến 255 mà bạn muốn nhân các thành phần của nó rồi cộng tổng.' },
        },
    },
    SUMSQ: {
        description: 'Trả về tổng của bình phương của các đối số.',
        abstract: 'Trả về tổng của bình phương của các đối số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sumsq-%E5%87%BD%E6%95%B0-e3313c02-51cc-4963-aae6-31442d9ec307',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: '1 đến 255 đối số mà bạn muốn tính tổng của bình phương cho chúng. ' },
            number2: { name: 'số 2', detail: '1 đến 255 đối số mà bạn muốn tính tổng của bình phương cho chúng. ' },
        },
    },
    SUMX2MY2: {
        description: 'Trả về tổng của hiệu các bình phương của các giá trị tương ứng trong hai mảng.',
        abstract: 'Trả về tổng của hiệu các bình phương của các giá trị tương ứng trong hai mảng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sumx2my2-%E5%87%BD%E6%95%B0-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
            },
        ],
        functionParameter: {
            arrayX: { name: 'mảng 1', detail: 'Mảng hoặc phạm vi đầu tiên chứa các giá trị.' },
            arrayY: { name: 'mảng 2', detail: 'Mảng hoặc phạm vi thứ hai chứa các giá trị.' },
        },
    },
    SUMX2PY2: {
        description: 'Trả về tổng của tổng các bình phương của các giá trị tương ứng trong hai mảng.',
        abstract: 'Trả về tổng của tổng các bình phương của các giá trị tương ứng trong hai mảng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sumx2py2-%E5%87%BD%E6%95%B0-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
            },
        ],
        functionParameter: {
            arrayX: { name: 'mảng 1', detail: 'Mảng hoặc phạm vi đầu tiên chứa các giá trị.' },
            arrayY: { name: 'mảng 2', detail: 'Mảng hoặc phạm vi thứ hai chứa các giá trị.' },
        },
    },
    SUMXMY2: {
        description: 'Trả về tổng của các bình phương của hiệu của các giá trị tương ứng trong hai mảng.',
        abstract: 'Trả về tổng của các bình phương của hiệu của các giá trị tương ứng trong hai mảng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sumxmy2-%E5%87%BD%E6%95%B0-9d144ac1-4d79-43de-b524-e2ecee23b299',
            },
        ],
        functionParameter: {
            arrayX: { name: 'mảng 1', detail: 'Mảng hoặc phạm vi đầu tiên chứa các giá trị.' },
            arrayY: { name: 'mảng 2', detail: 'Mảng hoặc phạm vi thứ hai chứa các giá trị.' },
        },
    },
    TAN: {
        description: 'Trả về tang của góc đã cho.',
        abstract: 'Trả về tang của góc đã cho.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/tan-%E5%87%BD%E6%95%B0-08851a40-179f-4052-b789-d7f699447401',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Góc tính bằng radian mà bạn muốn tính tang của góc đó.' },
        },
    },
    TANH: {
        description: 'Trả về tang hyperbolic của một số.',
        abstract: 'Trả về tang hyperbolic của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/tanh-%E5%87%BD%E6%95%B0-017222f0-a0c3-4f69-9787-b3202295dc6c',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Bất kỳ số thực nào.' },
        },
    },
    TRUNC: {
        description: 'Làm tròn một số thành số nguyên bằng cách loại bỏ phần thập phân của nó.',
        abstract: 'Làm tròn một số thành số nguyên bằng cách loại bỏ phần thập phân của nó.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/trunc-%E5%87%BD%E6%95%B0-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số cần làm tròn.' },
            numDigits: { name: 'số chữ số', detail: 'Là một số xác định độ chính xác của việc cắt bớt. Giá trị mặc định của num_digits là 0 (không).' },
        },
    },
};
