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
                url: 'https://support.microsoft.com/zh-cn/office/avedev-%E5%87%BD%E6%95%B0-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
            },
        ],
        functionParameter: {
            number1: { name: 'Số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình.' },
            number2: { name: 'Số 2', detail: 'Các số khác, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình, tối đa là 255.' },
        },
    },
    AVERAGE: {
        description: 'Trả về giá trị trung bình (trung bình cộng) của các tham số.',
        abstract: 'Trả về giá trị trung bình của các tham số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/average-%E5%87%BD%E6%95%B0-047bac88-d466-426c-a32b-8f33eb960cf6',
            },
        ],
        functionParameter: {
            number1: { name: 'Số 1', detail: 'Số đầu tiên, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình.' },
            number2: { name: 'Số 2', detail: 'Các số khác, tham chiếu ô hoặc phạm vi cần tính giá trị trung bình, tối đa là 255.' },
        },
    },
    AVERAGEA: {
        description: 'Trả về giá trị trung bình của các tham số, bao gồm số, văn bản và giá trị logic.',
        abstract: 'Trả về giá trị trung bình của các tham số, bao gồm số, văn bản và giá trị logic.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/averagea-%E5%87%BD%E6%95%B0-f5f84098-d453-4f4c-bbba-3d2c66356091',
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
                url: 'https://support.microsoft.com/zh-cn/office/averageif-%E5%87%BD%E6%95%B0-faec8e2e-0dec-4308-af69-f5576d8ac642',
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
                url: 'https://support.microsoft.com/zh-cn/office/averageifs-%E5%87%BD%E6%95%B0-48910c45-1fc0-4389-a028-f7c5c3001690',
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
                url: 'https://support.microsoft.com/zh-cn/office/beta-dist-%E5%87%BD%E6%95%B0-11188c9c-780a-42c7-ba43-9ecb5a878d31',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    BETA_INV: {
        description: 'Trả về hàm nghịch đảo của phân phối tích lũy beta cụ thể',
        abstract: 'Trả về hàm nghịch đảo của phân phối tích lũy beta cụ thể',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/beta-inv-%E5%87%BD%E6%95%B0-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    BINOM_DIST: {
        description: 'Trả về xác suất phân phối nhị thức đơn nguyên',
        abstract: 'Trả về xác suất phân phối nhị thức đơn nguyên',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/binom-dist-%E5%87%BD%E6%95%B0-c5ae37b6-f39c-4be2-94c2-509a1480770c',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Trả về xác suất kết quả thử nghiệm sử dụng phân phối nhị thức',
        abstract: 'Trả về xác suất kết quả thử nghiệm sử dụng phân phối nhị thức',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/binom-dist-range-%E5%87%BD%E6%95%B0-17331329-74c7-4053-bb4c-6653a7421595',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    BINOM_INV: {
        description: 'Trả về giá trị nhỏ nhất để phân phối nhị thức tích lũy nhỏ hơn hoặc bằng ngưỡng quyết định',
        abstract: 'Trả về giá trị nhỏ nhất để phân phối nhị thức tích lũy nhỏ hơn hoặc bằng ngưỡng quyết định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/binom-inv-%E5%87%BD%E6%95%B0-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    CHISQ_DIST: {
        description: 'Trả về hàm mật độ xác suất tích lũy beta',
        abstract: 'Trả về hàm mật độ xác suất tích lũy beta',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-dist-%E5%87%BD%E6%95%B0-8486b05e-5c05-4942-a9ea-f6b341518732',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Trả về xác suất đuôi đơn của phân phối χ2',
        abstract: 'Trả về xác suất đuôi đơn của phân phối χ2',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-dist-rt-%E5%87%BD%E6%95%B0-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    CHISQ_INV: {
        description: 'Trả về hàm mật độ xác suất tích lũy beta',
        abstract: 'Trả về hàm mật độ xác suất tích lũy beta',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-inv-%E5%87%BD%E6%95%B0-400db556-62b3-472d-80b3-254723e7092f',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Trả về hàm nghịch đảo xác suất đuôi của phân phối χ2',
        abstract: 'Trả về hàm nghịch đảo xác suất đuôi của phân phối χ2',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-inv-rt-%E5%87%BD%E6%95%B0-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    CHISQ_TEST: {
        description: 'Trả về giá trị kiểm độc lập',
        abstract: 'Trả về giá trị kiểm độc lập',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/chisq-test-%E5%87%BD%E6%95%B0-2e8a7861-b14a-4985-aa93-fb88de3f260f',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Trả về khoảng tin cậy của giá trị trung bình tổng thể',
        abstract: 'Trả về khoảng tin cậy của giá trị trung bình tổng thể',
        links: [
            {
                title: 'Dạy học',
                url: 'https://support.microsoft.com/zh-cn/office/confidence-norm-%E5%87%BD%E6%95%B0-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONFIDENCE_T: {
        description: 'Trả về khoảng tin cậy cho giá trị trung bình của tổng thể (sử dụng phân phối t-student)',
        abstract: 'Trả về khoảng tin cậy cho giá trị trung bình của tổng thể (sử dụng phân phối t-student)',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/confidence-t-%E5%87%BD%E6%95%B0-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    CORREL: {
        description: 'Trả về hệ số tương quan giữa hai tập dữ liệu',
        abstract: 'Trả về hệ số tương quan giữa hai tập dữ liệu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/correl-%E5%87%BD%E6%95%B0-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
            },
        ],
        functionParameter: {
            number1: { name: 'số thứ nhất', detail: '' },
            number2: { name: 'số thứ hai', detail: '' },
        },
    },
    COUNT: {
        description: 'Đếm số lượng ô chứa số và số lượng trong danh sách đối số.',
        abstract: 'Đếm số lượng trong danh sách đối số.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/count-%E5%87%BD%E6%95%B0-a59cd7fc-b623-4d93-87a4-d23bf411294c',
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
                url: 'https://support.microsoft.com/zh-cn/office/counta-%E5%87%BD%E6%95%B0-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: {
                name: 'Số 1',
                detail: 'Bắt buộc. Tham số đầu tiên đại diện cho giá trị mà bạn muốn đếm',
            },
            number2: {
                name: 'Số 2',
                detail: 'Tùy chọn. Các đối số khác đại diện cho giá trị bạn muốn đếm, có thể chứa tối đa 255 đối số.',
            },
        },
    },

};

