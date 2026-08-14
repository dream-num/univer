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
    'sheets-data-validation-ui': {
        title: 'Xác thực dữ liệu',
        ribbon: {
            setCheckbox: 'Đặt hộp kiểm',
            clearCheckbox: 'Xóa hộp kiểm',
            dropdownPresetTitle: 'Áp dụng mẫu:',
            editDropdown: 'Chỉnh sửa tùy chọn',
            clearDropdown: 'Xóa danh sách thả xuống',
            dateTime: 'Ngày giờ',
            presets: {
                yes: 'Có',
                no: 'Không',
                notStarted: 'Chưa bắt đầu',
                inProgress: 'Đang thực hiện',
                completed: 'Hoàn thành',
                option1: 'Tùy chọn 1',
                option2: 'Tùy chọn 2',
            },
        },
        operators: {
            legal: 'là kiểu hợp lệ',
        },
        validFail: {
            formulaError: 'Phạm vi tham chiếu chứa dữ liệu không hiển thị, vui lòng điều chỉnh lại phạm vi',
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
        date: {
            title: 'Ngày',
        },
        list: {
            title: 'Danh sách thả xuống',
            add: 'Thêm tùy chọn',
            options: 'Nguồn tùy chọn',
            customOptions: 'Tùy chỉnh',
            refOptions: 'Tham chiếu dữ liệu',
            edit: 'Biên tập',
        },
        checkbox: {
            title: 'Hộp kiểm',
            tips: 'Sử dụng giá trị tùy chỉnh trong ô',
            checked: 'Giá trị khi chọn',
            unchecked: 'Giá trị khi không chọn',
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
        permission: {
            dialog: {
                setStyleErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền thiết lập kiểu. Nếu cần thiết lập kiểu, vui lòng liên hệ với người tạo.',
            },
        },
    },
};

export default locale;
