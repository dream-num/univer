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
    'sheets-numfmt-ui': {
        title: 'تنسيق الأرقام',
        numfmtType: 'أنواع التنسيق',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        general: 'عام',
        accounting: 'محاسبة',
        text: 'نص',
        number: 'رقم',
        percent: 'نسبة مئوية',
        scientific: 'علمي',
        currency: 'عملة',
        date: 'تاريخ',
        time: 'وقت',
        thousandthPercentile: 'فاصل الألوف',
        preview: 'معاينة',
        dateTime: 'التاريخ والوقت',
        decimalLength: 'المنازل العشرية',
        currencyType: 'رمز العملة',
        moreFmt: 'التنسيقات',
        financialValue: 'قيمة مالية',
        roundingCurrency: 'تقريب العملة',
        timeDuration: 'المدة الزمنية',
        currencyDes: 'يُستخدم تنسيق العملة لتمثيل قيم العملة العامة. يقوم تنسيق المحاسبة بمحاذاة عمود من القيم مع النقاط العشرية',
        accountingDes: 'يقوم تنسيق الأرقام المحاسبي بمحاذاة عمود من القيم مع رموز العملة والنقاط العشرية',
        dateType: 'نوع التاريخ',
        dateDes: 'يعرض تنسيق التاريخ قيم سلسلة التاريخ والوقت كقيم تاريخ.',
        negType: 'نوع العدد السالب',
        generalDes: 'لا يحتوي التنسيق العام على أي تنسيق رقم محدد.',
        thousandthPercentileDes: 'يُستخدم تنسيق النسبة المئوية لتمثيل الأرقام العادية. توفر تنسيقات العملة والمحاسبة تنسيقًا متخصصًا لحسابات قيم العملة.',
        addDecimal: 'زيادة المنازل العشرية',
        subtractDecimal: 'تقليل المنازل العشرية',
        customFormat: 'تنسيق مخصص',
        customFormatDes: 'إنشاء تنسيقات أرقام مخصصة استنادًا إلى التنسيقات الموجودة.',
        info: {
            error: 'خطأ',
            forceStringInfo: 'رقم مخزن كنص',
        },
    },
};

export default locale;
