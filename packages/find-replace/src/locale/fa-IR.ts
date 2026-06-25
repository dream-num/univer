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
    'find-replace': {
        toolbar: 'یافتن و جایگزینی',
        shortcut: {
            'open-find-dialog': 'باز کردن پنجره جستجو',
            'open-replace-dialog': 'باز کردن پنجره جایگزینی',
            'close-dialog': 'بستن پنجره جستجو و جایگزینی',
            'go-to-next-match': 'رفتن به مورد تطابق بعدی',
            'go-to-previous-match': 'رفتن به مورد تطابق قبلی',
            'focus-selection': 'تمرکز بر انتخاب',
            panel: 'یافتن و جایگزینی',
        },
        dialog: {
            title: 'جستجو',
            find: 'جستجو',
            replace: 'جایگزینی',
            'replace-all': 'جایگزینی همه',
            'case-sensitive': 'حساس به حروف بزرگ و کوچک',
            'find-placeholder': 'جستجو در این شیت',
            'advanced-finding': 'جستجو و جایگزینی پیشرفته',
            'replace-placeholder': 'رشته جایگزینی را وارد کنید',
            'match-the-whole-cell': 'تطابق کل سلول',
            'find-direction': {
                title: 'جهت جستجو',
                row: 'جستجو بر اساس ردیف',
                column: 'جستجو بر اساس ستون',
            },
            'find-scope': {
                title: 'محدوده جستجو',
                'current-sheet': 'شیت فعلی',
                workbook: 'کتاب کار',
            },
            'find-by': {
                title: 'جستجو بر اساس',
                value: 'جستجو بر اساس مقدار',
                formula: 'جستجوی فرمول',
            },
            'no-match': 'جستجو تکمیل شد اما هیچ تطابقی یافت نشد.',
            'no-result': 'بدون نتیجه',
        },
        replace: {
            'all-success': 'همه {0} مورد تطابق جایگزین شدند',
            'partial-success': '{0} مورد تطابق جایگزین شد، جایگزینی {1} مورد ناموفق بود',
            'all-failure': 'جایگزینی ناموفق بود',
            confirm: {
                title: 'آیا مطمئن هستید که می‌خواهید همه موارد تطابق را جایگزین کنید؟',
            },
        },
        button: {
            confirm: 'تایید',
            cancel: 'انصراف',
        },
    },
};

export default locale;
