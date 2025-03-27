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
    hyperLink: {
        form: {
            editTitle: 'Chỉnh sửa liên kết',
            addTitle: 'Chèn liên kết',
            label: 'Văn bản',
            labelPlaceholder: 'Nhập văn bản',
            type: 'Loại',
            link: 'Liên kết',
            linkPlaceholder: 'Nhập địa chỉ liên kết',
            range: 'Ô',
            worksheet: 'Bảng tính',
            definedName: 'Tên đã xác định',
            ok: 'Xác nhận',
            cancel: 'Hủy',
            inputError: 'Vui lòng nhập',
            selectError: 'Vui lòng chọn',
            linkError: 'Vui lòng nhập liên kết hợp lệ',
        },
        menu: {
            add: 'Thêm liên kết',
        },
        message: {
            noSheet: 'Bảng con này đã bị xóa',
            refError: 'Tham chiếu lỗi',
            hiddenSheet: 'Không thể mở bảng con bị ẩn',
            coped: 'Liên kết đã được sao chép vào clipboard',
        },
        popup: {
            copy: 'Sao chép',
            edit: 'Chỉnh sửa',
            cancel: 'Hủy liên kết',
        },
    },

};

export default locale;
