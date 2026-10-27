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
            progressReading: 'جارٍ قراءة المرفق…',
            progressUploading: 'جارٍ رفع المرفق…',
            progressCreating: 'جارٍ إنشاء الملف عبر الإنترنت…',
            progressSaving: 'جارٍ حفظ الرابط…',
            externalAttachment: 'مرفق مرتبط',
            externalHint: 'الملف الأصلي الذي يشير إليه هذا المرفق غير مضمّن في المستند. المعاينة والتنزيل غير متاحين.',
            missingHint: 'بيانات هذا المرفق مفقودة من المستند. المعاينة والتنزيل غير متاحين.',
            unavailableSummary: 'يحتوي هذا المستند على {0} من المرفقات غير المتاحة. تم الاحتفاظ بعناصرها النائبة. مرّر المؤشر فوق رمز التحذير لمعرفة السبب.',
            rename: 'إعادة تسمية',
            saveName: 'حفظ الاسم',
            cancel: 'إلغاء',
            invalidName: 'أدخل اسم ملف صالحًا لا يتجاوز 255 حرفًا.',
            renameFailed: 'تعذرت إعادة تسمية المرفق. حاول مرة أخرى.',
            actions: 'إجراءات المرفق',
            linkSaveFailed: 'تم إنشاء الملف عبر الإنترنت، لكن تعذر حفظ رابطه. أعد محاولة حفظ الرابط.',
            conversionFailed: 'تعذر تحويل هذا المرفق. يرجى المحاولة مجددًا.',
            converted: 'اكتمل التحويل',
            open: 'فتح',
            converting: 'جارٍ التحويل…',
            openSlide: 'فتح العرض التقديمي عبر الإنترنت في علامة تبويب جديدة',
            openDoc: 'فتح المستند عبر الإنترنت في علامة تبويب جديدة',
            openSheet: 'فتح جدول البيانات عبر الإنترنت في علامة تبويب جديدة',
            convertSlide: 'تحويل إلى عرض تقديمي عبر الإنترنت',
            convertDoc: 'تحويل إلى مستند عبر الإنترنت',
            convertSheet: 'تحويل إلى جدول بيانات عبر الإنترنت',
            nativePreviewHint: 'إذا تعذّر عرض الملف في المتصفح، نزّل الملف الأصلي.',
            attachment: 'مرفق OLE',
            external: 'الملف الخارجي غير متاح',
            missing: 'بيانات المرفق غير متاحة',
            opaque: 'بيانات OLE الأصلية (يمكن تنزيلها)',
            download: 'تنزيل',
            preview: 'معاينة',
            remove: 'حذف',
            failed: 'تعذّرت قراءة المرفق الأصلي. حاول مجددًا.',
            unsupported: 'المعاينة غير متاحة لهذا الملف. يمكنك تنزيل الملف الأصلي.',
        },
        mobile: { close: 'إغلاق', more: 'المزيد' },
        'image-cropper': {
            error: 'لا يمكن قص الكائنات غير الصورية.',
        },
        objectListPanel: {
            title: 'الطبقات',
            empty: 'لا توجد كائنات',
            showAll: 'إظهار الكل',
            hideAll: 'إخفاء الكل',
            lockAll: 'قفل الكل',
            unlockAll: 'إلغاء قفل الكل',
            moveForward: 'إحضار للأمام',
            moveBackward: 'إرسال للخلف',
            close: 'إغلاق',
            show: 'إظهار',
            hide: 'إخفاء',
            lock: 'قفل',
            unlock: 'إلغاء القفل',
            lockHint: 'قفل لمنع التحديد غير المقصود',
            unlockHint: 'مقفل. انقر لإلغاء القفل',
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
                cancel: 'إلغاء',
                apply: 'تم',
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
            square: 'مربع',
            topAndBottom: 'أعلى وأسفل',
            inline: 'في نفس السطر مع النص',
            behindText: 'خلف النص',
            inFrontText: 'أمام النص',
        },
    },
};

export default locale;
