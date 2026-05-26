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
    'thread-comment-ui': {
        panel: {
            title: 'إدارة التعليقات',
            empty: 'لا توجد تعليقات بعد',
            filterEmpty: 'لا توجد نتائج مطابقة',
            reset: 'إعادة ضبط التصفية',
            addComment: 'إضافة تعليق',
            solved: 'تم الحل',
        },
        editor: {
            placeholder: 'رد أو إشارة إلى آخرين باستخدام @',
            reply: 'تعليق',
            cancel: 'إلغاء',
            save: 'حفظ',
        },
        item: {
            edit: 'تحرير',
            delete: 'حذف هذا التعليق',
        },
        filter: {
            sheet: {
                all: 'كل الأوراق',
                current: 'الورقة الحالية',
            },
            status: {
                all: 'كل التعليقات',
                resolved: 'تم الحل',
                unsolved: 'لم يتم الحل',
                concernMe: 'يتعلق بي',
            },
        },
    },
};

export default locale;
