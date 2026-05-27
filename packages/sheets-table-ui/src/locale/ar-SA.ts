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
    'sheets-table-ui': {
        title: 'جدول',
        selectRange: 'حدد نطاق الجدول',
        rename: 'إعادة تسمية الجدول',
        renamePlaceholder: 'أدخل اسم الجدول',
        updateRange: 'تحديث نطاق الجدول',
        tableRangeWithMergeError: 'لا يمكن أن يتداخل نطاق الجدول مع الخلايا المدمجة',
        tableRangeWithOtherTableError: 'لا يمكن أن يتداخل نطاق الجدول مع جداول أخرى',
        tableRangeSingleRowError: 'لا يمكن أن يكون نطاق الجدول صفًا واحدًا',
        updateError: 'لا يمكن تعيين نطاق الجدول إلى منطقة لا تتداخل مع النطاق الأصلي ولا تقع في نفس الصف',
        tableStyle: 'نمط الجدول',
        defaultStyle: 'النمط الافتراضي',
        customStyle: 'نمط مخصص',
        customTooMore: 'عدد السمات المخصصة يتجاوز الحد الأقصى، يُرجى حذف بعض السمات غير الضرورية وإضافتها مرة أخرى',
        setTheme: 'تعيين سمة الجدول',
        removeTable: 'إزالة الجدول',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        header: 'رأس',
        footer: 'تذييل',
        firstLine: 'السطر الأول',
        secondLine: 'السطر الثاني',
        columnPrefix: 'عمود',
        tablePrefix: 'جدول',
        tableNameError: 'لا يمكن أن يحتوي اسم الجدول على مسافات، ولا يمكن أن يبدأ برقم، ولا يمكن أن يكون مطابقًا لاسم جدول موجود',
        columnMenu: {
            'insert-left': 'إدراج عمود جدول إلى اليسار',
            'insert-right': 'إدراج عمود جدول إلى اليمين',
            delete: 'حذف عمود الجدول',
        },

        sort: {
            'sort-asc': 'تصاعدي',
            'sort-desc': 'تنازلي',
        },

        insert: {
            main: 'إدراج جدول',
            row: 'إدراج صف جدول',
            col: 'إدراج عمود جدول',
        },

        remove: {
            main: 'إزالة الجدول',
            row: 'إزالة صف الجدول',
            col: 'إزالة عمود الجدول',
        },
        condition: {
            string: 'نص',
            number: 'رقم',
            date: 'تاريخ',

            empty: '(فارغ)',
        },
        string: {
            compare: {
                equal: 'يساوي',
                notEqual: 'لا يساوي',
                contains: 'يحتوي على',
                notContains: 'لا يحتوي على',
                startsWith: 'يبدأ بـ',
                endsWith: 'ينتهي بـ',
            },
        },
        number: {
            compare: {
                equal: 'يساوي',
                notEqual: 'لا يساوي',
                greaterThan: 'أكبر من',
                greaterThanOrEqual: 'أكبر من أو يساوي',
                lessThan: 'أقل من',
                lessThanOrEqual: 'أقل من أو يساوي',
                between: 'بين',
                notBetween: 'ليست بين',
                above: 'أعلى',
                below: 'أدنى',
                topN: 'أعلى {0}',
            },
        },
        date: {
            compare: {
                equal: 'يساوي',
                notEqual: 'لا يساوي',
                after: 'بعد',
                afterOrEqual: 'بعد أو يساوي',
                before: 'قبل',
                beforeOrEqual: 'قبل أو يساوي',
                between: 'بين',
                notBetween: 'ليست بين',
                today: 'اليوم',
                yesterday: 'أمس',
                tomorrow: 'غدًا',
                thisWeek: 'هذا الأسبوع',
                lastWeek: 'الأسبوع الماضي',
                nextWeek: 'الأسبوع القادم',
                thisMonth: 'هذا الشهر',
                lastMonth: 'الشهر الماضي',
                nextMonth: 'الشهر القادم',
                thisQuarter: 'هذا الربع',
                lastQuarter: 'الربع الماضي',
                nextQuarter: 'الربع القادم',
                thisYear: 'هذه السنة',
                nextYear: 'السنة القادمة',
                lastYear: 'السنة الماضية',
                quarter: 'حسب الربع',
                month: 'حسب الشهر',
                q1: 'الربع الأول',
                q2: 'الربع الثاني',
                q3: 'الربع الثالث',
                q4: 'الربع الرابع',
                m1: 'يناير',
                m2: 'فبراير',
                m3: 'مارس',
                m4: 'أبريل',
                m5: 'مايو',
                m6: 'يونيو',
                m7: 'يوليو',
                m8: 'أغسطس',
                m9: 'سبتمبر',
                m10: 'أكتوبر',
                m11: 'نوفمبر',
                m12: 'ديسمبر',
            },
        },
        filter: {
            'by-values': 'حسب القيم',
            'by-conditions': 'حسب الشروط',
            'clear-filter': 'مسح التصفية',
            cancel: 'إلغاء',
            confirm: 'تأكيد',
            'search-placeholder': 'استخدم المسافة لفصل الكلمات المفتاحية',
            'select-all': 'تحديد الكل',
        },
    },
};

export default locale;
