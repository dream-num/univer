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
    DATE: {
        description: 'Kết hợp ba giá trị riêng biệt thành một ngày.',
        abstract: 'Trả về số sê-ri của ngày cụ thể',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/date-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'ngày bắt đầu', detail: 'Ngày đại diện cho ngày đầu tiên hoặc ngày bắt đầu của một khoảng thời gian đã cho. Ngày tháng có thể được nhập ở dạng chuỗi văn bản trong dấu ngoặc kép (ví dụ, "30/1/2001" ), dưới dạng số sê-ri (ví dụ, 36921, biểu thị cho ngày 30 tháng 1 năm 2001, nếu bạn đang sử dụng hệ thống ngày tháng 1900), hoặc là kết quả của các công thức hoặc hàm khác (ví dụ, hàm DATEVALUE("30/1/2001")).' },
            endDate: { name: 'ngày kết thúc', detail: 'Ngày đại diện cho ngày cuối cùng hoặc ngày kết thúc khoảng thời gian.' },
            unit: { name: 'Unit', detail: 'Kiểu thông tin mà bạn muốn trả về, trong đó: Unit****Returns " Y "Số năm hoàn thành trong kỳ." M "Số tháng hoàn tất trong kỳ." D "Số ngày trong khoảng thời gian." MD "Sự khác biệt giữa các ngày trong start_date và end_date. Đã bỏ qua tháng và năm của ngày. Quan trọng: Chúng tôi khuyên bạn không nên sử dụng tham đối "MD", vì có những giới hạn đã biết kèm theo. Hãy xem phần sự cố đã biết bên dưới." YM "Sự khác biệt giữa các tháng trong start_date và end_date. Ngày và năm của ngày được bỏ qua" YD "Sự khác biệt giữa các ngày trong ngày start_date ngày end_date. Đã bỏ qua năm của ngày.' },
        },
    },
    DATEVALUE: {
        description: 'Chuyển đổi ngày ở dạng văn bản thành số sê-ri.',
        abstract: 'Chuyển đổi ngày ở dạng văn bản thành số sê-ri',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/datevalue-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/day-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/days-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/days360-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/edate-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/eomonth-function',
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
                url: 'https://support.google.com/docs/answer/13193461?hl=vi',
            },
        ],
        functionParameter: {
            timestamp: { name: 'dấu thời gian', detail: 'EPOCHTODATE(1655908429662,2)' },
            unit: { name: 'đơn vị thời gian', detail: 'EPOCHTODATE(1655906710)' },
        },
    },
    HOUR: {
        description: 'Chuyển đổi số sê-ri thành giờ',
        abstract: 'Chuyển đổi số sê-ri thành giờ',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/hour-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'Ngày', detail: 'Yêu cầu. Ngày là mã ngày-giờ được Excel dùng để tính toán ngày và giờ.' },
        },
    },
    MINUTE: {
        description: 'Trả về phút của một giá trị thời gian. Phút được trả về dưới dạng số nguyên, trong phạm vi từ 0 tới 59.',
        abstract: 'Trả về phút của một giá trị thời gian. Phút được trả về dưới dạng số nguyên, trong phạm vi từ 0 tới 59.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'Số sê-ri ngày', detail: 'Yêu cầu. Thời gian có chứa phút mà bạn muốn tìm. Thời gian có thể được nhập vào dưới dạng chuỗi văn bản đặt trong dấu ngoặc kép, (ví dụ "6:45 CH"), dạng số thập phân (ví dụ 0,78125, biểu thị cho 6:45 CH) hoặc dạng kết quả của các công thức hoặc hàm khác (ví dụ TIMEVALUE("6:45 CH")).' },
        },
    },
    MONTH: {
        description: 'Trả về tháng của một ngày cụ thể được biểu diễn bằng số sê-ri. Tháng là một số nguyên từ 1 (tháng 1) đến 12 (tháng 12).',
        abstract: 'Chuyển đổi số sê-ri thành tháng',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/month-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'ngày bắt đầu', detail: 'Một ngày đại diện cho ngày bắt đầu.' },
            endDate: { name: 'ngày kết thúc', detail: 'Ngày đại diện cho ngày chấm dứt.' },
            holidays: { name: 'ngày lễ', detail: 'Một phạm vi tùy chọn gồm một hoặc nhiều ngày không có trong lịch làm việc.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Trả về số ngày làm việc trọn vẹn ở giữa hai ngày bằng cách dùng tham số để cho biết có bao nhiêu ngày cuối tuần và đó là những ngày nào. Ngày cuối tuần và bất kỳ ngày nào được chỉ rõ là ngày lễ sẽ không được coi là ngày làm việc.',
        abstract: 'Trả về số ngày làm việc trọn vẹn ở giữa hai ngày bằng cách dùng tham số để cho biết có bao nhiêu ngày cuối tuần và đó là những ngày nào. Ngày cuối tuần và bất kỳ ngày nào được chỉ rõ là ngày lễ sẽ không được coi là ngày làm việc.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/networkdays-intl-function',
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
        description: 'Trả về số sê-ri của ngày và thời gian hiện tại. Nếu trước khi bạn nhập hàm vào ô, định dạng ô là Chung , thì Excel thay đổi định dạng ô để khớp với định dạng ngày và thời gian trong thiết đặt vùng của bạn. Bạn có thể thay đổi định dạng ngày và thời gian cho ô bằng các lệnh trong nhóm Số của tab Trang đầu trên Ribbon.',
        abstract: 'Trả về số sê-ri của ngày và thời gian hiện tại. Nếu trước khi bạn nhập hàm vào ô, định dạng ô là Chung , thì Excel thay đổi định dạng ô để khớp với định dạng ngày và thời gian trong thiết đặt vùng của bạn. Bạn có thể thay đổi định dạng ngày và thời gian cho ô bằng các lệnh trong nhóm Số của tab Trang đầu trên Ribbon.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/now-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/second-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/time-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/timevalue-function',
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
                url: 'https://support.google.com/docs/answer/3094239?hl=vi',
            },
        ],
        functionParameter: {
            value: { name: 'giá trị', detail: 'TO_DATE(A2)' },
        },
    },
    TODAY: {
        description: 'Trả về ngày hiện tại. Hàm này rất hữu ích khi cần sử dụng ngày hiện tại trong các công thức hoặc để tính toán khoảng thời gian liên quan đến ngày hiện tại.',
        abstract: 'Trả về ngày hiện tại',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/today-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/weekday-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/weeknum-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/workday-function',
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
        description: 'Trả về số sê-ri của ngày trước hoặc sau một số ngày làm việc xác định, với tham số chỉ định ngày nào và bao nhiêu ngày là cuối tuần',
        abstract: 'Trả về số sê-ri của ngày trước hoặc sau một số ngày làm việc xác định, với tham số chỉ định ngày nào và bao nhiêu ngày là cuối tuần',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/workday-intl-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/year-function',
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
                url: 'https://support.microsoft.com/vi-vn/excel/functions/yearfrac-function',
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

export default locale;
