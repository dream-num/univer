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
    'slides-ui': {
        append: 'إلحاق شريحة',

        text: {
            insert: {
                title: 'إدراج نص',
            },
        },

        shape: {
            insert: {
                title: 'إدراج شكل',
                rectangle: 'إدراج مستطيل',
                ellipse: 'إدراج قطع ناقص',
            },
        },

        image: {
            insert: {
                title: 'إدراج صورة',
                float: 'إدراج صورة عائمة',
            },
        },

        popup: {
            edit: 'تحرير',
            delete: 'حذف',
        },

        sidebar: {
            text: 'تحرير النص',
            shape: 'تحرير الشكل',
            image: 'تحرير الصورة',
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
                width: 'العرض (بكسل)',
                height: 'الارتفاع (بكسل)',
                x: 'X (بكسل)',
                y: 'Y (بكسل)',
                rotate: 'تدوير (°)',
            },
        },
        panel: {
            fill: {
                title: 'لون التعبئة',
            },
        },
    },
};

export default locale;
