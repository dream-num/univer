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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    'image-popup': {
        replace: 'تعویض',
        delete: 'حذف',
        edit: 'ویرایش',
        crop: 'کراپ',
        reset: 'بازنشانی اندازه',
    },
    'image-cropper': {
        error: 'کراپ کردن اشیاء غیرتصویری امکان‌پذیر نیست.',
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
            title: 'کراپ',
            start: 'شروع کراپ',
            mode: 'آزاد',
        },
        group: {
            title: 'گروه',
            group: 'گروه‌بندی',
            reGroup: 'گروه‌بندی مجدد',
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
    'drawing-view': 'طراحی',
    shortcut: {
        'drawing-move-down': 'جابه‌جایی طراحی به پایین',
        'drawing-move-up': 'جابه‌جایی طراحی به بالا',
        'drawing-move-left': 'جابه‌جایی طراحی به چپ',
        'drawing-move-right': 'جابه‌جایی طراحی به راست',
        'drawing-delete': 'حذف طراحی',
    },
};

export default locale;
