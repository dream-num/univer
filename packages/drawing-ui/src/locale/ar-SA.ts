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
            error: 'لا يمكن قص الكائنات غير الصورية.',
        },
        objectListPanel: {
            title: 'الكائنات',
            empty: 'لا توجد كائنات',
            showAll: 'إظهار الكل',
            hideAll: 'إخفاء الكل',
            moveForward: 'إحضار للأمام',
            moveBackward: 'إرسال للخلف',
            close: 'إغلاق',
            show: 'إظهار',
            hide: 'إخفاء',
            lock: 'قفل',
            unlock: 'إلغاء القفل',
            name: 'الاسم',
            nameInput: 'اسم الكائن',
            description: 'الوصف',
            descriptionPlaceholder: 'إضافة وصف',
            details: 'التفاصيل',
            locate: 'تحديد الموضع',
            expand: 'توسيع',
            collapse: 'طي',
            dragToReorder: 'اسحب لإعادة الترتيب',
            search: 'بحث',
            filterAll: 'الكل',
            filterHidden: 'المخفية',
            filterLocked: 'المقفلة',
            sectionCanvas: 'طبقة اللوحة',
            sectionFloating: 'الطبقة العائمة',
            typeNames: {
                object: 'كائن',
                shape: 'شكل',
                connector: 'موصل',
                image: 'صورة',
                chart: 'مخطط',
                table: 'جدول',
                smartArt: 'SmartArt',
                video: 'فيديو',
                group: 'مجموعة',
                unit: 'وحدة',
                dom: 'DOM',
                text: 'نص',
                placeholder: 'عنصر نائب',
                container: 'حاوية',
            },
            noSelection: 'حدد كائنا لتحرير تفاصيله',
        },
        'image-panel': {
            arrange: {
                title: 'ترتيب',
                forward: 'إحضار إلى الأمام',
                backward: 'إرسال إلى الخلف',
                front: 'إحضار إلى المقدمة',
                back: 'إرسال إلى المؤخرة',
            },
            transform: {
                title: 'تحويل',
                rotate: 'تدوير (°)',
                x: 'س (بكسل)',
                y: 'ص (بكسل)',
                width: 'العرض (بكسل)',
                height: 'الارتفاع (بكسل)',
                lock: 'قفل النسبة (%)',
            },
            crop: {
                title: 'قص',
                start: 'بدء القص',
                mode: 'حر',
            },
            group: {
                title: 'تجميع',
                group: 'تجميع',
                unGroup: 'فك التجميع',
            },
            align: {
                title: 'محاذاة',
                default: 'تحديد نوع المحاذاة',
                left: 'محاذاة لليسار',
                center: 'محاذاة للوسط',
                right: 'محاذاة لليمين',
                top: 'محاذاة للأعلى',
                middle: 'محاذاة للمنتصف',
                bottom: 'محاذاة للأسفل',
                horizon: 'توزيع أفقي ',
                vertical: 'توزيع عمودي ',
            },
            null: 'لا يوجد تحديد للكائن',
        },
        'image-text-wrap': {
            title: 'التفاف النص',
            wrappingStyle: 'نمط التفاف',
            square: 'مربع',
            topAndBottom: 'أعلى وأسفل',
            inline: 'في نفس السطر مع النص',
            behindText: 'خلف النص',
            inFrontText: 'أمام النص',
            wrapText: 'تفاف النص',
            bothSide: 'كلا الجانبين',
            leftOnly: 'يسار فقط',
            rightOnly: 'يمين فقط',
            distanceFromText: 'المسافة من النص',
            top: 'أعلى(بكسل)',
            left: 'يسار(بكسل)',
            bottom: 'أسفل(بكسل)',
            right: 'يمين(بكسل)',
        },
        'image-popup': {
            replace: 'استبدال',
            delete: 'حذف',
            edit: 'تحرير',
            crop: 'قص',
            reset: 'إعادة تعيين الحجم',
        },
    },
};

export default locale;
