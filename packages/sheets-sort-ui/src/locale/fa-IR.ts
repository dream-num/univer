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
    'sheets-sort': {
        general: {
            sort: 'مرتب‌سازی',
            'sort-asc': 'صعودی',
            'sort-desc': 'نزولی',
            'sort-custom': 'مرتب‌سازی سفارشی',
            'sort-asc-ext': 'گسترش صعودی',
            'sort-desc-ext': 'گسترش نزولی',
            'sort-asc-cur': 'صعودی',
            'sort-desc-cur': 'نزولی',
        },
        error: {
            'merge-size': 'محدوده انتخاب شده حاوی سلول‌های ادغام شده با اندازه‌های مختلف است که نمی‌توان مرتب کرد.',
            empty: 'محدوده انتخاب شده هیچ محتوایی ندارد و نمی‌توان مرتب کرد.',
            single: 'محدوده انتخاب شده فقط یک ردیف دارد و نمی‌توان مرتب کرد.',
            'formula-array': 'محدوده انتخاب شده دارای فرمول‌های آرایه‌ای است و نمی‌توان مرتب کرد.',
        },
        dialog: {
            'sort-reminder': 'یادآوری مرتب‌سازی',
            'sort-reminder-desc': 'گسترش مرتب‌سازی محدوده یا حفظ مرتب‌سازی محدوده؟',
            'sort-reminder-ext': 'گسترش مرتب‌سازی محدوده',
            'sort-reminder-no': 'حفظ مرتب‌سازی محدوده',
            'first-row-check': 'ردیف اول در مرتب‌سازی شرکت نمی‌کند',
            'add-condition': 'افزودن شرط',
            cancel: 'انصراف',
            confirm: 'تایید',
        },
    },
};

export default locale;
