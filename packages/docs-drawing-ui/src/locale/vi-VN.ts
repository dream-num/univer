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
    'docs-drawing-ui': {
        title: 'Hình ảnh',
        upload: {
            float: 'Chèn hình ảnh',
        },
        shape: {
            insert: {
                title: 'Chèn hình',
                rectangle: 'Chèn hình chữ nhật',
                ellipse: 'Chèn hình elip',
            },
        },
        panel: {
            title: 'Chỉnh sửa hình ảnh',
        },
        'image-popup': {
            delete: 'Xóa',
            edit: 'Chỉnh sửa',
            crop: 'Cắt',
            reset: 'Đặt lại kích thước',
        },
        'image-text-wrap': {
            title: 'Bọc văn bản',
            wrappingStyle: 'Kiểu bọc văn bản',
            square: 'Hình vuông',
            topAndBottom: 'Trên và dưới',
            inline: 'Cùng dòng với văn bản',
            behindText: 'Phía sau văn bản',
            inFrontText: 'Phía trước văn bản',
            wrapText: 'Bọc văn bản',
            bothSide: 'Cả hai bên',
            leftOnly: 'Chỉ bên trái',
            rightOnly: 'Chỉ bên phải',
            distanceFromText: 'Khoảng cách với văn bản',
            top: 'Trên (px)',
            left: 'Trái (px)',
            bottom: 'Dưới (px)',
            right: 'Phải (px)',
        },
        'image-position': {
            title: 'Vị trí',
            horizontal: 'Ngang',
            vertical: 'Dọc',
            absolutePosition: 'Vị trí tuyệt đối (px)',
            toTheRightOf: 'ở bên phải',
            bellow: 'bên dưới',
            options: 'Tùy chọn',
            moveObjectWithText: 'Di chuyển đối tượng cùng văn bản',
            column: 'Cột',
            margin: 'Lề',
            page: 'Trang',
            line: 'Dòng',
            paragraph: 'Đoạn văn',
        },
        'update-status': {
            exceedMaxSize: 'Kích thước hình ảnh vượt quá giới hạn, giới hạn là {0}M',
            invalidImageType: 'Loại hình ảnh không hợp lệ',
            exceedMaxCount: 'Chỉ có thể tải lên tối đa {0} hình ảnh một lần',
            invalidImage: 'Hình ảnh không hợp lệ',
        },
        shortcut: {
            'drawing-view': 'Chế độ xem bản vẽ',
            'drawing-move-down': 'Di chuyển bản vẽ xuống',
            'drawing-move-up': 'Di chuyển bản vẽ lên',
            'drawing-move-left': 'Di chuyển bản vẽ sang trái',
            'drawing-move-right': 'Di chuyển bản vẽ sang phải',
            'drawing-delete': 'Xóa bản vẽ',
        },
    },
};

export default locale;
