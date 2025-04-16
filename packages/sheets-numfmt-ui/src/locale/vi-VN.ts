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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    sheet: {
        numfmt: {
            title: 'Định dạng số',
            numfmtType: 'Loại định dạng',
            cancel: 'Hủy bỏ',
            confirm: 'Xác nhận',
            general: 'Chung',
            accounting: 'Kế toán',
            text: 'Văn bản',
            number: 'Số',
            percent: 'Phần trăm',
            scientific: 'Chính xác',
            currency: 'Tiền tệ',
            date: 'Ngày',
            time: 'Thời gian',
            thousandthPercentile: 'Phân vị phần nghìn',
            preview: 'Xem trước',
            dateTime: 'Ngày giờ',
            decimalLength: 'Số chữ số thập phân',
            currencyType: 'Loại tiền tệ',
            moreFmt: 'Nhiều định dạng hơn',
            financialValue: 'Giá trị tài chính',
            roundingCurrency: 'Tiền tệ làm tròn',
            timeDuration: 'Thời lượng',
            currencyDes: 'Định dạng tiền tệ được sử dụng để biểu thị các giá trị tiền tệ thông thường. Định dạng kế toán có thể căn chỉnh các giá trị trong một cột với dấu thập phân.',
            accountingDes: 'Định dạng số kế toán có thể căn chỉnh các ký hiệu tiền tệ và dấu thập phân trong một cột các giá trị.',
            dateType: 'Loại ngày',
            dateDes: 'Định dạng ngày biểu thị các giá trị chuỗi ngày và thời gian dưới dạng giá trị ngày.',
            negType: 'Loại số âm',
            generalDes: 'Định dạng chung không chứa bất kỳ định dạng số cụ thể nào.',
            thousandthPercentileDes: 'Định dạng phân vị phần nghìn được sử dụng để biểu thị các số thông thường. Các định dạng tiền tệ và kế toán cung cấp các định dạng chuyên dụng để tính toán giá trị tiền tệ.',
            addDecimal: 'Thêm chữ số thập phân',
            subtractDecimal: 'Giảm chữ số thập phân',
            customFormat: 'Custom Format',
            customFormatDes: 'Generate custom number formats based on existing formats.',
        },
    },
};

export default locale;
