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
    'sheets-sort-ui': {
        general: {
            sort: 'فرز',
            'sort-asc': 'تصاعدي',
            'sort-desc': 'تنازلي',
            'sort-custom': 'فرز مخصص',
            'sort-asc-ext': 'فرز تصاعدي ممتد',
            'sort-desc-ext': 'فرز تنازلي ممتد',
            'sort-asc-cur': 'تصاعدي',
            'sort-desc-cur': 'تنازلي',
        },
        error: {
            'merge-size': 'يحتوي النطاق المحدد على خلايا مدمجة بأحجام مختلفة ولا يمكن فرزها.',
            empty: 'النطاق المحدد فارغ ولا يمكن فرزه.',
            single: 'يحتوي النطاق المحدد على صف واحد فقط ولا يمكن فرزه.',
            'formula-array': 'يحتوي النطاق المحدد على صيغ مصفوفة ولا يمكن فرزه.',
        },
        dialog: {
            'sort-reminder': 'تذكير الفرز',
            'sort-reminder-desc': 'توسيع نطاق الفرز أم الاحتفاظ بنطاق الفرز الحالي؟',
            'sort-reminder-ext': 'توسيع نطاق الفرز',
            'sort-reminder-no': 'الاحتفاظ بنطاق الفرز',
            'first-row-check': 'الصف الأول لا يشارك في الفرز',
            'add-condition': 'إضافة شرط',
            cancel: 'إلغاء',
            confirm: 'تأكيد',
        },
        info: {
            tooltip: 'تلميح',
        },
    },
};

export default locale;
