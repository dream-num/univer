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
        ribbon: {
            setCheckbox: 'تعيين خانة اختيار',
            clearCheckbox: 'مسح خانة الاختيار',
            dropdownPresetTitle: 'تطبيق إعداد مسبق:',
            editDropdown: 'تحرير الخيارات',
            clearDropdown: 'مسح القائمة المنسدلة',
            dateTime: 'التاريخ والوقت',
            presets: {
                yes: 'نعم',
                no: 'لا',
                notStarted: 'لم يبدأ',
                inProgress: 'قيد التنفيذ',
                completed: 'مكتمل',
                option1: 'الخيار 1',
                option2: 'الخيار 2',
            },
        },
        operators: {
            legal: 'نوع قانوني',
        },
        validFail: {
            formulaError: 'يحتوي نطاق المرجع على بيانات غير مرئية، يُرجى إعادة ضبط النطاق',
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
        date: {
            title: 'تاريخ',
        },
        list: {
            title: 'قائمة منسدلة',
            add: 'إضافة',
            options: 'خيارات',
            customOptions: 'مخصص',
            refOptions: 'من نطاق',
            edit: 'تحرير',
        },
        checkbox: {
            title: 'خانة اختيار',
            tips: 'استخدم قيمًا مخصصة داخل الخلايا',
            checked: 'القيمة المحددة',
            unchecked: 'القيمة غير المحددة',
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
