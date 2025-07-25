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

import type { ILocale } from './interface';
import dajsViVN from 'dayjs/locale/vi';
import PickerViVN from 'rc-picker/lib/locale/vi_VN';

const locale: ILocale = {
    design: {
        Confirm: {
            cancel: 'Hủy bỏ',
            confirm: 'Xác nhận',
        },
        Picker: {
            ...dajsViVN,
            ...PickerViVN,
        },
        CascaderList: {
            empty: 'Không có',
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
