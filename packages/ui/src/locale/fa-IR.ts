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
import emojiLocale from './emoji-locale/fa-IR.generated';

const locale: typeof enUS = {
    ui: {
        accessibility: {
            menu: 'منو',
            zoom: 'بزرگ‌نمایی',
            zoomIn: 'بزرگ‌نمایی',
            zoomOut: 'کوچک‌نمایی',
            resetZoom: 'بازنشانی بزرگ‌نمایی',
        },
        objectPermission: {
            operationDenied: 'این محتوا محافظت شده است. انجام این عملیات مجاز نیست.',
            remove: 'حذف محافظت',
            roleOwner: 'مالک فایل',
            roleEditor: 'ویرایشگر فایل',
            selectedCount: 'انتخاب‌شده: {0}',
            searchPeople: 'جستجوی افراد',
            noMatchingPeople: 'فردی مطابق جستجو یافت نشد',
            loadMore: 'بارگذاری بیشتر',
            fileHint: 'اشتراک‌گذاری فایل، اعضا را تعیین می‌کند. این تنظیمات اقدامات همان اعضا را محدود می‌کنند.',
            documentParent: 'محدودیت‌های ویرایش سند برای این بخش نیز اعمال می‌شوند.',
            paragraphParent: 'محدودیت‌های ویرایش سند و بخش دربرگیرندهٔ این بند، برای این بند نیز اعمال می‌شوند.',
            documentObjectParent: 'سند و بخش‌ها و بندهایی که این شیء را دربر می‌گیرند یا محل اتصال آن هستند، ممکن است ویرایش را نیز محدود کنند.',
            slideParent: 'محدودیت‌های ویرایش ارائه نیز اعمال می‌شوند.',
            slideObjectParent: 'محدودیت‌های ویرایش ارائه و اسلاید یا الگوی دربرگیرندهٔ این شیء نیز اعمال می‌شوند.',
            baseParent: 'محدودیت‌های ویرایش Base نیز اعمال می‌شوند.',
            baseObjectParent: 'محدودیت‌های ویرایش Base و جدول دربرگیرندهٔ این شیء نیز اعمال می‌شوند.',
            recordParent: 'محدودیت‌های Base و جدول همچنان اعمال می‌شوند. ویرایش مقدار به مجوز فیلد مربوطه نیز نیاز دارد.',
            boardParent: 'محدودیت‌های ویرایش تخته برای این شیء نیز اعمال می‌شوند.',
            ownerInherit: 'مالک فایل، دسترسی به‌ارث‌رسیده',
            peopleError: 'بارگذاری افراد ممکن نشد. دوباره تلاش کنید.',
            document: 'سند',
            section: 'بخش',
            paragraph: 'بند',
            entity: 'شیء',
            presentation: 'ارائه',
            page: 'اسلاید',
            master: 'نمای الگو',
            base: 'Base',
            table: 'جدول',
            field: 'فیلد',
            record: 'رکورد',
            view: 'نما',
            board: 'تخته',
            objectName: '{0}: {1}',

            search: 'جستجوی اشیا',
            empty: 'شیئی مطابق جستجو یافت نشد',
            more: '۱۰۰ شیء نخست نمایش داده می‌شوند. برای محدود کردن فهرست جستجو کنید.',
            title: 'مجوزها',
            cancel: 'لغو',
            save: 'ذخیره',
            saving: 'در حال ذخیره…',
            loading: 'در حال بارگذاری…',
            conflict: 'مجوزها تغییر کرده‌اند. پیش از ذخیره دوباره بارگذاری کنید.',
            error: 'بارگذاری یا ذخیرهٔ مجوزها ممکن نشد. تغییرات شما حفظ شده‌اند.',
            reload: 'بارگذاری مجدد',
            denied: 'نمی‌توانید مجوزهای این شیء را مدیریت کنید.',
            edit: 'چه کسانی می‌توانند ویرایش کنند',
            all: 'همهٔ ویرایشگران فایل',
            owner: 'فقط مالک شیء',
            members: 'اعضای انتخاب‌شده',
            copy: 'اجازهٔ کپی به ویرایشگران',
            print: 'اجازهٔ چاپ به ویرایشگران',
            export: 'اجازهٔ خروجی گرفتن به ویرایشگران',
            comment: 'اجازهٔ نظر دادن به ویرایشگران',
            parentHint: 'محدودیت‌های فایل و شیء والد همچنان اعمال می‌شوند.',
        },
        featureSearch: {
            title: 'جستجوی قابلیت‌ها',
            placeholder: 'نام قابلیت یا منو را وارد کنید…',
            empty: 'هیچ قابلیت در دسترسی یافت نشد',
            ribbon: 'نوار ابزار',
            contextMenu: 'منوی زمینه‌ای',
        },
        emojiPicker: {
            search: 'جستجو',
            random: 'ایموجی تصادفی',
            recents: 'اخیر',
            emojis: 'ایموجی‌ها',
            animals: 'حیوانات',
            food: 'غذا',
            activities: 'فعالیت‌ها',
            places: 'مکان‌ها',
            objects: 'اشیا',
            symbols: 'نمادها',
            searchResults: 'نتایج جستجو',
            noResults: 'ایموجی پیدا نشد',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'ریاضیات',
            greek: 'یونانی',
            common: 'رایج',
        },
        toolbar: {
            heading: {
                normal: 'متن عادی',
                title: 'عنوان',
                subTitle: 'زیر عنوان',
                1: 'عنوان 1',
                2: 'عنوان 2',
                3: 'عنوان 3',
                4: 'عنوان 4',
                5: 'عنوان 5',
            },
        },
        ribbon: {
            start: 'شروع',
            startDesc: 'ایجاد کاربرگ و تنظیم پارامترهای اولیه.',
            insert: 'درج',
            insertDesc: 'درج ردیف‌ها، ستون‌ها، نمودارها و عناصر مختلف دیگر.',
            formulas: 'فرمول‌ها',
            formulasDesc: 'استفاده از توابع و فرمول‌ها برای محاسبات داده‌ها.',
            data: 'داده‌ها',
            dataDesc: 'ادغام و تجزیه داده‌ها.',
            view: 'نمایش',
            viewDesc: 'تغییر حالت نمایش و تنظیم اثرات نمایشی.',
            others: 'دیگر',
            othersDesc: 'سایر عملکردها و تنظیمات.',
            more: 'بیشتر',
        },
        fontFamily: {
            'not-supported': 'هیچ فونتی با این نام در سیستم یافت نشد، از فونت پیش‌فرض استفاده می‌شود.',
        },
        'shortcut-panel': {
            title: 'کلیدهای میانبر',
        },
        shortcut: {
            undo: 'بازگرداندن',
            redo: 'تکرار',
            cut: 'بریدن',
            copy: 'کپی کردن',
            paste: 'چسباندن',
            'shortcut-panel': 'نمایش/مخفی کردن پنل کلیدهای میانبر',
        },
        'common-edit': 'کلیدهای میانبر ویرایش عمومی',
        'toggle-shortcut-panel': 'نمایش/مخفی کردن پنل کلیدهای میانبر',
        navigation: {
            back: 'بازگشت',
            previous: 'قبلی',
            next: 'بعدی',
        },
        sidebar: {
            panel: 'پنل کناری',
            resize: 'تغییر اندازه پنل کناری',
            close: 'بستن پنل کناری',
        },
        beforeClose: {
            title: 'برخی تغییرات ذخیره نشده‌اند',
        },
        clipboard: {
            authentication: {
                title: 'اجازه دسترسی داده نشده است',
                content: 'لطفا به Univer اجازه دسترسی به کلیپ بورد خود را بدهید.',
            },
        },
        rangeSelector: {
            cancel: 'انصراف',
        },
        'global-shortcut': 'کلید میانبر جهانی',
        row: 'سطر',
        column: 'ستون',
    },
};

export default locale;
