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
        toolbar: 'بحث واستبدال',
        shortcut: {
            'open-find-dialog': 'فتح مربع حوار البحث',
            'open-replace-dialog': 'فتح مربع حوار الاستبدال',
            'close-dialog': 'إغلاق مربع حوار البحث والاستبدال',
            'go-to-next-match': 'الانتقال إلى التطابق التالي',
            'go-to-previous-match': 'الانتقال إلى التطابق السابق',
            'focus-selection': 'تركيز التحديد',
            panel: 'بحث واستبدال',
        },
        dialog: {
            title: 'بحث',
            find: 'بحث',
            replace: 'استبدال',
            'replace-all': 'استبدال الكل',
            'case-sensitive': 'حساس لحالة الأحرف',
            'find-placeholder': 'البحث في هذه الورقة',
            'advanced-finding': 'بحث واستبدال متقدم',
            'replace-placeholder': 'أدخل نص الاستبدال',
            'match-the-whole-cell': 'تطابق الخلية بأكملها',
            'find-direction': {
                title: 'اتجاه البحث',
                row: 'البحث حسب الصف',
                column: 'البحث حسب العمود',
            },
            'find-scope': {
                title: 'نطاق البحث',
                'current-sheet': 'الورقة الحالية',
                workbook: 'المصنف',
            },
            'find-by': {
                title: 'البحث حسب',
                value: 'البحث حسب القيمة',
                formula: 'البحث في الصيغ',
            },
            'no-match': 'اكتمل البحث ولكن لم يتم العثور على أي تطابق.',
            'no-result': 'لا توجد نتائج',
        },
        replace: {
            'all-success': 'تم استبدال {0} تطابقات',
            'partial-success': 'تم استبدال {0} تطابقات، وتعذر استبدال {1}',
            'all-failure': 'فشل الاستبدال',
            confirm: {
                title: 'هل أنت متأكد من استبدال جميع التطابقات؟',
            },
        },
        button: {
            confirm: 'موافق',
            cancel: 'إلغاء',
        },
    },
};

export default locale;
