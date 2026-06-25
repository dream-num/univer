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
    'find-replace': {
        toolbar: 'Tìm kiếm và Thay thế',
        shortcut: {
            'open-find-dialog': 'Mở hộp thoại Tìm kiếm',
            'open-replace-dialog': 'Mở hộp thoại Thay thế',
            'close-dialog': 'Đóng hộp thoại Tìm kiếm & Thay thế',
            'go-to-next-match': 'Chuyển đến kết quả tiếp theo',
            'go-to-previous-match': 'Chuyển đến kết quả trước đó',
            'focus-selection': 'Tập trung vào vùng chọn',
            panel: 'Tìm kiếm và Thay thế',
        },
        dialog: {
            title: 'Tìm kiếm',
            find: 'Tìm kiếm',
            replace: 'Thay thế',
            'replace-all': 'Thay thế Tất cả',
            'case-sensitive': 'Phân biệt chữ hoa chữ thường',
            'find-placeholder': 'Tìm trong Trang tính này',
            'advanced-finding': 'Tìm kiếm & Thay thế Nâng cao',
            'replace-placeholder': 'Nhập chuỗi thay thế',
            'match-the-whole-cell': 'Khớp toàn bộ ô',
            'find-direction': {
                title: 'Hướng tìm kiếm',
                row: 'Tìm theo hàng',
                column: 'Tìm theo cột',
            },
            'find-scope': {
                title: 'Phạm vi tìm kiếm',
                'current-sheet': 'Trang tính hiện tại',
                workbook: 'Sổ làm việc',
            },
            'find-by': {
                title: 'Tìm theo',
                value: 'Tìm theo giá trị',
                formula: 'Tìm công thức',
            },
            'no-match': 'Đã hoàn thành tìm kiếm nhưng không tìm thấy kết quả phù hợp.',
            'no-result': 'Không có kết quả',
        },
        replace: {
            'all-success': 'Đã thay thế tất cả {0} kết quả phù hợp',
            'partial-success': 'Đã thay thế {0} kết quả phù hợp, không thể thay thế {1}',
            'all-failure': 'Thay thế thất bại',
            confirm: {
                title: 'Bạn có chắc chắn muốn thay thế tất cả các kết quả phù hợp không?',
            },
        },
        button: {
            confirm: 'Xác nhận',
            cancel: 'Hủy',
        },
    },
};

export default locale;
