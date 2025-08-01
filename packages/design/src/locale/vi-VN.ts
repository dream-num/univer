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
    design: {
        Confirm: {
            cancel: 'Hủy bỏ',
            confirm: 'Xác nhận',
        },
        CascaderList: {
            empty: 'Không có',
        },
        Calendar: {
            year: 'Năm',
            weekDays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            months: [
                'Tháng 1',
                'Tháng 2',
                'Tháng 3',
                'Tháng 4',
                'Tháng 5',
                'Tháng 6',
                'Tháng 7',
                'Tháng 8',
                'Tháng 9',
                'Tháng 10',
                'Tháng 11',
                'Tháng 12',
            ],
        },
        Select: {
            empty: 'Không có',
        },
        ColorPicker: {
            more: 'Màu sắc khác',
            cancel: 'Hủy bỏ',
            confirm: 'Xác nhận',
        },
    },
};

export default locale;
