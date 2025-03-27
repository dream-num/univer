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
    ACCRINT: {
        description: 'Trả về lãi tích lũy của một trái phiếu trả lãi định kỳ',
        abstract: 'Trả về lãi tích lũy của một trái phiếu trả lãi định kỳ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/accrint-%E5%87%BD%E6%95%B0-fe45d089-6722-4fb3-9379-e1f911d8dc74',
            },
        ],
        functionParameter: {
            issue: { name: 'ngày phát hành', detail: 'Ngày phát hành chứng khoán.' },
            firstInterest: { name: 'ngày tính lãi đầu tiên', detail: 'Ngày tính lãi đầu tiên của chứng khoán.' },
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất phiếu lãi hàng năm của chứng khoán.' },
            par: { name: 'mệnh giá', detail: 'Mệnh giá của chứng khoán.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Loại cơ sở đếm ngày sẽ dùng.' },
            calcMethod: { name: 'phương pháp tính toán', detail: 'Là một giá trị logic: tiền lãi tích lũy từ ngày phát hành = TRUE hoặc bị bỏ qua; được tính từ ngày thanh toán phiếu lãi cuối cùng = FALSE.' },
        },
    },
    ACCRINTM: {
        description: 'Trả về lãi tích lũy của một trái phiếu trả lãi khi đáo hạn',
        abstract: 'Trả về lãi tích lũy của một trái phiếu trả lãi khi đáo hạn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/accrintm-%E5%87%BD%E6%95%B0-f62f01f9-5754-4cc4-805b-0e70199328a7',
            },
        ],
        functionParameter: {
            issue: { name: 'ngày phát hành', detail: 'Ngày phát hành chứng khoán.' },
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất phiếu lãi hàng năm của chứng khoán.' },
            par: { name: 'mệnh giá', detail: 'Mệnh giá của chứng khoán.' },
            basis: { name: 'điểm chuẩn', detail: 'Loại cơ sở đếm ngày sẽ dùng.' },
        },
    },
    AMORDEGRC: {
        description: 'Trả về giá trị khấu hao cho mỗi kỳ kế toán sử dụng hệ số khấu hao',
        abstract: 'Trả về giá trị khấu hao cho mỗi kỳ kế toán sử dụng hệ số khấu hao',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/amordegrc-%E5%87%BD%E6%95%B0-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AMORLINC: {
        description: 'Trả về giá trị khấu hao cho mỗi kỳ kế toán',
        abstract: 'Trả về giá trị khấu hao cho mỗi kỳ kế toán',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/amorlinc-%E5%87%BD%E6%95%B0-7d417b45-f7f5-4dba-a0a5-3451a81079a8',
            },
        ],
        functionParameter: {
            cost: { name: 'trị giá', detail: 'Chi phí của tài sản.' },
            datePurchased: { name: 'ngày mua', detail: 'Ngày mua tài sản.' },
            firstPeriod: { name: 'kỳ đầu tiên', detail: 'Ngày kết thúc của kỳ thứ nhất.' },
            salvage: { name: 'giá trị còn lại', detail: 'Giá trị thu hồi khi kết thúc vòng đời của tài sản.' },
            period: { name: 'kỳ', detail: 'Kỳ.' },
            rate: { name: 'tỷ lệ khấu hao', detail: 'Tỷ lệ khấu hao.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    COUPDAYBS: {
        description: 'Trả về số ngày từ đầu kỳ trả lãi đến ngày thanh toán',
        abstract: 'Trả về số ngày từ đầu kỳ trả lãi đến ngày thanh toán',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/coupdaybs-%E5%87%BD%E6%95%B0-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    COUPDAYS: {
        description: 'Trả về số ngày trong kỳ trả lãi bao gồm ngày thanh toán',
        abstract: 'Trả về số ngày trong kỳ trả lãi bao gồm ngày thanh toán',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/coupdays-%E5%87%BD%E6%95%B0-cc64380b-315b-4e7b-950c-b30b0a76f671',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    COUPDAYSNC: {
        description: 'Trả về số ngày từ ngày thanh toán đến ngày trả lãi tiếp theo',
        abstract: 'Trả về số ngày từ ngày thanh toán đến ngày trả lãi tiếp theo',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/coupdaysnc-%E5%87%BD%E6%95%B0-5ab3f0b2-029f-4a8b-bb65-47d525eea547',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    COUPNCD: {
        description: 'Trả về ngày trả lãi tiếp theo sau ngày thanh toán',
        abstract: 'Trả về ngày trả lãi tiếp theo sau ngày thanh toán',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/coupncd-%E5%87%BD%E6%95%B0-fd962fef-506b-4d9d-8590-16df5393691f',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    COUPNUM: {
        description: 'Trả về số lượng lãi có thể trả giữa ngày thanh toán và ngày đáo hạn',
        abstract: 'Trả về số lượng lãi có thể trả giữa ngày thanh toán và ngày đáo hạn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/coupnum-%E5%87%BD%E6%95%B0-a90af57b-de53-4969-9c99-dd6139db2522',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    COUPPCD: {
        description: 'Trả về ngày trả lãi trước đó trước ngày thanh toán',
        abstract: 'Trả về ngày trả lãi trước đó trước ngày thanh toán',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/couppcd-%E5%87%BD%E6%95%B0-2eb50473-6ee9-4052-a206-77a9a385d5b3',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    CUMIPMT: {
        description: 'Trả về lãi tích lũy trả giữa hai kỳ thanh toán',
        abstract: 'Trả về lãi tích lũy trả giữa hai kỳ thanh toán',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cumipmt-%E5%87%BD%E6%95%B0-61067bb0-9016-427d-b95b-1a752af0e606',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất.' },
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
            startPeriod: { name: 'kỳ đầu tiên', detail: 'Kỳ đầu tiên trong tính toán này. Các kỳ thanh toán được đánh số bắt đầu từ 1.' },
            endPeriod: { name: 'kỳ cuối cùng', detail: 'Kỳ cuối cùng trong tính toán này.' },
            type: { name: 'loại', detail: 'Thời hạn thanh toán.' },
        },
    },
    CUMPRINC: {
        description: 'Trả về lãi tích lũy cho khoản vay giữa hai kỳ thanh toán',
        abstract: 'Trả về lãi tích lũy cho khoản vay giữa hai kỳ thanh toán',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/cumprinc-%E5%87%BD%E6%95%B0-fcda5a29-0e85-406b-b7b0-4306ac693e72',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất.' },
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
            startPeriod: { name: 'kỳ đầu tiên', detail: 'Kỳ đầu tiên trong tính toán này. Các kỳ thanh toán được đánh số bắt đầu từ 1.' },
            endPeriod: { name: 'kỳ cuối cùng', detail: 'Kỳ cuối cùng trong tính toán này.' },
            type: { name: 'loại', detail: 'Thời hạn thanh toán.' },
        },
    },
    DB: {
        description: 'Trả về giá trị khấu hao của tài sản cho một kỳ được xác định sử dụng phương pháp khấu hao số dư giảm dần cố định',
        abstract: 'Trả về giá trị khấu hao của tài sản cho một kỳ được xác định sử dụng phương pháp khấu hao số dư giảm dần cố định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/db-%E5%87%BD%E6%95%B0-2067732b-d7f3-482a-b732-3edb72811830',
            },
        ],
        functionParameter: {
            cost: { name: 'trị giá', detail: 'Chi phí của tài sản.' },
            salvage: { name: 'giá trị còn lại', detail: 'Giá trị khi kết thúc khấu hao (đôi khi được gọi là giá trị thu hồi của tài sản).' },
            life: { name: 'tuổi thọ sử dụng', detail: 'Số thời gian khấu hao của một tài sản (đôi khi còn được gọi là thời gian sử dụng hữu ích của tài sản).' },
            period: { name: 'kỳ', detail: 'Khoảng thời gian mà bạn muốn tính khấu hao.' },
            month: { name: 'tháng', detail: 'Số tháng trong năm đầu tiên. Nếu tháng bị bỏ qua, giá trị của nó được giả định là 12.' },
        },
    },
    DDB: {
        description: 'Trả về giá trị khấu hao của tài sản cho một kỳ được xác định sử dụng phương pháp khấu hao số dư giảm dần kép',
        abstract: 'Trả về giá trị khấu hao của tài sản cho một kỳ được xác định sử dụng phương pháp khấu hao số dư giảm dần kép',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ddb-%E5%87%BD%E6%95%B0-4f40f492-79ab-4a7a-b7b5-08d08d1f861e',
            },
        ],
        functionParameter: {
            cost: { name: 'trị giá', detail: 'Chi phí của tài sản.' },
            salvage: { name: 'giá trị còn lại', detail: 'Giá trị khi kết thúc khấu hao (đôi khi được gọi là giá trị thu hồi của tài sản).' },
            life: { name: 'tuổi thọ sử dụng', detail: 'Số thời gian khấu hao của một tài sản (đôi khi còn được gọi là thời gian sử dụng hữu ích của tài sản).' },
            period: { name: 'kỳ', detail: 'Khoảng thời gian mà bạn muốn tính khấu hao.' },
            factor: { name: 'nhân tố', detail: 'Tỷ lệ suy giảm số dư. Nếu bỏ qua yếu tố ảnh hưởng thì giả định là 2 (phương pháp số dư giảm dần kép).' },
        },
    },
    DISC: {
        description: 'Trả về tỷ lệ chiết khấu của một trái phiếu',
        abstract: 'Trả về tỷ lệ chiết khấu của một trái phiếu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/disc-%E5%87%BD%E6%95%B0-c6d9b13b-2551-4b22-b6ca-3bb2ab8a4177',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            pr: { name: 'giá', detail: 'Giá của một chứng khoán có thể bán được trên thị trường.' },
            redemption: { name: 'giá thanh lý', detail: 'Giá trị thanh lý của chứng khoán có mệnh giá 100' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    DOLLARDE: {
        description: 'Trả về giá trị thập phân của một số lượng tiền dưới dạng số nguyên và phân số',
        abstract: 'Trả về giá trị thập phân của một số lượng tiền dưới dạng số nguyên và phân số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/dollarde-%E5%87%BD%E6%95%B0-34b88814-bda8-4bb1-92fc-e3c2fda9b897',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'phân số', detail: 'Một số được biểu thị dưới dạng phần nguyên và phần phân số, cách nhau bằng dấu thập phân.' },
            fraction: { name: 'mẫu số', detail: 'Số nguyên dùng làm mẫu số của một phân số.' },
        },
    },
    DOLLARFR: {
        description: 'Trả về giá trị phân số của một số lượng tiền dưới dạng số nguyên và phân số',
        abstract: 'Trả về giá trị phân số của một số lượng tiền dưới dạng số nguyên và phân số',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/dollarfr-%E5%87%BD%E6%95%B0-d964f8f1-c216-4e63-8b7d-15ec61515a8e',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'số thập phân', detail: 'số thập phân.' },
            fraction: { name: 'mẫu số', detail: 'Số nguyên dùng làm mẫu số của một phân số.' },
        },
    },
    DURATION: {
        description: 'Trả về thời gian của một trái phiếu trả lãi định kỳ',
        abstract: 'Trả về thời gian của một trái phiếu trả lãi định kỳ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/duration-%E5%87%BD%E6%95%B0-7c5ae5c5-e22a-4c6e-bfc5-43c7b41f1974',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            coupon: { name: 'lãi suất coupon hàng năm.', detail: 'Lãi suất coupon hàng năm của một chứng khoán.' },
            yld: { name: 'tỷ suất lợi nhuận hàng năm.', detail: 'Tỷ suất lợi nhuận hàng năm của một chứng khoán có thể bán được.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    EFFECT: {
        description: 'Trả về lãi suất hiệu quả hàng năm',
        abstract: 'Trả về lãi suất hiệu quả hàng năm',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/effect-%E5%87%BD%E6%95%B0-6a44539a-378e-4c42-9041-29b1d9d189a9',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'lãi suất danh nghĩa', detail: 'Lãi suất danh nghĩa.' },
            npery: { name: 'số kỳ', detail: 'Số kỳ ghép lãi trong năm.' },
        },
    },
    FV: {
        description: 'Trả về giá trị tương lai của một khoản đầu tư dựa trên lãi suất không đổi',
        abstract: 'Trả về giá trị tương lai của một khoản đầu tư dựa trên lãi suất không đổi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/fv-%E5%87%BD%E6%95%B0-3517001d-d592-4af2-ab7d-b0a13a34a5ff',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất.' },
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pmt: { name: 'số tiền', detail: 'Số tiền phải trả trong mỗi kỳ không thay đổi trong suốt thời hạn niên kim.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
            type: { name: 'loại', detail: 'Số 0 hoặc 1, dùng để xác định thời điểm thanh toán của mỗi kỳ là đầu hay cuối kỳ.' },
        },
    },
    FVSCHEDULE: {
        description: 'Trả về giá trị tương lai của một khoản gốc ban đầu sau khi áp dụng một chuỗi các lãi suất phức',
        abstract: 'Trả về giá trị tương lai của một khoản gốc ban đầu sau khi áp dụng một chuỗi các lãi suất phức',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/fvschedule-%E5%87%BD%E6%95%B0-e04bfa3a-4a37-430e-a132-4aafcacf2cd7',
            },
        ],
        functionParameter: {
            principal: { name: 'hiệu trưởng', detail: 'giá trị hiện tại.' },
            schedule: { name: 'mảng lãi suất', detail: 'Mảng lãi suất áp dụng.' },
        },
    },
    INTRATE: {
        description: 'Trả về lãi suất cho một khoản đầu tư hoàn toàn',
        abstract: 'Trả về lãi suất cho một khoản đầu tư hoàn toàn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/intrate-%E5%87%BD%E6%95%B0-9d01bd51-7f48-41c5-b0d2-47d10409b27f',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            investment: { name: 'số tiền đầu', detail: 'Số tiền đầu tư vào chứng khoán có thể bán được.' },
            redemption: { name: 'giá thanh lý', detail: 'Giá trị trao đổi của chứng khoán khi đáo hạn.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    IPMT: {
        description: 'Trả về lãi suất cho một kỳ xác định của một khoản đầu tư dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        abstract: 'Trả về lãi suất cho một kỳ xác định của một khoản đầu tư dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ipmt-%E5%87%BD%E6%95%B0-5c44f1d6-7dc0-4f1b-86ec-409cda192b15',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất theo từng thời kỳ.' },
            per: { name: 'kỳ', detail: 'Số kỳ dùng để tính số tiền lãi phải nằm trong khoảng từ 1 đến nper.' },
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
            fv: { name: 'số dư tiền mặt', detail: 'Giá trị tương lai hoặc số dư tiền mặt mong muốn sau khi thực hiện khoản thanh toán cuối cùng.' },
            type: { name: 'loại', detail: 'Số 0 hoặc 1, dùng để xác định thời điểm thanh toán của mỗi kỳ là đầu hay cuối kỳ.' },
        },
    },
    IRR: {
        description: 'Trả về tỷ lệ hoàn vốn nội bộ cho một loạt các dòng tiền',
        abstract: 'Trả về tỷ lệ hoàn vốn nội bộ cho một loạt các dòng tiền',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/irr-%E5%87%BD%E6%95%B0-649f8b21-3c9e-4e79-b7e7-df88b1ef7d5a',
            },
        ],
        functionParameter: {
            values: { name: 'dòng tiền', detail: 'Tham chiếu đến một mảng hoặc ô chứa các số dùng để tính tỷ suất hoàn vốn nội bộ.\n1.Các giá trị phải chứa ít nhất một giá trị dương và một giá trị âm để tính tỷ suất hoàn vốn nội bộ được trả về.\n2.IRR sử dụng chuỗi giá trị để minh họa chuỗi dòng tiền. Đảm bảo nhập các giá trị chi phí và lợi ích theo thứ tự bạn yêu cầu.\n3.Nếu mảng hoặc tham chiếu chứa văn bản, giá trị logic hoặc ô trống thì các giá trị này sẽ bị bỏ qua.' },
            guess: { name: 'giá trị ước tính', detail: 'Ước tính tính toán IRR của hàm.' },
        },
    },
    ISPMT: {
        description: 'Trả về số tiền lãi trả trong một kỳ đã xác định của một khoản đầu tư dựa trên lãi suất không đổi',
        abstract: 'Trả về số tiền lãi trả trong một kỳ đã xác định của một khoản đầu tư dựa trên lãi suất không đổi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ispmt-%E5%87%BD%E6%95%B0-84a33b93-01c4-4149-b7a4-dbd9c3c6b1e3',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất theo từng thời kỳ.' },
            per: { name: 'kỳ', detail: 'Số kỳ dùng để tính số tiền lãi phải nằm trong khoảng từ 1 đến nper.' },
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
        },
    },
    MDURATION: {
        description: 'Trả về thời hạn đã sửa đổi của Macauley cho một chứng khoán có mệnh giá giả định là 100 đô la',
        abstract: 'Trả về thời hạn đã sửa đổi của Macauley cho một chứng khoán có mệnh giá giả định là 100 đô la',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mduration-%E5%87%BD%E6%95%B0-7c5ae5c5-e22a-4c6e-bfc5-43c7b41f1974',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            coupon: { name: 'lãi suất coupon hàng năm.', detail: 'Lãi suất coupon hàng năm của một chứng khoán.' },
            yld: { name: 'tỷ suất lợi nhuận hàng năm.', detail: 'Tỷ suất lợi nhuận hàng năm của một chứng khoán có thể bán được.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu lãi hàng năm.' },
            basis: { name: 'điểm chuẩn', detail: 'Cơ sở năm được dùng.' },
        },
    },
    MIRR: {
        description: 'Trả về tỷ lệ hoàn vốn nội bộ điều chỉnh cho các dòng tiền định kỳ, có tính đến chi phí đầu tư và lãi suất của khoản đầu tư',
        abstract: 'Trả về tỷ lệ hoàn vốn nội bộ điều chỉnh cho các dòng tiền định kỳ, có tính đến chi phí đầu tư và lãi suất của khoản đầu tư',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/mirr-%E5%87%BD%E6%95%B0-687e9c9e-8d77-4c5f-927f-2db18fc07e11',
            },
        ],
        functionParameter: {
            values: { name: 'dòng tiền', detail: 'Một mảng hoặc tham chiếu đến một ô chứa số. Các giá trị này đại diện cho một loạt chi phí định kỳ (giá trị âm) và lợi ích (giá trị dương).\n1.Các giá trị phải chứa ít nhất một giá trị dương và một giá trị âm để tính tỷ suất hoàn vốn nội bộ được sửa đổi. Ngược lại, MIRR trả về #DIV/0! .\n2.Tuy nhiên, nếu mảng hoặc tham số tham chiếu chứa văn bản, giá trị logic hoặc ô trống thì các giá trị đó sẽ bị bỏ qua; tuy nhiên, các ô chứa giá trị 0 sẽ được tính.' },
            financeRate: { name: 'Lãi suất tài trợ', detail: 'Lãi suất trả cho các khoản tiền được sử dụng trong dòng tiền.' },
            reinvestRate: { name: 'tỷ suất sinh lợi tái đầu tư', detail: 'Tỷ suất lợi nhuận của dòng tiền tái đầu tư.' },
        },
    },
    NOMINAL: {
        description: 'Trả về lãi suất danh nghĩa hàng năm',
        abstract: 'Trả về lãi suất danh nghĩa hàng năm',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/nominal-%E5%87%BD%E6%95%B0-2f197f05-054d-41ef-8549-0f6fb4c497fa',
            },
        ],
        functionParameter: {
            effectRate: { name: 'lãi suất thực', detail: 'lãi suất thực.' },
            npery: { name: 'số kỳ', detail: 'Số kỳ ghép lãi trong năm.' },
        },
    },
    NPER: {
        description: 'Trả về số kỳ hạn cho một khoản đầu tư dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        abstract: 'Trả về số kỳ hạn cho một khoản đầu tư dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/nper-%E5%87%BD%E6%95%B0-0e013941-c680-4d8f-9560-89fda87bc92b',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất theo từng thời kỳ.' },
            pmt: { name: 'số tiền', detail: 'Số tiền phải trả trong mỗi kỳ không thay đổi trong suốt thời hạn niên kim.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
            fv: { name: 'số dư tiền mặt', detail: 'Giá trị tương lai hoặc số dư tiền mặt mong muốn sau khi thực hiện khoản thanh toán cuối cùng.' },
            type: { name: 'loại', detail: 'Số 0 hoặc 1, dùng để xác định thời điểm thanh toán của mỗi kỳ là đầu hay cuối kỳ.' },
        },
    },
    NPV: {
        description: 'Trả về giá trị hiện tại ròng của một khoản đầu tư dựa trên một loạt các dòng tiền và tỷ lệ chiết khấu',
        abstract: 'Trả về giá trị hiện tại ròng của một khoản đầu tư dựa trên một loạt các dòng tiền và tỷ lệ chiết khấu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/npv-%E5%87%BD%E6%95%B0-3f9ecada-b772-44d8-9b46-4d7ae0d6a156',
            },
        ],
        functionParameter: {
            rate: { name: 'tỷ lệ chiết khấu', detail: 'Tỷ lệ chiết khấu trong một thời gian nhất định.' },
            value1: { name: 'dòng tiền 1', detail: 'Đây là các tham số từ 1 đến 254 thể hiện chi phí và thu nhập.' },
            value2: { name: 'dòng tiền 2', detail: 'Đây là các tham số từ 1 đến 254 thể hiện chi phí và thu nhập.' },
        },
    },
    ODDFPRICE: {
        description: 'Trả về giá của một trái phiếu có kỳ đầu ngắn hoặc dài',
        abstract: 'Trả về giá của một trái phiếu có kỳ đầu ngắn hoặc dài',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/oddfprice-%E5%87%BD%E6%95%B0-8e1dc9c8-8c7e-48cd-bcf7-39b8a1a54c6f',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            issue: { name: 'ngày phát hành', detail: 'Ngày phát hành chứng khoán.' },
            firstCoupon: { name: 'ngày phiếu lãi đầu tiên', detail: 'Ngày phát hành phiếu giảm giá đầu tiên của chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất chứng khoán.' },
            yld: { name: 'lợi suất hàng năm', detail: 'Lợi suất hàng năm của chứng khoán.' },
            redemption: { name: 'giá trị chuộc lại', detail: 'Giá trị hoàn lại của chứng khoán trên mỗi mệnh giá 100 đô la.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu giảm giá mỗi năm. Đối với các khoản thanh toán hàng năm, tần suất = 1; đối với các khoản thanh toán nửa năm, tần suất = 2; đối với các khoản thanh toán hàng quý, tần suất = 4.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    ODDFYIELD: {
        description: 'Trả về lãi suất của một trái phiếu có kỳ đầu ngắn hoặc dài',
        abstract: 'Trả về lãi suất của một trái phiếu có kỳ đầu ngắn hoặc dài',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/oddfyield-%E5%87%BD%E6%95%B0-97f0d152-3814-40f0-8c6a-e0cb5800e58c',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            issue: { name: 'ngày phát hành', detail: 'Ngày phát hành chứng khoán.' },
            firstCoupon: { name: 'ngày phiếu lãi đầu tiên', detail: 'Ngày phát hành phiếu giảm giá đầu tiên của chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất chứng khoán.' },
            pr: { name: 'giá của', detail: 'Giá của chứng khoán.' },
            redemption: { name: 'giá trị chuộc lại', detail: 'Giá trị hoàn lại của chứng khoán trên mỗi mệnh giá 100 đô la.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu giảm giá mỗi năm. Đối với các khoản thanh toán hàng năm, tần suất = 1; đối với các khoản thanh toán nửa năm, tần suất = 2; đối với các khoản thanh toán hàng quý, tần suất = 4.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    ODDLPRICE: {
        description: 'Trả về giá của một trái phiếu có kỳ cuối ngắn hoặc dài',
        abstract: 'Trả về giá của một trái phiếu có kỳ cuối ngắn hoặc dài',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/oddlprice-%E5%87%BD%E6%95%B0-f0b3b76a-8e65-4b4d-8f6d-d493891a8d62',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            lastInterest: { name: 'ngày thanh toán lãi cuối', detail: 'Ngày thanh toán lãi cuối cùng của chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất chứng khoán.' },
            yld: { name: 'lợi suất hàng năm', detail: 'Lợi suất hàng năm của chứng khoán.' },
            redemption: { name: 'giá trị chuộc lại', detail: 'Giá trị hoàn lại của chứng khoán trên mỗi mệnh giá 100 đô la.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu giảm giá mỗi năm. Đối với các khoản thanh toán hàng năm, tần suất = 1; đối với các khoản thanh toán nửa năm, tần suất = 2; đối với các khoản thanh toán hàng quý, tần suất = 4.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    ODDLYIELD: {
        description: 'Trả về lãi suất của một trái phiếu có kỳ cuối ngắn hoặc dài',
        abstract: 'Trả về lãi suất của một trái phiếu có kỳ cuối ngắn hoặc dài',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/oddlyield-%E5%87%BD%E6%95%B0-f1a101ed-f4f4-42e4-ae71-372dd6713d94',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            lastInterest: { name: 'ngày thanh toán lãi cuối', detail: 'Ngày thanh toán lãi cuối cùng của chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất chứng khoán.' },
            pr: { name: 'giá của', detail: 'Giá của chứng khoán.' },
            redemption: { name: 'giá trị chuộc lại', detail: 'Giá trị hoàn lại của chứng khoán trên mỗi mệnh giá 100 đô la.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu giảm giá mỗi năm. Đối với các khoản thanh toán hàng năm, tần suất = 1; đối với các khoản thanh toán nửa năm, tần suất = 2; đối với các khoản thanh toán hàng quý, tần suất = 4.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    PDURATION: {
        description: 'Trả về số kỳ hạn cần thiết để một khoản đầu tư đạt đến giá trị đã xác định.',
        abstract: 'Trả về số kỳ hạn cần thiết để một khoản đầu tư đạt đến giá trị đã xác định.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/pduration-%E5%87%BD%E6%95%B0-44f33460-5be5-4c90-b857-22308892adaf',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'lãi suất của mỗi kỳ hạn.' },
            pv: { name: 'giá trị hiện tại', detail: 'giá trị hiện tại của khoản đầu tư.' },
            fv: { name: 'giá trị tương lai', detail: 'giá trị tương lai được kỳ vọng của khoản đầu tư.' },
        },
    },
    PMT: {
        description: 'Trả về khoản thanh toán cho một khoản vay dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        abstract: 'Trả về khoản thanh toán cho một khoản vay dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/pmt-%E5%87%BD%E6%95%B0-0214da64-9d6e-4bcc-8567-92b403e0a164',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất theo từng thời kỳ.' },
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
            fv: { name: 'số dư tiền mặt', detail: 'Giá trị tương lai hoặc số dư tiền mặt mong muốn sau khi thực hiện khoản thanh toán cuối cùng.' },
            type: { name: 'loại', detail: 'Số 0 hoặc 1, dùng để xác định thời điểm thanh toán của mỗi kỳ là đầu hay cuối kỳ.' },
        },
    },
    PPMT: {
        description: 'Trả về phần thanh toán gốc cho một kỳ đã xác định của một khoản đầu tư dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        abstract: 'Trả về phần thanh toán gốc cho một kỳ đã xác định của một khoản đầu tư dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/ppmt-%E5%87%BD%E6%95%B0-3d37d3e1-0b04-4734-bb2d-15b9b76dbb18',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất theo từng thời kỳ.' },
            per: { name: 'kỳ', detail: 'Số kỳ dùng để tính số tiền lãi phải nằm trong khoảng từ 1 đến nper.' },
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
            fv: { name: 'số dư tiền mặt', detail: 'Giá trị tương lai hoặc số dư tiền mặt mong muốn sau khi thực hiện khoản thanh toán cuối cùng.' },
            type: { name: 'loại', detail: 'Số 0 hoặc 1, dùng để xác định thời điểm thanh toán của mỗi kỳ là đầu hay cuối kỳ.' },
        },
    },
    PRICE: {
        description: 'Trả về giá trên mỗi $100 mệnh giá của một trái phiếu trả lãi định kỳ',
        abstract: 'Trả về giá trên mỗi $100 mệnh giá của một trái phiếu trả lãi định kỳ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/price-%E5%87%BD%E6%95%B0-82b8176e-4817-4a76-b68f-7f83f1b3378b',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất chứng khoán.' },
            yld: { name: 'lợi suất hàng năm', detail: 'Lợi suất hàng năm của chứng khoán.' },
            redemption: { name: 'giá trị chuộc lại', detail: 'Giá trị hoàn lại của chứng khoán trên mỗi mệnh giá 100 đô la.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu giảm giá mỗi năm. Đối với các khoản thanh toán hàng năm, tần suất = 1; đối với các khoản thanh toán nửa năm, tần suất = 2; đối với các khoản thanh toán hàng quý, tần suất = 4.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    PRICEDISC: {
        description: 'Trả về giá trên mỗi $100 mệnh giá của một trái phiếu chiết khấu',
        abstract: 'Trả về giá trên mỗi $100 mệnh giá của một trái phiếu chiết khấu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/pricedisc-%E5%87%BD%E6%95%B0-3369e2ea-9a16-49f1-85bb-41e42b02d6e5',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            discount: { name: 'lãi suất chiết', detail: 'Lãi suất chiết khấu đối với chứng khoán.' },
            redemption: { name: 'giá trị chuộc lại', detail: 'Giá trị hoàn lại của chứng khoán trên mỗi mệnh giá 100 đô la.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    PRICEMAT: {
        description: 'Trả về giá trên mỗi $100 mệnh giá của một trái phiếu trả lãi khi đáo hạn',
        abstract: 'Trả về giá trên mỗi $100 mệnh giá của một trái phiếu trả lãi khi đáo hạn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/pricemat-%E5%87%BD%E6%95%B0-7f8e5d67-3124-4b8b-a1aa-8ae189e9345b',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            issue: { name: 'ngày phát hành', detail: 'Ngày phát hành chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất chứng khoán.' },
            yld: { name: 'lợi suất hàng năm', detail: 'Lợi suất hàng năm của chứng khoán.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    PV: {
        description: 'Trả về giá trị hiện tại của một khoản đầu tư dựa trên lãi suất không đổi',
        abstract: 'Trả về giá trị hiện tại của một khoản đầu tư dựa trên lãi suất không đổi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/pv-%E5%87%BD%E6%95%B0-28334a0e-2a78-433a-ab9c-9e441eb38e6e',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Lãi suất theo từng thời kỳ.' },
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pmt: { name: 'số tiền', detail: 'Số tiền phải trả trong mỗi kỳ không thay đổi trong suốt thời hạn niên kim.' },
            fv: { name: 'số dư tiền mặt', detail: 'Giá trị tương lai hoặc số dư tiền mặt mong muốn sau khi thực hiện khoản thanh toán cuối cùng.' },
            type: { name: 'loại', detail: 'Số 0 hoặc 1, dùng để xác định thời điểm thanh toán của mỗi kỳ là đầu hay cuối kỳ.' },
        },
    },
    RATE: {
        description: 'Trả về lãi suất mỗi kỳ của một khoản đầu tư',
        abstract: 'Trả về lãi suất mỗi kỳ của một khoản đầu tư',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rate-%E5%87%BD%E6%95%B0-fc8413b8-b76e-4022-b9d7-36d17d15d51b',
            },
        ],
        functionParameter: {
            nper: { name: 'tổng số kỳ', detail: 'Tổng số kỳ thanh toán.' },
            pmt: { name: 'số tiền', detail: 'Số tiền phải trả trong mỗi kỳ không thay đổi trong suốt thời hạn niên kim.' },
            pv: { name: 'giá trị hiện tại', detail: 'Giá trị hiện tại.' },
            fv: { name: 'số dư tiền mặt', detail: 'Giá trị tương lai hoặc số dư tiền mặt mong muốn sau khi thực hiện khoản thanh toán cuối cùng.' },
            type: { name: 'loại', detail: 'Số 0 hoặc 1, dùng để xác định thời điểm thanh toán của mỗi kỳ là đầu hay cuối kỳ.' },
            guess: { name: 'giá trị đoán', detail: 'lãi suất kỳ vọng.' },
        },
    },
    RECEIVED: {
        description: 'Trả về số tiền nhận được vào ngày đáo hạn cho một chứng khoán hoàn toàn đầu tư',
        abstract: 'Trả về số tiền nhận được vào ngày đáo hạn cho một chứng khoán hoàn toàn đầu tư',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/received-%E5%87%BD%E6%95%B0-ea351090-829e-451b-bb56-bf8d3ef27a5d',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            investment: { name: 'số tiền đầu tư', detail: 'Số tiền đầu tư vào chứng khoán có thể bán được.' },
            discount: { name: 'lãi suất chiết', detail: 'Lãi suất chiết khấu đối với chứng khoán.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    RRI: {
        description: 'Trả về một lãi suất tương đương cho sự tăng trưởng của một khoản đầu tư.',
        abstract: 'Trả về một lãi suất tương đương cho sự tăng trưởng của một khoản đầu tư.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/rri-%E5%87%BD%E6%95%B0-6f5822d8-7ef1-4233-944c-79e8172930f4',
            },
        ],
        functionParameter: {
            nper: { name: 'số kỳ hạn của khoản đầu tư.', detail: 'Nper là số kỳ hạn của khoản đầu tư.' },
            pv: { name: 'giá trị hiện tại', detail: 'Pv là giá trị hiện tại của khoản đầu tư.' },
            fv: { name: 'giá trị tương lai', detail: 'Fv là giá trị tương lai của khoản đầu tư.' },
        },
    },
    SLN: {
        description: 'Trả về khấu hao theo phương pháp đường thẳng của một tài sản cho một kỳ đã xác định',
        abstract: 'Trả về khấu hao theo phương pháp đường thẳng của một tài sản cho một kỳ đã xác định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/sln-%E5%87%BD%E6%95%B0-ae2bbdc0-4e48-4101-83b1-3e78bfa3084e',
            },
        ],
        functionParameter: {
            cost: { name: 'giá trị ban đầu của tài sản', detail: 'Giá trị ban đầu của tài sản.' },
            salvage: { name: 'giá trị còn lại của tài sản', detail: 'Giá trị khi kết thúc khấu hao (đôi khi được gọi là giá trị thu hồi của tài sản).' },
            life: { name: 'thời gian sử dụng tài sản', detail: 'Số thời gian khấu hao của một tài sản (đôi khi còn được gọi là thời gian sử dụng hữu ích của tài sản).' },
        },
    },
    SYD: {
        description: 'Trả về khấu hao theo phương pháp tổng các số dư của một tài sản cho một kỳ đã xác định',
        abstract: 'Trả về khấu hao theo phương pháp tổng các số dư của một tài sản cho một kỳ đã xác định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/syd-%E5%87%BD%E6%95%B0-c276a91d-8f1d-45b2-b07d-8d2707e969d0',
            },
        ],
        functionParameter: {
            cost: { name: 'giá trị ban đầu của tài sản', detail: 'Giá trị ban đầu của tài sản.' },
            salvage: { name: 'giá trị còn lại của tài sản', detail: 'Giá trị khi kết thúc khấu hao (đôi khi được gọi là giá trị thu hồi của tài sản).' },
            life: { name: 'thời gian sử dụng tài sản', detail: 'Số thời gian khấu hao của một tài sản (đôi khi còn được gọi là thời gian sử dụng hữu ích của tài sản).' },
            per: { name: 'thời kỳ', detail: 'Chu kỳ và phải sử dụng cùng đơn vị với cuộc sống.' },
        },
    },
    TBILLEQ: {
        description: 'Trả về lãi suất tương đương của một chứng khoán kho bạc',
        abstract: 'Trả về lãi suất tương đương của một chứng khoán kho bạc',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/tbilleq-%E5%87%BD%E6%95%B0-8e9eb7a4-1dbe-4d4a-a932-84aeba2b9c72',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán trái phiếu kho bạc.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của trái phiếu kho bạc.' },
            discount: { name: 'lãi suất chiết', detail: 'Lãi suất chiết khấu của trái phiếu kho bạc.' },
        },
    },
    TBILLPRICE: {
        description: 'Trả về giá của một chứng khoán kho bạc',
        abstract: 'Trả về giá của một chứng khoán kho bạc',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/tbillprice-%E5%87%BD%E6%95%B0-30f495e2-b69f-4f67-8372-9cfc9bfc1b3d',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán trái phiếu kho bạc.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của trái phiếu kho bạc.' },
            discount: { name: 'lãi suất chiết', detail: 'Lãi suất chiết khấu của trái phiếu kho bạc.' },
        },
    },
    TBILLYIELD: {
        description: 'Trả về lãi suất của một chứng khoán kho bạc',
        abstract: 'Trả về lãi suất của một chứng khoán kho bạc',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/tbillyield-%E5%87%BD%E6%95%B0-4a9b30c3-ff25-4114-8e37-86c605208f99',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán trái phiếu kho bạc.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của trái phiếu kho bạc.' },
            pr: { name: 'giá', detail: 'Giá trái phiếu kho bạc tính theo mệnh giá 100 đô la.' },
        },
    },
    VDB: {
        description: 'Trả về khấu hao của một tài sản cho một kỳ đã xác định bằng cách sử dụng phương pháp số dư giảm dần kép hoặc bất kỳ phương pháp nào mà bạn xác định',
        abstract: 'Trả về khấu hao của một tài sản cho một kỳ đã xác định bằng cách sử dụng phương pháp số dư giảm dần kép hoặc bất kỳ phương pháp nào mà bạn xác định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/vdb-%E5%87%BD%E6%95%B0-0ba3b999-b7e7-4b48-8a96-7c47640a7d28',
            },
        ],
        functionParameter: {
            cost: { name: 'trị giá', detail: 'Chi phí của tài sản.' },
            salvage: { name: 'giá trị còn lại', detail: 'Giá trị khi kết thúc khấu hao (đôi khi được gọi là giá trị thu hồi của tài sản).' },
            life: { name: 'tuổi thọ sử dụng', detail: 'Số thời gian khấu hao của một tài sản (đôi khi còn được gọi là thời gian sử dụng hữu ích của tài sản).' },
            startPeriod: { name: 'kỳ đầu tiên', detail: 'Kỳ đầu tiên mà bạn muốn tính khấu hao.' },
            endPeriod: { name: 'kỳ kết thúc', detail: 'Kỳ kết thúc mà bạn muốn tính khấu hao.' },
            factor: { name: 'nhân tố', detail: 'Tỷ lệ suy giảm số dư. Nếu bỏ qua yếu tố ảnh hưởng thì giả định là 2 (phương pháp số dư giảm dần kép).' },
            noSwitch: { name: 'không chuyển đổi', detail: 'Giá trị logic chỉ định liệu có nên chuyển sang khấu hao theo đường thẳng hay không khi mức khấu hao lớn hơn phép tính số dư giảm dần.' },
        },
    },
    XIRR: {
        description: 'Trả về tỷ lệ hoàn vốn nội bộ cho một loạt các dòng tiền đã xác định',
        abstract: 'Trả về tỷ lệ hoàn vốn nội bộ cho một loạt các dòng tiền đã xác định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/xirr-%E5%87%BD%E6%95%B0-f5a995a9-d4a4-4d82-8b9e-1bbad6677a3b',
            },
        ],
        functionParameter: {
            values: { name: 'dòng tiền', detail: 'Một chuỗi các dòng tiền tương ứng với thời điểm thanh toán theo ngày. Khoản trả trước là tùy chọn và liên quan đến chi phí hoặc khoản thanh toán khi bắt đầu đầu tư. Nếu giá trị đầu tiên là chi phí hoặc khoản thanh toán thì giá trị đó phải âm. Tất cả các khoản thanh toán tiếp theo được chiết khấu trên cơ sở 365 ngày/năm. Chuỗi giá trị phải chứa ít nhất một giá trị dương và một giá trị âm.' },
            dates: { name: 'bảng ngày tháng', detail: 'Lịch trình ngày thanh toán tương ứng với các khoản thanh toán dòng tiền. Ngày tháng có thể xuất hiện theo bất kỳ thứ tự nào.' },
            guess: { name: 'giá trị ước tính', detail: 'Ước tính kết quả của phép tính hàm XIRR.' },
        },
    },
    XNPV: {
        description: 'Trả về giá trị hiện tại ròng của một khoản đầu tư cho một loạt các dòng tiền không đều',
        abstract: 'Trả về giá trị hiện tại ròng của một khoản đầu tư cho một loạt các dòng tiền không đều',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/xnpv-%E5%87%BD%E6%95%B0-fb947d21-98a2-4a59-9f39-88323c2c7087',
            },
        ],
        functionParameter: {
            rate: { name: 'tỷ lệ chiết khấu', detail: 'Tỷ lệ chiết khấu áp dụng cho dòng tiền.' },
            values: { name: 'dòng tiền', detail: 'Một chuỗi các dòng tiền tương ứng với thời điểm thanh toán theo ngày. Khoản trả trước là tùy chọn và liên quan đến chi phí hoặc khoản thanh toán khi bắt đầu đầu tư. Nếu giá trị đầu tiên là chi phí hoặc khoản thanh toán thì giá trị đó phải âm. Tất cả các khoản thanh toán tiếp theo được chiết khấu trên cơ sở 365 ngày/năm. Chuỗi giá trị phải chứa ít nhất một giá trị dương và một giá trị âm.' },
            dates: { name: 'bảng ngày tháng', detail: 'Lịch trình ngày thanh toán tương ứng với các khoản thanh toán dòng tiền. Ngày tháng có thể xuất hiện theo bất kỳ thứ tự nào.' },
        },
    },
    YIELD: {
        description: 'Trả về lãi suất trên mỗi $100 mệnh giá của một trái phiếu trả lãi định kỳ',
        abstract: 'Trả về lãi suất trên mỗi $100 mệnh giá của một trái phiếu trả lãi định kỳ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/yield-%E5%87%BD%E6%95%B0-809cabff-6db1-4a56-99db-f9540465b3c7',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất chứng khoán.' },
            pr: { name: 'giá', detail: 'Giá chứng khoán tính theo mệnh giá 100 đô la.' },
            redemption: { name: 'giá trị chuộc lại', detail: 'Giá trị hoàn lại của chứng khoán trên mỗi mệnh giá 100 đô la.' },
            frequency: { name: 'tần số', detail: 'Số lần thanh toán phiếu giảm giá mỗi năm. Đối với các khoản thanh toán hàng năm, tần suất = 1; đối với các khoản thanh toán nửa năm, tần suất = 2; đối với các khoản thanh toán hàng quý, tần suất = 4.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    YIELDDISC: {
        description: 'Trả về lãi suất hàng năm của một trái phiếu chiết khấu',
        abstract: 'Trả về lãi suất hàng năm của một trái phiếu chiết khấu',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/yielddisc-%E5%87%BD%E6%95%B0-0d1fd9d0-7623-4f0a-bc24-fcfafa7b7e9f',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            pr: { name: 'giá', detail: 'Giá chứng khoán tính theo mệnh giá 100 đô la.' },
            redemption: { name: 'giá trị chuộc lại', detail: 'Giá trị hoàn lại của chứng khoán trên mỗi mệnh giá 100 đô la.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
    YIELDMAT: {
        description: 'Trả về lãi suất hàng năm của một trái phiếu trả lãi khi đáo hạn',
        abstract: 'Trả về lãi suất hàng năm của một trái phiếu trả lãi khi đáo hạn',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/yieldmat-%E5%87%BD%E6%95%B0-0b05b481-7a08-4e65-b38d-c8d4d57f03a8',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Ngày thanh toán chứng khoán.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Ngày đáo hạn của chứng khoán.' },
            issue: { name: 'ngày phát hành', detail: 'Ngày phát hành chứng khoán.' },
            rate: { name: 'lãi suất', detail: 'Lãi suất chứng khoán.' },
            pr: { name: 'giá', detail: 'Giá chứng khoán tính theo mệnh giá 100 đô la.' },
            basis: { name: 'cơ sở', detail: 'Loại cơ sở tính ngày cần sử dụng.' },
        },
    },
};
