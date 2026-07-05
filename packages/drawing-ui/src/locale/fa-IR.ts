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
        'image-cropper': {
            error: 'کراپ کردن اشیاء غیرتصویری امکان‌پذیر نیست.',
        },
        objectListPanel: {
            title: 'اشیا',
            empty: 'هیچ شیئی وجود ندارد',
            showAll: 'نمایش همه',
            hideAll: 'پنهان کردن همه',
            moveForward: 'آوردن به جلو',
            moveBackward: 'فرستادن به عقب',
            close: 'بستن',
            show: 'نمایش',
            hide: 'پنهان کردن',
            lock: 'قفل',
            unlock: 'باز کردن قفل',
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
            title: 'پیچش متن',
            wrappingStyle: 'سبک پیچش',
            square: 'مربع',
            topAndBottom: 'بالا و پایین',
            inline: 'در یک خط با متن',
            behindText: 'پشت متن',
            inFrontText: 'جلوی متن',
            wrapText: 'پیچش متن',
            bothSide: 'هر دو طرف',
            leftOnly: 'فقط سمت چپ',
            rightOnly: 'فقط سمت راست',
            distanceFromText: 'فاصله از متن',
            top: 'بالا(px)',
            left: 'چپ(px)',
            bottom: 'پایین(px)',
            right: 'راست(px)',
        },
        'image-popup': {
            replace: 'تعویض',
            delete: 'حذف',
            edit: 'ویرایش',
            crop: 'کراپ',
            reset: 'بازنشانی اندازه',
        },
    },
};

export default locale;
