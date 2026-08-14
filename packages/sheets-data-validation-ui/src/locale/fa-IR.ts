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
    'sheets-data-validation-ui': {
        title: 'اعتبارسنجی داده',
        ribbon: {
            setCheckbox: 'تنظیم کادر انتخاب',
            clearCheckbox: 'پاک کردن کادر انتخاب',
            dropdownPresetTitle: 'اعمال یک پیش‌تنظیم:',
            editDropdown: 'ویرایش گزینه‌ها',
            clearDropdown: 'پاک کردن فهرست کشویی',
            dateTime: 'تاریخ و زمان',
            presets: {
                yes: 'بله',
                no: 'خیر',
                notStarted: 'شروع نشده',
                inProgress: 'در حال انجام',
                completed: 'تکمیل‌شده',
                option1: 'گزینه ۱',
                option2: 'گزینه ۲',
            },
        },
        operators: {
            legal: 'نوع قانونی است',
        },
        validFail: {
            formulaError: 'محدوده مرجع حاوی داده‌های نامرئی است، لطفا محدوده را دوباره تنظیم کنید',
        },
        panel: {
            title: 'مدیریت اعتبارسنجی داده',
            addTitle: 'ایجاد اعتبارسنجی داده جدید',
            removeAll: 'حذف همه',
            add: 'افزودن قانون',
            range: 'محدوده‌ها',
            type: 'نوع',
            options: 'گزینه‌های پیشرفته',
            operator: 'عملگر',
            removeRule: 'حذف',
            done: 'انجام شد',
            formulaPlaceholder: 'لطفا مقدار یا فرمول را وارد کنید',
            valuePlaceholder: 'لطفا مقدار را وارد کنید',
            formulaAnd: 'و',
            invalid: 'نامعتبر',
            showWarning: 'نمایش هشدار',
            rejectInput: 'رد ورودی',
            messageInfo: 'پیام راهنما',
            showInfo: 'نمایش متن راهنما برای یک سلول انتخاب شده',
            rangeError: 'محدوده‌ها نامعتبر هستند',
            allowBlank: 'رد سلول خالی',
        },
        date: {
            title: 'تاریخ',
        },
        list: {
            title: 'لیست کشویی',
            add: 'افزودن',
            options: 'گزینه‌ها',
            customOptions: 'سفارشی',
            refOptions: 'از یک محدوده',
            edit: 'ویرایش',
        },
        checkbox: {
            title: 'کادر انتخاب',
            tips: 'از مقادیر سفارشی در سلول‌ها استفاده کنید',
            checked: 'مقدار انتخاب شده',
            unchecked: 'مقدار انتخاب نشده',
        },
        alert: {
            title: 'خطا',
            ok: 'باشه',
        },
        error: {
            title: 'نامعتبر:',
        },
        renderMode: {
            arrow: 'فلش',
            chip: 'چیپ',
            text: 'متن ساده',
            label: 'سبک نمایش',
        },
        showTime: {
            label: 'نمایش انتخاب زمان',
        },
        permission: {
            dialog: {
                setStyleErr: 'محدوده محافظت شده است و شما مجوز تنظیم سبک‌ها را ندارید. برای تنظیم سبک‌ها، لطفا با سازنده تماس بگیرید.',
            },
        },
    },
};

export default locale;
