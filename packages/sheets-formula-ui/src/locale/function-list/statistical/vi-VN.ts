/**
 * Copyright 2023-present DreamNum Inc.
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
    AVEDEV: {
        description: 'Trả về giá trị trung bình của độ lệch tuyệt đối của các điểm dữ liệu từ giá trị trung bình của chúng.',
        abstract: 'Trả về giá trị trung bình của độ lệch tuyệt đối của các điểm dữ liệu từ giá trị trung bình của chúng.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/avedev-%E5%87%BD%E6%95%B0-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
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
                url: 'https://support.microsoft.com/vi-vn/office/average-%E5%87%BD%E6%95%B0-047bac88-d466-426c-a32b-8f33eb960cf6',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình.' },
            number2: { name: 'số 2', detail: 'Các số khác, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình, tối đa là 255.' },
        },
    },
    AVERAGEA: {
        description: 'Trả về giá trị trung bình của các tham số, bao gồm số, văn bản và giá trị logic.',
        abstract: 'Trả về giá trị trung bình của các tham số, bao gồm số, văn bản và giá trị logic.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/averagea-%E5%87%BD%E6%95%B0-f5f84098-d453-4f4c-bbba-3d2c66356091',
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
                url: 'https://support.microsoft.com/vi-vn/office/averageif-%E5%87%BD%E6%95%B0-faec8e2e-0dec-4308-af69-f5576d8ac642',
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
                url: 'https://support.microsoft.com/vi-vn/office/averageifs-%E5%87%BD%E6%95%B0-48910c45-1fc0-4389-a028-f7c5c3001690',
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
                url: 'https://support.microsoft.com/vi-vn/office/beta-dist-%E5%87%BD%E6%95%B0-11188c9c-780a-42c7-ba43-9ecb5a878d31',
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
                url: 'https://support.microsoft.com/vi-vn/office/beta-inv-%E5%87%BD%E6%95%B0-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
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
                url: 'https://support.microsoft.com/vi-vn/office/binom-dist-%E5%87%BD%E6%95%B0-c5ae37b6-f39c-4be2-94c2-509a1480770c',
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
                url: 'https://support.microsoft.com/vi-vn/office/binom-dist-range-%E5%87%BD%E6%95%B0-17331329-74c7-4053-bb4c-6653a7421595',
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
                url: 'https://support.microsoft.com/vi-vn/office/binom-inv-%E5%87%BD%E6%95%B0-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-dist-%E5%87%BD%E6%95%B0-8486b05e-5c05-4942-a9ea-f6b341518732',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-dist-rt-%E5%87%BD%E6%95%B0-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-inv-%E5%87%BD%E6%95%B0-400db556-62b3-472d-80b3-254723e7092f',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-inv-rt-%E5%87%BD%E6%95%B0-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-test-%E5%87%BD%E6%95%B0-2e8a7861-b14a-4985-aa93-fb88de3f260f',
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
                url: 'https://support.microsoft.com/vi-vn/office/confidence-norm-%E5%87%BD%E6%95%B0-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
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
                url: 'https://support.microsoft.com/vi-vn/office/confidence-t-%E5%87%BD%E6%95%B0-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
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
                url: 'https://support.microsoft.com/vi-vn/office/correl-%E5%87%BD%E6%95%B0-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
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
                url: 'https://support.microsoft.com/vi-vn/office/count-%E5%87%BD%E6%95%B0-a59cd7fc-b623-4d93-87a4-d23bf411294c',
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
                url: 'https://support.microsoft.com/vi-vn/office/counta-%E5%87%BD%E6%95%B0-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: {
                name: 'số 1',
                detail: 'Bắt buộc. Tham số đầu tiên đại diện cho giá trị mà bạn muốn đếm',
            },
            number2: {
                name: 'số 2',
                detail: 'Tùy chọn. Các đối số khác đại diện cho giá trị bạn muốn đếm, có thể chứa tối đa 255 đối số.',
            },
        },
    },
    COUNTBLANK: {
        description: 'để đếm số ô trống trong phạm vi ô.',
        abstract: 'để đếm số ô trống trong phạm vi ô.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/countblank-%E5%87%BD%E6%95%B0-6a92d772-675c-4bee-b346-24af6bd3ac22',
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
                url: 'https://support.microsoft.com/vi-vn/office/countif-%E5%87%BD%E6%95%B0-e0de10c6-f885-4e71-abb4-1f464816df34',
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
                url: 'https://support.microsoft.com/vi-vn/office/countifs-%E5%87%BD%E6%95%B0-dda3dc6e-f74e-4aee-88bc-aa8c2a866842',
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
                url: 'https://support.microsoft.com/vi-vn/office/covariance-p-%E5%87%BD%E6%95%B0-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc',
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
                url: 'https://support.microsoft.com/vi-vn/office/covariance-s-%E5%87%BD%E6%95%B0-0a539b74-7371-42aa-a18f-1f5320314977',
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
                url: 'https://support.microsoft.com/vi-vn/office/devsq-%E5%87%BD%E6%95%B0-8b739616-8376-4df5-8bd0-cfe0a6caf444',
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
                url: 'https://support.microsoft.com/vi-vn/office/expon-dist-%E5%87%BD%E6%95%B0-4c12ae24-e563-4155-bf3e-8b78b6ae140e',
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
                url: 'https://support.microsoft.com/vi-vn/office/f-dist-%E5%87%BD%E6%95%B0-a887efdc-7c8e-46cb-a74a-f884cd29b25d',
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
                url: 'https://support.microsoft.com/vi-vn/office/f-dist-rt-%E5%87%BD%E6%95%B0-d74cbb00-6017-4ac9-b7d7-6049badc0520',
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
                url: 'https://support.microsoft.com/vi-vn/office/f-inv-%E5%87%BD%E6%95%B0-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe',
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
                url: 'https://support.microsoft.com/vi-vn/office/f-inv-rt-%E5%87%BD%E6%95%B0-d371aa8f-b0b1-40ef-9cc2-496f0693ac00',
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
                url: 'https://support.microsoft.com/vi-vn/office/f-test-%E5%87%BD%E6%95%B0-100a59e7-4108-46f8-8443-78ffacb6c0a7',
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
                url: 'https://support.microsoft.com/vi-vn/office/fisher-%E5%87%BD%E6%95%B0-d656523c-5076-4f95-b87b-7741bf236c69',
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
                url: 'https://support.microsoft.com/vi-vn/office/fisherinv-%E5%87%BD%E6%95%B0-62504b39-415a-4284-a285-19c8e82f86bb',
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
                url: 'https://support.microsoft.com/vi-vn/office/forecast-%E5%92%8C-forecast-linear-%E5%87%BD%E6%95%B0-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Điểm dữ liệu mà bạn muốn dự đoán một giá trị cho nó.' },
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Trả về giá trị tương lai dựa trên giá trị hiện tại',
        abstract: 'Trả về giá trị tương lai dựa trên giá trị hiện tại',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/forecast-%E5%92%8C-forecast-linear-%E5%87%BD%E6%95%B0-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Điểm dữ liệu mà bạn muốn dự đoán một giá trị cho nó.' },
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    INTERCEPT: {
        description: 'Trả về điểm chặn của đường hồi quy tuyến tính',
        abstract: 'Trả về điểm chặn của đường hồi quy tuyến tính',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/intercept-%E5%87%BD%E6%95%B0-2a9b74e2-9d47-4772-b663-3bca70bf63ef',
            },
        ],
        functionParameter: {
            knownYs: { name: 'mảng _y', detail: 'Mảng phụ thuộc của mảng hoặc phạm vi dữ liệu.' },
            knownXs: { name: 'mảng _x', detail: 'Mảng độc lập của mảng hoặc phạm vi dữ liệu.' },
        },
    },
    MAX: {
        description: 'Trả về giá trị lớn nhất trong tập giá trị.',
        abstract: 'Trả về giá trị lớn nhất trong tập giá trị.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/max-%E5%87%BD%E6%95%B0-e0012414-9ac8-4b34-9a47-73e662c08098',
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
                url: 'https://support.microsoft.com/vi-vn/office/maxa-%E5%87%BD%E6%95%B0-814bda1e-3840-4bff-9365-2f59ac2ee62d',
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
                url: 'https://support.microsoft.com/vi-vn/office/maxifs-%E5%87%BD%E6%95%B0-dfd611e6-da2c-488a-919b-9b6376b28883',
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
    MIN: {
        description: 'Trả về số nhỏ nhất trong tập giá trị.',
        abstract: 'Trả về số nhỏ nhất trong tập giá trị.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/min-%E5%87%BD%E6%95%B0-61635d12-920f-4ce2-a70f-96f202dcc152',
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
                url: 'https://support.microsoft.com/vi-vn/office/mina-%E5%87%BD%E6%95%B0-245a6f46-7ca5-4dc7-ab49-805341bc31d3',
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
                url: 'https://support.microsoft.com/vi-vn/office/minifs-%E5%87%BD%E6%95%B0-6ca1ddaa-079b-4e74-80cc-72eef32e6599',
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
    NORM_DIST: {
        description: 'Trả về hàm phân phối tích lũy chuẩn',
        abstract: 'Trả về hàm phân phối tích lũy chuẩn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/norm-dist-%E5%87%BD%E6%95%B0-edb1cc14-a21c-4e53-839d-8082074c9f8d',
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
                url: 'https://support.microsoft.com/vi-vn/office/norm-inv-%E5%87%BD%E6%95%B0-54b30935-fee7-493c-bedb-2278a9db7e13',
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
                url: 'https://support.microsoft.com/vi-vn/office/norm-s-dist-%E5%87%BD%E6%95%B0-1e787282-3832-4520-a9ae-bd2a8d99ba88',
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
                url: 'https://support.microsoft.com/vi-vn/office/norm-s-inv-%E5%87%BD%E6%95%B0-d6d556b4-ab7f-49cd-b526-5a20918452b1',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Một xác suất tương ứng với phân bố chuẩn.' },
        },
    },
    RANK_AVG: {
        description: 'Trả về thứ hạng của một số trong một danh sách các số',
        abstract: 'Trả về thứ hạng của một số trong một danh sách các số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rank-avg-%E5%87%BD%E6%95%B0-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a',
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
                url: 'https://support.microsoft.com/vi-vn/office/rank-eq-%E5%87%BD%E6%95%B0-284858ce-8ef6-450e-b662-26245be04a40',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Số mà bạn muốn tìm thứ hạng của nó.' },
            ref: { name: 'danh sách các số', detail: 'Tham chiếu tới danh sách các số. Các giá trị không phải là số trong tham chiếu sẽ được bỏ qua.' },
            order: { name: 'xếp hạng số', detail: 'Một con số chỉ rõ cách xếp hạng số. 0 hoặc bị bỏ qua đối với thứ tự giảm dần, khác 0 đối với thứ tự tăng dần.' },
        },
    },
    STDEV_P: {
        description: 'Tính toán độ lệch chuẩn dựa trên toàn bộ tổng thể được cung cấp ở dạng đối số (bỏ qua giá trị lô-gic và văn bản).',
        abstract: 'Tính độ lệch chuẩn dựa trên toàn bộ quần thể mẫu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/stdev-p-%E5%87%BD%E6%95%B0-6e917c05-31a0-496f-ade7-4f4e7462f285',
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
                url: 'https://support.microsoft.com/vi-vn/office/stdev-s-%E5%87%BD%E6%95%B0-7d69cf97-0c1f-4acf-be27-f3e83904cc23',
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
                url: 'https://support.microsoft.com/vi-vn/office/stdeva-%E5%87%BD%E6%95%B0-5ff38888-7ea5-48de-9a6d-11ed73b29e9d',
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
                url: 'https://support.microsoft.com/vi-vn/office/stdevpa-%E5%87%BD%E6%95%B0-5578d4d6-455a-4308-9991-d405afe2c28c',
            },
        ],
        functionParameter: {
            value1: { name: 'giá trị 1', detail: 'Đối số dạng số đầu tiên tương ứng với tổng thể.' },
            value2: { name: 'giá trị 2', detail: 'Đối số dạng số từ 2 đến 254 tương ứng với tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
        },
    },
    VAR_P: {
        description: 'Tính toán phương sai dựa trên toàn bộ tập hợp (bỏ các giá trị lô-gic và văn bản trong tập hợp).',
        abstract: 'Tính toán phương sai dựa trên toàn bộ tập hợp',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/var-p-%E5%87%BD%E6%95%B0-73d1285c-108c-4843-ba5d-a51f90656f3a',
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
                url: 'https://support.microsoft.com/vi-vn/office/var-s-%E5%87%BD%E6%95%B0-913633de-136b-449d-813e-65a00b2b990b',
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
                url: 'https://support.microsoft.com/vi-vn/office/vara-%E5%87%BD%E6%95%B0-3de77469-fa3a-47b4-85fd-81758a1e1d07',
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
                url: 'https://support.microsoft.com/vi-vn/office/varpa-%E5%87%BD%E6%95%B0-59a62635-4e89-4fad-88ac-ce4dc0513b96',
            },
        ],
        functionParameter: {
            value1: { name: 'giá trị 1', detail: 'Đối số dạng số đầu tiên tương ứng với tổng thể.' },
            value2: { name: 'giá trị 2', detail: 'Là các đối số dạng số từ 2 đến 254 tương ứng với một tập hợp.' },
        },
    },
};
