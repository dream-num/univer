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
    slide: {
        append: 'اضافه کردن اسلاید',

        text: {
            insert: {
                title: 'درج متن',
            },
        },

        shape: {
            insert: {
                title: 'درج شکل',
                rectangle: 'درج مستطیل',
                ellipse: 'بیضی را درج کنید',
            },
        },

        image: {
            insert: {
                title: 'درج تصویر',
                float: 'درج تصویر شناور',
            },
        },

        popup: {
            edit: 'ویرایش',
            delete: 'حذف',
        },

        sidebar: {
            text: 'ویرایش متن',
            shape: 'ویرایش شکل',
            image: 'ویرایش تصویر',
        },

        panel: {
            fill: {
                title: 'رنگ پر کردن',
            },
        },
    },
};

export default locale;
