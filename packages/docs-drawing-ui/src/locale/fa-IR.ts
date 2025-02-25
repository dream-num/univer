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
    docImage: {
        title: 'تصویر',

        upload: {
            float: 'درج تصویر',
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
    'image-position': {
        title: 'موقعیت',
        horizontal: 'افقی',
        vertical: 'عمودی',
        absolutePosition: 'موقعیت مطلق(px)',
        relativePosition: 'موقعیت نسبی',
        toTheRightOf: 'سمت راست',
        relativeTo: 'نسبت به',
        bellow: 'زیر',
        options: 'گزینه‌ها',
        moveObjectWithText: 'جابه‌جایی شیء با متن',
        column: 'ستون',
        margin: 'حاشیه',
        page: 'صفحه',
        line: 'خط',
        paragraph: 'پاراگراف',
    },
    'update-status': {
        exceedMaxSize: 'اندازه تصویر از حد مجاز فراتر رفته است، حد مجاز {0}M است',
        invalidImageType: 'نوع تصویر نامعتبر است',
        exceedMaxCount: 'فقط {0} تصویر می‌توانند همزمان آپلود شوند',
        invalidImage: 'تصویر نامعتبر است',
    },
};

export default locale;
