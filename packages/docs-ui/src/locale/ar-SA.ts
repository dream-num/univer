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
    'docs-ui': {
        toolbar: {
            undo: 'تراجع',
            redo: 'إعادة',
            font: 'خط',
            fontSize: 'حجم الخط',
            bold: 'غامق',
            italic: 'مائل',
            strikethrough: 'يتوسطه خط',
            subscript: 'منخفض',
            superscript: 'مرتفع',
            underline: 'تسطير',
            textColor: {
                main: 'لون النص',
            },
            fillColor: {
                main: 'لون خلفية النص',
            },
            table: {
                main: 'جدول',
                insert: 'إدراج جدول',
                colCount: 'عدد الأعمدة',
                rowCount: 'عدد الصفوف',
            },
            resetColor: 'إعادة تعيين',
            order: 'قائمة مرقمة',
            unorder: 'قائمة نقطية',
            checklist: 'قائمة مهام',
            documentFlavor: 'الوضع الحديث',
            alignLeft: 'محاذاة لليسار',
            alignCenter: 'محاذاة للوسط',
            alignRight: 'محاذاة لليمين',
            alignJustify: 'ضبط',
            horizontalLine: 'خط أفقي',
            headerFooter: 'رأس وتذييل',
            pageSetup: 'إعداد الصفحة',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                1: 'Heading 1',
                2: 'Heading 2',
                3: 'Heading 3',
                4: 'Heading 4',
                5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
        },
        table: {
            insert: 'إدراج',
            insertRowAbove: 'إدراج صف أعلى',
            insertRowBelow: 'إدراج صف أسفل',
            insertColumnLeft: 'إدراج عمود على اليسار',
            insertColumnRight: 'إدراج عمود على اليمين',
            delete: 'حذف الجدول',
            deleteRows: 'حذف الصف',
            deleteColumns: 'حذف العمود',
            deleteTable: 'حذف الجدول',
        },
        headerFooter: {
            header: 'رأس',
            footer: 'تذييل',
            panel: 'إعدادات الرأس والتذييل',
            firstPageCheckBox: 'صفحة أولى مختلفة',
            oddEvenCheckBox: 'صفحات فردية وزوجية مختلفة',
            headerTopMargin: 'هامش أعلى الرأس (بكسل)',
            footerBottomMargin: 'هامش أسفل التذييل (بكسل)',
            closeHeaderFooter: 'إغلاق الرأس والتذييل',
            disableText: 'إعدادات الرأس والتذييل معطلة',
        },
        placeholder: {
            heading1: 'Heading 1',
            heading2: 'Heading 2',
            heading3: 'Heading 3',
            heading4: 'Heading 4',
            heading5: 'Heading 5',
            normalText: 'Type text or press "/" for commands',
            listItem: 'Item',
        },
        doc: {
            menu: {
                paragraphSetting: 'إعدادات الفقرة',
            },
            slider: {
                paragraphSetting: 'إعدادات الفقرة',
            },
            paragraphSetting: {
                alignment: 'محاذاة',
                indentation: 'إزاحة',
                left: 'يسار',
                right: 'يمين',
                firstLine: 'السطر الأول',
                hanging: 'معلق',
                spacing: 'تباعد',
                before: 'قبل',
                after: 'بعد',
                lineSpace: 'تباعد الأسطر',
                multiSpace: 'تباعد متعدد',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'قيمة ثابتة (بكسل)',
            },
        },
        rightClick: {
            copy: 'نسخ',
            cut: 'قص',
            paste: 'لصق',
            delete: 'حذف',
            bulletList: 'قائمة نقطية',
            orderList: 'قائمة مرقمة',
            checkList: 'قائمة مهام',
            insertBellow: 'إدراج أدناه',
        },
        paragraphMenu: {
            alignAndIndent: 'Align and indent',
            align: 'Align',
            indent: 'Indent',
            color: 'Colors',
            increase: 'Increase',
            decrease: 'Decrease',
            increaseIndent: 'Increase indent',
            decreaseIndent: 'Decrease indent',
            defaultTextColor: 'Default text color',
            noBackground: 'No background',
        },
        'page-settings': {
            'document-setting': 'إعداد المستند',
            mode: 'الوضع',
            'modern-mode': 'حديث',
            'classic-mode': 'كلاسيكي',
            'modern-width': 'عرض المحتوى',
            'modern-width-narrow': 'ضيق',
            'modern-width-medium': 'متوسط',
            'modern-width-wide': 'واسع',
            'paper-size': 'حجم الورق',
            'page-size': {
                main: 'حجم الورق',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Letter',
                legal: 'Legal',
                tabloid: 'Tabloid',
                statement: 'Statement',
                executive: 'Executive',
                folio: 'Folio',
            },
            orientation: 'الاتجاه',
            portrait: 'عمودي',
            landscape: 'أفقي',
            'custom-paper-size': 'حجم ورق مخصص',
            top: 'أعلى',
            bottom: 'أسفل',
            left: 'يسار',
            right: 'يمين',
            cancel: 'إلغاء',
            confirm: 'تأكيد',
        },
    },
};

export default locale;
