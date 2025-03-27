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
    BETADIST: {
        description: 'Trả về hàm phân phối tích lũy beta',
        abstract: 'Trả về hàm phân phối tích lũy beta',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/betadist-%E5%87%BD%E6%95%B0-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giá trị được sử dụng để tính toán hàm của nó, giữa giá trị giới hạn dưới và giá trị giới hạn trên.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
            A: { name: 'giới hạn dưới', detail: 'Giới hạn dưới của hàm, giá trị mặc định là 0.' },
            B: { name: 'giới hạn trên', detail: 'Giới hạn trên của hàm, giá trị mặc định là 1.' },
        },
    },
    BETAINV: {
        description: 'Trả về hàm nghịch đảo của hàm phân phối tích lũy beta đã cho',
        abstract: 'Trả về hàm nghịch đảo của hàm phân phối tích lũy beta đã cho',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/betainv-%E5%87%BD%E6%95%B0-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
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
    BINOMDIST: {
        description: 'Trả về xác suất của phân phối nhị thức đơn',
        abstract: 'Trả về xác suất của phân phối nhị thức đơn',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/binomdist-%E5%87%BD%E6%95%B0-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            numberS: { name: 'số lần thành công', detail: 'Số lần thành công trong các phép thử.' },
            trials: { name: 'số phép thử', detail: 'Số phép thử độc lập.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Xác suất thành công của mỗi phép thử.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm BINOMDIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    CHIDIST: {
        description: 'Trả về xác suất bên phải của phân bố χ2',
        abstract: 'Trả về xác suất bên phải của phân bố χ2',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/chidist-%E5%87%BD%E6%95%B0-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giái trị bạn muốn đánh giá phân phối.' },
            degFreedom: { name: 'bậc tự do', detail: 'Số bậc tự do.' },
        },
    },
    CHIINV: {
        description: 'Trả về hàm nghịch đảo của xác suất ở đuôi bên phải của phân bố χ2.',
        abstract: 'Trả về hàm nghịch đảo của xác suất ở đuôi bên phải của phân bố χ2.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/chiinv-%E5%87%BD%E6%95%B0-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất liên quan đến phân phối χ2.' },
            degFreedom: { name: 'bậc tự do', detail: 'Số bậc tự do.' },
        },
    },
    CHITEST: {
        description: 'Trả về giá trị kiểm định độc lập',
        abstract: 'Trả về giá trị kiểm định độc lập',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/chitest-%E5%87%BD%E6%95%B0-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            actualRange: { name: 'phạm vi quan sát', detail: 'Phạm vi dữ liệu chứa các quan sát để kiểm thử đối với các giá trị dự kiến.' },
            expectedRange: { name: 'phạm vi dự kiến', detail: 'Phạm vi dữ liệu chứa tỷ lệ của phép nhân tổng hàng và tổng cột với tổng cộng.' },
        },
    },
    CONFIDENCE: {
        description: 'Trả về khoảng tin cậy của trung bình tổng thể, bằng cách dùng phân bố chuẩn hóa.',
        abstract: 'Trả về khoảng tin cậy của trung bình tổng thể, bằng cách dùng phân bố chuẩn hóa.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/confidence-%E5%87%BD%E6%95%B0-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Mức quan trọng được dùng để tính toán mức tin cậy. Mức tin cậy bằng 100*(1 - alpha)%, hay nói cách khác, alpha 0,05 cho biết mức tin cậy 95 phần trăm.' },
            standardDev: { name: 'Độ lệch chuẩn tổng', detail: 'Độ lệch chuẩn tổng thể cho phạm vi dữ liệu và được giả định là đã được xác định.' },
            size: { name: 'cỡ mẫu', detail: 'Cỡ mẫu.' },
        },
    },
    COVAR: {
        description: 'Trả về hiệp phương sai của tập hợp, trung bình tích của các độ lệnh cho mỗi cặp điểm dữ liệu trong hai tập dữ liệu.',
        abstract: 'Trả về hiệp phương sai của tập hợp',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/covar-%E5%87%BD%E6%95%B0-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Phạm vi giá trị ô đầu tiên.' },
            array2: { name: 'mảng 2', detail: 'Phạm vi giá trị ô thứ hai.' },
        },
    },
    CRITBINOM: {
        description: 'Trả về giá trị nhỏ nhất mà phân phối nhị thức tích lũy nhỏ hơn hoặc bằng giá trị tới hạn',
        abstract: 'Trả về giá trị nhỏ nhất mà phân phối nhị thức tích lũy nhỏ hơn hoặc bằng giá trị tới hạn',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/critbinom-%E5%87%BD%E6%95%B0-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            trials: { name: 'số phép thử', detail: 'Số phép thử Bernoulli.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Xác suất thành công của mỗi phép thử.' },
            alpha: { name: 'xác suất mục tiêu', detail: 'Giá trị tiêu chí.' },
        },
    },
    EXPONDIST: {
        description: 'Trả về phân phối mũ',
        abstract: 'Trả về phân phối mũ',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/expondist-%E5%87%BD%E6%95%B0-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giái trị bạn muốn đánh giá phân phối.' },
            lambda: { name: 'lambda', detail: 'Giá trị tham số.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì EXPONDIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    FDIST: {
        description: 'Trả về phân bố xác suất F (đuôi bên phải)',
        abstract: 'Trả về phân bố xác suất F (đuôi bên phải)',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/fdist-%E5%87%BD%E6%95%B0-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'Giá trị để đánh giá hàm.' },
            degFreedom1: { name: 'bậc tự do ở tử số', detail: 'Bậc tự do ở tử số.' },
            degFreedom2: { name: 'bậc tự do ở mẫu số.', detail: 'Bậc tự do ở mẫu số.' },
        },
    },
    FINV: {
        description: 'Trả về giá trị đảo của phân bố xác suất F (đuôi bên phải).',
        abstract: 'Trả về giá trị đảo của phân bố xác suất F (đuôi bên phải).',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/finv-%E5%87%BD%E6%95%B0-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất gắn với phân bố lũy tích F.' },
            degFreedom1: { name: 'bậc tự do ở tử số', detail: 'Bậc tự do ở tử số.' },
            degFreedom2: { name: 'bậc tự do ở mẫu số.', detail: 'Bậc tự do ở mẫu số.' },
        },
    },
    FTEST: {
        description: 'Trả về kết quả kiểm định F',
        abstract: 'Trả về kết quả kiểm định F',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/ftest-%E5%87%BD%E6%95%B0-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Mảng thứ nhất của phạm vi dữ liệu.' },
            array2: { name: 'mảng 2', detail: 'Mảng thứ hai của phạm vi dữ liệu.' },
        },
    },
    GAMMADIST: {
        description: 'Trả về phân phối γ',
        abstract: 'Trả về phân phối γ',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/gammadist-%E5%87%BD%E6%95%B0-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm GAMMADIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    GAMMAINV: {
        description: 'Trả về hàm nghịch đảo của hàm phân phối tích lũy γ',
        abstract: 'Trả về hàm nghịch đảo của hàm phân phối tích lũy γ',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/gammainv-%E5%87%BD%E6%95%B0-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất gắn với phân bố gamma.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Trả về phân bố siêu bội.',
        abstract: 'Trả về phân bố siêu bội.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/hypgeomdist-%E5%87%BD%E6%95%B0-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            sampleS: { name: 'Số lần thành công mẫu', detail: 'Số lần thành công trong mẫu.' },
            numberSample: { name: 'Kích thước mẫu', detail: 'Kích thước mẫu.' },
            populationS: { name: 'Tổng số thành công', detail: 'Số lượng thành công trong dân số.' },
            numberPop: { name: 'Kích thước tổng thể', detail: 'Kích thước tổng thể.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm HYPGEOMDIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    LOGINV: {
        description: 'Trả về nghịch đảo của hàm phân bố lô-ga-rit chuẩn lũy tích của',
        abstract: 'Trả về nghịch đảo của hàm phân bố lô-ga-rit chuẩn lũy tích của',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/loginv-%E5%87%BD%E6%95%B0-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Một xác suất tương ứng với phân bố lô-ga-rit chuẩn.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
        },
    },
    LOGNORMDIST: {
        description: 'Trả về phân bố chuẩn lô-ga-rít của',
        abstract: 'Trả về phân bố chuẩn lô-ga-rít của',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/lognormdist-%E5%87%BD%E6%95%B0-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì LOGNORMDIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    MODE: {
        description: 'Trả về giá trị xuất hiện nhiều nhất trong tập dữ liệu.',
        abstract: 'Trả về giá trị xuất hiện nhiều nhất trong tập dữ liệu.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/mode-%E5%87%BD%E6%95%B0-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi ô mà chế độ sẽ được tính toán.' },
            number2: { name: 'số 2', detail: 'Tối đa 255 số bổ sung, tham chiếu ô hoặc phạm vi ô để tính chế độ.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Trả về phân bố nhị thức âm',
        abstract: 'Trả về phân bố nhị thức âm',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/negbinomdist-%E5%87%BD%E6%95%B0-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            numberF: { name: 'số lần thất bại.', detail: 'Số lần thất bại.' },
            numberS: { name: 'số lần thành công', detail: 'Số ngưỡng thành công.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Xác suất thành công của mỗi phép thử.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm NEGBINOMDIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    NORMDIST: {
        description: 'Trả về hàm phân phối tích lũy chuẩn',
        abstract: 'Trả về hàm phân phối tích lũy chuẩn',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/normdist-%E5%87%BD%E6%95%B0-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì NORMDIST trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    NORMINV: {
        description: 'Trả về hàm nghịch đảo của hàm phân phối tích lũy chuẩn',
        abstract: 'Trả về hàm nghịch đảo của hàm phân phối tích lũy chuẩn',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/norminv-%E5%87%BD%E6%95%B0-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Một xác suất tương ứng với phân bố chuẩn.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn của phân phối.' },
        },
    },
    NORMSDIST: {
        description: 'Trả về hàm phân phối tích lũy chuẩn hóa',
        abstract: 'Trả về hàm phân phối tích lũy chuẩn hóa',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/office/normsdist-%E5%87%BD%E6%95%B0-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
        },
    },

    NORMSINV: {
        description: 'Trả về hàm nghịch đảo phân phối chuẩn chuẩn hóa',
        abstract: 'Trả về hàm nghịch đảo phân phối chuẩn chuẩn hóa',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/normsinv-%E5%87%BD%E6%95%B0-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Một xác suất tương ứng với phân bố chuẩn.' },
        },
    },
    PERCENTILE: {
        description: 'Trả về giá trị phân vị thứ k trong tập dữ liệu (bao gồm 0 và 1)',
        abstract: 'Trả về giá trị phân vị thứ k trong tập dữ liệu (bao gồm 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/percentile-%E5%87%BD%E6%95%B0-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi dữ liệu xác định vị trí tương đối.' },
            k: { name: 'k', detail: 'Giá trị phần trăm từ 0 đến 1 (bao gồm 0 và 1).' },
        },
    },
    PERCENTRANK: {
        description: 'Trả về thứ hạng phần trăm của các giá trị trong tập dữ liệu (bao gồm 0 và 1)',
        abstract: 'Trả về thứ hạng phần trăm của các giá trị trong tập dữ liệu (bao gồm 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/percentrank-%E5%87%BD%E6%95%B0-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hoặc phạm vi dữ liệu xác định vị trí tương đối.' },
            x: { name: 'x', detail: 'Giá trị mà bạn muốn biết thứ hạng của nó.' },
            significance: { name: 'chữ số có nghĩa', detail: 'Giá trị xác định số chữ số có nghĩa của giá trị phần trăm trả về. Nếu bỏ qua, hàm PERCENTRANK dùng ba chữ số (0.xxx).' },
        },
    },
    POISSON: {
        description: 'Trả về phân bố Poisson.',
        abstract: 'Trả về phân bố Poisson.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/poisson-%E5%87%BD%E6%95%B0-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            mean: { name: 'trung độ số', detail: 'Trung độ số học của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì POISSON trả về hàm phân bố lũy tích; nếu SAI, nó trả về hàm mật độ xác suất.' },
        },
    },
    QUARTILE: {
        description: 'Trả về các phần tư của tập dữ liệu (bao gồm 0 và 1)',
        abstract: 'Trả về các phần tư của tập dữ liệu (bao gồm 0 và 1)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/quartile-%E5%87%BD%E6%95%B0-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Một mảng hoặc phạm vi dữ liệu yêu cầu giá trị tứ phân vị.' },
            quart: { name: 'giá trị tứ phân', detail: 'Giá trị tứ phân vị cần trả về.' },
        },
    },
    RANK: {
        description: 'Trả về xếp hạng của một chuỗi số',
        abstract: 'Trả về xếp hạng của một chuỗi số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rank-%E5%87%BD%E6%95%B0-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn tìm thứ hạng của nó.' },
            ref: { name: 'danh sách các số', detail: 'Tham chiếu tới danh sách các số. Các giá trị không phải là số trong tham chiếu sẽ được bỏ qua.' },
            order: { name: 'xếp hạng số', detail: 'Một con số chỉ rõ cách xếp hạng số. 0 hoặc bị bỏ qua đối với thứ tự giảm dần, khác 0 đối với thứ tự tăng dần.' },
        },
    },
    STDEV: {
        description: 'Ước tính độ lệch chuẩn dựa trên mẫu. Độ lệch chuẩn đo lường phạm vi phân bố của các giá trị xung quanh giá trị trung bình (hay trung vị).',
        abstract: 'Ước tính độ lệch chuẩn dựa trên mẫu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/stdev-%E5%87%BD%E6%95%B0-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số số 1, tương ứng với giá trị mẫu đầu tiên.' },
            number2: { name: 'number2', detail: 'Tham số số 2, tương ứng với các giá trị mẫu từ 2 đến 255. Cũng có thể sử dụng mảng đơn hoặc tham chiếu đến mảng thay vì sử dụng các tham số được phân tách bằng dấu phẩy.' },
        },
    },
    STDEVP: {
        description: 'Tính độ lệch chuẩn của toàn bộ quần thể được cung cấp dưới dạng tham số.',
        abstract: 'Tính độ lệch chuẩn của toàn bộ quần thể được cung cấp dưới dạng tham số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/stdevp-%E5%87%BD%E6%95%B0-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số số 1, tương ứng với giá trị mẫu đầu tiên.' },
            number2: { name: 'number2', detail: 'Tham số số 2, tương ứng với các giá trị mẫu từ 2 đến 255. Cũng có thể sử dụng mảng đơn hoặc tham chiếu đến mảng thay vì sử dụng các tham số được phân tách bằng dấu phẩy.' },
        },
    },
    TDIST: {
        description: 'Trả về phân phối xác suất t-Student của Học sinh',
        abstract: 'Trả về phân phối xác suất t-Student của Học sinh',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/tdist-%E5%87%BD%E6%95%B0-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Cần tính giá trị số của phân bố.' },
            degFreedom: { name: 'bậc tự do', detail: 'Một số nguyên biểu thị số bậc tự do.' },
            tails: { name: 'đặc điểm đuôi', detail: 'Xác định số phần dư của phân bố được trả về. Nếu Tails = 1, hàm TDIST sẽ trả về phân bố một phía. Nếu Tails = 2, hàm TDIST sẽ trả về phân bố hai phía.' },
        },
    },
    TINV: {
        description: 'Trả về hàm nghịch đảo của phân bố xác suất t-Student của Học sinh (hai đuôi)',
        abstract: 'Trả về hàm nghịch đảo của phân bố xác suất t-Student của Học sinh (hai đuôi)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/tinv-%E5%87%BD%E6%95%B0-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Xác suất liên quan đến phân phối t-Student của Sinh viên.' },
            degFreedom: { name: 'bậc tự do', detail: 'Một số nguyên biểu thị số bậc tự do.' },
        },
    },
    TTEST: {
        description: 'Trả về xác suất kết hợp với Phép thử t-Student.',
        abstract: 'Trả về xác suất kết hợp với Phép thử t-Student.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ttest-%E5%87%BD%E6%95%B0-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Mảng thứ nhất của phạm vi dữ liệu.' },
            array2: { name: 'mảng 2', detail: 'Mảng thứ hai của phạm vi dữ liệu.' },
            tails: { name: 'đặc điểm đuôi', detail: 'Xác định số đuôi của phân phối. Nếu đuôi = 1, TTEST sử dụng phân phối một phía. Nếu đuôi = 2, TTEST sử dụng phân phối hai phía.' },
            type: { name: 'loại Phép thử', detail: 'Loại Phép thử t cần thực hiện.' },
        },
    },
    VAR: {
        description: 'Tính toán phương sai dựa trên mẫu cho tập dữ liệu cho trước.',
        abstract: 'Tính toán phương sai dựa trên mẫu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/var-%E5%87%BD%E6%95%B0-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số số 1, tương ứng với giá trị mẫu đầu tiên.' },
            number2: { name: 'number2', detail: 'Tham số số 2, tương ứng với các giá trị mẫu từ 2 đến 255.' },
        },
    },
    VARP: {
        description: 'Tính toán phương sai dựa trên toàn bộ quần thể cho tập dữ liệu cho trước.',
        abstract: 'Tính toán phương sai dựa trên toàn bộ quần thể',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/varp-%E5%87%BD%E6%95%B0-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Tham số số 1, tương ứng với giá trị mẫu đầu tiên.' },
            number2: { name: 'number2', detail: 'Tham số số 2, tương ứng với các giá trị mẫu từ 2 đến 255.' },
        },
    },
    WEIBULL: {
        description: 'Trả về phân bố Weibull.',
        abstract: 'Trả về phân bố Weibull.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/weibull-%E5%87%BD%E6%95%B0-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Giá trị mà bạn muốn có phân bố của nó.' },
            alpha: { name: 'alpha', detail: 'Tham số đầu tiên của phân phối.' },
            beta: { name: 'beta', detail: 'Tham số thứ hai của phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm WEIBULL trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    ZTEST: {
        description: 'Trả về giá trị xác suất một phía của kiểm tra z.',
        abstract: 'Trả về giá trị xác suất một phía của kiểm tra z.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ztest-%E5%87%BD%E6%95%B0-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Mảng hay khoảng dữ liệu để kiểm tra x.' },
            x: { name: 'x', detail: 'Giá trị cần kiểm tra.' },
            sigma: { name: 'Độ lệch chuẩn', detail: 'Độ lệch chuẩn tổng thể (đã biết). Nếu bỏ qua, độ lệch chuẩn mẫu sẽ được dùng.' },
        },
    },

};
