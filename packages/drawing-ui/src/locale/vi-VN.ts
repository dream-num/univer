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
    'image-popup': {
        replace: 'Thay thế',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        crop: 'Cắt',
        reset: 'Đặt lại kích thước',
    },
    'image-cropper': {
        error: 'Không thể cắt phần tử không phải hình ảnh',
    },
    'image-panel': {
        arrange: {
            title: 'Sắp xếp',
            forward: 'Di chuyển lên một lớp',
            backward: 'Di chuyển xuống một lớp',
            front: 'Đưa lên trên cùng',
            back: 'Đưa xuống dưới cùng',
        },
        transform: {
            title: 'Biến đổi',
            rotate: 'Xoay (°)',
            x: 'X (px)',
            y: 'Y (px)',
            width: 'Chiều rộng (px)',
            height: 'Chiều cao (px)',
            lock: 'Khóa tỷ lệ (%)',
        },
        crop: {
            title: 'Cắt',
            start: 'Bắt đầu cắt',
            mode: 'Cắt tự do tỷ lệ',
        },
        group: {
            title: 'Nhóm',
            group: 'Nhóm',
            reGroup: 'Nhóm lại',
            unGroup: 'Hủy nhóm',
        },
        align: {
            title: 'Căn chỉnh',
            default: 'Chọn cách căn chỉnh',
            left: 'Căn trái',
            center: 'Căn giữa theo chiều ngang',
            right: 'Căn phải',
            top: 'Căn trên',
            middle: 'Căn giữa theo chiều dọc',
            bottom: 'Căn dưới',
            horizon: 'Phân phối theo chiều ngang',
            vertical: 'Phân phối theo chiều dọc',
        },
        null: 'Không có đối tượng nào được chọn',
    },
    'drawing-view': 'Drawing',
    shortcut: {
        'drawing-move-down': 'Move Drawing down',
        'drawing-move-up': 'Move Drawing up',
        'drawing-move-left': 'Move Drawing left',
        'drawing-move-right': 'Move Drawing right',
        'drawing-delete': 'Delete Drawing',
    },
}
;

export default locale;
