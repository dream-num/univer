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
    'sheets-conditional-formatting-ui': {
        title: 'التنسيق الشرطي',
        menu: {
            manageConditionalFormatting: 'إدارة التنسيق الشرطي',
            createConditionalFormatting: 'إنشاء تنسيق شرطي',
            clearRangeRules: 'مسح القواعد للنطاق المحدد',
            clearWorkSheetRules: 'مسح القواعد للورقة بأكملها',

        },
        form: {
            lessThan: 'يجب أن تكون القيمة أقل من {0}',
            lessThanOrEqual: 'يجب أن تكون القيمة أقل من أو تساوي {0}',
            greaterThan: 'يجب أن تكون القيمة أكبر من {0}',
            greaterThanOrEqual: 'يجب أن تكون القيمة أكبر من أو تساوي {0}',
            rangeSelector: 'حدد النطاق أو أدخل قيمة',
        },
        iconSet: {
            direction: 'الاتجاه',
            shape: 'الشكل',
            mark: 'العلامة',
            rank: 'الترتيب',
            rule: 'القاعدة',
            icon: 'الأيقونة',
            type: 'النوع',
            value: 'القيمة',
            reverseIconOrder: 'عكس ترتيب الأيقونات',
            and: 'و',
            when: 'عندما',
            onlyShowIcon: 'إظهار الأيقونة فقط',
            noCellIcon: 'بدون أيقونة خلية',
        },
        symbol: {
            greaterThan: '>',
            greaterThanOrEqual: '>=',
            lessThan: '<',
            lessThanOrEqual: '<=',
        },
        panel: {
            createRule: 'إنشاء قاعدة',
            clear: 'مسح كل القواعد',
            range: 'نطاق التطبيق',
            styleType: 'نوع النمط',
            submit: 'إرسال',
            cancel: 'إلغاء',
            rankAndAverage: 'الأعلى/الأدنى/المتوسط',
            styleRule: 'قاعدة النمط',
            isNotBottom: 'الأعلى',
            isBottom: 'الأدنى',
            greaterThanAverage: 'أكبر من المتوسط',
            lessThanAverage: 'أقل من المتوسط',
            medianValue: 'القيمة الوسيطة',
            fillType: 'نوع التعبئة',
            pureColor: 'لون ثابت',
            gradient: 'تدرج',
            colorSet: 'مجموعة الألوان',
            positive: 'إيجابي',
            native: 'سلبي',
            workSheet: 'الورقة بأكملها',
            selectedRange: 'النطاق المحدد',
            managerRuleSelect: 'إدارة قواعد {0}',
            onlyShowDataBar: 'إظهار أشرطة البيانات فقط',
        },
        preview: {
            describe: {
                beginsWith: 'يبدأ بـ {0}',
                endsWith: 'ينتهي بـ {0}',
                containsText: 'النص يحتوي على {0}',
                notContainsText: 'النص لا يحتوي على {0}',
                equal: 'يساوي {0}',
                notEqual: 'لا يساوي {0}',
                containsBlanks: 'يحتوي على فراغات',
                notContainsBlanks: 'لا يحتوي على فراغات',
                containsErrors: 'يحتوي على أخطاء',
                notContainsErrors: 'لا يحتوي على أخطاء',
                greaterThan: 'أكبر من {0}',
                greaterThanOrEqual: 'أكبر من أو يساوي {0}',
                lessThan: 'أقل من {0}',
                lessThanOrEqual: 'أقل من أو يساوي {0}',
                notBetween: 'ليست بين {0} و {1}',
                between: 'بين {0} و {1}',
                yesterday: 'أمس',
                tomorrow: 'غدًا',
                last7Days: 'آخر 7 أيام',
                thisMonth: 'هذا الشهر',
                lastMonth: 'الشهر الماضي',
                nextMonth: 'الشهر القادم',
                thisWeek: 'هذا الأسبوع',
                lastWeek: 'الأسبوع الماضي',
                nextWeek: 'الأسبوع القادم',
                today: 'اليوم',
                topN: 'أعلى {0}',
                bottomN: 'أدنى {0}',
                topNPercent: 'أعلى {0}%',
                bottomNPercent: 'أدنى {0}%',
            },
        },
        operator: {
            beginsWith: 'يبدأ بـ',
            endsWith: 'ينتهي بـ',
            containsText: 'النص يحتوي على',
            notContainsText: 'النص لا يحتوي على',
            equal: 'يساوي',
            notEqual: 'لا يساوي',
            containsBlanks: 'يحتوي على فراغات',
            notContainsBlanks: 'لا يحتوي على فراغات',
            containsErrors: 'يحتوي على أخطاء',
            notContainsErrors: 'لا يحتوي على أخطاء',
            greaterThan: 'أكبر من',
            greaterThanOrEqual: 'أكبر من أو يساوي',
            lessThan: 'أقل من',
            lessThanOrEqual: 'أقل من أو يساوي',
            notBetween: 'ليست بين',
            between: 'بين',
            yesterday: 'أمس',
            tomorrow: 'غدًا',
            last7Days: 'آخر 7 أيام',
            thisMonth: 'هذا الشهر',
            lastMonth: 'الشهر الماضي',
            nextMonth: 'الشهر القادم',
            thisWeek: 'هذا الأسبوع',
            lastWeek: 'الأسبوع الماضي',
            nextWeek: 'الأسبوع القادم',
            today: 'اليوم',
        },
        ruleType: {
            highlightCell: 'تمييز الخلية',
            dataBar: 'شريط البيانات',
            colorScale: 'مقياس الألوان',
            formula: 'صيغة مخصصة',
            iconSet: 'مجموعة أيقونات',
            duplicateValues: 'القيم المكررة',
            uniqueValues: 'القيم الفريدة',
        },
        subRuleType: {
            uniqueValues: 'القيم الفريدة',
            duplicateValues: 'القيم المكررة',
            rank: 'الترتيب',
            text: 'نص',
            timePeriod: 'فترة زمنية',
            number: 'رقم',
            average: 'متوسط',
        },
        valueType: {
            num: 'رقم',
            min: 'الحد الأدنى',
            max: 'الحد الأقصى',
            percent: 'نسبة مئوية',
            percentile: 'النسبة المئوية',
            formula: 'صيغة',
            none: 'لا شيء',
        },
        errorMessage: {
            notBlank: 'لا يمكن أن يكون الشرط فارغًا',
            formulaError: 'صيغة خاطئة',
            rangeError: 'تحديد غير صالح',
        },
        permission: {
            dialog: {
                setStyleErr: 'النطاق محمي، وليس لديك الإذن بتعيين الأنماط. لتعيين الأنماط، يُرجى التواصل مع المنشئ.',
            },
        },
    },
};

export default locale;
