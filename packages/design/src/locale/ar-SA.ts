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
    design: {
        Accessibility: {
            closeBadge: 'إغلاق الشارة',
            imageGallery: 'معرض الصور',
            image: 'الصورة {0} من {1}',
            zoomIn: 'تكبير',
            zoomOut: 'تصغير',
            resetZoom: 'إعادة ضبط التكبير',
            increment: 'زيادة',
            decrement: 'إنقاص',
        },
        Confirm: {
            cancel: 'إلغاء',
            confirm: 'موافق',
        },
        CascaderList: {
            empty: 'لا شيء',
        },
        Calendar: {
            year: '',
            weekDays: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
            months: [
                'يناير',
                'فبراير',
                'مارس',
                'أبريل',
                'مايو',
                'يونيو',
                'يوليو',
                'أغسطس',
                'سبتمبر',
                'أكتوبر',
                'نوفمبر',
                'ديسمبر',
            ],
            ariaLabels: {
                previousMonth: 'الشهر السابق',
                nextMonth: 'الشهر التالي',
                selectYear: 'اختر السنة',
                selectMonth: 'اختر الشهر',
            },
        },
        Select: {
            empty: 'لا شيء',
        },
        ColorPicker: {
            more: 'المزيد من الألوان',
            cancel: 'إلغاء',
            confirm: 'موافق',
        },
        GradientColorPicker: {
            linear: 'خطي',
            radial: 'شعاعي',
            angular: 'زاوي',
            diamond: 'ماسي',
            offset: 'إزاحة',
            angle: 'زاوية',
            flip: 'قلب',
            delete: 'حذف',
            transparency: 'الشفافية',
        },
    },
};

export default locale;
