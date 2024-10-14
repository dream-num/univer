/**
 * Copyright 2023-present DreamNum Inc.
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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    toolbar: {
        undo: 'بازگرداندن',
        redo: 'تکرار',
        font: 'فونت',
        fontSize: 'اندازه فونت',
        bold: 'پررنگ',
        italic: 'ایتالیک',
        strikethrough: 'خط‌دار',
        subscript: 'زیرنویس',
        superscript: 'بالانویس',
        underline: 'خط‌کشی',
        textColor: {
            main: 'رنگ متن',
            right: 'انتخاب رنگ',
        },
        fillColor: {
            main: 'رنگ پس‌زمینه متن',
            right: 'انتخاب رنگ',
        },
        table: {
            main: 'جدول',
            insert: 'درج جدول',
            colCount: 'تعداد ستون',
            rowCount: 'تعداد سطر',
        },
        resetColor: 'بازنشانی',
        order: 'لیست شماره‌دار',
        unorder: 'لیست بدون شماره',
        checklist: 'لیست وظیفه',
        documentFlavor: 'Modern Mode',
        alignLeft: 'تراز چپ',
        alignCenter: 'تراز وسط',
        alignRight: 'تراز راست',
        alignJustify: 'توجیه',
        headerFooter: 'هدر و فوتر',
    },
    table: {
        insert: 'درج',
        insertRowAbove: 'درج سطر بالاتر',
        insertRowBelow: 'درج سطر پایین‌تر',
        insertColumnLeft: 'درج ستون چپ',
        insertColumnRight: 'درج ستون راست',
        delete: 'حذف جدول',
        deleteRows: 'حذف سطر',
        deleteColumns: 'حذف ستون',
        deleteTable: 'حذف جدول',
    },
    headerFooter: {
        header: 'هدر',
        footer: 'فوتر',
        panel: 'تنظیمات هدر و فوتر',
        firstPageCheckBox: 'صفحه اول متفاوت',
        oddEvenCheckBox: 'صفحات فرد و زوج متفاوت',
        headerTopMargin: 'حاشیه بالای هدر(px)',
        footerBottomMargin: 'حاشیه پایینی فوتر(px)',
        closeHeaderFooter: 'بستن هدر و فوتر',
        disableText: 'تنظیمات هدر و فوتر غیرفعال است',
    },
    doc: {
        menu: {
            paragraphSetting: 'تنظیمات پاراگراف',
        },
        slider: {
            paragraphSetting: 'تنظیمات پاراگراف',
        },
        paragraphSetting: {
            alignment: 'تراز',
            indentation: 'تورفتگی',
            left: 'چپ',
            right: 'راست',
            firstLine: 'خط اول',
            hanging: 'آویز',
            spacing: 'فاصله‌گذاری',
            before: 'قبل',
            after: 'بعد',
            lineSpace: 'فاصله خط',
            multiSpace: 'فاصله چندگانه',
            fixedValue: 'مقدار ثابت(px)',
        },
    },
};

export default locale;
