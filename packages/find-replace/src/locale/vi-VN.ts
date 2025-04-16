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
    'find-replace': {
        toolbar: 'Tìm kiếm và Thay thế',
        shortcut: {
            'open-find-dialog': 'Mở hộp thoại tìm kiếm',
            'open-replace-dialog': 'Mở hộp thoại thay thế',
            'close-dialog': 'Đóng hộp thoại tìm kiếm và thay thế',
            'go-to-next-match': 'Đến mục khớp tiếp theo',
            'go-to-previous-match': 'Đến mục khớp trước đó',
            'focus-selection': 'Tập trung vào lựa chọn',
        },
        dialog: {
            title: 'Tìm kiếm',
            find: 'Tìm kiếm',
            replace: 'Thay thế',
            'replace-all': 'Thay thế tất cả',
            'find-placeholder': 'Nhập nội dung tìm kiếm',
            'advanced-finding': 'Thay thế / Tìm kiếm nâng cao',
            'replace-placeholder': 'Nhập nội dung thay thế',
            'case-sensitive': 'Phân biệt chữ hoa chữ thường',
            'match-the-whole-cell': 'Khớp toàn bộ ô',
            'find-scope': {
                title: 'Phạm vi tìm kiếm',
                'current-sheet': 'Bảng hiện tại',
                workbook: 'Toàn bộ sổ làm việc',
            },
            'find-direction': {
                title: 'Thứ tự tìm kiếm',
                column: 'Tìm theo cột',
                row: 'Tìm theo hàng',
            },
            'find-by': {
                title: 'Phương thức tìm kiếm',
                formula: 'Tìm công thức',
                value: 'Tìm giá trị',
            },
            'no-match': 'Đã hoàn thành tìm kiếm nhưng không tìm thấy mục nào khớp',
            'no-result': 'Không có kết quả',
        },
        replace: {
            'all-success': 'Đã thay thế tất cả {0} mục khớp',
            'all-failure': 'Thay thế thất bại',
            confirm: {
                title: 'Bạn có chắc muốn thay thế tất cả các mục khớp không?',
            },
        },
    },
    'find-replace-shortcuts': 'Tìm kiếm và Thay thế',
}
;

export default locale;
