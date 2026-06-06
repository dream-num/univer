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
        title: 'التحقق من صحة البيانات',
        operators: {
            legal: 'نوع قانوني',
        },
        validFail: {
            value: 'يُرجى إدخال قيمة',
            common: 'يُرجى إدخال قيمة أو صيغة',
            number: 'يُرجى إدخال رقم أو صيغة',
            formula: 'يُرجى إدخال صيغة',
            integer: 'يُرجى إدخال عدد صحيح أو صيغة',
            date: 'يُرجى إدخال تاريخ أو صيغة',
            list: 'يُرجى إدخال خيارات',
            listInvalid: 'يجب أن يكون مصدر القائمة قائمة مفصولة بالفواصل أو مرجعًا لصف أو عمود واحد',
            checkboxEqual: 'أدخل قيمًا مختلفة لمحتويات الخلية المحددة وغير المحددة.',
            formulaError: 'يحتوي نطاق المرجع على بيانات غير مرئية، يُرجى إعادة ضبط النطاق',
            listIntersects: 'لا يمكن أن يتقاطع النطاق المحدد مع نطاق القواعد',
            primitive: 'الصيغ غير مسموح بها للقيم المخصصة المحددة وغير المحددة.',
        },
        panel: {
            title: 'إدارة التحقق من صحة البيانات',
            addTitle: 'إنشاء تحقق جديد من صحة البيانات',
            removeAll: 'إزالة الكل',
            add: 'إضافة قاعدة',
            range: 'النطاقات',
            type: 'النوع',
            options: 'خيارات متقدمة',
            operator: 'المشغل',
            removeRule: 'إزالة',
            done: 'تم',
            formulaPlaceholder: 'يُرجى إدخال قيمة أو صيغة',
            valuePlaceholder: 'يُرجى إدخال قيمة',
            formulaAnd: 'و',
            invalid: 'غير صالح',
            showWarning: 'إظهار التحذير',
            rejectInput: 'رفض الإدخال',
            messageInfo: 'رسالة مساعدة',
            showInfo: 'إظهار نص المساعدة للخلية المحددة',
            rangeError: 'النطاقات غير قانونية',
            allowBlank: 'السماح بالقيم الفارغة',
        },
        any: {
            title: 'أي قيمة',
            error: 'محتوى هذه الخلية ينتهك قاعدة التحقق',
        },
        date: {
            title: 'تاريخ',
        },
        list: {
            title: 'قائمة منسدلة',
            name: 'القيمة تحتوي على واحدة من النطاق',
            error: 'يجب أن يكون الإدخال ضمن النطاق المحدد',
            emptyError: 'يُرجى إدخال قيمة',
            add: 'إضافة',
            dropdown: 'تحديد',
            options: 'خيارات',
            customOptions: 'مخصص',
            refOptions: 'من نطاق',
            formulaError: 'يجب أن يكون مصدر القائمة قائمة بيانات مفصولة بالفواصل، أو مرجعًا لصف أو عمود واحد.',
            edit: 'تحرير',
        },
        listMultiple: {
            title: 'قائمة منسدلة - متعددة',
            dropdown: 'تحديد متعدد',
        },
        textLength: {
            title: 'طول النص',
        },
        decimal: {
            title: 'رقم',
        },
        whole: {
            title: 'عدد صحيح',
        },
        checkbox: {
            title: 'خانة اختيار',
            error: 'محتوى هذه الخلية ينتهك قاعدة التحقق',
            tips: 'استخدم قيمًا مخصصة داخل الخلايا',
            checked: 'القيمة المحددة',
            unchecked: 'القيمة غير المحددة',
        },
        custom: {
            title: 'صيغة مخصصة',
            error: 'محتوى هذه الخلية ينتهك قاعدة التحقق',
            validFail: 'يُرجى إدخال صيغة صالحة',
        },
        alert: {
            title: 'خطأ',
            ok: 'موافق',
        },
        error: {
            title: 'غير صالح:',
        },
        renderMode: {
            arrow: 'سهم',
            chip: 'رقاقة',
            text: 'نص عادي',
            label: 'نمط العرض',
        },
        showTime: {
            label: 'إظهار منتقي الوقت',
        },
        permission: {
            dialog: {
                setStyleErr: 'النطاق محمي، وليس لديك الإذن بتعيين الأنماط. لتعيين الأنماط، يُرجى التواصل مع المنشئ.',
            },
        },
    },
};

export default locale;
