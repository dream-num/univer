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
    sheetImage: {
        title: 'Hình ảnh',

        upload: {
            float: 'Hình ảnh nổi',
            cell: 'Hình ảnh trong ô',
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
    'drawing-anchor': {
        title: 'Thuộc tính neo',
        both: 'Di chuyển và thay đổi kích thước cùng với ô',
        position: 'Di chuyển nhưng không thay đổi kích thước với ô',
        none: 'Không di chuyển hoặc thay đổi kích thước với ô',
    },
    'update-status': {
        exceedMaxSize: 'Kích thước hình ảnh vượt quá giới hạn, giới hạn là {0}M',
        invalidImageType: 'Loại hình ảnh không hợp lệ',
        exceedMaxCount: 'Chỉ có thể tải lên {0} hình ảnh một lần',
        invalidImage: 'Hình ảnh không hợp lệ',
    },
    'cell-image': {
        pasteTitle: 'Dán như hình ảnh ô',
        pasteContent: 'Dán hình ảnh ô sẽ ghi đè lên nội dung hiện có của ô, tiếp tục dán',
        pasteError: 'Sao chép và dán hình ảnh ô không được hỗ trợ trong đơn vị này',
    },
};

export default locale;
