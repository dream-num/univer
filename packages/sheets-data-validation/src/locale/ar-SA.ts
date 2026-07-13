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
            between: 'بين',
            greaterThan: 'أكبر من',
            greaterThanOrEqual: 'أكبر من أو يساوي',
            lessThan: 'أقل من',
            lessThanOrEqual: 'أقل من أو يساوي',
            equal: 'يساوي',
            notEqual: 'لا يساوي',
            notBetween: 'ليس بين',
            legal: 'نوع قانوني',
        },
        ruleName: {
            between: 'بين {FORMULA1} و{FORMULA2}',
            greaterThan: 'أكبر من {FORMULA1}',
            greaterThanOrEqual: 'أكبر من أو يساوي {FORMULA1}',
            lessThan: 'أقل من {FORMULA1}',
            lessThanOrEqual: 'أقل من أو يساوي {FORMULA1}',
            equal: 'يساوي {FORMULA1}',
            notEqual: 'لا يساوي {FORMULA1}',
            notBetween: 'ليس بين {FORMULA1} و{FORMULA2}',
            legal: 'نوع قانوني {TYPE}',
        },
        errorMsg: {
            between: 'يجب أن تكون القيمة بين {FORMULA1} و{FORMULA2}',
            greaterThan: 'يجب أن تكون القيمة أكبر من {FORMULA1}',
            greaterThanOrEqual: 'يجب أن تكون القيمة أكبر من أو تساوي {FORMULA1}',
            lessThan: 'يجب أن تكون القيمة أقل من {FORMULA1}',
            lessThanOrEqual: 'يجب أن تكون القيمة أقل من أو تساوي {FORMULA1}',
            equal: 'يجب أن تكون القيمة تساوي {FORMULA1}',
            notEqual: 'يجب ألا تكون القيمة تساوي {FORMULA1}',
            notBetween: 'يجب ألا تكون القيمة بين {FORMULA1} و{FORMULA2}',
            legal: 'يجب أن تكون القيمة من نوع قانوني {TYPE}',
        },
        date: {
            operators: {
                between: 'بين',
                greaterThan: 'بعد',
                greaterThanOrEqual: 'في أو بعد',
                lessThan: 'قبل',
                lessThanOrEqual: 'في أو قبل',
                equal: 'يساوي',
                notEqual: 'لا يساوي',
                notBetween: 'ليس بين',
                legal: 'تاريخ قانوني',
            },
            ruleName: {
                between: 'بين {FORMULA1} و{FORMULA2}',
                greaterThan: 'بعد {FORMULA1}',
                greaterThanOrEqual: 'في أو بعد {FORMULA1}',
                lessThan: 'قبل {FORMULA1}',
                lessThanOrEqual: 'في أو قبل {FORMULA1}',
                equal: 'في {FORMULA1}',
                notEqual: 'ليس في {FORMULA1}',
                notBetween: 'ليس بين {FORMULA1} و{FORMULA2}',
                legal: 'تاريخ قانوني',
            },
            errorMsg: {
                between: 'يجب أن تكون القيمة تاريخًا قانونيًا وبين {FORMULA1} و{FORMULA2}',
                greaterThan: 'يجب أن تكون القيمة تاريخًا قانونيًا وبعد {FORMULA1}',
                greaterThanOrEqual: 'يجب أن تكون القيمة تاريخًا قانونيًا وفي أو بعد {FORMULA1}',
                lessThan: 'يجب أن تكون القيمة تاريخًا قانونيًا وقبل {FORMULA1}',
                lessThanOrEqual: 'يجب أن تكون القيمة تاريخًا قانونيًا وفي أو قبل {FORMULA1}',
                equal: 'يجب أن تكون القيمة تاريخًا قانونيًا وفي {FORMULA1}',
                notEqual: 'يجب أن تكون القيمة تاريخًا قانونيًا وليس في {FORMULA1}',
                notBetween: 'يجب أن تكون القيمة تاريخًا قانونيًا وليس بين {FORMULA1} و{FORMULA2}',
                legal: 'يجب أن تكون القيمة تاريخًا قانونيًا',
            },
            title: 'تاريخ',
        },
        textLength: {
            errorMsg: {
                between: 'يجب أن يكون طول النص بين {FORMULA1} و{FORMULA2}',
                greaterThan: 'يجب أن يكون طول النص أكبر من {FORMULA1}',
                greaterThanOrEqual: 'يجب أن يكون طول النص أكبر من أو يساوي {FORMULA1}',
                lessThan: 'يجب أن يكون طول النص أقل من {FORMULA1}',
                lessThanOrEqual: 'يجب أن يكون طول النص أقل من أو يساوي {FORMULA1}',
                equal: 'يجب أن يكون طول النص يساوي {FORMULA1}',
                notEqual: 'يجب ألا يكون طول النص يساوي {FORMULA1}',
                notBetween: 'يجب ألا يكون طول النص بين {FORMULA1} و{FORMULA2}',
            },
            title: 'طول النص',
        },
        custom: {
            ruleName: 'الصيغة المخصصة هي {FORMULA1}',
            title: 'صيغة مخصصة',
            validFail: 'يرجى إدخال صيغة صالحة',
            error: 'محتويات هذه الخلية تنتهك قاعدة التحقق',
        },
        validFail: {
            value: 'يرجى إدخال قيمة',
            common: 'يرجى إدخال قيمة أو صيغة',
            number: 'يرجى إدخال رقم أو صيغة',
            formula: 'يرجى إدخال صيغة',
            integer: 'يرجى إدخال عدد صحيح أو صيغة',
            date: 'يرجى إدخال تاريخ أو صيغة',
            list: 'يرجى إدخال خيارات',
            listInvalid: 'يجب أن يكون مصدر القائمة قائمة محددة بفواصل أو مرجعًا لصف أو عمود واحد',
            checkboxEqual: 'أدخل قيمًا مختلفة لمحتويات الخلية المحددة وغير المحددة.',
            formulaError: 'يحتوي نطاق المرجع على بيانات غير مرئية، يرجى إعادة ضبط النطاق',
            listIntersects: 'لا يمكن أن يتقاطع النطاق المحدد مع نطاق القواعد',
            primitive: 'غير مسموح بالصيغ لقيم المحدد وغير المحدد المخصصة.',
        },
        any: {
            title: 'أي قيمة',
            error: 'محتوى هذه الخلية ينتهك قاعدة التحقق',
        },
        list: {
            title: 'قائمة منسدلة',
            name: 'القيمة تحتوي على واحدة من النطاق',
            error: 'يجب أن يكون الإدخال ضمن النطاق المحدد',
            emptyError: 'يرجى إدخال قيمة',
            add: 'إضافة',
            dropdown: 'تحديد',
            options: 'خيارات',
            customOptions: 'مخصص',
            refOptions: 'من نطاق',
            formulaError: 'يجب أن يكون مصدر القائمة قائمة بيانات محددة بفواصل، أو مرجعًا لصف أو عمود واحد.',
            edit: 'تحرير',
        },
        listMultiple: {
            title: 'قائمة منسدلة - متعددة',
            dropdown: 'تحديد متعدد',
        },
        decimal: {
            title: 'رقم',
        },
        whole: {
            title: 'عدد صحيح',
        },
        checkbox: {
            title: 'خانة اختيار',
            error: 'محتويات هذه الخلية تنتهك قاعدة التحقق',
            tips: 'استخدم قيمًا مخصصة داخل الخلايا',
            checked: 'القيمة المحددة',
            unchecked: 'القيمة غير المحددة',
        },
    },
};

export default locale;
