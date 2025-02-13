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

import array from './function-list/array/en-US';
import compatibility from './function-list/compatibility/en-US';
import cube from './function-list/cube/en-US';
import database from './function-list/database/en-US';
import date from './function-list/date/en-US';
import engineering from './function-list/engineering/en-US';
import financial from './function-list/financial/en-US';
import information from './function-list/information/en-US';
import logical from './function-list/logical/en-US';
import lookup from './function-list/lookup/en-US';
import math from './function-list/math/en-US';
import statistical from './function-list/statistical/en-US';
import text from './function-list/text/en-US';
import univer from './function-list/univer/en-US';
import web from './function-list/web/en-US';

export default {
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
