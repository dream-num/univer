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
import dajsFaIR from 'dayjs/locale/fa';
import PickerFaIR from 'rc-picker/lib/locale/fa_IR';

const locale: typeof enUS = {
    design: {
        Confirm: {
            cancel: 'لغو',
            confirm: 'باشه',
        },
        Picker: {
            ...dajsFaIR,
            ...PickerFaIR,
        },
        CascaderList: {
            empty: 'هیچ کدام',
        },
        Calendar: {
            year: 'سال',
            weekDays: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
            months: [
                'فروردین',
                'اردیبهشت',
                'خرداد',
                'تیر',
                'مرداد',
                'شهریور',
                'مهر',
                'آبان',
                'آذر',
                'دی',
                'بهمن',
                'اسفند',
            ],
        },
        Select: {
            empty: 'هیچ‌کدام',
        },
        ColorPicker: {
            more: 'رنگ‌های بیشتر',
            cancel: 'لغو',
            confirm: 'باشه',
        },
    },
};

export default locale;
