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
    dataValidation: {
        title: 'Xác thực dữ liệu',
        validFail: {
            value: 'Vui lòng nhập một giá trị hợp lệ',
            common: 'Vui lòng nhập giá trị hoặc công thức',
            number: 'Vui lòng nhập một số hợp lệ hoặc công thức',
            formula: 'Vui lòng nhập một công thức hợp lệ',
            integer: 'Vui lòng nhập một số nguyên hợp lệ hoặc công thức',
            date: 'Vui lòng nhập một ngày hợp lệ hoặc công thức',
            list: 'Vui lòng nhập ít nhất một tùy chọn hợp lệ',
            listInvalid: 'Nguồn danh sách phải là một danh sách phân tách hoặc một tham chiếu đến một hàng hoặc cột đơn.',
            checkboxEqual: 'Nhập các giá trị khác nhau cho các ô được chọn và không được chọn.',
            formulaError: 'Phạm vi tham chiếu chứa dữ liệu không hiển thị, vui lòng điều chỉnh lại phạm vi',
            listIntersects: 'Phạm vi đã chọn không thể giao với phạm vi quy tắc',
            primitive: 'Các giá trị tùy chỉnh cho ô được chọn và không được chọn không được phép sử dụng công thức.',
        },
        panel: {
            title: 'Quản lý xác thực dữ liệu',
            addTitle: 'Tạo xác thực dữ liệu mới',
            removeAll: 'Xóa tất cả',
            add: 'Tạo quy tắc mới',
            range: 'Phạm vi áp dụng',
            rangeError: 'Phạm vi không hợp pháp',
            type: 'Loại điều kiện',
            options: 'Cài đặt nâng cao',
            operator: 'Dữ liệu',
            removeRule: 'Xóa quy tắc',
            done: 'Xác nhận',
            formulaPlaceholder: 'Vui lòng nhập giá trị hoặc công thức',
            valuePlaceholder: 'Vui lòng nhập giá trị',
            formulaAnd: 'Và',
            invalid: 'Dữ liệu không hợp lệ khi',
            showWarning: 'Hiển thị cảnh báo',
            rejectInput: 'Từ chối đầu vào',
            messageInfo: 'Thông báo',
            showInfo: 'Hiển thị thông báo cho ô đã chọn',
            allowBlank: 'Bỏ qua giá trị rỗng',
        },
        operators: {
            between: 'Giữa',
            greaterThan: 'Lớn hơn',
            greaterThanOrEqual: 'Lớn hơn hoặc bằng',
            lessThan: 'Nhỏ hơn',
            lessThanOrEqual: 'Nhỏ hơn hoặc bằng',
            equal: 'Bằng',
            notEqual: 'Không bằng',
            notBetween: 'Không nằm giữa',
            legal: 'là kiểu hợp lệ',
        },
        ruleName: {
            between: 'Giữa {FORMULA1} và {FORMULA2}',
            greaterThan: 'Lớn hơn {FORMULA1}',
            greaterThanOrEqual: 'Lớn hơn hoặc bằng {FORMULA1}',
            lessThan: 'Nhỏ hơn {FORMULA1}',
            lessThanOrEqual: 'Nhỏ hơn hoặc bằng {FORMULA1}',
            equal: 'Bằng {FORMULA1}',
            notEqual: 'Không bằng {FORMULA1}',
            notBetween: 'Không nằm giữa {FORMULA1} và {FORMULA2}',
            legal: 'là một {TYPE} hợp lệ',
        },
        errorMsg: {
            between: 'Giá trị phải nằm giữa {FORMULA1} và {FORMULA2}',
            greaterThan: 'Giá trị phải lớn hơn {FORMULA1}',
            greaterThanOrEqual: 'Giá trị phải lớn hơn hoặc bằng {FORMULA1}',
            lessThan: 'Giá trị phải nhỏ hơn {FORMULA1}',
            lessThanOrEqual: 'Giá trị phải nhỏ hơn hoặc bằng {FORMULA1}',
            equal: 'Giá trị phải bằng {FORMULA1}',
            notEqual: 'Giá trị phải không bằng {FORMULA1}',
            notBetween: 'Giá trị phải không nằm giữa {FORMULA1} và {FORMULA2}',
            legal: 'Giá trị phải là một {TYPE} hợp lệ',
        },
        any: {
            title: 'Bất kỳ giá trị',
            error: 'Nội dung của ô này vi phạm quy tắc xác thực',
        },
        date: {
            title: 'Ngày',
            operators: {
                between: 'Giữa',
                greaterThan: 'Sau',
                greaterThanOrEqual: 'Sau hoặc bằng',
                lessThan: 'Trước',
                lessThanOrEqual: 'Trước hoặc bằng',
                equal: 'Bằng',
                notEqual: 'Không bằng',
                notBetween: 'Không nằm giữa',
                legal: 'là ngày hợp lệ',
            },
            ruleName: {
                between: 'Giữa {FORMULA1} và {FORMULA2}',
                greaterThan: 'Sau {FORMULA1}',
                greaterThanOrEqual: 'Sau hoặc bằng {FORMULA1}',
                lessThan: 'Trước {FORMULA1}',
                lessThanOrEqual: 'Trước hoặc bằng {FORMULA1}',
                equal: 'Bằng {FORMULA1}',
                notEqual: 'Không bằng {FORMULA1}',
                notBetween: 'Không nằm giữa {FORMULA1} và {FORMULA2}',
                legal: 'là một ngày hợp lệ',
            },
            errorMsg: {
                between: 'Ngày phải nằm giữa {FORMULA1} và {FORMULA2}',
                greaterThan: 'Ngày phải sau {FORMULA1}',
                greaterThanOrEqual: 'Ngày phải sau hoặc bằng {FORMULA1}',
                lessThan: 'Ngày phải trước {FORMULA1}',
                lessThanOrEqual: 'Ngày phải trước hoặc bằng {FORMULA1}',
                equal: 'Ngày phải bằng {FORMULA1}',
                notEqual: 'Ngày phải không bằng {FORMULA1}',
                notBetween: 'Ngày phải không nằm giữa {FORMULA1} và {FORMULA2}',
                legal: 'Giá trị phải là một ngày hợp lệ',
            },
        },
        list: {
            title: 'Danh sách thả xuống',
            name: 'Giá trị phải nằm trong danh sách',
            error: 'Đầu vào phải nằm trong phạm vi chỉ định',
            emptyError: 'Vui lòng nhập một giá trị',
            add: 'Thêm tùy chọn',
            dropdown: 'Chọn một',
            options: 'Nguồn tùy chọn',
            customOptions: 'Tùy chỉnh',
            refOptions: 'Tham chiếu dữ liệu',
            formulaError: 'Nguồn danh sách phải là danh sách dữ liệu đã được phân chia rõ ràng, hoặc là tham chiếu đến một hàng hoặc cột đơn.',
            edit: 'Biên tập',
        },
        listMultiple: {
            title: 'Danh sách thả xuống - Chọn nhiều',
            dropdown: 'Chọn nhiều',
        },
        textLength: {
            title: 'Độ dài văn bản',
            errorMsg: {
                between: 'Độ dài văn bản phải nằm giữa {FORMULA1} và {FORMULA2}',
                greaterThan: 'Độ dài văn bản phải lớn hơn {FORMULA1}',
                greaterThanOrEqual: 'Độ dài văn bản phải lớn hơn hoặc bằng {FORMULA1}',
                lessThan: 'Độ dài văn bản phải nhỏ hơn {FORMULA1}',
                lessThanOrEqual: 'Độ dài văn bản phải nhỏ hơn hoặc bằng {FORMULA1}',
                equal: 'Độ dài văn bản phải bằng {FORMULA1}',
                notEqual: 'Độ dài văn bản phải không bằng {FORMULA1}',
                notBetween: 'Độ dài văn bản phải không nằm giữa {FORMULA1} và {FORMULA2}',
            },
        },
        decimal: {
            title: 'Số thập phân',
        },
        whole: {
            title: 'Số nguyên',
        },
        checkbox: {
            title: 'Hộp kiểm',
            error: 'Nội dung của ô này vi phạm quy tắc xác thực',
            tips: 'Sử dụng giá trị tùy chỉnh trong ô',
            checked: 'Giá trị khi chọn',
            unchecked: 'Giá trị khi không chọn',
        },
        custom: {
            title: 'Công thức tùy chỉnh',
            error: 'Nội dung của ô này vi phạm quy tắc xác thực',
            validFail: 'Vui lòng nhập một công thức hợp lệ',
            ruleName: 'Công thức tùy chỉnh {FORMULA1}',
        },
        alert: {
            title: 'Thông báo',
            ok: 'Xác nhận',
        },
        error: {
            title: 'Không hợp lệ:',
        },
        renderMode: {
            arrow: 'Mũi tên',
            chip: 'Nhãn dạng thanh',
            text: 'Văn bản thuần túy',
            label: 'Hiển thị kiểu',
        },
        showTime: {
            label: 'Hiển thị lựa chọn thởi gian',
        },
    },
};

export default locale;
