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
    sheetImage: {
        title: 'تصویر',

        upload: {
            float: 'شناور کردن تصویر',
            cell: 'تصویر سلولی',
        },

        panel: {
            title: 'ویرایش تصویر',
        },

        save: {
            title: 'ذخیره تصاویر سلول',
            menuLabel: 'ذخیره تصاویر سلول',
            imageCount: 'تعداد تصاویر',
            fileNameConfig: 'نام فایل',
            useRowCol: 'استفاده از آدرس سلول (A1, B2...)',
            useColumnValue: 'استفاده از مقدار ستون',
            selectColumn: 'انتخاب ستون',
            cancel: 'لغو',
            confirm: 'ذخیره',
            saving: 'در حال ذخیره...',
            error: 'ذخیره تصاویر سلول ناموفق بود',
        },
    },
    'image-popup': {
        replace: 'تعویض',
        delete: 'حذف',
        edit: 'ویرایش',
        crop: 'کراپ',
        reset: 'بازنشانی اندازه',
        flipH: 'چرخش افقی',
        flipV: 'چرخش عمودی',
    },
    'drawing-anchor': {
        title: 'خواص لنگر',
        both: 'جابه‌جایی و تغییر اندازه با سلول‌ها',
        position: 'جابه‌جایی اما تغییر اندازه نکردن با سلول‌ها',
        none: 'جابه‌جایی یا تغییر اندازه نکردن با سلول‌ها',
    },
    'update-status': {
        exceedMaxSize: 'اندازه تصویر از حد مجاز فراتر رفته است، حد مجاز {0}M است',
        invalidImageType: 'نوع تصویر نامعتبر است',
        exceedMaxCount: 'فقط {0} تصویر می‌توانند همزمان آپلود شوند',
        invalidImage: 'تصویر نامعتبر است',
    },
    'cell-image': {
        pasteTitle: 'چسباندن به عنوان تصویر سلول',
        pasteContent: 'چسباندن تصویر سلول محتوای موجود سلول را پاک خواهد کرد، ادامه چسباندن',
        pasteError: 'کپی و چسباندن تصویر سلول در این واحد پشتیبانی نمی‌شود',
    },
};

export default locale;
