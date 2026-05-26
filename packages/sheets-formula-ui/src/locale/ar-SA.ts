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
            'quick-sum': 'مجموع سريع',
        },

        insert: {
            tooltip: 'دوال',
            common: 'دوال شائعة',
        },
        prompt: {
            helpExample: 'مثال',
            helpAbstract: 'نبذة',
            required: 'مطلوب.',
            optional: 'اختياري.',
        },
        error: {
            title: 'خطأ',
            divByZero: 'خطأ القسمة على صفر',
            name: 'خطأ اسم غير صالح',
            value: 'خطأ في القيمة',
            num: 'خطأ رقمي',
            na: 'خطأ القيمة غير متوفرة',
            cycle: 'خطأ المرجع الدائري',
            ref: 'خطأ مرجع خلية غير صالح',
            spill: 'نطاق التدفق ليس فارغًا',
            calc: 'خطأ حسابي',
            error: 'خطأ',
            connect: 'جارٍ الحصول على البيانات',
            null: 'خطأ فارغ',
        },

        functionType: {
            financial: 'مالي',
            date: 'التاريخ والوقت',
            math: 'الرياضيات والمثلثات',
            statistical: 'إحصائي',
            lookup: 'البحث والمرجع',
            database: 'قاعدة بيانات',
            text: 'نص',
            logical: 'منطقي',
            information: 'معلومات',
            engineering: 'هندسي',
            cube: 'مكعب',
            compatibility: 'التوافق',
            web: 'ويب',
            array: 'مصفوفة',
            univer: 'Univer',
            user: 'معرّف من قبل المستخدم',
            definedname: 'اسم معرّف',
        },
        moreFunctions: {
            confirm: 'تأكيد',
            prev: 'السابق',
            next: 'التالي',
            searchFunctionPlaceholder: 'البحث عن دالة',
            allFunctions: 'كل الدوال',
            syntax: 'الصيغة',
        },
        operation: {
            copyFormulaOnly: 'نسخ الصيغة فقط',
            pasteFormula: 'لصق الصيغة',
        },

        rangeSelector: {
            title: 'تحديد نطاق بيانات',
            addAnotherRange: 'إضافة نطاق',
            buttonTooltip: 'تحديد نطاق بيانات',
            placeHolder: 'تحديد نطاق أو إدخاله.',
            confirm: 'تأكيد',
            cancel: 'إلغاء',
        },
    },
};

export default locale;
