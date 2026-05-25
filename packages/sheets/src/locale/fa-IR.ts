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
    sheets: {
        tabs: {
            sheetCopy: '(کپی{0})',
            sheet: 'برگ',
        },
        info: {
            overlappingSelections: 'نمی‌توان از این دستور روی انتخاب‌های همپوشانی استفاده کرد',
            acrossMergedCell: 'در سراسر سلول ادغام شده',
            partOfCell: 'فقط بخشی از سلول ادغام شده انتخاب شده است',
            hideSheet: 'پس از پنهان کردن این برگ، هیچ برگی قابل مشاهده نخواهد بود',
        },
        definedName: {
            nameEmpty: 'نام نمی‌تواند خالی باشد',
            nameDuplicate: 'نام از قبل وجود دارد',
            nameInvalid: 'نام نامعتبر است',
            nameSheetConflict: 'نام با نام برگه تداخل دارد',
            formulaOrRefStringEmpty: 'فرمول یا رشته مرجع نمی‌تواند خالی باشد',
            nameConflict: 'نام با نام تابع تداخل دارد',
        },
        autoFill: {
            copy: 'کپی سلول',
            series: 'پر کردن سری',
            formatOnly: 'فقط قالب',
            noFormat: 'بدون قالب',
        },
    },
};

export default locale;
