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
        operators: {
            legal: 'نوع قانونی است',
        },
        validFail: {
            value: 'لطفا یک مقدار وارد کنید',
            common: 'لطفا مقدار یا فرمول را وارد کنید',
            number: 'لطفا عدد یا فرمول را وارد کنید',
            formula: 'لطفا فرمول را وارد کنید',
            integer: 'لطفا عدد صحیح یا فرمول را وارد کنید',
            date: 'لطفا تاریخ یا فرمول را وارد کنید',
            list: 'لطفا گزینه‌ها را وارد کنید',
            listInvalid: 'منبع لیست باید یک لیست جدا شده یا یک مرجع به یک سطر یا ستون منفرد باشد',
            checkboxEqual: 'برای محتوای سلول‌های علامت‌دار و علامت‌گذاری نشده، مقادیر متفاوتی وارد کنید.',
            formulaError: 'محدوده مرجع حاوی داده‌های نامرئی است، لطفا محدوده را دوباره تنظیم کنید',
            listIntersects: 'محدوده انتخاب شده نمی‌تواند با دامنه قوانین تداخل داشته باشد',
            primitive: 'فرمول‌ها برای مقادیر سفارشی علامت‌دار و علامت‌گذاری نشده مجاز نیستند.',
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
        any: {
            title: 'هر مقدار',
            error: 'محتوای این سلول نقض قانون اعتبارسنجی است',
        },
        date: {
            title: 'تاریخ',
        },
        list: {
            title: 'لیست کشویی',
            name: 'مقدار شامل یکی از محدوده است',
            error: 'ورود باید در محدوده مشخص شده قرار گیرد',
            emptyError: 'لطفا یک مقدار وارد کنید',
            add: 'افزودن',
            dropdown: 'انتخاب',
            options: 'گزینه‌ها',
            customOptions: 'سفارشی',
            refOptions: 'از یک محدوده',
            formulaError: 'منبع لیست باید یک لیست جدا شده از داده‌ها یا یک مرجع به یک سطر یا ستون منفرد باشد.',
            edit: 'ویرایش',
        },
        listMultiple: {
            title: 'لیست کشویی چندگانه',
            dropdown: 'انتخاب چندگانه',
        },
        textLength: {
            title: 'طول متن',
        },
        decimal: {
            title: 'عدد',
        },
        whole: {
            title: 'عدد صحیح',
        },
        checkbox: {
            title: 'کادر انتخاب',
            error: 'محتوای این سلول با قانون اعتبارسنجی آن نقض می‌شود',
            tips: 'از مقادیر سفارشی در سلول‌ها استفاده کنید',
            checked: 'مقدار انتخاب شده',
            unchecked: 'مقدار انتخاب نشده',
        },
        custom: {
            title: 'فرمول سفارشی ',
            error: 'محتوای این سلول با قانون اعتبارسنجی آن نقض می‌شود',
            validFail: 'لطفا یک فرمول معتبر وارد کنید',
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
