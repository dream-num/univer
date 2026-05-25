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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'جمع سریع',
        },

        insert: {
            tooltip: 'توابع',
            common: 'توابع پرکاربرد',
        },
        prompt: {
            helpExample: 'مثال',
            helpAbstract: 'درباره',
            required: 'ضروری.',
            optional: 'اختیاری.',
        },
        error: {
            title: 'خطا',
            divByZero: 'خطای تقسیم بر صفر',
            name: 'خطای نام نامعتبر',
            value: 'خطا در مقدار',
            num: 'خطای عدد',
            na: 'خطای مقدار موجود نیست',
            cycle: 'خطای مرجع دوره‌ای',
            ref: 'خطای مرجع سلول نامعتبر',
            spill: 'دامنه ریزش خالی نیست',
            calc: 'خطای محاسبه',
            error: 'خطا',
            connect: 'در حال دریافت داده‌ها',
            null: 'خطای تهی',
        },

        functionType: {
            financial: 'مالی',
            date: 'تاریخ و زمان',
            math: 'ریاضی و مثلثاتی',
            statistical: 'آماری',
            lookup: 'جستجو و مرجع',
            database: 'پایگاه داده',
            text: 'متن',
            logical: 'منطقی',
            information: 'اطلاعاتی',
            engineering: 'مهندسی',
            cube: 'مکعب',
            compatibility: 'سازگاری',
            web: 'وب',
            array: 'آرایه',
            univer: 'Univer',
            user: 'تعریف شده توسط کاربر',
            definedname: 'نام تعریف شده',
        },
        moreFunctions: {
            confirm: 'تایید',
            prev: 'قبلی',
            next: 'بعدی',
            searchFunctionPlaceholder: 'جستجوی تابع',
            allFunctions: 'همه توابع',
            syntax: 'سینتکس',
        },
        operation: {
            copyFormulaOnly: 'کپی فقط فرمول',
            pasteFormula: 'چسباندن فرمول',
        },

        rangeSelector: {
            title: 'انتخاب محدوده داده',
            addAnotherRange: 'افزودن محدوده',
            buttonTooltip: 'انتخاب محدوده داده',
            placeHolder: 'انتخاب محدوده یا وارد کردن.',
            confirm: 'تایید',
            cancel: 'انصراف',
        },
    },
};

export default locale;
