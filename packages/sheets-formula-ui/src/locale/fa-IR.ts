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
import array from './function-list/array/fa-IR';
import compatibility from './function-list/compatibility/fa-IR';
import cube from './function-list/cube/fa-IR';
import database from './function-list/database/fa-IR';
import date from './function-list/date/fa-IR';
import engineering from './function-list/engineering/fa-IR';
import financial from './function-list/financial/fa-IR';
import information from './function-list/information/fa-IR';
import logical from './function-list/logical/fa-IR';
import lookup from './function-list/lookup/fa-IR';
import math from './function-list/math/fa-IR';
import statistical from './function-list/statistical/fa-IR';
import text from './function-list/text/fa-IR';
import univer from './function-list/univer/fa-IR';
import web from './function-list/web/fa-IR';

const locale: typeof enUS = {
    shortcut: {
        'sheets-formula-ui': {
            'quick-sum': 'جمع سریع',
        },
    },
    formula: {
        insert: {
            tooltip: 'توابع',
            sum: 'SUM',
            average: 'AVERAGE',
            count: 'COUNT',
            max: 'MAX',
            min: 'MIN',
            more: 'توابع بیشتر...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
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
            pasteFormula: 'چسباندن فرمول',
        },
    },
};

export default locale;
