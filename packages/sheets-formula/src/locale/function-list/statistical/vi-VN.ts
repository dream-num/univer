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
                url: 'https://support.microsoft.com/vi-vn/office/beta-inv-%E5%87%BD%E6%95%B0-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
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
                url: 'https://support.microsoft.com/vi-vn/office/binom-dist-%E5%87%BD%E6%95%B0-c5ae37b6-f39c-4be2-94c2-509a1480770c',
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
                url: 'https://support.microsoft.com/vi-vn/office/binom-dist-range-%E5%87%BD%E6%95%B0-17331329-74c7-4053-bb4c-6653a7421595',
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
                url: 'https://support.microsoft.com/vi-vn/office/binom-inv-%E5%87%BD%E6%95%B0-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-dist-%E5%87%BD%E6%95%B0-8486b05e-5c05-4942-a9ea-f6b341518732',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-dist-rt-%E5%87%BD%E6%95%B0-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-inv-%E5%87%BD%E6%95%B0-400db556-62b3-472d-80b3-254723e7092f',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-inv-rt-%E5%87%BD%E6%95%B0-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
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
                url: 'https://support.microsoft.com/vi-vn/office/chisq-test-%E5%87%BD%E6%95%B0-2e8a7861-b14a-4985-aa93-fb88de3f260f',
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
                url: 'https://support.microsoft.com/vi-vn/office/confidence-norm-%E5%87%BD%E6%95%B0-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
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
                url: 'https://support.microsoft.com/vi-vn/office/confidence-t-%E5%87%BD%E6%95%B0-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
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
                url: 'https://support.microsoft.com/vi-vn/office/correl-%E5%87%BD%E6%95%B0-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
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
