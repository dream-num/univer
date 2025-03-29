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
    sheet: {
        numfmt: {
            title: 'قالب‌بندی عدد',
            numfmtType: 'انواع قالب‌بندی',
            cancel: 'انصراف',
            confirm: 'تایید',
            general: 'عمومی',
            accounting: 'حسابداری',
            text: 'متن',
            number: 'عدد',
            percent: 'درصد',
            scientific: 'علمی',
            currency: 'ارز',
            date: 'تاریخ',
            time: 'زمان',
            thousandthPercentile: 'جداساز هزارتایی',
            preview: 'پیش‌نمایش',
            dateTime: 'تاریخ و زمان',
            decimalLength: 'اعشار',
            currencyType: 'نماد ارز',
            moreFmt: 'قالب‌ها',
            financialValue: 'مقدار مالی',
            roundingCurrency: 'گرد کردن ارز',
            timeDuration: 'مدت زمان',
            currencyDes: 'قالب‌بندی ارز برای نمایش مقادیر عمومی ارز استفاده می‌شود. قالب‌بندی حسابداری ستونی از مقادیر را با اعشار تراز می‌کند.',
            accountingDes: 'قالب‌بندی عددی حسابداری ستونی از مقادیر را با نمادهای ارز و اعشار تراز می‌کند.',
            dateType: 'نوع تاریخ',
            dateDes: 'قالب‌بندی تاریخ مقادیر سری تاریخ و زمان را به عنوان مقادیر تاریخ ارائه می‌دهد.',
            negType: 'نوع عدد منفی',
            generalDes: 'قالب‌بندی معمولی حاوی هیچ قالب‌بندی عدد خاصی نیست.',
            thousandthPercentileDes: 'قالب‌بندی درصدی برای نمایش اعداد معمولی استفاده می‌شود. قالب‌بندی‌های پولی و حسابداری قالب تخصصی برای محاسبات مقدار پولی ارائه می‌دهند.',
            addDecimal: 'افزایش اعشار',
            subtractDecimal: 'کاهش اعشار',
            customFormat: 'قالب‌بندی سفارشی',
            customFormatDes: 'ایجاد قالب‌بندی‌های عددی سفارشی بر اساس قالب‌بندی‌های موجود.',
        },
    },
};

export default locale;
