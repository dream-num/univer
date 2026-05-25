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
    'sheets-data-validation': {
        operators: {
            between: 'بین',
            greaterThan: 'بزرگتر از',
            greaterThanOrEqual: 'بزرگتر از یا برابر با',
            lessThan: 'کوچکتر از',
            lessThanOrEqual: 'کوچکتر از یا برابر با',
            equal: 'برابر با',
            notEqual: 'نابرابر با',
            notBetween: 'بین نیست',
            legal: 'نوع قانونی است',
        },
        ruleName: {
            between: 'بین {FORMULA1} و {FORMULA2} است',
            greaterThan: 'بزرگتر از {FORMULA1} است',
            greaterThanOrEqual: 'بزرگتر از یا برابر با {FORMULA1} است',
            lessThan: 'کوچکتر از {FORMULA1} است',
            lessThanOrEqual: 'کوچکتر از یا برابر با {FORMULA1} است',
            equal: 'برابر است با {FORMULA1}',
            notEqual: 'برابر نیست با {FORMULA1}',
            notBetween: 'بین {FORMULA1} و {FORMULA2} نیست',
            legal: 'یک {TYPE} قانونی است',
        },
        errorMsg: {
            between: 'مقدار باید بین {FORMULA1} و {FORMULA2} باشد',
            greaterThan: 'مقدار باید بزرگتر از {FORMULA1} باشد',
            greaterThanOrEqual: 'مقدار باید بزرگتر از یا برابر با {FORMULA1} باشد',
            lessThan: 'مقدار باید کوچکتر از {FORMULA1} باشد',
            lessThanOrEqual: 'مقدار باید کوچکتر از یا برابر با {FORMULA1} باشد',
            equal: 'مقدار باید برابر با {FORMULA1} باشد',
            notEqual: 'مقدار باید برابر نیست با {FORMULA1}',
            notBetween: 'مقدار باید بین {FORMULA1} و {FORMULA2} نباشد',
            legal: 'مقدار باید یک {TYPE} قانونی باشد',
        },
        date: {
            operators: {
                between: 'بین',
                greaterThan: 'بعد از',
                greaterThanOrEqual: 'روی یا بعد از',
                lessThan: 'قبل از',
                lessThanOrEqual: 'روی یا قبل از',
                equal: 'برابر است با',
                notEqual: 'برابر نیست با',
                notBetween: 'بین ... و ... نیست',
                legal: 'یک تاریخ قانونی است',
            },
            ruleName: {
                between: 'بین {FORMULA1} و {FORMULA2} است',
                greaterThan: 'بعد از {FORMULA1} است',
                greaterThanOrEqual: 'روی یا بعد از {FORMULA1} است',
                lessThan: 'قبل از {FORMULA1} است',
                lessThanOrEqual: 'روی یا قبل از {FORMULA1} است',
                equal: 'برابر است با {FORMULA1}',
                notEqual: 'برابر نیست با {FORMULA1}',
                notBetween: 'بین {FORMULA1} و {FORMULA2} نیست',
                legal: 'یک تاریخ قانونی است',
            },
            errorMsg: {
                between: 'مقدار باید یک تاریخ معتبر و بین {FORMULA1} و {FORMULA2} باشد',
                greaterThan: 'مقدار باید یک تاریخ معتبر و بعد از {FORMULA1} باشد',
                greaterThanOrEqual: 'مقدار باید یک تاریخ معتبر و روی یا بعد از {FORMULA1} باشد',
                lessThan: 'مقدار باید یک تاریخ معتبر و قبل از {FORMULA1} باشد',
                lessThanOrEqual: 'مقدار باید یک تاریخ معتبر و روی یا قبل از {FORMULA1} باشد',
                equal: 'مقدار باید یک تاریخ معتبر و {FORMULA1} باشد',
                notEqual: 'مقدار باید یک تاریخ معتبر و نه {FORMULA1} باشد',
                notBetween: 'مقدار باید یک تاریخ معتبر و بین {FORMULA1} و {FORMULA2} نباشد',
                legal: 'مقدار باید یک تاریخ قانونی باشد',
            },
            title: 'تاریخ',
        },
        textLength: {
            errorMsg: {
                between: 'طول متن باید بین {FORMULA1} و {FORMULA2} باشد',
                greaterThan: 'طول متن باید بعد از {FORMULA1} باشد',
                greaterThanOrEqual: 'طول متن باید روی یا بعد از {FORMULA1} باشد',
                lessThan: 'طول متن باید قبل از {FORMULA1} باشد',
                lessThanOrEqual: 'طول متن باید روی یا قبل از {FORMULA1} باشد',
                equal: 'طول متن باید {FORMULA1} باشد',
                notEqual: 'طول متن باید {FORMULA1} نباشد',
                notBetween: 'طول متن باید بین {FORMULA1} و {FORMULA2} نباشد',
            },
            title: 'طول متن',
        },
        custom: {
            ruleName: 'فرمول سفارشی {FORMULA1}',
            title: 'فرمول سفارشی ',
            validFail: 'لطفا یک فرمول معتبر وارد کنید',
            error: 'محتوای این سلول با قانون اعتبارسنجی آن نقض می‌شود',
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
        any: {
            title: 'هر مقدار',
            error: 'محتوای این سلول نقض قانون اعتبارسنجی است',
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
    },
};

export default locale;
