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
    'slides-ui': {
        append: 'Thêm trang chiếu',

        text: {
            insert: {
                title: 'Chèn văn bản',
            },
        },

        shape: {
            insert: {
                title: 'Chèn hình',
                rectangle: 'Chèn hình chữ nhật',
                ellipse: 'Chèn hình elip',
            },
        },

        image: {
            insert: {
                title: 'Chèn hình ảnh',
                float: 'Chèn hình ảnh nổi',
            },
        },

        popup: {
            edit: 'Chỉnh sửa',
            delete: 'Xóa',
        },

        sidebar: {
            text: 'Chỉnh sửa văn bản',
            shape: 'Chỉnh sửa hình',
            image: 'Chỉnh sửa hình ảnh',
        },

        'image-panel': {
            arrange: {
                title: 'Sắp xếp',
                forward: 'Chuyển lên trên',
                backward: 'Chuyển xuống dưới',
                front: 'Đưa lên trên cùng',
                back: 'Đưa xuống dưới cùng',
            },
            transform: {
                title: 'Biến đổi',
                width: 'Chiều rộng (px)',
                height: 'Chiều cao (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: 'Xoay (°)',
            },
        },
        panel: {
            fill: {
                title: 'Màu tô',
            },
        },
    },
};

export default locale;
