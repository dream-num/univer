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
import emojiLocale from './emoji-locale/ar-SA.generated';

const locale: typeof enUS = {
    ui: {
        featureSearch: {
            title: 'بحث عن الميزات',
            placeholder: 'اكتب اسم ميزة أو قائمة...',
            empty: 'لم يتم العثور على ميزات متاحة',
            ribbon: 'الشريط',
            contextMenu: 'قائمة السياق',
        },
        emojiPicker: {
            search: 'بحث',
            random: 'رمز تعبيري عشوائي',
            recents: 'الأخيرة',
            emojis: 'الرموز التعبيرية',
            animals: 'الحيوانات',
            food: 'الطعام',
            activities: 'الأنشطة',
            places: 'الأماكن',
            objects: 'العناصر',
            symbols: 'الرموز',
            searchResults: 'نتائج البحث',
            noResults: 'لم يتم العثور على رمز تعبيري',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'الرياضيات',
            greek: 'اليونانية',
            common: 'شائع',
        },
        toolbar: {
            heading: {
                normal: 'عادي',
                title: 'عنوان',
                subTitle: 'عنوان فرعي',
                1: 'عنوان 1',
                2: 'عنوان 2',
                3: 'عنوان 3',
                4: 'عنوان 4',
                5: 'عنوان 5',
            },
        },
        ribbon: {
            start: 'ابدأ',
            startDesc: 'تهيئة ورقة العمل وتعيين المعاملات الأساسية.',
            insert: 'إدراج',
            insertDesc: 'إدراج صفوف وأعمدة ومخططات وعناصر أخرى متنوعة.',
            formulas: 'صيغ',
            formulasDesc: 'استخدم الدوال والصيغ لحسابات البيانات.',
            data: 'بيانات',
            dataDesc: 'إدارة البيانات، بما في ذلك الاستيراد والفرز والتصفية.',
            view: 'عرض',
            viewDesc: 'تبديل أوضاع العرض وضبط تأثير العرض.',
            others: 'أخرى',
            othersDesc: 'الوظائف والإعدادات الأخرى.',
            more: 'المزيد',
        },
        fontFamily: {
            'not-supported': 'لم يُعثر على هذا الخط في النظام، وسيتم استخدام الخط الافتراضي.',
        },
        'shortcut-panel': {
            title: 'اختصارات',
        },
        shortcut: {
            undo: 'تراجع',
            redo: 'إعادة',
            cut: 'قص',
            copy: 'نسخ',
            paste: 'لصق',
            'shortcut-panel': 'تبديل لوحة الاختصارات',
        },
        'common-edit': 'اختصارات التحرير الشائعة',
        'toggle-shortcut-panel': 'تبديل لوحة الاختصارات',
        navigation: {
            back: 'رجوع',
            previous: 'السابق',
            next: 'التالي',
        },
        sidebar: {
            panel: 'لوحة جانبية',
            resize: 'تغيير حجم الشريط الجانبي',
            close: 'إغلاق الشريط الجانبي',
        },
        beforeClose: {
            title: 'لم يتم حفظ بعض التغييرات',
        },
        clipboard: {
            authentication: {
                title: 'تم رفض الإذن',
                content: 'يرجى السماح لـ Univer بالوصول إلى الحافظة.',
            },
        },
        rangeSelector: {
            cancel: 'إلغاء',
        },
        'global-shortcut': 'اختصار عام',
        row: 'صف',
        column: 'عمود',
    },
};

export default locale;
