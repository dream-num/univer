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
    sheetImage: {
        title: 'تصویر',

        upload: {
            float: 'شناور کردن تصویر',
            cell: 'تصویر سلولی',
        },

        panel: {
            title: 'ویرایش تصویر',
        },
    },
    'image-popup': {
        replace: 'تعویض',
        delete: 'حذف',
        edit: 'ویرایش',
        crop: 'کراپ',
        reset: 'بازنشانی اندازه',
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
    'sheet-drawing-view': 'طراحی',
    shortcut: {
        sheet: {
            'drawing-move-down': 'جابه‌جایی طراحی به پایین',
            'drawing-move-up': 'جابه‌جایی طراحی به بالا',
            'drawing-move-left': 'جابه‌جایی طراحی به چپ',
            'drawing-move-right': 'جابه‌جایی طراحی به راست',
            'drawing-delete': 'حذف طراحی',
        },
    },
};

export default locale;
