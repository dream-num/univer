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
    DATE: {
        description: 'Kết hợp ba giá trị riêng biệt thành một ngày.',
        abstract: 'Trả về số sê-ri của ngày cụ thể',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/date-%E5%87%BD%E6%95%B0-e36c0c8c-4104-49da-ab83-82328b832349',
            },
        ],
        functionParameter: {
            year: {
                name: 'Năm',
                detail: 'có thể chứa từ 1 đến 4 chữ số. Excel giải thích tham số year dựa trên hệ thống ngày được máy tính sử dụng. Theo mặc định, Univer sử dụng hệ thống ngày 1900, nghĩa là ngày đầu tiên là ngày 1 tháng 1 năm 1900.',
            },
            month: {
                name: 'Tháng',
                detail: 'một số nguyên dương hoặc số nguyên âm, đại diện cho các tháng từ tháng 1 đến tháng 12 trong một năm.',
            },
            day: {
                name: 'Ngày',
                detail: 'một số nguyên dương hoặc số nguyên âm, đại diện cho các ngày từ ngày 1 đến ngày 31 trong một tháng.',
            },
        },
    },
    DATEDIF: {
        description: 'Tính số ngày, tháng hoặc năm giữa hai ngày. Hàm này rất hữu ích trong các công thức tính tuổi.',
        abstract: 'Tính số ngày, tháng hoặc năm giữa hai ngày. Hàm này rất hữu ích trong các công thức tính tuổi.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/datedif-%E5%87%BD%E6%95%B0-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    DATEVALUE: {
        description: 'Chuyển đổi ngày ở dạng văn bản thành số sê-ri.',
        abstract: 'Chuyển đổi ngày ở dạng văn bản thành số sê-ri',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/datevalue-%E5%87%BD%E6%95%B0-df8b07d4-7761-4a93-bc33-b7471bbff252',
            },
        ],
        functionParameter: {
            dateText: {
                name: 'Văn bản ngày',
                detail: 'đại diện cho ngày ở định dạng Excel, hoặc tham chiếu đến ô chứa văn bản đại diện cho ngày ở định dạng Excel. Ví dụ, "1/30/2008" hoặc "30-Jan-2008" là văn bản trong dấu ngoặc kép đại diện cho ngày.\nSử dụng hệ thống ngày mặc định của Microsoft Excel for Windows, tham số date_text phải đại diện cho ngày từ 1 tháng 1 năm 1900 đến 31 tháng 12 năm 9999. Hàm DATEVALUE sẽ trả về lỗi #VALUE! nếu giá trị của tham số date_text nằm ngoài phạm vi này.\nNếu bỏ qua phần năm trong tham số date_text, hàm DATEVALUE sẽ sử dụng năm hiện tại của đồng hồ tích hợp của máy tính. Thông tin thời gian trong tham số date_text sẽ bị bỏ qua.',
            },
        },
    },
    DAY: {
        description: 'Trả về ngày của một ngày cụ thể được biểu diễn bằng số sê-ri. Ngày là một số nguyên từ 1 đến 31.',
        abstract: 'Chuyển đổi số sê-ri thành ngày của tháng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/day-%E5%87%BD%E6%95%B0-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
            },
        ],
        functionParameter: {
            serialNumber: {
                name: 'Số sê-ri ngày',
                detail: 'Ngày cần tìm. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
        },
    },
    DAYS: {
        description: 'Trả về số ngày giữa hai ngày',
        abstract: 'Trả về số ngày giữa hai ngày',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/days-%E5%87%BD%E6%95%B0-57740535-d549-4395-8728-0f07bff0b9df',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    DAYS360: {
        description: 'Tính số ngày giữa hai ngày dựa trên năm 360 ngày',
        abstract: 'Tính số ngày giữa hai ngày dựa trên năm 360 ngày',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/days360-%E5%87%BD%E6%95%B0-b9a509fd-49ef-407e-94df-0cbda5718c2a',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    EDATE: {
        description: 'Trả về số sê-ri đại diện cho ngày cách một số tháng chỉ định trước hoặc sau một ngày cụ thể (start_date). Sử dụng hàm EDATE để tính ngày đến hạn hoặc ngày hết hạn.',
        abstract: 'Trả về số sê-ri của ngày cách start_date một số tháng chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/edate-%E5%87%BD%E6%95%B0-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
            },
        ],
        functionParameter: {
            startDate: {
                name: 'Ngày bắt đầu',
                detail: 'Ngày đại diện cho ngày bắt đầu. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
            months: {
                name: 'Số tháng',
                detail: 'Số tháng trước hoặc sau start_date. Giá trị dương sẽ trả về ngày trong tương lai; giá trị âm sẽ trả về ngày trong quá khứ.',
            },
        },
    },
    EOMONTH: {
        description: 'Trả về số sê-ri của ngày cuối cùng của tháng trước hoặc sau một số tháng chỉ định',
        abstract: 'Trả về số sê-ri của ngày cuối cùng của tháng trước hoặc sau một số tháng chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/eomonth-%E5%87%BD%E6%95%B0-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    HOUR: {
        description: 'Chuyển đổi số sê-ri thành giờ',
        abstract: 'Chuyển đổi số sê-ri thành giờ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/hour-%E5%87%BD%E6%95%B0-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    MINUTE: {
        description: 'Chuyển đổi số sê-ri thành phút',
        abstract: 'Chuyển đổi số sê-ri thành phút',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/minute-%E5%87%BD%E6%95%B0-9a3db35c-256c-45da-86bf-d82cde6d4fcb',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    MONTH: {
        description: 'Trả về tháng của một ngày cụ thể được biểu diễn bằng số sê-ri. Tháng là một số nguyên từ 1 (tháng 1) đến 12 (tháng 12).',
        abstract: 'Chuyển đổi số sê-ri thành tháng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/month-%E5%87%BD%E6%95%B0-0df62f6e-672d-4c78-9a70-a764de937b5e',
            },
        ],
        functionParameter: {
            serialNumber: {
                name: 'Số sê-ri ngày',
                detail: 'Ngày cần tìm. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
        },
    },
    NETWORKDAYS: {
        description: 'Trả về số ngày làm việc giữa hai ngày. Ngày làm việc loại trừ cuối tuần và bất kỳ ngày nào được xác định là ngày nghỉ.',
        abstract: 'Trả về số ngày làm việc giữa hai ngày',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/networkdays-%E5%87%BD%E6%95%B0-c48cafe0-1b60-4dd7-afac-81521ff6f53b',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    SECOND: {
        description: 'Chuyển đổi số sê-ri thành giây',
        abstract: 'Chuyển đổi số sê-ri thành giây',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/second-%E5%87%BD%E6%95%B0-44921a95-0b32-4f8b-8317-82ef1d22bb84',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    TIME: {
        description: 'Trả về số thập phân của một thời gian cụ thể. Nếu định dạng ô là General trước khi nhập hàm, kết quả sẽ được định dạng dưới dạng ngày tháng.',
        abstract: 'Trả về số thập phân của một thời gian cụ thể',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/time-%E5%87%BD%E6%95%B0-3607e6cc-0f46-4c3b-8357-40fe314d7b3c',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    TIMEVALUE: {
        description: 'Chuyển đổi một thời gian ở dạng văn bản thành số thập phân đại diện cho thời gian đó trong Excel.',
        abstract: 'Chuyển đổi một thời gian ở dạng văn bản thành số thập phân đại diện cho thời gian đó trong Excel',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/timevalue-%E5%87%BD%E6%95%B0-d7c29d57-399f-4a11-a7d8-379e01c7130d',
            },
        ],
        functionParameter: {
            timeText: {
                name: 'Văn bản thời gian',
                detail: 'Chuỗi văn bản đại diện cho một thời gian trong định dạng thời gian Excel, ví dụ, "6:45 PM" và "18:45" là văn bản chuỗi trong dấu ngoặc kép đại diện cho thời gian.',
            },
        },
    },
    TODAY: {
        description: 'Trả về ngày hiện tại. Hàm này rất hữu ích khi cần sử dụng ngày hiện tại trong các công thức hoặc để tính toán khoảng thời gian liên quan đến ngày hiện tại.',
        abstract: 'Trả về ngày hiện tại',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/today-%E5%87%BD%E6%95%B0-49540925-3611-41c5-90e3-f1b6e8e5f029',
            },
        ],
        functionParameter: {},
    },
    WEEKDAY: {
        description: 'Chuyển đổi số sê-ri thành ngày trong tuần',
        abstract: 'Chuyển đổi số sê-ri thành ngày trong tuần',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/weekday-%E5%87%BD%E6%95%B0-f3651330-3a06-4892-9d89-12cc7dadaabd',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    WEEKNUM: {
        description: 'Trả về số tuần của một ngày cụ thể trong một năm',
        abstract: 'Trả về số tuần của một ngày cụ thể trong một năm',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/weeknum-%E5%87%BD%E6%95%B0-2fdd388d-8f4d-4208-95de-8f2ad40187af',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'đầu tiên',
            },
            number2: {
                name: 'number2',
                detail: 'thứ hai',
            },
        },
    },
    WORKDAY: {
        description: 'Trả về số sê-ri của ngày trước hoặc sau một số ngày làm việc đã chỉ định. Ngày làm việc không bao gồm ngày cuối tuần và bất kỳ ngày nào được xác định là ngày nghỉ.',
        abstract: 'Trả về số sê-ri của ngày trước hoặc sau một số ngày làm việc đã chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/workday-%E5%87%BD%E6%95%B0-5570eab1-e9e5-49d0-9650-efda88d7d0b8',
            },
        ],
        functionParameter: {
            startDate: {
                name: 'Ngày bắt đầu',
                detail: 'Ngày đại diện cho ngày bắt đầu. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
            days: {
                name: 'Số ngày',
                detail: 'Số ngày làm việc trước hoặc sau start_date. Giá trị dương sẽ trả về ngày trong tương lai; giá trị âm sẽ trả về ngày trong quá khứ.',
            },
            holidays: {
                name: 'Ngày nghỉ',
                detail: 'Danh sách tùy chọn một hoặc nhiều ngày làm việc cần loại trừ khỏi lịch làm việc.',
            },
        },
    },
    YEAR: {
        description: 'Chuyển đổi số sê-ri thành năm',
        abstract: 'Chuyển đổi số sê-ri thành năm',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/year-%E5%87%BD%E6%95%B0-371d2722-0a8d-48de-8b7c-9bd6b289b93c',
            },
        ],
        functionParameter: {
            serialNumber: {
                name: 'Số sê-ri ngày',
                detail: 'Ngày cần tìm. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
        },
    },
    YEARFRAC: {
        description: 'Trả về phân số của năm đại diện cho số ngày trọn vẹn giữa start_date và end_date. Ví dụ, bạn có thể sử dụng hàm YEARFRAC để xác định tỷ lệ lợi nhuận hàng năm nếu bạn biết số ngày giữa hai ngày hoặc nếu bạn cần tính tỷ lệ hoàn trả cho một khoản vay.',
        abstract: 'Trả về phân số của năm đại diện cho số ngày trọn vẹn giữa start_date và end_date',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/zh-cn/office/yearfrac-%E5%87%BD%E6%95%B0-7b2a6219-4830-40b8-b8e3-9b7c0b6ab0d0',
            },
        ],
        functionParameter: {
            startDate: {
                name: 'Ngày bắt đầu',
                detail: 'Ngày đại diện cho ngày bắt đầu. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
            endDate: {
                name: 'Ngày kết thúc',
                detail: 'Ngày đại diện cho ngày kết thúc. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác.',
            },
            basis: {
                name: 'Cơ sở',
                detail: 'Cơ sở hoặc phương pháp tính số ngày cần sử dụng.',
            },
        },
    },
};
