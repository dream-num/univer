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
            'smart-toggle-filter-tooltip': 'تغییر حالت فیلتر',
            'clear-filter-criteria': 'پاک کردن شرایط فیلتر',
            're-calc-filter-conditions': 'بازمحاسبه شرایط فیلتر',
        },
        command: {
            'not-valid-filter-range': 'محدوده انتخاب شده فقط یک ردیف دارد و برای فیلتر معتبر نیست.',
        },
        shortcut: {
            'smart-toggle-filter': 'تغییر حالت فیلتر',
        },
        panel: {
            'clear-filter': 'پاک کردن فیلتر',
            cancel: 'انصراف',
            confirm: 'تایید',
            'by-values': 'بر اساس مقادیر',
            'by-conditions': 'بر اساس شرایط',
            'filter-only': 'فقط فیلتر',
            'search-placeholder': 'برای جداسازی کلیدواژه‌ها از فاصله استفاده کنید',
            'select-all': 'انتخاب همه',
            'input-values-placeholder': 'ورود مقادیر',
            and: 'و',
            or: 'یا',
            empty: '(خالی)',
            '?': 'برای نمایش یک کاراکتر از “?” استفاده کنید.',
            '*': 'برای نمایش چندین کاراکتر از “*” استفاده کنید.',
        },
        conditions: {
            none: 'هیچ کدام',
            empty: 'خالی است',
            'not-empty': 'خالی نیست',
            'text-contains': 'شامل متن است',
            'does-not-contain': 'شامل متن نیست',
            'starts-with': 'با متن شروع می‌شود',
            'ends-with': 'با متن پایان می‌یابد',
            equals: 'برابر است با',
            'greater-than': 'بزرگتر از',
            'greater-than-or-equal': 'بزرگتر از یا برابر با',
            'less-than': 'کوچکتر از',
            'less-than-or-equal': 'کوچکتر از یا برابر با',
            equal: 'برابر است با',
            'not-equal': 'برابر نیست با',
            between: 'بین',
            'not-between': 'بین نیست',
            custom: 'سفارشی',
        },
        msg: {
            'filter-header-forbidden': 'شما نمی‌توانید ردیف هدر یک فیلتر را جابه‌جا کنید.',
        },
        date: {
            1: 'ژانویه',
            2: 'فوریه',
            3: 'مارس',
            4: 'آوریل',
            5: 'مه',
            6: 'ژوئن',
            7: 'جولای',
            8: 'آگوست',
            9: 'سپتامبر',
            10: 'اکتبر',
            11: 'نوامبر',
            12: 'دسامبر',
        },
    },
};

export default locale;
