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
        objectPermission: {
            addPeople: 'Add people',
            searchPeople: 'Search people',
            noPeople: 'No people selected',
            noMatchingPeople: 'No matching people',
            canEdit: 'Can edit',
            removePerson: 'Remove',
            confirmPeople: 'Confirm',
            document: 'Document',
            section: 'Section',
            paragraph: 'Paragraph',
            entity: 'Object',
            presentation: 'Presentation',
            page: 'Slide',
            master: 'Master view',
            base: 'Base',
            table: 'Table',
            field: 'Field',
            record: 'Record',
            view: 'View',
            board: 'Board',
            objectName: '{0}: {1}',

            search: 'Search objects',
            empty: 'No matching objects',
            more: 'Showing the first 100 objects. Search to narrow the list.',
            title: 'Permission settings',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving…',
            loading: 'Loading…',
            conflict: 'Permissions changed. Reload before saving.',
            error: 'Could not load or save permissions. Your changes have been kept.',
            reload: 'Reload',
            denied: 'You cannot manage permissions for this object.',
            edit: 'Who can edit',
            all: 'All file editors',
            owner: 'Object owner only',
            members: 'Selected members',
            copy: 'Allow editors to copy',
            print: 'Allow editors to print',
            export: 'Allow editors to export',
            comment: 'Allow editors to comment',
            parentHint: 'File and parent object restrictions still apply.',
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
