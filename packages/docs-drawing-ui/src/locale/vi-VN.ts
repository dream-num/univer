/**
 * Copyright 2023-present DreamNum Inc.
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
    docImage: {
        title: 'Hình ảnh',

        upload: {
            float: 'Chèn hình ảnh',
        },

        panel: {
            title: 'Chỉnh sửa hình ảnh',
        },
    },
    'image-popup': {
        replace: 'Thay thế',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        crop: 'Cắt',
        reset: 'Đặt lại kích thước',
    },
    'update-status': {
        exceedMaxSize: 'Kích thước hình ảnh vượt quá giới hạn, giới hạn là {0}M',
        invalidImageType: 'Loại hình ảnh không hợp lệ',
        exceedMaxCount: 'Chỉ có thể tải lên tối đa {0} hình ảnh một lần',
        invalidImage: 'Hình ảnh không hợp lệ',
    },
};

export default locale;
