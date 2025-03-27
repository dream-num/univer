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
    'sheets-sort': {
        general: {
            sort: 'Sắp xếp',
            'sort-asc': 'Tăng dần',
            'sort-desc': 'Giảm dần',
            'sort-custom': 'Tùy chỉnh sắp xếp',
            'sort-asc-ext': 'Tăng dần khu vực mở rộng',
            'sort-desc-ext': 'Giảm dần khu vực mở rộng',
            'sort-asc-cur': 'Tăng dần khu vực hiện tại',
            'sort-desc-cur': 'Giảm dần khu vực hiện tại',
        },
        error: {
            'merge-size': 'Kích thước của các ô đã hợp nhất trong vùng được chọn không đồng nhất, không thể sắp xếp.',
            empty: 'Vùng được chọn không có nội dung, không thể sắp xếp.',
            single: 'Vùng được chọn chỉ có một hàng, không thể sắp xếp.',
            'formula-array': 'Vùng được chọn chứa công thức mảng, không thể sắp xếp.',
        },
        dialog: {
            'sort-reminder': 'Nhắc nhở sắp xếp',
            'sort-reminder-desc': 'Hiện tại chỉ sắp xếp vùng được chọn, có muốn mở rộng phạm vi sắp xếp không?',
            'sort-reminder-ext': 'Mở rộng phạm vi sắp xếp',
            'sort-reminder-no': 'Giữ nguyên phạm vi sắp xếp được chọn',
            'first-row-check': 'Hàng đầu tiên không tham gia sắp xếp',
            'add-condition': 'Thêm điều kiện sắp xếp',
            cancel: 'Hủy bỏ',
            confirm: 'Xác nhận',
        },
    },

};

export default locale;
