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
    'univer-watermark': {
        title: 'Hình mờ',
        type: 'Loại',
        text: 'Văn bản',
        image: 'Hình ảnh',
        uploadImage: 'Tải lên hình ảnh',
        replaceImage: 'Thay thế hình ảnh',
        keepRatio: 'Giữ tỷ lệ',
        width: 'Chiều rộng',
        height: 'Chiều cao',
        style: 'Cài đặt kiểu',
        content: 'Nội dung',
        textPlaceholder: 'Nhập văn bản',
        fontSize: 'Kích thước phông chữ',
        direction: 'Hướng',
        ltr: 'Trái sang phải',
        rtl: 'Phải sang trái',
        inherits: 'Thừa kế',
        opacity: 'Độ mờ',
        layout: 'Cài đặt bố cục',
        rotate: 'Xoay',
        repeat: 'Lặp lại',
        spacingX: 'Khoảng cách ngang',
        spacingY: 'Khoảng cách dọc',
        startX: 'Vị trí bắt đầu ngang',
        startY: 'Vị trí bắt đầu dọc',

        cancel: 'Hủy hình mờ',
        close: 'Đóng bảng điều khiển',
        copy: 'Sao chép cấu hình',
    },
};

export default locale;
