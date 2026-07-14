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
    ACCRINT: {
        description: 'Trả về lãi tích lũy của một trái phiếu trả lãi định kỳ',
        abstract: 'Trả về lãi tích lũy của một trái phiếu trả lãi định kỳ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/accrint-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/accrintm-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/amordegrc-function',
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
    AMORLINC: {
        description: 'Trả về giá trị khấu hao cho mỗi kỳ kế toán',
        abstract: 'Trả về giá trị khấu hao cho mỗi kỳ kế toán',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/amorlinc-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/coupdaybs-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/coupdays-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/coupdaysnc-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/coupncd-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/coupnum-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/couppcd-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cumipmt-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/cumprinc-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/db-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ddb-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/disc-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dollarde-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/dollarfr-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/duration-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'lãi suất danh nghĩa', detail: 'Lãi suất danh nghĩa.' },
            npery: { name: 'số kỳ', detail: 'Số kỳ ghép lãi trong năm.' },
        },
    },
    FV: {
        description: 'FV , một trong các hàm tài chính , tính toán giá trị tương lai của một khoản đầu tư dựa trên một mức lãi suất cố định. Bạn có thể sử dụng FV với các khoản thanh toán bằng nhau định kỳ, hoặc thanh toán một lần duy nhất.',
        abstract: 'FV , một trong các hàm tài chính , tính toán giá trị tương lai của một khoản đầu tư dựa trên một mức lãi suất cố định. Bạn có thể sử dụng FV với các khoản thanh toán bằng nhau định kỳ, hoặc thanh toán một lần duy nhất.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Yêu cầu. Lãi suất theo kỳ hạn.' },
            nper: { name: 'tổng số kỳ', detail: 'Yêu cầu. Tổng số kỳ hạn thanh toán trong một niên kim.' },
            pmt: { name: 'số tiền', detail: 'Yêu cầu. Khoản thanh toán cho mỗi kỳ; khoản này không đổi trong suốt vòng đời của niên kim. Thông thường, pmt có chứa tiền gốc và lãi, nhưng không chứa các khoản phí và thuế khác. Nếu pmt được bỏ qua, bạn phải đưa vào đối số pv.' },
            pv: { name: 'giá trị hiện tại', detail: 'Tùy chọn. Giá trị hiện tại, hoặc số tiền trả một lần hiện tại đáng giá ngang với một chuỗi các khoản thanh toán tương lai. Nếu bỏ qua đối số pv, thì nó được giả định là 0 (không) và bạn phải đưa vào đối số pmt.' },
            type: { name: 'loại', detail: 'Tùy chọn. Số 0 hoặc 1 chỉ rõ thời điểm thanh toán đến hạn. Nếu đối số kiểu bị bỏ qua, thì nó được giả định là 0.' },
        },
    },
    FVSCHEDULE: {
        description: 'Trả về giá trị tương lai của số tiền gốc ban đầu sau khi áp dụng một chuỗi các lãi suất kép. Dùng hàm FVSCHEDULE để tính toán giá trị tương lai của một khoản đầu tư với lãi suất biến đổi hoặc có thể điều chỉnh.',
        abstract: 'Trả về giá trị tương lai của số tiền gốc ban đầu sau khi áp dụng một chuỗi các lãi suất kép. Dùng hàm FVSCHEDULE để tính toán giá trị tương lai của một khoản đầu tư với lãi suất biến đổi hoặc có thể điều chỉnh.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'hiệu trưởng', detail: 'Yêu cầu. Giá trị hiện tại.' },
            schedule: { name: 'mảng lãi suất', detail: 'Yêu cầu. Một mảng gồm các lãi suất sẽ áp dụng.' },
        },
    },
    INTRATE: {
        description: 'Trả về lãi suất của một chứng khoán đã đầu tư toàn bộ.',
        abstract: 'Trả về lãi suất của một chứng khoán đã đầu tư toàn bộ.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'ngày thanh toán', detail: 'Yêu cầu. Ngày thanh toán chứng khoán. Ngày thanh toán chứng khoán là ngày sau ngày phát hành khi chứng khoán được bán cho người mua.' },
            maturity: { name: 'ngày đáo hạn', detail: 'Yêu cầu. Ngày đáo hạn của chứng khoán. Ngày đáo hạn là ngày mà chứng khoán hết hạn.' },
            investment: { name: 'số tiền đầu', detail: 'Yêu cầu. Số tiền đã đầu tư vào chứng khoán.' },
            redemption: { name: 'giá thanh lý', detail: 'Yêu cầu. Số tiền sẽ nhận được khi đáo hạn.' },
            basis: { name: 'điểm chuẩn', detail: 'Tùy chọn. Loại cơ sở đếm ngày sẽ dùng.' },
        },
    },
    IPMT: {
        description: 'Trả về lãi suất cho một kỳ xác định của một khoản đầu tư dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        abstract: 'Trả về lãi suất cho một kỳ xác định của một khoản đầu tư dựa trên các khoản thanh toán định kỳ và đều đặn và lãi suất không đổi',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ipmt-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'dòng tiền', detail: 'Tham chiếu đến một mảng hoặc ô chứa các số dùng để tính tỷ suất hoàn vốn nội bộ.\n1.Các giá trị phải chứa ít nhất một giá trị dương và một giá trị âm để tính tỷ suất hoàn vốn nội bộ được trả về.\n2.IRR sử dụng chuỗi giá trị để minh họa chuỗi dòng tiền. Đảm bảo nhập các giá trị chi phí và lợi ích theo thứ tự bạn yêu cầu.\n3.Nếu mảng hoặc tham chiếu chứa văn bản, giá trị logic hoặc ô trống thì các giá trị này sẽ bị bỏ qua.' },
            guess: { name: 'giá trị ước tính', detail: 'Ước tính tính toán IRR của hàm.' },
        },
    },
    ISPMT: {
        description: 'Tính tiền lãi đã trả (hoặc đã nhận) cho kỳ hạn đã xác định của khoản vay (hoặc khoản đầu tư) với các khoản thanh toán nợ gốc.',
        abstract: 'Tính tiền lãi đã trả (hoặc đã nhận) cho kỳ hạn đã xác định của khoản vay (hoặc khoản đầu tư) với các khoản thanh toán nợ gốc.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'lãi suất', detail: 'Bắt buộc. Lãi suất của khoản đầu tư.' },
            per: { name: 'kỳ', detail: 'Bắt buộc. Kỳ hạn mà bạn muốn tính lãi và phải nằm trong khoảng từ 1 đến Nper.' },
            nper: { name: 'tổng số kỳ', detail: 'Bắt buộc. Tổng số kỳ thanh toán của khoản đầu tư.' },
            pv: { name: 'giá trị hiện tại', detail: 'Bắt buộc. Giá trị hiện tại của khoản đầu tư. Đối với khoản vay, Pv là số tiền vay.' },
        },
    },
    MDURATION: {
        description: 'Trả về thời hạn đã sửa đổi của Macauley cho một chứng khoán có mệnh giá giả định là 100 đô la',
        abstract: 'Trả về thời hạn đã sửa đổi của Macauley cho một chứng khoán có mệnh giá giả định là 100 đô la',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mduration-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mirr-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/nominal-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/nper-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/npv-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/oddfprice-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/oddfyield-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/oddlprice-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/oddlyield-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/pduration-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/pmt-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ppmt-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/price-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/pricedisc-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/pricemat-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/pv-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rate-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/received-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rri-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/sln-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/syd-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/tbilleq-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/tbillprice-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/tbillyield-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/vdb-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/xirr-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/xnpv-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/yield-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/yielddisc-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/yieldmat-function',
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

export default locale;
