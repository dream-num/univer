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
    AVEDEV: {
        description: 'Trả về giá trị trung bình của độ lệch tuyệt đối của các điểm dữ liệu từ giá trị trung bình của chúng.',
        abstract: 'Trả về giá trị trung bình của độ lệch tuyệt đối của các điểm dữ liệu từ giá trị trung bình của chúng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình.' },
            number2: { name: 'số 2', detail: 'Các số khác, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình, tối đa là 255.' },
        },
    },
    AVERAGE: {
        description: 'Trả về giá trị trung bình (trung bình cộng) của các tham số.',
        abstract: 'Trả về giá trị trung bình của các tham số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình.' },
            number2: { name: 'số 2', detail: 'Các số khác, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình, tối đa là 255.' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'Hàm AVERAGE.WEIGHTED tìm trung bình cộng gia quyền của một tập giá trị khi biết trước các giá trị và trọng số tương ứng.',
        abstract: 'Hàm AVERAGE.WEIGHTED tìm trung bình cộng gia quyền của một tập giá trị khi biết trước các giá trị và trọng số tương ứng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/9084098?hl=vi',
            },
        ],
        functionParameter: {
            values: { name: 'giá_trị', detail: 'Giá trị cần tính trung bình. Có thể tham chiếu một dải ô hoặc có thể chứa chính các giá trị đó.' },
            weights: { name: 'trọng_số', detail: 'Danh sách trọng số tương ứng để áp dụng. Có thể tham chiếu một dải ô hoặc có thể chứa chính các trọng số đó. Trọng số không được âm nhưng có thể là số 0. Phải có ít nhất một trọng số là số dương. Nếu dùng dải ô thì dải ô đó phải có cùng số hàng và cột giống với phạm vi của các giá trị.' },
            additionalValues: { name: 'giá_trị_bổ_sung', detail: 'Các giá trị bổ sung cần tính trung bình. Không bắt buộc phải có các giá trị bổ sung.' },
            additionalWeights: { name: 'trọng_số_bổ_sung', detail: 'Các trọng số bổ sung để áp dụng. Không bắt buộc phải có các trọng số bổ sung, nhưng mỗi giá_trị_bổ_sung phải đi kèm với đúng một trọng_số_bổ_sung.' },
        },
    },
    AVERAGEA: {
        description: 'Trả về giá trị trung bình của các tham số, bao gồm số, văn bản và giá trị logic.',
        abstract: 'Trả về giá trị trung bình của các tham số, bao gồm số, văn bản và giá trị logic.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: { name: 'Giá trị 1', detail: 'Giá trị đầu tiên, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình.' },
            value2: { name: 'Giá trị 2', detail: 'Các giá trị khác, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình, tối đa là 255.' },
        },
    },
    AVERAGEIF: {
        description: 'Trả về giá trị trung bình (trung bình cộng) của các ô trong phạm vi đáp ứng một tiêu chí nhất định.',
        abstract: 'Trả về giá trị trung bình của các ô trong phạm vi đáp ứng một tiêu chí nhất định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'Phạm vi', detail: 'Một hoặc nhiều ô cần tính giá trị trung bình, có thể chứa số hoặc tham chiếu.' },
            criteria: { name: 'Tiêu chí', detail: 'Tiêu chí dưới dạng số, biểu thức, tham chiếu ô hoặc văn bản để xác định các ô cần tính giá trị trung bình. Ví dụ: 32, ">32", "táo" hoặc B4.' },
            averageRange: { name: 'Phạm vi tính trung bình', detail: 'Các ô thực sự cần tính giá trị trung bình. Nếu bị bỏ qua, sẽ sử dụng phạm vi.' },
        },
    },
    AVERAGEIFS: {
        description: 'Trả về giá trị trung bình (trung bình cộng) của các ô đáp ứng nhiều tiêu chí.',
        abstract: 'Trả về giá trị trung bình của các ô đáp ứng nhiều tiêu chí.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'Phạm vi tính trung bình', detail: 'Một hoặc nhiều ô cần tính giá trị trung bình, có thể chứa số hoặc tham chiếu.' },
            criteriaRange1: { name: 'Phạm vi tiêu chí 1', detail: 'Phạm vi đầu tiên được sử dụng để xác định các ô cần tính giá trị trung bình.' },
            criteria1: { name: 'Tiêu chí 1', detail: 'Tiêu chí xác định các ô cần tính giá trị trung bình. Ví dụ: 32, ">32", "táo" hoặc B4.' },
            criteriaRange2: { name: 'Phạm vi tiêu chí 2', detail: 'Các phạm vi bổ sung, tối đa 127.' },
            criteria2: { name: 'Tiêu chí 2', detail: 'Các tiêu chí bổ sung liên quan, tối đa 127.' },
        },
    },
    BETA_DIST: {
        description: 'Trả về hàm phân phối tích lũy beta',
        abstract: 'Trả về hàm phân phối tích lũy beta',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giá trị được sử dụng để tính toán hàm của nó, giữa giá trị giới hạn dưới và giá trị giới hạn trên.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm BETA.DIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
            A: { name: 'giới hạn dưới', detail: 'Giới hạn dưới của hàm, giá trị mặc định là 0.' },
            B: { name: 'giới hạn trên', detail: 'Giới hạn trên của hàm, giá trị mặc định là 1.' },
        },
    },
    BETA_INV: {
        description: 'Trả về hàm nghịch đảo của phân phối tích lũy beta cụ thể',
        abstract: 'Trả về hàm nghịch đảo của phân phối tích lũy beta cụ thể',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/beta-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất gắn với phân bố beta.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
            A: { name: 'giới hạn dưới', detail: 'Giới hạn dưới của hàm, giá trị mặc định là 0.' },
            B: { name: 'giới hạn trên', detail: 'Giới hạn trên của hàm, giá trị mặc định là 1.' },
        },
    },
    BINOM_DIST: {
        description: 'Trả về xác suất phân phối nhị thức đơn nguyên',
        abstract: 'Trả về xác suất phân phối nhị thức đơn nguyên',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'số lần thành công', detail: 'Số lần thành công trong các phép thử.' },
            trials: { name: 'số phép thử', detail: 'Số phép thử độc lập.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Xác suất thành công của mỗi phép thử.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm BINOM.DIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Trả về xác suất kết quả thử nghiệm sử dụng phân phối nhị thức',
        abstract: 'Trả về xác suất kết quả thử nghiệm sử dụng phân phối nhị thức',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'số phép thử', detail: 'Số phép thử độc lập.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Xác suất thành công của mỗi phép thử.' },
            numberS: { name: 'số lần thành công', detail: 'Số lần thành công trong các phép thử.' },
            numberS2: { name: 'Số lần thành công tối đa', detail: 'Nếu được cung cấp, trả về xác suất số lần thử thành công nằm trong khoảng từ số lần thành công đến số lần thành công tối đa.' },
        },
    },
    BINOM_INV: {
        description: 'Trả về giá trị nhỏ nhất để phân phối nhị thức tích lũy nhỏ hơn hoặc bằng ngưỡng quyết định',
        abstract: 'Trả về giá trị nhỏ nhất để phân phối nhị thức tích lũy nhỏ hơn hoặc bằng ngưỡng quyết định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'số phép thử', detail: 'Số phép thử Bernoulli.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Xác suất thành công của mỗi phép thử.' },
            alpha: { name: 'xác suất mục tiêu', detail: 'Giá trị tiêu chí.' },
        },
    },
    CHISQ_DIST: {
        description: 'Trả về xác suất của vế trái của phân bố χ2.',
        abstract: 'Trả về xác suất của vế trái của phân bố χ2.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giái trị bạn muốn đánh giá phân phối.' },
            degFreedom: { name: 'bậc tự do', detail: 'Số bậc tự do.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì CHISQ.DIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Trả về xác suất bên phải của phân bố χ2.',
        abstract: 'Trả về xác suất bên phải của phân bố χ2.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giái trị bạn muốn đánh giá phân phối.' },
            degFreedom: { name: 'bậc tự do', detail: 'Số bậc tự do.' },
        },
    },
    CHISQ_INV: {
        description: 'Trả về hàm nghịch đảo của xác suất ở đuôi trái của phân bố χ2.',
        abstract: 'Trả về hàm nghịch đảo của xác suất ở đuôi trái của phân bố χ2.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất liên quan đến phân phối χ2.' },
            degFreedom: { name: 'bậc tự do', detail: 'Số bậc tự do.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Trả về hàm nghịch đảo của xác suất ở đuôi bên phải của phân bố χ2.',
        abstract: 'Trả về hàm nghịch đảo của xác suất ở đuôi bên phải của phân bố χ2.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất liên quan đến phân phối χ2.' },
            degFreedom: { name: 'bậc tự do', detail: 'Số bậc tự do.' },
        },
    },
    CHISQ_TEST: {
        description: 'Trả về giá trị kiểm độc lập',
        abstract: 'Trả về giá trị kiểm độc lập',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'phạm vi quan sát', detail: 'Phạm vi dữ liệu chứa các quan sát để kiểm thử đối với các giá trị dự kiến.' },
            expectedRange: { name: 'phạm vi dự kiến', detail: 'Phạm vi dữ liệu chứa tỷ lệ của phép nhân tổng hàng và tổng cột với tổng cộng.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Trả về khoảng tin cậy của trung bình tổng thể, bằng cách dùng phân bố chuẩn hóa.',
        abstract: 'Trả về khoảng tin cậy của trung bình tổng thể, bằng cách dùng phân bố chuẩn hóa.',
        links: [
            {
                title: 'Dạy học',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Mức quan trọng được dùng để tính toán mức tin cậy. Mức tin cậy bằng 100*(1 - alpha)%, hay nói cách khác, alpha 0,05 cho biết mức tin cậy 95 phần trăm.' },
            standardDev: { name: 'Độ lệch chuẩn tổng', detail: 'Độ lệch chuẩn tổng thể cho phạm vi dữ liệu và được giả định là đã được xác định.' },
            size: { name: 'cỡ mẫu', detail: 'Cỡ mẫu.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Trả về khoảng tin cậy cho giá trị trung bình của tổng thể (sử dụng phân phối t-student)',
        abstract: 'Trả về khoảng tin cậy cho giá trị trung bình của tổng thể (sử dụng phân phối t-student)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Mức quan trọng được dùng để tính toán mức tin cậy. Mức tin cậy bằng 100*(1 - alpha)%, hay nói cách khác, alpha 0,05 cho biết mức tin cậy 95 phần trăm.' },
            standardDev: { name: 'Độ lệch chuẩn tổng', detail: 'Độ lệch chuẩn tổng thể cho phạm vi dữ liệu và được giả định là đã được xác định.' },
            size: { name: 'cỡ mẫu', detail: 'Cỡ mẫu.' },
        },
    },
    CORREL: {
        description: 'Trả về hệ số tương quan giữa hai tập dữ liệu',
        abstract: 'Trả về hệ số tương quan giữa hai tập dữ liệu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Phạm vi giá trị ô đầu tiên.' },
            array2: { name: 'mảng 2', detail: 'Phạm vi giá trị ô thứ hai.' },
        },
    },
    COUNT: {
        description: 'Đếm số lượng ô chứa số và số lượng trong danh sách đối số.',
        abstract: 'Đếm số lượng trong danh sách đối số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: {
                name: 'giá trị 1',
                detail: 'Là giá trị đầu tiên, tham chiếu ô hoặc vùng để đếm số lượng trong đó.',
            },
            value2: {
                name: 'giá trị 2',
                detail: 'Là các giá trị khác, tham chiếu ô hoặc vùng để đếm số lượng, có thể lên tới 255 giá trị.',
            },
        },
    },
    COUNTA: {
        description: `Tính toán các ô chứa bất kỳ loại thông tin nào, bao gồm giá trị lỗi và văn bản trống ("")
    Nếu bạn không cần đếm các giá trị logic, văn bản hoặc giá trị lỗi (nói cách khác, bạn chỉ muốn đếm các ô có chứa số), hãy sử dụng hàm COUNT.`,
        abstract: 'Tính toán số lượng các giá trị trong danh sách tham số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: 'Giá trị 1', detail: 'Giá trị đầu tiên, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình.' },
            value2: { name: 'Giá trị 2', detail: 'Các giá trị khác, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình, tối đa là 255.' },
        },
    },
    COUNTBLANK: {
        description: 'để đếm số ô trống trong phạm vi ô.',
        abstract: 'để đếm số ô trống trong phạm vi ô.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'phạm vi', detail: 'Phạm vi mà từ đó bạn muốn đếm các ô trống.' },
        },
    },
    COUNTIF: {
        description: 'để đếm số lượng ô đáp ứng một tiêu chí.',
        abstract: 'để đếm số lượng ô đáp ứng một tiêu chí.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'phạm vi', detail: 'Nhóm các ô mà bạn muốn đếm. Phạm vi có thể chứa số, mảng, phạm vi có tên hoặc tham chiếu có chứa số. Các giá trị trống và giá trị văn bản được bỏ qua.' },
            criteria: { name: 'tiêu chí', detail: 'Số, biểu thức, tham chiếu ô hoặc chuỗi văn bản xác định ô nào sẽ được đếm.\nVí dụ: bạn có thể sử dụng một số như 32, một so sánh như "> 32", một ô như B4, hoặc một từ như "táo".' },
        },
    },
    COUNTIFS: {
        description: 'áp dụng tiêu chí cho các ô trong nhiều dải ô và đếm số lần đáp ứng tất cả các tiêu chí.',
        abstract: 'áp dụng tiêu chí cho các ô trong nhiều dải ô và đếm số lần đáp ứng tất cả các tiêu chí.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'phạm vi tiêu chí 1', detail: 'Phạm vi thứ nhất trong đó cần đánh giá các tiêu chí liên kết.' },
            criteria1: { name: 'tiêu chí 1', detail: 'Tiêu chí dưới dạng một số, biểu thức, tham chiếu ô hoặc văn bản để xác định những ô nào cần đếm. Ví dụ: tiêu chí có thể được biểu thị là 32, ">32", B4, "táo" hoặc "32".' },
            criteriaRange2: { name: 'phạm vi tiêu chí 2', detail: 'Khu vực bổ sung. Có thể nhập tới 127 khu vực.' },
            criteria2: { name: 'tiêu chí 2', detail: 'Điều kiện liên kết bổ sung. Có thể nhập tối đa 127 điều kiện.' },
        },
    },
    COVARIANCE_P: {
        description: 'Trả về hiệp phương sai của tập hợp, trung bình tích của các độ lệnh cho mỗi cặp điểm dữ liệu trong hai tập dữ liệu.',
        abstract: 'Trả về hiệp phương sai của tập hợp',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Phạm vi giá trị ô đầu tiên.' },
            array2: { name: 'mảng 2', detail: 'Phạm vi giá trị ô thứ hai.' },
        },
    },
    COVARIANCE_S: {
        description: 'Trả về hiệp phương sai mẫu, trung bình tích của các độ lệnh cho mỗi cặp điểm dữ liệu trong hai tập dữ liệu.',
        abstract: 'Trả về hiệp phương sai mẫu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Phạm vi giá trị ô đầu tiên.' },
            array2: { name: 'mảng 2', detail: 'Phạm vi giá trị ô thứ hai.' },
        },
    },
    DEVSQ: {
        description: 'Trả về tổng độ lệch bình phương',
        abstract: 'Trả về tổng độ lệch bình phương',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Tham số thứ nhất mà bạn muốn tính tổng bình phương độ lệch.' },
            number2: { name: 'số 2', detail: 'Tham số từ 2 đến 255 mà bạn muốn tính tổng bình phương độ lệch.' },
        },
    },
    EXPON_DIST: {
        description: 'Trả về phân bố hàm mũ.',
        abstract: 'Trả về phân bố hàm mũ.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giái trị bạn muốn đánh giá phân phối.' },
            lambda: { name: 'lambda', detail: 'Giá trị tham số.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì EXPON.DIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    F_DIST: {
        description: 'Trả về phân bố xác suất F.',
        abstract: 'Trả về phân bố xác suất F.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giá trị để đánh giá hàm.' },
            degFreedom1: { name: 'bậc tự do ở tử số', detail: 'Bậc tự do ở tử số.' },
            degFreedom2: { name: 'bậc tự do ở mẫu số.', detail: 'Bậc tự do ở mẫu số.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì F.DIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    F_DIST_RT: {
        description: 'Trả về phân bố xác suất F (đuôi bên phải)',
        abstract: 'Trả về phân bố xác suất F (đuôi bên phải)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giá trị để đánh giá hàm.' },
            degFreedom1: { name: 'bậc tự do ở tử số', detail: 'Bậc tự do ở tử số.' },
            degFreedom2: { name: 'bậc tự do ở mẫu số.', detail: 'Bậc tự do ở mẫu số.' },
        },
    },
    F_INV: {
        description: 'Trả về giá trị đảo của phân bố xác suất F.',
        abstract: 'Trả về giá trị đảo của phân bố xác suất F.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất gắn với phân bố lũy tích F.' },
            degFreedom1: { name: 'bậc tự do ở tử số', detail: 'Bậc tự do ở tử số.' },
            degFreedom2: { name: 'bậc tự do ở mẫu số.', detail: 'Bậc tự do ở mẫu số.' },
        },
    },
    F_INV_RT: {
        description: 'Trả về giá trị đảo của phân bố xác suất F (đuôi bên phải).',
        abstract: 'Trả về giá trị đảo của phân bố xác suất F (đuôi bên phải).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất gắn với phân bố lũy tích F.' },
            degFreedom1: { name: 'bậc tự do ở tử số', detail: 'Bậc tự do ở tử số.' },
            degFreedom2: { name: 'bậc tự do ở mẫu số.', detail: 'Bậc tự do ở mẫu số.' },
        },
    },
    F_TEST: {
        description: 'Trả về kết quả của kiểm tra F-test',
        abstract: 'Trả về kết quả của kiểm tra F-test',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Mảng thứ nhất của phạm vi dữ liệu.' },
            array2: { name: 'mảng 2', detail: 'Mảng thứ hai của phạm vi dữ liệu.' },
        },
    },
    FISHER: {
        description: 'Trả về phép biến đổi Fisher tại x.',
        abstract: 'Trả về phép biến đổi Fisher tại x.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giá trị số mà bạn muốn biến đổi.' },
        },
    },
    FISHERINV: {
        description: 'Trả về nghịch đảo của phép biến đổi Fisher. ',
        abstract: 'Trả về nghịch đảo của phép biến đổi Fisher. ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'số', detail: 'Giá trị mà bạn muốn thực hiện nghịch đảo của phép biến đổi.' },
        },
    },
    FORECAST: {
        description: 'Trả về giá trị xu hướng tuyến tính',
        abstract: 'Trả về giá trị xu hướng tuyến tính',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Điểm dữ liệu mà bạn muốn dự đoán một giá trị cho nó.' },
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    FORECAST_ETS: {
        description: 'Bạn luôn có thể yêu cầu chuyên gia trong Cộng đồng Kỹ thuật Excel hoặc nhận hỗ trợ trong Cộng đồng .',
        abstract: 'Bạn luôn có thể yêu cầu chuyên gia trong Cộng đồng Kỹ thuật Excel hoặc nhận hỗ trợ trong Cộng đồng .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Ngày đích', detail: 'Điểm dữ liệu mà bạn muốn dự đoán giá trị.' },
            values: { name: 'Giá trị', detail: 'Các giá trị lịch sử dùng để dự báo.' },
            timeline: { name: 'Dòng thời gian', detail: 'Phạm vi hoặc mảng độc lập gồm ngày hoặc giờ dạng số với bước không đổi.' },
            seasonality: { name: 'Tính thời vụ', detail: 'Tùy chọn. 1 để tự động phát hiện và 0 để không dùng tính thời vụ.' },
            dataCompletion: { name: 'Hoàn thành dữ liệu', detail: 'Tùy chọn. Dùng 1 để nội suy điểm bị thiếu hoặc 0 để coi chúng là số không.' },
            aggregation: { name: 'Tổng hợp', detail: 'Tùy chọn. Giá trị từ 1 đến 7 chỉ định cách tổng hợp dấu thời gian trùng lặp.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Bạn luôn có thể yêu cầu chuyên gia trong Cộng đồng Kỹ thuật Excel hoặc nhận hỗ trợ trong Cộng đồng .',
        abstract: 'Bạn luôn có thể yêu cầu chuyên gia trong Cộng đồng Kỹ thuật Excel hoặc nhận hỗ trợ trong Cộng đồng .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Ngày đích', detail: 'Điểm dữ liệu mà bạn muốn dự đoán giá trị.' },
            values: { name: 'Giá trị', detail: 'Các giá trị lịch sử dùng để dự báo.' },
            timeline: { name: 'Dòng thời gian', detail: 'Phạm vi hoặc mảng độc lập gồm ngày hoặc giờ dạng số với bước không đổi.' },
            confidenceLevel: { name: 'Mức tin cậy', detail: 'Tùy chọn. Số từ 0 đến 1; mặc định là 0,95.' },
            seasonality: { name: 'Tính thời vụ', detail: 'Tùy chọn. 1 để tự động phát hiện và 0 để không dùng tính thời vụ.' },
            dataCompletion: { name: 'Hoàn thành dữ liệu', detail: 'Tùy chọn. Dùng 1 để nội suy điểm bị thiếu hoặc 0 để coi chúng là số không.' },
            aggregation: { name: 'Tổng hợp', detail: 'Tùy chọn. Giá trị từ 1 đến 7 chỉ định cách tổng hợp dấu thời gian trùng lặp.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Bạn luôn có thể yêu cầu chuyên gia trong Cộng đồng Kỹ thuật Excel hoặc nhận hỗ trợ trong Cộng đồng .',
        abstract: 'Bạn luôn có thể yêu cầu chuyên gia trong Cộng đồng Kỹ thuật Excel hoặc nhận hỗ trợ trong Cộng đồng .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Giá trị', detail: 'Các giá trị lịch sử dùng để dự báo.' },
            timeline: { name: 'Dòng thời gian', detail: 'Phạm vi hoặc mảng độc lập gồm ngày hoặc giờ dạng số với bước không đổi.' },
            dataCompletion: { name: 'Hoàn thành dữ liệu', detail: 'Tùy chọn. Dùng 1 để nội suy điểm bị thiếu hoặc 0 để coi chúng là số không.' },
            aggregation: { name: 'Tổng hợp', detail: 'Tùy chọn. Giá trị từ 1 đến 7 chỉ định cách tổng hợp dấu thời gian trùng lặp.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Bạn luôn có thể yêu cầu chuyên gia trong Cộng đồng Kỹ thuật Excel hoặc nhận hỗ trợ trong Cộng đồng .',
        abstract: 'Bạn luôn có thể yêu cầu chuyên gia trong Cộng đồng Kỹ thuật Excel hoặc nhận hỗ trợ trong Cộng đồng .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Giá trị', detail: 'Các giá trị lịch sử dùng để dự báo.' },
            timeline: { name: 'Dòng thời gian', detail: 'Phạm vi hoặc mảng độc lập gồm ngày hoặc giờ dạng số với bước không đổi.' },
            statisticType: { name: 'Loại thống kê', detail: 'Giá trị từ 1 đến 8 chỉ định thống kê dự báo cần trả về.' },
            seasonality: { name: 'Tính thời vụ', detail: 'Tùy chọn. 1 để tự động phát hiện và 0 để không dùng tính thời vụ.' },
            dataCompletion: { name: 'Hoàn thành dữ liệu', detail: 'Tùy chọn. Dùng 1 để nội suy điểm bị thiếu hoặc 0 để coi chúng là số không.' },
            aggregation: { name: 'Tổng hợp', detail: 'Tùy chọn. Giá trị từ 1 đến 7 chỉ định cách tổng hợp dấu thời gian trùng lặp.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Trả về giá trị tương lai dựa trên giá trị hiện tại',
        abstract: 'Trả về giá trị tương lai dựa trên giá trị hiện tại',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Điểm dữ liệu mà bạn muốn dự đoán một giá trị cho nó.' },
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    FREQUENCY: {
        description: 'Trả về phân bố tần suất dưới dạng một mảng dọc',
        abstract: 'Trả về phân bố tần suất dưới dạng một mảng dọc',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'dữ liệuMảng', detail: 'Một mảng hoặc tham chiếu tới một tập giá trị mà bạn muốn đếm tần suất của nó. Nếu data_array không chứa giá trị, thì hàm FREQUENCY trả về mảng các số không.' },
            binsArray: { name: 'mảng ngắt quãng', detail: 'Mảng hoặc tham chiếu tới các khoảng mà bạn muốn nhóm các giá trị trong data_array vào trong đó. Nếu bins_array không chứa giá trị, thì hàm FREQUENCY trả về số thành phần trong data_array.' },
        },
    },
    GAMMA: {
        description: 'Trả về giá trị hàm gamma.',
        abstract: 'Trả về giá trị hàm gamma.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Giá trị đầu vào của hàm gamma.' },
        },
    },
    GAMMA_DIST: {
        description: 'Trả về phân bố gamma.',
        abstract: 'Trả về phân bố gamma.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm GAMMA.DIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    GAMMA_INV: {
        description: 'Trả về giá trị đảo của phân bố lũy tích gamma.',
        abstract: 'Trả về giá trị đảo của phân bố lũy tích gamma.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất gắn với phân bố gamma.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
        },
    },
    GAMMALN: {
        description: 'Trả về lô-ga-rít tự nhiên của hàm gamma, Γ(x).',
        abstract: 'Trả về lô-ga-rít tự nhiên của hàm gamma, Γ(x).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn tính toán GAMMALN.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Trả về lô-ga-rít tự nhiên của hàm gamma, Γ(x).',
        abstract: 'Trả về lô-ga-rít tự nhiên của hàm gamma, Γ(x).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn tính toán GAMMALN.PRECISE.' },
        },
    },
    GAUSS: {
        description: 'Trả về ít hơn 0.5 so với phân phối tích lũy chuẩn',
        abstract: 'Trả về ít hơn 0.5 so với phân phối tích lũy chuẩn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
        },
    },
    GEOMEAN: {
        description: 'Trả về giá trị trung bình hình học',
        abstract: 'Trả về giá trị trung bình hình học',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi ô để tính giá trị trung bình hình học.' },
            number2: { name: 'số 2', detail: 'Tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính giá trị trung bình hình học.' },
        },
    },
    GROWTH: {
        description: 'Trả về giá trị xu hướng hàm mũ',
        abstract: 'Trả về giá trị xu hướng hàm mũ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'dữ liệu đã biết_y', detail: 'Tập giá trị y mà bạn đã biết trong quan hệ y = b*m^x.' },
            knownXs: { name: 'dữ liệu đã biết_x', detail: 'Tập giá trị x mà bạn đã biết trong quan hệ y = b*m^x.' },
            newXs: { name: 'dữ liệu mới_x', detail: 'Là những giá trị x mới mà bạn muốn hàm GROWTH trả về tương ứng với các giá trị y.' },
            constb: { name: 'b', detail: 'Một giá trị lô-gic cho biết có bắt buộc hằng số b phải bằng 1 hay không.' },
        },
    },
    HARMEAN: {
        description: 'Trả về giá trị trung bình điều hòa',
        abstract: 'Trả về giá trị trung bình điều hòa',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi ô để tính giá trị trung bình điều hòa.' },
            number2: { name: 'số 2', detail: 'Lên đến 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính giá trị trung bình hài hòa.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Trả về phân bố siêu bội.',
        abstract: 'Trả về phân bố siêu bội.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'Số lần thành công mẫu', detail: 'Số lần thành công trong mẫu.' },
            numberSample: { name: 'Kích thước mẫu', detail: 'Kích thước mẫu.' },
            populationS: { name: 'Tổng số thành công', detail: 'Số lượng thành công trong dân số.' },
            numberPop: { name: 'Kích thước tổng thể', detail: 'Kích thước tổng thể.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm HYPGEOM.DIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    INTERCEPT: {
        description: 'Trả về điểm chặn của đường hồi quy tuyến tính',
        abstract: 'Trả về điểm chặn của đường hồi quy tuyến tính',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    KURT: {
        description: 'Trả về hệ số nhọn của tập dữ liệu.',
        abstract: 'Trả về hệ số nhọn của tập dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số, tham chiếu ô hoặc phạm vi ô đầu tiên cần tính giá trị đỉnh.' },
            number2: { name: 'số 2', detail: 'Tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính giá trị đỉnh.' },
        },
    },
    LARGE: {
        description: 'Trả về giá trị lớn thứ k của tập dữ liệu.',
        abstract: 'Trả về giá trị lớn thứ k của tập dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi dữ liệu mà bạn muốn xác định giá trị lớn thứ k trong đó.' },
            k: { name: 'k', detail: 'Vị trí (tính từ lớn nhất) trong mảng hoặc phạm vi ô dữ liệu cần trả về.' },
        },
    },
    LINEST: {
        description: 'Trả về các tham số của xu hướng tuyến tính',
        abstract: 'Trả về các tham số của xu hướng tuyến tính',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'dữ liệu đã biết_y', detail: 'Tập giá trị y mà bạn đã biết trong quan hệ y = m*x+b.' },
            knownXs: { name: 'dữ liệu đã biết_x', detail: 'Tập giá trị x mà bạn đã biết trong quan hệ y = m*x+b.' },
            constb: { name: 'b', detail: 'Một giá trị lô-gic cho biết có bắt buộc hằng số b phải bằng 0 hay không.' },
            stats: { name: 'thống kê', detail: 'Giá trị lô-gic chỉ rõ có trả về các thống kê hồi quy bổ sung hay không.' },
        },
    },
    LOGEST: {
        description: 'Trả về các tham số của xu hướng hàm mũ',
        abstract: 'Trả về các tham số của xu hướng hàm mũ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'dữ liệu đã biết_y', detail: 'Tập giá trị y mà bạn đã biết trong quan hệ y = b*m^x.' },
            knownXs: { name: 'dữ liệu đã biết_x', detail: 'Tập giá trị x mà bạn đã biết trong quan hệ y = b*m^x.' },
            constb: { name: 'b', detail: 'Một giá trị lô-gic cho biết có bắt buộc hằng số b phải bằng 1 hay không.' },
            stats: { name: 'thống kê', detail: 'Giá trị lô-gic chỉ rõ có trả về các thống kê hồi quy bổ sung hay không.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Trả về phân bố chuẩn lô-ga-rít của',
        abstract: 'Trả về phân bố chuẩn lô-ga-rít của',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì LOGNORM.DIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    LOGNORM_INV: {
        description: 'Trả về nghịch đảo của hàm phân bố lô-ga-rit chuẩn lũy tích của',
        abstract: 'Trả về nghịch đảo của hàm phân bố lô-ga-rit chuẩn lũy tích của',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Một xác suất tương ứng với phân bố lô-ga-rit chuẩn.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
        },
    },
    MARGINOFERROR: {
        description: 'Hàm này tính biên độ sai số của một dải giá trị và mức tin cậy.',
        abstract: 'Hàm này tính biên độ sai số của một dải giá trị và mức tin cậy.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/12487850?hl=vi',
            },
        ],
        functionParameter: {
            range: { name: 'dải_ô', detail: 'MARGINOFERROR(A1:C3; 0.99)' },
            confidence: { name: 'mức_tin_cậy', detail: 'Mức tin cậy mong muốn trong khoảng (0, 1).' },
        },
    },
    MAX: {
        description: 'Trả về giá trị lớn nhất trong tập giá trị.',
        abstract: 'Trả về giá trị lớn nhất trong tập giá trị.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'số 1',
                detail: 'Số, tham chiếu ô hoặc phạm vi ô đầu tiên để tính giá trị lớn nhất.',
            },
            number2: {
                name: 'số 2',
                detail: 'Bạn có thể bao gồm tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính giá trị tối đa.',
            },
        },
    },
    MAXA: {
        description: 'Trả về giá trị lớn nhất trong một danh sách đối số.',
        abstract: 'Trả về giá trị lớn nhất trong một danh sách đối số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'giá trị 1', detail: 'Đối số dạng số thứ nhất mà bạn muốn tìm giá trị lớn nhất trong đó.' },
            value2: { name: 'giá trị 2', detail: 'Các đối số dạng số thứ 2 đến 255 mà bạn muốn tìm giá trị lớn nhất trong đó.' },
        },
    },
    MAXIFS: {
        description: 'trả về giá trị tối đa giữa các ô được xác định bằng một loạt các điều kiện hoặc tiêu chí cho trước.',
        abstract: 'trả về giá trị tối đa giữa các ô được xác định bằng một loạt các điều kiện hoặc tiêu chí cho trước.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'phạm vi giá trị tối đa', detail: 'Dải ô thực tế để xác định giá trị lớn nhất.' },
            criteriaRange1: { name: 'phạm vi tiêu chí 1', detail: 'Là tập hợp các ô cần đánh giá theo tiêu chí.' },
            criteria1: { name: 'tiêu chí 1', detail: 'Là tiêu chí ở dạng số, biểu thức hoặc văn bản xác định ô nào sẽ được đánh giá là lớn nhất. ' },
            criteriaRange2: { name: 'phạm vi tiêu chí 2', detail: 'Khu vực bổ sung. Có thể nhập tới 127 khu vực.' },
            criteria2: { name: 'tiêu chí 2', detail: 'Điều kiện liên kết bổ sung. Có thể nhập tối đa 127 điều kiện.' },
        },
    },
    MEDIAN: {
        description: 'Trả về số trung vị của các số đã cho.',
        abstract: 'Trả về số trung vị của các số đã cho.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi ô để tính trung vị.' },
            number2: { name: 'số 2', detail: 'Bạn có thể bao gồm tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính trung vị.' },
        },
    },
    MIN: {
        description: 'Trả về số nhỏ nhất trong tập giá trị.',
        abstract: 'Trả về số nhỏ nhất trong tập giá trị.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'số 1',
                detail: 'Số, tham chiếu ô hoặc phạm vi ô đầu tiên để tính giá trị tối thiểu.',
            },
            number2: {
                name: 'số 2',
                detail: 'Bạn có thể bao gồm tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính giá trị tối thiểu.',
            },
        },
    },
    MINA: {
        description: 'Trả về giá trị nhỏ nhất trong một danh sách đối số.',
        abstract: 'Trả về giá trị nhỏ nhất trong một danh sách đối số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'giá trị 1', detail: 'Số, tham chiếu ô hoặc phạm vi ô đầu tiên để tính giá trị tối thiểu.' },
            value2: { name: 'giá trị 2', detail: 'Bạn có thể bao gồm tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính giá trị tối thiểu.' },
        },
    },
    MINIFS: {
        description: 'trả về giá trị tối thiểu trong số các ô được xác định bởi một tập hợp các điều kiện hoặc tiêu chí cho trước.',
        abstract: 'trả về giá trị tối thiểu trong số các ô được xác định bởi một tập hợp các điều kiện hoặc tiêu chí cho trước.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'phạm vi giá trị tối thiểu', detail: 'Dải ô thực tế để xác định giá trị nhỏ nhất.' },
            criteriaRange1: { name: 'phạm vi tiêu chí 1', detail: 'Là tập hợp các ô cần đánh giá theo tiêu chí.' },
            criteria1: { name: 'tiêu chí 1', detail: 'Là tiêu chí ở dạng số, biểu thức hoặc văn bản xác định ô nào sẽ được đánh giá là nhỏ nhất.' },
            criteriaRange2: { name: 'phạm vi tiêu chí 2', detail: 'Khu vực bổ sung. Có thể nhập tới 127 khu vực.' },
            criteria2: { name: 'tiêu chí 2', detail: 'Điều kiện liên kết bổ sung. Có thể nhập tối đa 127 điều kiện.' },
        },
    },
    MODE_MULT: {
        description: 'Trả về một mảng dọc của các giá trị thường xảy ra nhất, hoặc các giá trị lặp lại trong một mảng hoặc phạm vi dữ liệu.',
        abstract: 'Trả về một mảng dọc của các giá trị thường xảy ra nhất, hoặc các giá trị lặp lại trong một mảng hoặc phạm vi dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi ô mà chế độ sẽ được tính toán.' },
            number2: { name: 'số 2', detail: 'Tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính chế độ.' },
        },
    },
    MODE_SNGL: {
        description: 'Trả về giá trị xuất hiện nhiều nhất trong tập dữ liệu.',
        abstract: 'Trả về giá trị xuất hiện nhiều nhất trong tập dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi ô mà chế độ sẽ được tính toán.' },
            number2: { name: 'số 2', detail: 'Tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính chế độ.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Trả về phân bố nhị thức âm',
        abstract: 'Trả về phân bố nhị thức âm',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'số lần thất bại.', detail: 'Số lần thất bại.' },
            numberS: { name: 'số lần thành công', detail: 'Số ngưỡng thành công.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Xác suất thành công của mỗi phép thử.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm NEGBINOM.DIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    NORM_DIST: {
        description: 'Trả về hàm phân phối tích lũy chuẩn',
        abstract: 'Trả về hàm phân phối tích lũy chuẩn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì NORM.DIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    NORM_INV: {
        description: 'Trả về hàm nghịch đảo của hàm phân phối tích lũy chuẩn',
        abstract: 'Trả về hàm nghịch đảo của hàm phân phối tích lũy chuẩn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Một xác suất tương ứng với phân bố chuẩn.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
        },
    },
    NORM_S_DIST: {
        description: 'Trả về phân bố chuẩn chuẩn hóa',
        abstract: 'Trả về phân bố chuẩn chuẩn hóa',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì NORM.DIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    NORM_S_INV: {
        description: 'Trả về giá trị đảo của phân bố lũy tích chuẩn chuẩn hóa.',
        abstract: 'Trả về giá trị đảo của phân bố lũy tích chuẩn chuẩn hóa.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Một xác suất tương ứng với phân bố chuẩn.' },
        },
    },
    PEARSON: {
        description: 'Trả về hệ số tương quan mô-men tích Pearson',
        abstract: 'Trả về hệ số tương quan mô-men tích Pearson',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            array2: { name: 'mảng 2', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'Trả về giá trị phân vị thứ k trong tập dữ liệu (loại trừ 0 và 1)',
        abstract: 'Trả về giá trị phân vị thứ k trong tập dữ liệu (loại trừ 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi dữ liệu xác định vị trí tương đối.' },
            k: { name: 'k', detail: 'Giá trị phần trăm từ 0 đến 1 (loại trừ 0 và 1).' },
        },
    },
    PERCENTILE_INC: {
        description: 'Trả về giá trị phân vị thứ k trong tập dữ liệu (bao gồm 0 và 1)',
        abstract: 'Trả về giá trị phân vị thứ k trong tập dữ liệu (bao gồm 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi dữ liệu xác định vị trí tương đối.' },
            k: { name: 'k', detail: 'Giá trị phần trăm từ 0 đến 1 (bao gồm 0 và 1).' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Trả về thứ hạng phần trăm của các giá trị trong tập dữ liệu (loại trừ 0 và 1)',
        abstract: 'Trả về thứ hạng phần trăm của các giá trị trong tập dữ liệu (loại trừ 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi dữ liệu xác định vị trí tương đối.' },
            x: { name: 'x', detail: 'Giá trị mà bạn muốn biết thứ hạng của nó.' },
            significance: { name: 'chữ số có nghĩa', detail: 'Giá trị xác định số chữ số có nghĩa của giá trị phần trăm trả về. Nếu bỏ qua, hàm PERCENTRANK.EXC dùng ba chữ số (0.xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Trả về thứ hạng phần trăm của các giá trị trong tập dữ liệu (bao gồm 0 và 1)',
        abstract: 'Trả về thứ hạng phần trăm của các giá trị trong tập dữ liệu (bao gồm 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi dữ liệu xác định vị trí tương đối.' },
            x: { name: 'x', detail: 'Giá trị mà bạn muốn biết thứ hạng của nó.' },
            significance: { name: 'chữ số có nghĩa', detail: 'Giá trị xác định số chữ số có nghĩa của giá trị phần trăm trả về. Nếu bỏ qua, hàm PERCENTRANK.INC dùng ba chữ số (0.xxx).' },
        },
    },
    PERMUT: {
        description: 'Trả về số hoán vị của một số đối tượng nhất định',
        abstract: 'Trả về số hoán vị của một số đối tượng nhất định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'tổng cộng', detail: 'Số hạng mục.' },
            numberChosen: { name: 'số lượng mẫu', detail: 'Số lượng các mục trong mỗi sự sắp xếp.' },
        },
    },
    PERMUTATIONA: {
        description: 'Trả về số hoán vị cho số đối tượng đã cho (với tần suất lặp) có thể được chọn từ tổng số đối tượng.',
        abstract: 'Trả về số hoán vị cho số đối tượng đã cho (với tần suất lặp) có thể được chọn từ tổng số đối tượng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'tổng cộng', detail: 'Số hạng mục.' },
            numberChosen: { name: 'số lượng mẫu', detail: 'Số lượng các mục trong mỗi sự sắp xếp.' },
        },
    },
    PHI: {
        description: 'Trả về giá trị của hàm mật độ cho một phân bố chuẩn chuẩn hóa.',
        abstract: 'Trả về giá trị của hàm mật độ cho một phân bố chuẩn chuẩn hóa.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'X là số bạn muốn tìm mật độ của phân bố chuẩn chuẩn hóa cho số này.' },
        },
    },
    POISSON_DIST: {
        description: 'Trả về phân bố Poisson.',
        abstract: 'Trả về phân bố Poisson.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì POISSON.DIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    PROB: {
        description: 'Trả về xác suất các giá trị trong một phạm vi nằm giữa hai giới hạn.',
        abstract: 'Trả về xác suất các giá trị trong một phạm vi nằm giữa hai giới hạn.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'số', detail: 'Phạm vi số với các giá trị xác suất tương ứng.' },
            probRange: { name: 'xác suất', detail: 'Một tập hợp các giá trị xác suất được liên kết với một giá trị số.' },
            lowerLimit: { name: 'giới hạn dưới', detail: 'Giới hạn dưới bằng số của xác suất được tính toán.' },
            upperLimit: { name: 'giới hạn trên', detail: 'Giới hạn trên bằng số của xác suất được tính toán.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Trả về các phần tư của tập dữ liệu (loại trừ 0 và 1)',
        abstract: 'Trả về các phần tư của tập dữ liệu (loại trừ 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Một mảng hoặc phạm vi dữ liệu yêu cầu giá trị tứ phân vị.' },
            quart: { name: 'giá trị tứ phân', detail: 'Giá trị tứ phân vị cần trả về.' },
        },
    },
    QUARTILE_INC: {
        description: 'Trả về các phần tư của tập dữ liệu (bao gồm 0 và 1)',
        abstract: 'Trả về các phần tư của tập dữ liệu (bao gồm 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Một mảng hoặc phạm vi dữ liệu yêu cầu giá trị tứ phân vị.' },
            quart: { name: 'giá trị tứ phân', detail: 'Giá trị tứ phân vị cần trả về.' },
        },
    },
    RANK_AVG: {
        description: 'Trả về thứ hạng của một số trong một danh sách các số',
        abstract: 'Trả về thứ hạng của một số trong một danh sách các số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn tìm thứ hạng của nó.' },
            ref: { name: 'danh sách các số', detail: 'Tham chiếu tới danh sách các số. Các giá trị không phải là số trong tham chiếu sẽ được bỏ qua.' },
            order: { name: 'xếp hạng số', detail: 'Một con số chỉ rõ cách xếp hạng số. 0 hoặc bị bỏ qua đối với thứ tự giảm dần, khác 0 đối với thứ tự tăng dần.' },
        },
    },
    RANK_EQ: {
        description: 'Trả về thứ hạng của một số trong một danh sách các số',
        abstract: 'Trả về thứ hạng của một số trong một danh sách các số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn tìm thứ hạng của nó.' },
            ref: { name: 'danh sách các số', detail: 'Tham chiếu tới danh sách các số. Các giá trị không phải là số trong tham chiếu sẽ được bỏ qua.' },
            order: { name: 'xếp hạng số', detail: 'Một con số chỉ rõ cách xếp hạng số. 0 hoặc bị bỏ qua đối với thứ tự giảm dần, khác 0 đối với thứ tự tăng dần.' },
        },
    },
    RSQ: {
        description: 'Trả về bình phương của hệ số tương quan thời điểm sản phẩm Pearson',
        abstract: 'Trả về hệ số tương quan mô-men tích Pearson',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    SKEW: {
        description: 'Trả về độ lệch của một phân bố.',
        abstract: 'Trả về độ lệch của một phân bố.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi ô cần tính độ lệch.' },
            number2: { name: 'số 2', detail: 'Tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính toán độ lệch.' },
        },
    },
    SKEW_P: {
        description: 'Trả về độ lệch của phân bố dựa trên tổng thể mẫu',
        abstract: 'Trả về độ lệch của phân bố dựa trên tổng thể mẫu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi ô cần tính độ lệch.' },
            number2: { name: 'số 2', detail: 'Tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính toán độ lệch.' },
        },
    },
    SLOPE: {
        description: 'Trả về độ dốc của đường hồi quy tuyến tính',
        abstract: 'Trả về độ dốc của đường hồi quy tuyến tính',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    SMALL: {
        description: 'Trả về giá trị nhỏ thứ k của tập dữ liệu.',
        abstract: 'Trả về giá trị nhỏ thứ k của tập dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi dữ liệu dạng số mà bạn muốn xác định giá trị nhỏ thứ k của nó.' },
            k: { name: 'k', detail: 'Vị trí (từ giá trị nhỏ nhất) trong mảng hoặc phạm vi dữ liệu cần trả về.' },
        },
    },
    STANDARDIZE: {
        description: 'Trả về giá trị chuẩn hóa',
        abstract: 'Trả về giá trị chuẩn hóa',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị bạn muốn chuẩn hóa.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
        },
    },
    STDEV_P: {
        description: 'Tính toán độ lệch chuẩn dựa trên toàn bộ tổng thể được cung cấp ở dạng đối số (bỏ qua giá trị lô-gic và văn bản).',
        abstract: 'Tính độ lệch chuẩn dựa trên toàn bộ quần thể mẫu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Đối số dạng số đầu tiên tương ứng với tổng thể.' },
            number2: { name: 'số 2', detail: 'Đối số dạng số từ 2 đến 254 tương ứng với tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
        },
    },
    STDEV_S: {
        description: 'Ước tính độ lệch chuẩn dựa trên mẫu (bỏ qua giá trị lô-gic và văn bản trong mẫu).',
        abstract: 'Ước tính độ lệch chuẩn dựa trên mẫu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Đối số dạng số đầu tiên tương ứng với mẫu tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
            number2: { name: 'số 2', detail: 'Đối số dạng số từ 2 đến 254 tương ứng với mẫu tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
        },
    },
    STDEVA: {
        description: 'Ước tính độ lệch chuẩn dựa trên một mẫu. Độ lệch chuẩn là số đo độ phân tán của các giá trị so với giá trị trung bình (trung độ).',
        abstract: 'Ước tính độ lệch chuẩn dựa trên một mẫu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'giá trị 1', detail: 'Đối số dạng số đầu tiên tương ứng với mẫu tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
            value2: { name: 'giá trị 2', detail: 'Đối số dạng số từ 2 đến 254 tương ứng với mẫu tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
        },
    },
    STDEVPA: {
        description: 'Tính toán độ lệch chuẩn dựa trên toàn bộ tập hợp được cung cấp ở dạng đối số, bao gồm văn bản và giá trị lô-gic.',
        abstract: 'Tính toán độ lệch chuẩn dựa trên toàn bộ tập hợp được cung cấp ở dạng đối số, bao gồm văn bản và giá trị lô-gic.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'giá trị 1', detail: 'Đối số dạng số đầu tiên tương ứng với tổng thể.' },
            value2: { name: 'giá trị 2', detail: 'Đối số dạng số từ 2 đến 254 tương ứng với tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
        },
    },
    STEYX: {
        description: 'Trả về sai số chuẩn của giá trị y dự đoán cho mỗi giá trị x trong hồi quy.',
        abstract: 'Trả về sai số chuẩn của giá trị y dự đoán cho mỗi giá trị x trong hồi quy.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    T_DIST: {
        description: 'Trả về phân phối xác suất t-Student của Học sinh',
        abstract: 'Trả về phân phối xác suất t-Student của Học sinh',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Cần tính giá trị số của phân bố.' },
            degFreedom: { name: 'bậc tự do', detail: 'Một số nguyên biểu thị số bậc tự do.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì T.DIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    T_DIST_2T: {
        description: 'Trả về phân phối xác suất t-Student của Học sinh (hai đuôi)',
        abstract: 'Trả về phân phối xác suất t-Student của Học sinh (hai đuôi)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Cần tính giá trị số của phân bố.' },
            degFreedom: { name: 'bậc tự do', detail: 'Một số nguyên biểu thị số bậc tự do.' },
        },
    },
    T_DIST_RT: {
        description: 'Trả về phân phối xác suất t-Student của Học sinh (đuôi bên phải)',
        abstract: 'Trả về phân phối xác suất t-Student của Học sinh (đuôi bên phải)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Cần tính giá trị số của phân bố.' },
            degFreedom: { name: 'bậc tự do', detail: 'Một số nguyên biểu thị số bậc tự do.' },
        },
    },
    T_INV: {
        description: 'Trả về hàm nghịch đảo của phân bố xác suất t-Student của Học sinh',
        abstract: 'Trả về hàm nghịch đảo của phân bố xác suất t-Student của Học sinh',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất liên quan đến phân phối t-Student của Sinh viên.' },
            degFreedom: { name: 'bậc tự do', detail: 'Một số nguyên biểu thị số bậc tự do.' },
        },
    },
    T_INV_2T: {
        description: 'Trả về hàm nghịch đảo của phân bố xác suất t-Student của Học sinh (hai đuôi)',
        abstract: 'Trả về hàm nghịch đảo của phân bố xác suất t-Student của Học sinh (hai đuôi)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất liên quan đến phân phối t-Student của Sinh viên.' },
            degFreedom: { name: 'bậc tự do', detail: 'Một số nguyên biểu thị số bậc tự do.' },
        },
    },
    T_TEST: {
        description: 'Trả về xác suất kết hợp với Phép thử t-Student.',
        abstract: 'Trả về xác suất kết hợp với Phép thử t-Student.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Mảng thứ nhất của phạm vi dữ liệu.' },
            array2: { name: 'mảng 2', detail: 'Mảng thứ hai của phạm vi dữ liệu.' },
            tails: { name: 'đặc điểm đuôi', detail: 'Xác định số đuôi của phân phối. Nếu đuôi = 1, T.TEST sử dụng phân phối một phía. Nếu đuôi = 2, T.TEST sử dụng phân phối hai phía.' },
            type: { name: 'loại Phép thử', detail: 'Loại Phép thử t cần thực hiện.' },
        },
    },
    TREND: {
        description: 'Trả về các giá trị theo xu hướng tuyến tính',
        abstract: 'Trả về các giá trị theo xu hướng tuyến tính',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'dữ liệu đã biết_y', detail: 'Tập giá trị y mà bạn đã biết trong quan hệ y = m*x+b.' },
            knownXs: { name: 'dữ liệu đã biết_x', detail: 'Tập giá trị x mà bạn đã biết trong quan hệ y = m*x+b.' },
            newXs: { name: 'dữ liệu mới_x', detail: 'Là những giá trị x mới mà bạn muốn hàm TREND trả về tương ứng với các giá trị y.' },
            constb: { name: 'b', detail: 'Một giá trị lô-gic cho biết có bắt buộc hằng số b phải bằng 0 hay không.' },
        },
    },
    TRIMMEAN: {
        description: 'Trả về trung bình của phần trong một tập dữ liệu.',
        abstract: 'Trả về trung bình của phần trong một tập dữ liệu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi giá trị cần cắt bớt và tính trung bình.' },
            percent: { name: 'tỷ lệ loại trừ', detail: 'Tỷ lệ các điểm dữ liệu cần loại bỏ ra khỏi việc tính toán.' },
        },
    },
    VAR_P: {
        description: 'Tính toán phương sai dựa trên toàn bộ tập hợp (bỏ các giá trị lô-gic và văn bản trong tập hợp).',
        abstract: 'Tính toán phương sai dựa trên toàn bộ tập hợp',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Đối số dạng số đầu tiên tương ứng với tổng thể.' },
            number2: { name: 'số 2', detail: 'Là các đối số dạng số từ 2 đến 254 tương ứng với một tập hợp.' },
        },
    },
    VAR_S: {
        description: 'Ước tính phương sai dựa trên mẫu (bỏ qua các giá trị lô-gic và văn bản trong mẫu).',
        abstract: 'Ước tính phương sai dựa trên mẫu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Đối số dạng số đầu tiên tương ứng với mẫu tổng thể.' },
            number2: { name: 'số 2', detail: 'Là các đối số dạng số từ 2 đến 254 tương ứng với một mẫu của một tập hợp.' },
        },
    },
    VARA: {
        description: 'Ước tính phương sai dựa trên mẫu.',
        abstract: 'Ước tính phương sai dựa trên mẫu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'giá trị 1', detail: 'Đối số dạng số đầu tiên tương ứng với mẫu tổng thể.' },
            value2: { name: 'giá trị 2', detail: 'Là các đối số dạng số từ 2 đến 254 tương ứng với một mẫu của một tập hợp.' },
        },
    },
    VARPA: {
        description: 'Tính toán phương sai dựa trên toàn bộ tập hợp.',
        abstract: 'Tính toán phương sai dựa trên toàn bộ tập hợp.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'giá trị 1', detail: 'Đối số dạng số đầu tiên tương ứng với tổng thể.' },
            value2: { name: 'giá trị 2', detail: 'Là các đối số dạng số từ 2 đến 254 tương ứng với một tập hợp.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Trả về phân bố Weibull.',
        abstract: 'Trả về phân bố Weibull.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm WEIBULL.DIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    Z_TEST: {
        description: 'Trả về giá trị xác suất một phía của kiểm tra z.',
        abstract: 'Trả về giá trị xác suất một phía của kiểm tra z.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hay khoảng dữ liệu để kiểm tra x.' },
            x: { name: 'x', detail: 'Giá trị cần kiểm tra.' },
            sigma: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn tổng thể (đã biết). Nếu bỏ qua, độ lệch chuẩn mẫu sẽ được dùng.' },
        },
    },
};

export default locale;
