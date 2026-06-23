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
    'docs-drawing-ui': {
        title: 'صورة',
        upload: {
            float: 'إدراج صورة',
        },
        shape: {
            insert: {
                title: 'إدراج شكل',
                rectangle: 'إدراج مستطيل',
                ellipse: 'إدراج قطع ناقص',
            },
        },
        panel: {
            title: 'تحرير الصورة',
        },
        'image-popup': {
            replace: 'استبدال',
            delete: 'حذف',
            edit: 'تحرير',
            crop: 'قص',
            reset: 'إعادة تعيين الحجم',
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
        'image-position': {
            title: 'موضع',
            horizontal: 'أفقي',
            vertical: 'عمودي',
            absolutePosition: 'موضع مطلق(بكسل)',
            relativePosition: 'موضع نسبي',
            toTheRightOf: 'إلى يمين',
            relativeTo: 'بالنسبة إلى',
            bellow: 'أسفل',
            options: 'خيارات',
            moveObjectWithText: 'نقل الكائن مع النص',
            column: 'عمود',
            margin: 'هامش',
            page: 'صفحة',
            line: 'سطر',
            paragraph: 'فقرة',
        },
        'update-status': {
            exceedMaxSize: 'حجم الصورة يتجاوز الحد، الحد هو {0}م',
            invalidImageType: 'نوع الصورة غير صالح',
            exceedMaxCount: 'يمكن رفع {0} صور فقط في المرة الواحدة',
            invalidImage: 'صورة غير صالحة',
        },
        shortcut: {
            'drawing-view': 'عرض الرسم',
            'drawing-move-down': 'نقل الرسم لأسفل',
            'drawing-move-up': 'نقل الرسم لأعلى',
            'drawing-move-left': 'نقل الرسم لليسار',
            'drawing-move-right': 'نقل الرسم لليمين',
            'drawing-delete': 'حذف الرسم',
        },
    },
};

export default locale;
