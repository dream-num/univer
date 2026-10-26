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
    'drawing-ui': {
        ole: {
            externalAttachment: 'پیوست پیوندشده',
            externalHint: 'فایل اصلی این پیوست در سند جاسازی نشده است. پیش‌نمایش و بارگیری در دسترس نیست.',
            missingHint: 'داده‌های این پیوست در سند موجود نیست. پیش‌نمایش و بارگیری در دسترس نیست.',
            unavailableSummary: 'این سند دارای {0} پیوست غیرقابل دسترس است. جای‌نگهدارهای آن‌ها حفظ شده‌اند. برای دیدن دلیل، نشانگر را روی نماد هشدار ببرید.',
            rename: 'تغییر نام',
            saveName: 'ذخیره نام',
            cancel: 'لغو',
            invalidName: 'نام فایل معتبر با حداکثر ۲۵۵ نویسه وارد کنید.',
            renameFailed: 'تغییر نام پیوست انجام نشد. دوباره تلاش کنید.',
            actions: 'عملیات پیوست',
            linkSaveFailed: 'فایل آنلاین ایجاد شد، اما پیوند ذخیره نشد. ذخیره پیوند را دوباره امتحان کنید.',
            conversionFailed: 'تبدیل این پیوست ممکن نشد. دوباره تلاش کنید.',
            converted: 'تبدیل انجام شد. می‌توانید فایل آنلاین را در زبانه جدید باز کنید.',
            converting: 'در حال تبدیل…',
            openSlide: 'باز کردن ارائه آنلاین در زبانه جدید',
            openDoc: 'باز کردن سند آنلاین در زبانه جدید',
            openSheet: 'باز کردن صفحه‌گسترده آنلاین در زبانه جدید',
            convertSlide: 'تبدیل به ارائه آنلاین',
            convertDoc: 'تبدیل به سند آنلاین',
            convertSheet: 'تبدیل به صفحه‌گسترده آنلاین',
            nativePreviewHint: 'اگر مرورگر نمی‌تواند فایل را نمایش دهد، نسخهٔ اصلی را دانلود کنید.',
            attachment: 'پیوست OLE',
            external: 'فایل خارجی در دسترس نیست',
            missing: 'داده‌های پیوست در دسترس نیست',
            opaque: 'دادهٔ باینری اصلی OLE (قابل دانلود)',
            download: 'بارگیری',
            preview: 'پیش‌نمایش',
            remove: 'حذف',
            failed: 'خواندن پیوست اصلی ممکن نیست. دوباره تلاش کنید.',
            unsupported: 'پیش‌نمایش این فایل در دسترس نیست. می‌توانید نسخهٔ اصلی را دانلود کنید.',
        },
        mobile: { close: 'بستن', more: 'بیشتر' },
        'image-cropper': {
            error: 'کراپ کردن اشیاء غیرتصویری امکان‌پذیر نیست.',
        },
        objectListPanel: {
            title: 'لایه\u200Cها',
            empty: 'هیچ شیئی وجود ندارد',
            showAll: 'نمایش همه',
            hideAll: 'پنهان کردن همه',
            lockAll: 'قفل کردن همه',
            unlockAll: 'باز کردن قفل همه',
            moveForward: 'آوردن به جلو',
            moveBackward: 'فرستادن به عقب',
            close: 'بستن',
            show: 'نمایش',
            hide: 'پنهان کردن',
            lock: 'قفل',
            unlock: 'باز کردن قفل',
            lockHint: 'قفل کردن برای جلوگیری از انتخاب تصادفی',
            unlockHint: 'قفل شده است. برای باز کردن قفل کلیک کنید',
            name: 'نام',
            nameInput: 'نام شیء',
            description: 'توضیحات',
            descriptionPlaceholder: 'افزودن توضیحات',
            details: 'جزئیات',
            locate: 'مکان‌یابی',
            expand: 'گسترش',
            collapse: 'جمع کردن',
            dragToReorder: 'برای مرتب‌سازی بکشید',
            search: 'جستجوی اشیا',
            filterAll: 'همه',
            filterHidden: 'پنهان',
            filterLocked: 'قفل شده',
            sectionCanvas: 'لایه بوم',
            sectionFloating: 'لایه شناور',
            typeNames: {
                object: 'شیء',
                shape: 'شکل',
                connector: 'رابط',
                image: 'تصویر',
                chart: 'نمودار',
                table: 'جدول',
                smartArt: 'SmartArt',
                video: 'ویدیو',
                group: 'گروه',
                unit: 'واحد',
                dom: 'DOM',
                text: 'متن',
                placeholder: 'نگهدارنده مکان',
                container: 'محفظه',
            },
            noSelection: 'برای ویرایش جزئیات یک شیء را انتخاب کنید',
        },
        'image-panel': {
            arrange: {
                title: 'ترتیب‌دهی',
                forward: 'آوردن به جلو',
                backward: 'فرستادن به عقب',
                front: 'آوردن به جلوی همه',
                back: 'فرستادن به پشت همه',
            },
            transform: {
                title: 'تبدیل',
                rotate: 'چرخش (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'عرض (px)',
                height: 'ارتفاع (px)',
                lock: 'قفل نسبت (%)',
            },
            crop: {
                cancel: 'لغو',
                apply: 'انجام شد',
                title: 'کراپ',
                start: 'شروع کراپ',
                mode: 'آزاد',
            },
            group: {
                title: 'گروه',
                group: 'گروه‌بندی',
                unGroup: 'لغو گروه‌بندی',
            },
            align: {
                title: 'تراز',
                default: 'انتخاب نوع تراز',
                left: 'تراز چپ',
                center: 'تراز وسط',
                right: 'تراز راست',
                top: 'تراز بالا',
                middle: 'تراز وسط',
                bottom: 'تراز پایین',
                horizon: 'توزیع افقی',
                vertical: 'توزیع عمودی',
            },
            null: 'هیچ شیئی انتخاب نشده است',
        },
        'image-text-wrap': {
            square: 'مربع',
            topAndBottom: 'بالا و پایین',
            inline: 'در یک خط با متن',
            behindText: 'پشت متن',
            inFrontText: 'جلوی متن',
        },
    },
};

export default locale;
