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
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Lọc',
            'clear-filter-criteria': 'Xóa điều kiện lọc',
            're-calc-filter-conditions': 'Tính toán lại',
        },
        command: {
            'not-valid-filter-range': 'Khu vực được chọn chỉ có một hàng, không thể lọc',
        },
        shortcut: {
            'smart-toggle-filter': 'Chuyển đổi lọc',
        },
        panel: {
            'clear-filter': 'Xóa lọc',
            cancel: 'Hủy bỏ',
            confirm: 'Xác nhận',
            'by-values': 'Theo giá trị',
            'by-conditions': 'Theo điều kiện',
            'filter-only': 'Chỉ lọc',
            'search-placeholder': 'Sử dụng khoảng trắng để tách các từ khóa',
            'select-all': 'Chọn tất cả',
            'input-values-placeholder': 'Vui lòng nhập',
            or: 'hoặc',
            and: 'và',
            empty: '(Trống)',
            '?': 'Sử dụng ? để đại diện cho một ký tự',
            '*': 'Sử dụng * để đại diện cho nhiều ký tự',
        },
        conditions: {
            none: 'Không',
            empty: 'Trống',
            'not-empty': 'Không trống',
            'text-contains': 'Văn bản chứa',
            'does-not-contain': 'Văn bản không chứa',
            'starts-with': 'Văn bản bắt đầu với',
            'ends-with': 'Văn bản kết thúc với',
            equals: 'Văn bản khớp',
            'greater-than': 'Lớn hơn',
            'greater-than-or-equal': 'Lớn hơn hoặc bằng',
            'less-than': 'Nhỏ hơn',
            'less-than-or-equal': 'Nhỏ hơn hoặc bằng',
            equal: 'Bằng',
            'not-equal': 'Không bằng',
            between: 'Giữa',
            'not-between': 'Không giữa',
            custom: 'Tùy chỉnh',
        },
        msg: {
            'filter-header-forbidden': 'Không thể di chuyển hàng đầu lọc',
        },
        date: {
            1: 'Tháng 1',
            2: 'Tháng 2',
            3: 'Tháng 3',
            4: 'Tháng 4',
            5: 'Tháng 5',
            6: 'Tháng 6',
            7: 'Tháng 7',
            8: 'Tháng 8',
            9: 'Tháng 9',
            10: 'Tháng 10',
            11: 'Tháng 11',
            12: 'Tháng 12',
        },
    },

};

export default locale;
