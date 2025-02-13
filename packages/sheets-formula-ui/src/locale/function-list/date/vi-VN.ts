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
    DATE: {
        description: 'Kết hợp ba giá trị riêng biệt thành một ngày.',
        abstract: 'Trả về số sê-ri của ngày cụ thể',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/date-%E5%87%BD%E6%95%B0-e36c0c8c-4104-49da-ab83-82328b832349',
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
                url: 'https://support.microsoft.com/vi-vn/office/datedif-%E5%87%BD%E6%95%B0-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            startDate: { name: 'ngày bắt đầu', detail: 'Ngày đại diện cho ngày đầu tiên hoặc ngày bắt đầu của một khoảng thời gian đã cho.' },
            endDate: { name: 'ngày kết thúc', detail: 'Ngày đại diện cho ngày cuối cùng hoặc ngày kết thúc khoảng thời gian.' },
            method: { name: 'Loại thông tin', detail: 'Kiểu thông tin mà bạn muốn được trả về.' },
        },
    },
    DATEVALUE: {
        description: 'Chuyển đổi ngày ở dạng văn bản thành số sê-ri.',
        abstract: 'Chuyển đổi ngày ở dạng văn bản thành số sê-ri',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/datevalue-%E5%87%BD%E6%95%B0-df8b07d4-7761-4a93-bc33-b7471bbff252',
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
                url: 'https://support.microsoft.com/vi-vn/office/day-%E5%87%BD%E6%95%B0-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
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
                url: 'https://support.microsoft.com/vi-vn/office/days-%E5%87%BD%E6%95%B0-57740535-d549-4395-8728-0f07bff0b9df',
            },
        ],
        functionParameter: {
            endDate: { name: 'ngày kết thúc', detail: 'Hai ngày mà bạn muốn biết số ngày giữa hai ngày đó.' },
            startDate: { name: 'ngày bắt đầu', detail: 'Hai ngày mà bạn muốn biết số ngày giữa hai ngày đó.' },
        },
    },
    DAYS360: {
        description: 'Tính số ngày giữa hai ngày dựa trên năm 360 ngày',
        abstract: 'Tính số ngày giữa hai ngày dựa trên năm 360 ngày',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/days360-%E5%87%BD%E6%95%B0-b9a509fd-49ef-407e-94df-0cbda5718c2a',
            },
        ],
        functionParameter: {
            startDate: { name: 'ngày bắt đầu', detail: 'Hai ngày mà bạn muốn biết số ngày giữa hai ngày đó.' },
            endDate: { name: 'ngày kết thúc', detail: 'Hai ngày mà bạn muốn biết số ngày giữa hai ngày đó.' },
            method: { name: 'phương pháp', detail: 'Giá trị lô-gic xác định sẽ dùng phương pháp của Hoa Kỳ hay của châu Âu trong tính toán.' },
        },
    },
    EDATE: {
        description: 'Trả về số sê-ri đại diện cho ngày cách một số tháng chỉ định trước hoặc sau một ngày cụ thể (start_date). Sử dụng hàm EDATE để tính ngày đến hạn hoặc ngày hết hạn.',
        abstract: 'Trả về số sê-ri của ngày cách start_date một số tháng chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/edate-%E5%87%BD%E6%95%B0-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
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
                url: 'https://support.microsoft.com/vi-vn/office/eomonth-%E5%87%BD%E6%95%B0-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            startDate: {
                name: 'Ngày bắt đầu',
                detail: 'Ngày biểu thị ngày bắt đầu.',
            },
            months: {
                name: 'Số tháng',
                detail: 'Số tháng trước hoặc sau start_date.',
            },
        },
    },
    EPOCHTODATE: {
        description: 'Chuyển đổi dấu thời gian bắt đầu của hệ thống Unix ở dạng giây, mili giây hoặc micrô giây thành dạng ngày giờ theo Giờ phối hợp quốc tế (UTC).',
        abstract: 'Chuyển đổi dấu thời gian bắt đầu của hệ thống Unix ở dạng giây, mili giây hoặc micrô giây thành dạng ngày giờ theo Giờ phối hợp quốc tế (UTC).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/13193461?hl=vi&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            timestamp: { name: 'dấu thời gian', detail: 'Dấu thời gian bắt đầu của hệ thống Unix ở dạng giây, mili giây hoặc micrô giây.' },
            unit: { name: 'đơn vị thời gian', detail: 'Đơn vị thời gian mà dấu thời gian thể hiện. 1 theo mặc định: \n1 cho biết đơn vị thời gian là giây. \n2 cho biết đơn vị thời gian là mili giây.\n3 cho biết đơn vị thời gian là micrô giây.' },
        },
    },
    HOUR: {
        description: 'Chuyển đổi số sê-ri thành giờ',
        abstract: 'Chuyển đổi số sê-ri thành giờ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/hour-%E5%87%BD%E6%95%B0-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            serialNumber: {
                name: 'Số sê-ri ngày',
                detail: 'Ngày cần tìm. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
        },
    },
    ISOWEEKNUM: {
        description: 'Trả về số tuần ISO của năm đối với ngày đã cho.',
        abstract: 'Trả về số tuần ISO của năm đối với ngày đã cho.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/isoweeknum-%E5%87%BD%E6%95%B0-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            date: { name: 'Ngày', detail: 'Ngày là mã ngày-giờ được Excel dùng để tính toán ngày và giờ.' },
        },
    },
    MINUTE: {
        description: 'Chuyển đổi số sê-ri thành phút',
        abstract: 'Chuyển đổi số sê-ri thành phút',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/minute-%E5%87%BD%E6%95%B0-9a3db35c-256c-45da-86bf-d82cde6d4fcb',
            },
        ],
        functionParameter: {
            serialNumber: {
                name: 'Số sê-ri ngày',
                detail: 'Ngày cần tìm. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
        },
    },
    MONTH: {
        description: 'Trả về tháng của một ngày cụ thể được biểu diễn bằng số sê-ri. Tháng là một số nguyên từ 1 (tháng 1) đến 12 (tháng 12).',
        abstract: 'Chuyển đổi số sê-ri thành tháng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/month-%E5%87%BD%E6%95%B0-0df62f6e-672d-4c78-9a70-a764de937b5e',
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
                url: 'https://support.microsoft.com/vi-vn/office/networkdays-%E5%87%BD%E6%95%B0-c48cafe0-1b60-4dd7-afac-81521ff6f53b',
            },
        ],
        functionParameter: {
            startDate: { name: 'ngày bắt đầu', detail: 'Một ngày đại diện cho ngày bắt đầu.' },
            endDate: { name: 'ngày kết thúc', detail: 'Ngày đại diện cho ngày chấm dứt.' },
            holidays: { name: 'ngày lễ', detail: 'Một phạm vi tùy chọn gồm một hoặc nhiều ngày không có trong lịch làm việc.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Trả về số ngày làm việc trọn vẹn ở giữa hai ngày bằng cách dùng tham số để cho biết có bao nhiêu ngày cuối tuần và đó là những ngày nào.',
        abstract: 'Trả về số ngày làm việc trọn vẹn ở giữa hai ngày bằng cách dùng tham số để cho biết có bao nhiêu ngày cuối tuần và đó là những ngày nào.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/networkdays-intl-%E5%87%BD%E6%95%B0-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
            },
        ],
        functionParameter: {
            startDate: { name: 'ngày bắt đầu', detail: 'Một ngày đại diện cho ngày bắt đầu.' },
            endDate: { name: 'ngày kết thúc', detail: 'Ngày đại diện cho ngày chấm dứt.' },
            weekend: { name: 'ngày cuối tuần', detail: 'Ngày cuối tuần có thể là số ngày cuối tuần hoặc một chuỗi cho biết ngày cuối tuần xảy ra khi nào.' },
            holidays: { name: 'ngày lễ', detail: 'Một phạm vi tùy chọn gồm một hoặc nhiều ngày không có trong lịch làm việc.' },
        },
    },
    NOW: {
        description: 'Trả về số sê-ri của ngày và thời gian hiện tại.',
        abstract: 'Trả về số sê-ri của ngày và thời gian hiện tại.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/now-%E5%87%BD%E6%95%B0-3337fd29-145a-4347-b2e6-20c904739c46',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Chuyển đổi số sê-ri thành giây',
        abstract: 'Chuyển đổi số sê-ri thành giây',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/second-%E5%87%BD%E6%95%B0-44921a95-0b32-4f8b-8317-82ef1d22bb84',
            },
        ],
        functionParameter: {
            serialNumber: {
                name: 'Số sê-ri ngày',
                detail: 'Ngày cần tìm. Nên sử dụng hàm DATE để nhập ngày hoặc nhập ngày dưới dạng kết quả của các công thức hoặc hàm khác. Ví dụ, sử dụng hàm DATE(2008,5,23) để nhập ngày 23 tháng 5 năm 2008.',
            },
        },
    },
    TIME: {
        description: 'Trả về số thập phân của một thời gian cụ thể. Nếu định dạng ô là General trước khi nhập hàm, kết quả sẽ được định dạng dưới dạng ngày tháng.',
        abstract: 'Trả về số thập phân của một thời gian cụ thể',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/time-%E5%87%BD%E6%95%B0-3607e6cc-0f46-4c3b-8357-40fe314d7b3c',
            },
        ],
        functionParameter: {
            hour: { name: 'Giờ', detail: 'Một số từ 0 (không) đến 32767 biểu thị giờ. Bất kỳ giá trị nào lớn hơn 23 đều được chia cho 24 và phần còn lại được sử dụng làm giá trị giờ. Ví dụ: TIME(27,0,0) = TIME(3,0,0) = 0,125 hoặc 3:00 AM.' },
            minute: { name: 'phút', detail: 'Một số từ 0 đến 32767 biểu thị số phút. Mọi giá trị lớn hơn 59 sẽ được chuyển đổi thành giờ và phút. Ví dụ: TIME(0,750,0) = TIME(12,30,0) = 0,520833 hoặc 12:30 PM.' },
            second: { name: 'giây', detail: 'Một số từ 0 đến 32767 biểu thị giây. Mọi giá trị lớn hơn 59 sẽ được chuyển đổi thành giờ, phút và giây. Ví dụ: TIME(0,0,2000) = TIME(0,33,22) = 0,023148 ​​​​hoặc 12:33:20 AM.' },
        },
    },
    TIMEVALUE: {
        description: 'Chuyển đổi một thời gian ở dạng văn bản thành số thập phân đại diện cho thời gian đó trong Excel.',
        abstract: 'Chuyển đổi một thời gian ở dạng văn bản thành số thập phân đại diện cho thời gian đó trong Excel',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/timevalue-%E5%87%BD%E6%95%B0-d7c29d57-399f-4a11-a7d8-379e01c7130d',
            },
        ],
        functionParameter: {
            timeText: {
                name: 'Văn bản thời gian',
                detail: 'Chuỗi văn bản đại diện cho một thời gian trong định dạng thời gian Excel, ví dụ, "6:45 PM" và "18:45" là văn bản chuỗi trong dấu ngoặc kép đại diện cho thời gian.',
            },
        },
    },
    TO_DATE: {
        description: 'Chuyển đổi một số cho sẵn thành giá trị ngày (theo lịch).',
        abstract: 'Chuyển đổi một số cho sẵn thành giá trị ngày (theo lịch).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.google.com/docs/answer/3094239?hl=vi&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'giá trị', detail: 'Đối số hoặc tham chiếu đến một ô sẽ được chuyển đổi thành ngày tháng.' },
        },
    },
    TODAY: {
        description: 'Trả về ngày hiện tại. Hàm này rất hữu ích khi cần sử dụng ngày hiện tại trong các công thức hoặc để tính toán khoảng thời gian liên quan đến ngày hiện tại.',
        abstract: 'Trả về ngày hiện tại',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/today-%E5%87%BD%E6%95%B0-49540925-3611-41c5-90e3-f1b6e8e5f029',
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
                url: 'https://support.microsoft.com/vi-vn/office/weekday-%E5%87%BD%E6%95%B0-f3651330-3a06-4892-9d89-12cc7dadaabd',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'Số sê-ri ngày', detail: 'Số sê-ri đại diện cho ngày trong ngày cố gắng tra cứu.' },
            returnType: { name: 'Kiểu giá trị trả về', detail: 'Một số được sử dụng để xác định loại giá trị trả về.' },
        },
    },
    WEEKNUM: {
        description: 'Trả về số tuần của một ngày cụ thể trong một năm',
        abstract: 'Trả về số tuần của một ngày cụ thể trong một năm',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/weeknum-%E5%87%BD%E6%95%B0-2fdd388d-8f4d-4208-95de-8f2ad40187af',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'Số sê-ri ngày', detail: 'Đại diện cho ngày trong tuần.' },
            returnType: { name: 'Kiểu giá trị trả về', detail: 'Một con số xác định ngày bắt đầu trong tuần. Giá trị mặc định là 1.' },
        },
    },
    WORKDAY: {
        description: 'Trả về số sê-ri của ngày trước hoặc sau một số ngày làm việc đã chỉ định. Ngày làm việc không bao gồm ngày cuối tuần và bất kỳ ngày nào được xác định là ngày nghỉ.',
        abstract: 'Trả về số sê-ri của ngày trước hoặc sau một số ngày làm việc đã chỉ định',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/workday-%E5%87%BD%E6%95%B0-5570eab1-e9e5-49d0-9650-efda88d7d0b8',
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
    WORKDAY_INTL: {
        description: '返回日期在指定的工作日天数之前或之后的序列号（使用参数指明周末有几天并指明是哪几天）',
        abstract: '返回日期在指定的工作日天数之前或之后的序列号（使用参数指明周末有几天并指明是哪几天）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/vi-vn/office/workday-intl-%E5%87%BD%E6%95%B0-a378391c-9ba7-4678-8a39-39611a9bf81d',
            },
        ],
        functionParameter: {
            startDate: { name: 'Ngày bắt đầu', detail: 'Một ngày đại diện cho ngày bắt đầu.' },
            days: { name: 'Số ngày', detail: 'Số ngày làm việc trước hoặc sau start_date. Giá trị dương sẽ trả về ngày trong tương lai; giá trị âm sẽ trả về ngày trong quá khứ.' },
            weekend: { name: 'ngày cuối tuần', detail: 'Ngày cuối tuần có thể là số ngày cuối tuần hoặc một chuỗi cho biết ngày cuối tuần xảy ra khi nào.' },
            holidays: { name: 'ngày lễ', detail: 'Một phạm vi tùy chọn gồm một hoặc nhiều ngày không có trong lịch làm việc.' },
        },
    },
    YEAR: {
        description: 'Chuyển đổi số sê-ri thành năm',
        abstract: 'Chuyển đổi số sê-ri thành năm',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/office/year-%E5%87%BD%E6%95%B0-371d2722-0a8d-48de-8b7c-9bd6b289b93c',
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
                url: 'https://support.microsoft.com/vi-vn/office/yearfrac-%E5%87%BD%E6%95%B0-7b2a6219-4830-40b8-b8e3-9b7c0b6ab0d0',
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
