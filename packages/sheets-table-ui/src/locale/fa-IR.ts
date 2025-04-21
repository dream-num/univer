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

const locale = {
    'sheets-table': {
        title: 'جدول',
        selectRange: 'انتخاب محدوده جدول',
        rename: 'تغییر نام جدول',
        updateRange: 'به‌روزرسانی محدوده جدول',
        tableRangeWithMergeError: 'محدوده جدول نمی‌تواند با سلول‌های ادغام‌شده همپوشانی داشته باشد',
        tableRangeWithOtherTableError: 'محدوده جدول نمی‌تواند با جداول دیگر همپوشانی داشته باشد',
        tableRangeSingleRowError: 'محدوده جدول نمی‌تواند یک ردیف منفرد باشد',
        updateError: 'نمی‌توان محدوده جدول را به منطقه‌ای که با اصل همپوشانی ندارد و در یک ردیف نیست تنظیم کرد',
        tableStyle: 'سبک جدول',
        defaultStyle: 'سبک پیش‌فرض',
        customStyle: 'سبک سفارشی',
        customTooMore: 'تعداد تم‌های سفارشی از حد مجاز فراتر رفته است، لطفاً برخی از تم‌های غیرضروری را حذف کرده و دوباره اضافه کنید',
        setTheme: 'تنظیم قالب جدول',
        removeTable: 'حذف جدول',
        cancel: 'لغو',
        confirm: 'تأیید',
        header: 'سربرگ',
        footer: 'پاورقی',
        firstLine: 'خط اول',
        secondLine: 'خط دوم',
        columnPrefix: 'ستون',
        tablePrefix: 'جدول',

        insert: {
            main: 'درج جدول',
            row: 'درج ردیف جدول',
            col: 'درج ستون جدول',
        },

        remove: {
            main: 'حذف جدول',
            row: 'حذف ردیف جدول',
            col: 'حذف ستون جدول',
        },

        condition: {
            string: 'متن',
            number: 'عدد',
            date: 'تاریخ',

            empty: '(خالی)',

        },
        string: {
            compare: {
                equal: 'برابر است با',
                notEqual: 'برابر نیست با',
                contains: 'شامل است',
                notContains: 'شامل نیست',
                startsWith: 'شروع می‌شود با',
                endsWith: 'پایان می‌یابد با',
            },
        },
        number: {
            compare: {
                equal: 'برابر است با',
                notEqual: 'برابر نیست با',
                greaterThan: 'بزرگتر از',
                greaterThanOrEqual: 'بزرگتر یا مساوی با',
                lessThan: 'کوچکتر از',
                lessThanOrEqual: 'کوچکتر یا مساوی با',
                between: 'بین',
                notBetween: 'خارج از محدوده',
                above: 'بالاتر از',
                below: 'پایین‌تر از',
                topN: 'برترین {0}',
            },
        },
        date: {
            compare: {
                equal: 'برابر است با',
                notEqual: 'برابر نیست با',
                after: 'بعد از',
                afterOrEqual: 'بعد یا برابر با',
                before: 'قبل از',
                beforeOrEqual: 'قبل یا برابر با',
                between: 'بین',
                notBetween: 'خارج از محدوده',
                today: 'امروز',
                yesterday: 'دیروز',
                tomorrow: 'فردا',
                thisWeek: 'این هفته',
                lastWeek: 'هفته گذشته',
                nextWeek: 'هفته آینده',
                thisMonth: 'این ماه',
                lastMonth: 'ماه گذشته',
                nextMonth: 'ماه آینده',
                thisQuarter: 'این سه‌ماهه',
                lastQuarter: 'سه‌ماهه گذشته',
                nextQuarter: 'سه‌ماهه آینده',
                thisYear: 'امسال',
                nextYear: 'سال آینده',
                lastYear: 'سال گذشته',
                quarter: 'بر اساس سه‌ماهه',
                month: 'بر اساس ماه',
                q1: 'سه‌ماهه اول',
                q2: 'سه‌ماهه دوم',
                q3: 'سه‌ماهه سوم',
                q4: 'سه‌ماهه چهارم',
                m1: 'ژانویه',
                m2: 'فوریه',
                m3: 'مارس',
                m4: 'آوریل',
                m5: 'مه',
                m6: 'ژوئن',
                m7: 'ژوئیه',
                m8: 'اوت',
                m9: 'سپتامبر',
                m10: 'اکتبر',
                m11: 'نوامبر',
                m12: 'دسامبر',
            },
        },
    },
};

export default locale;
