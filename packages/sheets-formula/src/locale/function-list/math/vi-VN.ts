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
    ABS: {
        description: 'Trả về giá trị tuyệt đối của một số. Giá trị tuyệt đối của một số là số đó không có dấu.',
        abstract: 'Trả về giá trị tuyệt đối của một số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/abs-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/acos-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/acosh-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/acot-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị tuyệt đối của Số phải lớn hơn 1.' },
        },
    },
    AGGREGATE: {
        description: 'Trả về tổng gộp trong một danh sách hoặc một cơ sở dữ liệu.',
        abstract: 'Trả về tổng gộp trong một danh sách hoặc một cơ sở dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Một số từ 1 đến 19 chỉ rõ hàm cần dùng.' },
            options: { name: 'options', detail: 'Một giá trị số xác định những giá trị nào cần bỏ qua trong phạm vi định trị của hàm.' },
            ref1: { name: 'ref1', detail: 'Đối số dạng số thứ nhất cho những hàm có nhiều đối số dạng số mà bạn muốn có giá trị tổng gộp.' },
            ref2: { name: 'ref2', detail: 'Đối số dạng số 2 đến 252 mà bạn muốn có giá trị tổng gộp.' },
        },
    },
    ARABIC: {
        description: 'Converts a Roman number to Arabic, as a number',
        abstract: 'Converts a Roman number to Arabic, as a number',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/arabic-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/asin-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/asinh-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Tang của góc mà bạn muốn.' },
        },
    },
    ATAN2: {
        description: 'Trả về arctang, hay tang nghịch đảo của tọa độ x và tọa độ y đã xác định. Arctang là góc từ trục x đến đường thẳng chứa tọa độ gốc (0, 0) và một điểm có tọa độ (x_num, y_num). Góc được tính bằng radian và có giá trị từ -pi đến pi, không bao gồm -pi.',
        abstract: 'Trả về arctang, hay tang nghịch đảo của tọa độ x và tọa độ y đã xác định. Arctang là góc từ trục x đến đường thẳng chứa tọa độ gốc (0, 0) và một điểm có tọa độ (x_num, y_num). Góc được tính bằng radian và có giá trị từ -pi đến pi, không bao gồm -pi.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'Tọa độ x', detail: 'Yêu cầu. Tọa độ x của điểm.' },
            yNum: { name: 'Tọa độ y', detail: 'Yêu cầu. Tọa độ y của điểm.' },
        },
    },
    ATANH: {
        description: 'Trả về tang hyperbolic nghịch đảo của một số. Số phải từ -1 đến 1 (không bao gồm -1 và 1). Tang hyperbolic nghịch đảo là giá trị mà tang hyperbolic của nó là số , vì vậy ATANH(TANH(number)) bằng số .',
        abstract: 'Trả về tang hyperbolic nghịch đảo của một số. Số phải từ -1 đến 1 (không bao gồm -1 và 1). Tang hyperbolic nghịch đảo là giá trị mà tang hyperbolic của nó là số , vì vậy ATANH(TANH(number)) bằng số .',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Bắt buộc. Bất kỳ số thực nào từ 1 đến -1.' },
        },
    },
    BASE: {
        description: 'Chuyển một số sang dạng trình bày văn bản với cơ số cho trước.',
        abstract: 'Chuyển một số sang dạng trình bày văn bản với cơ số cho trước.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/base-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ceiling-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ceiling-math-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ceiling-precise-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/combin-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/combina-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cos-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cosh-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cot-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/coth-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/csc-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/csch-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/decimal-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/degrees-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/even-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/exp-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/fact-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/factdouble-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/floor-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/floor-math-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/floor-precise-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gcd-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số thực mà bạn muốn làm tròn xuống một số nguyên.' },
        },
    },
    ISO_CEILING: {
        description: 'Trả về một số được làm tròn lên tới số nguyên gần nhất hoặc tới bội số có nghĩa gần nhất. Bất chấp dấu của số, số sẽ được làm tròn lên. Tuy nhiên, nếu đối số số hoặc đối số số có nghĩa là không, thì kết quả là không.',
        abstract: 'Trả về một số được làm tròn lên tới số nguyên gần nhất hoặc tới bội số có nghĩa gần nhất. Bất chấp dấu của số, số sẽ được làm tròn lên. Tuy nhiên, nếu đối số số hoặc đối số số có nghĩa là không, thì kết quả là không.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị mà bạn muốn làm tròn.' },
            significance: { name: 'bội số', detail: 'Bội số mà bạn muốn làm tròn đến.' },
        },
    },
    LCM: {
        description: 'Trả về bội số chung ít nhất của các số nguyên.',
        abstract: 'Trả về bội số chung ít nhất của các số nguyên.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/lcm-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ln-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/log-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/log10-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mdeterm-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/minverse-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mmult-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mod-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mround-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/multinomial-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/munit-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/odd-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/pi-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/power-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/product-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/quotient-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/radians-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rand-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/randarray-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/randbetween-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/roman-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/round-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rounddown-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/roundup-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sec-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sech-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/seriessum-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sequence-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sign-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sin-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sinh-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sqrt-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sqrtpi-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/subtotal-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sum-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sumif-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sumifs-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sumproduct-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sumsq-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sumx2my2-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sumx2py2-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sumxmy2-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/tan-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/tanh-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số cần làm tròn.' },
            numDigits: { name: 'số chữ số', detail: 'Là một số xác định độ chính xác của việc cắt bớt. Giá trị mặc định của num_digits là 0 (không).' },
        },
    },
};

export default locale;
