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
    'find-replace': {
        toolbar: 'یافتن و جایگزینی',
        shortcut: {
            'open-find-dialog': 'باز کردن پنجره گفتگوی یافتن',
            'open-replace-dialog': 'باز کردن پنجره گفتگوی جایگزینی',
            'close-dialog': 'بستن پنجره گفتگوی یافتن و جایگزینی',
            'go-to-next-match': 'رفتن به تطابق بعدی',
            'go-to-previous-match': 'رفتن به تطابق قبلی',
            'focus-selection': 'تمرکز بر روی انتخاب',
        },
        dialog: {
            title: 'یافتن',
            find: 'یافتن',
            replace: 'جایگزینی',
            'replace-all': 'جایگزینی همه',
            'case-sensitive': 'حساس به حروف کوچک و بزرگ',
            'find-placeholder': 'یافتن در این برگ',
            'advanced-finding': 'جستجوی پیشرفته و جایگزینی',
            'replace-placeholder': 'ورود رشته جایگزین',
            'match-the-whole-cell': 'مطابقت با کل سلول',
            'find-direction': {
                title: 'جهت یافتن',
                row: 'جستجو بر اساس سطر',
                column: 'جستجو بر اساس ستون',
            },
            'find-scope': {
                title: 'محدوده یافتن',
                'current-sheet': 'برگ فعلی',
                workbook: 'کتاب کار',
            },
            'find-by': {
                title: 'یافتن بر اساس',
                value: 'یافتن بر اساس مقدار',
                formula: 'یافتن فرمول',
            },
            'no-match': 'یافتن تکمیل شد اما هیچ تطابقی یافت نشد.',
            'no-result': 'نتیجه‌ای وجود ندارد',
        },
        replace: {
            'all-success': 'همه {0} تطابق جایگزین شد',
            'all-failure': 'جایگزینی ناموفق بود',
            confirm: {
                title: 'آیا مطمئن هستید که همه تطابق‌ها را جایگزین کنید؟',
            },
        },
    },
    'find-replace-shortcuts': 'یافتن و جایگزینی',
};

export default locale;
