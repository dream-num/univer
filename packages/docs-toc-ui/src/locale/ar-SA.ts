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
    'docs-toc-ui': {
        tableOfContents: {
            title: 'جدول المحتويات',
            insertTitle: 'جدول المحتويات',
            automaticTitle: 'جدول تلقائي',
            customTitle: 'جدول محتويات مخصص…',
            contentsTitle: 'المحتويات',
            levels: 'إظهار المستويات',
            showPageNumbers: 'إظهار أرقام الصفحات',
            rightAlignPageNumbers: 'محاذاة أرقام الصفحات إلى اليمين',
            tabLeader: 'حرف تعبئة علامات الجدولة',
            leaderNone: 'بلا',
            leaderDots: 'نقاط',
            leaderDashes: 'شرطات',
            leaderUnderline: 'تسطير',
            format: 'التنسيقات',
            formatFromTemplate: 'من القالب',
            formatClassic: 'كلاسيكي',
            formatModern: 'حديث',
            formatSimple: 'بسيط',
            preview: 'معاينة الطباعة',
            previewHeading: 'عنوان',
            noHeadings: 'لم يتم العثور على عناوين. طبّق أنماط العنوان 1–3 أو اختر المستويات المطابقة.',
            updateTitle: 'تحديث جدول المحتويات',
            removeTitle: 'إزالة جدول المحتويات',
            updatePageNumbersOnly: 'تحديث أرقام الصفحات فقط',
            updateEntireTable: 'تحديث الجدول بالكامل',
            updateHint: 'اختر كيفية تحديث جدول المحتويات هذا.',
        },
    },
};

export default locale;
